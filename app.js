/* Gastos — controle de gastos offline, com categorização automática.
 * Tudo roda no navegador; os dados ficam no localStorage deste aparelho. */
'use strict';

// ───────────────────────── Categorias padrão ─────────────────────────
// As palavras-chave são comparadas sem acento e em minúsculas.
const DEFAULT_CATEGORIES = [
  { id: 'mercado', nome: 'Mercado', emoji: '🛒', palavras: ['mercado', 'supermercado', 'feira', 'hortifruti', 'sacolao', 'acougue', 'padaria', 'pao', 'carrefour', 'assai', 'atacadao', 'pao de acucar', 'guanabara', 'mundial', 'prezunic', 'zona sul', 'st marche', 'oba', 'hirota', 'sams club', 'makro', 'leite', 'ovos', 'frutas', 'verdura', 'compras do mes', 'mercearia', 'emporio', 'quitanda', 'bistek', 'savegnago', 'angeloni', 'condor', 'muffato', 'sonda', 'tenda', 'comper', 'bretas', 'mateus'] },
  { id: 'comida', nome: 'Restaurante & Delivery', emoji: '🍔', palavras: ['ifood', 'rappi', 'delivery', 'restaurante', 'lanche', 'lanchonete', 'almoco', 'jantar', 'janta', 'cafe da manha', 'pizza', 'pizzaria', 'hamburguer', 'burger', 'mcdonalds', 'mc donalds', 'mcdonald', 'bk', 'burger king', 'subway', 'habibs', 'outback', 'madero', 'sushi', 'japones', 'temaki', 'acai', 'sorvete', 'sorveteria', 'cafe', 'cafeteria', 'starbucks', 'coxinha', 'pastel', 'salgado', 'marmita', 'quentinha', 'self service', 'rodizio', 'churrascaria', 'bar', 'boteco', 'cerveja', 'chopp', 'drink', 'bebida', 'refri', 'coca', 'doce', 'brigadeiro', 'bolo', 'kebab', 'esfiha', 'giraffas', 'spoleto', 'bobs', 'kfc', 'popeyes', 'ze delivery', 'aiqfome', '99food', 'keeta', 'food', 'comida', 'lanchinho', 'cantina', 'bandejao', 'tapioca', 'crepe', 'hot dog', 'cachorro quente', 'churros', 'petisco', 'milk shake', 'milkshake', 'milk moo', 'calzone', 'kalzone', 'energetico', 'chiclete', 'bala', 'salgadinho', 'cantina', 'churrasco', 'refrigerante', 'suco'] },
  { id: 'transporte', nome: 'Transporte', emoji: '🚗', palavras: ['uber', '99', '99pop', 'taxi', 'indrive', 'cabify', 'onibus', 'passagens', 'metro', 'trem', 'brt', 'vlt', 'bilhete unico', 'riocard', 'passagem', 'gasolina', 'combustivel', 'etanol', 'alcool', 'diesel', 'posto', 'shell', 'ipiranga', 'petrobras', 'br mania', 'estacionamento', 'zona azul', 'pedagio', 'sem parar', 'conectcar', 'veloe', 'oficina', 'mecanico', 'pneu', 'troca de oleo', 'lavagem', 'lava jato', 'ipva', 'licenciamento', 'multa', 'seguro carro', 'patinete', 'bike', 'moto', 'detran', 'bilhete'] },
  { id: 'moradia', nome: 'Moradia', emoji: '🏠', palavras: ['aluguel', 'condominio', 'iptu', 'reforma', 'pedreiro', 'eletricista', 'encanador', 'diarista', 'faxina', 'faxineira', 'empregada', 'moveis', 'movel', 'sofa', 'colchao', 'decoracao', 'leroy', 'telhanorte', 'tok stok', 'tokstok', 'etna', 'camicado', 'material de construcao', 'utensilios', 'produto de limpeza', 'limpeza', 'lavanderia', 'gas', 'botijao', 'mudanca', 'chaveiro', 'chave', 'copia chave', 'dedetizacao', 'financiamento', 'prestacao casa'] },
  { id: 'contas', nome: 'Contas', emoji: '💡', palavras: ['luz', 'energia', 'enel', 'light', 'cemig', 'copel', 'celesc', 'coelba', 'cpfl', 'equatorial', 'neoenergia', 'agua', 'sabesp', 'cedae', 'copasa', 'sanepar', 'embasa', 'internet', 'wifi', 'vivo', 'claro', 'tim', 'celular', 'telefone', 'plano celular', 'recarga', 'fibra', 'conta de luz', 'conta de agua', 'boleto', 'fatura', 'cartao', 'fatura cartao', 'pagar o cartao', 'cartao de credito', 'tarifa', 'anuidade', 'juros', 'iof', 'imposto', 'irpf', 'darf', 'mei', 'taxa', 'cartorio'] },
  { id: 'saude', nome: 'Saúde', emoji: '💊', palavras: ['farmacia', 'remedio', 'medicamento', 'drogasil', 'raia', 'drogaria', 'pague menos', 'pacheco', 'panvel', 'medico', 'consulta', 'dentista', 'odonto', 'exame', 'laboratorio', 'hospital', 'clinica', 'plano de saude', 'unimed', 'amil', 'sulamerica', 'bradesco saude', 'hapvida', 'notredame', 'psicologo', 'psicologa', 'terapia', 'terapeuta', 'fisioterapia', 'fisio', 'nutricionista', 'vacina', 'oculos', 'lente', 'otica', 'vitamina', 'suplemento', 'whey', 'creatina', 'academia', 'smartfit', 'smart fit', 'bluefit', 'crossfit', 'pilates', 'yoga', 'personal', 'natacao', 'gympass', 'wellhub', 'totalpass'] },
  { id: 'lazer', nome: 'Lazer', emoji: '🎉', palavras: ['cinema', 'pipoca', 'filme', 'teatro', 'show', 'ingresso', 'sympla', 'eventim', 'ticketmaster', 'festa', 'balada', 'role', 'parque', 'museu', 'jogo', 'game', 'steam', 'playstation', 'psn', 'xbox', 'nintendo', 'futebol', 'pelada', 'quadra', 'boliche', 'karaoke', 'praia', 'clube', 'passeio', 'happy hour', 'aniversario', 'cinemark', 'kinoplex', 'livro', 'livraria', 'amazon kindle', 'hobby', 'tabacaria', 'narguile', 'sinuca', 'volei', 'xadrez', 'esquenta', 'copao', 'ctg', 'festa junina', 'festas juninas', 'resenha', 'dia com', 'meu amor', 'namorada', 'namorado', 'date', 'encontro'] },
  { id: 'assinaturas', nome: 'Assinaturas', emoji: '📺', palavras: ['netflix', 'spotify', 'deezer', 'youtube premium', 'youtube', 'prime video', 'amazon prime', 'prime', 'disney', 'disney+', 'hbo', 'globoplay', 'paramount', 'apple tv', 'apple music', 'icloud', 'google one', 'google drive', 'dropbox', 'chatgpt', 'openai', 'claude', 'plano plus', 'anthropic', 'notion', 'canva', 'adobe', 'microsoft 365', 'office', 'assinatura', 'mensalidade app', 'twitch', 'crunchyroll', 'duolingo', 'tinder', 'bumble', 'linkedin premium', 'xbox game pass', 'game pass', 'ps plus', 'mubi', 'telecine', 'premiere', 'sky', 'kindle unlimited', 'audible', 'patreon'] },
  { id: 'compras', nome: 'Compras', emoji: '🛍️', palavras: ['roupa', 'roupas', 'camisa', 'camiseta', 'calca', 'bermuda', 'vestido', 'blusa', 'casaco', 'jaqueta', 'tenis', 'sapato', 'sandalia', 'chinelo', 'meia', 'cueca', 'calcinha', 'sutia', 'bolsa', 'mochila', 'relogio', 'acessorio', 'shein', 'shopee', 'aliexpress', 'temu', 'mercado livre', 'mercadolivre', 'amazon', 'magalu', 'magazine luiza', 'americanas', 'casas bahia', 'renner', 'riachuelo', 'cea', 'c&a', 'zara', 'hering', 'centauro', 'netshoes', 'decathlon', 'nike', 'adidas', 'shopping', 'loja', 'eletronico', 'celular novo', 'fone', 'carregador', 'cabo', 'notebook', 'computador', 'teclado', 'mouse', 'monitor', 'tv', 'kabum', 'fast shop', 'apple', 'iphone', 'samsung', 'xiaomi', 'papelaria', 'kalunga', 'havan', 'parcela tenis'] },
  { id: 'beleza', nome: 'Cuidados pessoais', emoji: '💇', palavras: ['cabelo', 'cabeleireiro', 'cabeleireira', 'barbeiro', 'barbearia', 'corte', 'salao', 'manicure', 'unha', 'sobrancelha', 'depilacao', 'estetica', 'maquiagem', 'make', 'perfume', 'boticario', 'natura', 'avon', 'sephora', 'eudora', 'oboticario', 'creme', 'shampoo', 'condicionador', 'sabonete', 'desodorante', 'skincare', 'protetor solar', 'higiene', 'escova de dente', 'pasta de dente', 'massagem', 'spa'] },
  { id: 'educacao', nome: 'Educação', emoji: '📚', palavras: ['faculdade', 'universidade', 'mensalidade', 'escola', 'colegio', 'curso', 'cursinho', 'aula', 'professor', 'ingles', 'idioma', 'udemy', 'alura', 'coursera', 'rocketseat', 'hotmart', 'material escolar', 'apostila', 'xerox', 'impressao', 'matricula', 'mba', 'certificacao', 'prova', 'vestibular', 'enem', 'concurso'] },
  { id: 'pets', nome: 'Pets', emoji: '🐶', palavras: ['pet', 'petshop', 'pet shop', 'petz', 'cobasi', 'racao', 'veterinario', 'vet', 'banho e tosa', 'tosa', 'areia gato', 'gato', 'cachorro', 'cao', 'petisco pet', 'vacina pet', 'antipulgas', 'bravecto', 'nexgard'] },
  { id: 'viagem', nome: 'Viagem', emoji: '✈️', palavras: ['viagem', 'hotel', 'pousada', 'airbnb', 'booking', 'hostel', 'passagem aerea', 'aviao', 'voo', 'latam', 'gol', 'azul', 'decolar', '123milhas', 'hurb', 'aluguel de carro', 'localiza', 'movida', 'unidas', 'rodoviaria', 'buser', 'clickbus', 'mala', 'seguro viagem', 'cambio', 'dolar', 'euro', 'passaporte', 'visto', 'turismo', 'excursao'] },
  { id: 'presentes', nome: 'Presentes & Doações', emoji: '🎁', palavras: ['presente', 'presentes', 'lembrancinha', 'doacao', 'dizimo', 'oferta', 'vaquinha', 'caridade', 'flores', 'floricultura', 'cesta', 'amigo secreto', 'cha de bebe', 'cha de panela', 'casamento'] },
  { id: 'outros', nome: 'Outros', emoji: '📦', palavras: [] },
  // ── Entradas (o que entra)
  { id: 'salario', tipo: 'entrada', nome: 'Salário', emoji: '💼', palavras: ['salario', 'holerite', 'contracheque', 'decimo terceiro', '13o', 'ferias', 'plr', 'adiantamento', 'clt'] },
  { id: 'mesada', tipo: 'entrada', nome: 'Mesada', emoji: '👛', palavras: ['mesada'] },
  { id: 'bolsa', tipo: 'entrada', nome: 'Bolsa & Estágio', emoji: '🎓', palavras: ['bolsa', 'bolsa de estudos', 'bolsa auxilio', 'estagio', 'jovem aprendiz', 'aprendiz', 'monitoria', 'pibic', 'iniciacao cientifica', 'auxilio estudantil', 'auxilio', 'pe de meia', 'pe-de-meia'] },
  { id: 'extra', tipo: 'entrada', nome: 'Extra & Freela', emoji: '🧰', palavras: ['freela', 'freelance', 'bico', 'job', 'trampo', 'renda extra', 'aula particular'] },
  { id: 'vendas', tipo: 'entrada', nome: 'Vendas', emoji: '🏷️', palavras: ['venda', 'vendi', 'olx', 'enjoei', 'marketplace', 'brecho', 'revenda'] },
  { id: 'reembolso', tipo: 'entrada', nome: 'Reembolsos', emoji: '↩️', palavras: ['reembolso', 'devolucao', 'estorno', 'cashback', 'me pagou', 'pagou de volta', 'me devolveu', 'racha', 'rachei'] },
  { id: 'entrada-outros', tipo: 'entrada', nome: 'Outras entradas', emoji: '💵', palavras: [] },
  // ── Investimentos (para onde vai o dinheiro guardado)
  { id: 'reserva', tipo: 'invest', nome: 'Reserva / Poupança', emoji: '🐷', palavras: ['poupanca', 'reserva', 'reserva de emergencia', 'porquinho', 'cofrinho', 'cofre'] },
  { id: 'caixinha', tipo: 'invest', nome: 'Caixinha / CDB', emoji: '🏦', palavras: ['caixinha', 'caixinhas', 'cdb', 'lci', 'lca', 'rdb', 'renda fixa', 'nubank', 'inter', 'picpay', 'mercado pago', 'c6'] },
  { id: 'tesouro', tipo: 'invest', nome: 'Tesouro Direto', emoji: '🏛️', palavras: ['tesouro', 'tesouro direto', 'selic', 'tesouro selic', 'ipca', 'tesouro ipca', 'prefixado', 'tesouro educa', 'renda+'] },
  { id: 'acoes', tipo: 'invest', nome: 'Ações & FIIs', emoji: '📈', palavras: ['acao', 'acoes', 'fii', 'fiis', 'etf', 'bolsa de valores', 'b3', 'dividendos', 'corretora', 'xp', 'rico', 'clear', 'btg', 'nuinvest', 'bova11', 'ivvb11', 'petr4', 'vale3', 'itsa4'] },
  { id: 'cripto', tipo: 'invest', nome: 'Cripto', emoji: '🪙', palavras: ['cripto', 'crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'usdt', 'solana', 'binance'] },
  { id: 'invest-outros', tipo: 'invest', nome: 'Outros investimentos', emoji: '💹', palavras: ['investimento', 'previdencia', 'consorcio'] },
];

// Tipos de lançamento. O tipo vem da categoria.
const TIPOS = {
  gasto: { nome: 'Gasto', plural: 'Gastos', emoji: '💸', outros: 'outros' },
  entrada: { nome: 'Entrada', plural: 'Entradas', emoji: '💰', outros: 'entrada-outros' },
  invest: { nome: 'Investimento', plural: 'Investimentos', emoji: '📈', outros: 'invest-outros' },
};
// palavras que dizem o tipo ("recebi", "guardei"…) e saem da descrição
const TRIGGERS = {
  entrada: ['recebi', 'recebido', 'recebimento', 'ganhei', 'entrou', 'caiu', 'entrada', 'receita'],
  invest: ['investi', 'investir', 'aporte', 'aportei', 'apliquei', 'aplicacao', 'guardei', 'guardar', 'poupei', 'separei', 'depositei'],
  resgate: ['resgatei', 'resgate', 'resgatar', 'saquei', 'retirei'],
};

const METHODS = {
  pix: { nome: 'Pix', palavras: ['pix'] },
  credito: { nome: 'Crédito', palavras: ['credito', 'cc', 'cartao', 'cartao de credito'] },
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
let ui = { month: '', search: '', cat: '', tipoForce: null, tipoFiltro: 'tudo' };

function freshState() {
  return { versao: 1, gastos: [], categorias: structuredClone(DEFAULT_CATEGORIES), aprendido: { frases: {}, palavras: {} }, fixos: [], fixosLancados: {}, saldos: {} };
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
const tipoCat = c => (c && c.tipo) || 'gasto';
const tipoOf = g => tipoCat(catById(g.cat));
const catsOf = t => state.categorias.filter(c => tipoCat(c) === t);
const signed = g => g.resgate ? -g.valor : g.valor;
function relDay(iso) {
  const today = isoDate(new Date());
  const y = isoDate(new Date(Date.now() - 864e5));
  if (iso === today) return 'hoje';
  if (iso === y) return 'ontem';
  const d = parseISO(iso);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '');
}

// ───────────────────────── Fala → texto ─────────────────────────
// Transforma o jeito que se fala ("gastei vinte e três reais no uber ontem",
// "café dois e cinquenta", "tênis em três vezes", "dia doze de outubro")
// no formato curto que o leitor entende ("23 reais uber ontem", "café 2,50"…).
// Vale para o microfone e também para o ditado do teclado.
const NUM_WORDS = {
  zero: 0, um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
  dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16, dezasseis: 16,
  dezessete: 17, dezasete: 17, dezoito: 18, dezenove: 19, dezanove: 19,
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, cincoenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
  cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, trezentas: 300, quatrocentos: 400, quatrocentas: 400,
  quinhentos: 500, quinhentas: 500, seiscentos: 600, seiscentas: 600, setecentos: 700, setecentas: 700,
  oitocentos: 800, oitocentas: 800, novecentos: 900, novecentas: 900,
};
const MONTH_IDX = { janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };
const MONEY_AFTER = new Set(['reais', 'real', 'conto', 'contos', 'pila', 'pilas', 'centavos', 'centavo', 'mil', 'vezes', 'vez', 'parcelas', 'x', 'de', 'r$']);
const placeOf = v => v >= 1000 ? 1000 : v >= 100 ? 100 : v >= 10 ? 10 : 1;

// junta "vinte e três" → 23, "mil e duzentos" → 1200, "2 mil e 500" → 2500
function numberWords(tokens) {
  const n = tokens.map(norm);
  const seqs = []; // { i, j (exclusivo), v, followedByMoney }
  for (let i = 0; i < n.length; i++) {
    const isW = t => t in NUM_WORDS;
    const isD = t => /^\d+$/.test(t);
    if (!isW(n[i]) && n[i] !== 'mil' && !(isD(n[i]) && n[i + 1] === 'mil')) continue;
    // "um"/"uma" sozinhos costumam ser artigo ("uma pizza")
    if ((n[i] === 'um' || n[i] === 'uma') && !['real', 'reais', 'mil', 'conto', 'centavo'].includes(n[i + 1])) continue;
    let total = 0, cur = 0, last = 0, j = i, words = 0;
    while (j < n.length) {
      const t = n[j];
      if (isW(t) || (isD(t) && j === i)) {
        const v = isW(t) ? NUM_WORDS[t] : +t;
        if (last && !(last > v && last % (placeOf(v) * 10) === 0)) break;
        cur += v; last = v; if (isW(t)) words++; j++;
      } else if (t === 'mil' && (cur || j === i)) {
        total += (cur || 1) * 1000; cur = 0; last = 1000; words++; j++;
      } else if (t === 'e' && last && j + 1 < n.length) {
        const nx = n[j + 1];
        const v = nx in NUM_WORDS ? NUM_WORDS[nx] : (/^\d+$/.test(nx) && words ? +nx : null);
        if (v == null || !(last > v && last % (placeOf(v) * 10) === 0)) break;
        j++; // pula o "e"; o número entra na próxima volta
        if (/^\d+$/.test(nx)) { cur += v; last = v; j++; }
      } else break;
    }
    if (!words) continue;
    seqs.push({ i, j, v: total + cur, money: MONEY_AFTER.has(n[j] || '') });
    i = j - 1;
  }
  // "dois e cinquenta" = 2,50 (duas sequências ligadas por "e", a segunda com 2 dígitos)
  for (let k = seqs.length - 1; k > 0; k--) {
    const a = seqs[k - 1], b = seqs[k];
    if (b.i === a.j + 1 && n[a.j] === 'e' && b.v >= 10 && b.v <= 99 && a.v < 1000) {
      a.v = `${a.v},${b.v}`; a.j = b.j; a.money = true; seqs.splice(k, 1);
    }
  }
  if (!seqs.length) return tokens;
  // Com dígitos no texto, só troca o que claramente é valor/parcela; sem dígitos, troca o que tiver jeito de valor
  // (ou o último número, que costuma ser o preço).
  const hasDigits = tokens.some((t, k) => /\d/.test(t) && !seqs.some(s => k >= s.i && k < s.j));
  let use = seqs.filter(s => s.money);
  if (!use.length && !hasDigits) use = [seqs[seqs.length - 1]];
  const out = [];
  for (let k = 0; k < tokens.length; k++) {
    const s = use.find(s => s.i === k);
    if (s) { out.push(String(s.v)); k = s.j - 1; } else out.push(tokens[k]);
  }
  return out;
}

const METHOD_WORDS = ['pix', 'credito', 'debito', 'dinheiro', 'cartao', 'vale', 'boleto', 'vr', 'va'];
const DATE_WORDS = ['hoje', 'ontem', 'anteontem', ...WEEKDAYS];

function falaParaTexto(text) {
  let s = ' ' + (text || '').replace(/\s+/g, ' ').trim() + ' ';
  if (!s.trim()) return '';
  s = s.replace(/(\d)\s*%/g, '$1%')
    .replace(/\bpor\s+cento\b/gi, '%')
    .replace(/\b(?:contos?|pilas?|mangos?)\b/gi, 'reais')
    .replace(/\bR\$\s*/gi, 'r$');
  let tokens = s.trim().split(' ');
  tokens = numberWords(tokens);
  s = ' ' + tokens.join(' ') + ' ';
  const tail = '(?=\\s+(?:(?:no|na|via|pelo|pela|em|de|com)\\s+)?(?:pix|cr[eé]dito|d[eé]bito|dinheiro|cart[aã]o|vale|boleto|hoje|ontem|anteontem|reais)\\b|\\s*$)';
  s = s
    // "café 2 e 50" (no fim ou antes de pix/ontem…) = 2,50
    .replace(new RegExp('(?<![\\d,.])(\\d{1,3})\\s+e\\s+(\\d{2})' + tail, 'gi'), '$1,$2')
    // "2 vírgula 50" / "dois e cinquenta centavos" / "10 reais e 50 centavos" / "50 centavos"
    .replace(/(\d+)\s+v[ií]rgula\s+(\d{1,2})\b/gi, '$1,$2')
    .replace(/(\d+)\s+(?:reais|real)\s+e\s+(\d{1,2})(?:\s+centavos?)?(?=\s)/gi, (_, a, b) => `${a},${b.padStart(2, '0')} reais`)
    .replace(/(\d+)\s+e\s+(\d{1,2})\s+centavos?(?=\s)/gi, (_, a, b) => `${a},${b.padStart(2, '0')}`)
    .replace(/(?<![\d,])(\d{1,2})\s+centavos?(?=\s)/gi, (_, b) => `0,${b.padStart(2, '0')}`)
    // parcelas: "em 3 vezes", "parcelado em 10", "3 parcelas", "em 3x"
    .replace(/\s(?:parcelad[oa]s?|dividid[oa]s?)\s+(?:em\s+)?(\d{1,2})(?:\s*(?:x|vezes|parcelas))?(?=\s)/gi, ' $1x')
    .replace(/\s(?:em\s+)?(\d{1,2})\s+(?:vezes|parcelas)(?:\s+(?:no|na)\s+(cart[aã]o|cr[eé]dito))?(?=\s)/gi, (_, a, c) => ` ${a}x${c ? ' crédito' : ''}`)
    // datas: "dia 12 de outubro (de 2026)", "12 de outubro"
    .replace(/\s(?:dia\s+)?(\d{1,2})\s+de\s+([a-zç]+)(?:\s+de\s+(\d{4}))?(?=\s)/gi, (m, d, mes, y) => {
      const mi = MONTH_IDX[norm(mes)];
      return mi ? ` ${d}/${mi}${y ? '/' + y : ''}` : m;
    })
    // "sexta passada", "na última sexta", "semana passada" (sem dia: tira só o "passada")
    .replace(/\s(?:n[ao]\s+)?[uú]ltim[ao]\s+(?=(?:domingo|segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado)\b)/gi, ' ')
    .replace(/\b((?:domingo|segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado)(?:-feira| feira)?)\s+passad[oa]\b/gi, '$1')
    // verbos e ligações que não fazem parte da descrição
    .replace(/^\s(?:eu\s+|a[ií]\s+)?(?:foi|deu)\s+/i, ' ')
    .replace(/\s(?:eu\s+)?(?:gastei|paguei|comprei|torrei)\s+(?:(?:um|uma)\s+(?=\D))?/gi, ' ')
    .replace(/\s(?:deu|custou|saiu|ficou|foi|por|de|com)\s+(?=(?:r\$)?\d)/gi, ' ')
    .replace(/\s(?:reais|real)\s+(?:de|em|com|no|na)\s+/gi, ' reais ');
  return s.replace(/\s+/g, ' ').trim();
}

// "20 no uber e 35 no ifood" → ["20 no uber", "35 no ifood"].
// Só separa se cada parte tiver um valor; partes sem valor juntam com a próxima ("pão e leite 12").
// "12 reais vôlei 40 reais mercado 30 lanche" (sem "e" nem vírgula, como sai da fala)
// → ["12 reais vôlei", "40 reais mercado", "30 lanche"]. Cada valor começa (ou termina) um lançamento.
const SEG_LIGA = ['no', 'na', 'via', 'pelo', 'pela', 'em', 'de', 'com'];
function splitByAmounts(text) {
  const tk = text.split(' ');
  const n = tk.map(norm);
  const isMoneyWord = t => ['reais', 'real', 'rs'].includes(t);
  const amounts = [];
  tk.forEach((t, i) => {
    if (parseAmount(t) == null) return;
    if (/^20\d\d$/.test(t) && /(prefixado|ipca|selic|renda|educa|tesouro|semestrais|extra|igpm)/.test(n[i - 1] || '')) return;
    if (n[i - 1] === 'dia') return;
    const marked = /^r\$/i.test(t) || isMoneyWord(n[i + 1] || '');
    // número pequeno colado numa palavra costuma ser quantidade ("2 pães"), não preço
    if (!marked && parseAmount(t) <= 10 && /^\d+$/.test(t) && i > 0 && n[i + 1] && !/\d/.test(n[i + 1]) && !isMoneyWord(n[i + 1])) return;
    amounts.push({ i, marked });
  });
  // com valores marcados ("R$", "reais") só eles contam; senão, os números soltos
  const use = amounts.filter(a => a.marked).length >= 2 ? amounts.filter(a => a.marked) : amounts;
  if (use.length < 2) return [text];
  // o texto começa pelo valor? (ignorando "recebi", "gastei"…)
  let first = 0;
  const lead = [...TRIGGERS.entrada, ...TRIGGERS.invest, ...TRIGGERS.resgate, 'gastei', 'paguei', 'comprei', 'eu', ...SEG_LIGA];
  while (first < n.length && lead.includes(n[first])) first++;
  const valorPrimeiro = use[0].i === first;
  const cuts = [];
  if (valorPrimeiro) {
    for (const a of use.slice(1)) cuts.push(a.i);
  } else {
    for (const a of use.slice(0, -1)) {
      let j = a.i + 1;
      if (isMoneyWord(n[j] || '')) j++;
      // "vôlei 12 no pix mercado 40": pix/ontem ficam com o anterior
      while (j < n.length) {
        if (METHOD_WORDS.includes(n[j]) || DATE_WORDS.includes(n[j].replace(/-feira$/, ''))) j++;
        else if (SEG_LIGA.includes(n[j]) && n[j + 1] && METHOD_WORDS.includes(n[j + 1])) j += 2;
        else break;
      }
      cuts.push(j);
    }
  }
  const segs = [];
  let s = 0;
  for (const c of cuts) { segs.push(tk.slice(s, c).join(' ')); s = c; }
  segs.push(tk.slice(s).join(' '));
  // só separa se todo pedaço tiver valor e alguma descrição
  const ok = segs.every(x => { const p = parseText(x); return p.valor != null && p.desc; });
  return ok ? segs : [text];
}

function splitEntries(text) {
  const t = falaParaTexto(text);
  const parts = t.split(/\s*(?:[,;.]\s+|\s+e\s+(?:tamb[eé]m\s+|depois\s+|mais\s+)?|\s+depois\s+|\s+mais\s+(?=(?:r\$)?\d))/i).filter(Boolean)
    .flatMap(splitByAmounts);
  if (parts.length < 2) return [text];
  const hasVal = p => parseText(p).valor != null;
  const out = [];
  let carry = '';
  for (const p of parts) {
    const cand = carry ? carry + ' e ' + p : p;
    if (hasVal(p)) { out.push(cand); carry = ''; } else carry = cand;
  }
  if (carry) { if (out.length) out[out.length - 1] += ' e ' + carry; else out.push(carry); }
  return out.length > 1 ? out : [text];
}

// Vários lançamentos numa frase: as partes herdam o tipo ("recebi…") e a data ("ontem…") da anterior.
function parseMany(text) {
  const items = splitEntries(text).map(t => ({ text: t, p: parseText(t) }));
  for (let k = 1; k < items.length; k++) {
    const prev = items[k - 1].p, p = items[k].p;
    if (!p.tipo && prev.tipo) { p.tipo = prev.tipo; p.resgate = prev.resgate; }
    if (!p.dataDita && prev.dataDita) { p.data = prev.data; p.dataDita = true; }
  }
  return items;
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
  const out = { valor: null, data: isoDate(new Date()), metodo: '', parcelas: 1, desc: '', tipo: null, resgate: false };
  let raw = falaParaTexto(text);
  if (!raw) return out;
  // "+50 pix do joão" = entrada
  if (/^\+/.test(raw)) { out.tipo = 'entrada'; raw = raw.replace(/^\+\s*/, ''); }
  // Rentabilidade: "110% do cdi", "100% da selic", "13% ao ano", "ipca + 6%"
  raw = raw.replace(/(\d)\s+%/g, '$1%');
  let rm;
  if ((rm = raw.match(/(\d+(?:[.,]\d+)?)%\s*(?:do|da|de)?\s*(cdi|selic)\b/i))) out.rend = { ind: norm(rm[2]), pct: parseFloat(rm[1].replace(',', '.')) };
  else if ((rm = raw.match(/ipca\s*\+\s*(\d{1,2}(?:[.,]\d+)?)%/i))) out.rend = { ind: 'ipca', pct: parseFloat(rm[1].replace(',', '.')) };
  else if ((rm = raw.match(/(?:pre(?:fixado)?\s*)?(\d{1,2}(?:[.,]\d+)?)%\s*(?:a\.?\s*a\.?|ao ano)/i))) out.rend = { ind: 'pre', pct: parseFloat(rm[1].replace(',', '.')) };
  if (rm && out.rend) raw = raw.replace(rm[0], ' ').replace(/\s+/g, ' ').trim();
  // cotas: "2,5 cotas" / "3 títulos"
  if ((rm = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:cotas?|t[ií]tulos?)\b/i))) { out.cotas = parseFloat(rm[1].replace(',', '.')); raw = raw.replace(rm[0], ' ').replace(/\s+/g, ' ').trim(); }
  // taxa solta de Tesouro: "tesouro prefixado 2031 a 13,2%"
  if (!out.rend && /tesouro|prefixado|ipca|selic|renda\+|educa/i.test(raw) && (rm = raw.match(/(?:\b(?:a|taxa(?: de)?)\s+)?(\d{1,2}(?:[.,]\d+)?)%/i))) {
    out.taxaTes = parseFloat(rm[1].replace(',', '.'));
    raw = raw.replace(rm[0], ' ').replace(/\s+/g, ' ').trim();
  }
  // "r$ 20" → "r$20"
  raw = raw.replace(/r\$\s+(?=\d)/gi, 'r$')
    .replace(/[()\[\]]/g, ' ')                       // "(01/07)" → " 01/07 "
    .replace(/\s+/g, ' ').trim();
  let tokens = raw.split(' ');
  const keep = new Array(tokens.length).fill(true);
  const n = tokens.map(norm);

  // Tipo: "recebi", "guardei", "resgatei"…
  const filler = ['na', 'no', 'nas', 'nos', 'em', 'da', 'do', 'de', 'pra', 'para', 'pro', 'o', 'a', 'meu', 'minha', 'meus', 'minhas'];
  n.forEach((t, i) => {
    let found = null;
    if (TRIGGERS.entrada.includes(t)) found = 'entrada';
    else if (TRIGGERS.invest.includes(t)) found = 'invest';
    else if (TRIGGERS.resgate.includes(t)) { found = 'invest'; out.resgate = true; }
    if (!found) return;
    out.tipo = found; keep[i] = false;
    for (let k = i + 1; k < n.length && filler.includes(n[k]); k++) keep[k] = false;
  });

  // Formas de pagamento (inclui expressões de 2-3 palavras)
  const notMethodBefore = ['fatura', 'pagar', 'pagamento', 'o', 'do', 'da', 'para', 'pro', 'meu', 'novo', 'anuidade'];
  const skipped = new Set();
  for (let i = 0; i < n.length; i++) {
    for (const [mid, m] of Object.entries(METHODS)) {
      for (const p of m.palavras) {
        const parts = p.split(' ');
        if (parts.every((w, k) => n[i + k] === w)) {
          if (skipped.has(i) || (i > 0 && notMethodBefore.includes(n[i - 1]))) { for (let k = 0; k < parts.length; k++) skipped.add(i + k); continue; }
          // "no crédito" / "via pix" / "cartao de credito"
          if (!out.metodo || parts.length > 1) out.metodo = mid;
          for (let k = 0; k < parts.length; k++) if (!skipped.has(i + k)) keep[i + k] = false;
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
    if (d) { out.data = isoDate(d); out.dataDita = true; keep[i] = false; if (['em', 'no'].includes(n[i - 1])) keep[i - 1] = false; }
  });

  // Valor: prefere token com R$ ou com centavos; senão o último número.
  let best = -1, bestScore = -1;
  tokens.forEach((t, i) => {
    if (!keep[i]) return;
    const v = parseAmount(t);
    if (v == null) return;
    if (/^20\d\d$/.test(t) && /(prefixado|ipca|selic|renda|educa|tesouro|semestrais|extra|igpm)/.test(n[i - 1] || '')) return;
    let score = i / 100; // mais à direita ganha em empate
    if (/^r\$/i.test(t) || /reais$/i.test(t) || /^(reais|real|rs)$/.test(n[i + 1] || '')) score += 10;
    if (/[.,]\d{1,2}$/.test(t)) score += 5;
    // número colado em nome conhecido (ex.: "99 food", "99 pop") não é valor se houver outro
    if (score > bestScore) { bestScore = score; best = i; }
  });
  if (best >= 0) { out.valor = parseAmount(tokens[best]); keep[best] = false; if (/^(reais|real|rs)$/.test(n[best + 1] || '')) keep[best + 1] = false; }

  let desc = tokens.filter((_, i) => keep[i]).join(' ').replace(/^(no|na|em|de|da|do|com|o|a|os|as|um|uma)\s+/i, '').trim();
  // "R$275 cartão" sozinho = pagamento da fatura, não forma de pagamento
  if (!desc && out.metodo === 'credito') { desc = tokens.filter((_, i) => !keep[i] && /^cart/i.test(n[i])).join(' ') || 'Cartão'; out.metodo = ''; }
  out.desc = desc ? desc[0].toUpperCase() + desc.slice(1) : '';
  return out;
}

// ───────────────────────── Categorização automática ─────────────────────────
function wordsOf(s) { return norm(s).replace(/[^a-z0-9+&\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !STOPWORDS.has(w)); }

// tipo: 'gasto' | 'entrada' | 'invest' restringe as categorias; sem tipo, procura em todas
// (com leve preferência por gastos, que são a maioria dos lançamentos).
function categorize(desc, tipo) {
  const text = norm(desc);
  const fallback = tipo ? TIPOS[tipo].outros : 'outros';
  const allowed = c => !tipo || tipoCat(c) === tipo;
  if (!text) return { cat: fallback, certeza: 0 };
  const learnedPhrase = state.aprendido.frases[text];
  const lc = state.categorias.find(c => c.id === learnedPhrase);
  if (lc && allowed(lc)) return { cat: learnedPhrase, certeza: 1, porque: 'você já usou' };

  const scores = {};
  const add = (id, v) => { scores[id] = (scores[id] || 0) + v; };
  const clean = text.replace(/[^a-z0-9+&]/g, ' ').replace(/\s+/g, ' ');
  // também compara a versão no singular ("cafés" → "cafe", "pães" → "pao")
  const singular = clean.split(' ').map(w => w.length > 3 ? w.replace(/[oa]es$/, 'ao').replace(/(?<=[aeiou])s$/, '') : w).join(' ');
  const padded = ' ' + clean + ' | ' + singular + ' ';
  for (const c of state.categorias) {
    if (!allowed(c)) continue;
    const w = !tipo && tipoCat(c) !== 'gasto' ? 0.85 : 1;
    for (const p of c.palavras || []) {
      const kw = norm(p);
      if (kw && padded.includes(' ' + kw + ' ')) add(c.id, (2 + kw.length / 8) * w);
    }
  }
  for (const w of wordsOf(desc)) {
    const counts = state.aprendido.palavras[w];
    if (!counts) continue;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    for (const [id, cnt] of Object.entries(counts)) add(id, 3 * cnt / total + Math.min(cnt, 5) * 0.2);
  }
  let best = fallback, bs = 0;
  for (const [id, s] of Object.entries(scores)) { const c = state.categorias.find(x => x.id === id); if (s > bs && c && allowed(c)) { bs = s; best = id; } }
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
    if (!Object.values(TIPOS).some(t => t.outros === cat)) m[cat] = (m[cat] || 0) + 1;
    if (!Object.keys(m).length) delete state.aprendido.palavras[w];
  }
}

// ───────────────────────── Operações ─────────────────────────
function addExpense({ desc, valor, data, cat, metodo, parcelas = 1, nota = '', resgate = false }) {
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
    if (resgate) g.resgate = true;
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
  if (added) { save(); toast(`${added} lançamento${added > 1 ? 's' : ''} fixo${added > 1 ? 's' : ''} feito${added > 1 ? 's' : ''} automaticamente`); }
}

// inMonth = só gastos (orçamento, análise, previsão); ofType/allMonth para o resto
const inMonth = (key) => state.gastos.filter(g => g.data.startsWith(key) && tipoOf(g) === 'gasto');
const ofType = (key, t) => state.gastos.filter(g => g.data.startsWith(key) && tipoOf(g) === t);
const allMonth = (key) => state.gastos.filter(g => g.data.startsWith(key));
const sumSigned = arr => Math.round(arr.reduce((a, g) => a + signed(g), 0) * 100) / 100;
const sum = arr => Math.round(arr.reduce((a, g) => a + g.valor, 0) * 100) / 100;

// ───────────────────────── Entrada rápida ─────────────────────────
let pending = null; // { parsed, cat, catManual }

function updatePreview() {
  const text = $('#quickInput').value;
  const box = $('#preview');
  if (!text.trim()) { box.hidden = true; $('#quickHint').hidden = false; pending = null; multi = null; return; }
  const items = parseMany(text);
  if (items.length > 1) { pending = null; renderMulti(items); return; }
  multi = null;
  const p = items[0].p;
  const hint = ui.tipoForce || p.tipo;
  const auto = categorize(p.desc, hint || undefined);
  if (pending && pending.catManual && hint && tipoCat(catById(pending.cat)) !== hint) pending.catManual = false;
  if (!pending || !pending.catManual) pending = { parsed: p, cat: auto.cat, catManual: false };
  else pending.parsed = p;
  const c = catById(pending.cat);
  const tipo = tipoCat(c);
  pending.tipo = tipo;
  pending.resgate = tipo === 'invest' && p.resgate;
  updateSeg(tipo);
  const parts = [];
  const sign = tipo === 'entrada' ? '+' : '';
  parts.push(`<span class="chip value ${tipo}">${p.valor ? sign + money(p.valor) : 'sem valor'}</span>`);
  if (tipo !== 'gasto') parts.push(`<span class="chip">${pending.resgate ? '↩️ Resgate' : TIPOS[tipo].emoji + ' ' + TIPOS[tipo].nome}</span>`);
  if (p.parcelas > 1 && p.valor && tipo === 'gasto') parts.push(`<span class="chip">${p.parcelas}× de ${money(p.valor / p.parcelas)}</span>`);
  parts.push(`<button type="button" class="chip" id="previewCat" title="Trocar categoria">${c.emoji} ${escapeHtml(c.nome)} ▾</button>`);
  parts.push(`<span class="chip">📅 ${relDay(p.data)}</span>`);
  if (p.metodo) parts.push(`<span class="chip">💳 ${METHODS[p.metodo].nome}</span>`);
  if (tipo === 'invest' && !isTesouroCat(pending.cat)) {
    const r = p.rend || catRend(pending.cat);
    if (r.ind !== 'nenhum' && !p.resgate) parts.push(`<span class="chip">📈 ${escapeHtml(rendTexto(r, false))}</span>`);
  }
  if (tipo === 'invest' && isTesouroCat(pending.cat)) {
    const t = matchTitulo(text);
    const txInf = p.taxaTes ?? (p.rend && p.rend.pct < 30 ? p.rend.pct : null);
    const txShow = txInf ?? (p.data === isoDate(new Date()) ? t && t.taxaCompra : null);
    parts.push(t ? `<span class="chip">🏛️ ${escapeHtml(t.nome.replace(/^Tesouro /, ''))}${txShow != null && !p.resgate ? ' · comprou a ' + taxaTexto(t.tipo, txShow) : ''}${p.cotas ? ' · ' + cotasFmt(p.cotas) : ''}</span>` : `<span class="chip">🏛️ qual título? ex.: “ipca 2035”</span>`);
  }
  if (p.desc) parts.push(`<span class="chip">“${escapeHtml(p.desc)}”</span>`);
  box.innerHTML = parts.join('');
  box.hidden = false;
  $('#quickHint').hidden = true;
  $('#previewCat').onclick = () => toggleCatPicker();
}

// Vários lançamentos de uma vez ("uber 20, ifood 35 e mercado 150")
let multi = null; // [{ text, p, cat, manual }]
function renderMulti(items) {
  const box = $('#preview');
  const old = multi || [];
  multi = items.map((it, k) => {
    const hint = ui.tipoForce || it.p.tipo || undefined;
    const o = old[k];
    const keep = o && o.manual && (!hint || tipoCat(catById(o.cat)) === hint);
    return { ...it, cat: keep ? o.cat : categorize(it.p.desc, hint).cat, manual: !!keep };
  });
  const total = multi.reduce((s, m) => s + (m.p.valor || 0), 0);
  updateSeg(ui.tipoForce);
  box.innerHTML = `<div class="multi-head">🧾 ${multi.length} lançamentos · ${money(total)}</div>` + multi.map((m, k) => {
    const c = catById(m.cat), tipo = tipoCat(c), p = m.p;
    const chips = [`<span class="chip value ${tipo}">${p.valor ? (tipo === 'entrada' ? '+' : '') + money(p.valor) : 'sem valor'}</span>`,
      `<button type="button" class="chip" data-mcat="${k}">${c.emoji} ${escapeHtml(c.nome)} ▾</button>`];
    if (p.data !== isoDate(new Date())) chips.push(`<span class="chip">📅 ${relDay(p.data)}</span>`);
    if (p.metodo) chips.push(`<span class="chip">💳 ${METHODS[p.metodo].nome}</span>`);
    if (p.parcelas > 1 && tipo === 'gasto') chips.push(`<span class="chip">${p.parcelas}×</span>`);
    if (p.desc) chips.push(`<span class="chip">“${escapeHtml(p.desc)}”</span>`);
    return `<div class="multi-row" data-row="${k}">${chips.join('')}</div>`;
  }).join('');
  box.hidden = false;
  $('#quickHint').hidden = true;
  $$('[data-mcat]', box).forEach(b => b.onclick = () => {
    const k = +b.dataset.mcat, row = b.closest('.multi-row');
    const ex = $('.cat-picker', box); const same = ex && ex.dataset.k == k;
    if (ex) ex.remove();
    if (same) return;
    const picker = document.createElement('div');
    picker.className = 'cat-picker'; picker.dataset.k = k;
    for (const c of catsOf(tipoCat(catById(multi[k].cat)))) {
      const cb = document.createElement('button');
      cb.type = 'button'; cb.className = 'chip' + (c.id === multi[k].cat ? ' sel' : '');
      cb.textContent = `${c.emoji} ${c.nome}`;
      cb.onclick = () => { multi[k].cat = c.id; multi[k].manual = true; renderMulti(multi); };
      picker.appendChild(cb);
    }
    row.after(picker);
  });
}

// Seletor Gasto / Entrada / Investir: mostra o tipo detectado; tocar força o tipo.
function updateSeg(tipo) {
  $$('#tipoSeg button').forEach(b => {
    b.classList.toggle('sel', b.dataset.tipo === tipo);
    b.setAttribute('aria-pressed', b.dataset.tipo === tipo);
  });
}

function toggleCatPicker() {
  const box = $('#preview');
  const ex = $('.cat-picker', box);
  if (ex) { ex.remove(); return; }
  const picker = document.createElement('div');
  picker.className = 'cat-picker';
  for (const c of catsOf(pending.tipo || 'gasto')) {
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
  pararMic();
  if (!pending && !multi) updatePreview();
  let created, msg;
  if (multi) {
    const semValor = multi.filter(m => !m.p.valor);
    if (semValor.length) { toast(`Faltou o valor em “${semValor[0].p.desc || semValor[0].text}”`); input.focus(); return; }
    created = [];
    for (const m of multi) created.push(...commitEntry(m.text, m.p, m.cat));
    const total = multi.reduce((s, m) => s + m.p.valor, 0);
    msg = `🧾 ${multi.length} lançamentos · ${money(total)}`;
  } else {
    const p = pending.parsed;
    if (!p.valor) { toast('Faltou o valor — ex.: “almoço 32,90”'); input.focus(); return; }
    created = commitEntry(input.value, p, pending.cat);
    const tipo = pending.tipo || 'gasto', resgate = !!pending.resgate;
    const c = catById(created[0].cat);
    msg = tipo === 'entrada' ? `💰 +${money(p.valor)} em ${c.nome}`
      : tipo === 'invest' ? (resgate ? `↩️ ${money(p.valor)} resgatado de ${c.nome}` : `📈 ${money(p.valor)} investido em ${c.nome}`)
      : `${c.emoji} ${money(p.valor)} em ${c.nome}`;
  }
  input.value = '';
  pending = null;
  multi = null;
  ui.tipoForce = null;
  updatePreview();
  updateSeg(null);
  if (voz.falou) { falar(msg.replace(/^\S+\s/, '')); voz.falou = false; }
  toast(msg, 'desfazer', () => {
    const ids = new Set(created.map(g => g.id));
    state.gastos = state.gastos.filter(g => !ids.has(g.id));
    save(); render();
  });
  if (created[0].data.slice(0, 7) !== ui.month) ui.month = created[0].data.slice(0, 7);
  render();
  input.focus();
}

// Salva um lançamento já interpretado (usado pela entrada rápida, uma ou várias linhas)
function commitEntry(text, p, cat) {
  const desc = p.desc || catById(cat).nome;
  const tipo = tipoCat(catById(cat)) || 'gasto';
  const resgate = tipo === 'invest' && !!p.resgate;
  const tTes = tipo === 'invest' && isTesouroCat(cat) ? matchTitulo(text) : null;
  const created = addExpense({ desc: tTes ? tTes.nome : desc, valor: p.valor, data: p.data, cat, metodo: p.metodo, parcelas: tipo === 'gasto' ? p.parcelas : 1, resgate });
  if (tipo === 'invest' && !resgate && !isTesouroCat(cat) && p.rend) {
    const r = { ...p.rend, ...(/\b(lci|lca)\b/i.test(desc) ? { isento: true } : {}) };
    state.rend = state.rend || {};
    if (!state.rend[cat] && !DEFAULT_REND[cat]) state.rend[cat] = r; else created[0].rend = r;
    save();
  }
  if (tTes) {
    const g = created[0];
    g.titulo = tTes.nome;
    const txInf = p.taxaTes ?? (p.rend && ['ipca', 'pre', 'selic'].includes(p.rend.ind) && p.rend.pct < 30 ? p.rend.pct : null);
    const hoje = g.data === isoDate(new Date());
    if (!resgate && p.cotas > 0) g.cotas = p.cotas;
    if (!resgate) { if (txInf != null) g.taxa = txInf; else if (hoje && tTes.taxaCompra != null) g.taxa = tTes.taxaCompra; }
    const pu = resgate ? tTes.puVenda : (txInf != null && txInf !== tTes.taxaCompra ? null : tTes.puCompra);
    if (pu && !g.cotas && g.data === isoDate(new Date())) g.qtd = Math.round(p.valor / pu * 1e6) / 1e6;
    save();
  }
  return created;
}

// ───────────────────────── Voz ─────────────────────────
// Usa o reconhecimento de fala do próprio navegador (Chrome/Android, Safari/iPhone).
// O texto falado cai na caixa e passa pelo mesmo leitor do texto digitado.
const voz = { rec: null, falou: false };
const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

function setMic(on) {
  const b = $('#micBtn');
  b.classList.toggle('on', on);
  b.setAttribute('aria-pressed', on);
  b.setAttribute('aria-label', on ? 'Parar de ouvir' : 'Falar o lançamento');
  b.title = on ? 'Parar' : 'Falar';
  $('#micStop').hidden = !on;
  $('#quickInput').placeholder = on ? 'Ouvindo… ex.: “gastei 23 no uber ontem”' : 'ex.: mercado 87,90 · recebi mesada 300';
}

// Desliga o microfone (botão ■, ao salvar, ao sair do app ou depois de um tempo)
function pararMic() {
  clearTimeout(voz.timer);
  if (!voz.rec) return;
  try { voz.rec.stop(); } catch { /* já parou */ }
  try { voz.rec.abort(); } catch { /* já parou */ }
  voz.rec = null;
  setMic(false);
}

function aplicarMicVisivel() {
  $('#micBtn').hidden = state.vozBotao === false;
  if (state.vozBotao === false) pararMic();
}

const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const isStandalone = () => !!(navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches));

// Quando a voz direta não dá certo: abre o teclado (que tem o 🎤 de ditado) e explica.
function vozFallback(msg) {
  const input = $('#quickInput');
  input.focus();
  toast(msg + ' Use o 🎤 do teclado (ditado) — o app entende do mesmo jeito.');
}

// Pede a permissão do microfone de forma explícita (faz o aviso "Permitir microfone?" aparecer).
async function pedirMicrofone() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return 'sem-suporte';
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach(t => t.stop());
    return 'ok';
  } catch (e) {
    return e && e.name === 'NotAllowedError' ? 'negado' : 'erro';
  }
}

function dicaPermissao() {
  return isIOS
    ? 'O microfone está bloqueado. No iPhone: Ajustes → Apps → Safari → Microfone → Perguntar ou Permitir (e Ajustes → Privacidade → Reconhecimento de Fala).'
    : 'O microfone está bloqueado. Libere em: ⋮ → Configurações → Configurações do site → Microfone (ligado). Confira também Configurações do celular → Aplicativos → Chrome → Permissões → Microfone, e o botão “Acesso ao microfone” na barra de notificações.';
}

function toggleMic() {
  const input = $('#quickInput');
  if (!SpeechRec) { vozFallback('Este navegador não deixa o app ouvir direto.'); return; }
  if (voz.rec) { pararMic(); return; }
  let rec;
  try { rec = new SpeechRec(); } catch { vozFallback('Não consegui ligar o reconhecimento de voz.'); return; }
  rec.lang = 'pt-BR';
  rec.interimResults = true;
  rec.continuous = true;
  rec.maxAlternatives = 1;
  const base = input.value.trim();
  let finalText = '', ouviu = false, erro = null;
  rec.onaudiostart = () => { ouviu = true; };
  rec.onresult = e => {
    let interim = '';
    finalText = '';
    for (let i = 0; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript + ' '; else interim += r[0].transcript;
    }
    // continua ouvindo enquanto você fala; para 4 s depois que você ficar quieto
    clearTimeout(voz.timer);
    voz.timer = setTimeout(pararMic, 4000);
    input.value = [base, (finalText + interim).trim()].filter(Boolean).join(' ');
    if (pending) pending.catManual = false;
    updatePreview();
  };
  rec.onerror = async e => {
    erro = e.error || 'erro';
    if (erro !== 'aborted') pararMic(); // não fica mostrando "Ouvindo…" se deu erro
    if (erro === 'no-speech') toast('Não ouvi nada — toque no microfone e fale');
    else if (erro === 'aborted') { /* parou pelo usuário */ }
    else if (erro === 'network') vozFallback('O reconhecimento de voz precisa de internet.');
    else if (erro === 'audio-capture') vozFallback('Não achei o microfone.');
    else if (erro === 'not-allowed' || erro === 'service-not-allowed') {
      // Tenta fazer o aviso de permissão aparecer; se já estiver bloqueado, explica onde liberar.
      const r = await pedirMicrofone();
      if (r === 'ok') toast('Microfone liberado ✅ Toque no 🎤 de novo e fale.');
      else if (r === 'negado') toast(dicaPermissao());
      else if (isIOS && isStandalone()) vozFallback('No iPhone, o app da tela de início não consegue ouvir direto.');
      else vozFallback('O navegador não deixou usar o reconhecimento de voz.');
    } else vozFallback(`Não consegui ouvir (${erro}).`);
  };
  rec.onend = () => {
    clearTimeout(voz.timer);
    if (voz.rec !== rec && voz.rec) return;
    voz.rec = null;
    setMic(false);
    if (finalText.trim()) { voz.falou = true; updatePreview(); return; }
    // terminou sem erro e sem nem abrir o áudio: o aparelho bloqueou em silêncio
    if (!erro && !ouviu) {
      pedirMicrofone().then(r => {
        if (r === 'ok') toast('Microfone liberado ✅ Toque no 🎤 de novo e fale.');
        else if (r === 'negado') toast(dicaPermissao());
        else vozFallback('O aparelho não deixou o app ouvir.');
      });
    }
  };
  try { rec.start(); } catch (e) { vozFallback('Não consegui ligar o microfone.'); return; }
  voz.rec = rec;
  voz.timer = setTimeout(pararMic, 10000); // se ninguém falar, desliga
  if (navigator.vibrate) navigator.vibrate(15);
  setMic(true);
}

// Confirma em voz alta o que foi salvo (só quando o lançamento veio da fala)
function falar(texto) {
  if (state.vozFalar !== true || typeof speechSynthesis === 'undefined') return;
  try {
    const fala = texto.replace(/^\+/, '')
      .replace(/R\$\s?([\d.]+),00/g, '$1 reais')
      .replace(/R\$\s?([\d.]+),(\d{2})/g, '$1 reais e $2 centavos');
    const u = new SpeechSynthesisUtterance(fala + '. Anotado.');
    u.lang = 'pt-BR'; u.rate = 1.1;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch { /* sem voz, sem problema */ }
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
  if (v === 'view-invest') renderInvest();
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
  const pendingFixed = state.fixos.filter(f => tipoCat(catById(f.cat)) === 'gasto' && !state.fixosLancados[`${f.id}@${key}`]).reduce((a, f) => a + f.valor, 0);
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

  renderBalance(ui.month, $('#balance'));

  const recent = [...allMonth(ui.month)].sort((a, b) => b.data.localeCompare(a.data) || b.criado - a.criado).slice(0, 6);
  $('#recentList').innerHTML = recent.length ? recent.map(txRow).join('') : '<li class="empty">Digite seu primeiro gasto lá em cima ☝️</li>';
  bindTx($('#recentList'));
}

function balanceOf(key) {
  const entrou = sum(ofType(key, 'entrada'));
  const gastou = sum(inMonth(key));
  const investiu = sumSigned(ofType(key, 'invest'));
  return { entrou, gastou, investiu, sobrou: Math.round((entrou - gastou - investiu) * 100) / 100 };
}

// Balanço do mês: quanto entrou, para onde foi (gasto / investido) e o que sobrou.
function investedTotal() { return Math.max(0, investPositions().reduce((a, p) => a + (p.atual ?? p.aportado), 0)); }
function renderBalance(key, el) {
  const b = balanceOf(key);
  const inv = investedTotal();
  const invLine = inv > 0 ? `<button type="button" class="inv-link" onclick="go('invest')"><span>📈 Você tem <b>${money(inv)}</b> investido</span><span>ver ›</span></button>` : '';
  if (!b.entrou && !b.investiu) {
    el.innerHTML = `<h2>Balanço do mês</h2><p class="muted small">Anote também o que <b>entra</b> e o que você <b>investe</b> para ver quanto sobra. Ex.: <b>recebi mesada 300</b>, <b>salário 1500</b>, <b>guardei 100 na caixinha</b>.</p>${invLine}`;
    return;
  }
  const base = Math.max(b.entrou, b.gastou + Math.max(0, b.investiu), 1);
  const pctG = b.gastou / base * 100, pctI = Math.max(0, b.investiu) / base * 100;
  const rate = b.entrou > 0 ? Math.round(Math.max(0, b.investiu) / b.entrou * 100) : null;
  const row = (sw, label, val, cls = '') => `<div class="bal-row"><span>${sw ? `<i class="sw ${sw}"></i>` : ''}${label}</span><span class="num ${cls}">${val}</span></div>`;
  el.innerHTML = `<h2>Balanço do mês</h2>
    <div class="bal-bar" role="img" aria-label="Gastos ${Math.round(pctG)}% e investimentos ${Math.round(pctI)}% do que entrou">
      ${pctG ? `<span class="seg-g" style="width:${pctG}%"></span>` : ''}${pctI ? `<span class="seg-i" style="width:${pctI}%"></span>` : ''}
    </div>
    ${row('', 'Entrou', '+' + money(b.entrou), 'in')}
    ${row('g', 'Gastou', '−' + money(b.gastou))}
    ${row('i', b.investiu < 0 ? 'Resgatou' : 'Investiu', (b.investiu < 0 ? '+' : '−') + money(Math.abs(b.investiu)))}
    ${b.entrou ? `<div class="bal-total">${row('', b.sobrou >= 0 ? 'Sobrou' : 'Faltou', money(Math.abs(b.sobrou)), b.sobrou >= 0 ? 'in' : 'out')}</div>` : `<p class="muted small" style="margin:8px 0 0">Anote o que entra (ex.: <b>recebi mesada 300</b>) para ver quanto sobra.</p>`}
    ${rate !== null ? `<p class="muted small" style="margin:8px 0 0">${b.sobrou < 0 ? '⚠️ Saiu mais do que entrou neste mês.' : rate > 0 ? `Você investiu <b>${rate}%</b> do que entrou.` : 'Nada investido ainda neste mês.'}</p>` : ''}${invLine}`;
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
  $$('.cat-bar', el).forEach(b => b.onclick = () => { ui.cat = b.dataset.cat; ui.search = ''; ui.tipoFiltro = 'tudo'; go('list'); });
}

function amountHtml(g) {
  const t = tipoOf(g);
  if (t === 'entrada') return `<div class="amt in">+${money(g.valor)}</div>`;
  if (t === 'invest') return `<div class="amt inv">${g.resgate ? '↙ ' : '↗ '}${money(g.valor)}</div>`;
  return `<div class="amt">${money(g.valor)}</div>`;
}
function txRow(g) {
  const c = catById(g.cat);
  const t = tipoOf(g);
  const kind = t === 'entrada' ? 'entrada' : t === 'invest' ? (g.resgate ? 'resgate' : 'investimento') : '';
  const meta = [relDay(g.data), g.rend ? `${c.nome} · ${rendTexto(g.rend, false)}` : g.titulo ? [g.titulo === g.desc ? c.nome : g.titulo, g.taxa != null ? taxaTexto(tipoTitulo(g.titulo), g.taxa) : ''].filter(Boolean).join(' · ') : c.nome, kind, g.metodo && METHODS[g.metodo] ? METHODS[g.metodo].nome : '', g.fixo ? 'fixo' : ''].filter(Boolean).join(' · ');
  return `<li class="tx" data-id="${g.id}"><div class="em">${c.emoji}</div><div class="info"><div class="d">${escapeHtml(g.desc)}</div><div class="meta">${escapeHtml(meta)}</div></div>${amountHtml(g)}</li>`;
}
function bindTx(el) { $$('.tx', el).forEach(li => li.onclick = () => openExpense(li.dataset.id)); }

function renderList() {
  const sel = $('#catFilter');
  const tf = ui.tipoFiltro;
  $$('#listSeg button').forEach(b => b.classList.toggle('sel', b.dataset.tipo === tf));
  sel.innerHTML = '<option value="">Todas categorias</option>' + (tf === 'tudo' ? catOptgroups() : catsOf(tf).map(c => `<option value="${c.id}">${c.emoji} ${escapeHtml(c.nome)}</option>`).join(''));
  sel.value = ui.cat;
  if (sel.value !== ui.cat) ui.cat = '';
  $('#searchInput').value = ui.search;
  const q = norm(ui.search);
  // Com busca, procura em todos os meses
  let items = q ? state.gastos : allMonth(ui.month);
  if (tf !== 'tudo') items = items.filter(g => tipoOf(g) === tf);
  if (ui.cat) items = items.filter(g => g.cat === ui.cat);
  if (q) items = items.filter(g => norm(g.desc).includes(q) || norm(catById(g.cat).nome).includes(q) || norm(g.nota).includes(q) || String(g.valor).includes(q.replace(',', '.')));
  items = [...items].sort((a, b) => b.data.localeCompare(a.data) || b.criado - a.criado);
  const byT = t => items.filter(g => tipoOf(g) === t);
  const parts = [];
  if (byT('gasto').length) parts.push(`gastos ${money(sum(byT('gasto')))}`);
  if (byT('entrada').length) parts.push(`entradas +${money(sum(byT('entrada')))}`);
  if (byT('invest').length) parts.push(`investido ${money(sumSigned(byT('invest')))}`);
  $('#listTotal').textContent = items.length ? `${items.length} lançamento${items.length > 1 ? 's' : ''} · ${parts.join(' · ')}${q ? ' (todos os meses)' : ''}` : '';
  const groups = {};
  for (const g of items) (groups[g.data] || (groups[g.data] = [])).push(g);
  $('#fullList').innerHTML = items.length ? Object.entries(groups).map(([d, gs]) => {
    const dt = parseISO(d);
    const label = `${relDay(d)}${relDay(d).length < 6 ? ', ' + dt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '') : ''}`;
    const g1 = gs.filter(g => tipoOf(g) === 'gasto'), e1 = gs.filter(g => tipoOf(g) === 'entrada');
    const head = [g1.length ? money(sum(g1)) : '', e1.length ? '+' + money(sum(e1)) : ''].filter(Boolean).join(' · ');
    return `<div class="day-group"><div class="day-head"><span>${label}</span><span class="num">${head}</span></div><ul class="tx-list">${gs.map(txRow).join('')}</ul></div>`;
  }).join('') : `<div class="empty">${q || ui.cat ? 'Nada encontrado.' : 'Nenhum lançamento neste mês.'}</div>`;
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

  // Entradas × saídas (6 meses)
  const bal = keys.map(balanceOf);
  const hasFlow = bal.some(b => b.entrou || b.investiu);
  $('#flowCard').hidden = !hasFlow;
  if (hasFlow) {
    const series = [
      { name: 'Entrou', cls: 's1', values: bal.map(b => b.entrou) },
      { name: 'Gastou', cls: 's2', values: bal.map(b => b.gastou) },
      { name: 'Investiu', cls: 's3', values: bal.map(b => Math.max(0, b.investiu)) },
    ];
    $('#flowChart').innerHTML = legendHtml(series) + groupedChart(series, keys.map(k => monthName(k, true)), keys.map(k => monthName(k)), { width: $('#flowChart').clientWidth || 320 });
    $('#flowTable').innerHTML = `<table class="simple"><tr class="th"><td>Mês</td><td class="r">Entrou</td><td class="r">Gastou</td><td class="r">Investiu</td><td class="r">Sobrou</td></tr>${keys.map((k, i) => [k, bal[i]]).filter(([, b]) => b.entrou || b.gastou || b.investiu).map(([k, b]) => `<tr><td>${monthName(k, true)}</td><td class="r">${b.entrou ? Math.round(b.entrou).toLocaleString('pt-BR') : '—'}</td><td class="r">${Math.round(b.gastou).toLocaleString('pt-BR')}</td><td class="r">${b.investiu ? Math.round(b.investiu).toLocaleString('pt-BR') : '—'}</td><td class="r ${b.entrou && b.sobrou < 0 ? 'out' : ''}">${b.entrou ? (b.sobrou < 0 ? '−' : '') + Math.round(Math.abs(b.sobrou)).toLocaleString('pt-BR') : '—'}</td></tr>`).join('')}</table><p class="muted small" style="margin:6px 0 0">Valores em R$. “—” = nada anotado.</p>`;
  }
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
  const b = balanceOf(ui.month);
  if (b.entrou > 0) {
    if (b.sobrou < 0) out.push(['🚨', `Saiu <b>${money(-b.sobrou)}</b> a mais do que entrou neste mês.`]);
    else if (b.investiu > 0) out.push(['💪', `Você investiu <b>${Math.round(b.investiu / b.entrou * 100)}%</b> do que entrou (${money(b.investiu)}).`]);
    else if (b.sobrou > 0) out.push(['💡', `Sobraram <b>${money(b.sobrou)}</b> — que tal guardar uma parte? Digite “guardei ${Math.max(10, Math.round(b.sobrou / 2 / 10) * 10)} na caixinha”.`]);
  }
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
  const uncategorized = s.items.filter(g => isOutros(g.cat));
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
    if (opt.valueLabels && v > 0) svg += `<text class="lbl" x="${cx}" y="${y(v) - 6}" text-anchor="middle">${Math.round(v).toLocaleString('pt-BR')}</text>`;
  });
  if (opt.avg) svg += `<line class="avg" x1="${padL}" x2="${W - padR}" y1="${y(opt.avg)}" y2="${y(opt.avg)}"/><text x="${W - padR}" y="${Math.max(10, y(opt.avg) - 4)}" text-anchor="end">média/dia ${escapeHtml(money(opt.avg))}</text>`;
  svg += `<line class="base" x1="${padL}" x2="${W - padR}" y1="${H - padB}" y2="${H - padB}"/></svg>`;
  return svg;
}
function legendHtml(series) {
  return `<div class="legend">${series.map(s => `<span><i class="sw ${s.cls}"></i>${escapeHtml(s.name)}</span>`).join('')}</div>`;
}
// Colunas agrupadas (até 3 séries, cores fixas por série), tooltip mostra todas as séries do mês.
function groupedChart(series, labels, fullLabels, opt = {}) {
  const W = Math.max(260, opt.width || 600), H = 170, padL = 4, padR = 4, padT = 10, padB = 22;
  const n = labels.length, k = series.length;
  const max = Math.max(1, ...series.flatMap(s => s.values));
  const step = (W - padL - padR) / n;
  const gap = 2;
  const bw = Math.max(3, Math.min(18, (step - 12) / k - gap));
  const y = v => padT + (H - padT - padB) * (1 - v / max);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Entradas, gastos e investimentos por mês">`;
  for (const f of [0.5, 1]) svg += `<line class="grid" x1="${padL}" x2="${W - padR}" y1="${y(max * f)}" y2="${y(max * f)}"/>`;
  for (let i = 0; i < n; i++) {
    const cx = padL + step * i + step / 2;
    const x0 = cx - (k * bw + (k - 1) * gap) / 2;
    series.forEach((s, j) => {
      const v = s.values[i];
      if (v <= 0) return;
      const x = x0 + j * (bw + gap), yt = y(v), yb = H - padB, r = Math.min(3, bw / 2, yb - yt);
      svg += `<path class="bar ${s.cls}" d="M${x},${yb} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + bw - r} Q${x + bw},${yt} ${x + bw},${yt + r} V${yb} Z"/>`;
    });
    const rows = JSON.stringify(series.map(s => [s.name, s.values[i], s.cls]));
    svg += `<rect class="hit" x="${padL + step * i}" y="${padT}" width="${step}" height="${H - padT}" data-tip="${escapeHtml(fullLabels[i])}" data-rows="${escapeHtml(rows)}"/>`;
    svg += `<text x="${cx}" y="${H - 6}" text-anchor="middle">${escapeHtml(labels[i])}</text>`;
  }
  svg += `<line class="base" x1="${padL}" x2="${W - padR}" y1="${H - padB}" y2="${H - padB}"/></svg>`;
  return svg;
}
function bindTips() {
  const tip = $('#tooltip');
  $$('.chart .hit').forEach(r => {
    const show = e => {
      if (r.dataset.rows) {
        tip.innerHTML = `<span class="tt-h">${escapeHtml(r.dataset.tip)}</span>` + JSON.parse(r.dataset.rows).map(([name, v, cls]) => `<span class="tt-row"><i class="key ${cls}"></i><b>${money(v)}</b> ${escapeHtml(name)}</span>`).join('');
      } else tip.innerHTML = `<b>${money(+r.dataset.val)}</b>${escapeHtml(r.dataset.tip)}`;
      const box = r.getBoundingClientRect();
      tip.hidden = false;
      const half = tip.offsetWidth / 2 + 8;
      tip.style.left = Math.max(half, Math.min(innerWidth - half, box.left + box.width / 2)) + 'px';
      tip.style.top = (r.closest('svg').getBoundingClientRect().top + 8) + 'px';
    };
    r.addEventListener('pointerenter', show);
    r.addEventListener('pointerdown', show);
    r.addEventListener('pointerleave', () => tip.hidden = true);
  });
}
let resizeT; addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if ($('#view-analysis').classList.contains('active')) renderAnalysis(); if ($('#view-invest').classList.contains('active')) renderInvest(); }, 150); });
document.addEventListener('scroll', () => { $('#tooltip').hidden = true; }, { passive: true });

