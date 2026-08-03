# Painel de Finanças da Família — Karol & Vinícius

Painel privado do casal, com login Google e acesso restrito (só quem está na lista de convidados vê).
Mesmo padrão do painel Leve Sonho: **frontend no GitHub Pages** + **backend no Google Apps Script**.

Os **dados NÃO ficam neste repositório** — eles moram no Apps Script (privado) e só são servidos depois do login autorizado. O repositório só tem a "casca" (telas e gráficos).

## Como colocar no ar (uma vez)

### 1) Backend (Google Apps Script) — onde ficam os dados
1. Acesse [script.google.com](https://script.google.com) → **Novo projeto**.
2. Crie dois arquivos e cole o conteúdo:
   - `Acesso.gs` → cole o arquivo **Acesso.gs**.
   - `Codigo.gs` → cole o arquivo **Codigo_COM_DADOS.gs** (é o que tem os números).
3. No `Acesso.gs`, na lista `ALLOWED`, troque `EMAIL_DO_VINICIUS_AQUI@gmail.com` pelo e-mail Google do Vinícius.
4. **Implantar** → **Nova implantação** → engrenagem → **App da Web**:
   - *Executar como:* **Eu (você)**
   - *Quem tem acesso:* **Qualquer pessoa**
   - Clique **Implantar**, autorize com sua conta, e **copie a URL** que termina em `/exec`.

### 2) Frontend (este repositório)
1. Edite `docs/js/config.js` → cole a URL `/exec` em `APPS_SCRIPT_URL` (o `GOOGLE_CLIENT_ID` já está preenchido).
2. Salve/commite.
3. Em **Settings → Pages**, confirme que está publicando a partir da pasta `/docs` (branch `main`).

### 3) Acessar
- Abra: `https://karolynegoncalves-sudo.github.io/painel-financas-familia/`
- Entre com a conta Google. Só quem está na lista `ALLOWED` consegue ver.

## Atualizar os dados no futuro
Quando tiver extratos novos, é só me pedir um `Codigo_COM_DADOS.gs` atualizado e colar de novo no Apps Script (o resto continua igual).
