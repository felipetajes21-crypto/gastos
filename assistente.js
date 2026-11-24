// ───────────────────────── Assistente de finanças ─────────────────────────
// Responde perguntas sobre os seus gastos usando os dados do próprio aparelho
// (sem internet e sem mandar nada para fora). Usa as funções do app.js.

const DISCRICIONARIAS = ['comida', 'lazer', 'compras', 'beleza', 'assinaturas', 'viagem', 'presentes', 'outros'];
const ESSENCIAIS = ['mercado', 'moradia', 'contas', 'saude', 'transporte', 'educacao', 'pets'];
const assist = { mensagens: [], iniciado: false };

// ── utilidades ──
const fmt = v => money(Math.round(v * 100) / 100);
const r10 = v => Math.max(10, Math.round(v / 10) * 10);
const nomeMes = k => MONTHS[+k.slice(5) - 1];
const gastosEntre = (ini, fim) => state.gastos.filter(g => g.data >= ini && g.data <= fim && tipoOf(g) === 'gasto');
const fimDoMes = k => `${k}-${pad(daysInMonth(k))}`;
const esc = s => escapeHtml(String(s));

// meses fechados mais recentes com algum gasto (até n)
function mesesFechados(n = 3) {
  const out = [];
  for (let i = 1; i <= 12 && out.length < n; i++) {
    const k = shiftMonth(hojeKey(), -i);
    if (inMonth(k).length) out.push(k);
  }
  return out;
}
// média mensal por categoria nos meses fechados (ou o mês atual projetado, se não houver histórico)
function mediaPorCategoria() {
  const meses = mesesFechados(3);
  const tot = {};
  if (meses.length) {
    for (const k of meses) for (const c of byCategory(inMonth(k))) tot[c.id] = (tot[c.id] || 0) + c.valor;
    for (const id in tot) tot[id] /= meses.length;
    return { media: tot, base: `média de ${meses.length} ${meses.length > 1 ? 'meses' : 'mês'}` };
  }
  const s = monthStats(hojeKey());
  const f = s.elapsed ? s.dim / s.elapsed : 1;
  for (const c of byCategory(s.items)) tot[c.id] = c.valor * (c.id && ['moradia', 'contas'].includes(c.id) ? 1 : f);
  return { media: tot, base: 'ritmo deste mês' };
}
function sobraMedia() {
  const meses = mesesFechados(3).filter(k => sum(ofType(k, 'entrada')) > 0);
  if (!meses.length) return null;
  return meses.reduce((s, k) => s + balanceOf(k).sobrou, 0) / meses.length;
}

// ── períodos: "hoje", "ontem", "essa semana", "mês passado", "em outubro", "este ano", "últimos 3 meses" ──
function lerPeriodo(t) {
  const hoje = new Date(), h = isoDate(hoje), mk = hojeKey();
  const dia = n => isoDate(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + n));
  if (/\bhoje\b/.test(t)) return { ini: h, fim: h, label: 'hoje' };
  if (/\bontem\b/.test(t)) return { ini: dia(-1), fim: dia(-1), label: 'ontem' };
  if (/semana passada/.test(t)) { const d = hoje.getDay(); return { ini: dia(-d - 7), fim: dia(-d - 1), label: 'na semana passada' }; }
  if (/(essa|esta|nessa|nesta) semana|\bsemana\b/.test(t)) { const d = hoje.getDay(); return { ini: dia(-d), fim: h, label: 'nesta semana' }; }
  let m = t.match(/ultimos? (\d+|dois|tres|seis|doze) mes/);
  if (m) { const n = { dois: 2, tres: 3, seis: 6, doze: 12 }[m[1]] || +m[1]; return { ini: `${shiftMonth(mk, -(n - 1))}-01`, fim: h, label: `nos últimos ${n} meses`, meses: n }; }
  if (/mes passado|ultimo mes/.test(t)) { const k = shiftMonth(mk, -1); return { ini: `${k}-01`, fim: fimDoMes(k), label: `em ${nomeMes(k)}` }; }
  if (/(esse|este|neste|nesse) ano|\bno ano\b/.test(t)) return { ini: `${hoje.getFullYear()}-01-01`, fim: h, label: `em ${hoje.getFullYear()}` };
  const nomes = MONTHS.map(norm);
  for (let i = 0; i < 12; i++) if (new RegExp(`\\b${nomes[i]}\\b`).test(t)) {
    let y = hoje.getFullYear(); if (i > hoje.getMonth()) y--;
    const k = `${y}-${pad(i + 1)}`;
    return { ini: `${k}-01`, fim: fimDoMes(k), label: `em ${MONTHS[i]}` };
  }
  return { ini: `${mk}-01`, fim: fimDoMes(mk), label: 'neste mês', padrao: true };
}