// ── Tesouro Direto
// rates.json é gerado pelo robô (scripts/tesouro.py) a cada publicação / 2h em dias úteis.
let TESOURO = null;
async function loadRates() {
  try {
    const r = await fetch('rates.json', { cache: 'no-cache' });
    if (r.ok) { TESOURO = await r.json(); try { localStorage.setItem('gastos.rates', JSON.stringify(TESOURO)); } catch { } }
  } catch { }
  if (!TESOURO) { try { TESOURO = JSON.parse(localStorage.getItem('gastos.rates')); } catch { } }
  if (TESOURO && !Array.isArray(TESOURO.titulos)) TESOURO = null;
  if ($('#view-invest').classList.contains('active')) renderInvest();
}
const TES_TIPOS = {
  selic: { nome: 'Tesouro Selic', sobre: 'Rende a Selic, quase sem oscilar. Bom para reserva de emergência.' },
  prefixado: { nome: 'Prefixado', sobre: 'Taxa fixa: você já sabe quanto recebe no vencimento. Se vender antes, o valor pode variar.' },
  'prefixado-semestral': { nome: 'Prefixado com juros semestrais', sobre: 'Taxa fixa, pagando juros a cada 6 meses.' },
  ipca: { nome: 'IPCA+', sobre: 'Inflação + uma taxa fixa. Protege seu dinheiro da alta dos preços; ideal para longo prazo.' },
  'ipca-semestral': { nome: 'IPCA+ com juros semestrais', sobre: 'Inflação + taxa, pagando juros a cada 6 meses.' },
  renda: { nome: 'Renda+ (aposentadoria)', sobre: 'Junta dinheiro até o ano do título e depois paga uma renda mensal por 20 anos, corrigida pela inflação.' },
  educa: { nome: 'Educa+ (estudos)', sobre: 'Junta dinheiro até o ano do título e depois paga mensalmente por 5 anos, para faculdade/cursos.' },
  igpm: { nome: 'IGP-M+', sobre: 'Corrigido pelo IGP-M + taxa.' },
  outro: { nome: 'Outros', sobre: '' },
};
const pctFmt = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
function taxaTexto(tipo, taxa) {
  if (taxa == null || isNaN(taxa)) return '';
  if (tipo === 'selic') return `Selic + ${pctFmt(taxa)}%`;
  if (['ipca', 'ipca-semestral', 'renda', 'educa'].includes(tipo)) return `IPCA + ${pctFmt(taxa)}%`;
  if (tipo === 'igpm') return `IGP-M + ${pctFmt(taxa)}%`;
  return `${pctFmt(taxa)}% ao ano`;
}
function tipoTitulo(nome) {
  const n = norm(nome);
  if (/renda/.test(n)) return 'renda';
  if (/educa/.test(n)) return 'educa';
  if (/igp/.test(n)) return 'igpm';
  if (/selic/.test(n)) return 'selic';
  if (/ipca/.test(n)) return /semestr/.test(n) ? 'ipca-semestral' : 'ipca';
  if (/pre(fixado)?\b/.test(n)) return /semestr/.test(n) ? 'prefixado-semestral' : 'prefixado';
  return null;
}
const isTesouroCat = id => id === 'tesouro' || /tesouro/.test(norm(catById(id).nome));
const tesouroByName = nome => TESOURO && TESOURO.titulos.find(t => norm(t.nome) === norm(nome || ''));
const titulosAVenda = () => TESOURO ? TESOURO.titulos.filter(t => t.aVenda) : [];
// "tesouro prefixado 2031", "ipca 2035", "renda+ 2065", "selic"
function matchTitulo(text) {
  if (!TESOURO) return null;
  const kind = tipoTitulo(text);
  if (!kind) return null;
  const year = (norm(text).match(/\b(20\d\d)\b/) || [])[1];
  const pool = TESOURO.titulos.filter(t => t.tipo === kind);
  const venda = pool.filter(t => t.aVenda);
  if (year) return pool.find(t => t.nome.includes(year)) || null;
  return venda[0] || pool[0] || null;
}
// Preço de um título = pagamentos futuros descontados pela taxa: (1 + taxa)^(−dias úteis/252).
// Com a taxa e a data da compra, reconstruímos o preço pago (e a quantidade de títulos);
// o valor de hoje é quantidade × preço oficial de venda de hoje (marcação a mercado).
const duEntre = (a, b) => Math.max(0, (b - a) / 864e5) * 252 / 365;   // dias úteis (aprox.)
function tesFlows(t) {
  const v = parseISO(t.vencimento), out = [], tp = t.tipo;
  if (tp === 'prefixado-semestral' || tp === 'ipca-semestral' || tp === 'igpm') {
    const c = tp === 'prefixado-semestral' ? Math.sqrt(1.10) - 1 : Math.sqrt(1.06) - 1;   // 10% a.a. ou 6% a.a., pagos a cada 6 meses
    for (let k = 0; k < 120; k++) out.push({ d: new Date(v.getFullYear(), v.getMonth() - 6 * k, v.getDate()), a: c + (k === 0 ? 1 : 0), cupom: c });
  } else if (tp === 'renda' || tp === 'educa') {
    const n = tp === 'renda' ? 240 : 60, y0 = v.getFullYear() - (tp === 'renda' ? 19 : 4);   // renda mensal por 20 / 5 anos
    for (let k = 0; k < n; k++) out.push({ d: new Date(y0, k, 15), a: 1 / n, cupom: 1 / n });
  } else out.push({ d: v, a: 1 });
  return out;
}
const priceFactor = (fl, taxa, from) => fl.reduce((s, f) => f.d > from ? s + f.a * Math.pow(1 + taxa / 100, -duEntre(from, f.d) / 252) : s, 0);
function indexGrowth(tipo, from, to) {          // quanto o valor nominal corrigiu entre as datas
  const m = mercado(), anos = Math.max(0, (to - from) / 864e5) / 365;
  if (tipo.startsWith('prefixado')) return 1;
  if (tipo === 'selic') return m.selicOver != null ? Math.pow(1 + m.selicOver / 100, anos) : null;
  return m.ipca != null ? Math.pow(1 + m.ipca / 100, anos) : null;   // IPCA+, Renda+, Educa+, IGP-M (aprox. pelo IPCA)
}
function puNaData(t, data, taxa) {
  if (!t || !t.puVenda || t.taxaVenda == null || taxa == null || isNaN(taxa)) return null;
  const now = new Date(), d = parseISO(data), fl = tesFlows(t);
  const g = indexGrowth(t.tipo, d, now), ph = priceFactor(fl, t.taxaVenda, now), pc = priceFactor(fl, taxa, d);
  return g && ph && pc ? t.puVenda / g * pc / ph : null;
}
function cuponsDesde(t, data) {                 // juros/renda já pagos entre a compra e hoje, por título
  if (!t || !t.puVenda || t.taxaVenda == null) return 0;
  const now = new Date(), d = parseISO(data), fl = tesFlows(t), ph = priceFactor(fl, t.taxaVenda, now);
  if (!ph) return 0;
  const nominalHoje = t.puVenda / ph;
  return fl.filter(f => f.cupom && f.d > d && f.d <= now).reduce((s, f) => s + f.cupom, 0) * nominalHoje;
}
// quantos títulos um lançamento representa
const cotasFmt = q => `${q.toLocaleString('pt-BR', { maximumFractionDigits: q < 10 ? 2 : 1 })} ${Math.abs(q - 1) < 0.005 ? 'cota' : 'cotas'}`;
function qtdOf(g, t) {
  if (g.cotas) return g.cotas;                                      // cotas informadas
  if (g.pu) return g.valor / g.pu;                                  // preço pago informado
  if (g.qtd) return g.qtd;                                          // comprado hoje, preço oficial do dia
  const taxa = g.resgate ? (t && t.taxaVenda) : g.taxa;
  const pu = puNaData(t, g.data, taxa);
  return pu ? g.valor / pu : null;
}

