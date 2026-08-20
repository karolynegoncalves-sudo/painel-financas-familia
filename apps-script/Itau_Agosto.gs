/* ============================================================
   ITAU - conta corrente (20/07 a 19/08/2026) + cartao Platinum 6111
   Fonte: itau_extrato_072026.pdf e Fatura_Itau_20260819-073209.pdf

   Destaques ja tratados aqui:
     - 17/08 -5.600,00 e 19/08 -926,00 = pagamento da fatura do
       Bradesco. Viram INTERNA, nao gasto.
     - 10/08 -2.865,00 JORGE H = entrada do dentista do Vinicius.
       Vira INTERNA porque ja esta contada na aba Dividas.
     - 10/08 -350,00 MARCOS = almoco de domingo (Restaurante).
     - 12/08 -200,00 CREUZA = garagem do carro da Carmovel (PJ).
     - SISPAG JGS COMERCIO = renda PJ do Vinicius.
     - 07/08 -199,00 Michele = PIX do cancelamento do seguro que
       voltaram atras. O dinheiro saiu mas a despesa NAO aconteceu:
       fica como adiantamento (INTERNA). Quando cancelarem de
       verdade, troque a Flag para GASTO e a sub para
       Seguro/Rastreador - ai sim vira despesa do mes.

   COMO USAR: rode  importarItau  uma vez.
   Anexa no fim de Lancamentos e pula o que ja existir.
   Linhas "A identificar" ficam AMARELAS, o resto VERDE.
   ============================================================ */

