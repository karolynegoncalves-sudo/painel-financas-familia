# Painel de Finanças da Família — guia do repositório

Painel financeiro que a Karolyne e o Vinícius usam de verdade, todo dia. **Não é um projeto de estudo:** o que você publicar aqui vai ao ar na hora e é o que eles vão olhar para decidir se saem de casa alugada. Leia antes de mexer.

## O que este repositório é — e o que não é

**É** só o frontend: HTML, CSS e JavaScript puro servidos pelo GitHub Pages em
https://karolynegoncalves-sudo.github.io/painel-financas-familia/

**Não é** onde ficam os dados nem o backend. Os lançamentos vivem numa planilha Google privada, e a lógica de cálculo num projeto Apps Script privado, ambos da Karolyne. **Você não tem acesso a nenhum dos dois** — se a mudança pedida exigir alterar o cálculo, diga isso e peça para ela falar com o Claude dela.

Nunca versione dado real aqui. O `.gitignore` já barra `.csv`, `.xlsx`, `.pdf`, `.gs` e a pasta `apps-script/`. O histórico deste repositório foi reescrito em setembro de 2026 justamente porque um arquivo com lançamentos bancários reais foi commitado por engano.

## Como funciona

```
navegador  ──login Google (GIS)──►  id_token
    │
    └── fetch(APPS_SCRIPT_URL?token=…)  ──►  Apps Script (privado)
                                                  │  confere o e-mail
                                                  │  numa allowlist
                                                  ▼
                                             lê a planilha,
                                             calcula tudo,
                                             devolve um JSON
```

O frontend **não calcula quase nada** — ele recebe o objeto `D` pronto e desenha. Se um número está errado, quase sempre o problema é no backend, não aqui.

## Arquivos

| Arquivo | O quê |
|---|---|
| `docs/index.html` | Estrutura de todas as abas. Os `id`s daqui são o contrato com o JS. |
| `docs/js/app.js` | Tudo: render, gráficos, filtros, formulário. ~1.260 linhas. |
| `docs/js/config.js` | `GOOGLE_CLIENT_ID` e `APPS_SCRIPT_URL`. Não invente valores novos. |
| `docs/css/style.css` | Estilos. O painel é sempre claro — o modo escuro está forçado para a mesma paleta de propósito. |
| `docs/img/`, `manifest.webmanifest` | Ícones e atalho de tela de início. |

## O objeto `D` (o que o backend devolve)

```js
D = {
  email,                       // e-mail de quem entrou
  kpi: { renda, rendaRecorrente, gasto, sobra, reserva, invest_mes, taxa },
  custoVida: {
    fixo, variavel, parcelas, total,
    fixoDet: {sub: valor}, varDet: {sub: valor},
    extra, extraDet: {sub: valor},        // gasto extraordinário recorrente
    extraPontual, extraFora: {sub: valor} // o que a regra dos 3 meses tirou
  },
  macro: {macro: valor},            // média/mês por categoria
  sub:   {macro: {sub: valor}},
  mensal:    {Mes: {receita, despesa, saldo}},
  mes_macro: {Mes: {macro: valor}},
  mes_sub:   {Mes: {macro: {sub: valor}}},
  p3, p3tot, p3sub,                 // por pessoa (Família / Karol / Vinícius)
  mes_p3, mes_p3sub,
  fluxo, lanc,                      // fluxo de caixa e a lista de lançamentos
  reservas, dividas, mesAtual, food, subflat, rendasub, tris,
  agenda: { fimFaculdade: '2027-12', faculdadeMes }
}
```

Cada linha de `D.lanc` é um array posicional — use as constantes `LC` do `app.js`, nunca índices soltos:

```js
const LC={MES:0,DATA:1,DESC:2,VALOR:3,CONTA:4,PESSOA:5,MACRO:6,SUB:7,FLAG:8,ENT:9,LINHA:10};
```

`MESES` são rótulos curtos (`'Jan'`, `'Set'`), **não** `'2026-09'`. O filtro global é `filtroMes`, que vale `'Ano'` ou um desses rótulos.