// Posição por título dentro do Tesouro. Se toda compra/venda guardou a quantidade
// (valor ÷ preço do dia), o valor de hoje é estimado pelo preço de venda atual.
function tesouroHoldings(items) {
  const m = {};
  for (const g of items) {
    const k = g.titulo || 'Título não informado';
    const h = m[k] || (m[k] = { nome: k, aportado: 0, qtd: 0, qtdOk: true, tw: 0, w: 0, cupons: 0, semTaxa: null });
    const t = tesouroByName(g.titulo);
    h.aportado += signed(g);
    const q = qtdOf(g, t);
    if (q == null) { h.qtdOk = false; if (!g.resgate && g.taxa == null && !g.pu && !h.semTaxa) h.semTaxa = g.id; }
    else { h.qtd += g.resgate ? -q : q; if (!g.resgate) h.cupons += q * cuponsDesde(t, g.data); }
    if (!g.resgate && g.taxa != null) { h.tw += g.taxa * g.valor; h.w += g.valor; }
  }
  return Object.values(m).map(h => {
    const t = tesouroByName(h.nome);
    const estimado = h.qtdOk && t && t.puVenda ? Math.round((Math.max(0, h.qtd) * t.puVenda + h.cupons) * 100) / 100 : null;
    return { ...h, aportado: Math.round(h.aportado * 100) / 100, taxa: h.w ? h.tw / h.w : null, tipo: (t && t.tipo) || tipoTitulo(h.nome), t, estimado };
  }).filter(h => h.qtdOk ? (h.estimado != null ? h.estimado >= 0.01 : h.qtd > 1e-6) : h.aportado > 0.004);
}
const holdingValue = h => Math.max(0, h.estimado ?? h.aportado);

