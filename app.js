/* Gastos — controle de gastos offline, com categorização automática.
 * Tudo roda no navegador; os dados ficam no localStorage deste aparelho. */
'use strict';

// ───────────────────────── Categorias padrão ─────────────────────────
// As palavras-chave são comparadas sem acento e em minúsculas.
const DEFAULT_CATEGORIES = [
  { id: 'mercado', nome: 'Mercado', emoji: '🛒', palavras: ['mercado', 'supermercado', 'feira', 'hortifruti', 'sacolao', 'acougue', 'padaria', 'pao', 'carrefour', 'assai', 'atacadao', 'pao de acucar', 'guanabara', 'mundial', 'prezunic', 'zona sul', 'st marche', 'oba', 'hirota', 'sams club', 'makro', 'leite', 'ovos', 'frutas', 'verdura', 'compras do mes', 'mercearia', 'emporio', 'quitanda', 'bistek', 'savegnago', 'angeloni', 'condor', 'muffato', 'sonda', 'tenda', 'comper', 'bretas', 'mateus'] },
  { id: 'comida', nome: 'Restaurante & Delivery', emoji: '🍔', palavras: ['ifood', 'rappi', 'delivery', 'restaurante', 'lanche', 'lanchonete', 'almoco', 'jantar', 'janta', 'cafe da manha', 'pizza', 'pizzaria', 'hamburguer', 'burger', 'mcdonalds', 'mc donalds', 'mcdonald', 'bk', 'burger king', 'subway', 'habibs', 'outback', 'madero', 'sushi', 'japones', 'temaki', 'acai', 'sorvete', 'sorveteria', 'cafe', 'cafeteria', 'starbucks', 'coxinha', 'pastel', 'salgado', 'marmita', 'quentinha', 'self service', 'rodizio', 'churrascaria', 'bar', 'boteco', 'cerveja', 'chopp', 'drink', 'bebida', 'refri', 'coca', 'doce', 'brigadeiro', 'bolo', 'kebab', 'esfiha', 'giraffas', 'spoleto', 'bobs', 'kfc', 'popeyes', 'ze delivery', 'aiqfome', '99food', 'keeta', 'food', 'comida', 'lanchinho', 'cantina', 'bandejao', 'tapioca', 'crepe', 'hot dog', 'cachorro quente', 'churros', 'petisco'] },
  { id: 'transporte', nome: 'Transporte', emoji: '🚗', palavras: ['uber', '99', '99pop', 'taxi', 'indrive', 'cabify', 'onibus', 'metro', 'trem', 'brt', 'vlt', 'bilhete unico', 'riocard', 'passagem', 'gasolina', 'combustivel', 'etanol', 'alcool', 'diesel', 'posto', 'shell', 'ipiranga', 'petrobras', 'br mania', 'estacionamento', 'zona azul', 'pedagio', 'sem parar', 'conectcar', 'veloe', 'oficina', 'mecanico', 'pneu', 'troca de oleo', 'lavagem', 'lava jato', 'ipva', 'licenciamento', 'multa', 'seguro carro', 'patinete', 'bike', 'moto', 'detran', 'bilhete'] },
  { id: 'moradia', nome: 'Moradia', emoji: '🏠', palavras: ['aluguel', 'condominio', 'iptu', 'reforma', 'pedreiro', 'eletricista', 'encanador', 'diarista', 'faxina', 'faxineira', 'empregada', 'moveis', 'movel', 'sofa', 'colchao', 'decoracao', 'leroy', 'telhanorte', 'tok stok', 'tokstok', 'etna', 'camicado', 'material de construcao', 'utensilios', 'produto de limpeza', 'limpeza', 'lavanderia', 'gas', 'botijao', 'mudanca', 'chaveiro', 'dedetizacao', 'financiamento', 'prestacao casa'] },
  { id: 'contas', nome: 'Contas', emoji: '💡', palavras: ['luz', 'energia', 'enel', 'light', 'cemig', 'copel', 'celesc', 'coelba', 'cpfl', 'equatorial', 'neoenergia', 'agua', 'sabesp', 'cedae', 'copasa', 'sanepar', 'embasa', 'internet', 'wifi', 'vivo', 'claro', 'tim', 'celular', 'telefone', 'plano celular', 'recarga', 'fibra', 'conta de luz', 'conta de agua', 'boleto', 'fatura', 'tarifa', 'anuidade', 'juros', 'iof', 'imposto', 'irpf', 'darf', 'mei', 'taxa', 'cartorio'] },
  { id: 'saude', nome: 'Saúde', emoji: '💊', palavras: ['farmacia', 'remedio', 'medicamento', 'drogasil', 'raia', 'drogaria', 'pague menos', 'pacheco', 'panvel', 'medico', 'consulta', 'dentista', 'odonto', 'exame', 'laboratorio', 'hospital', 'clinica', 'plano de saude', 'unimed', 'amil', 'sulamerica', 'bradesco saude', 'hapvida', 'notredame', 'psicologo', 'psicologa', 'terapia', 'terapeuta', 'fisioterapia', 'fisio', 'nutricionista', 'vacina', 'oculos', 'lente', 'otica', 'vitamina', 'suplemento', 'whey', 'creatina', 'academia', 'smartfit', 'smart fit', 'bluefit', 'crossfit', 'pilates', 'yoga', 'personal', 'natacao', 'gympass', 'wellhub', 'totalpass'] },
  { id: 'lazer', nome: 'Lazer', emoji: '🎉', palavras: ['cinema', 'filme', 'teatro', 'show', 'ingresso', 'sympla', 'eventim', 'ticketmaster', 'festa', 'balada', 'role', 'parque', 'museu', 'jogo', 'game', 'steam', 'playstation', 'psn', 'xbox', 'nintendo', 'futebol', 'pelada', 'quadra', 'boliche', 'karaoke', 'praia', 'clube', 'passeio', 'happy hour', 'aniversario', 'cinemark', 'kinoplex', 'livro', 'livraria', 'amazon kindle', 'hobby', 'tabacaria', 'narguile'] },
  { id: 'assinaturas', nome: 'Assinaturas', emoji: '📺', palavras: ['netflix', 'spotify', 'deezer', 'youtube premium', 'youtube', 'prime video', 'amazon prime', 'prime', 'disney', 'disney+', 'hbo', 'globoplay', 'paramount', 'apple tv', 'apple music', 'icloud', 'google one', 'google drive', 'dropbox', 'chatgpt', 'openai', 'claude', 'anthropic', 'notion', 'canva', 'adobe', 'microsoft 365', 'office', 'assinatura', 'mensalidade app', 'twitch', 'crunchyroll', 'duolingo', 'tinder', 'bumble', 'linkedin premium', 'xbox game pass', 'game pass', 'ps plus', 'mubi', 'telecine', 'premiere', 'sky', 'kindle unlimited', 'audible', 'patreon'] },
  { id: 'compras', nome: 'Compras', emoji: '🛍️', palavras: ['roupa', 'roupas', 'camisa', 'camiseta', 'calca', 'bermuda', 'vestido', 'blusa', 'casaco', 'jaqueta', 'tenis', 'sapato', 'sandalia', 'chinelo', 'meia', 'cueca', 'calcinha', 'sutia', 'bolsa', 'mochila', 'relogio', 'acessorio', 'shein', 'shopee', 'aliexpress', 'temu', 'mercado livre', 'mercadolivre', 'amazon', 'magalu', 'magazine luiza', 'americanas', 'casas bahia', 'renner', 'riachuelo', 'cea', 'c&a', 'zara', 'hering', 'centauro', 'netshoes', 'decathlon', 'nike', 'adidas', 'shopping', 'loja', 'eletronico', 'celular novo', 'fone', 'carregador', 'cabo', 'notebook', 'computador', 'teclado', 'mouse', 'monitor', 'tv', 'kabum', 'fast shop', 'apple', 'iphone', 'samsung', 'xiaomi', 'papelaria', 'kalunga'] },
  { id: 'beleza', nome: 'Cuidados pessoais', emoji: '💇', palavras: ['cabelo', 'cabeleireiro', 'cabeleireira', 'barbeiro', 'barbearia', 'corte', 'salao', 'manicure', 'unha', 'sobrancelha', 'depilacao', 'estetica', 'maquiagem', 'make', 'perfume', 'boticario', 'natura', 'avon', 'sephora', 'eudora', 'oboticario', 'creme', 'shampoo', 'condicionador', 'sabonete', 'desodorante', 'skincare', 'protetor solar', 'higiene', 'escova de dente', 'pasta de dente', 'massagem', 'spa'] },
  { id: 'educacao', nome: 'Educação', emoji: '📚', palavras: ['faculdade', 'universidade', 'mensalidade', 'escola', 'colegio', 'curso', 'cursinho', 'aula', 'professor', 'ingles', 'idioma', 'udemy', 'alura', 'coursera', 'rocketseat', 'hotmart', 'material escolar', 'apostila', 'xerox', 'impressao', 'matricula', 'mba', 'certificacao', 'prova', 'vestibular', 'enem', 'concurso'] },
  { id: 'pets', nome: 'Pets', emoji: '🐶', palavras: ['pet', 'petshop', 'pet shop', 'petz', 'cobasi', 'racao', 'veterinario', 'vet', 'banho e tosa', 'tosa', 'areia gato', 'gato', 'cachorro', 'cao', 'petisco pet', 'vacina pet', 'antipulgas', 'bravecto', 'nexgard'] },
  { id: 'viagem', nome: 'Viagem', emoji: '✈️', palavras: ['viagem', 'hotel', 'pousada', 'airbnb', 'booking', 'hostel', 'passagem aerea', 'aviao', 'voo', 'latam', 'gol', 'azul', 'decolar', '123milhas', 'hurb', 'aluguel de carro', 'localiza', 'movida', 'unidas', 'rodoviaria', 'buser', 'clickbus', 'mala', 'seguro viagem', 'cambio', 'dolar', 'euro', 'passaporte', 'visto', 'turismo', 'excursao'] },
  { id: 'presentes', nome: 'Presentes & Doações', emoji: '🎁', palavras: ['presente', 'presentes', 'lembrancinha', 'doacao', 'dizimo', 'oferta', 'vaquinha', 'caridade', 'flores', 'floricultura', 'cesta', 'amigo secreto', 'cha de bebe', 'cha de panela', 'casamento'] },
  { id: 'outros', nome: 'Outros', emoji: '📦', palavras: [] },
];

