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

### Entradas e investimentos

O app também registra o que **entra** e o que você **investe**. O tipo é detectado pelo texto (ou escolha em 💸 Gasto · 💰 Entrada · 📈 Investir, logo abaixo da caixa):

| Você digita | O app entende |
|---|---|
| `recebi mesada 300` · `salário 1500` · `+50 pix do joão` | 💰 entrada (Mesada, Salário, Outras entradas) |
| `pé de meia 200` · `recebi bolsa 400` · `vendi bicicleta 250` | 💰 Bolsa & Estágio, Vendas |
| `guardei 100 na caixinha` · `investi 200 no tesouro` | 📈 investimento (Caixinha/CDB, Tesouro Direto) |
| `resgatei 50 da poupança` | ↩️ resgate (tira do investimento) |

- **Início → Balanço do mês:** entrou, gastou, investiu e quanto sobrou.
- **Aba Investir:** total investido, onde está cada parte, aportes por mês. Toque num destino e informe o saldo que aparece no banco para ver o **rendimento**.
- **Quanto rende:** cada investimento tem sua rentabilidade (ex.: caixinha 100% do CDI, CDB 110% do CDI, prefixado 13% ao ano, IPCA + 6%, poupança). O app usa o CDI/Selic/IPCA do dia (Banco Central) para estimar quanto vale hoje e quanto sobra depois do imposto de renda. Dá para digitar: `guardei 500 no cdb 110% do cdi`.
- **Tesouro Direto:** lista de títulos com as taxas oficiais do dia (Selic, Prefixado, IPCA+, Renda+, Educa+…). Ao investir você escolhe o título e o app estima o valor pelo preço oficial. As taxas são buscadas por um robô do GitHub (`scripts/tesouro.py`) a cada 2h em dias úteis.
- **Análise → Entradas × saídas:** os últimos 6 meses lado a lado.
- **Lançamentos fixos** aceitam entradas também (ex.: mesada todo dia 1).

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

**Jeito mais fácil (funciona no celular):** abra a página do mês no Notion, selecione tudo, copie e use **Ajustes → Colar texto do Notion**. Linhas como `R$8,00 mercado (01/07)` viram gastos; títulos como “IF e Senai” viram a categoria das linhas sem descrição.

**Ou pelo arquivo:**

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