// acha a categoria ou o termo de busca em "quanto gastei com ifood", "gastos de mercado"
function lerAlvo(t) {
  const limpo = t.replace(/\b(quanto|quantos|quanta|eu|ja|gastei|gasto|gastos|gastando|gaste|paguei|com|de|do|da|dos|das|no|na|nos|nas|em|o|a|os|as|meu|minha|meus|minhas|total|foi|esse|este|essa|esta|nesse|neste|mes|semana|ano|hoje|ontem|passado|passada|ultimos?|\d+|meses|janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|reais|r\$|\?)\b/g, ' ').replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!limpo) return null;
  const cats = catsOf('gasto');
  const porNome = cats.find(c => norm(c.nome).includes(limpo) || limpo.includes(norm(c.nome).split(' ')[0]));
  if (porNome) return { cat: porNome, termo: limpo };
  const porPalavra = cats.find(c => (c.palavras || []).some(p => norm(p) === limpo));
  if (porPalavra && state.gastos.every(g => !norm(g.desc).includes(limpo))) return { cat: porPalavra, termo: limpo };
  return { termo: limpo };
}

// ── respostas ──
function rResumo() {
  const mk = hojeKey(), s = monthStats(mk), b = balanceOf(mk);
  if (!s.items.length && !b.entrou) return `Ainda não tem nada anotado em ${nomeMes(mk)}. Comece pela caixa do Início: <b>mercado 87,90</b>, <b>uber 23 pix</b>…`;
  const linhas = [`📆 <b>${nomeMes(mk)}</b> até agora: você gastou <b>${fmt(s.total)}</b>${s.prevSame > 0 ? ` (${s.total > s.prevSame ? '▲' : '▼'} ${Math.abs(Math.round((s.total - s.prevSame) / s.prevSame * 100))}% vs o mesmo período do mês passado)` : ''}.`];
  if (s.isCurrent && s.elapsed >= 3) linhas.push(`🔮 No ritmo atual, o mês fecha em uns <b>${fmt(s.projection)}</b>.`);
  if (b.entrou) linhas.push(b.sobrou >= 0 ? `💰 Entrou ${fmt(b.entrou)} e, por enquanto, <b>sobram ${fmt(b.sobrou)}</b>.` : `🚨 Já saiu <b>${fmt(-b.sobrou)}</b> a mais do que entrou.`);
  const cats = byCategory(s.items);
  if (cats[0]) linhas.push(`🏆 Onde mais vai seu dinheiro: <b>${esc(cats[0].cat.nome)}</b> (${fmt(cats[0].valor)}, ${Math.round(cats[0].valor / (s.total || 1) * 100)}%).`);
  if (s.budget) linhas.push(s.projection > s.budget ? `⚠️ Pelo ritmo, você passa <b>${fmt(s.projection - s.budget)}</b> do orçamento.` : `✅ Dentro do orçamento (${fmt(s.budget)}).`);
  const prox = previsaoMes(shiftMonth(mk, 1));
  if (prox.total) linhas.push(`🗓️ Mês que vem você já tem <b>${fmt(prox.total)}</b> para pagar (parcelas e fixos).`);
  return { html: linhas.join('<br>'), botoes: [['Onde posso gastar menos?', 'onde posso economizar'], ['Ver análise', () => go('analysis')]] };
}