var ITAU_AGO = [
  ['20/07/2026','SISPAG PIX JGS COMERCIO DE M','5000,00','Entrada','Conta Itaú','Vinícius','Renda','PJ Carmovel (Vinícius)','RENDA','2026-07'],
  ['20/07/2026','FATURA ITAU VS PLATINUM','46,95','Saida','Conta Itaú','Vinícius','Movimentação','Pagamento de cartão / transf. casal','INTERNA','2026-07'],
  ['20/07/2026','PAG BOLETO ITURAN SERVICOS LTDA','189,20','Saida','Conta Itaú','Família','Transporte','Seguro/Rastreador','GASTO','2026-07'],
  ['20/07/2026','PAG BOLETO CENTRO DE ENSINO SUPERIOR ST','754,63','Saida','Conta Itaú','Vinícius','Educação','Faculdade','GASTO','2026-07'],
  ['27/07/2026','PIX TRANSF Mauro A25/07','80,00','Saida','Conta Itaú','Vinícius','A identificar','','GASTO','2026-07'],
  ['27/07/2026','PIX TRANSF HENRIQU27/07','14,00','Saida','Conta Itaú','Vinícius','Alimentação','Delivery','GASTO','2026-07'],
  ['27/07/2026','REND PAGO APLIC AUT MAIS','0,14','Entrada','Conta Itaú','Vinícius','Renda','Estornos/Rendimentos','RENDA','2026-07'],
  ['31/07/2026','PIX TRANSF ROBERT 31/07 (placa)','100,00','Saida','Conta Itaú','Vinícius','Transporte','Impostos/Docs veículo','GASTO','2026-07'],
  ['31/07/2026','REND PAGO APLIC AUT MAIS','0,16','Entrada','Conta Itaú','Vinícius','Renda','Estornos/Rendimentos','RENDA','2026-07'],
  ['05/08/2026','SISPAG PIX JGS COMERCIO DE M','4738,90','Entrada','Conta Itaú','Vinícius','Renda','PJ Carmovel (Vinícius)','RENDA','2026-08'],
  ['07/08/2026','PIX QRS Jaqueline E07/08','6,00','Saida','Conta Itaú','Vinícius','Alimentação','Delivery','GASTO','2026-08'],
  ['07/08/2026','PIX TRANSF Michele07/08 (adiantamento cancelamento seguro - nao usado)','199,00','Saida','Conta Itaú','Vinícius','Movimentação','Adiantamento a apropriar','INTERNA','2026-08'],
  ['07/08/2026','PIX TRANSF CORREIA07/08','771,00','Saida','Conta Itaú','Vinícius','A identificar','','GASTO','2026-08'],
  ['07/08/2026','REND PAGO APLIC AUT MAIS','1,63','Entrada','Conta Itaú','Vinícius','Renda','Estornos/Rendimentos','RENDA','2026-08'],
  ['10/08/2026','PIX TRANSF JORGE H08/08 (entrada dentista Vinicius)','2865,00','Saida','Conta Itaú','Vinícius','Movimentação','Dívida odontológica (entrada)','INTERNA','2026-08'],
  ['10/08/2026','PIX TRANSF MARCOS 09/08 (almoço de domingo)','350,00','Saida','Conta Itaú','Família','Alimentação','Restaurante','GASTO','2026-08'],
  ['10/08/2026','PIX QRS ITAU UNIBAN09/08','120,49','Saida','Conta Itaú','Vinícius','A identificar','','GASTO','2026-08'],
  ['10/08/2026','REND PAGO APLIC AUT MAIS','4,88','Entrada','Conta Itaú','Vinícius','Renda','Estornos/Rendimentos','RENDA','2026-08'],
  ['11/08/2026','PIX QRS Jaqueline E11/08','3,00','Saida','Conta Itaú','Vinícius','Alimentação','Delivery','GASTO','2026-08'],
  ['11/08/2026','PIX QRS MONETIZZE I11/08','15,00','Saida','Conta Itaú','Vinícius','Alimentação','Padaria','GASTO','2026-08'],
  ['11/08/2026','REND PAGO APLIC AUT MAIS','0,03','Entrada','Conta Itaú','Vinícius','Renda','Estornos/Rendimentos','RENDA','2026-08'],
  ['12/08/2026','PIX TRANSF CREUZA 12/08','200,00','Saida','Conta Itaú','Família','Despesa PJ','Garagem carro Carmovel','PJ','2026-08'],
  ['12/08/2026','PIX QRS JULIO CESAR12/08','3,00','Saida','Conta Itaú','Vinícius','Alimentação','Delivery','GASTO','2026-08'],
  ['12/08/2026','SISPAG PIX JGS COMERCIO DE M','771,00','Entrada','Conta Itaú','Vinícius','Renda','PJ Carmovel (Vinícius)','RENDA','2026-08'],
  ['17/08/2026','PIX QRS BRADESCO ES17/08 (pagto fatura)','5600,00','Saida','Conta Itaú','Família','Movimentação','Pagamento de cartão / transf. casal','INTERNA','2026-08'],
  ['17/08/2026','REND PAGO APLIC AUT MAIS','7,56','Entrada','Conta Itaú','Vinícius','Renda','Estornos/Rendimentos','RENDA','2026-08'],
  ['19/08/2026','PIX QRS BRADESCO ES19/08 (pagto fatura)','926,00','Saida','Conta Itaú','Família','Movimentação','Pagamento de cartão / transf. casal','INTERNA','2026-08'],
  ['27/07/2026','CONTA VIVO','47,00','Saida','Cartão Itaú 6111','Vinícius','Telefonia/Internet','Telefonia','GASTO','2026-07'],
  ['15/08/2026','Casa de carnes familia','30,32','Saida','Cartão Itaú 6111','Família','Alimentação','Açougue','GASTO','2026-08'],
  ['15/08/2026','Restaurante pequeno','88,50','Saida','Cartão Itaú 6111','Família','Alimentação','Restaurante','GASTO','2026-08'],
  ['17/08/2026','Raiz forte sushi poke','79,00','Saida','Cartão Itaú 6111','Família','Alimentação','Restaurante','GASTO','2026-08'],
  ['17/08/2026','Rm embalagens','27,75','Saida','Cartão Itaú 6111','Família','Moradia','Itens para casa','GASTO','2026-08']
];