// ── Rentabilidade dos investimentos (exceto Tesouro, que usa o preço oficial)
const REND_TIPOS = {
  cdi: { nome: '% do CDI', curto: 'do CDI', pct: 100, label: 'Quantos % do CDI?', ex: 'Caixinha e CDB costumam render 100% a 120% do CDI' },
  selic: { nome: '% da Selic', curto: 'da Selic', pct: 100, label: 'Quantos % da Selic?', ex: '' },
  pre: { nome: 'Prefixado (% ao ano)', curto: 'ao ano', pct: 12, label: 'Taxa ao ano (%)', ex: 'Ex.: CDB prefixado de 13% ao ano' },
  ipca: { nome: 'IPCA + %', curto: '', pct: 6, label: 'IPCA + quantos %?', ex: 'Ex.: CDB IPCA + 6%' },
  poupanca: { nome: 'Poupança', curto: '', pct: 100, label: '', ex: 'Rende 0,5% ao mês + TR quando a Selic está acima de 8,5%; senão, 70% da Selic' },
  nenhum: { nome: 'Não calcular (ações, cripto…)', curto: '', pct: 0, label: '', ex: 'Renda variável: use 🔄 Saldo para informar quanto tem' },
};
const DEFAULT_REND = { caixinha: { ind: 'cdi', pct: 100 }, reserva: { ind: 'poupanca', pct: 100, isento: true } };
function catRend(catId) {
  const r = (state.rend && state.rend[catId]) || DEFAULT_REND[catId];
  return r ? { isento: false, ...r } : { ind: 'nenhum', pct: 0 };
}
function mercado() {
  const m = TESOURO || {};
  const selic = m.selic ? m.selic.valor : null;
  const selicOver = m.selicOver ? m.selicOver.valor : selic != null ? selic - 0.1 : null;
  const cdi = m.cdi ? m.cdi.valor : selicOver;
  return { selic, selicOver, cdi, ipca: m.ipca12m ? m.ipca12m.valor : null };
}
// taxa anual (%) que o investimento rende hoje; null = não dá para calcular
function annualRate(r) {
  if (!r) return null;
  const m = mercado();
  switch (r.ind) {
    case 'cdi': return m.cdi != null ? m.cdi * r.pct / 100 : null;
    case 'selic': return m.selicOver != null ? m.selicOver * r.pct / 100 : null;
    case 'pre': return r.pct;
    case 'ipca': return m.ipca != null ? ((1 + m.ipca / 100) * (1 + r.pct / 100) - 1) * 100 : null;
    case 'poupanca': return m.selic == null ? null : m.selic > 8.5 ? (Math.pow(1.005, 12) - 1) * 100 : m.selic * 0.7;
    default: return null;
  }
}
function rendTexto(r, comTaxa = true) {
  if (!r || r.ind === 'nenhum') return '';
  const t = annualRate(r);
  const base = r.ind === 'cdi' || r.ind === 'selic' ? `${pctFmt(r.pct).replace(/,00$/, '')}% ${REND_TIPOS[r.ind].curto}`
    : r.ind === 'pre' ? `${pctFmt(r.pct)}% ao ano` : r.ind === 'ipca' ? `IPCA + ${pctFmt(r.pct)}%` : 'Poupança';
  return base + (comTaxa && t != null && r.ind !== 'pre' ? ` (≈ ${pctFmt(Math.round(t * 100) / 100)}% ao ano)` : '');
}
const daysSince = iso => Math.max(0, Math.round((Date.now() - parseISO(iso).getTime()) / 864e5));
const grow = (iso, rate) => rate == null ? 1 : Math.pow(1 + rate / 100, daysSince(iso) / 365);
// IR regressivo sobre o lucro (CDB, caixinha…): até 180 dias 22,5%; até 360, 20%; até 720, 17,5%; depois 15%
const aliquotaIR = d => d <= 180 ? 0.225 : d <= 360 ? 0.20 : d <= 720 ? 0.175 : 0.15;
const isentoIR = (r, c) => !!(r && (r.isento || r.ind === 'poupanca')) || /\b(lci|lca|poupanca)\b/.test(norm(c.nome));