function rEconomizar() {
  const { media, base } = mediaPorCategoria();
  const dicas = [];
  const subiu = new Set();
  // 1) categoria que subiu muito neste mês (vem primeiro: é a mais urgente)
  const s = monthStats(hojeKey());
  if (s.elapsed >= 7) {
    const f = s.dim / s.elapsed;
    for (const c of byCategory(s.items)) {
      const m = media[c.id];
      if (!m || ['moradia', 'contas'].includes(c.id)) continue;
      const proj = c.valor * f;
      if (proj > m * 1.3 && proj - m > 50) { subiu.add(c.id); dicas.push({ ganho: proj - m, txt: `📈 <b>${esc(c.cat.nome)}</b> está acima do normal: no ritmo atual fecha em ${fmt(proj)}, contra ${fmt(m)} de costume. Segurar até o fim do mês poupa uns <b>${fmt(proj - m)}</b>.` }); }
    }
  }
  // 2) categorias "cortáveis": quanto 25% a menos rende por mês e por ano
  for (const id of DISCRICIONARIAS) {
    if (subiu.has(id)) continue;
    const v = media[id] || 0;
    if (v < 40) continue;
    const corte = v * 0.25;
    const c = catById(id);
    dicas.push({ ganho: corte, txt: `${c.emoji} <b>${esc(c.nome)}</b>: você gasta uns ${fmt(v)}/mês (${base}). Gastando <b>25% menos</b> sobram <b>${fmt(corte)}/mês</b> — ${fmt(corte * 12)} por ano.` });
  }
  // 3) hábito pequeno e frequente (café, lanche, uber…) nos últimos 30 dias
  const d30 = isoDate(new Date(Date.now() - 30 * 864e5));
  const freq = {};
  for (const g of gastosEntre(d30, isoDate(new Date()))) {
    if (g.valor > 60 || g.grupo || g.fixo) continue;
    const k = norm(g.desc).replace(/\s*\(\d+\/\d+\)$/, '');
    (freq[k] || (freq[k] = { n: 0, v: 0, d: g.desc })).n++; freq[k].v += g.valor;
  }
  for (const f of Object.values(freq).filter(f => f.n >= 4).sort((a, b) => b.v - a.v).slice(0, 2)) {
    dicas.push({ ganho: f.v / 2, txt: `🔁 <b>${esc(f.d)}</b> apareceu ${f.n}× em 30 dias (${fmt(f.v)}). Fazendo metade das vezes: <b>${fmt(f.v / 2)}/mês</b>, ${fmt(f.v * 6)} por ano.` });
  }
  // 4) assinaturas
  const ass = assinaturas();
  if (ass.total > 0) dicas.push({ ganho: ass.total * 0.3, txt: `📺 Você paga uns <b>${fmt(ass.total)}/mês</b> em assinaturas (${ass.itens.slice(0, 4).map(a => esc(a.nome)).join(', ')}${ass.itens.length > 4 ? '…' : ''}). Vale revisar o que não usa — cada R$ 30 cortado vira R$ 360 no ano.` });
  // 5) fim de semana
  if (s.items.length >= 10) {
    const fds = s.items.filter(g => [0, 6].includes(parseISO(g.data).getDay()));
    const share = sum(fds) / (s.total || 1);
    if (share > 0.45) dicas.push({ ganho: sum(fds) * 0.15, txt: `🎈 ${Math.round(share * 100)}% dos gastos do mês foram no fim de semana. Combinar um valor para o sábado/domingo ajuda a não passar do ponto.` });
  }
  if (!dicas.length) return state.gastos.length < 10
    ? 'Ainda tenho poucos gastos para comparar. Anote por umas 2 semanas que eu te mostro onde dá para economizar, com valores. 😉'
    : 'Seus gastos estão bem equilibrados — não achei nenhum exagero claro. 👏 Uma ideia: defina um orçamento por categoria para manter assim (pergunte “monte um orçamento”).';
  dicas.sort((a, b) => b.ganho - a.ganho);
  const top = dicas.slice(0, 4);
  const total = top.reduce((s, d) => s + d.ganho, 0);
  return {
    html: `Aqui é onde dá para gastar menos:<br><br>${top.map(d => d.txt).join('<br><br>')}<br><br>💡 Juntando essas mudanças: uns <b>${fmt(total)} por mês</b> — <b>${fmt(total * 12)} por ano</b>.`,
    botoes: [['Monte um orçamento pra mim', 'monte um orçamento'], ['Quero juntar dinheiro', 'quero juntar 500 em 6 meses']],
  };
}

