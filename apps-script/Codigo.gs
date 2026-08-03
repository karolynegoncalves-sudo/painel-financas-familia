/**
 * Codigo.gs — Web App que serve os dados do painel só para quem está na allowlist.
 * Implantar: Implantar > Nova implantação > Tipo "App da Web".
 *   Executar como: Eu (você).  Quem tem acesso: Qualquer pessoa.
 * Copie a URL /exec e cole em docs/js/config.js (APPS_SCRIPT_URL).
 */

var DADOS = { /* SEM DADOS AQUI POR SEGURANCA. Use o arquivo Codigo_COM_DADOS.gs (enviado a parte) ao colar no Apps Script. */ };

function doGet(e) {
  var token = (e && e.parameter && e.parameter.token) ? e.parameter.token : '';
  var email = verificarAcesso_(token);
  if (!email) return _json({ error: 'not_authorized' });
  var out = { email: email };
  for (var k in DADOS) out[k] = DADOS[k];
  return _json(out);
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