// ── Investimentos
// Patrimônio por destino: aportado (aportes − resgates) e, se você informou, o saldo atual
// (saldo informado + movimentações depois dele) → rendimento.
function investPositions() {
  const all = state.gastos.filter(g => tipoOf(g) === 'invest');
  const out = [];
  for (const c of sortedCats('invest')) {
    const items = all.filter(g => g.cat === c.id);
    const saldo = state.saldos && state.saldos[c.id];
    if (!items.length && !saldo) continue;
    const aportado = sumSigned(items);
    let atual = saldo ? Math.round((saldo.valor + sumSigned(items.filter(g => g.criado > saldo.ts))) * 100) / 100 : null;
    let titulos = null, estimado = false, liquido = null, rend = null;
    if (!isTesouroCat(c.id)) {
      // Estima o valor de hoje: cada aporte/resgate rende desde a sua data (taxa de hoje).
      rend = catRend(c.id);
      const flows = saldo ? items.filter(g => g.criado > saldo.ts) : items;
      const rateOf = g => annualRate(g.rend || rend);
      if ((saldo && annualRate(rend) != null) || flows.some(g => rateOf(g) != null)) {
        let v = saldo ? saldo.valor * grow(saldo.data, annualRate(rend)) : 0, gross = 0, ir = 0;
        for (const g of flows) {
          const f = grow(g.data, rateOf(g));
          v += signed(g) * f;
          if (!g.resgate) { gross += g.valor * f; ir += g.valor * (f - 1) * aliquotaIR(daysSince(g.data)); }
        }
        atual = Math.round(v * 100) / 100; estimado = true;
        if (!isentoIR(rend, c) && gross > 0 && !saldo) liquido = Math.round((v - ir * Math.max(0, v) / gross) * 100) / 100;
      }
    }
    if (isTesouroCat(c.id)) {
      titulos = tesouroHoldings(items);
      if (!saldo && titulos.length && titulos.every(h => h.estimado != null)) {
        atual = Math.round(titulos.reduce((a, h) => a + h.estimado, 0) * 100) / 100; estimado = true;
      }
    }
    out.push({ c, aportado, atual, saldo, n: items.length, titulos, estimado, liquido, rend });
  }
  return out;
}
function renderInvest() {
  const pos = investPositions();
  const total = pos.reduce((a, p) => a + (p.atual ?? p.aportado), 0);
  const aportado = pos.reduce((a, p) => a + p.aportado, 0);
  const comSaldo = pos.filter(p => p.atual != null);
  const rend = comSaldo.reduce((a, p) => a + p.atual - p.aportado, 0);
  const baseRend = comSaldo.reduce((a, p) => a + p.aportado, 0);
  $('#invTotal').textContent = money(Math.max(0, total));
  $('#invSub').innerHTML = !pos.length ? 'Nenhum investimento ainda.' : comSaldo.length
    ? `${money(aportado)} aplicados · rendimento <span class="${rend >= 0 ? 'delta-down' : 'delta-up'}">${rend >= 0 ? '+' : '−'}${money(Math.abs(rend))}${baseRend > 0 ? ` (${rend >= 0 ? '+' : '−'}${Math.abs(rend / baseRend * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%)` : ''}</span>`
    : `${money(aportado)} aplicados · toque num destino para informar o saldo atual e ver o rendimento`;

  const mes = ofType(ui.month, 'invest');
  const keys = [...Array(6)].map((_, i) => shiftMonth(ui.month, i - 5));
  const aportes = keys.map(k => sum(ofType(k, 'invest').filter(g => !g.resgate)));
  const mediaAporte = aportes.reduce((a, b) => a + b, 0) / 6;
  $('#invStats').innerHTML = [
    ['Aportes no mês', moneyShort(sum(mes.filter(g => !g.resgate)))],
    ['Resgates no mês', moneyShort(sum(mes.filter(g => g.resgate)))],
    ['Média 6 meses', moneyShort(mediaAporte)],
  ].map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v num">${v}</div></div>`).join('');

  $('#invPos').innerHTML = pos.length ? pos.map(p => {
    const tem = Math.max(0, p.atual ?? p.aportado);
    const r = p.atual != null ? p.atual - p.aportado : null;
    const det = [`${money(Math.max(0, p.aportado))} colocados`];
    if (r != null) det.push(`<span class="${r >= 0 ? 'delta-down' : 'delta-up'}">${r >= 0 ? 'rendeu +' : (p.estimado ? 'por enquanto −' : 'perdeu −')}${money(Math.abs(r))}</span>`);
    if (p.estimado) det.push(p.titulos ? 'valor se vendesse hoje' : 'estimado');
    const rendLine = p.rend ? `<button type="button" class="rend-line" data-act="rend"><span>${p.rend.ind === 'nenhum' ? '📊 Renda variável — toque para dizer quanto rende, ou use 🔄 Saldo' : `📈 Rende <b>${escapeHtml(rendTexto(p.rend))}</b>${isentoIR(p.rend, p.c) ? ' · isento de IR' : ''}`}</span><span>✏️</span></button>${p.liquido != null && p.atual > p.aportado ? `<p class="muted small liq">≈ ${money(p.liquido)} se tirar hoje, já descontado o imposto de renda</p>` : ''}` : '';
    const subs = p.titulos && p.titulos.length ? `<ul class="tes-holds">${p.titulos.map(h => {
      const val = h.estimado != null ? h.estimado - h.aportado : null;
      const hoje = h.t && h.t.taxaVenda != null ? h.t.taxaVenda : null;
      const tc = h.t && h.t.taxaCompra != null ? h.t.taxaCompra : null;
      const linha1 = [h.taxa != null ? `você comprou a ${taxaTexto(h.tipo, h.taxa)}` : '', hoje != null ? `hoje: ${tc != null ? `${taxaTexto(h.tipo, tc)} para comprar · ` : ''}${taxaTexto(h.tipo, hoje)} para vender` : ''].filter(Boolean).join('<br>');
      const linha2 = [h.qtdOk && h.qtd > 1e-6 ? cotasFmt(h.qtd) : '', `${money(Math.max(0, h.aportado))} colocados`, val != null ? `<span class="${val >= 0 ? 'delta-down' : 'delta-up'}">${val >= 0 ? 'valorizou +' : 'desvalorizou −'}${money(Math.abs(val))}${h.aportado > 0 ? ` (${val >= 0 ? '+' : '−'}${pctFmt(Math.round(Math.abs(val / h.aportado) * 1000) / 10)}%)` : ''}</span>` : ''].filter(Boolean).join(' · ');
      const falta = h.semTaxa ? `<button type="button" class="link small-link" data-lot="${h.semTaxa}">informe a taxa da compra para ver a valorização</button>` : '';
      return `<li><span>${escapeHtml(h.nome.replace(/^Tesouro /, ''))}<small>${linha1}</small><small>${linha2}</small>${falta}</span><b class="num">${money(holdingValue(h))}</b></li>`;
    }).join('')}</ul>${p.estimado && r != null && r < 0 && Math.abs(r) <= p.aportado * 0.03 ? '<p class="muted small" style="margin:6px 0 0">Logo depois de comprar o valor fica um pouco abaixo: o Tesouro paga um pouco menos na venda do que cobra na compra. Com o tempo, os juros cobrem essa diferença.</p>' : ''}${p.titulos.some(h => h.estimado != null && h.taxa != null) ? '<p class="muted small" style="margin:6px 0 0">Valor se vendesse hoje (usa a taxa <b>para vender</b>, que é um pouco maior que a de compra). Quando a taxa de hoje está <b>abaixo</b> da que você pegou, o título valoriza; <b>acima</b>, desvaloriza — mas no vencimento você recebe a taxa combinada.</p>' : ''}` : '';
    return `<div class="pos ${tem ? '' : 'zero'}" data-id="${p.c.id}">
      <div class="pos-top"><span class="em">${p.c.emoji}</span><span class="pos-name">${escapeHtml(p.c.nome)}<small>${det.join(' · ')}</small></span><span class="pos-val num">${tem ? money(tem) : 'zerado'}</span></div>${rendLine}${subs}
      <div class="pos-actions">
        <button type="button" class="btn small" data-act="add">➕ Colocar</button>
        <button type="button" class="btn small" data-act="take" ${tem ? '' : 'disabled'}>➖ Tirar</button>
        <button type="button" class="btn small ghost" data-act="saldo" title="Informar quanto tem hoje no banco">🔄 Saldo</button>
      </div>
    </div>`;
  }).join('') : '<div class="empty">Você ainda não tem nada investido.<br>Toque em <b>➕ Investir</b> acima, ou digite na tela inicial:<br><b>guardei 100 na caixinha</b> · <b>investi 200 no tesouro</b></div>';
  $$('#invPos .pos').forEach(el => {
    const id = el.dataset.id;
    $('[data-act=add]', el).onclick = () => openMove(id, false);
    $('[data-act=take]', el).onclick = () => openMove(id, true);
    $('[data-act=saldo]', el).onclick = () => openSaldo(id);
    const rl = $('[data-act=rend]', el); if (rl) rl.onclick = () => openRend(id);
    $$('[data-lot]', el).forEach(b => b.onclick = () => openExpense(b.dataset.lot));
  });

  renderTesouroHoje();

  $('#invChart').innerHTML = aportes.some(v => v) ? columnChart(aportes, keys.map(k => monthName(k, true)), keys.map((k, i) => [`aportes em ${monthName(k)}`, aportes[i]]), { width: $('#invChart').clientWidth, highlight: 5, valueLabels: true }) : '<div class="empty">Sem aportes nos últimos 6 meses.</div>';
  bindTips();

  const recent = state.gastos.filter(g => tipoOf(g) === 'invest').sort((a, b) => b.data.localeCompare(a.data) || b.criado - a.criado).slice(0, 10);
  $('#invList').innerHTML = recent.length ? recent.map(txRow).join('') : '<li class="empty">Nenhuma movimentação.</li>';
  bindTx($('#invList'));
}
// Colocar dinheiro num investimento ou tirar dele (resgate). Não deixa tirar mais do que tem.
function renderTesouroHoje() {
  const el = $('#tesHoje');
  if (!TESOURO) { el.innerHTML = '<p class="muted small">Buscando as taxas do Tesouro… (precisa de internet na primeira vez)</p>'; return; }
  const list = titulosAVenda();
  const groups = {};
  for (const t of list) (groups[t.tipo] || (groups[t.tipo] = [])).push(t);
  const when = (() => {
    const a = String(TESOURO.atualizado || '');
    if (/^\d{4}-\d{2}-\d{2}$/.test(a)) return 'fechamento de ' + parseISO(a).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const d = new Date(a); return isNaN(d) ? a : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  })();
  const ref = [TESOURO.selic ? `Selic hoje <b>${pctFmt(TESOURO.selic.valor)}%</b> ao ano` : '', TESOURO.cdi ? `CDI <b>${pctFmt(TESOURO.cdi.valor)}%</b>` : '', TESOURO.ipca12m ? `inflação (IPCA) 12 meses <b>${pctFmt(TESOURO.ipca12m.valor)}%</b>` : ''].filter(Boolean).join(' · ');
  el.innerHTML = (ref ? `<p class="small tes-ref">${ref}</p>` : '') + Object.entries(groups).map(([tipo, ts]) => `
    <details class="tes-group" ${tipo === 'selic' || tipo === 'prefixado' || tipo === 'ipca' ? 'open' : ''}>
      <summary><span>${escapeHtml(TES_TIPOS[tipo].nome)}</span><span class="muted small">${ts.length} título${ts.length > 1 ? 's' : ''}</span></summary>
      <p class="muted small">${escapeHtml(TES_TIPOS[tipo].sobre)}</p>
      <ul class="tes-list">${ts.map(t => `<li data-nome="${escapeHtml(t.nome)}"><span>${escapeHtml(t.nome.replace(/^Tesouro /, ''))}<small>vence ${parseISO(t.vencimento).toLocaleDateString('pt-BR')}${t.minimo ? ` · mínimo ${money(t.minimo)}` : ''}${t.taxaVenda != null ? ` · para vender: ${pctFmt(t.taxaVenda)}%` : ''}</small></span><b>${taxaTexto(t.tipo, t.taxaCompra)}</b></li>`).join('')}</ul>
    </details>`).join('') + `<p class="muted small tes-src">Taxa para comprar (em destaque) e para vender antes do vencimento · dados oficiais do ${when}, por isso podem diferir um pouco do app do banco durante o dia · ${escapeHtml(TESOURO.fonte || 'Tesouro')}. Toque num título para investir nele.</p>`;
  $$('#tesHoje li[data-nome]').forEach(li => li.onclick = () => openMove('tesouro', false, li.dataset.nome));
}

function openMove(catId, resgate, tituloSel) {
  const pos = investPositions();
  const has = id => { const p = pos.find(x => x.c.id === id); return p ? Math.max(0, Math.round((p.atual ?? p.aportado) * 100) / 100) : 0; };
  const tesPos = pos.find(x => isTesouroCat(x.c.id) && x.titulos);
  const held = tesPos ? tesPos.titulos : [];
  const hasTit = nome => { const h = held.find(x => x.nome === nome); return h ? Math.round(holdingValue(h) * 100) / 100 : 0; };
  const tituloOpts = () => {
    if (resgate) return held.map(h => `<option value="${escapeHtml(h.nome)}" ${h.nome === tituloSel ? 'selected' : ''}>${escapeHtml(h.nome)} — tem ${money(holdingValue(h))}</option>`).join('');
    const vend = titulosAVenda();
    const byTipo = {};
    for (const t of vend) (byTipo[t.tipo] || (byTipo[t.tipo] = [])).push(t);
    const antigos = TESOURO ? TESOURO.titulos.filter(t => !t.aVenda && t.puVenda) : [];
    return Object.entries(byTipo).map(([tp, ts]) => `<optgroup label="${escapeHtml(TES_TIPOS[tp].nome)}">${ts.map(t => `<option value="${escapeHtml(t.nome)}" ${t.nome === tituloSel ? 'selected' : ''}>${escapeHtml(t.nome.replace(/^Tesouro /, ''))} · hoje ${taxaTexto(t.tipo, t.taxaCompra)}</option>`).join('')}</optgroup>`).join('')
      + (antigos.length ? `<optgroup label="Não estão mais à venda (compras antigas)">${antigos.map(t => `<option value="${escapeHtml(t.nome)}" ${t.nome === tituloSel ? 'selected' : ''}>${escapeHtml(t.nome.replace(/^Tesouro /, ''))}</option>`).join('')}</optgroup>` : '')
      + `<option value="__outro">Outro título (digitar)</option>`;
  };
  const options = resgate ? sortedCats('invest').filter(c => has(c.id) > 0) : sortedCats('invest');
  if (!options.length) { toast('Você ainda não tem nada investido para tirar'); return; }
  const sel = catId && options.some(c => c.id === catId) ? catId : options[0].id;
  openSheet(`<h3>${resgate ? '➖ Tirar do investimento' : '➕ Colocar no investimento'}</h3>
    <div class="field"><label>${resgate ? 'De onde' : 'Para onde'}</label><select name="cat">${options.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.emoji} ${escapeHtml(c.nome)}${resgate ? ` — tem ${money(has(c.id))}` : ''}</option>`).join('')}</select></div>
    <div class="field-row">
      <div class="field"><label>Valor (R$)</label><input name="valor" inputmode="decimal" required placeholder="ex.: 100" autofocus></div>
      <div class="field"><label>Data</label><input name="data" type="date" value="${isoDate(new Date())}" required></div>
    </div>
    ${resgate ? '' : `<div id="rendBox" hidden>${rendFields({ ind: 'cdi', pct: 100 }, 'r_')}</div>`}
    <div id="tesBox" hidden>
      <div class="field"><label>Título do Tesouro</label><select name="titulo">${tituloOpts()}</select></div>
      <div class="field" id="tesOutro" hidden><label>Nome do título</label><input name="tituloNome" placeholder="ex.: Tesouro IPCA+ 2035"></div>
      ${resgate ? '' : `<div class="field"><label id="taxaLbl">Taxa da compra (%)</label><input name="taxa" inputmode="decimal" placeholder="ex.: 13,45"></div>
      <div class="field-row"><div class="field"><label>Cotas compradas (opcional)</label><input name="cotas" inputmode="decimal" placeholder="ex.: 0,27"></div><div class="field" id="puField"><label>Preço por cota (opcional)</label><input name="pu" inputmode="decimal" placeholder="ex.: 512,30"></div></div>
      <p class="muted small" id="cotasInfo"></p>`}
      <p class="muted small" id="tesInfo"></p>
    </div>
    ${resgate ? `<div class="move-info"><span id="moveHas"></span><button type="button" class="link" id="moveAll">tirar tudo</button></div>` : ''}
    <p class="muted small">${resgate ? 'O valor tirado volta para o seu dinheiro do mês (aparece no Balanço como “Resgatou”).' : 'Sai do seu dinheiro do mês e entra no total investido.'}</p>
    <div class="sheet-actions"><span></span><div class="right"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn solid" value="save">${resgate ? 'Tirar' : 'Colocar'}</button></div></div>`,
    (action, fd) => {
      const cat = fd.get('cat');
      const valor = parseAmount(String(fd.get('valor')).trim());
      if (!valor) { toast('Digite o valor'); return false; }
      const tes = isTesouroCat(cat);
      let titulo = tes ? fd.get('titulo') : null;
      if (titulo === '__outro') titulo = String(fd.get('tituloNome') || '').trim() || null;
      if (resgate && tes && titulo && held.length) {
        if (valor > hasTit(titulo) + 0.005) { toast(`Você só tem ${money(hasTit(titulo))} em ${titulo}`); return false; }
      } else if (resgate && valor > has(cat) + 0.005) { toast(`Você só tem ${money(has(cat))} em ${catById(cat).nome}`); return false; }
      const c = catById(cat);
      const created = addExpense({ desc: titulo || c.nome, valor, data: fd.get('data'), cat, metodo: '', resgate });
      if (!resgate && !tes && readRend) {
        const r = readRend(), base = catRend(cat);
        state.rend = state.rend || {};
        if (!state.rend[cat] && !DEFAULT_REND[cat]) state.rend[cat] = { ...r, isento: false }; // primeira vez: vira o padrão
        else if (r.ind !== base.ind || r.pct !== base.pct) created[0].rend = r;             // taxa diferente só neste aporte
        save();
      }
      if (tes && titulo) {
        const g = created[0], t = tesouroByName(titulo);
        g.titulo = titulo;
        const tx = resgate ? null : parseFloat(String(fd.get('taxa') || '').replace(',', '.'));
        if (tx != null && !isNaN(tx)) g.taxa = tx;
        const puPago = resgate ? null : parseAmount(String(fd.get('pu') || '').trim());
        const cotas = resgate ? null : parseFloat(String(fd.get('cotas') || '').replace(/\./g, '').replace(',', '.'));
        if (cotas > 0) g.cotas = cotas;
        if (puPago) g.pu = puPago;
        const pu = t && (resgate ? t.puVenda : t.puCompra);
        // quantidade de títulos: operação de hoje usa o preço oficial do dia; datas passadas usam a taxa informada
        if (!puPago && !g.cotas && pu && g.data === isoDate(new Date())) g.qtd = Math.round(valor / pu * 1e6) / 1e6;
        save();
        if (!resgate && g.data !== isoDate(new Date()) && g.taxa == null && !g.pu && !g.cotas) setTimeout(() => toast('Sem a taxa da compra não dá para calcular a valorização — dá para completar depois no Extrato'), 3200);
      }
      render();
      toast(resgate ? `↩️ ${money(valor)} tirado de ${c.nome}` : `📈 ${money(valor)} colocado em ${c.nome}`, 'desfazer', () => {
        state.gastos = state.gastos.filter(g => g.id !== created[0].id); save(); render();
      });
    });
  const s = $('#sheetForm select[name=cat]'), v = $('#sheetForm input[name=valor]');
  const ts = $('#sheetForm select[name=titulo]'), tx = $('#sheetForm input[name=taxa]');
  let readRend = null;
  if (!resgate) {
    readRend = bindRendFields($('#rendBox'), 'r_');
    const setRend = () => {
      const r = catRend(s.value), box = $('#rendBox');
      box.hidden = isTesouroCat(s.value);
      $('select[name=r_ind]', box).value = r.ind;
      $('input[name=r_pct]', box).value = r.pct ? String(r.pct).replace('.', ',') : '';
      $('select[name=r_ind]', box).dispatchEvent(new Event('input'));
      $('input[name=r_pct]', box).dispatchEvent(new Event('input'));
    };
    s.addEventListener('change', setRend); setRend();
  }
  const useTit = () => isTesouroCat(s.value) && (resgate ? held.length > 0 : true);
  const avail = () => useTit() && resgate ? hasTit(ts.value) : has(s.value);
  const upd = () => {
    const tes = useTit();
    $('#tesBox').hidden = !tes;
    if (tes) {
      $('#tesOutro').hidden = ts.value !== '__outro';
      const t = tesouroByName(ts.value);
      const passado = $('#sheetForm input[name=data]').value < isoDate(new Date());
      if (tx) {
        // compra de hoje: já vem a taxa de hoje; compra antiga: a pessoa informa a taxa que pegou
        const hojeTx = t && t.taxaCompra != null ? String(t.taxaCompra).replace('.', ',') : '';
        if (!passado) tx.value = hojeTx; else if (tx.value === hojeTx || tx.dataset.auto === '1') tx.value = '';
        tx.dataset.auto = passado ? '' : '1';
        $('#taxaLbl').textContent = passado ? 'Taxa que você pegou na compra (%)' : 'Taxa da compra (% — já vem a de hoje)';
        tx.placeholder = passado ? 'veja no extrato da corretora' : 'ex.: 13,45';
      }
      if (tx && ts.value === '__outro') tx.value = '';
      $('#tesInfo').innerHTML = t ? [escapeHtml(TES_TIPOS[t.tipo].sobre), `Vence em ${parseISO(t.vencimento).toLocaleDateString('pt-BR')}.`, !resgate && t.minimo ? `Mínimo hoje: ${money(t.minimo)}.` : '', resgate && t.taxaVenda != null ? `Se vender hoje: ${taxaTexto(t.tipo, t.taxaVenda)} (o valor pode variar até o vencimento).` : ''].filter(Boolean).join(' ')
        : (!TESOURO ? 'Sem internet para buscar as taxas agora — digite o nome e a taxa.' : '');
    }
    if (resgate) $('#moveHas').textContent = `Você tem ${money(avail())} aí`;
  };
  s.addEventListener('change', upd);
  if (ts) ts.addEventListener('change', upd);
  $('#sheetForm input[name=data]').addEventListener('change', upd);
  const ci = $('#cotasInfo');
  if (ci) {
    const updC = () => {
      const t = tesouroByName(ts.value), val = parseAmount(String(v.value).trim());
      const ct = parseFloat(String($('#sheetForm input[name=cotas]').value).replace(/\./g, '').replace(',', '.'));
      const puIn = parseAmount(String($('#sheetForm input[name=pu]').value).trim());
      const hoje = $('#sheetForm input[name=data]').value === isoDate(new Date());
      if (val && ct > 0) ci.textContent = `= ${money(val / ct)} por cota.`;
      else if (val && puIn) ci.textContent = `= ${cotasFmt(val / puIn)}.`;
      else if (val && hoje && t && t.puCompra) ci.textContent = `Com ${money(val)} você compra ≈ ${cotasFmt(val / t.puCompra)} (1 cota hoje custa ${money(t.puCompra)}).`;
      else ci.textContent = hoje ? '' : 'Com a quantidade de cotas ou o preço por cota (estão no extrato da corretora), o cálculo fica exato. Sem eles, uso a taxa.';
    };
    ['input', 'change'].forEach(ev => $$('#sheetForm input').forEach(i => i.addEventListener(ev, updC)));
    ts.addEventListener('change', updC); updC();
  }
  upd();
  if (resgate) $('#moveAll').onclick = () => { v.value = String(avail()).replace('.', ','); };
}