const METHODS = {
  pix: { nome: 'Pix', palavras: ['pix'] },
  credito: { nome: 'Crédito', palavras: ['credito', 'cc', 'cartao', 'cartao de credito', 'nubank', 'c6'] },
  debito: { nome: 'Débito', palavras: ['debito', 'cd'] },
  dinheiro: { nome: 'Dinheiro', palavras: ['dinheiro', 'especie', 'cash', 'grana'] },
  vale: { nome: 'Vale (VR/VA)', palavras: ['vr', 'va', 'vale', 'alelo', 'sodexo', 'pluxee', 'vale refeicao', 'vale alimentacao', 'caju', 'swile', 'ifood beneficios'] },
  boleto: { nome: 'Boleto', palavras: ['boleto'] },
};

const STOPWORDS = new Set(['de', 'da', 'do', 'dos', 'no', 'na', 'nos', 'nas', 'em', 'com', 'pra', 'para', 'pro', 'e', 'o', 'a', 'os', 'as', 'um', 'uma', 'reais', 'real', 'rs', 'r$', 'paguei', 'gastei', 'comprei', 'conta']);
const WEEKDAYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// ───────────────────────── Estado & armazenamento ─────────────────────────
const KEY = 'gastos.v1';
let state = load();
let ui = { month: '', search: '', cat: '' };

function freshState() {
  return { versao: 1, gastos: [], categorias: structuredClone(DEFAULT_CATEGORIES), aprendido: { frases: {}, palavras: {} }, fixos: [], fixosLancados: {} };
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const s = Object.assign(freshState(), JSON.parse(raw));
    // garante categorias padrão novas sem sobrescrever as do usuário
    for (const c of DEFAULT_CATEGORIES) if (!s.categorias.some(x => x.id === c.id) && !(s.removidas || []).includes(c.id)) s.categorias.push(structuredClone(c));
    return s;
  } catch (e) { console.error(e); return freshState(); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { toast('Não consegui salvar — faça um backup!'); }
}

// ───────────────────────── Utilidades ─────────────────────────
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const norm = s => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = v => BRL.format(v || 0);
const moneyShort = v => v >= 100000 ? 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil' : v >= 1000 ? 'R$ ' + Math.round(v).toLocaleString('pt-BR') : money(v);
const pad = n => String(n).padStart(2, '0');
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
function monthKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }
function shiftMonth(key, n) { const [y, m] = key.split('-').map(Number); return monthKey(new Date(y, m - 1 + n, 1)); }
function monthName(key, short) { const [y, m] = key.split('-').map(Number); return short ? MONTHS_SHORT[m - 1] : `${MONTHS[m - 1]} ${y}`; }
function daysInMonth(key) { const [y, m] = key.split('-').map(Number); return new Date(y, m, 0).getDate(); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const catById = id => state.categorias.find(c => c.id === id) || state.categorias.find(c => c.id === 'outros') || { id: 'outros', nome: 'Outros', emoji: '📦' };
function relDay(iso) {
  const today = isoDate(new Date());
  const y = isoDate(new Date(Date.now() - 864e5));
  if (iso === today) return 'hoje';
  if (iso === y) return 'ontem';
  const d = parseISO(iso);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
}

// ───────────────────────── Interpretação do texto ─────────────────────────
function parseAmount(tok) {
  let t = tok.replace(/^r\$/i, '').replace(/reais$/i, '');
  if (!/^\d[\d.,]*$/.test(t)) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); // 1.234,56
  else if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(t)) t = t.replace(/,/g, ''); // 1,234.56
  else if (/^\d+,\d{1,2}$/.test(t)) t = t.replace(',', '.');
  else if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const v = parseFloat(t);
  return isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null;
}

