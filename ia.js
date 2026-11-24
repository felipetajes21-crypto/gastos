// ───────────────────────── IA online (Claude) ─────────────────────────
// Quando a pessoa coloca a própria chave da API da Anthropic, o Assistente passa a usar o Claude:
// entende qualquer pergunta e responde com base num resumo dos gastos que vai junto.
// A chave fica só neste aparelho (localStorage, fora do backup). Sem chave ou sem internet,
// o Assistente continua no modo básico (assistente.js), que funciona offline.

const IA_MODELO = 'claude-opus-5-5';
const IA_SDK = './vendor/anthropic-sdk-1.13.0.mjs';
// preços por milhão de tokens (US$) do Claude Opus 5.5, para mostrar o custo aproximado
const IA_PRECO = { entrada: 4, cacheGravar: 5, cacheLer: 0.2, saida: 20 };
const IA_CHAVE = 'gastos.claudeKey', IA_USO = 'gastos.iaUso', IA_LIGADA = 'gastos.iaLigada';

const ia = { cliente: null, historico: [], contexto: null, ocupado: false };

const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* sem armazenamento */ } };
const iaChave = () => lsGet(IA_CHAVE) || '';
const iaAtiva = () => !!iaChave() && lsGet(IA_LIGADA) !== '0';
function iaUso() { try { return JSON.parse(lsGet(IA_USO)) || { usd: 0, msgs: 0 }; } catch { return { usd: 0, msgs: 0 }; } }

async function iaCliente() {
  if (ia.cliente && ia.cliente._chave === iaChave()) return ia.cliente;
  const { default: Anthropic } = await import(IA_SDK);
  // A chave é da própria pessoa e fica só no aparelho dela; o app não tem servidor.
  ia.cliente = new Anthropic({ apiKey: iaChave(), dangerouslyAllowBrowser: true });
  ia.cliente._chave = iaChave();
  return ia.cliente;
}

// ── o que a IA recebe: um resumo das finanças (montado quando a conversa começa) ──
function iaResumoFinanceiro() {
  const hoje = new Date(), mk = hojeKey();
  const L = [];
  L.push(`Hoje: ${isoDate(hoje)} (${hoje.toLocaleDateString('pt-BR', { weekday: 'long' })}). Valores em reais (R$).`);
  L.push('\n## Meses (gasto | entrou | investido líquido | sobrou)');
  for (let i = 5; i >= 0; i--) {
    const k = shiftMonth(mk, -i), b = balanceOf(k);
    if (!b.gastou && !b.entrou && !b.investiu) continue;
    L.push(`${k}${i === 0 ? ' (mês atual, parcial)' : ''}: ${b.gastou.toFixed(2)} | ${b.entrou.toFixed(2)} | ${b.investiu.toFixed(2)} | ${b.sobrou.toFixed(2)}`);
  }
  const s = monthStats(mk);
  if (s.elapsed >= 3) L.push(`Previsão de gasto do mês atual no ritmo de hoje: ${s.projection.toFixed(2)} (dia ${s.elapsed} de ${s.dim}).`);
  const { media } = mediaPorCategoria();
  const atual = Object.fromEntries(byCategory(s.items).map(c => [c.id, c.valor]));
  L.push('\n## Gasto por categoria (mês atual | média mensal dos últimos meses | orçamento)');
  for (const c of catsOf('gasto')) {
    const a = atual[c.id] || 0, m = media[c.id] || 0, o = +c.orcamento || 0;
    if (a || m || o) L.push(`${c.nome}: ${a.toFixed(2)} | ${m.toFixed(2)} | ${o ? o.toFixed(2) : '-'}`);
  }
  const fixos = state.fixos || [];
  if (fixos.length) {
    L.push('\n## Lançamentos fixos (todo mês)');
    for (const f of fixos) L.push(`${f.desc}: ${(+f.valor).toFixed(2)} no dia ${f.dia} (${tipoCat(catById(f.cat))}, ${catById(f.cat).nome})`);
  }
  const prox = [1, 2, 3, 4, 5, 6].map(i => previsaoMes(shiftMonth(mk, i))).filter(m => m.total);
  if (prox.length) {
    L.push('\n## Já comprometido nos próximos meses (parcelas + fixos)');
    for (const m of prox) L.push(`${m.key}: ${m.total.toFixed(2)} (parcelas ${m.parcelas.toFixed(2)}, fixos ${m.fixos.toFixed(2)})`);
  }
  const pos = investPositions().filter(p => p.aportado || p.atual);
  if (pos.length) {
    L.push('\n## Investimentos (aportado líquido | valor estimado hoje | rentabilidade)');
    for (const p of pos) L.push(`${p.c.nome}: ${p.aportado.toFixed(2)} | ${p.atual != null ? p.atual.toFixed(2) : '-'} | ${p.rend ? rendTexto(p.rend, false) : '-'}`);
  }
  const lanc = [...state.gastos].filter(g => g.data <= isoDate(hoje) || g.grupo).sort((a, b) => b.data.localeCompare(a.data)).slice(0, 150);
  if (lanc.length) {
    L.push(`\n## Lançamentos mais recentes (${lanc.length}; data;tipo;descrição;valor;categoria;pagamento)`);
    for (const g of lanc) L.push(`${g.data};${tipoOf(g)}${g.resgate ? '(resgate)' : ''};${g.desc};${g.valor.toFixed(2)};${catById(g.cat).nome};${g.metodo && METHODS[g.metodo] ? METHODS[g.metodo].nome : '-'}`);
  }
  return L.join('\n');
}