function rendFields(r, prefix = '') {
  return `<div class="field-row rend-row">
      <div class="field"><label>Rende como?</label><select name="${prefix}ind">${Object.entries(REND_TIPOS).map(([k, t]) => `<option value="${k}" ${k === r.ind ? 'selected' : ''}>${t.nome}</option>`).join('')}</select></div>
      <div class="field" data-pct><label data-pct-label>${REND_TIPOS[r.ind].label}</label><input name="${prefix}pct" inputmode="decimal" value="${r.pct ? String(r.pct).replace('.', ',') : ''}"></div>
    </div>
    <p class="muted small" data-rend-info></p>`;
}
function bindRendFields(form, prefix = '') {
  const sel = $(`select[name=${prefix}ind]`, form), pct = $(`input[name=${prefix}pct]`, form);
  const box = $('[data-pct]', form), lab = $('[data-pct-label]', form), info = $('[data-rend-info]', form);
  const upd = (changed) => {
    const t = REND_TIPOS[sel.value];
    box.hidden = !t.label; lab.textContent = t.label;
    if (changed) pct.value = t.pct ? String(t.pct) : '';
    const r = { ind: sel.value, pct: parseFloat(String(pct.value).replace(',', '.')) || 0 };
    const a = annualRate(r), m = mercado();
    const ref = [m.cdi != null ? `CDI hoje ${pctFmt(m.cdi)}%` : '', m.selic != null ? `Selic ${pctFmt(m.selic)}%` : '', m.ipca != null ? `IPCA 12m ${pctFmt(m.ipca)}%` : ''].filter(Boolean).join(' · ');
    info.innerHTML = [t.ex, a != null ? `≈ <b>${pctFmt(Math.round(a * 100) / 100)}% ao ano</b> → R$ 1.000 vira ≈ ${money(1000 * (1 + a / 100))} em 1 ano (antes do IR).` : (sel.value !== 'nenhum' && !TESOURO ? 'Sem internet para buscar o CDI/Selic agora.' : ''), ref].filter(Boolean).join(' ');
  };
  sel.addEventListener('change', () => upd(true));
  pct.addEventListener('input', () => upd(false));
  upd(false);
  return () => ({ ind: sel.value, pct: parseFloat(String(pct.value).replace(',', '.')) || 0 });
}
function openRend(catId) {
  const c = catById(catId), r = catRend(catId);
  openSheet(`<h3>${c.emoji} Quanto rende ${escapeHtml(c.nome)}?</h3>
    <p class="muted small">Olhe no app do banco (ex.: “100% do CDI”). Eu uso a taxa de hoje para estimar quanto seu dinheiro vale. Vale para todos os aportes daqui, menos os que você marcou com outra taxa.</p>
    ${rendFields(r)}
    <label class="check"><input type="checkbox" name="isento" ${isentoIR(r, c) ? 'checked' : ''}> Isento de imposto de renda (LCI, LCA, poupança)</label>
    <div class="sheet-actions"><span></span><div class="right"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn solid" value="save">Salvar</button></div></div>`,
    (action, fd) => {
      const v = read();
      state.rend = state.rend || {};
      state.rend[catId] = { ...v, isento: !!fd.get('isento') };
      save(); render(); toast('Rentabilidade salva');
    });
  const read = bindRendFields($('#sheetForm'));
}