function parseText(text) {
  const out = { valor: null, data: isoDate(new Date()), metodo: '', parcelas: 1, desc: '' };
  let raw = text.trim().replace(/\s+/g, ' ');
  if (!raw) return out;
  // "r$ 20" → "r$20"
  raw = raw.replace(/r\$\s+(?=\d)/gi, 'r$');
  let tokens = raw.split(' ');
  const keep = new Array(tokens.length).fill(true);
  const n = tokens.map(norm);

  // Formas de pagamento (inclui expressões de 2-3 palavras)
  for (let i = 0; i < n.length; i++) {
    for (const [mid, m] of Object.entries(METHODS)) {
      for (const p of m.palavras) {
        const parts = p.split(' ');
        if (parts.every((w, k) => n[i + k] === w)) {
          // "no crédito" / "via pix" / "cartao de credito"
          if (!out.metodo || parts.length > 1) out.metodo = mid;
          for (let k = 0; k < parts.length; k++) keep[i + k] = false;
          if (i > 0 && ['no', 'na', 'via', 'pelo', 'pela', 'com', 'em', 'de'].includes(n[i - 1])) keep[i - 1] = false;
        }
      }
    }
  }
  // "ifood" deve ficar na descrição mesmo que exista "ifood beneficios"
  // Parcelas: 3x, 10x
  n.forEach((t, i) => { const m = t.match(/^(\d{1,2})x$/); if (m && +m[1] > 1) { out.parcelas = +m[1]; keep[i] = false; if (n[i - 1] === 'em') keep[i - 1] = false; } });

  // Datas
  const now = new Date();
  n.forEach((t, i) => {
    if (!keep[i]) return;
    let d = null;
    if (t === 'hoje') d = now;
    else if (t === 'ontem') d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    else if (t === 'anteontem') d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    else if (WEEKDAYS.includes(t.replace(/-feira$/, ''))) {
      const wd = WEEKDAYS.indexOf(t.replace(/-feira$/, ''));
      let diff = (now.getDay() - wd + 7) % 7; if (diff === 0) diff = 7;
      d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      if (n[i + 1] === 'feira') keep[i + 1] = false;
    } else {
      const m = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
      if (m) {
        let y = m[3] ? +m[3] : now.getFullYear(); if (y < 100) y += 2000;
        d = new Date(y, +m[2] - 1, +m[1]);
        if (!m[3] && d > now) d.setFullYear(y - 1);
        if (isNaN(d)) d = null;
      } else {
        const m2 = t.match(/^dia$/) && n[i + 1] && n[i + 1].match(/^(\d{1,2})$/);
        if (m2) { d = new Date(now.getFullYear(), now.getMonth(), +m2[1]); if (d > now) d.setMonth(d.getMonth() - 1); keep[i + 1] = false; }
      }
    }
    if (d) { out.data = isoDate(d); keep[i] = false; if (['em', 'no'].includes(n[i - 1])) keep[i - 1] = false; }
  });

  // Valor: prefere token com R$ ou com centavos; senão o último número.
  let best = -1, bestScore = -1;
  tokens.forEach((t, i) => {
    if (!keep[i]) return;
    const v = parseAmount(t);
    if (v == null) return;
    let score = i / 100; // mais à direita ganha em empate
    if (/^r\$/i.test(t) || /reais$/i.test(t) || /^(reais|real|rs)$/.test(n[i + 1] || '')) score += 10;
    if (/[.,]\d{1,2}$/.test(t)) score += 5;
    // número colado em nome conhecido (ex.: "99 food", "99 pop") não é valor se houver outro
    if (score > bestScore) { bestScore = score; best = i; }
  });
  if (best >= 0) { out.valor = parseAmount(tokens[best]); keep[best] = false; if (/^(reais|real|rs)$/.test(n[best + 1] || '')) keep[best + 1] = false; }

  const desc = tokens.filter((_, i) => keep[i]).join(' ').replace(/^(no|na|em|de|com)\s+/i, '').trim();
  out.desc = desc ? desc[0].toUpperCase() + desc.slice(1) : '';
  return out;
}

// ───────────────────────── Categorização automática ─────────────────────────
function wordsOf(s) { return norm(s).replace(/[^a-z0-9+&\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !STOPWORDS.has(w)); }

function categorize(desc) {
  const text = norm(desc);
  if (!text) return { cat: 'outros', certeza: 0 };
  const learnedPhrase = state.aprendido.frases[text];
  if (learnedPhrase && state.categorias.some(c => c.id === learnedPhrase)) return { cat: learnedPhrase, certeza: 1, porque: 'você já usou' };

  const scores = {};
  const add = (id, v) => { scores[id] = (scores[id] || 0) + v; };
  const clean = text.replace(/[^a-z0-9+&]/g, ' ').replace(/\s+/g, ' ');
  // também compara a versão no singular ("cafés" → "cafe", "pães" → "pao")
  const singular = clean.split(' ').map(w => w.length > 3 ? w.replace(/[oa]es$/, 'ao').replace(/(?<=[aeiou])s$/, '') : w).join(' ');
  const padded = ' ' + clean + ' | ' + singular + ' ';
  for (const c of state.categorias) {
    for (const p of c.palavras || []) {
      const kw = norm(p);
      if (kw && padded.includes(' ' + kw + ' ')) add(c.id, 2 + kw.length / 8);
    }
  }
  for (const w of wordsOf(desc)) {
    const counts = state.aprendido.palavras[w];
    if (!counts) continue;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    for (const [id, cnt] of Object.entries(counts)) add(id, 3 * cnt / total + Math.min(cnt, 5) * 0.2);
  }
  let best = 'outros', bs = 0;
  for (const [id, s] of Object.entries(scores)) if (s > bs && state.categorias.some(c => c.id === id)) { bs = s; best = id; }
  return { cat: best, certeza: bs ? Math.min(1, bs / 4) : 0 };
}

function learn(desc, cat, oldCat) {
  const text = norm(desc);
  if (!text) return;
  state.aprendido.frases[text] = cat;
  for (const w of wordsOf(desc)) {
    if (/^\d+$/.test(w)) continue;
    const m = state.aprendido.palavras[w] || (state.aprendido.palavras[w] = {});
    // ao corrigir, esquece a associação antiga
    if (oldCat && oldCat !== cat && m[oldCat]) { m[oldCat]--; if (!m[oldCat]) delete m[oldCat]; }
    if (cat !== 'outros') m[cat] = (m[cat] || 0) + 1;
    if (!Object.keys(m).length) delete state.aprendido.palavras[w];
  }
}

// ───────────────────────── Operações ─────────────────────────
function addExpense({ desc, valor, data, cat, metodo, parcelas = 1, nota = '' }) {
  const created = [];
  const group = parcelas > 1 ? uid() : undefined;
  const base = parseISO(data);
  const each = Math.round((valor / parcelas) * 100) / 100;
  for (let k = 0; k < parcelas; k++) {
    const d = new Date(base.getFullYear(), base.getMonth() + k, Math.min(base.getDate(), new Date(base.getFullYear(), base.getMonth() + k + 1, 0).getDate()));
    // última parcela absorve o arredondamento
    const v = k === parcelas - 1 ? Math.round((valor - each * (parcelas - 1)) * 100) / 100 : each;
    const g = { id: uid(), desc: parcelas > 1 ? `${desc} (${k + 1}/${parcelas})` : desc, valor: v, data: isoDate(d), cat, metodo, nota, criado: Date.now() };
    if (group) g.grupo = group;
    state.gastos.push(g);
    created.push(g);
  }
  learn(desc, cat);
  save();
  return created;
}

function runRecurring() {
  const now = new Date();
  let added = 0;
  for (const f of state.fixos) {
    // lança o mês atual (e o anterior, caso o app não tenha sido aberto)
    for (const off of [-1, 0]) {
      const mk = shiftMonth(monthKey(now), off);
      const key = `${f.id}@${mk}`;
      if (state.fixosLancados[key]) continue;
      if (f.inicio && mk < f.inicio) continue;
      const [y, m] = mk.split('-').map(Number);
      const day = Math.min(f.dia || 1, daysInMonth(mk));
      const d = new Date(y, m - 1, day);
      if (d > now) continue;
      state.gastos.push({ id: uid(), desc: f.desc, valor: f.valor, data: isoDate(d), cat: f.cat, metodo: f.metodo || '', criado: Date.now(), fixo: f.id });
      state.fixosLancados[key] = true;
      added++;
    }
  }
  if (added) { save(); toast(`${added} gasto${added > 1 ? 's' : ''} fixo${added > 1 ? 's' : ''} lançado${added > 1 ? 's' : ''} automaticamente`); }
}

const inMonth = (key) => state.gastos.filter(g => g.data.startsWith(key));
const sum = arr => Math.round(arr.reduce((a, g) => a + g.valor, 0) * 100) / 100;

// ───────────────────────── Entrada rápida ─────────────────────────
let pending = null; // { parsed, cat, catManual }

function updatePreview() {
  const text = $('#quickInput').value;
  const box = $('#preview');
  if (!text.trim()) { box.hidden = true; $('#quickHint').hidden = false; pending = null; return; }
  const p = parseText(text);
  const auto = categorize(p.desc);
  if (!pending || !pending.catManual) pending = { parsed: p, cat: auto.cat, catManual: false };
  else pending.parsed = p;
  const c = catById(pending.cat);
  const parts = [];
  parts.push(`<span class="chip value">${p.valor ? money(p.valor) : 'sem valor'}</span>`);
  if (p.parcelas > 1 && p.valor) parts.push(`<span class="chip">${p.parcelas}× de ${money(p.valor / p.parcelas)}</span>`);
  parts.push(`<button type="button" class="chip" id="previewCat" title="Trocar categoria">${c.emoji} ${escapeHtml(c.nome)} ▾</button>`);
  parts.push(`<span class="chip">📅 ${relDay(p.data)}</span>`);
  if (p.metodo) parts.push(`<span class="chip">💳 ${METHODS[p.metodo].nome}</span>`);
  if (p.desc) parts.push(`<span class="chip">“${escapeHtml(p.desc)}”</span>`);
  box.innerHTML = parts.join('');
  box.hidden = false;
  $('#quickHint').hidden = true;
  $('#previewCat').onclick = () => toggleCatPicker();
}

function toggleCatPicker() {
  const box = $('#preview');
  const ex = $('.cat-picker', box);
  if (ex) { ex.remove(); return; }
  const picker = document.createElement('div');
  picker.className = 'cat-picker';
  for (const c of state.categorias) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (c.id === pending.cat ? ' sel' : '');
    b.textContent = `${c.emoji} ${c.nome}`;
    b.onclick = () => { pending.cat = c.id; pending.catManual = true; updatePreview(); $('#quickInput').focus(); };
    picker.appendChild(b);
  }
  box.appendChild(picker);
}