function assinaturas() {
  const itens = [];
  const vistos = new Set();
  for (const f of state.fixos) if (tipoCat(catById(f.cat)) === 'gasto' && (f.cat === 'assinaturas' || /netflix|spotify|prime|disney|max|globoplay|youtube|deezer|icloud|google one|xbox|psn|game pass|academia|smart ?fit/i.test(f.desc))) {
    itens.push({ nome: f.desc, valor: f.valor }); vistos.add(norm(f.desc));
  }
  // mesmo nome em 2+ dos últimos 3 meses, na categoria Assinaturas
  const meses = [hojeKey(), ...mesesFechados(2)];
  const porNome = {};
  for (const k of meses) for (const g of inMonth(k)) if (g.cat === 'assinaturas' && !g.fixo) {
    const n = norm(g.desc);
    (porNome[n] || (porNome[n] = { nome: g.desc, meses: new Set(), valor: g.valor })).meses.add(k);
  }
  for (const [n, a] of Object.entries(porNome)) if (!vistos.has(n) && (a.meses.size >= 2 || meses.length === 1)) itens.push({ nome: a.nome, valor: a.valor });
  itens.sort((a, b) => b.valor - a.valor);
  return { itens, total: itens.reduce((s, a) => s + a.valor, 0) };
}

function rAssinaturas() {
  const a = assinaturas();
  if (!a.itens.length) return 'Não achei assinaturas anotadas. Se você paga streaming, academia ou apps, anote como <b>lançamento fixo</b> em Ajustes que eu acompanho para você.';
  return `📺 Suas assinaturas e mensalidades:<br>${a.itens.map(i => `• ${esc(i.nome)} — ${fmt(i.valor)}`).join('<br>')}<br><br>Total: <b>${fmt(a.total)}/mês</b> (${fmt(a.total * 12)} por ano).`;
}

function rQuantoGastei(t) {
  const p = lerPeriodo(t);
  const alvo = lerAlvo(t);
  let itens = gastosEntre(p.ini, p.fim);
  let nome = 'no total';
  if (alvo) {
    if (alvo.cat) { itens = itens.filter(g => g.cat === alvo.cat.id); nome = `com ${alvo.cat.emoji} ${esc(alvo.cat.nome)}`; }
    else { itens = itens.filter(g => norm(g.desc).includes(alvo.termo)); nome = `com “${esc(alvo.termo)}”`; }
  }
  const total = sum(itens);
  if (!itens.length) return `Não achei gastos ${nome} ${p.label}.`;
  const maiores = [...itens].sort((a, b) => b.valor - a.valor).slice(0, 3);
  let extra = '';
  if (alvo && alvo.cat && p.padrao) {
    const { media } = mediaPorCategoria();
    const m = media[alvo.cat.id];
    if (m) extra = `<br>Costuma ser uns ${fmt(m)} por mês.`;
  }
  return {
    html: `Você gastou <b>${fmt(total)}</b> ${nome} ${p.label} (${itens.length} lançamento${itens.length > 1 ? 's' : ''}).${extra}<br><br>Maiores: ${maiores.map(g => `${esc(g.desc)} ${fmt(g.valor)}`).join(' · ')}`,
    botoes: alvo && alvo.cat ? [['Ver no extrato', () => { ui.cat = alvo.cat.id; ui.search = ''; ui.tipoFiltro = 'tudo'; go('list'); }]] : alvo ? [['Ver no extrato', () => { ui.cat = ''; ui.search = alvo.termo; $('#searchInput').value = alvo.termo; ui.tipoFiltro = 'tudo'; go('list'); }]] : [],
  };
}

