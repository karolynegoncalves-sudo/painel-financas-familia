/**
 * Regras.gs — palavras-chave -> [Macro, Subcategoria, Flag]
 * Flag: GASTO | RENDA | INVESTIMENTO | INTERNA | CUSTODIA | PATRIMONIO | PJ
 * A 1ª regra que casar vence — as mais específicas vêm antes.
 */
var REGRAS = [
  // --- não-consumo (vem antes) ---
  [['pagamento da fatura','pagto fatura','fatura cartao','cartao de credito','faturaitau','fatura itau','gastos cartao','bradesco es','karolyn','karolyne go'], 'Movimentação','Pagamento de cartão / transf. casal','INTERNA'],
  [['aplicacao cofrinho','aplicacao cdb','resgate cdb','cofrinho','emprestimo leve sonho','devolucao de emprest'], 'Movimentação','Investimento/Poupança','INVESTIMENTO'],
  [['dinheiro da mae','saque dinheiro mae','noemi'], 'Movimentação','Custódia (mãe Noemi)','CUSTODIA'],
  [['entrada carro','entrada do onix'], 'Patrimônio','Entrada do Onix','PATRIMONIO'],
  [['aluguel garagem','valeria','creuza','creusa'], 'Despesa PJ','Garagem carro Carmovel','PJ'],
  // --- receitas ---
  [['pro-labore','pro labore','prolabore'], 'Renda','Pró-labore (Karol)','RENDA'],
  [['freelance','le sorelle','le sorele'], 'Renda','Freelance Le Sorelle (Karol)','RENDA'],
  [['vendas'], 'Renda','Vendas','RENDA'],
  [['kaike'], 'Renda','Reembolso convênio (Kaike)','RENDA'],
  [['sispag','carmovel','jgs comercio'], 'Renda','PJ Carmovel (Vinícius)','RENDA'],
  [['distribuicao lucro','lucro fechos'], 'Renda','Distribuição de lucro','RENDA'],
  [['estorno','restituicao','rend pago aplic','rendimento','pix recebido'], 'Renda','Estornos/Rendimentos','RENDA'],
  [['salario'], 'Renda','Salário/Pró-labore','RENDA'],
  // --- Saúde e Bem-estar ---
  [['convenio','amil','qualicorp','unimed'], 'Saúde e Bem-estar','Convênio','GASTO'],
  [['psicolog','terapia'], 'Saúde e Bem-estar','Psicólogo','GASTO'],
  [['totalpass','wellhub','gympass','smartfit','academia'], 'Saúde e Bem-estar','Academia','GASTO'],
  [['dentista','odonto'], 'Saúde e Bem-estar','Dentista','GASTO'],
  [['drogaria','drogasil','droga','raia','farmacia','ultrafarma','3r drogaria'], 'Saúde e Bem-estar','Farmácia','GASTO'],
  [['hospital','laboratorio','clinica','hospitaldomed'], 'Saúde e Bem-estar','Outros (hospital/exames)','GASTO'],
  // --- Assinaturas da Amazon: antes do marketplace, senao 'amazon' captura tudo ---
  [['amazon prime','prime video','amazon digital','amazon music','kindle','audible'], 'Assinaturas','Streaming/Apps','GASTO'],
  // --- Marketplace: vem ANTES de Alimentação, senão "MERCADOlivre" bate em "mercado" ---
  [['mercadolivre','mercado livre','mercadolivre*'], 'Moradia','Compras','GASTO'],
  // --- Alimentação ---
  [['ifd','ifood','rappi','keeta','kee*','pl delivery','haijin','delivery'], 'Alimentação','Delivery','GASTO'],
  [['acougue','swift','laticinios carijos','fernando pescados','pescados'], 'Alimentação','Açougue','GASTO'],
  [['sacolao','hortifruti','hort ','miami hortifruti','graos','perimetral'], 'Alimentação','Hortifruti','GASTO'],
  [['padaria','panificadora','pani di grano','casa de paes'], 'Alimentação','Padaria','GASTO'],
  [['doce','chocolandia','sorvete','acai'], 'Alimentação','Doces/Lanches','GASTO'],
  [['atacadao','nagumo','sonda','coop','comercial carijos','comercialcarijos','mercado jardim','mercadojardim','supermercado','mundial','royal','avic faisao','ib bragio','811 atacadao','tuanige','pereira barreto','alecrim dourado','mercado','alimento'], 'Alimentação','Mercado','GASTO'],
  [['santa fe','pedroso','komidas','burger','burguer','pizza','sushi','madero','bobs','subway','mc donalds','mcdonalds','pastel','lanchonete','lanche','restaurante','grill','arruda','coma bem','refeicoes','virtusbeer','food park','poke','esfiharia','nova italiana','mandu','bela vitoria','skyasia','asia park','rotisserie','asami','paygo','kurtos','prato do dia','aloha','azulpastel','la ville','ital in house','baeta','black box','almoco','cafe','buffet'], 'Alimentação','Restaurante','GASTO'],
  // --- Cuidados Pessoais ---
  [['sobrancelha'], 'Cuidados Pessoais','Sobrancelha','GASTO'],
  [['barbearia','made in roca','cabelo','cabeleireiro'], 'Cuidados Pessoais','Cabelo/Barbearia','GASTO'],
  [['manicure','unha'], 'Cuidados Pessoais','Manicure','GASTO'],
  [['thabeauty','estetica','studiometaphy','lunatura','salao','beauty','ap star','star liberty'], 'Cuidados Pessoais','Estética/Beleza','GASTO'],
  [['perfume','perfumaria'], 'Compras','Perfumaria','GASTO'],
  // --- Compras ---
  [['renner','riachuelo','c&a','zara','marisa','shein','jeansstore','york shop','toda teen','ang velocity','saldao sao bernardo','awa comercio','vestuario','roupa'], 'Compras','Vestuário/Roupa','GASTO'],
  [['shopee','amazon','magalu','magazine','aliexpress','americanas','moncosso','presentes','icasei','daddystore','clicstore','bronline','oca','falconi','vtexpayment','br1*','compras'], 'Compras','Marketplace/Geral','GASTO'],
  // --- Moradia ---
  [['aluguel','condominio','imobiliaria'], 'Moradia','Aluguel','GASTO'],
  [['municipio de maua','iptu'], 'Moradia','IPTU','GASTO'],
  [['enel','energia','cemig','cpfl','light','sabesp','agua','comgas','carijos gas','contas','desentupidora','azulao','leroy','manutencao','reparo'], 'Moradia','Contas/Reparos de casa','GASTO'],
  // --- Transporte ---
  [['posto','combustivel','ipiranga','shell','auto posto','autoposto','carrefour'], 'Transporte','Combustível','GASTO'],
  [['estaciona','pedagio','zul','shopping abc','sem parar','conectcar','connectcar'], 'Transporte','Estacionamento/Pedágio','GASTO'],
  [['auto pecas','yokota','ls motors','centro automotivo','moto parts','galpao moto','chapa motos'], 'Transporte','Manutenção veículo','GASTO'],
  [['seguro superprotegido','loovi','ituran','seguro'], 'Transporte','Seguro/Rastreador','GASTO'],
  [['ipva','licenciamento','vistoria','documentacao','detran','multa'], 'Transporte','Impostos/Docs veículo','GASTO'],
  // --- Educação ---
  [['centro de ensino','pagto eletron cobranca','faculdade','mensalidade'], 'Educação','Faculdade','GASTO'],
  [['curso','udemy','alura','escola'], 'Educação','Cursos','GASTO'],
  // --- Pets ---
  [['pet shop','petshop','pdv*pet','veterinar','linearfraldas','cobasi','petz'], 'Pets','Pet (ração/vet)','GASTO'],
  // --- Lazer ---
  [['airbnb','smiles','viagem'], 'Lazer','Viagem','GASTO'],
  [['cinemark','cinema','circuitpark','patinete','indigo','shopping'], 'Lazer','Passeios/Cinema','GASTO'],
  // --- Assinaturas ---
  [['netflix','spotify','apple.com','applecom','amazon digital','amazon prime','prime video','youtube','playstation','xbox','disney','hbo','claro tv','kindle','ebn'], 'Assinaturas','Streaming/Apps','GASTO'],
  // --- Telefonia ---
  [['vivo','claro','tim','telefonica','internet','telefone'], 'Telefonia/Internet','Telefonia','GASTO'],
  // --- Tarifas ---
  [['tarifa','cartoes','1 cartao','2 cartoes','3 cartoes','anuidade','regularizacao','parcela express','pex*'], 'Tarifas','Tarifas bancárias','GASTO']
];

function categorizar_(desc){
  var d = sa_(desc);
  for (var i=0;i<REGRAS.length;i++){
    var keys=REGRAS[i][0];
    for (var j=0;j<keys.length;j++){ if (d.indexOf(keys[j])!==-1) return {macro:REGRAS[i][1], sub:REGRAS[i][2], flag:REGRAS[i][3]}; }
  }
  return {macro:'A identificar', sub:'', flag:'GASTO'};
}