function submitQuick(e) {
  e.preventDefault();
  const input = $('#quickInput');
  if (!input.value.trim()) { input.focus(); return; }
  if (!pending) updatePreview();
  const p = pending.parsed;
  if (!p.valor) { toast('Faltou o valor — ex.: “almoço 32,90”'); input.focus(); return; }
  const desc = p.desc || catById(pending.cat).nome;
  const created = addExpense({ desc, valor: p.valor, data: p.data, cat: pending.cat, metodo: p.metodo, parcelas: p.parcelas });
  input.value = '';
  pending = null;
  updatePreview();
  const c = catById(created[0].cat);
  toast(`${c.emoji} ${money(p.valor)} em ${c.nome}`, 'desfazer', () => {
    const ids = new Set(created.map(g => g.id));
    state.gastos = state.gastos.filter(g => !ids.has(g.id));
    save(); render();
  });
  if (created[0].data.slice(0, 7) !== ui.month) ui.month = created[0].data.slice(0, 7);
  render();
  input.focus();
}

// ───────────────────────── Renderização ─────────────────────────
function render() {
  $('#monthLabel').textContent = monthName(ui.month);
  $('#nextMonth').style.visibility = ui.month >= monthKey(new Date()) ? 'hidden' : 'visible';
  renderHome();
  const v = $('.view.active').id;
  if (v === 'view-list') renderList();
  if (v === 'view-analysis') renderAnalysis();
  if (v === 'view-settings') renderSettings();
}

function monthStats(key) {
  const items = inMonth(key);
  const total = sum(items);
  const isCurrent = key === monthKey(new Date());
  const dim = daysInMonth(key);
  const today = new Date().getDate();
  const elapsed = isCurrent ? today : dim;
  const prevKey = shiftMonth(key, -1);
  const prevItems = inMonth(prevKey);
  // compara com o mesmo período do mês anterior
  const prevSame = isCurrent ? sum(prevItems.filter(g => +g.data.slice(8) <= today)) : sum(prevItems);
  // Previsão: só o gasto "do dia a dia" é extrapolado; fixos, parcelas e compras grandes contam uma vez.
  const vals = items.map(g => g.valor).sort((a, b) => a - b);
  const median = vals.length ? vals[Math.floor(vals.length / 2)] : 0;
  const bigLimit = Math.max(150, median * 4);
  const oneOff = sum(items.filter(g => g.fixo || g.grupo || g.valor >= bigLimit));
  const daily = total - oneOff;
  const pendingFixed = state.fixos.filter(f => !state.fixosLancados[`${f.id}@${key}`]).reduce((a, f) => a + f.valor, 0);
  const projection = isCurrent && elapsed > 0 ? Math.round(oneOff + pendingFixed + daily / elapsed * dim) : total;
  const budget = state.categorias.reduce((a, c) => a + (+c.orcamento || 0), 0);
  return { items, total, isCurrent, dim, elapsed, prevSame, prevTotal: sum(prevItems), projection, budget, avg: elapsed ? total / elapsed : 0 };
}

function byCategory(items) {
  const m = {};
  for (const g of items) m[g.cat] = (m[g.cat] || 0) + g.valor;
  return Object.entries(m).map(([id, v]) => ({ cat: catById(id), id, valor: Math.round(v * 100) / 100 })).sort((a, b) => b.valor - a.valor);
}

function renderHome() {
  const s = monthStats(ui.month);
  $('#heroTotal').textContent = money(s.total);
  let sub = '';
  if (s.prevSame > 0) {
    const pct = Math.round((s.total - s.prevSame) / s.prevSame * 100);
    const cls = pct > 0 ? 'delta-up' : 'delta-down';
    sub = `<span class="${cls}">${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)}%</span> vs ${s.isCurrent ? 'mesmo período de ' : ''}${monthName(shiftMonth(ui.month, -1), true)} (${money(s.prevSame)})`;
  } else sub = s.items.length ? `${s.items.length} gasto${s.items.length > 1 ? 's' : ''} no mês` : 'Nenhum gasto ainda neste mês.';
  $('#heroSub').innerHTML = sub;

  const hb = $('#heroBudget');
  if (s.budget > 0) {
    const pct = s.total / s.budget * 100;
    const over = s.total > s.budget;
    hb.innerHTML = `<div class="bar-track"><div class="bar-fill ${over ? 'over' : ''}" style="width:${Math.min(100, pct)}%"></div></div>
      <div class="budget-row"><span>${over ? '⚠️ Passou ' + money(s.total - s.budget) + ' do orçamento' : 'Sobram ' + money(s.budget - s.total)}</span><span>orçamento ${money(s.budget)}</span></div>`;
  } else hb.innerHTML = '';

  const stats = [];
  stats.push(['Média/dia', moneyShort(s.avg)]);
  if (s.isCurrent) stats.push(['Previsão do mês', moneyShort(s.projection)]);
  else stats.push(['Mês anterior', moneyShort(s.prevTotal)]);
  if (s.isCurrent && s.budget > 0) {
    const left = Math.max(0, s.budget - s.total);
    const daysLeft = s.dim - s.elapsed + 1;
    stats.push(['Pode gastar/dia', moneyShort(left / daysLeft)]);
  } else stats.push(['Lançamentos', String(s.items.length)]);
  $('#stats').innerHTML = stats.map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v num">${v}</div></div>`).join('');

  const cats = byCategory(s.items).slice(0, 5);
  $('#homeCats').innerHTML = cats.length ? catBars(cats, s.total, false) : '<div class="empty">Seus gastos por categoria aparecem aqui.</div>';
  bindCatBars($('#homeCats'));

  const recent = [...s.items].sort((a, b) => b.data.localeCompare(a.data) || b.criado - a.criado).slice(0, 6);
  $('#recentList').innerHTML = recent.length ? recent.map(txRow).join('') : '<li class="empty">Digite seu primeiro gasto lá em cima ☝️</li>';
  bindTx($('#recentList'));
}