function rPosso(t) {
  const p = parseText(t.replace(/[?!]/g, ' ').replace(/\b(consigo|posso|da pra|dá pra|comprar|gastar|um|uma|de)\b/g, ' '));
  const valor = p.valor;
  if (!valor) return 'Me diga o valor, por exemplo: <b>consigo comprar um tênis de 300?</b>';
  const mk = hojeKey(), s = monthStats(mk), b = balanceOf(mk);
  const prox = previsaoMes(shiftMonth(mk, 1));
  const parc = n => valor / n;
  if (b.entrou > 0) {
    const livre = b.entrou - Math.max(s.projection, s.total) - Math.max(0, b.investiu);
    if (livre >= valor) return `✅ Cabe. Pelo ritmo do mês devem sobrar uns <b>${fmt(livre)}</b>; depois da compra ficariam ${fmt(livre - valor)}.${livre - valor < valor * 0.3 ? '<br>Fica um pouco apertado — se puder, espere a próxima entrada.' : ''}`;
    const sm = sobraMedia();
    let txt = livre > 0 ? `⚠️ À vista está apertado: pelo ritmo, sobram só uns <b>${fmt(livre)}</b> este mês.` : `🚫 Agora não: pelo ritmo, este mês já vai fechar <b>${fmt(-livre)}</b> no vermelho. Melhor esperar a próxima entrada.`;
    if (sm && sm > 0) {
      const n = Math.min(12, Math.ceil(valor / (sm * 0.7)));
      txt += `<br>Você costuma sobrar ${fmt(sm)} por mês. Guardando ${fmt(valor / n)} por mês, em <b>${n} ${n > 1 ? 'meses' : 'mês'}</b> você compra à vista.`;
    }
    txt += `<br>Parcelado em 3× (${fmt(parc(3))}), mês que vem você teria <b>${fmt(prox.total + parc(3))}</b> já comprometido.`;
    return txt;
  }
  const media = Object.values(mediaPorCategoria().media).reduce((a, v) => a + v, 0);
  return `Para eu dizer se cabe, preciso saber quanto entra: anote sua mesada/salário (ex.: <b>recebi mesada 300</b>).<br>Por enquanto: ${fmt(valor)} é <b>${media ? Math.round(valor / media * 100) : '—'}%</b> do que você gasta num mês${media ? ` (${fmt(media)})` : ''}. Em 3× seriam ${fmt(parc(3))} por mês.`;
}

function rOrcamento() {
  const { media, base } = mediaPorCategoria();
  const linhas = Object.entries(media).filter(([id, v]) => v >= 15 && tipoCat(catById(id)) === 'gasto')
    .map(([id, v]) => ({ id, atual: v, sug: ESSENCIAIS.includes(id) ? r10(v * 1.05) : r10(v * 0.85) }))
    .sort((a, b) => b.atual - a.atual);
  if (!linhas.length) return 'Ainda não tenho gastos suficientes para sugerir um orçamento. Anote por algumas semanas e pergunte de novo. 😉';
  const total = linhas.reduce((s, l) => s + l.sug, 0);
  const sm = sobraMedia();
  assist.sugestaoOrc = linhas;
  return {
    html: `Sugestão de orçamento mensal (${base}). Essenciais ficam com uma folguinha; o resto com <b>15% a menos</b>:<br><br>${linhas.map(l => `${catById(l.id).emoji} ${esc(catById(l.id).nome)}: <b>${fmt(l.sug)}</b> <span class="muted">(hoje ~${fmt(l.atual)})</span>`).join('<br>')}<br><br>Total: <b>${fmt(total)}</b> por mês.${sm == null ? '' : sm >= 0 ? ` Hoje você costuma ter ${fmt(sm)} de sobra.` : ` Hoje sai ${fmt(-sm)} a mais do que entra por mês — esse orçamento ajuda a fechar a conta.`}<br>O app avisa quando uma categoria passar do limite.`,
    botoes: [['Aplicar esse orçamento', aplicarOrcamento]],
  };
}
function aplicarOrcamento() {
  for (const l of assist.sugestaoOrc || []) { const c = state.categorias.find(x => x.id === l.id); if (c) c.orcamento = l.sug; }
  save(); render();
  falar_('✅ Pronto! Orçamentos aplicados. Dá para mudar a qualquer hora em <b>Ajustes → Categorias</b>. Eu aviso no Início e na Análise quando algo passar do limite.');
}