const IA_INSTRUCOES = `Você é o assistente financeiro do app "Gastos", um app pessoal de controle de gastos usado no Brasil. Converse em português do Brasil, de forma simples, direta e amigável, como um amigo que entende de dinheiro.

Como responder:
- Baseie-se nos dados da pessoa (abaixo). Cite números concretos em R$ (ex.: "R$ 343,00 em delivery este mês, contra R$ 175,00 de costume"). Nunca invente valores; se faltar informação, diga o que falta e como anotar no app.
- Seja prático: dê no máximo 3 a 4 sugestões claras, com quanto a pessoa economizaria por mês e por ano quando fizer sentido.
- Respostas curtas (até uns 150 palavras), a menos que a pessoa peça mais detalhes. Use **negrito** e listas com "-" quando ajudar. Não use tabelas nem títulos.
- Pode explicar conceitos (CDI, Selic, Tesouro Direto, juros compostos, rotativo do cartão, reserva de emergência, parcelamento) com exemplos usando os números da pessoa.
- Para decisões grandes (dívidas altas, investimentos de risco), dê a orientação e lembre de forma breve que vale conversar com alguém de confiança.
- Quando ajudar, ensine a usar o app: anotar digitando na caixa do Início (ex.: "mercado 87,90", "uber 23 pix", "tênis 300 3x", "recebi mesada 300", "guardei 100 na caixinha"), definir orçamento em Ajustes → Categorias, criar lançamentos fixos em Ajustes.
- "invest" são aportes em investimentos (resgates aparecem como "(resgate)"); "entrada" é dinheiro que entrou; "gasto" é despesa. Parcelas futuras aparecem com data futura.

Dados financeiros da pessoa (resumo gerado pelo app):
`;

// markdown simples → HTML seguro (negrito, itálico, listas, quebras de linha)
function iaHtml(md) {
  const linhas = escapeHtml(md).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s).,!?]|$)/g, '$1<i>$2</i>').split('\n');
  let html = '', lista = false;
  for (const l of linhas) {
    const m = l.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (m) { if (!lista) { html += '<ul>'; lista = true; } html += `<li>${m[1]}</li>`; continue; }
    if (lista) { html += '</ul>'; lista = false; }
    html += l.trim() ? `<p>${l.replace(/^#+\s*/, '')}</p>` : '';
  }
  if (lista) html += '</ul>';
  return html;
}

function iaCusto(u) {
  if (!u) return 0;
  return ((u.input_tokens || 0) * IA_PRECO.entrada + (u.cache_creation_input_tokens || 0) * IA_PRECO.cacheGravar
    + (u.cache_read_input_tokens || 0) * IA_PRECO.cacheLer + (u.output_tokens || 0) * IA_PRECO.saida) / 1e6;
}

function iaNovaConversa() {
  ia.historico = [];
  ia.contexto = null;
  assist.mensagens = [];
  assist.iniciado = false;
  renderAssistente();
}