function catBars(cats, total, withBudget) {
  const max = Math.max(...cats.map(c => Math.max(c.valor, withBudget ? (+c.cat.orcamento || 0) : 0)), 1);
  return '<div class="cat-bars">' + cats.map(c => {
    const b = +c.cat.orcamento || 0;
    const over = withBudget && b > 0 && c.valor > b;
    const pct = total ? Math.round(c.valor / total * 100) : 0;
    let note = '';
    if (withBudget && b > 0) note = over ? `<div class="note over">⚠️ ${money(c.valor - b)} acima do orçamento (${money(b)})</div>` : `<div class="note">${Math.round(c.valor / b * 100)}% de ${money(b)}</div>`;
    return `<button class="cat-bar" data-cat="${c.id}" aria-label="${escapeHtml(c.cat.nome)}: ${money(c.valor)}">
      <span class="name">${c.cat.emoji} ${escapeHtml(c.cat.nome)}</span>
      <span class="val">${money(c.valor)}<small>${pct}%</small></span>
      <span class="track"><span class="fill ${over ? 'over' : ''}" style="display:block;width:${c.valor / max * 100}%"></span>${withBudget && b > 0 ? `<span class="mark" style="left:calc(${b / max * 100}% - 1px)"></span>` : ''}</span>
      ${note}
    </button>`;
  }).join('') + '</div>';
}
function bindCatBars(el) {
  $$('.cat-bar', el).forEach(b => b.onclick = () => { ui.cat = b.dataset.cat; ui.search = ''; go('list'); });
}

function txRow(g) {
  const c = catById(g.cat);
  const meta = [relDay(g.data), c.nome, g.metodo && METHODS[g.metodo] ? METHODS[g.metodo].nome : '', g.fixo ? 'fixo' : ''].filter(Boolean).join(' · ');
  return `<li class="tx" data-id="${g.id}"><div class="em">${c.emoji}</div><div class="info"><div class="d">${escapeHtml(g.desc)}</div><div class="meta">${escapeHtml(meta)}</div></div><div class="amt">${money(g.valor)}</div></li>`;
}
function bindTx(el) { $$('.tx', el).forEach(li => li.onclick = () => openExpense(li.dataset.id)); }

function renderList() {
  const sel = $('#catFilter');
  sel.innerHTML = '<option value="">Todas categorias</option>' + state.categorias.map(c => `<option value="${c.id}">${c.emoji} ${escapeHtml(c.nome)}</option>`).join('');
  sel.value = ui.cat;
  $('#searchInput').value = ui.search;
  const q = norm(ui.search);
  // Com busca, procura em todos os meses
  let items = q ? state.gastos : inMonth(ui.month);
  if (ui.cat) items = items.filter(g => g.cat === ui.cat);
  if (q) items = items.filter(g => norm(g.desc).includes(q) || norm(catById(g.cat).nome).includes(q) || norm(g.nota).includes(q) || String(g.valor).includes(q.replace(',', '.')));
  items = [...items].sort((a, b) => b.data.localeCompare(a.data) || b.criado - a.criado);
  $('#listTotal').textContent = items.length ? `${items.length} gasto${items.length > 1 ? 's' : ''} · ${money(sum(items))}${q ? ' (todos os meses)' : ''}` : '';
  const groups = {};
  for (const g of items) (groups[g.data] || (groups[g.data] = [])).push(g);
  $('#fullList').innerHTML = items.length ? Object.entries(groups).map(([d, gs]) => {
    const dt = parseISO(d);
    const label = `${relDay(d)}${relDay(d).length < 6 ? ', ' + dt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '') : ''}`;
    return `<div class="day-group"><div class="day-head"><span>${label}</span><span class="num">${money(sum(gs))}</span></div><ul class="tx-list">${gs.map(txRow).join('')}</ul></div>`;
  }).join('') : `<div class="empty">${q || ui.cat ? 'Nada encontrado.' : 'Nenhum gasto neste mês.'}</div>`;
  bindTx($('#fullList'));
}

// ── Análise
function renderAnalysis() {
  const s = monthStats(ui.month);
  const cats = byCategory(s.items);
  // categorias com orçamento mas sem gasto também aparecem
  for (const c of state.categorias) if (+c.orcamento > 0 && !cats.some(x => x.id === c.id)) cats.push({ cat: c, id: c.id, valor: 0 });
  $('#catChart').innerHTML = cats.length ? catBars(cats, s.total, true) : '<div class="empty">Sem gastos neste mês.</div>';
  bindCatBars($('#catChart'));

  // Diário
  const daily = new Array(s.dim).fill(0);
  for (const g of s.items) daily[+g.data.slice(8) - 1] += g.valor;
  const dLabels = daily.map((_, i) => String(i + 1));
  const dTips = daily.map((v, i) => [`${i + 1} de ${monthName(ui.month, true)}`, v]);
  $('#dailyChart').innerHTML = s.total ? columnChart(daily, dLabels, dTips, { width: $('#dailyChart').clientWidth, avg: s.avg, limitTo: s.isCurrent ? s.elapsed : s.dim, labelEvery: 5 }) : '<div class="empty">Sem dados.</div>';

  // 6 meses
  const keys = [...Array(6)].map((_, i) => shiftMonth(ui.month, i - 5));
  const vals = keys.map(k => sum(inMonth(k)));
  $('#trendChart').innerHTML = vals.some(v => v) ? columnChart(vals, keys.map(k => monthName(k, true)), keys.map((k, i) => [monthName(k), vals[i]]), { width: $('#trendChart').clientWidth, highlight: 5, valueLabels: true }) : '<div class="empty">Sem dados.</div>';
  bindTips();

  // Métodos
  const mm = {};
  for (const g of s.items) { const k = g.metodo || ''; mm[k] = (mm[k] || 0) + g.valor; }
  const rows = Object.entries(mm).sort((a, b) => b[1] - a[1]);
  $('#methodTable').innerHTML = rows.length ? `<table class="simple">${rows.map(([k, v]) => `<tr><td>${k ? METHODS[k].nome : 'Não informado'}</td><td class="r">${money(v)}</td><td class="p">${Math.round(v / s.total * 100)}%</td></tr>`).join('')}</table>` : '<div class="empty">Sem dados.</div>';

  const top = [...s.items].sort((a, b) => b.valor - a.valor).slice(0, 5);
  $('#topList').innerHTML = top.length ? top.map(txRow).join('') : '<li class="empty">Sem dados.</li>';
  bindTx($('#topList'));

  $('#insights').innerHTML = insights(s, cats).map(([e, t]) => `<li><span>${e}</span><span>${t}</span></li>`).join('') || '<li class="muted">Adicione alguns gastos para ver análises.</li>';
}