function rMeta(t) {
  const p = parseText(t.replace(/[?!]/g, ' ').replace(/\d+\s*mes(es)?/g, ' ').replace(/\b(quero|juntar|guardar|economizar|poupar|ate|até|em)\b/g, ' '));
  const valor = p.valor;
  if (!valor) return 'Me diga quanto e até quando, por exemplo: <b>quero juntar 1000 até março</b> ou <b>quero guardar 500 em 6 meses</b>.';
  let meses = null;
  const mm = t.match(/(\d+)\s*mes/);
  if (mm) meses = +mm[1];
  else {
    const nomes = MONTHS.map(norm);
    const hoje = new Date();
    for (let i = 0; i < 12; i++) if (t.includes(nomes[i])) { meses = (i - hoje.getMonth() + 12) % 12 || 12; break; }
    if (!meses && /fim do ano|final do ano|natal/.test(t)) meses = Math.max(1, 11 - hoje.getMonth());
  }
  meses = meses || 6;
  const porMes = valor / meses;
  const sm = sobraMedia();
  let txt = `🎯 Para juntar <b>${fmt(valor)}</b> em <b>${meses} ${meses > 1 ? 'meses' : 'mês'}</b>: guarde <b>${fmt(porMes)} por mês</b> (uns ${fmt(porMes / 4.3)} por semana).`;
  if (sm != null) txt += sm >= porMes ? `<br>✅ Dá: você costuma sobrar ${fmt(sm)} por mês.` : sm > 0 ? `<br>⚠️ Você costuma sobrar ${fmt(sm)} por mês — vai precisar cortar uns ${fmt(porMes - sm)}. Pergunte “onde posso economizar”.` : `<br>⚠️ Nos últimos meses saiu mais do que entrou (${fmt(-sm)} por mês). Para essa meta, vai precisar cortar uns <b>${fmt(porMes - sm)}</b> por mês. Pergunte “onde posso economizar”.`;
  txt += `<br><br>Dica: crie um <b>lançamento fixo</b> “caixinha ${Math.round(porMes)}” no dia em que o dinheiro entra — guardar primeiro funciona melhor do que guardar o que sobra. Numa caixinha a 100% do CDI o dinheiro ainda rende.`;
  return { html: txt, botoes: [['Criar lançamento fixo', () => { go('settings'); openRecurring(null); }], ['Onde posso economizar?', 'onde posso economizar']] };
}

function rFuturo() {
  const mk = hojeKey();
  const meses = [1, 2, 3, 4, 5, 6].map(i => previsaoMes(shiftMonth(mk, i))).filter(m => m.total);
  if (!meses.length) return 'Você não tem parcelas nem fixos previstos para os próximos meses. 🙌';
  const restante = sum(state.gastos.filter(g => g.data.slice(0, 7) > mk && tipoOf(g) === 'gasto'));
  return { html: `🗓️ Já comprometido nos próximos meses:<br>${meses.map(m => `• ${nomeMes(m.key)}: <b>${fmt(m.total)}</b>${m.fixos ? ` <span class="muted">(${fmt(m.parcelas)} parcelas + ${fmt(m.fixos)} fixos)</span>` : ''}`).join('<br>')}${restante ? `<br><br>Faltam ${fmt(restante)} em parcelas.` : ''}`, botoes: [['Ver mês que vem', () => { ui.month = shiftMonth(mk, 1); go('home'); }]] };
}