// pergunta para o Claude, mostrando a resposta enquanto ela chega
async function iaPerguntar(texto) {
  if (ia.ocupado) return;
  ia.ocupado = true;
  assist.mensagens.push({ de: 'eu', html: escapeHtml(texto) });
  const msg = { de: 'ia', html: '<span class="digitando">pensando…</span>', botoes: [], online: true };
  assist.mensagens.push(msg);
  desenharChat();
  const bolha = () => $('#chatMsgs .msg.ia:last-child .bolha');
  try {
    if (!navigator.onLine) throw Object.assign(new Error('offline'), { offline: true });
    const cliente = await iaCliente();
    if (!ia.contexto) ia.contexto = IA_INSTRUCOES + iaResumoFinanceiro();
    ia.historico.push({ role: 'user', content: texto });
    const stream = cliente.beta.messages.stream({
      model: IA_MODELO,
      max_tokens: 64000,
      output_config: { effort: 'low' }, // conversa: respostas rápidas e mais baratas
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default', // se o modelo recusar por engano, a API tenta outro modelo na mesma chamada
      system: [{ type: 'text', text: ia.contexto, cache_control: { type: 'ephemeral' } }],
      messages: ia.historico,
    });
    let texto_ = '';
    stream.on('text', t => { texto_ += t; const b = bolha(); if (b) { b.innerHTML = iaHtml(texto_); b.scrollIntoView({ block: 'end' }); } });
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      texto_ = texto_ || 'Não consigo ajudar com isso. Pergunte algo sobre seus gastos, orçamento ou investimentos. 🙂';
      ia.historico.pop(); // não guarda a pergunta recusada
    } else {
      ia.historico.push({ role: 'assistant', content: final.content }); // devolve o conteúdo como veio (inclui raciocínio)
    }
    msg.html = iaHtml(texto_ || '(sem resposta)');
    const custo = iaCusto(final.usage);
    const uso = iaUso(); uso.usd += custo; uso.msgs++; lsSet(IA_USO, JSON.stringify(uso));
    msg.custo = custo;
  } catch (e) {
    if (ia.historico.length && ia.historico[ia.historico.length - 1].role === 'user') ia.historico.pop();
    const st = e && e.status;
    const motivo = e && e.offline ? 'Sem internet agora.'
      : st === 401 ? 'A chave da API não foi aceita. Toque em <b>⚙️ IA</b> e confira a chave.'
      : st === 402 || (st === 400 && /credit|billing|balance/i.test(e.message || '')) ? 'Sua conta da Anthropic está sem créditos. Adicione créditos no console da Anthropic.'
      : st === 429 ? 'Muitas perguntas seguidas — espere um pouquinho e tente de novo.'
      : st >= 500 || st === 529 ? 'O serviço da IA está instável agora.'
      : 'Não consegui falar com a IA.';
    let local;
    try { local = responder(texto); } catch { local = null; }
    if (typeof local === 'string') local = { html: local };
    msg.online = false;
    msg.html = `<span class="muted">⚠️ ${motivo} Respondendo no modo básico:</span><br><br>${local ? local.html : ''}`;
    msg.botoes = local && local.botoes || [];
  } finally {
    ia.ocupado = false;
    desenharChat();
    iaStatus();
  }
}

// ── tela de configuração ──
function iaStatus() {
  const el = $('#iaStatus');
  if (!el) return;
  const on = iaAtiva();
  el.textContent = on ? '🌐 IA online (Claude)' : '📴 Modo básico';
  el.classList.toggle('on', on);
  const uso = iaUso();
  $('#iaGasto').textContent = uso.msgs ? `Custo aproximado até agora: US$ ${uso.usd.toFixed(3).replace('.', ',')} em ${uso.msgs} pergunta${uso.msgs > 1 ? 's' : ''}.` : '';
  $('#iaRemover').hidden = !iaChave();
  $('#iaLigar').hidden = !iaChave();
  $('#iaLigar').textContent = on ? 'Usar modo básico' : 'Usar IA online';
  $('#iaChave').placeholder = iaChave() ? 'chave salva (••••' + iaChave().slice(-4) + ')' : 'sk-ant-…';
}
function iniciarIA() {
  $('#iaConfigBtn').onclick = () => { const p = $('#iaPainel'); p.hidden = !p.hidden; iaStatus(); };
  $('#iaNova').onclick = iaNovaConversa;
  $('#iaSalvar').onclick = () => {
    const k = $('#iaChave').value.trim();
    if (!/^sk-ant-/.test(k)) { toast('A chave começa com “sk-ant-”. Copie de novo do console da Anthropic.'); return; }
    lsSet(IA_CHAVE, k); lsSet(IA_LIGADA, '1'); $('#iaChave').value = '';
    ia.cliente = null; iaStatus(); $('#iaPainel').hidden = true;
    toast('Chave salva neste aparelho. A IA online está ligada! 🌐');
  };
  $('#iaRemover').onclick = () => { if (!confirm('Apagar a chave da IA deste aparelho?')) return; lsSet(IA_CHAVE, null); ia.cliente = null; iaStatus(); };
  $('#iaLigar').onclick = () => { lsSet(IA_LIGADA, iaAtiva() ? '0' : '1'); iaStatus(); };
  iaStatus();
}
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', iniciarIA);