function openSaldo(catId) {
  const c = catById(catId);
  const p = investPositions().find(x => x.c.id === catId) || { aportado: 0, atual: null };
  openSheet(`<h3>${c.emoji} ${escapeHtml(c.nome)}</h3>
    <p class="muted small">Você aplicou <b>${money(p.aportado)}</b> aqui (aportes − resgates). Abra o app do banco/corretora e informe quanto tem hoje — eu calculo o rendimento. Novos aportes e resgates são somados a partir daqui.</p>
    <div class="field"><label>Quanto tem hoje (R$)</label><input name="valor" inputmode="decimal" value="${p.atual != null ? String(p.atual).replace('.', ',') : ''}" placeholder="ex.: ${String(Math.round(p.aportado * 1.01)).replace('.', ',')}"></div>
    <div class="sheet-actions">${p.saldo ? '<button class="btn danger" value="delete">Limpar saldo</button>' : '<span></span>'}<div class="right"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn solid" value="save">Salvar</button></div></div>`,
    (action, fd) => {
      state.saldos = state.saldos || {};
      if (action === 'delete') { delete state.saldos[catId]; save(); render(); return; }
      const v = parseAmount(String(fd.get('valor')).trim());
      if (v == null) { toast('Valor inválido'); return false; }
      state.saldos[catId] = { valor: v, data: isoDate(new Date()), ts: Date.now() };
      save(); render(); toast('Saldo atualizado');
    });
}

// ── Ajustes
function renderSettings() {
  const counts = {};
  for (const g of state.gastos) counts[g.cat] = (counts[g.cat] || 0) + 1;
  $('#catList').innerHTML = Object.entries(TIPOS).map(([t, T]) => `<li class="group-head">${T.emoji} ${T.plural}</li>` + sortedCats(t).map(c => `<li data-id="${c.id}"><span class="em">${c.emoji}</span><span class="n">${escapeHtml(c.nome)}<small>${counts[c.id] || 0} lançamentos · ${(c.palavras || []).slice(0, 6).map(escapeHtml).join(', ')}${(c.palavras || []).length > 6 ? '…' : ''}</small></span><span class="b">${+c.orcamento ? money(c.orcamento) + '/mês' : ''}</span></li>`).join('')).join('');
  $$('#catList li[data-id]').forEach(li => li.onclick = () => openCategory(li.dataset.id));
  $('#recList').innerHTML = state.fixos.length ? state.fixos.map(f => `<li data-id="${f.id}"><span class="em">${catById(f.cat).emoji}</span><span class="n">${escapeHtml(f.desc)}<small>todo dia ${f.dia} · ${TIPOS[tipoCat(catById(f.cat))].nome.toLowerCase()}</small></span><span class="b">${tipoCat(catById(f.cat)) === 'entrada' ? '+' : ''}${money(f.valor)}</span></li>`).join('') : '<li class="muted small" style="cursor:default">Nenhum lançamento fixo cadastrado.</li>';
  $$('#recList li[data-id]').forEach(li => li.onclick = () => openRecurring(li.dataset.id));
  const bytes = new Blob([localStorage.getItem(KEY) || '']).size;
  $('#storageInfo').textContent = `${state.gastos.length} lançamentos salvos neste aparelho · ${(bytes / 1024).toFixed(0)} KB`;
}

// ───────────────────────── Folhas de edição ─────────────────────────
const isOutros = id => Object.values(TIPOS).some(t => t.outros === id);
const sortedCats = t => catsOf(t).sort((a, b) => isOutros(a.id) - isOutros(b.id));
function catOptgroups(sel) {
  return Object.entries(TIPOS).map(([t, T]) => `<optgroup label="${T.emoji} ${T.plural}">${sortedCats(t).map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.emoji} ${escapeHtml(c.nome)}</option>`).join('')}</optgroup>`).join('');
}
const catOptions = catOptgroups;
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
  const t0 = tipoOf(g);
  openSheet(`<h3>Editar ${TIPOS[t0].nome.toLowerCase()}</h3>
    <div class="field"><label>Descrição</label><input name="desc" value="${escapeHtml(g.desc)}" required></div>
    <div class="field-row">
      <div class="field"><label>Valor (R$)</label><input name="valor" inputmode="decimal" value="${String(g.valor).replace('.', ',')}" required></div>
      <div class="field"><label>Data</label><input name="data" type="date" value="${g.data}" required></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Categoria</label><select name="cat">${catOptions(g.cat)}</select></div>
      <div class="field"><label>Pagamento</label><select name="metodo">${methodOptions(g.metodo)}</select></div>
    </div>
    ${g.titulo || isTesouroCat(g.cat) ? `<div class="field-row"><div class="field"><label>Título do Tesouro</label><input name="titulo" list="tesNomes" value="${escapeHtml(g.titulo || '')}" placeholder="ex.: Tesouro IPCA+ 2035"><datalist id="tesNomes">${(TESOURO ? TESOURO.titulos : []).map(t => `<option value="${escapeHtml(t.nome)}">`).join('')}</datalist></div><div class="field"><label>Taxa da compra (%)</label><input name="taxa" inputmode="decimal" value="${g.taxa != null ? String(g.taxa).replace('.', ',') : ''}" placeholder="ex.: 13,45"></div></div><div class="field-row"><div class="field"><label>Cotas</label><input name="cotas" inputmode="decimal" value="${g.cotas ? String(g.cotas).replace('.', ',') : ''}" placeholder="opcional"></div><div class="field"><label>Preço por cota</label><input name="pu" inputmode="decimal" value="${g.pu ? String(g.pu).replace('.', ',') : ''}" placeholder="opcional"></div></div>` : ''}
    <label class="check" id="resgateRow" ${t0 === 'invest' ? '' : 'hidden'}><input type="checkbox" name="resgate" ${g.resgate ? 'checked' : ''}> É um resgate (tirei dinheiro do investimento)</label>
    <div class="field"><label>Observação</label><textarea name="nota">${escapeHtml(g.nota || '')}</textarea></div>
    <div class="sheet-actions"><button class="btn danger" value="delete">Excluir${g.grupo ? ' parcelas' : ''}</button><div class="right"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn solid" value="save">Salvar</button></div></div>`,
    (action, fd) => {
      if (action === 'delete') {
        const removed = state.gastos.filter(x => g.grupo ? x.grupo === g.grupo && x.data >= g.data : x.id === g.id);
        const ids = new Set(removed.map(x => x.id));
        state.gastos = state.gastos.filter(x => !ids.has(x.id));
        save(); render();
        toast(removed.length > 1 ? `${removed.length} parcelas excluídas` : 'Excluído', 'desfazer', () => { state.gastos.push(...removed); save(); render(); });
        return;
      }
      const valor = parseAmount(fd.get('valor').trim());
      if (!valor) { toast('Valor inválido'); return false; }
      const newCat = fd.get('cat'), oldCat = g.cat, oldValor = g.valor, oldData = g.data;
      Object.assign(g, { desc: fd.get('desc').trim(), valor, data: fd.get('data'), cat: newCat, metodo: fd.get('metodo'), nota: fd.get('nota').trim() });
      if (tipoCat(catById(newCat)) === 'invest' && fd.get('resgate')) g.resgate = true; else delete g.resgate;
      if (fd.has('titulo')) {
        const nt = String(fd.get('titulo')).trim(), tx = parseFloat(String(fd.get('taxa') || '').replace(',', '.'));
        const puPago = parseAmount(String(fd.get('pu') || '').trim());
        const cotas = parseFloat(String(fd.get('cotas') || '').replace(/\./g, '').replace(',', '.'));
        if (cotas > 0) g.cotas = cotas; else delete g.cotas;
        if (nt !== (g.titulo || '') || valor !== oldValor || g.data !== oldData || (isNaN(tx) ? null : tx) !== (g.taxa ?? null) || (puPago || null) !== (g.pu || null)) delete g.qtd;
        if (nt) g.titulo = nt; else delete g.titulo;
        if (!isNaN(tx)) g.taxa = tx; else delete g.taxa;
        if (puPago) g.pu = puPago; else delete g.pu;
      }
      learn(g.desc.replace(/\s*\(\d+\/\d+\)$/, ''), newCat, oldCat);
      save(); render();
      toast('Salvo');
    });
  const sel = $('#sheetForm select[name=cat]');
  sel.onchange = () => { $('#resgateRow').hidden = tipoCat(catById(sel.value)) !== 'invest'; };
}