function importarItau(){
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Lan\u00e7amentos');
  if(!sh){ Logger.log('Nao achei a aba Lancamentos.'); return; }

  var v = sh.getDataRange().getValues(), ja = {};
  for(var i=1;i<v.length;i++){
    if(!v[i][0] && !v[i][1]) continue;
    ja[chaveDup_(v[i][0], v[i][1], v[i][2])] = true;
  }

  var novos = [], pulados = 0;
  ITAU_AGO.forEach(function(r){
    var k = chaveDup_(r[0], r[1], r[2]);
    if(ja[k]){ pulados++; return; }
    ja[k] = true;
    novos.push(r);
  });

  if(novos.length){
    var ini = sh.getLastRow() + 1;
    sh.getRange(ini, 1, novos.length, novos[0].length).setValues(novos);
    for(var j=0;j<novos.length;j++){
      var cor = (String(novos[j][6]).indexOf('identificar') >= 0) ? '#fff2cc' : '#e8f5e9';
      sh.getRange(ini + j, 1, 1, novos[0].length).setBackground(cor);
    }
  }

  var gasto = 0, renda = 0, aid = 0;
  novos.forEach(function(r){
    var val = Math.abs(nuI_(r[2]));
    if(r[8] === 'GASTO') gasto += val;
    if(r[8] === 'RENDA') renda += val;
    if(String(r[6]).indexOf('identificar') >= 0) aid++;
  });
  var msg = 'Importados ' + novos.length + ' lancamentos do Itau.'
          + '\n  gastos: R$ ' + gasto.toFixed(2) + '   |   renda: R$ ' + renda.toFixed(2)
          + '\n' + pulados + ' ja existiam e foram ignorados.'
          + '\n' + aid + ' estao AMARELOS = precisam que voce diga o que sao.';
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch(e){}
}

function nuI_(x){
  if(typeof x === 'number') return x;
  var s = String(x||'').replace(/[^0-9,.\-]/g,'').replace(/\./g,'').replace(',','.');
  var n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/* >>> desfaz exatamente o que essa importacao colocou */
function desfazerItau(){
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Lan\u00e7amentos');
  var alvo = {};
  ITAU_AGO.forEach(function(r){ alvo[chaveDup_(r[0], r[1], r[2])] = true; });
  var v = sh.getDataRange().getValues(), apagou = 0;
  for(var i=v.length-1;i>=1;i--){
    if(!v[i][0] && !v[i][1]) continue;
    if(alvo[chaveDup_(v[i][0], v[i][1], v[i][2])]){ sh.deleteRow(i+1); apagou++; }
  }
  Logger.log('Removidas ' + apagou + ' linhas do Itau.');
}

/* >>> atualiza a aba Reservas com os saldos de 19/08/2026 */
function atualizarReservasAgosto(){
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservas');
  if(!sh){ Logger.log('Nao achei a aba Reservas.'); return; }
  var novos = { 'itau - conta':9062.34, 'itau conta':9062.34,
                'nubank (caixinha)':6634.86, 'nubank caixinha':6634.86, 'nubank':6634.86,
                'bradesco (conta)':185.00, 'bradesco conta':185.00, 'bradesco':185.00 };
  var v = sh.getDataRange().getValues(), n = 0, log = [];
  for(var i=1;i<v.length;i++){
    var nome = sa_(v[i][0]).replace(/\u2014/g,'-').replace(/\s*-\s*/g,' ').trim();
    if(novos[nome] === undefined) continue;
    log.push(v[i][0] + ': ' + v[i][1] + ' -> ' + novos[nome]);
    sh.getRange(i+1, 2).setValue(novos[nome]);
    n++;
  }
  Logger.log('Reservas atualizadas: ' + n + '\n' + log.join('\n')
             + '\n\nItau INVESTIDO nao foi mexido - atualize a mao quando tiver o valor.');
}