function rMaiores(t) {
  const p = lerPeriodo(t);
  const itens = gastosEntre(p.ini, p.fim).sort((a, b) => b.valor - a.valor).slice(0, 5);
  if (!itens.length) return `Sem gastos ${p.label}.`;
  return { html: `🏆 Maiores gastos ${p.label}:<br>${itens.map((g, i) => `${i + 1}. ${esc(g.desc)} — <b>${fmt(g.valor)}</b> <span class="muted">${esc(catById(g.cat).nome)}</span>`).join('<br>')}`, botoes: [['Ver tudo no extrato', () => { ui.cat = ''; go('list'); }]] };
}

function rInvest() {
  const pos = investPositions().filter(p => p.aportado > 0 || p.atual);
  if (!pos.length) return 'Você ainda não anotou investimentos. Exemplo: <b>guardei 100 na caixinha</b> ou <b>investi 200 no tesouro selic</b>. Para começar, uma reserva de emergência (3 a 6 meses de gastos) numa caixinha a 100% do CDI é o mais seguro.';
  const total = investedTotal();
  const media = Object.values(mediaPorCategoria().media).reduce((a, v) => a + v, 0);
  const reserva = media ? total / media : null;
  return { html: `📈 Você tem <b>${fmt(total)}</b> investido.${reserva ? `<br>Isso cobre uns <b>${reserva.toFixed(1).replace('.', ',')} meses</b> dos seus gastos${reserva < 3 ? ' — o ideal para a reserva de emergência é de 3 a 6 meses.' : ' — boa reserva! 👏'}` : ''}`, botoes: [['Ver investimentos', () => go('invest')]] };
}

function rAjuda() {
  return { html: 'Posso te ajudar com:<br>• <b>Como estou esse mês?</b><br>• <b>Onde posso gastar menos?</b><br>• <b>Quanto gastei com ifood mês passado?</b><br>• <b>Consigo comprar um tênis de 300?</b><br>• <b>Monte um orçamento pra mim</b><br>• <b>Quero juntar 1000 até março</b><br>• <b>Quanto tenho pra pagar mês que vem?</b><br>• <b>Quais assinaturas eu pago?</b><br>• Ou digite um gasto, tipo <b>uber 23 pix</b>, que eu anoto.', botoes: SUGESTOES.slice(0, 3) };
}