function insights(s, cats) {
  const out = [];
  if (!s.items.length) return out;
  const prevCats = Object.fromEntries(byCategory(inMonth(shiftMonth(ui.month, -1))).map(c => [c.id, c.valor]));
  if (cats[0] && cats[0].valor) out.push(['🏆', `<b>${escapeHtml(cats[0].cat.nome)}</b> é onde mais vai seu dinheiro: ${money(cats[0].valor)} (${Math.round(cats[0].valor / s.total * 100)}% do mês).`]);
  if (s.isCurrent && s.elapsed >= 3) out.push(['🔮', `No ritmo atual, o mês deve fechar em <b>${money(s.projection)}</b>${s.budget ? (s.projection > s.budget ? ` — <b>${money(s.projection - s.budget)}</b> acima do orçamento.` : `, dentro do orçamento.`) : '.'}`]);
  // maiores variações por categoria (meses fechados comparam total; mês atual compara proporcionalmente)
  const factor = s.isCurrent ? s.elapsed / s.dim : 1;
  const changes = cats.filter(c => c.valor > 0 && prevCats[c.id] > 0).map(c => ({ c, d: c.valor - prevCats[c.id] * factor, p: (c.valor - prevCats[c.id] * factor) / (prevCats[c.id] * factor) }))
    .filter(x => Math.abs(x.d) > 30 && Math.abs(x.p) > 0.25).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 2);
  for (const x of changes) out.push([x.d > 0 ? '📈' : '📉', `<b>${escapeHtml(x.c.cat.nome)}</b> está ${Math.round(Math.abs(x.p) * 100)}% ${x.d > 0 ? 'acima' : 'abaixo'} do ${s.isCurrent ? 'ritmo do' : ''} mês passado.`]);
  for (const c of cats) if (+c.cat.orcamento > 0 && c.valor > c.cat.orcamento) out.push(['⚠️', `Estourou o orçamento de <b>${escapeHtml(c.cat.nome)}</b> em ${money(c.valor - c.cat.orcamento)}.`]);
  // gastos frequentes pequenos
  const freq = {};
  for (const g of s.items) { const k = norm(g.desc).replace(/\s*\(\d+\/\d+\)$/, ''); (freq[k] || (freq[k] = { n: 0, v: 0, d: g.desc })).n++; freq[k].v += g.valor; }
  const habit = Object.values(freq).filter(f => f.n >= 4).sort((a, b) => b.v - a.v)[0];
  if (habit) out.push(['🔁', `<b>${escapeHtml(habit.d)}</b> apareceu ${habit.n}× este mês, somando ${money(habit.v)}.`]);
  const weekend = s.items.filter(g => [0, 6].includes(parseISO(g.data).getDay()));
  if (s.items.length >= 10 && weekend.length) {
    const share = sum(weekend) / s.total;
    if (share > 0.4) out.push(['🎈', `${Math.round(share * 100)}% dos gastos foram em fins de semana.`]);
  }
  const uncategorized = s.items.filter(g => g.cat === 'outros');
  if (uncategorized.length >= 3) out.push(['🏷️', `${uncategorized.length} gastos estão em “Outros”. Toque neles e escolha a categoria — eu aprendo para as próximas vezes.`]);
  return out;
}

// Gráfico de colunas em SVG (um tom, dados ancorados na linha de base, com tooltip).
function columnChart(values, labels, tips, opt = {}) {
  const W = Math.max(260, opt.width || 600), H = 170, padL = 4, padR = 4, padT = opt.valueLabels ? 22 : 10, padB = 22;
  const n = values.length;
  const max = Math.max(...values, opt.avg || 0, 1);
  const step = (W - padL - padR) / n;
  const bw = Math.max(2, Math.min(step - 2, opt.valueLabels ? 40 : 12));
  const y = v => padT + (H - padT - padB) * (1 - v / max);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de colunas">`;
  // grade recessiva
  for (const f of [0.5, 1]) svg += `<line class="grid" x1="${padL}" x2="${W - padR}" y1="${y(max * f)}" y2="${y(max * f)}"/>`;
  values.forEach((v, i) => {
    const cx = padL + step * i + step / 2;
    const h = H - padB - y(v);
    const dim = (opt.highlight != null && i !== opt.highlight) || (opt.limitTo != null && i >= opt.limitTo);
    if (v > 0) {
      const r = Math.min(4, bw / 2, h);
      const x0 = cx - bw / 2, yb = H - padB, yt = y(v);
      svg += `<path class="bar ${dim ? 'dim' : ''}" d="M${x0},${yb} V${yt + r} Q${x0},${yt} ${x0 + r},${yt} H${x0 + bw - r} Q${x0 + bw},${yt} ${x0 + bw},${yt + r} V${yb} Z"/>`;
    }
    svg += `<rect class="hit" x="${padL + step * i}" y="${padT}" width="${step}" height="${H - padT}" data-tip="${escapeHtml(tips[i][0])}" data-val="${tips[i][1]}" tabindex="-1"/>`;
    if (!opt.labelEvery || i === 0 || (i + 1) % opt.labelEvery === 0) svg += `<text x="${cx}" y="${H - 6}" text-anchor="middle">${escapeHtml(labels[i])}</text>`;
    if (opt.valueLabels && v > 0) svg += `<text class="lbl" x="${cx}" y="${y(v) - 6}" text-anchor="middle">${escapeHtml(moneyShort(v).replace('R$ ', ''))}</text>`;
  });
  if (opt.avg) svg += `<line class="avg" x1="${padL}" x2="${W - padR}" y1="${y(opt.avg)}" y2="${y(opt.avg)}"/><text x="${W - padR}" y="${Math.max(10, y(opt.avg) - 4)}" text-anchor="end">média/dia ${escapeHtml(money(opt.avg))}</text>`;
  svg += `<line class="base" x1="${padL}" x2="${W - padR}" y1="${H - padB}" y2="${H - padB}"/></svg>`;
  return svg;
}
function bindTips() {
  const tip = $('#tooltip');
  $$('.chart .hit').forEach(r => {
    const show = e => {
      tip.innerHTML = `<b>${money(+r.dataset.val)}</b>${escapeHtml(r.dataset.tip)}`;
      const box = r.getBoundingClientRect();
      tip.style.left = Math.max(60, Math.min(innerWidth - 60, box.left + box.width / 2)) + 'px';
      tip.style.top = (r.closest('svg').getBoundingClientRect().top + 8) + 'px';
      tip.hidden = false;
    };
    r.addEventListener('pointerenter', show);
    r.addEventListener('pointerdown', show);
    r.addEventListener('pointerleave', () => tip.hidden = true);
  });
}
let resizeT; addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if ($('#view-analysis').classList.contains('active')) renderAnalysis(); }, 150); });
document.addEventListener('scroll', () => { $('#tooltip').hidden = true; }, { passive: true });

// ── Ajustes
function renderSettings() {
  const counts = {};
  for (const g of state.gastos) counts[g.cat] = (counts[g.cat] || 0) + 1;
  $('#catList').innerHTML = state.categorias.map(c => `<li data-id="${c.id}"><span class="em">${c.emoji}</span><span class="n">${escapeHtml(c.nome)}<small>${counts[c.id] || 0} gastos · ${(c.palavras || []).slice(0, 6).map(escapeHtml).join(', ')}${(c.palavras || []).length > 6 ? '…' : ''}</small></span><span class="b">${+c.orcamento ? money(c.orcamento) + '/mês' : ''}</span></li>`).join('');
  $$('#catList li').forEach(li => li.onclick = () => openCategory(li.dataset.id));
  $('#recList').innerHTML = state.fixos.length ? state.fixos.map(f => `<li data-id="${f.id}"><span class="em">${catById(f.cat).emoji}</span><span class="n">${escapeHtml(f.desc)}<small>todo dia ${f.dia}</small></span><span class="b">${money(f.valor)}</span></li>`).join('') : '<li class="muted small" style="cursor:default">Nenhum gasto fixo cadastrado.</li>';
  $$('#recList li[data-id]').forEach(li => li.onclick = () => openRecurring(li.dataset.id));
  const bytes = new Blob([localStorage.getItem(KEY) || '']).size;
  $('#storageInfo').textContent = `${state.gastos.length} gastos salvos neste aparelho · ${(bytes / 1024).toFixed(0)} KB`;
}

// ───────────────────────── Folhas de edição ─────────────────────────
function catOptions(sel) { return state.categorias.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.emoji} ${escapeHtml(c.nome)}</option>`).join(''); }
function methodOptions(sel) { return '<option value="">—</option>' + Object.entries(METHODS).map(([k, m]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${m.nome}</option>`).join(''); }
function openSheet(html, onSubmit) {
  const dlg = $('#sheet'), form = $('#sheetForm');
  form.innerHTML = html;
  form.onsubmit = e => {
    const action = e.submitter && e.submitter.value;
    if (action === 'cancel') return;
    e.preventDefault();
    if (onSubmit(action, new FormData(form)) !== false) dlg.close();
  };
  dlg.showModal();
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
}

