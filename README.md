# 💸 Gastos

Um app de controle de gastos que abre como aplicativo no celular (sem barra do navegador), funciona offline e **categoriza sozinho** o que você digita.

## Como usar

Digite do jeito que você falaria e aperte Enter:

| Você digita | O app entende |
|---|---|
| `mercado 87,90` | R$ 87,90 · 🛒 Mercado · hoje |
| `uber 23 ontem pix` | R$ 23,00 · 🚗 Transporte · ontem · Pix |
| `ifood 45,50 no crédito` | R$ 45,50 · 🍔 Restaurante & Delivery · Crédito |
| `tênis nike 600 3x` | 3 parcelas de R$ 200 em Compras (uma por mês) |
| `gasolina 200 12/10` | R$ 200 · Transporte · 12 de outubro |
| `barbearia 50 sábado` | R$ 50 · 💇 Cuidados pessoais · último sábado |
| `r$ 1.250 aluguel` | R$ 1.250,00 · 🏠 Moradia |

Antes de salvar aparece uma prévia; se a categoria estiver errada, toque nela e troque.
**O app aprende:** depois que você corrige uma vez (“padoca” → Mercado), ele acerta sozinho nas próximas.

## O que tem

- **Início:** total do mês, comparação com o mesmo período do mês passado, previsão de quanto o mês vai fechar, quanto ainda pode gastar por dia, gastos por categoria e os últimos lançamentos.
- **Gastos:** lista por dia, busca (em todos os meses) e filtro por categoria. Toque num gasto para editar ou excluir (com “desfazer”).
- **Análise:** alertas automáticos (“Delivery está 40% acima do mês passado”, orçamento estourado, hábitos que se repetem), gasto por dia, últimos 6 meses, forma de pagamento e maiores gastos.
- **Ajustes:**
  - categorias com emoji, **orçamento mensal** e palavras-chave próprias;
  - **gastos fixos** (aluguel, academia, streaming…) lançados automaticamente todo mês;
  - **importar do Notion** (CSV) e **exportar para o Notion**;
  - backup/restauração em JSON.

## Trazendo seus gastos do Notion

1. No Notion, abra o banco **Gastos** → `⋯` → **Exportar** → formato **Markdown & CSV**.
2. Descompacte o .zip e, no app, vá em **Ajustes → Importar CSV do Notion**.

O app reconhece sozinho as colunas (nome/descrição, valor, data, categoria, pagamento) — em português ou inglês, com `R$ 1.234,56` ou `1234.56`, datas como `09/11/2026` ou `November 9, 2026`. Linhas sem categoria são categorizadas automaticamente, e lançamentos repetidos são ignorados (dá pra importar de novo sem duplicar).

Para mandar de volta: **Ajustes → Exportar CSV** e, no Notion, `⋯` → **Mesclar com CSV**.

## Colocando no celular

O app é só arquivos estáticos, então dá pra hospedar de graça no **GitHub Pages**:

1. Faça merge desta branch na `main`.
2. No GitHub: **Settings → Pages → Source: GitHub Actions**. O workflow `.github/workflows/pages.yml` publica sozinho a cada push na `main`.
   (Repositório privado precisa de plano pago para Pages — se for o caso, deixe o repo público; seus *dados* nunca vão pro GitHub, ficam só no aparelho.)
3. Abra o link no celular e:
   - **iPhone (Safari):** Compartilhar → **Adicionar à Tela de Início**.
   - **Android (Chrome):** menu `⋮` → **Instalar app**.

Pronto: ícone na tela inicial, abre em tela cheia e funciona sem internet.

**Atalho extra (iPhone):** crie um Atalho “Abrir URL” com `https://SEU-LINK/?add=` + “Pedir entrada” para lançar pela Siri: *“E aí Siri, gasto”* → “café 8 pix” → o app abre com o gasto preenchido, é só confirmar.

Para testar no computador: `python3 -m http.server` na pasta e abra `http://localhost:8000`.

## Seus dados

Tudo fica salvo **só no aparelho** (localStorage), sem servidor e sem conta. Por isso:

- use **Ajustes → Salvar backup** de vez em quando (e para levar os dados a outro aparelho);
- no iPhone, use pela tela de início (o Safari pode limpar dados de sites que você não abre há semanas — apps instalados não).

## Arquivos

```
index.html            estrutura das telas
styles.css            visual (tema claro/escuro automático)
app.js                lógica: leitura do texto, categorização, gráficos, importação
sw.js                 funcionamento offline
manifest.webmanifest  instalação como app
icons/                ícones
```

Para adicionar palavras-chave padrão, edite `DEFAULT_CATEGORIES` no começo do `app.js` (ou faça pelo próprio app em Ajustes).