// ── entender a pergunta ──
function responder(texto) {
  const t = norm(texto).replace(/[?!]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return rAjuda();
  if (/^(oi|ola|e ai|eae|bom dia|boa tarde|boa noite|opa)\b/.test(t) && t.split(' ').length <= 3) return { html: `Oi! 👋 ${rResumo().html || ''}`, botoes: SUGESTOES.slice(0, 3) };
  if (/ajuda|o que (voce|vc) (faz|sabe)|como (te )?usar|comandos/.test(t)) return rAjuda();
  if (/(gastar|gasto) menos|economi|poupar|cortar|reduzir|dica|onde (eu )?(posso|devo|consigo)|desperdic|exager/.test(t)) return rEconomizar();
  if (/orcamento|limite|planej/.test(t)) return rOrcamento();
  if (/assinatura|mensalidade|streaming/.test(t)) return rAssinaturas();
  if (/(quero|preciso|vou|meta).*(juntar|guardar|economizar|poupar)|juntar \d|guardar \d.*(ate|em \d+ mes)/.test(t)) return rMeta(t);
  if (/(consigo|posso|da pra|cabe|tenho dinheiro).*(comprar|gastar|pagar|bolso)|(comprar|gastar).*\d/.test(t)) return rPosso(texto);
  if (/parcela|mes que vem|proximo mes|proximos meses|a pagar|futur|comprometid/.test(t)) return rFuturo();
  if (/maior(es)? gasto|mais caro|gastei mais/.test(t) && !/com|categoria/.test(t)) return rMaiores(t);
  if (/invest|reserva|caixinha|rende|tesouro/.test(t) && !/gastei/.test(t)) return rInvest();
  if (/quanto|gastei|gasto|total/.test(t)) return rQuantoGastei(t);
  if (/como (eu )?(estou|to|ta|esta)|resumo|situacao|balanco|sobrou|saldo/.test(t)) return rResumo();
  // parece um lançamento? ("uber 23 pix")
  const p = parseText(texto);
  if (p.valor) {
    const c = catById(categorize(p.desc, p.tipo || undefined).cat);
    return { html: `Quer que eu anote <b>${fmt(p.valor)}</b> em ${c.emoji} ${esc(c.nome)}${p.desc ? ` (“${esc(p.desc)}”)` : ''}?`, botoes: [['📝 Anotar', () => { go('home'); $('#quickInput').value = texto; updatePreview(); $('#quickInput').focus(); }]] };
  }
  return { html: 'Não entendi muito bem 🤔. Tente uma destas:', botoes: SUGESTOES.slice(0, 4) };
}

const SUGESTOES = [
  ['Como estou esse mês?', 'como estou esse mês'],
  ['Onde posso gastar menos?', 'onde posso gastar menos'],
  ['Quanto gastei com delivery?', 'quanto gastei com restaurante'],
  ['Consigo comprar algo de R$ 300?', 'consigo comprar algo de 300'],
  ['Monte um orçamento pra mim', 'monte um orçamento'],
  ['Quero juntar R$ 1.000', 'quero juntar 1000 em 6 meses'],
  ['O que tenho pra pagar?', 'parcelas a pagar'],
  ['Minhas assinaturas', 'quais assinaturas eu pago'],
];

// ── tela ──
function falar_(html, botoes) { assist.mensagens.push({ de: 'ia', html, botoes: botoes || [] }); desenharChat(); }
function perguntar(texto) {
  assist.mensagens.push({ de: 'eu', html: esc(texto) });
  let r;
  try { r = responder(texto); } catch (e) { console.error(e); r = 'Ops, me confundi com essa. 😅 Tente perguntar de outro jeito.'; }
  if (typeof r === 'string') r = { html: r };
  falar_(r.html, r.botoes);
}
function desenharChat() {
  const box = $('#chatMsgs');
  if (!box) return;
  box.innerHTML = assist.mensagens.map((m, i) => `<div class="msg ${m.de}"><div class="bolha">${m.html}</div>${m.botoes && m.botoes.length ? `<div class="msg-botoes">${m.botoes.map((b, j) => `<button type="button" class="chip" data-m="${i}" data-b="${j}">${esc(b[0])}</button>`).join('')}</div>` : ''}</div>`).join('');
  $$('[data-m]', box).forEach(b => b.onclick = () => {
    const acao = assist.mensagens[+b.dataset.m].botoes[+b.dataset.b][1];
    if (typeof acao === 'function') acao(); else perguntar(acao);
  });
  const ultimo = box.lastElementChild;
  if (ultimo) ultimo.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function renderAssistente() {
  if (!assist.iniciado) {
    assist.iniciado = true;
    const s = monthStats(hojeKey());
    const destaques = s.items.length ? insights(s, byCategory(s.items)).slice(0, 3).map(([e, t]) => `${e} ${t}`) : [];
    falar_(`Oi! 👋 Sou seu assistente de finanças. Pergunte do seu jeito sobre seus gastos que eu respondo com os seus números.${destaques.length ? `<br><br><b>O que eu notei:</b><br>${destaques.join('<br>')}` : ''}`, SUGESTOES.slice(0, 4));
  } else desenharChat();
  $('#chatSugestoes').innerHTML = SUGESTOES.map(([l, q]) => `<button type="button" class="chip" data-q="${esc(q)}">${esc(l)}</button>`).join('');
  $$('#chatSugestoes [data-q]').forEach(b => b.onclick = () => perguntar(b.dataset.q));
}
function novaConversa() {
  assist.mensagens = [];
  assist.iniciado = false;
  renderAssistente();
}
function iniciarAssistente() {
  $('#iaNova').onclick = novaConversa;
  $('#chatForm').addEventListener('submit', e => {
    e.preventDefault();
    const i = $('#chatInput');
    const t = i.value.trim();
    if (!t) return;
    i.value = '';
    perguntar(t);
  });
}
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', iniciarAssistente);
