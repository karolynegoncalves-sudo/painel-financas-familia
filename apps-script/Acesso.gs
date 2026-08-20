/**
 * Acesso.gs — confere o login Google (id_token) contra a allowlist ALLOWED.
 * Reaproveita o mesmo Client ID do painel Leve Sonho.
 */
var GOOGLE_CLIENT_ID = '220743716320-ia319tnsqqj0mlr7hre4bi0m6qi658vm.apps.googleusercontent.com';

// >>> Adicione aqui os e-mails que podem ver o painel (minúsculas):
var ALLOWED = [
  'karolyne.goncalves@esags.edu.br',
  'vinicius.negrao26@gmail.com'
];

function verificarAcesso_(idToken) {
  if (!idToken) return null;
  try {
    var resp = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
      { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return null;
    var c = JSON.parse(resp.getContentText());
    if (c.aud !== GOOGLE_CLIENT_ID) return null;
    if (c.email_verified !== 'true' && c.email_verified !== true) return null;
    var email = String(c.email || '').toLowerCase();
    if (!email) return null;
    if (ALLOWED.map(function(e){return e.toLowerCase();}).indexOf(email) === -1) return null;
    return email;
  } catch (err) { return null; }
}