## Abas e quem desenha cada uma

Definidas na constante `TABS` no topo do `app.js`. Cada aba `x` tem uma `<section id="p-x">` no HTML.

| Aba | Função |
|---|---|
| Visão geral | `renderVisao` (+ `drawCombo`, `drawDonut`, `drawGauge`, `drawSaldoContas`) |
| Fluxo de caixa | `renderFluxo`, `renderExtrato`, `renderSemanas`, `montarFormNovo` |
| Categorias & subcategorias | `renderCat` |
| Família / Karol / Vinícius | `renderPessoa` |
| Metas & delivery | `renderMetas`, `renderRitmo`, `ajustarSlidersComida` |
| Custo de vida | `renderCusto` |
| Dívidas | `renderDividas` |
| Projeção 2027 | `renderProj`, `renderIphone` |
| Patrimônio | `renderPatrimonio` |
| Análises & estratégias | `renderAnalises` |

`renderAll()` chama todas. Se você criar uma aba nova, registre em `TABS`, crie a `<section id="p-…">` e chame o render em `renderAll`.

## Convenções

**Sem build e sem dependência.** JavaScript puro, sem framework, sem bundler, sem CDN. Gráficos são SVG e CSS escritos à mão (`pieSVG`, `arc`, `barsHTML`, `drawCombo`…). Mantenha assim — não introduza biblioteca.

**Estilo do código:** `var` e `function` no corpo antigo, `const`/arrow nos trechos novos. Siga o arquivo ao redor. Comentários em português, sem acento, explicando *por quê* e não *o quê*.

**Cache-buster obrigatório.** O `index.html` referencia css e js com `?v=NN` em **três** lugares. Toda vez que mexer em `app.js` ou `style.css`, **incremente os três** — senão o navegador e o atalho de tela de início servem a versão velha, e isso já custou horas de confusão achando que era bug.

**Dinheiro em pt-BR.** `BRL(v)` formata. E ao mandar valor para o backend use `valorBR_(v)`: o backend lê ponto como separador de **milhar**, então `27.8` vira `278` e `27,80` vira `27,8`.

**Cores e ícones** por categoria estão nas constantes `CORES` e `ICON`. Reaproveite; não invente cor nova por aba.

## Escrita no backend

O painel escreve na planilha por dois caminhos, ambos via `GET` no `APPS_SCRIPT_URL` com o `token`:

- `?acao=novo` — cria lançamento (formulário "+ Novo lançamento")
- `?acao=editar` — troca conta ou pessoa de uma linha (edição na lista)

O backend recusa duplicata pela chave `data + descrição + valor`. **Por isso: nunca escreva código que altere a descrição de um lançamento existente** — o anti-duplicata deixa de reconhecer a linha e reimporta tudo na importação seguinte. Já duplicou R$ 5.000 de renda assim.

## Publicar

`main` é o que está no ar. Push na `main` reconstrói o Pages em ~1 minuto e o painel muda **para as duas pessoas na mesma hora**.

Antes de dar push:
1. Abra `docs/index.html` no navegador e confira que não há erro no console. Sem login os dados não carregam, mas erro de sintaxe aparece.
2. Confirme que você incrementou o `?v=NN` nos três lugares.
3. Prefira trabalhar em branch e avisar a Karolyne antes de publicar na `main`.

Se quebrar, `git revert` do último commit e push resolve.

## O que não fazer

1. Não commite dado real — nenhum extrato, fatura, CSV ou export da planilha.
2. Não mude `config.js` sem que a Karolyne tenha reimplantado o Apps Script.
3. Não introduza biblioteca externa nem etapa de build.
4. Não mexa em `docs/img/` — o ícone do atalho já está funcionando nos celulares dos dois.
5. Não altere os `id`s do `index.html` sem ajustar o `app.js`: o acoplamento é por `getElementById`.
6. Não escreva regra de negócio no frontend. Se o cálculo está errado, o conserto é no Apps Script, que é da Karolyne.