function openCategory(id) {
  const isNew = !id;
  const c = isNew ? { id: '', nome: '', emoji: '🏷️', palavras: [], orcamento: '' } : state.categorias.find(x => x.id === id);
  const tc = tipoCat(c);
  openSheet(`<h3>${isNew ? 'Nova categoria' : 'Editar categoria'}</h3>
    <div class="field-row" style="grid-template-columns: 80px 1fr">
      <div class="field"><label>Emoji</label><input name="emoji" value="${escapeHtml(c.emoji)}" maxlength="4" style="text-align:center;font-size:20px"></div>
      <div class="field"><label>Nome</label><input name="nome" value="${escapeHtml(c.nome)}" required></div>
    </div>
    <div class="field"><label>Tipo</label><select name="tipo" ${isOutros(c.id) ? 'disabled' : ''}>${Object.entries(TIPOS).map(([t, T]) => `<option value="${t}" ${t === tc ? 'selected' : ''}>${T.emoji} ${T.nome}</option>`).join('')}</select></div>
    <div class="field" id="orcField" ${tc === 'gasto' ? '' : 'hidden'}><label>Orçamento mensal (R$, opcional)</label><input name="orcamento" inputmode="decimal" value="${c.orcamento ? String(c.orcamento).replace('.', ',') : ''}" placeholder="ex.: 800"></div>
    <div class="field"><label>Palavras-chave (separadas por vírgula)</label><textarea name="palavras" placeholder="ex.: academia, smartfit">${escapeHtml((c.palavras || []).join(', '))}</textarea></div>
    <div class="sheet-actions">${!isNew && !isOutros(c.id) ? '<button class="btn danger" value="delete">Excluir</button>' : '<span></span>'}<div class="right"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn solid" value="save">Salvar</button></div></div>`,
    (action, fd) => {
      if (action === 'delete') {
        const dest = TIPOS[tc].outros;
        if (!confirm(`Excluir “${c.nome}”? Os lançamentos dela vão para “${catById(dest).nome}”.`)) return false;
        state.gastos.forEach(g => { if (g.cat === c.id) g.cat = dest; });
        state.fixos.forEach(f => { if (f.cat === c.id) f.cat = dest; });
        state.categorias = state.categorias.filter(x => x.id !== c.id);
        (state.removidas || (state.removidas = [])).push(c.id);
        save(); render(); return;
      }
      const data = {
        nome: fd.get('nome').trim(), emoji: fd.get('emoji').trim() || '🏷️',
        orcamento: parseAmount((fd.get('orcamento') || '').trim()) || 0,
        palavras: fd.get('palavras').split(',').map(s => norm(s)).filter(Boolean),
      };
      const tipo = isOutros(c.id) ? tc : fd.get('tipo');
      if (tipo !== 'gasto') data.orcamento = 0;
      if (isNew) addCategory(data.nome, tipo, data);
      else { Object.assign(c, data); if (tipo === 'gasto') delete c.tipo; else c.tipo = tipo; }
      save(); render();
    });
  const ts = $('#sheetForm select[name=tipo]');
  ts.onchange = () => { $('#orcField').hidden = ts.value !== 'gasto'; };
}

function openRecurring(id) {
  const isNew = !id;
  const f = isNew ? { desc: '', valor: '', dia: new Date().getDate(), cat: '', metodo: '' } : state.fixos.find(x => x.id === id);
  openSheet(`<h3>${isNew ? 'Novo lançamento fixo' : 'Editar lançamento fixo'}</h3>
    <p class="muted small">Pode ser gasto (aluguel), entrada (salário, mesada) ou investimento (aporte todo mês) — depende da categoria.</p>
    <div class="field"><label>Descrição</label><input name="desc" value="${escapeHtml(f.desc)}" placeholder="ex.: Aluguel, Salário, Caixinha" required></div>
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

function matchCategory(name, tipo) {
  const n = norm(name);
  if (!n) return null;
  const pool = tipo ? catsOf(tipo) : state.categorias;
  // "IF e Senai" = "Senai ou IF" = "IF / Senai"
  const key = s => norm(s).replace(/[^a-z0-9]+/g, ' ').split(' ').filter(w => w && !['e', 'ou', 'and', 'or'].includes(w)).sort().join(' ');
  let c = pool.find(x => norm(x.nome) === n) || pool.find(x => key(x.nome) === key(name)) || pool.find(x => norm(x.nome).includes(n) || n.includes(norm(x.nome)));
  if (!c) {
    const guess = categorize(name, tipo);
    if (!isOutros(guess.cat) && guess.certeza > 0.5) c = catById(guess.cat);
  }
  return c ? c.id : null;
}

function addCategory(nome, tipo = 'gasto', extra = {}) {
  const c = { id: uid(), nome, emoji: guessEmoji(nome), palavras: [], ...extra };
  c.nome = c.nome[0].toUpperCase() + c.nome.slice(1);
  if (tipo !== 'gasto') c.tipo = tipo;
  state.categorias.push(c);
  return c;
}
function guessEmoji(name) {
  const n = norm(name);
  if (/\b(if|senai|escola|facul|faculdade|colegio|ifsp|ifrs|ifsc|campus|universidade|cantina)\b/.test(n)) return '🏫';
  if (/cartao|fatura/.test(n)) return '💳';
  if (/amor|namor|mulher|date/.test(n)) return '❤️';
  return '🏷️';
}

function importCSV(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) { toast('CSV vazio'); return; }
  const head = rows[0].map(norm);
  const find = (...names) => head.findIndex(h => names.some(n => h === n || h.includes(n)));
  let iDesc = find('nome', 'name', 'descricao', 'description', 'gasto', 'item', 'titulo', 'title', 'o que');
  let iVal = find('valor', 'value', 'preco', 'price', 'amount', 'quantia', 'total', 'custo');
  let iDate = find('data', 'date', 'quando', 'created');
  const iTipo = head.findIndex(h => ['tipo', 'type', 'movimento', 'natureza'].includes(h));
  const iCat = head.findIndex((h, i) => i !== iTipo && ['categoria', 'category', 'tipo', 'tag', 'tags'].some(n => h === n || h.includes(n)));
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
    const tv = iTipo >= 0 ? norm(r[iTipo]) : '';
    const tipoRow = /^(entrada|receita|renda|ganho|income)/.test(tv) ? 'entrada' : /^(invest|aporte|aplica|resgate)/.test(tv) ? 'invest' : iTipo >= 0 && tv ? 'gasto' : undefined;
    const resgate = /^resgate/.test(tv);
    if (iCat >= 0 && r[iCat] && r[iCat].trim()) {
      const name = r[iCat].split(',')[0].trim();
      cat = matchCategory(name, tipoRow);
      if (!cat) { cat = addCategory(name, tipoRow || 'gasto').id; newCats++; } // cria a categoria que existe no Notion
    }
    if (!cat) cat = categorize(desc, tipoRow).cat;
    let metodo = '';
    if (iMet >= 0 && r[iMet]) { const pm = parseText('x ' + r[iMet]).metodo; metodo = pm || ''; }
    const key = `${data}|${norm(desc)}|${valor}`;
    if (known.has(key)) { skipped++; continue; }
    known.add(key);
    const g = { id: uid(), desc, valor, data, cat, metodo, nota: iNote >= 0 ? (r[iNote] || '').trim() : '', criado: Date.now() + added };
    if (resgate && tipoCat(catById(cat)) === 'invest') g.resgate = true;
    state.gastos.push(g);
    if (iCat >= 0) learn(desc, cat);
    added++;
  }
  save(); render();
  toast(`${added} lançamentos importados${skipped ? `, ${skipped} ignorados (vazios ou repetidos)` : ''}${newCats ? `, ${newCats} categorias novas` : ''}`);
}

// Cola o texto de uma página do Notion (ou do bloco de notas):
// cada linha com valor vira um gasto; linhas sem valor são títulos de seção.
// Se a linha não tem descrição, usa o título da seção como descrição e categoria.
function parsePasted(text) {
  const out = [];
  let header = '', secTipo;
  for (let line of text.split(/\r?\n/)) {
    line = line.replace(/^[-*•☐☑✓\d]+[.)]\s+/, '').replace(/^#+\s*/, '').trim();
    if (!line) continue;
    const p = parseText(line);
    if (!p.valor) {
      header = line.replace(/[:：]$/, '').trim();
      const h = norm(header);
      secTipo = /^(entradas?|receitas?|recebidos?|ganhos?|rendas?)\b/.test(h) ? 'entrada' : /^(investimentos?|aportes?|aplicacoes|guardado)\b/.test(h) ? 'invest' : /^(gastos?|saidas?|despesas?)\b/.test(h) ? 'gasto' : /^(geral|diversos|outros)$/.test(h) ? undefined : secTipo;
      continue;
    }
    const tipo = p.tipo || secTipo;
    const generic = /^(geral|gastos?|outros|diversos|total|entradas?|receitas?|recebidos?|ganhos?|investimentos?|aportes?|saidas?|despesas?)$/i.test(norm(header));
    let desc = p.desc, cat;
    if (!desc && header && !generic) {
      desc = header;
      cat = matchCategory(header, tipo);
      if (!cat) cat = addCategory(header, tipo || 'gasto').id;
    }
    desc = desc || 'Sem descrição';
    cat = cat || categorize(desc, tipo).cat;
    const item = { desc, valor: p.valor, data: p.data, metodo: p.metodo, cat };
    if (p.resgate && tipoCat(catById(cat)) === 'invest') item.resgate = true;
    out.push(item);
  }
  return out;
}
function openPaste() {
  openSheet(`<h3>Colar do Notion</h3>
    <p class="muted small">No Notion (até no celular): abra a página do mês → selecione tudo → copiar. Cole aqui. Entendo linhas como <b>R$8,00 mercado (01/07)</b>; títulos como “IF e Senai” viram categoria das linhas sem descrição.</p>
    <div class="field"><textarea name="txt" style="height:220px" placeholder="R$27,07 mercado (01/07)\nR$3,21 uber (02/07)"></textarea></div>
    <div class="sheet-actions"><span></span><div class="right"><button class="btn" value="cancel" formnovalidate>Cancelar</button><button class="btn solid" value="save">Importar</button></div></div>`,
    (action, fd) => {
      const before = JSON.stringify(state.categorias);
      const items = parsePasted(fd.get('txt') || '');
      if (!items.length) { state.categorias = JSON.parse(before); toast('Não achei nenhum valor no texto'); return false; }
      const known = new Set(state.gastos.map(g => `${g.data}|${norm(g.desc)}|${g.valor}`));
      const fresh = items.filter(g => !known.has(`${g.data}|${norm(g.desc)}|${g.valor}`));
      if (!confirm(`Encontrei ${items.length} lançamentos (${money(sum(items))}).${fresh.length < items.length ? ` ${items.length - fresh.length} já estavam no app e serão pulados.` : ''} Importar?`)) { state.categorias = JSON.parse(before); return false; }
      fresh.forEach((g, i) => { state.gastos.push({ id: uid(), ...g, nota: '', criado: Date.now() + i }); learn(g.desc, g.cat); });
      save(); render();
      toast(`${fresh.length} lançamentos importados`);
    });
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
  const lines = [['Nome', 'Valor', 'Data', 'Tipo', 'Categoria', 'Pagamento', 'Observação'].join(',')];
  for (const g of [...state.gastos].sort((a, b) => a.data.localeCompare(b.data))) {
    const t = tipoOf(g) === 'invest' && g.resgate ? 'Resgate' : TIPOS[tipoOf(g)].nome;
    lines.push([q(g.desc), g.valor.toFixed(2), g.data, q(t), q(catById(g.cat).nome), q(g.metodo ? METHODS[g.metodo].nome : ''), q(g.nota || '')].join(','));
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
  toastTimer = setTimeout(() => t.hidden = true, Math.max(actionLabel ? 6000 : 3000, msg.length * 70));
}

// ───────────────────────── Inicialização ─────────────────────────
function init() {
  ui.month = monthKey(new Date());
  $('#quickForm').addEventListener('submit', submitQuick);
  $('#micBtn').onclick = toggleMic;
  $('#micStop').onclick = pararMic;
  document.addEventListener('visibilitychange', () => { if (document.hidden) pararMic(); });
  aplicarMicVisivel();
  $('#vozBotao').checked = state.vozBotao !== false;
  $('#vozBotao').onchange = e => { state.vozBotao = e.target.checked; save(); aplicarMicVisivel(); };
  $('#vozResposta').checked = state.vozFalar === true;
  $('#vozResposta').onchange = e => { state.vozFalar = e.target.checked; save(); };
  $('#quickInput').addEventListener('input', () => { if (pending) pending.catManual = pending.catManual && $('#quickInput').value.trim() !== ''; updatePreview(); });
  $('#prevMonth').onclick = () => { ui.month = shiftMonth(ui.month, -1); render(); };
  $('#nextMonth').onclick = () => { ui.month = shiftMonth(ui.month, 1); render(); };
  $$('.tab').forEach(t => t.onclick = () => { if (t.dataset.view === 'list') { ui.cat = ''; ui.tipoFiltro = 'tudo'; } go(t.dataset.view); });
  $$('[data-goto]').forEach(b => b.onclick = () => { ui.cat = ''; go(b.dataset.goto); });
  $('#searchInput').addEventListener('input', e => { ui.search = e.target.value; renderList(); $('#searchInput').focus(); });
  $('#catFilter').addEventListener('change', e => { ui.cat = e.target.value; renderList(); });
  $('#addCat').onclick = () => openCategory(null);
  $('#invAdd').onclick = () => openMove(null, false);
  $('#invTake').onclick = () => openMove(null, true);
  $$('#tipoSeg button').forEach(b => b.onclick = () => {
    ui.tipoForce = ui.tipoForce === b.dataset.tipo ? null : b.dataset.tipo;
    if (pending) pending.catManual = false;
    if ($('#quickInput').value.trim()) updatePreview(); else updateSeg(ui.tipoForce);
    $('#quickInput').focus();
  });
  $$('#listSeg button').forEach(b => b.onclick = () => { ui.tipoFiltro = b.dataset.tipo; ui.cat = ''; renderList(); });
  $('#addRec').onclick = () => openRecurring(null);
  $('#exportCsv').onclick = exportCSV;
  $('#pasteBtn').onclick = openPaste;
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
  loadRates();
  if (pre) { $('#quickInput').value = pre; updatePreview(); history.replaceState(null, '', location.pathname); }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}

if (typeof window !== 'undefined' && document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
