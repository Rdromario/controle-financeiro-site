# Controle Financeiro Familiar - Site

Site simples (login + lançamento + resumo) para você e sua esposa lançarem
rendas e gastos direto do celular, com os dados salvos num banco de dados
no próprio Cloudflare (D1). Segue o mesmo fluxo que você já usa: repositório
no GitHub, deploy automático via Cloudflare Pages.

## Estrutura

```
index.html          -> tela de lançamento (formulário)
resumo.html          -> painel com totais e gastos por categoria
login.html           -> tela de PIN de acesso
style.css / app.js   -> estilo e categorias (iguais às da planilha)
schema.sql           -> estrutura da tabela do banco de dados
functions/api/...    -> backend (Cloudflare Pages Functions)
```

## Passo a passo

**1. Suba os arquivos para um repositório novo no GitHub**
Do jeito que você já faz nos sites de cliente — pode arrastar e soltar todos
os arquivos e pastas (mantendo a pasta `functions` intacta).

**2. Conecte o repositório ao Cloudflare Pages**
Igual você já faz: Workers & Pages → Create → Pages → conectar ao repositório.
Não precisa configurar build (é HTML puro) — deixe "Build command" vazio e
"Build output directory" como `/`.

**3. Crie o banco de dados D1**
No painel do Cloudflare: **Workers & Pages → D1 → Create database**.
Dê um nome, por exemplo `controle-financeiro`.

Depois, abra o banco criado → aba **Console** → cole o conteúdo do arquivo
`schema.sql` e execute. Isso cria a tabela `lancamentos`.

**4. Ligue o banco de dados ao site**
No seu projeto Pages: **Settings → Functions → D1 database bindings → Add binding**.
- Variable name: `DB` (exatamente assim, é o nome que o código espera)
- D1 database: selecione `controle-financeiro`

**5. Defina o PIN de acesso**
No mesmo projeto: **Settings → Environment variables → Add variable**.
- Name: `APP_PIN`
- Value: o PIN que vocês vão usar (ex: `2026` ou algo só vocês saibam)
- Marque como "Encrypt" para não ficar visível
- Faça isso tanto em Production quanto em Preview

**6. Faça um novo deploy**
Depois de configurar o binding e a variável, force um novo deploy
(qualquer commit novo, ou "Retry deployment" no painel) para as
configurações entrarem em vigor.

**7. Pronto**
Acesse o link do Cloudflare Pages, digite o PIN e comecem a lançar.
Compartilhe o mesmo link e o mesmo PIN com sua esposa.

## Observações

- Este é um controle simples para uso familiar — o PIN evita que qualquer
  pessoa com o link acesse, mas não é um sistema de login robusto.
- As categorias em `app.js` são as mesmas da planilha que você já tem.
  Se quiser adicionar/remover categorias, edite o objeto `CATEGORIAS`
  nesse arquivo (nas três páginas ele é carregado igual).
- Para editar um lançamento, o mais simples por enquanto é excluir e
  lançar de novo — dá pra adicionar edição depois se quiser.