function openExpense(id) {
  const g = state.gastos.find(x => x.id === id);
  if (!g) return;
  openSheet(`<h3>Editar gasto</h3>
    <div class="field"><label>Descrição</label><input name="desc" value="${escapeHtml(g.desc)}" required></div>
    <div class="field-row">
      <div class="field"><label>Valor (R$)</label><input name="valor" inputmode="decimal" value="${String(g.valor).replace('.', ',')}" required></div>
      <div class="field"><label>Data</label><input name="data" type="date" value="${g.data}" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Categoria</label><select name="cat">${catOptions(g.cat)}</select></div>
      <div class="field"><label>Pagamento</label><select name="metodo">${methodOptions(g.metodo)}</select></div>
    </div>
    <div class="field"><label>Observação</label><textarea name="nota">${escapeHtml(g.nota || '')}</textarea></div>
    <div class="sheet-actions"><button class="btn danger" value="delete">Excluir${g.grupo ? ' parcelas' : ''}</button><div class="right"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn solid" value="save">Salvar</button></div></div>`,
    (action, fd) => {
      if (action === 'delete') {
        const removed = state.gastos.filter(x => g.grupo ? x.grupo === g.grupo && x.data >= g.data : x.id === g.id);
        const ids = new Set(removed.map(x => x.id));
        state.gastos = state.gastos.filter(x => !ids.has(x.id));
        save(); render();
        toast(removed.length > 1 ? `${removed.length} parcelas excluídas` : 'Gasto excluído', 'desfazer', () => { state.gastos.push(...removed); save(); render(); });
        return;
      }
      const valor = parseAmount(fd.get('valor').trim());
      if (!valor) { toast('Valor inválido'); return false; }
      const newCat = fd.get('cat'), oldCat = g.cat;
      Object.assign(g, { desc: fd.get('desc').trim(), valor, data: fd.get('data'), cat: newCat, metodo: fd.get('metodo'), nota: fd.get('nota').trim() });
      learn(g.desc.replace(/\s*\(\d+\/\d+\)$/, ''), newCat, oldCat);
      save(); render();
      toast('Salvo');
    });
}

function openCategory(id) {
  const isNew = !id;
  const c = isNew ? { id: '', nome: '', emoji: '🏷️', palavras: [], orcamento: '' } : state.categorias.find(x => x.id === id);
  openSheet(`<h3>${isNew ? 'Nova categoria' : 'Editar categoria'}</h3>
    <div class="field-row" style="grid-template-columns: 80px 1fr">
      <div class="field"><label>Emoji</label><input name="emoji" value="${escapeHtml(c.emoji)}" maxlength="4" style="text-align:center;font-size:20px"></div>
      <div class="field"><label>Nome</label><input name="nome" value="${escapeHtml(c.nome)}" required></div>
    </div>
    <div class="field"><label>Orçamento mensal (R$, opcional)</label><input name="orcamento" inputmode="decimal" value="${c.orcamento ? String(c.orcamento).replace('.', ',') : ''}" placeholder="ex.: 800"></div>
    <div class="field"><label>Palavras-chave (separadas por vírgula)</label><textarea name="palavras" placeholder="ex.: academia, smartfit">${escapeHtml((c.palavras || []).join(', '))}</textarea></div>
    <div class="sheet-actions">${!isNew && c.id !== 'outros' ? '<button class="btn danger" value="delete">Excluir</button>' : '<span></span>'}<div class="right"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn solid" value="save">Salvar</button></div></div>`,
    (action, fd) => {
      if (action === 'delete') {
        if (!confirm(`Excluir “${c.nome}”? Os gastos dela vão para “Outros”.`)) return false;
        state.gastos.forEach(g => { if (g.cat === c.id) g.cat = 'outros'; });
        state.categorias = state.categorias.filter(x => x.id !== c.id);
        (state.removidas || (state.removidas = [])).push(c.id);
        save(); render(); return;
      }
      const data = {
        nome: fd.get('nome').trim(), emoji: fd.get('emoji').trim() || '🏷️',
        orcamento: parseAmount(fd.get('orcamento').trim()) || 0,
        palavras: fd.get('palavras').split(',').map(s => norm(s)).filter(Boolean),
      };
      if (isNew) state.categorias.splice(state.categorias.length - 1, 0, { id: uid(), ...data });
      else Object.assign(c, data);
      save(); render();
    });
}

function openRecurring(id) {
  const isNew = !id;
  const f = isNew ? { desc: '', valor: '', dia: new Date().getDate(), cat: '', metodo: '' } : state.fixos.find(x => x.id === id);
  openSheet(`<h3>${isNew ? 'Novo gasto fixo' : 'Editar gasto fixo'}</h3>
    <div class="field"><label>Descrição</label><input name="desc" value="${escapeHtml(f.desc)}" placeholder="ex.: Aluguel" required></div>
    <div class="field-row">
      <div class="field"><label>Valor (R$)</label><input name="valor" inputmode="decimal" value="${f.valor ? String(f.valor).replace('.', ',') : ''}" required></div>
      <div class="field"><label>Dia do mês</label><input name="dia" type="number" min="1" max="31" value="${f.dia}" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Categoria</label><select name="cat"><option value="">automática</option>${catOptions(f.cat)}</select></div>
      <div class="field"><label>Pagamento</label><select name="metodo">${methodOptions(f.metodo)}</select></div>
    </div>
    <div class="sheet-actions">${!isNew ? '<button class="btn danger" value="delete">Excluir</button>' : '<span></span>'}<div class="right"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn solid" value="save">Salvar</button></div></div>`,
    (action, fd) => {
      if (action === 'delete') { state.fixos = state.fixos.filter(x => x.id !== f.id); save(); render(); return; }
      const valor = parseAmount(fd.get('valor').trim());
      if (!valor) { toast('Valor inválido'); return false; }
      const desc = fd.get('desc').trim();
      const data = { desc, valor, dia: Math.max(1, Math.min(31, +fd.get('dia'))), cat: fd.get('cat') || categorize(desc).cat, metodo: fd.get('metodo') };
      if (isNew) state.fixos.push({ id: uid(), inicio: monthKey(new Date()), ...data });
      else Object.assign(f, data);
      save(); runRecurring(); render();
    });
}

// ───────────────────────── Importar / exportar ─────────────────────────
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const firstLine = text.split(/\r?\n/)[0];
  const delim = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === delim) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}

const EN_MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const PT_MONTHS = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
function parseAnyDate(s) {
  s = norm(s).split('→')[0].trim();
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) { let y = +m[3]; if (y < 100) y += 2000; return isoDate(new Date(y, +m[2] - 1, +m[1])); }
  m = s.match(/^([a-z]{3})[a-z]*\.? (\d{1,2}),? (\d{4})/); // November 9, 2026
  if (m && m[1] in EN_MONTHS) return isoDate(new Date(+m[3], EN_MONTHS[m[1]], +m[2]));
  m = s.match(/^(\d{1,2}) de ([a-z]{3})[a-z]*\.? de (\d{4})/); // 9 de novembro de 2026
  if (m && m[2] in PT_MONTHS) return isoDate(new Date(+m[3], PT_MONTHS[m[2]], +m[1]));
  m = s.match(/^(\d{1,2}) ([a-z]{3})[a-z]*\.? (\d{4})/);
  if (m && (m[2] in PT_MONTHS || m[2] in EN_MONTHS)) return isoDate(new Date(+m[3], (PT_MONTHS[m[2]] ?? EN_MONTHS[m[2]]), +m[1]));
  const d = new Date(s);
  return isNaN(d) ? null : isoDate(d);
}
function parseMoneyCell(s) {
  const t = String(s).replace(/[^\d.,-]/g, '');
  if (!t) return null;
  // decide decimal: último separador com 1-2 dígitos depois
  const m = t.match(/[.,](\d{1,2})$/);
  let v;
  if (m) v = parseFloat(t.slice(0, -m[0].length).replace(/[.,]/g, '') + '.' + m[1]);
  else v = parseFloat(t.replace(/[.,]/g, ''));
  return isFinite(v) ? Math.abs(v) : null;
}

function matchCategory(name) {
  const n = norm(name);
  if (!n) return null;
  let c = state.categorias.find(x => norm(x.nome) === n) || state.categorias.find(x => norm(x.nome).includes(n) || n.includes(norm(x.nome)));
  if (!c) {
    const guess = categorize(name);
    if (guess.cat !== 'outros' && guess.certeza > 0.5) c = catById(guess.cat);
  }
  return c ? c.id : null;
}

function importCSV(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) { toast('CSV vazio'); return; }
  const head = rows[0].map(norm);
  const find = (...names) => head.findIndex(h => names.some(n => h === n || h.includes(n)));
  let iDesc = find('nome', 'name', 'descricao', 'description', 'gasto', 'item', 'titulo', 'title', 'o que');
  let iVal = find('valor', 'value', 'preco', 'price', 'amount', 'quantia', 'total', 'custo');
  let iDate = find('data', 'date', 'quando', 'created');
  const iCat = find('categoria', 'category', 'tipo', 'tag', 'tags');
  const iMet = find('pagamento', 'forma', 'metodo', 'method', 'cartao', 'conta');
  const iNote = find('obs', 'nota', 'notes', 'comentario');
  // heurísticas se não achar pelo nome
  const sample = rows.slice(1, 20);
  if (iVal < 0) iVal = head.findIndex((_, i) => sample.filter(r => parseMoneyCell(r[i]) != null && /\d/.test(r[i]) && !/[a-z]{3,}/i.test(r[i])).length > sample.length * 0.7);
  if (iDate < 0) iDate = head.findIndex((_, i) => i !== iVal && sample.filter(r => parseAnyDate(r[i] || '')).length > sample.length * 0.7);
  if (iDesc < 0) iDesc = head.findIndex((_, i) => i !== iVal && i !== iDate);
  if (iVal < 0) { toast('Não encontrei a coluna de valor no CSV'); return; }

  const known = new Set(state.gastos.map(g => `${g.data}|${norm(g.desc)}|${g.valor}`));
  let added = 0, skipped = 0, newCats = 0;
  for (const r of rows.slice(1)) {
    const valor = parseMoneyCell(r[iVal] || '');
    if (!valor) { skipped++; continue; }
    const desc = (r[iDesc] || '').trim() || 'Sem descrição';
    const data = (iDate >= 0 && parseAnyDate(r[iDate] || '')) || isoDate(new Date());
    let cat = null;
    if (iCat >= 0 && r[iCat] && r[iCat].trim()) {
      const name = r[iCat].split(',')[0].trim();
      cat = matchCategory(name);
      if (!cat) { // cria a categoria que existe no Notion
        const nc = { id: uid(), nome: name[0].toUpperCase() + name.slice(1), emoji: '🏷️', palavras: [] };
        state.categorias.splice(state.categorias.length - 1, 0, nc);
        cat = nc.id; newCats++;
      }
    }
    if (!cat) cat = categorize(desc).cat;
    let metodo = '';
    if (iMet >= 0 && r[iMet]) { const pm = parseText('x ' + r[iMet]).metodo; metodo = pm || ''; }
    const key = `${data}|${norm(desc)}|${valor}`;
    if (known.has(key)) { skipped++; continue; }
    known.add(key);
    state.gastos.push({ id: uid(), desc, valor, data, cat, metodo, nota: iNote >= 0 ? (r[iNote] || '').trim() : '', criado: Date.now() + added });
    if (iCat >= 0) learn(desc, cat);
    added++;
  }
  save(); render();
  toast(`${added} gastos importados${skipped ? `, ${skipped} ignorados (vazios ou repetidos)` : ''}${newCats ? `, ${newCats} categorias novas` : ''}`);
}

function download(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function exportCSV() {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [['Nome', 'Valor', 'Data', 'Categoria', 'Pagamento', 'Observação'].join(',')];
  for (const g of [...state.gastos].sort((a, b) => a.data.localeCompare(b.data))) {
    lines.push([q(g.desc), g.valor.toFixed(2), g.data, q(catById(g.cat).nome), q(g.metodo ? METHODS[g.metodo].nome : ''), q(g.nota || '')].join(','));
  }
  download(`gastos-${isoDate(new Date())}.csv`, '﻿' + lines.join('\n'), 'text/csv;charset=utf-8');
}

// ───────────────────────── Navegação & toast ─────────────────────────
function go(view) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
  $('#tooltip').hidden = true;
  scrollTo({ top: 0 });
  render();
}
let toastTimer;
function toast(msg, actionLabel, action) {
  const t = $('#toast');
  t.innerHTML = '';
  const span = document.createElement('span'); span.textContent = msg; t.appendChild(span);
  if (actionLabel) {
    const b = document.createElement('button'); b.textContent = actionLabel;
    b.onclick = () => { action(); t.hidden = true; };
    t.appendChild(b);
  }
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.hidden = true, actionLabel ? 6000 : 3000);
}

// ───────────────────────── Inicialização ─────────────────────────
function init() {
  ui.month = monthKey(new Date());
  $('#quickForm').addEventListener('submit', submitQuick);
  $('#quickInput').addEventListener('input', () => { if (pending) pending.catManual = pending.catManual && $('#quickInput').value.trim() !== ''; updatePreview(); });
  $('#prevMonth').onclick = () => { ui.month = shiftMonth(ui.month, -1); render(); };
  $('#nextMonth').onclick = () => { ui.month = shiftMonth(ui.month, 1); render(); };
  $$('.tab').forEach(t => t.onclick = () => { if (t.dataset.view === 'list') { ui.cat = ''; } go(t.dataset.view); });
  $$('[data-goto]').forEach(b => b.onclick = () => { ui.cat = ''; go(b.dataset.goto); });
  $('#searchInput').addEventListener('input', e => { ui.search = e.target.value; renderList(); $('#searchInput').focus(); });
  $('#catFilter').addEventListener('change', e => { ui.cat = e.target.value; renderList(); });
  $('#addCat').onclick = () => openCategory(null);
  $('#addRec').onclick = () => openRecurring(null);
  $('#exportCsv').onclick = exportCSV;
  $('#exportJson').onclick = () => download(`gastos-backup-${isoDate(new Date())}.json`, JSON.stringify(state, null, 1), 'application/json');
  $('#csvInput').onchange = async e => { const f = e.target.files[0]; if (f) importCSV(await f.text()); e.target.value = ''; };
  $('#jsonInput').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.gastos)) throw new Error('formato');
      if (!confirm(`Restaurar backup com ${data.gastos.length} gastos? Isso substitui os dados atuais.`)) return;
      localStorage.setItem(KEY, JSON.stringify(data));
      state = load(); render(); toast('Backup restaurado');
    } catch { toast('Arquivo de backup inválido'); }
    e.target.value = '';
  };
  $('#wipe').onclick = () => {
    if (!confirm('Apagar TODOS os gastos, categorias e aprendizados deste aparelho?')) return;
    if (!confirm('Tem certeza? Não dá para desfazer (a não ser que você tenha um backup).')) return;
    state = freshState(); save(); render(); toast('Tudo apagado');
  };
  // atalho: "/" foca a entrada
  document.addEventListener('keydown', e => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); go('home'); $('#quickInput').focus(); } });

  // ?add=texto (atalhos do iPhone / Android) → já lança o gasto
  const params = new URLSearchParams(location.search);
  const pre = params.get('add') || params.get('text');
  runRecurring();
  render();
  if (pre) { $('#quickInput').value = pre; updatePreview(); history.replaceState(null, '', location.pathname); }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}

if (typeof window !== 'undefined' && document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
