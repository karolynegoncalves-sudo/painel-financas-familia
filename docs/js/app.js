const CFG=window.PAINEL_CONFIG||{};
let D=null;
let idToken=sessionStorage.getItem('id_token')||null;
function decodeJwtEmail(t){try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).email||'';}catch(e){return '';}}

const BRL=v=>"R$ "+Math.round(v).toLocaleString("pt-BR");
const el=id=>document.getElementById(id);
const CORES={"Alimentação":"#e2593f","Saúde e Bem-estar":"#159a80","Educação":"#e6a63a","Transporte":"#5f8c7d","Moradia":"#c9784f","Compras":"#d95f7a","Cuidados Pessoais":"#8a6f9e","Pets":"#b0894a","Lazer":"#4fa08d","Assinaturas":"#7d9b6a","Tarifas":"#9aa7a1","Telefonia/Internet":"#c98f5a","Outros":"#aab4ae"};
const ICON={"Alimentação":"🍎","Saúde e Bem-estar":"🩺","Educação":"🎓","Transporte":"🚗","Moradia":"🏠","Compras":"🛍️","Cuidados Pessoais":"💇","Pets":"🐾","Lazer":"🎬","Assinaturas":"📺","Tarifas":"🏦","Telefonia/Internet":"📱","Outros":"•"};
const cor=k=>CORES[k]||"#9aa7a1";
let MESES=[];
let filtroMes="Ano",aberta=null;

// tabs
const TABS=[["visao","Visão geral"],["fluxo","Fluxo de caixa"],["cat","Categorias & subcategorias"],["pessoa","Família / Karol / Vinícius"],["metas","Metas & delivery"],["custo","Custo de vida"],["dividas","Dívidas"],["proj","Projeção 2027"],["patrim","Patrimônio"],["analises","Análises & estratégias"]];
el("tabs").innerHTML=TABS.map((t,i)=>`<button class="tab${i?'':' on'}" data-p="${t[0]}">${t[1]}</button>`).join("");
[...document.querySelectorAll('.tab')].forEach(b=>b.onclick=()=>{
  [...document.querySelectorAll('.tab')].forEach(x=>x.classList.toggle('on',x===b));
  [...document.querySelectorAll('.page')].forEach(p=>p.classList.toggle('on',p.id==='p-'+b.dataset.p));
});

// filtro mês
function chipsMes_(id){
  var e=el(id); if(!e) return;
  e.innerHTML=['Ano'].concat(MESES).map(function(m){
    return '<button class="chip'+(m===filtroMes?' on':'')+'" data-m="'+m+'">'+(m==='Ano'?'Ano (média)':m)+'</button>';
  }).join('');
  [].forEach.call(e.querySelectorAll('.chip'),function(b){
    b.onclick=function(){ filtroMes=b.dataset.m; aberta=null; p3Aberta=null; setupMes(); renderVisao(); renderCat(); renderPessoa(); renderFluxo(); };
  });
}
function setupMes(){MESES=Object.keys(D.mensal);
  chipsMes_('fMesCat'); chipsMes_('fMesP3'); chipsMes_('fMesFlx');el("fMes").innerHTML=['Ano',...MESES].map(m=>`<button class="chip${m==='Ano'?' on':''}" data-m="${m}">${m==='Ano'?'Ano (média)':m}</button>`).join("");
[...el("fMes").querySelectorAll('.chip')].forEach(b=>b.onclick=()=>{filtroMes=b.dataset.m;setupMes();renderVisao();renderCat();renderPessoa();renderFluxo();});}


function subAtual(macroNome){
  if(filtroMes==='Ano') return (D.sub&&D.sub[macroNome])||{};
  return (D.mes_sub&&D.mes_sub[filtroMes]&&D.mes_sub[filtroMes][macroNome])||{};
}
function p3Atual(){
  if(filtroMes==='Ano') return D.p3||{};
  return (D.mes_p3&&D.mes_p3[filtroMes])||{};
}
function p3subAtual(){
  if(filtroMes==='Ano') return D.p3sub||{};
  return (D.mes_p3sub&&D.mes_p3sub[filtroMes])||{};
}
function p3totAtual(){
  if(filtroMes==='Ano') return D.p3tot||{};
  var src=p3Atual(), t={};
  Object.keys(src).forEach(function(q){ var s=0; Object.keys(src[q]).forEach(function(m){ s+=src[q][m]; }); t[q]=Math.round(s); });
  return t;
}

function comidaAtual(){
  var f = (filtroMes==='Ano') ? (D.food||{}) : ((D.mes_sub&&D.mes_sub[filtroMes]&&D.mes_sub[filtroMes]['Alimentação'])||{});
  return { merc:(f['Mercado']||0), rest:(f['Restaurante']||0), deli:(f['Delivery']||0),
           outros:(f['Hortifruti']||0)+(f['Padaria']||0)+(f['Açougue']||0)+(f['Doces/Lanches']||0) };
}
function txtPeriodo(){ return filtroMes==='Ano' ? ('média mensal · '+(MESES[0]||'')+'–'+(MESES[MESES.length-1]||'')+'/2026') : ('mês de '+filtroMes+'/2026'); }
function atualizarTextos(){
  var sp=el('subPeriodo'); if(sp) sp.textContent='Extratos reais · '+(MESES.length?MESES[0]+'–'+MESES[MESES.length-1]+' 2026':'');
  var rd=el('rodape'); if(rd) rd.textContent='Meses com dados: '+MESES.join(', ')+'/2026. Na visão "Ano" os valores são médias mensais; escolhendo um mês, são os valores daquele mês. Saúde já considera o reembolso do Kaike e a psicóloga.';
  var rm=el('resMeta'); if(rm){ var meta=65000, pctm=D.kpi.reserva/meta*100;
    rm.textContent='Meta de 9 meses: '+BRL(meta)+' — '+pctm.toFixed(0)+'% alcançado.'; }
}
function catAtual(){return filtroMes==="Ano"?D.macro:(D.mes_macro[filtroMes]||{});}
function kpiAtual(){if(filtroMes==="Ano")return{rec:D.kpi.renda,des:D.kpi.gasto,sob:D.kpi.sobra,taxa:D.kpi.taxa};const m=D.mensal[filtroMes];return{rec:m.receita,des:m.despesa,sob:m.saldo,taxa:m.receita?m.saldo/m.receita*100:0};}

function arc(cx,cy,r,a0,a1){const p=(a,rr)=>[cx+rr*Math.cos(a),cy+rr*Math.sin(a)];const[x0,y0]=p(a0,r),[x1,y1]=p(a1,r);const b=a1-a0>Math.PI?1:0;return`M ${x0} ${y0} A ${r} ${r} 0 ${b} 1 ${x1} ${y1}`;}
const SUBPAL=['#e2593f','#159a80','#e6a63a','#5f8c7d','#c9784f','#d95f7a','#8a6f9e','#b0894a','#4fa08d','#c98f5a'];
function pieSVG(id,entries,colFn){
  const e=entries.filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);const tot=e.reduce((s,x)=>s+x[1],0)||1;
  let a=-Math.PI/2,s=`<svg viewBox="0 0 170 170">`;
  if(e.length===1){s+=`<circle cx="85" cy="85" r="80" fill="${colFn(e[0][0],0)}"/>`;}
  else e.forEach(([k,v],i)=>{const a1=a+v/tot*2*Math.PI,x0=85+80*Math.cos(a),y0=85+80*Math.sin(a),x1=85+80*Math.cos(a1),y1=85+80*Math.sin(a1),big=a1-a>Math.PI?1:0;
    s+=`<path d="M85 85 L ${x0.toFixed(1)} ${y0.toFixed(1)} A 80 80 0 ${big} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${colFn(k,i)}" stroke="var(--surface)" stroke-width="1.5"/>`;a=a1;});
  s+=`<circle cx="85" cy="85" r="35" fill="var(--surface)"/><text x="85" y="81" font-size="9.5" fill="var(--ink-3)" text-anchor="middle">total</text><text x="85" y="97" font-size="13" fill="var(--ink)" text-anchor="middle" class="serif">${BRL(tot)}</text></svg>`;
  el(id).innerHTML=s;
}
function barsHTML(entries,colFn,clickable){
  const e=entries.filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);const mx=e[0]?e[0][1]:1;
  return e.map((x,i)=>`<div class="row${clickable?' clk':''}" ${clickable?`data-k="${x[0]}"`:''}><div class="nm"><i class="dot" style="background:${colFn(x[0],i)}"></i>${ICON[x[0]]?ICON[x[0]]+' ':''}${x[0]}</div><div class="bar"><i style="width:${Math.max(x[1]/mx*100,2)}%;background:${colFn(x[0],i)}"></i></div><div class="vl num">${BRL(x[1])}</div></div>`).join("");
}

// ---------- VISÃO ----------
function renderVisao(){
  el("ctx");const k=kpiAtual();
  el("kpis").innerHTML=`
   <div class="kpi rec"><div class="l">Receita</div><div class="v serif">${BRL(k.rec)}</div><div class="h">${filtroMes==="Ano"?"por mês":filtroMes}</div></div>
   <div class="kpi des"><div class="l">Despesa</div><div class="v serif">${BRL(k.des)}</div><div class="h">${filtroMes==="Ano"?"por mês":filtroMes}</div></div>
   <div class="kpi sal"><div class="l">Sobra</div><div class="v serif">${BRL(k.sob)}</div><div class="h">pra investir</div></div>
   <div class="kpi wt"><div class="l">Taxa de poupança</div><div class="v serif ${k.taxa>=20?'pos':'neg'}">${k.taxa.toFixed(0)}%</div><div class="h">meta 20%</div></div>
   <div class="kpi wt"><div class="l">Reserva</div><div class="v serif pos">${BRL(D.kpi.reserva)}</div><div class="h">da aba Reservas</div></div>`;
  if(el("resVal"))el("resVal").textContent=BRL(D.kpi.reserva);
  atualizarTextos();
  drawPodeGastar();
  drawSaldoContas();
  drawCombo();drawDonut(catAtual());drawGauge(k.taxa);
}

function drawSaldoContas(){
  var box=el('saldoContas'); if(!box) return;
  var BAN=bancos_();
  if(!BAN.length){ box.innerHTML='<div class="note">Preencha a aba <b>Reservas</b> da planilha.</div>'; return; }
  var tot=BAN.reduce(function(a,b){return a+b[1];},0);
  var mx=Math.max.apply(null,BAN.map(function(b){return b[1];}).concat([1]));
  box.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:12px">'+
    BAN.map(function(b){return '<div style="background:var(--surface-2);border-radius:10px;padding:11px 13px"><div style="font-size:11.5px;color:var(--ink-2);display:flex;align-items:center;gap:6px"><i class="dot" style="background:'+b[2]+'"></i>'+b[0]+'</div><div class="serif" style="font-size:21px;margin-top:3px">'+BRL(b[1])+'</div></div>';}).join('')+
    '</div>'+
    BAN.map(function(b){return '<div class="row"><div class="nm"><i class="dot" style="background:'+b[2]+'"></i>'+b[0]+'</div><div class="bar"><i style="width:'+Math.max(b[1]/mx*100,2)+'%;background:'+b[2]+'"></i></div><div class="vl num">'+BRL(b[1])+'</div></div>';}).join('')+
    '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:8px"><div class="nm" style="font-weight:500">Total</div><div class="bar" style="background:none"></div><div class="vl num" style="font-weight:500">'+BRL(tot)+'</div></div>';
}
function drawCombo(){
  const W=640,H=230,pad=32,n=MESES.length,gw=(W-pad*2)/n;
  const mx=Math.max(...MESES.flatMap(m=>[D.mensal[m].receita,D.mensal[m].despesa]));
  const y=v=>H-pad-(v/mx)*(H-pad*2);let s=`<svg viewBox="0 0 ${W} ${H}">`;
  for(let i=0;i<4;i++){const gy=pad+i*(H-pad*2)/3;s+=`<line x1="${pad}" y1="${gy}" x2="${W-pad}" y2="${gy}" stroke="var(--line)"/><text x="2" y="${gy+3}" font-size="9" fill="var(--ink-3)">${Math.round(mx*(1-i/3)/1000)}k</text>`;}
  const bw=gw*.28;
  MESES.forEach((m,i)=>{const cx=pad+gw*i+gw/2,d=D.mensal[m];
    s+=`<rect x="${cx-bw-2}" y="${y(d.receita)}" width="${bw}" height="${H-pad-y(d.receita)}" rx="2.5" fill="var(--teal)"/><rect x="${cx+2}" y="${y(d.despesa)}" width="${bw}" height="${H-pad-y(d.despesa)}" rx="2.5" fill="var(--coral)"/><text x="${cx}" y="${H-pad+13}" font-size="11" fill="var(--ink-2)" text-anchor="middle">${m}</text>`;});
  const pts=MESES.map((m,i)=>[pad+gw*i+gw/2,y(D.mensal[m].saldo)]);
  s+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="var(--amber)" stroke-width="2.5"/>`;
  pts.forEach(p=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--amber)" stroke="var(--surface)" stroke-width="1.5"/>`);
  el("combo").innerHTML=s+`</svg>`;
}
function drawDonut(cat){
  const ents=Object.entries(cat).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]);const tot=ents.reduce((s,e)=>s+e[1],0)||1;
  const top=ents.slice(0,6),outros=ents.slice(6).reduce((s,e)=>s+e[1],0),segs=[...top];if(outros>0)segs.push(["Outros",outros]);
  let a=-Math.PI/2,s=`<svg viewBox="0 0 160 160">`;
  segs.forEach(([k,v])=>{const a1=a+v/tot*2*Math.PI;s+=`<path d="${arc(80,80,60,a,a1-.02)}" stroke="${cor(k)}" stroke-width="22" fill="none" stroke-linecap="round"/>`;a=a1;});
  el("donut").innerHTML=s+`<text x="80" y="75" font-size="11" fill="var(--ink-3)" text-anchor="middle">gasto/mês</text><text x="80" y="94" font-size="16" fill="var(--ink)" text-anchor="middle" class="serif">${BRL(tot)}</text></svg>`;
  el("donutLeg").innerHTML=segs.map(([k,v])=>`<div style="display:flex;align-items:center;gap:6px;font-size:11.5px;margin:3px 0"><i class="dot" style="background:${cor(k)}"></i><span style="flex:1">${ICON[k]?ICON[k]+' ':''}${k}</span><b class="num">${(v/tot*100).toFixed(0)}%</b></div>`).join("");
  el("donutCap").textContent=filtroMes==="Ano"?"Média mensal":"Gasto de "+filtroMes;
}
function drawGauge(t){const p=Math.max(0,Math.min(t,100))/100,a0=-Math.PI/2,a1=a0+p*2*Math.PI;
  el("gauge").innerHTML=`<svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="56" stroke="var(--surface-2)" stroke-width="16" fill="none"/><path d="${arc(75,75,56,a0,a1)}" stroke="var(--teal)" stroke-width="16" fill="none" stroke-linecap="round"/><text x="75" y="72" font-size="25" fill="var(--ink)" text-anchor="middle" class="serif">${t.toFixed(0)}%</text><text x="75" y="91" font-size="10" fill="var(--ink-3)" text-anchor="middle">poupança</text></svg>`;}

// ---------- CATEGORIAS ----------
let catSel=null;

/* ranking: no "Ano" e a media mensal ja calculada; num mes especifico,
   achata mes_sub[mes] pra mostrar o que foi gasto naquele mes mesmo. */
function rankAtual(){
  if(filtroMes==='Ano') return D.subflat||[];
  const src=(D.mes_sub&&D.mes_sub[filtroMes])||{}, out=[];
  Object.keys(src).forEach(function(macro){
    Object.keys(src[macro]).forEach(function(sub){
      const v=src[macro][sub]; if(v>0) out.push({macro:macro, sub:sub, valor:v});
    });
  });
  return out.sort((x,y)=>y.valor-x.valor);
}

function renderCat(){
  if(!catSel){
    const ents=Object.entries(catAtual());
    pieSVG('catPie',ents,k=>cor(k));
    el('catbars').innerHTML=barsHTML(ents,k=>cor(k),true);
    [...el('catbars').querySelectorAll('.row')].forEach(r=>r.onclick=()=>{catSel=r.dataset.k;renderCat();});
    el('catBack').innerHTML='';
    el('catTitle').textContent='Despesas por categoria';
    el('catCap').textContent='Clique numa categoria (na lista) pra ver as subcategorias no gráfico.';
  }else{
    const ents=Object.entries(subAtual(catSel));
    pieSVG('catPie',ents,(k,i)=>SUBPAL[i%SUBPAL.length]);
    el('catbars').innerHTML=barsHTML(ents,(k,i)=>SUBPAL[i%SUBPAL.length],false);
    [...el('catbars').querySelectorAll('.row')].forEach(function(row,i){
      row.classList.add('clicavel');
      row.onclick=function(){ lancDaSub(catSel, ents.sort((a,b)=>b[1]-a[1])[i][0]); };
    });
    el('catBack').innerHTML=`<button class="chip" id="catBackBtn" style="margin-top:12px">← voltar às categorias</button>`;
    el('catBackBtn').onclick=()=>{catSel=null;renderCat();};
    el('catTitle').textContent=catSel+' → subcategorias';
    el('catCap').textContent='Detalhe de '+catSel+'. Clique em "voltar" pra ver todas as categorias.';
  }
  const lista=rankAtual(), tot=lista.reduce((s,x)=>s+x.valor,0)||1;
  const th=el('rankTh'); if(th) th.textContent = filtroMes==='Ano' ? 'R$/mês' : 'R$ em '+filtroMes;
  const rc=el('rankCap'); if(rc) rc.textContent = 'Todas as subcategorias, da maior pra menor — '+txtPeriodo()+'.';
  el("rankBody").innerHTML=lista.map((x,i)=>`<tr class="clicavel" data-macro="${esc_(x.macro)}" data-sub="${esc_(x.sub)}"><td>${i+1}</td><td><i class="dot" style="background:${cor(x.macro)}"></i> ${x.sub}</td><td style="color:var(--ink-2)">${x.macro}</td><td class="n">${BRL(x.valor)}</td><td class="n">${(x.valor/tot*100).toFixed(1)}%</td></tr>`).join("");
  [...el("rankBody").querySelectorAll('tr')].forEach(function(tr){
    tr.onclick=function(){ lancDaSub(tr.dataset.macro, tr.dataset.sub); };
  });
}

// ---------- PESSOAS ----------
let selP='Família', p3Aberta=null;
function renderPessoa(){
  const P=p3totAtual();
  el("p3kpis").innerHTML=`<div class="kpi rec"><div class="l">Família</div><div class="v serif">${BRL(P['Família']||0)}</div><div class="h">compartilhado/mês</div></div>
   <div class="kpi wt"><div class="l">Karol (pessoal)</div><div class="v serif">${BRL(P['Karol']||0)}</div><div class="h">só dela</div></div>
   <div class="kpi wt"><div class="l">Vinícius (pessoal)</div><div class="v serif">${BRL(P['Vinícius']||0)}</div><div class="h">só dele</div></div>`;
  el('p3sel').innerHTML=['Família','Karol','Vinícius'].map(p=>`<button class="chip${p===selP?' on':''}" data-p="${p}">${p} · ${BRL(P[p]||0)}</button>`).join("");
  [...el('p3sel').querySelectorAll('.chip')].forEach(b=>b.onclick=()=>{selP=b.dataset.p;p3Aberta=null;renderPessoa();});
  const temSub = !!(p3subAtual() && p3subAtual()[selP]);
  if(!p3Aberta){
    const ents=Object.entries(p3Atual()[selP]||{});
    pieSVG('p3pie',ents,k=>cor(k));
    el('p3bars').innerHTML=barsHTML(ents,k=>cor(k),temSub);
    if(temSub) [...el('p3bars').querySelectorAll('.row')].forEach(r=>r.onclick=()=>{p3Aberta=r.dataset.k;renderPessoa();});
    var Pt=p3totAtual(), somaT=0; Object.keys(Pt).forEach(function(k){somaT+=Pt[k];});
  var pctFam = somaT>0 ? (Pt['Família']||0)/somaT*100 : 0;
  var cal=el('p3Callout');
  if(cal) cal.innerHTML='<b>'+pctFam.toFixed(0)+'% dos gastos são da família</b> ('+txtPeriodo()+'). O gasto de cada um consigo mesmo: Karol <b>'+BRL(Pt['Karol']||0)+'</b> e Vinícius <b>'+BRL(Pt['Vinícius']||0)+'</b>'+(pctFam>=85?' — ninguém está gastando demais consigo.':'.');
  el('p3title').textContent='Gastos de '+selP;
    el('p3cap').textContent=(selP==='Família'?'Gastos compartilhados do casal (o que não é isolado de uma pessoa).':'Só o que é gasto isolado de '+selP+'.')+(temSub?' Clique numa categoria pra ver as subcategorias.':'');
  }else{
    const subs=Object.entries((p3subAtual()[selP]||{})[p3Aberta]||{});
    pieSVG('p3pie',subs,(k,i)=>SUBPAL[i%SUBPAL.length]);
    el('p3bars').innerHTML=barsHTML(subs,(k,i)=>SUBPAL[i%SUBPAL.length],false)+
      `<button class="chip" id="p3BackBtn" style="margin-top:12px">← voltar às categorias</button>`;
    el('p3BackBtn').onclick=()=>{p3Aberta=null;renderPessoa();};
    el('p3title').textContent=selP+' · '+p3Aberta+' → subcategorias';
    el('p3cap').textContent='Detalhe de '+p3Aberta+' em '+selP+'.';
  }
}

// ---------- METAS & DELIVERY ----------

/* ---------- REFERENCIA DE COMIDA = MES ANTERIOR ----------
   A Karol quer comparar com o mes passado, nao com a media do ano:
   assim da pra ver a evolucao de um mes pro outro. E so restaurante
   e delivery - mercado ela acompanha pelo fluxo de caixa.

   Nao da pra usar "o penultimo da lista de meses": a lista pode terminar
   em meses sem movimento, e ai a referencia caia no proprio mes corrente
   (que no dia 3 tem quase nada) - os sliders do plano de corte nasciam
   com maximo zero e travavam. Aqui a gente parte do mes de hoje e anda
   pra tras ate achar um mes que teve comida de verdade. */
function comidaDoMes_(m){
  var f = (m && D.mes_sub && D.mes_sub[m] && D.mes_sub[m]['Alimentação']) || null;
  if(!f) return null;
  var r=f['Restaurante']||0, d=f['Delivery']||0;
  return (r+d)>0 ? { rest:r, deli:d, mes:m } : null;
}
function mesAnterior_(){
  if(!MESES || !MESES.length) return null;
  var i = MESES.indexOf(MESNOME[new Date().getMonth()]);
  if(i<0) i = MESES.length;
  for(var k=i-1; k>=0; k--){ if(comidaDoMes_(MESES[k])) return MESES[k]; }
  return null;
}
function comidaRef_(){
  var c = comidaDoMes_(mesAnterior_());
  if(c) return c;
  var g=(D&&D.food)||{};
  return { rest:(g['Restaurante']||0), deli:(g['Delivery']||0), mes:null };
}
function refRotulo_(){
  var m=mesAnterior_();
  return m ? m+'/2026' : 'm\u00e9dia do ano';
}
/* teto de comer fora = o que gastaram no mes passado */
function tetoComerFora_(){
  var c=comidaRef_();
  return Math.round(c.rest + c.deli) || 1800;
}

function ajustarSlidersComida(){
  var C=comidaRef_();
  var pares=[['sDeli',C.deli,0.5],['sRest',C.rest,0.5]];
  pares.forEach(function(p){
    var e=el(p[0]); if(!e) return;
    var max=Math.max(Math.round(p[1]),10);
    e.max=max; if(+e.value>max || e.dataset.init!=='1'){ e.value=Math.round(max*p[2]); e.dataset.init='1'; }
  });
  var ld=el('labDeli'), lr=el('labRest');
  if(ld) ld.textContent='Delivery ('+refRotulo_()+': '+BRL(C.deli)+')';
  if(lr) lr.textContent='Restaurante ('+refRotulo_()+': '+BRL(C.rest)+')';
  var cc=el('cutCap');
  if(cc) cc.innerHTML='As barras partem do que voc\u00eas gastaram em <b>'+refRotulo_()+'</b> \u2014 assim d\u00e1 pra ver a evolu\u00e7\u00e3o de um m\u00eas pro outro. Comer fora custou <b>'+BRL(C.rest+C.deli)+'</b> naquele m\u00eas. Mercado n\u00e3o entra aqui: voc\u00ea acompanha ele no fluxo de caixa.';
}
/* Compara o que ja foi gasto no mes corrente com a media historica,
   projetando pelo ritmo (gasto / dia decorrido * dias do mes). */
function renderRitmo(){
  var tab=el('ritmoTab'); if(!tab) return;
  var MA=D.mesAtual;
  if(!MA){ tab.innerHTML='<tr><td colspan="5">Atualize o backend do Apps Script.</td></tr>'; return; }
  var _ref=comidaRef_();
  var med={'Restaurante':_ref.rest,'Delivery':_ref.deli};
  var itens=['Restaurante','Delivery'];
  var linhas=[], foraG=0, foraP=0, foraM=0;

  itens.forEach(function(k){
    var g=(MA.sub&&MA.sub[k])||0, m=med[k]||0;
    if(g<=0 && m<=0) return;
    var proj = MA.dia>0 ? g/MA.dia*MA.diasNoMes : g;
    var pct  = m>0 ? proj/m*100 : 0;
    var cor='var(--ink-3)', txt='—';
    if(m>0){
      if(g>m){ cor='var(--coral)'; txt='já passou a média do mês inteiro'; }
      else if(pct>110){ cor='var(--coral)'; txt='acelerado ('+pct.toFixed(0)+'%)'; }
      else if(pct>95){ cor='var(--amber)'; txt='no ritmo ('+pct.toFixed(0)+'%)'; }
      else { cor='var(--teal)'; txt='folgado ('+pct.toFixed(0)+'%)'; }
    }
    linhas.push({k:k,g:g,proj:proj,m:m,cor:cor,txt:txt});
    if(k==='Restaurante'||k==='Delivery'){ foraG+=g; foraP+=proj; foraM+=m; }
  });

  tab.innerHTML=linhas.map(function(l){
    return '<tr><td>'+l.k+'</td><td class="n">'+BRL(l.g)+'</td><td class="n">'+BRL(l.proj)+'</td>'+
           '<td class="n">'+(l.m>0?BRL(l.m):'—')+'</td>'+
           '<td style="color:'+l.cor+'">'+l.txt+'</td></tr>';
  }).join('');

  var cabe = Math.max(foraM-foraG,0);
  var porDia = MA.diasRestantes>0 ? cabe/MA.diasRestantes : cabe;
  var okFora = foraP<=foraM*1.05;
  el('ritmoKpis').innerHTML=
   '<div class="kpis">'+
   '<div class="kpi wt"><div class="l">Comer fora até hoje</div><div class="v serif">'+BRL(foraG)+'</div><div class="h">restaurante + delivery</div></div>'+
   '<div class="kpi '+(okFora?'rec':'sal')+'"><div class="l">No ritmo, fecha em</div><div class="v serif '+(okFora?'pos':'neg')+'">'+BRL(foraP)+'</div><div class="h">média é '+BRL(foraM)+'</div></div>'+
   '<div class="kpi wt"><div class="l">Ainda cabe no teto</div><div class="v serif '+(cabe>0?'pos':'neg')+'">'+BRL(cabe)+'</div><div class="h">até virar o mês</div></div>'+
   '<div class="kpi wt"><div class="l">Por dia</div><div class="v serif">'+BRL(porDia)+'</div><div class="h">nos '+MA.diasRestantes+' dias que faltam</div></div>'+
   '</div>';

  var cap=el('ritmoCap');
  if(cap) cap.textContent='Mês de '+MA.label+' — dia '+MA.dia+' de '+MA.diasNoMes+'. Comparado com '+refRotulo_()+'. A projeção assume que o ritmo dos primeiros '+MA.dia+' dias continua igual.';
  var thr=el('thRef'); if(thr) thr.textContent=refRotulo_();

  var nota=el('ritmoNota');
  if(nota){
    if(foraM<=0) nota.textContent='Ainda não há mês anterior para comparar.';
    else if(foraP>foraM*1.05)
      nota.innerHTML='Comer fora está <b>'+((foraP/foraM-1)*100).toFixed(0)+'% acima</b> de '+refRotulo_()+'. Mantendo o teto de <b>'+BRL(foraM)+'</b>, sobram <b>'+BRL(cabe)+'</b> para os '+MA.diasRestantes+' dias que faltam. Vale olhar os maiores lançamentos antes de cortar hábito — muitas vezes é <i>um</i> evento grande, não o dia a dia.';
    else
      nota.innerHTML='Comer fora está abaixo de '+refRotulo_()+' (<b>'+BRL(foraM)+'</b>). Ainda cabem <b>'+BRL(cabe)+'</b> até o fim do mês.';
  }
}

function renderMetas(){
  renderRitmo();
  ajustarSlidersComida();
  const deli=+el("sDeli").value,rest=+el("sRest").value;
  el("oDeli").textContent=BRL(deli);el("oRest").textContent=BRL(rest);
  var CC=comidaRef_();
  const corte=Math.max(CC.rest-rest,0)+Math.max(CC.deli-deli,0);
  const meta=1200,pct=Math.min(corte/meta*100,100);
  const ok=corte>=meta;
  el("cutResult").innerHTML=`<div style="height:20px;border-radius:6px;background:var(--surface-2);overflow:hidden"><div style="width:${pct}%;height:100%;background:${ok?'var(--teal)':'var(--amber)'}"></div></div>
   <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px"><span>Corte total: <b>${BRL(corte)}/mês</b></span><span>Meta: R$ 1.200</span></div>
   <div class="callout ${ok?'ok':''}">${ok?`✅ Meta batida! Você corta <b>${BRL(corte)}/mês</b> = <b>${BRL(corte*12)}/ano</b> a mais pra investir.`:`Faltam <b>${BRL(meta-corte)}/mês</b> pra meta. Puxe mais o delivery ou o restaurante.`}</div>`;
  // teto delivery
  const sem=deli/4.33,dia=deli/30;
  el("dMes").textContent=BRL(deli);el("dSem").textContent=BRL(sem);el("dDia").textContent=BRL(dia);
  el("dNote").innerHTML=`Hoje o delivery é ${BRL(CC.deli)}/mês (~${BRL(CC.deli/30)}/dia). Com o teto de <b>${BRL(deli)}/mês</b>, o limite vira <b>${BRL(sem)}/semana</b> ou <b>${BRL(dia)}/dia</b>. Combine: dias de semana sem delivery, e um "dia de delivery" no fim de semana dentro do teto.`;
}
['sDeli','sRest'].forEach(id=>{var e=el(id); if(e) e.addEventListener('input',renderMetas);});

// ---------- PROJEÇÃO ----------
var MESNOME=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
function mesesAte_(iniAno,iniMes,fimAno,fimMes){
  var out=[], a=iniAno, m=iniMes;
  while(a<fimAno || (a===fimAno && m<=fimMes)){
    out.push({ano:a,mes:m,label:MESNOME[m-1]+'/'+String(a).slice(2)});
    m++; if(m>12){m=1;a++;}
  }
  return out;
}
function parseInicio_(txt){
  var m=String(txt||'').match(/(\d{1,2})\s*[\/\-]\s*(\d{4})/);
  if(m) return {mes:parseInt(m[1],10), ano:parseInt(m[2],10)};
  return {mes:8, ano:2026};
}
// parcela devida de uma divida num dado ano/mes
function parcelaNoMes_(d, ano, mes){
  var ini=parseInicio_(d.inicio);
  var idx=(ano-ini.ano)*12+(mes-ini.mes);          // 0 = primeira parcela
  if(idx<0 || idx>=d.nparc) return 0;
  return d.parcela;
}
let projMoveInic=false;
function renderProj(){
  var CV=D.custoVida;
  if(!CV){ el('projKpis').innerHTML='<div class="note">Atualize o backend do Apps Script.</div>'; return; }
  var alu=+el('pAlu').value, cut=+el('pCut').value, move=+el('pMove').value;
  var divs=D.dividas||[];
  var fimFac=(D.agenda&&D.agenda.fimFaculdade)||'2027-12';
  var facMes=(D.agenda&&D.agenda.faculdadeMes)||0;
  var fimFacAno=parseInt(fimFac.slice(0,4),10), fimFacMes=parseInt(fimFac.slice(5,7),10);

  var hoje=new Date();
  var serie=mesesAte_(hoje.getFullYear(), hoje.getMonth()+1, 2027, 12);
  var eMove=el('pMove');
  eMove.max=serie.length;                      // ultimo valor = nao mudar
  /* abre ja em fev/2027, que e quando o contrato daqui vence */
  if(!projMoveInic){
    projMoveInic=true;
    var iFev=-1;
    serie.forEach(function(pt,i){ if(pt.ano===2027 && pt.mes===2) iFev=i; });
    if(iFev>=0){ move=iFev; eMove.value=move; }
  }
  if(move>serie.length){ move=serie.length; eMove.value=move; }
  var mudou = move<serie.length;
  el('oAlu').textContent=BRL(alu);
  el('oCut').textContent=BRL(cut);
  el('oMove').textContent = !mudou ? 'não mudar' : (move===0 ? 'este mês' : serie[move].label);
  var lm=el('labMove');
  if(lm) lm.textContent = !mudou ? 'Mudança de casa: não simular' : ('Aluguel de '+BRL(alu)+' começa em '+(move===0?serie[0].label:serie[move].label));
  var la=el('labAlu');
  if(la) la.textContent='Aluguel do lugar novo (hoje vocês não pagam aluguel pela conta pessoal)';
  var av=el('projAviso');
  if(av) av.innerHTML = mudou
    ? '🏠 <b>O degrau de '+BRL(alu)+' na coluna Fixo a partir de '+(move===0?serie[0].label:serie[move].label)+' é o aluguel da casa nova.</b> Hoje ele não aparece nos extratos porque vocês moram no endereço da empresa. Puxe o slider até o fim pra ver o cenário sem mudança.'
    : '🏠 <b>Cenário sem mudança de casa</b> — sem aluguel na conta. Mova o slider pra simular a saída do endereço da empresa.';

  var reserva=D.kpi.reserva, renda=(D.kpi.rendaRecorrente||D.kpi.renda), linhas=[];
  serie.forEach(function(pt,i){
    var fixo=CV.fixo;
    // faculdade sai depois do fim
    if(pt.ano>fimFacAno || (pt.ano===fimFacAno && pt.mes>fimFacMes)) fixo-=facMes;
    var aluguel = (mudou && i>=move) ? alu : 0;
    var variavel=Math.max(CV.variavel-cut,0);
    var dv=0; divs.forEach(function(d){ dv+=parcelaNoMes_(d,pt.ano,pt.mes); });
    var total=fixo+aluguel+variavel+dv, sobra=renda-total;
    reserva+=sobra;
    linhas.push({label:pt.label,fixo:fixo,aluguel:aluguel,variavel:variavel,dividas:dv,total:total,sobra:sobra,reserva:reserva,primeiroAlu:(mudou && i===move)});
  });

  var ult=linhas[linhas.length-1];
  var semDiv=linhas.filter(function(l){return l.dividas===0;});
  var sobraLimpa= semDiv.length ? semDiv[semDiv.length-1].sobra : ult.sobra;
  el('projKpis').innerHTML=
   '<div class="kpi wt"><div class="l">Sobra hoje</div><div class="v serif '+(linhas[0].sobra>=0?'pos':'neg')+'">'+BRL(linhas[0].sobra)+'</div><div class="h">'+linhas[0].label+'</div></div>'+
   '<div class="kpi wt"><div class="l">Sobra sem dívidas</div><div class="v serif pos">'+BRL(sobraLimpa)+'</div><div class="h">quando quitarem</div></div>'+
   '<div class="kpi rec"><div class="l">Reserva em dez/2027</div><div class="v serif">'+BRL(ult.reserva)+'</div><div class="h">de '+BRL(D.kpi.reserva)+' hoje</div></div>'+
   '<div class="kpi sal"><div class="l">Vão guardar</div><div class="v serif">'+BRL(ult.reserva-D.kpi.reserva)+'</div><div class="h">em '+linhas.length+' meses</div></div>';

  // grafico
  var W=680,H=220,pad=34,n=linhas.length;
  var rmax=Math.max.apply(null,linhas.map(function(l){return l.reserva;}).concat([1]));
  var gmax=Math.max.apply(null,linhas.map(function(l){return l.total;}))*1.2;
  var x=function(i){return pad+i*(W-pad*2)/Math.max(n-1,1);};
  var yr=function(v){return H-pad-(v/rmax)*(H-pad*2);};
  var yg=function(v){return H-pad-(v/gmax)*(H-pad*2);};
  var rp=linhas.map(function(l,i){return [x(i),yr(l.reserva)];});
  var gp=linhas.map(function(l,i){return [x(i),yg(l.total)];});
  var sv='<svg viewBox="0 0 '+W+' '+H+'">';
  sv+='<polygon points="'+pad+','+(H-pad)+' '+rp.map(function(p){return p.join(',');}).join(' ')+' '+(W-pad)+','+(H-pad)+'" fill="var(--teal-soft)"/>';
  sv+='<polyline points="'+rp.map(function(p){return p.join(',');}).join(' ')+'" fill="none" stroke="var(--teal)" stroke-width="2.5"/>';
  sv+='<polyline points="'+gp.map(function(p){return p.join(',');}).join(' ')+'" fill="none" stroke="var(--coral)" stroke-width="2" stroke-dasharray="4 3"/>';
  linhas.forEach(function(l,i){ if(i%3===0||i===n-1) sv+='<text x="'+x(i)+'" y="'+(H-pad+13)+'" font-size="9.5" fill="var(--ink-3)" text-anchor="middle">'+l.label+'</text>'; });
  el('projChart').innerHTML=sv+'</svg>';

  // agenda das dividas
  var ag=divs.map(function(d){
    var ini=parseInicio_(d.inicio);
    var fm=ini.mes+d.nparc-1, fa=ini.ano+Math.floor((fm-1)/12); fm=((fm-1)%12)+1;
    return '<div class="row"><div class="nm" style="width:230px">'+d.desc+' — '+d.quem+'</div><div class="bar"><i style="width:'+d.pct+'%;background:var(--amber)"></i></div><div class="vl num" style="width:170px">'+BRL(d.parcela)+' até '+MESNOME[fm-1]+'/'+String(fa).slice(2)+'</div></div>';
  }).join('');
  ag+='<div class="row"><div class="nm" style="width:230px">Faculdade (Karol + Vinícius)</div><div class="bar" style="background:none"></div><div class="vl num" style="width:170px">'+BRL(facMes)+' até '+MESNOME[fimFacMes-1]+'/'+String(fimFacAno).slice(2)+'</div></div>';
  el('projAgenda').innerHTML=ag;

  // tabela
  el('projTab').innerHTML=linhas.map(function(l){
    return '<tr'+(l.primeiroAlu?' style="background:#fff7e6"':'')+'><td>'+l.label+(l.primeiroAlu?' <b title="mês da mudança">🏠</b>':'')+'</td><td class="n">'+BRL(l.fixo)+'</td><td class="n">'+(l.aluguel?BRL(l.aluguel):'—')+'</td><td class="n">'+BRL(l.variavel)+'</td><td class="n">'+(l.dividas?BRL(l.dividas):'—')+'</td><td class="n">'+BRL(l.total)+'</td><td class="n '+(l.sobra>=0?'pos':'neg')+'">'+BRL(l.sobra)+'</td><td class="n">'+BRL(l.reserva)+'</td></tr>';
  }).join('');

  var pn=el('projNota');
  if(pn) pn.innerHTML='Projeção de '+linhas[0].label+' até '+ult.label+', partindo da reserva de <b>'+BRL(D.kpi.reserva)+'</b> e renda de <b>'+BRL(renda)+'</b>. O custo cai conforme as dívidas terminam.';
  var pc=el('projCap');
  if(pc) pc.innerHTML='Custo fixo de hoje (<b>'+BRL(CV.fixo)+'</b>, <u>sem aluguel</u>) + média dos variáveis (<b>'+BRL(CV.variavel)+'</b>) + parcelas das dívidas, mês a mês até dez/2027. O aluguel entra só quando você simular a mudança.';
}
['pAlu','pCut','pMove'].forEach(function(id){el(id).addEventListener('input',renderProj);});


let ipModo='juntar';

/* A sobra que vale pra decidir compra: renda que entra TODO mes menos o
   custo de vida. Nao uso D.kpi.sobra porque aquilo e renda media (com
   participacao nos lucros) menos gasto medio - infla a folga. */
function sobraLivre_(){
  if(!D || !D.kpi) return 0;
  var rec = D.kpi.rendaRecorrente || D.kpi.renda;
  var cv  = D.custoVida ? D.custoVida.total : (D.kpi.gasto||0);
  return rec - cv;
}
function extraMes_(){ return (D && D.custoVida && D.custoVida.extra) || 0; }

function renderIphone(){
  var preco=+el('ipPreco').value, meses=+el('ipMeses').value, total=preco*2;
  el('oIpPreco').textContent=BRL(preco);
  el('oIpMeses').textContent=meses+(meses>1?' meses':' mes');
  var sobra=sobraLivre_(), extra=extraMes_();
  var porMes=total/meses, pct=porMes/sobra*100, cabe=porMes<=sobra, msg;
  if(ipModo==='juntar'){
    msg='Guardando <b>'+BRL(porMes)+'/mes</b> por '+meses+' meses, voces compram os 2 <b>a vista</b> ('+BRL(total)+') <b>sem juros</b>. Enquanto junta, o dinheiro ainda rende na reserva. E o caminho mais barato.';
  }else{
    var j=0.03, comJuros=meses<=12?porMes:(total*j/(1-Math.pow(1+j,-meses)));
    msg='Parcelado em '+meses+'x: ~<b>'+BRL(comJuros)+'/mes</b> ('+(meses<=12?'sem juros se a loja parcelar sem juros':'com juros de cartao ~3% a.m.')+'). Compromete a sobra por '+meses+' meses. <b>Juntar sai melhor</b> — evita juros.';
  }
  el('ipResult').innerHTML='<div style="height:20px;border-radius:6px;background:var(--surface-2);overflow:hidden"><div style="width:'+Math.min(pct,100)+'%;height:100%;background:'+(cabe?'var(--teal)':'var(--coral)')+'"></div></div>'+
    '<div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px"><span>Sai <b>'+BRL(porMes)+'/mes</b></span><span>'+Math.round(pct)+'% da sobra ('+BRL(sobra)+')</span></div>'+
    '<div class="callout '+(cabe?'ok':'')+'">'+(cabe?'✅ Cabe na sobra mensal de voces. ':'⚠️ Passa da sobra atual, alonguem o prazo. ')+msg+'</div>'+
    (extra>0 ? '<div class="note">A sobra de <b>'+BRL(sobra)+'</b> e o que resta da renda que entra todo mes ('+BRL((D.kpi.rendaRecorrente||D.kpi.renda))+') depois do custo de vida ('+BRL(D.custoVida?D.custoVida.total:0)+'). '+
      'So que ela ja esta comprometida: o gasto extraordinario tem consumido <b>'+BRL(extra)+'/mes</b> em media. '+
      (extra>=sobra ? 'Na pratica, um aparelho novo teria que <b>tomar o lugar</b> de outra coisa dessa lista, nao entrar por cima.' :
                      'Sobrariam <b>'+BRL(sobra-extra)+'</b> de fato livres.')+'</div>' : '');
}
['ipPreco','ipMeses'].forEach(function(id){el(id).addEventListener('input',renderIphone);});
[].forEach.call(el('ipModoSel').querySelectorAll('.chip'),function(b){b.onclick=function(){ipModo=b.dataset.modo;[].forEach.call(el('ipModoSel').querySelectorAll('.chip'),function(x){x.classList.toggle('on',x===b);});renderIphone();};});

function corBanco_(nome){var n=(nome||'').toLowerCase();
  if(n.indexOf('itau')>=0||n.indexOf('itaú')>=0)return '#ec7000';
  if(n.indexOf('nubank')>=0||n.indexOf('nu ')>=0)return '#820ad1';
  if(n.indexOf('bradesco')>=0)return '#cc092f';
  if(n.indexOf('inter')>=0)return '#ff7a00';
  if(n.indexOf('caixa')>=0)return '#0070af';
  return '#159a80';}
function bancos_(){ return (D.reservas&&D.reservas.length) ? D.reservas.map(function(r){return [r.nome,r.valor,corBanco_(r.nome)];}) : []; }
function renderPatrimonio(){
  var pt=el('ptNota');
  if(pt){ var dv=0; (D.dividas||[]).forEach(function(d){dv+=d.restante;});
    pt.textContent='Dívidas consideradas: '+BRL(dv)+' em aberto (aba Dívidas).'; }
  var onix=+el('ptOnix').value,cg=+el('ptCG').value,gs=+el('ptGS').value,ls=+el('ptLS').value;
  el('oPtOnix').textContent=BRL(onix);el('oPtCG').textContent=BRL(cg);el('oPtGS').textContent=BRL(gs);el('oPtLS').textContent=ls>0?BRL(ls):'a definir';
  var reservas=84578, veic=onix+cg+gs, bens=reservas+veic+ls, divida=29200, liquido=bens-divida;
  el('ptKpis').innerHTML='<div class="kpi rec"><div class="l">Patrimonio liquido</div><div class="v serif">'+BRL(liquido)+'</div><div class="h">bens menos dividas</div></div>'+
    '<div class="kpi wt"><div class="l">Reserva & investimentos</div><div class="v serif pos">'+BRL(reservas)+'</div><div class="h">dinheiro guardado</div></div>'+
    '<div class="kpi wt"><div class="l">Veiculos (FIPE)</div><div class="v serif">'+BRL(veic)+'</div><div class="h">Onix + 2 motos</div></div>'+
    '<div class="kpi des"><div class="l">Divida (faculdade)</div><div class="v serif">'+BRL(divida)+'</div><div class="h">ate dez/2027</div></div>';
  var BAN=bancos_(); if(!BAN.length){el('ptBancos').innerHTML='<div class="note">Preencha a aba <b>Reservas</b> da planilha.</div>';}
  var mx=Math.max.apply(null,BAN.map(function(b){return b[1];}).concat([1]));
  el('ptBancos').innerHTML=BAN.map(function(b){return '<div class="row"><div class="nm"><i class="dot" style="background:'+b[2]+'"></i>'+b[0]+'</div><div class="bar"><i style="width:'+Math.max(b[1]/mx*100,2)+'%;background:'+b[2]+'"></i></div><div class="vl num">'+BRL(b[1])+'</div></div>';}).join('')+'<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:8px"><div class="nm" style="font-weight:500">Total guardado</div><div class="bar" style="background:none"></div><div class="vl num" style="font-weight:500">'+BRL(reservas)+'</div></div>';
  var linhas=[['Reserva & investimentos',reservas],['Carro Onix 2024',onix],['Moto CG Fan 2008',cg],['Moto BMW GS650 2013',gs],['Leve Sonho (participacao)',ls]];
  el('ptResumo').innerHTML='<table>'+linhas.map(function(l){return '<tr><td>'+l[0]+'</td><td class="n">'+(l[1]>0?BRL(l[1]):'a definir')+'</td></tr>';}).join('')+
    '<tr><td>(menos) Divida faculdade</td><td class="n neg">-'+BRL(divida)+'</td></tr>'+
    '<tr style="border-top:2px solid var(--line)"><td style="font-weight:600">Patrimonio liquido</td><td class="n" style="font-weight:600">'+BRL(liquido)+'</td></tr></table>';
}
['ptOnix','ptCG','ptGS','ptLS'].forEach(function(id){el(id).addEventListener('input',renderPatrimonio);});

// ---------- POSSO GASTAR? (mes atual) ----------
/* o teto de comer fora vem do mes anterior (ver tetoComerFora_) */
function drawPodeGastar(){
  var box=el('podeGastar'); if(!box) return;
  var MA=D.mesAtual;
  if(!MA){ box.innerHTML='<div class="note">Atualize o backend do Apps Script para ver o mes atual.</div>'; return; }
  var TETO_ALIM=tetoComerFora_();
  var alim=((MA.sub&&MA.sub['Restaurante'])||0)+((MA.sub&&MA.sub['Delivery'])||0);
  var rest=Math.max(TETO_ALIM-alim,0);
  var porDia = MA.diasRestantes>0 ? rest/MA.diasRestantes : rest;
  var pct=Math.min(alim/TETO_ALIM*100,100);
  var esperado = TETO_ALIM*(MA.dia/MA.diasNoMes);
  var status, cor, msg;
  if(alim<=esperado*0.9){ status='Tranquilo'; cor='var(--teal)'; msg='Voces estao <b>abaixo</b> do ritmo do mes. Pode pegar o doce sem culpa.'; }
  else if(alim<=esperado*1.1){ status='No ritmo'; cor='var(--amber)'; msg='Estao <b>no ritmo certo</b>. O doce cabe, mas fique de olho no resto da semana.'; }
  else if(alim<TETO_ALIM){ status='Acelerado'; cor='var(--amber)'; msg='Estao gastando <b>mais rapido</b> que o previsto. Melhor segurar os extras.'; }
  else { status='Estourou'; cor='var(--coral)'; msg='O teto do mes <b>ja foi ultrapassado</b>. Vale segurar ate virar o mes.'; }
  var cap=el('pgCap'); if(cap) cap.textContent='Mes de '+MA.label+' - dia '+MA.dia+' de '+MA.diasNoMes+' - faltam '+MA.diasRestantes+' dias';
  var deli=(MA.sub&&(MA.sub['Delivery']||0))||0, restr=(MA.sub&&(MA.sub['Restaurante']||0))||0, merc=(MA.sub&&(MA.sub['Mercado']||0))||0;
  box.innerHTML=
   '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px">'+
    '<div style="background:'+cor+';color:#fff;border-radius:10px;padding:12px 14px"><div style="font-size:11.5px;opacity:.9">SITUACAO</div><div style="font-size:19px;margin-top:3px">'+status+'</div></div>'+
    '<div style="background:var(--surface-2);border-radius:10px;padding:12px 14px"><div style="font-size:11.5px;color:var(--ink-2)">Ja gastou comendo fora</div><div class="serif" style="font-size:21px">'+BRL(alim)+'</div></div>'+
    '<div style="background:var(--surface-2);border-radius:10px;padding:12px 14px"><div style="font-size:11.5px;color:var(--ink-2)">Ainda cabe no mes</div><div class="serif" style="font-size:21px;color:'+(rest>0?'var(--teal)':'var(--coral)')+'">'+BRL(rest)+'</div></div>'+
    '<div style="background:var(--surface-2);border-radius:10px;padding:12px 14px"><div style="font-size:11.5px;color:var(--ink-2)">Por dia ate o fim</div><div class="serif" style="font-size:21px">'+BRL(porDia)+'</div></div>'+
   '</div>'+
   '<div style="height:22px;border-radius:7px;background:var(--surface-2);overflow:hidden;position:relative">'+
     '<div style="width:'+pct+'%;height:100%;background:'+cor+'"></div>'+
     '<div style="position:absolute;left:'+Math.min(esperado/TETO_ALIM*100,100)+'%;top:0;bottom:0;width:2px;background:var(--ink)"></div>'+
   '</div>'+
   '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--ink-2);margin-top:6px"><span>'+BRL(alim)+' de '+BRL(TETO_ALIM)+' ('+pct.toFixed(0)+'%)</span><span>marca preta = ritmo ideal pra hoje</span></div>'+
   '<div style="font-size:11.5px;color:var(--ink-3);margin-top:4px">O teto de '+BRL(TETO_ALIM)+' \u00e9 o que voc\u00eas gastaram comendo fora em <b>'+refRotulo_()+'</b> (restaurante + delivery). A ideia \u00e9 comparar com o m\u00eas passado e ver se est\u00e1 caindo. Mercado n\u00e3o entra \u2014 voc\u00ea acompanha no fluxo de caixa.</div>'+
   '<div class="callout" style="background:var(--surface-2)">'+msg+'<br><span style="font-size:12px;color:var(--ink-2)">No mes: Mercado '+BRL(merc)+' - Restaurante '+BRL(restr)+' - Delivery '+BRL(deli)+' - Gasto total do mes '+BRL(MA.total)+'</span></div>';
}

// ---------- CUSTO DE VIDA ----------

/* liga uma lista de barras (nome -> valor) a gaveta. O nome da barra e a
   subcategoria; a farmacia fixa vem com sufixo, entao corta no parenteses. */
function ligarBarras_(id, dic){
  var cont=el(id); if(!cont) return;
  var nomes=Object.keys(dic).sort(function(a,b){ return dic[b]-dic[a]; });
  [...cont.querySelectorAll('.row')].forEach(function(row,i){
    var nome=nomes[i]; if(!nome) return;
    var sub=nome.split(' (')[0];
    row.classList.add('clicavel');
    row.onclick=function(){ lancDaSub(null, sub); };
  });
}

/* os 3 maiores de um dicionario {nome:valor}, pra citar no texto sem
   deixar exemplo chumbado que envelhece quando a regra muda */
function topo3_(dic){
  var ks = Object.keys(dic || {});
  if(!ks.length) return '';
  return ks.sort(function(x,y){ return dic[y]-dic[x]; })
           .slice(0,3)
           .map(function(k){ return k.toLowerCase(); })
           .join(', ');
}

function renderCusto(){
  var CV=D.custoVida;
  if(!CV){ el('cvKpis').innerHTML='<div class="note">Atualize o backend do Apps Script para ver o custo de vida.</div>'; return; }
  el('cvKpis').innerHTML=
   '<div class="kpi wt"><div class="l">Custo fixo</div><div class="v serif">'+BRL(CV.fixo)+'</div><div class="h">todo m\u00eas</div></div>'+
   '<div class="kpi wt"><div class="l">Custo vari\u00e1vel</div><div class="v serif">'+BRL(CV.variavel)+'</div><div class="h">m\u00e9dia/m\u00eas</div></div>'+
   '<div class="kpi des"><div class="l">Parcelas de d\u00edvidas</div><div class="v serif">'+BRL(CV.parcelas)+'</div><div class="h">enquanto durarem</div></div>'+
   '<div class="kpi sal"><div class="l">Custo de vida previsto</div><div class="v serif">'+BRL(CV.total)+'</div><div class="h">por m\u00eas</div></div>';
  var fd=CV.fixoDet||{}, vd=CV.varDet||{};
  el('cvFixo').innerHTML=barsHTML(Object.keys(fd).map(function(k){return [k,fd[k]];}),function(){return '#5f8c7d';},false);
  ligarBarras_('cvFixo', fd);
  el('cvVar').innerHTML=barsHTML(Object.keys(vd).map(function(k){return [k,vd[k]];}),function(){return '#e2593f';},false);
  ligarBarras_('cvVar', vd);
  var xd=CV.extraDet||{}, xtot=CV.extra||0;
  if(el('cvExtra')){
    el('cvExtra').innerHTML = xtot>0
      ? (barsHTML(Object.keys(xd).map(function(k){return [k,xd[k]];}),function(){return '#9aa7a1';},false))
      : '<div class="note">Nada aqui neste per\u00edodo.</div>';
    ligarBarras_('cvExtra', xd);
    var xc=el('cvExtraCap');
    if(xc) xc.textContent='Fora do custo de vida \u2014 '+BRL(xtot)+'/m\u00eas em m\u00e9dia, '
      +'contando s\u00f3 o que apareceu em 3 meses ou mais. '
      +'N\u00e3o tem data marcada, mas acontece: conta no gasto do m\u00eas, '
      +'n\u00e3o na conta do que voc\u00eas precisam ganhar.';
  }
  /* compara com a renda que entra TODO mes, nao com a media do ano:
     a media inclui participacao nos lucros, que nao da pra contar como salario */
  var rendaRec = D.kpi.rendaRecorrente || D.kpi.renda;
  var rendaMed = D.kpi.renda;
  var bonus = Math.max(0, rendaMed - rendaRec);
  var sobra = rendaRec - CV.total;
  var xpont = CV.extraPontual || 0, xfora = CV.extraFora || {};
  el('cvResumo').innerHTML='<h2>Cabe no or\u00e7amento?</h2>'+
   '<div style="height:24px;border-radius:7px;background:var(--surface-2);overflow:hidden;display:flex;margin:10px 0 8px">'+
   '<div style="width:'+(CV.fixo/rendaRec*100)+'%;background:#5f8c7d"></div>'+
   '<div style="width:'+(CV.variavel/rendaRec*100)+'%;background:#e2593f"></div>'+
   '<div style="width:'+(CV.parcelas/rendaRec*100)+'%;background:#8a6f9e"></div></div>'+
   '<div class="legend"><span><i class="dot" style="background:#5f8c7d"></i>Fixo '+BRL(CV.fixo)+'</span><span><i class="dot" style="background:#e2593f"></i>Vari\u00e1vel '+BRL(CV.variavel)+'</span><span><i class="dot" style="background:#8a6f9e"></i>D\u00edvidas '+BRL(CV.parcelas)+'</span></div>'+
   '<div class="callout '+(sobra>0?'ok':'')+'">Renda que entra todo m\u00eas <b>'+BRL(rendaRec)+'</b> menos custo de vida <b>'+BRL(CV.total)+'</b> = <b>'+BRL(sobra)+'</b> por m\u00eas'+(sobra>0?'.':' \u2014 aten\u00e7\u00e3o, est\u00e1 no vermelho.')+'</div>'+
   (xtot>0
     ? '<div class="note">Dessa sobra ainda sai o <b>gasto extraordin\u00e1rio</b>: <b>'+BRL(xtot)+'/m\u00eas</b> em m\u00e9dia'
       + (topo3_(xd) ? ' \u2014 '+topo3_(xd) : '') + '. '
       + (xtot>sobra
           ? 'Hoje ele \u00e9 <b>maior que a sobra</b>: faltam <b>'+BRL(xtot-sobra)+'</b> por m\u00eas, e quem cobre \u00e9 a participa\u00e7\u00e3o nos lucros'
             + (bonus>0 ? ', que na m\u00e9dia do ano somou <b>'+BRL(bonus)+'/m\u00eas</b> al\u00e9m do sal\u00e1rio.' : '.')
           : 'A sobra cobre ele, com <b>'+BRL(sobra-xtot)+'</b> de folga.')
       + '</div>'
     : '')+
   (xpont>0
     ? '<div class="note">Fora dessa m\u00e9dia ficaram <b>'+BRL(xpont)+'/m\u00eas</b> de coisas que apareceram em <b>menos de 3 meses</b>'
       + (topo3_(xfora) ? ' \u2014 '+topo3_(xfora) : '')
       + '. Evento pontual n\u00e3o \u00e9 gasto recorrente: continua contando no gasto do m\u00eas, s\u00f3 n\u00e3o na m\u00e9dia.</div>'
     : '')+
   (bonus>0 ? '<div class="note">A m\u00e9dia do ano d\u00e1 <b>'+BRL(rendaMed)+'</b> porque inclui a participa\u00e7\u00e3o nos lucros de fev, mar e abr. Aqui em cima uso s\u00f3 o que entra todo m\u00eas: pr\u00f3-labore, PJ e Le Sorelle.</div>' : '');
}

// ---------- DIVIDAS ----------
function renderDividas(){
  var L=D.dividas||[];
  if(!L.length){ el('dvKpis').innerHTML='<div class="note">Rode <b>criarAbaDividas()</b> no Apps Script para criar a aba Dividas.</div>'; el('dvLista').innerHTML=''; return; }
  var tot=0,pago=0,rest=0,parc=0;
  L.forEach(function(d){ tot+=d.total; pago+=d.pago; rest+=d.restante; if(d.faltam>0) parc+=d.parcela; });
  var pct= tot>0 ? pago/tot*100 : 0;
  el('dvKpis').innerHTML=
   '<div class="kpi des"><div class="l">Divida total</div><div class="v serif">'+BRL(tot)+'</div><div class="h">valor contratado</div></div>'+
   '<div class="kpi rec"><div class="l">Ja pago</div><div class="v serif">'+BRL(pago)+'</div><div class="h">'+pct.toFixed(0)+'% quitado</div></div>'+
   '<div class="kpi wt"><div class="l">Falta pagar</div><div class="v serif neg">'+BRL(rest)+'</div><div class="h">saldo devedor</div></div>'+
   '<div class="kpi sal"><div class="l">Peso mensal</div><div class="v serif">'+BRL(parc)+'</div><div class="h">parcelas/mes</div></div>';
  el('dvLista').innerHTML=L.map(function(d){
    var cor = d.pct>=100?'var(--teal)':(d.pct>=50?'#7d9b6a':'var(--amber)');
    return '<div class="card"><h2>'+d.desc+' - '+d.quem+'</h2>'+
    '<p class="cap">'+d.nparc+'x de '+BRL(d.parcela)+(d.entrada?' + entrada de '+BRL(d.entrada):'')+' - faltam <b>'+d.faltam+'</b> parcelas</p>'+
    '<div style="height:26px;border-radius:8px;background:var(--surface-2);overflow:hidden;position:relative">'+
      '<div style="width:'+d.pct+'%;height:100%;background:'+cor+'"></div>'+
      '<div style="position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:600;color:var(--ink)">'+d.pct.toFixed(1)+'%</div>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:12px">'+
      '<div style="background:var(--surface-2);border-radius:9px;padding:9px 11px"><div style="font-size:11px;color:var(--ink-2)">Total</div><div class="serif" style="font-size:17px">'+BRL(d.total)+'</div></div>'+
      '<div style="background:var(--surface-2);border-radius:9px;padding:9px 11px"><div style="font-size:11px;color:var(--ink-2)">Ja pago</div><div class="serif pos" style="font-size:17px">'+BRL(d.pago)+'</div></div>'+
      '<div style="background:var(--surface-2);border-radius:9px;padding:9px 11px"><div style="font-size:11px;color:var(--ink-2)">Falta</div><div class="serif neg" style="font-size:17px">'+BRL(d.restante)+'</div></div>'+
      '<div style="background:var(--surface-2);border-radius:9px;padding:9px 11px"><div style="font-size:11px;color:var(--ink-2)">Parcelas pagas</div><div class="serif" style="font-size:17px">'+d.pagas+'/'+d.nparc+'</div></div>'+
    '</div></div>';
  }).join('');
}

function renderAnalises(){
  var n = el('analisesNota'); if(!n || !D.kpi) return;
  var cv = D.custoVida;
  var custo = cv ? (cv.fixo + cv.variavel + cv.parcelas) : null;
  var margem = custo ? (D.kpi.renda - custo) : null;
  n.innerHTML = 'Números de hoje: renda <b>' + BRL(D.kpi.renda) + '</b>, custo de vida <b>'
    + (custo ? BRL(custo) : '—') + '</b> (fixo + variável + parcelas), margem real <b>'
    + (margem !== null ? BRL(margem) : '—') + '</b>. '
    + 'Se estes números mudarem muito, vale refazer o estudo — ele foi escrito com os dados de 31/08/2026.';
}

/* ---------- FLUXO DE CAIXA ----------
   Agrupa as contas por banco. Se algum cartao mudar de banco, e so
   corrigir aqui embaixo - o resto do painel se vira sozinho. */
const BANCO={
  'Conta Itaú':'Itaú', 'Cartão Itaú 6111':'Itaú',
  'Conta Bradesco':'Bradesco', 'Cartão 8955':'Bradesco', 'Cartão 2401':'Bradesco',
  'Cartão Nubank PF':'Nubank', 'Cartão Nubank Leve Sonho':'Nubank'
};
const CORBANCO={'Itaú':'#e2593f','Bradesco':'#c9284d','Nubank':'#8a4fbd','Outros':'#9aa7a1'};
function bancoDe(conta){
  if(BANCO[conta]) return BANCO[conta];
  const s=(conta||'').toLowerCase();
  if(s.indexOf('ita')>=0) return 'Itaú';
  if(s.indexOf('bradesco')>=0) return 'Bradesco';
  if(s.indexOf('nubank')>=0) return 'Nubank';
  if(s.indexOf('sicoob')>=0) return 'Sicoob';
  return 'Outros';
}
let flxTipo='total';

/* soma as contas do periodo escolhido; no "Ano" tira a media dos meses */
function fluxoAtual(){
  const F=D.fluxo||{}; const meses = filtroMes==='Ano' ? Object.keys(F) : [filtroMes];
  const n = filtroMes==='Ano' ? (meses.length||1) : 1;
  const acc={};
  meses.forEach(function(m){
    const cs=F[m]||{};
    Object.keys(cs).forEach(function(c){
      if(!acc[c]) acc[c]={ent:0,sai:0,entI:0,saiI:0};
      acc[c].ent+=cs[c].ent; acc[c].sai+=cs[c].sai;
      acc[c].entI+=cs[c].entI; acc[c].saiI+=cs[c].saiI;
    });
  });
  Object.keys(acc).forEach(function(c){
    acc[c].ent/=n; acc[c].sai/=n; acc[c].entI/=n; acc[c].saiI/=n;
    acc[c].saldo = acc[c].ent - acc[c].sai;
  });
  return acc;
}


/* ---------- EXTRATO: semanas, filtros e lista de lancamentos ----------
   Aqui o filtro muda os numeros de verdade, nao so a ordem da tabela. */
let fx = {busca:'', cat:'', conta:'', tipo:'tudo', interna:'nao', mostrar:60};

function ehEntrada_(r){
  if(r.length > LC.ENT) return r[LC.ENT] === 1;
  return r[LC.FLAG] === 'RENDA';           /* backend antigo: da pra deduzir */
}
function ehReal_(r){ return r[LC.FLAG]==='GASTO' || r[LC.FLAG]==='RENDA'; }

function lancDoMes_(){
  const todos = D.lanc || [];
  return filtroMes==='Ano' ? todos : todos.filter(r=>r[LC.MES]===filtroMes);
}

function lancFiltrados_(){
  const b = fx.busca.trim().toLowerCase();
  return lancDoMes_().filter(function(r){
    if(fx.interna==='nao' && !ehReal_(r)) return false;
    if(fx.cat && r[LC.MACRO]!==fx.cat) return false;
    if(fx.conta && r[LC.CONTA]!==fx.conta) return false;
    const ent = ehEntrada_(r);
    if(fx.tipo==='ent' && !ent) return false;
    if(fx.tipo==='sai' && ent) return false;
    if(b){
      const alvo=(r[LC.DESC]+' '+r[LC.MACRO]+' '+r[LC.SUB]+' '+r[LC.CONTA]+' '+r[LC.PESSOA]).toLowerCase();
      if(alvo.indexOf(b)<0) return false;
    }
    return true;
  }).sort((x,y)=>diaDe_(y[LC.DATA]).localeCompare(diaDe_(x[LC.DATA])));
}

function opcoes_(id, lista, atual, rotuloTudo){
  const e=el(id); if(!e) return;
  e.innerHTML = '<option value="">'+rotuloTudo+'</option>' +
    lista.map(v=>'<option value="'+esc_(v)+'"'+(v===atual?' selected':'')+'>'+esc_(v)+'</option>').join('');
}


/* ---------- etiquetas coloridas de conta e pessoa ----------
   Pessoa: Karol pink, Vinicius azul marinho, Familia caramelo.
   Banco: a cor da marca. Conta da EMPRESA (Leve Sonho / Sicoob)
   vem em branco com contorno, pra separar do dinheiro do casal. */
function saTxt_(s){ return String(s||'').normalize('NFKD')
  .replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
function chaveBadge_(txt){
  const s=saTxt_(txt);
  if(s.indexOf('karol')>=0) return 'karol';
  if(s.indexOf('vinicius')>=0) return 'vinicius';
  if(s.indexOf('familia')>=0) return 'familia';
  if(s.indexOf('sicoob')>=0) return 'sicoob';
  if(s.indexOf('nubank')>=0) return 'nubank';
  if(s.indexOf('bradesco')>=0 || s.indexOf('8955')>=0 || s.indexOf('2401')>=0) return 'bradesco';
  if(s.indexOf('ita')>=0) return 'itau';
  return '';
}
function ehPJ_(txt){
  const s=saTxt_(txt);
  return s.indexOf('leve sonho')>=0 || s.indexOf('sicoob')>=0;
}
function badge_(txt){
  if(!txt) return '';
  const k=chaveBadge_(txt);
  if(!k) return esc_(txt);
  return '<span class="bdg b-'+k+(ehPJ_(txt)?' pj':'')+'">'+esc_(txt)+'</span>';
}


/* ---------- EDITAR CONTA E QUEM NA PROPRIA LISTA ----------
   Clica na etiqueta, vira um select, escolhe e ja grava na planilha.
   So esses dois campos: sao os que ela erra na hora de lancar. */

/* O backend le valor no formato brasileiro: ponto e separador de MILHAR.
   Se o painel mandasse 27.8, o num_ de la entenderia 278. Entao mando
   com virgula decimal, que e o que ele espera. */
function valorBR_(v){
  var n = Number(v);
  if (!isFinite(n)) return String(v || '').replace('.', ',');
  return n.toFixed(2).replace('.', ',');
}

function opcoesDe_(campo){
  if(campo==='pessoa') return ['Família','Karol','Vinícius'];
  return [...new Set((D.lanc||[]).map(function(r){return r[LC.CONTA];}).filter(Boolean))].sort();
}
async function salvarEdicao_(tr, campo, valor){
  var params={
    acao:'editar', token:idToken,
    linha:tr.dataset.lin, data:tr.dataset.dt, desc:tr.dataset.ds, valor:valorBR_(tr.dataset.vl)
  };
  params[campo]=valor;
  var qs=Object.keys(params).map(function(k){ return k+'='+encodeURIComponent(params[k]); }).join('&');
  try{
    var resp=await fetch(CFG.APPS_SCRIPT_URL+'?'+qs+'&_='+Date.now(),{cache:'no-store'});
    return await resp.json();
  }catch(e){ return {ok:false, erro:String(e)}; }
}
function editarCelula_(td){
  if(td.querySelector('select')) return;
  var tr=td.closest('tr');
  if(!tr || !tr.dataset.lin){ return; }
  var campo=td.dataset.campo;
  var atual=td.textContent.trim();
  var opts=opcoesDe_(campo);
  if(opts.indexOf(atual)<0) opts=[atual].concat(opts);
  var antes=td.innerHTML;

  var sel=document.createElement('select');
  sel.className='edsel';
  sel.innerHTML=opts.map(function(o){
    return '<option'+(o===atual?' selected':'')+'>'+esc_(o)+'</option>'; }).join('');
  td.innerHTML=''; td.appendChild(sel); sel.focus();

  var fechou=false;
  function voltar(){ if(!fechou){ fechou=true; td.innerHTML=antes; } }
  sel.addEventListener('blur', function(){ setTimeout(voltar, 120); });
  sel.addEventListener('keydown', function(e){ if(e.key==='Escape') voltar(); });
  sel.addEventListener('change', async function(){
    fechou=true;
    var novo=sel.value;
    if(novo===atual){ td.innerHTML=antes; return; }
    td.innerHTML='<span class="edsalv">salvando...</span>';
    var r=await salvarEdicao_(tr, campo, novo);
    if(r && r.ok){
      /* atualiza a base em memoria e repinta tudo que depende disso */
      var lin=String(tr.dataset.lin);
      (D.lanc||[]).forEach(function(x){
        if(String(x[LC.LINHA])===lin) x[campo==='pessoa'?LC.PESSOA:LC.CONTA]=novo;
      });
      renderFluxo(); renderPessoa();
      var m=el('flxMsgEd');
      if(m){ m.className='ok'; m.textContent='✓ '+novo+' salvo na planilha.';
        setTimeout(function(){ m.textContent=''; }, 4000); }
    }else{
      td.innerHTML=antes;
      var m2=el('flxMsgEd');
      if(m2){ m2.className='err'; m2.textContent='✗ '+((r&&r.erro)||'Não consegui salvar.'); }
    }
  });
}
function ligarEdicao_(){
  var t=el('flxLista'); if(!t) return;
  [...t.querySelectorAll('td.ed')].forEach(function(td){
    td.title='Clique pra trocar';
    td.onclick=function(){ editarCelula_(td); };
  });
}

function renderExtrato(){
  if(!el('flxLista') || !D.lanc) return;
  const doMes = lancDoMes_();

  /* selects de categoria e conta, montados a partir do que existe no mes */
  const cats=[...new Set(doMes.map(r=>r[LC.MACRO]).filter(Boolean))].sort();
  const contas=[...new Set(doMes.map(r=>r[LC.CONTA]).filter(Boolean))].sort();
  if(fx.cat && cats.indexOf(fx.cat)<0) fx.cat='';
  if(fx.conta && contas.indexOf(fx.conta)<0) fx.conta='';
  opcoes_('flxCat', cats, fx.cat, 'Todas as categorias');
  opcoes_('flxConta', contas, fx.conta, 'Todas as contas');
  if(el('flxTipo')) el('flxTipo').value = fx.tipo;
  if(el('flxInterna')) el('flxInterna').value = fx.interna;
  if(el('flxBusca')) el('flxBusca').value = fx.busca;

  const lista = lancFiltrados_();
  let ent=0, sai=0;
  lista.forEach(function(r){ if(ehEntrada_(r)) ent+=r[LC.VALOR]; else sai+=r[LC.VALOR]; });

  el('flxResumo').innerHTML =
    '<span class="qtd">'+lista.length+(lista.length===1?' lan\u00e7amento':' lan\u00e7amentos')+'</span>'+
    '<span>Entradas <b class="pos">'+BRL(ent)+'</b></span>'+
    '<span>Sa\u00eddas <b class="neg">'+BRL(sai)+'</b></span>'+
    '<span>Saldo <b>'+BRL(ent-sai)+'</b></span>'+
    '<span id="flxMsgEd"></span>';

  const ate = lista.slice(0, fx.mostrar);
  el('flxLista').innerHTML = ate.length
    ? '<div class="tab-wrap"><table class="exttab"><thead><tr>'
      + '<th>Data</th><th>Descri\u00e7\u00e3o</th><th>Categoria</th>'
      + '<th>Subcategoria</th><th>Conta</th><th>Quem</th><th class="n">Valor</th>'
      + '</tr></thead><tbody>'
      + ate.map(function(r){
          const e=ehEntrada_(r), tr=!ehReal_(r);
          return '<tr class="'+(e?'e':'s')+(tr?' tr':'')+'" data-lin="'+(r[LC.LINHA]||'')
            +'" data-dt="'+esc_(r[LC.DATA])+'" data-ds="'+esc_(r[LC.DESC])
            +'" data-vl="'+r[LC.VALOR]+'">'
            + '<td class="dt">'+esc_(r[LC.DATA])+'</td>'
            + '<td class="ds">'+esc_(r[LC.DESC])+(tr?' <span class="tag">'+r[LC.FLAG]+'</span>':'')+'</td>'
            + '<td>'+esc_(r[LC.MACRO])+'</td>'
            + '<td>'+esc_(r[LC.SUB])+'</td>'
            + '<td class="ed" data-campo="conta">'+badge_(r[LC.CONTA])+'</td>'
            + '<td class="ed" data-campo="pessoa">'+badge_(r[LC.PESSOA])+'</td>'
            + '<td class="n vl">'+(e?'+':'\u2212')+' '+BRL(r[LC.VALOR]).replace('R$ ','')+'</td>'
            + '</tr>';
        }).join('')
      + '</tbody></table></div>'
      + (lista.length>ate.length
          ? '<div class="ext-mais"><button class="chip" id="flxMais">Ver mais '
            + Math.min(60, lista.length-ate.length) + ' de ' + (lista.length-ate.length) + ' restantes</button></div>'
          : '')
    : '<div class="note">Nenhum lan\u00e7amento com esses filtros.</div>';

  const bt=el('flxMais');
  if(bt) bt.onclick=function(){ fx.mostrar+=60; renderExtrato(); };
  ligarEdicao_();
}

/* semanas do mes escolhido (no "Ano", mostra os meses) */
function renderSemanas(){
  const cx=el('flxSemanas'); if(!cx || !D.lanc) return;
  const reais = lancDoMes_().filter(ehReal_);
  let baldes;
  if(filtroMes==='Ano'){
    baldes = MESES.map(function(m){
      let e=0,s=0;
      (D.lanc||[]).forEach(function(r){ if(r[LC.MES]!==m||!ehReal_(r)) return;
        if(ehEntrada_(r)) e+=r[LC.VALOR]; else s+=r[LC.VALOR]; });
      return {rot:m, e:e, s:s};
    });
    el('flxSemCap').textContent='Quanto entrou e quanto saiu em cada m\u00eas.';
  } else {
    const faixas=[[1,7],[8,14],[15,21],[22,28],[29,31]];
    baldes = faixas.map(function(f){
      let e=0,s=0;
      reais.forEach(function(r){
        const d=parseInt((r[LC.DATA]||'').slice(0,2),10);
        if(!(d>=f[0] && d<=f[1])) return;
        if(ehEntrada_(r)) e+=r[LC.VALOR]; else s+=r[LC.VALOR];
      });
      return {rot:('0'+f[0]).slice(-2)+'\u2013'+('0'+f[1]).slice(-2), e:e, s:s};
    }).filter(x=>x.e||x.s);
    el('flxSemCap').textContent='Quanto entrou e quanto saiu em cada semana de '+filtroMes+'.';
  }
  const top=Math.max.apply(null, baldes.map(x=>Math.max(x.e,x.s)).concat([1]));
  cx.innerHTML = baldes.map(function(x){
    const sal=x.e-x.s;
    return '<div class="sem-row"><span class="rot">'+x.rot+'</span>'
      + '<span class="sem-duo">'
      +   '<i class="e" style="width:'+(x.e/top*100).toFixed(1)+'%"></i>'
      +   '<i class="s" style="width:'+(x.s/top*100).toFixed(1)+'%"></i>'
      + '</span>'
      + '<span class="sal num '+(sal>=0?'pos':'neg')+'">'+BRL(sal)+'</span></div>';
  }).join('') || '<div class="note">Sem movimento neste per\u00edodo.</div>';
}

(function(){
  function liga(id, campo, ev){
    const e=el(id); if(!e) return;
    e.addEventListener(ev, function(){ fx[campo]=e.value; fx.mostrar=60; renderExtrato(); });
  }
  liga('flxBusca','busca','input');
  liga('flxCat','cat','change');
  liga('flxConta','conta','change');
  liga('flxTipo','tipo','change');
  liga('flxInterna','interna','change');
  const lp=el('flxLimpar');
  if(lp) lp.onclick=function(){
    fx={busca:'',cat:'',conta:'',tipo:'tudo',interna:'nao',mostrar:60}; renderExtrato(); };
})();


/* ---------- NOVO LANCAMENTO ----------
   As opcoes saem do que ja existe na base, entao nao da pra inventar
   uma conta ou categoria que o painel nao saiba somar. */
function opcoesSimples_(id, lista, atual){
  var e=el(id); if(!e) return;
  e.innerHTML = lista.map(function(v){
    return '<option value="'+esc_(v)+'"'+(v===atual?' selected':'')+'>'+esc_(v)+'</option>';
  }).join('');
}
function paresMacroSub_(){
  var m={};
  (D.lanc||[]).forEach(function(r){
    var ma=r[LC.MACRO], su=r[LC.SUB];
    if(!ma) return;
    if(!m[ma]) m[ma]={};
    if(su) m[ma][su]=1;
  });
  return m;
}
function montarFormNovo(){
  var f=el('nvForm'); if(!f || !D.lanc) return;
  var contas=[...new Set((D.lanc||[]).map(function(r){return r[LC.CONTA];}).filter(Boolean))].sort();
  var mapa=paresMacroSub_();
  var macros=Object.keys(mapa).sort();

  opcoesSimples_('nvConta', contas, el('nvConta').value);
  opcoesSimples_('nvMacro', macros, el('nvMacro').value);
  atualizarSubs_();

  /* meses: os que o painel conhece, do mais novo pro mais antigo */
  var eMes=el('nvMes');
  if(eMes && !eMes.dataset.pronto){
    var lista=(MESES||[]).slice().reverse();
    eMes.innerHTML=lista.map(function(m){
      return '<option value="'+esc_(m)+'">'+esc_(m)+'/2026</option>';
    }).join('');
    eMes.dataset.pronto='1';
  }

  var eData=el('nvData');
  if(eData && !eData.value){
    var h=new Date();
    eData.value=h.getFullYear()+'-'+('0'+(h.getMonth()+1)).slice(-2)+'-'+('0'+h.getDate()).slice(-2);
  }
}
function atualizarSubs_(){
  var mapa=paresMacroSub_(), ma=el('nvMacro').value;
  var subs=Object.keys(mapa[ma]||{}).sort();
  opcoesSimples_('nvSub', subs.length?subs:['(sem subcategoria)'], el('nvSub').value);
}
function mesISOdoInput_(){
  /* o mes de competencia escolhido vira 2026-09; se nao der, usa a data */
  var rot=el('nvMes').value;
  var i=(MESES||[]).indexOf(rot);
  var MN={'Jan':'01','Fev':'02','Mar':'03','Abr':'04','Mai':'05','Jun':'06',
          'Jul':'07','Ago':'08','Set':'09','Out':'10','Nov':'11','Dez':'12'};
  if(i>=0 && MN[rot]) return '2026-'+MN[rot];
  return (el('nvData').value||'').slice(0,7);
}
(function(){
  var f=el('nvForm'); if(!f) return;
  var eMacro=el('nvMacro'); if(eMacro) eMacro.addEventListener('change', atualizarSubs_);
  /* ao trocar a data, sugere o mes de competencia correspondente */
  var eData=el('nvData');
  if(eData) eData.addEventListener('change', function(){
    var mm=(eData.value||'').slice(5,7);
    var NM={'01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun',
            '07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez'};
    var alvo=NM[mm];
    if(alvo && [...el('nvMes').options].some(function(o){return o.value===alvo;})) el('nvMes').value=alvo;
  });

  f.addEventListener('submit', async function(ev){
    ev.preventDefault();
    var msg=el('nvMsg'), bt=el('nvSalvar');
    var d=(el('nvData').value||'').split('-');
    if(d.length!==3){ msg.className='err'; msg.textContent='Escolha a data.'; return; }
    var params={
      acao:'novo',
      token:idToken,
      data:d[2]+'/'+d[1]+'/'+d[0],
      desc:el('nvDesc').value.trim(),
      valor:valorBR_(el('nvValor').value),
      tipo:el('nvTipo').value,
      conta:el('nvConta').value,
      macro:el('nvMacro').value,
      sub:(el('nvSub').value==='(sem subcategoria)'?'':el('nvSub').value),
      pessoa:el('nvPessoa').value,
      mes:mesISOdoInput_()
    };
    var qs=Object.keys(params).map(function(k){
      return k+'='+encodeURIComponent(params[k]); }).join('&');

    bt.disabled=true; msg.className=''; msg.textContent='Lançando...';
    var r;
    try{
      var resp=await fetch(CFG.APPS_SCRIPT_URL+'?'+qs+'&_='+Date.now(),{cache:'no-store'});
      r=await resp.json();
    }catch(e){ r={ok:false, erro:String(e)}; }

    if(r && r.ok){
      msg.className='ok'; msg.textContent='✓ '+r.msg+' — atualizando...';
      el('nvDesc').value=''; el('nvValor').value='';
      try{
        var resp2=await fetch(CFG.APPS_SCRIPT_URL+'?token='+encodeURIComponent(idToken)+'&_='+Date.now(),{cache:'no-store'});
        var novo=await resp2.json();
        if(novo && !novo.error){ D=novo; renderAll(); msg.className='ok'; msg.textContent='✓ Lançado e já no painel.'; }
      }catch(e){ msg.textContent='✓ Lançado. Recarregue a página pra ver no painel.'; }
    }else{
      msg.className='err'; msg.textContent='✗ '+((r&&r.erro)||'Não consegui lançar.');
    }
    bt.disabled=false;
  });
})();

function renderFluxo(){
  if(!el('flxTabela') || !D.fluxo) return;
  const A=fluxoAtual();
  const contas=Object.keys(A).filter(c=>A[c].ent||A[c].sai||A[c].entI||A[c].saiI);

  let ent=0,sai=0,entI=0,saiI=0;
  contas.forEach(c=>{ent+=A[c].ent;sai+=A[c].sai;entI+=A[c].entI;saiI+=A[c].saiI;});

  el('flxKpis').innerHTML=
    '<div class="kpi rec"><div class="l">Entrou</div><div class="v serif">'+BRL(ent)+'</div><div class="h">renda de verdade</div></div>'+
    '<div class="kpi des"><div class="l">Saiu</div><div class="v serif">'+BRL(sai)+'</div><div class="h">gasto de verdade</div></div>'+
    '<div class="kpi sal"><div class="l">Sobrou</div><div class="v serif">'+BRL(ent-sai)+'</div><div class="h">'+txtPeriodo()+'</div></div>'+
    '<div class="kpi wt"><div class="l">Entre contas</div><div class="v serif">'+BRL(saiI)+'</div><div class="h">fatura, transferência, estorno</div></div>';

  const porBanco={};
  contas.forEach(c=>{const b=bancoDe(c);(porBanco[b]=porBanco[b]||[]).push(c);});
  const ordem=['Itaú','Bradesco','Nubank','Outros'].filter(b=>porBanco[b]);

  const val=o=> (o.ent-o.sai);
  const mx=Math.max.apply(null,contas.map(c=>Math.abs(val(A[c]))).concat([1]));

  let html='<div class="tab-wrap"><table><thead><tr><th>Conta</th><th class="n">Entrou</th><th class="n">Saiu</th>'+
    '<th class="n">Saldo</th><th class="n">Entre contas</th></tr></thead><tbody>';
  ordem.forEach(function(b){
    let be=0,bs=0,bi=0;
    porBanco[b].forEach(c=>{be+=A[c].ent;bs+=A[c].sai;bi+=A[c].saiI+A[c].entI;});
    html+='<tr class="flx-banco"><td><i class="dot" style="background:'+(CORBANCO[b]||CORBANCO.Outros)+'"></i> '+b+'</td>'+
      '<td class="n pos">'+BRL(be)+'</td><td class="n neg">'+BRL(bs)+'</td>'+
      '<td class="n"><b>'+BRL(be-bs)+'</b></td><td class="n" style="color:var(--ink-3)">'+BRL(bi)+'</td></tr>';
    porBanco[b].sort((x,y)=>Math.abs(val(A[y]))-Math.abs(val(A[x]))).forEach(function(c){
      const o=A[c], w=Math.max(Math.abs(val(o))/mx*100,1.5);
      html+='<tr class="flx-conta clicavel" data-conta="'+esc_(c)+'"><td><span class="flx-nome">'+c+'</span>'+
        '<span class="flx-bar"><i style="width:'+w.toFixed(1)+'%;background:'+(CORBANCO[b]||CORBANCO.Outros)+'"></i></span></td>'+
        '<td class="n">'+BRL(o.ent)+'</td><td class="n">'+BRL(o.sai)+'</td>'+
        '<td class="n '+(o.saldo>=0?'pos':'neg')+'">'+BRL(o.saldo)+'</td>'+
        '<td class="n" style="color:var(--ink-3)">'+BRL(o.saiI+o.entI)+'</td></tr>';
    });
  });
  html+='<tr class="flx-total"><td>Total</td><td class="n pos">'+BRL(ent)+'</td><td class="n neg">'+BRL(sai)+
    '</td><td class="n"><b>'+BRL(ent-sai)+'</b></td><td class="n" style="color:var(--ink-3)">'+BRL(entI+saiI)+'</td></tr>';
  html+='</tbody></table></div>';
  el('flxTabela').innerHTML=html;
  [...el('flxTabela').querySelectorAll('.flx-conta')].forEach(function(tr){
    tr.onclick=function(){ lancDaConta(tr.dataset.conta); };
  });

  el('flxCap').textContent = 'Onde o dinheiro passou — '+txtPeriodo()+'. '+
    (flxTipo==='ent'?'Ordenado pelo que entrou.':flxTipo==='sai'?'Ordenado pelo que saiu.':'Ordenado pelo saldo.');

  const F=D.fluxo||{}, ms=MESES.filter(function(x){return F[x];});
  const serie=ms.map(function(m){
    let e=0,s=0; Object.keys(F[m]).forEach(function(c){e+=F[m][c].ent;s+=F[m][c].sai;});
    return {m:m,e:e,s:s};
  });
  const top=Math.max.apply(null,serie.map(x=>Math.max(x.e,x.s)).concat([1]));
  el('flxSerie').innerHTML=serie.map(function(x){
    const sal=x.e-x.s;
    return '<div class="flx-mes'+(x.m===filtroMes?' on':'')+'" data-m="'+x.m+'">'+
      '<span class="flx-rot">'+x.m+'</span>'+
      '<span class="flx-duo">'+
        '<i class="e" style="width:'+(x.e/top*100).toFixed(1)+'%"></i>'+
        '<i class="s" style="width:'+(x.s/top*100).toFixed(1)+'%"></i>'+
      '</span>'+
      '<span class="flx-sal num '+(sal>=0?'pos':'neg')+'">'+BRL(sal)+'</span></div>';
  }).join('');
  [...el('flxSerie').querySelectorAll('.flx-mes')].forEach(function(d){
    d.onclick=function(){ filtroMes=d.dataset.m; setupMes(); renderVisao(); renderCat(); renderPessoa(); renderFluxo(); };
  });

  renderSemanas(); renderExtrato(); montarFormNovo();

  el('flxNota').innerHTML='<b>Entre contas</b> é dinheiro que só trocou de bolso: pagamento de fatura, '+
    'transferência de um banco pro outro, estorno de compra. Não é gasto nem renda, por isso fica numa coluna à parte — '+
    'senão a mesma compra apareceria duas vezes: no cartão e de novo na conta que pagou a fatura.';
}


/* ---------- GAVETA DE LAN\u00c7AMENTOS ----------
   D.lanc vem do backend como array enxuto:
   [mes, data, descricao, valor, conta, pessoa, macro, sub, flag] */
const LC={MES:0,DATA:1,DESC:2,VALOR:3,CONTA:4,PESSOA:5,MACRO:6,SUB:7,FLAG:8,ENT:9,LINHA:10};
function diaDe_(d){ var p=String(d||'').split('/');
  return p.length===3 ? (p[2]+p[1]+p[0]) : '00000000'; }

function abrirLanc(titulo, pred, nota){
  var g=el('gavetaLanc'); if(!g || !D.lanc){ return; }
  var mesAtivo = filtroMes!=='Ano';
  var linhas = D.lanc.filter(function(r){
    if(mesAtivo && r[LC.MES]!==filtroMes) return false;
    return pred(r);
  }).sort(function(x,y){ return diaDe_(y[LC.DATA]).localeCompare(diaDe_(x[LC.DATA])); });

  el('gavetaTitulo').textContent = titulo;
  var tot = linhas.reduce(function(s,r){ return s + (r[LC.FLAG]==='GASTO'||r[LC.FLAG]==='RENDA' ? r[LC.VALOR] : 0); },0);
  el('gavetaSub').textContent = linhas.length + (linhas.length===1?' lan\u00e7amento':' lan\u00e7amentos')
    + ' \u00b7 ' + (mesAtivo ? filtroMes+'/2026' : 'ano todo')
    + (nota ? ' \u00b7 ' + nota : '');

  el('gavetaCorpo').innerHTML = linhas.length
    ? linhas.map(function(r){
        var interna = !(r[LC.FLAG]==='GASTO'||r[LC.FLAG]==='RENDA');
        return '<div class="lanc'+(interna?' interna':'')+'">'
          + '<div class="d">'+esc_(r[LC.DESC])+'</div>'
          + '<div class="v num">'+BRL(r[LC.VALOR])+'</div>'
          + '<div class="m">'+r[LC.DATA]+' '+badge_(r[LC.CONTA])+' '+badge_(r[LC.PESSOA])
          + (interna? ' \u00b7 '+r[LC.FLAG] : '')+'</div></div>';
      }).join('') + '<div class="gaveta-tot"><span>Total</span><span class="num">'+BRL(tot)+'</span></div>'
    : '<div class="note">Nenhum lan\u00e7amento aqui neste per\u00edodo. '
      +'Se voc\u00ea esperava encontrar algum, ou ele est\u00e1 em outro m\u00eas, ou em outra categoria.</div>';

  g.hidden=false;
  document.body.style.overflow='hidden';
}
function esc_(s){ return String(s==null?'':s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fecharLanc(){ var g=el('gavetaLanc'); if(!g) return;
  g.hidden=true; document.body.style.overflow=''; }
(function(){
  var f=el('gavetaFechar'), fu=el('gavetaFundo');
  if(f) f.onclick=fecharLanc;
  if(fu) fu.onclick=fecharLanc;
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') fecharLanc(); });
})();

/* atalhos por tipo de clique */
function lancDaSub(macro, sub){
  abrirLanc(sub, function(r){ return r[LC.SUB]===sub && (!macro || r[LC.MACRO]===macro); },
    macro || '');
}
function lancDaConta(conta){
  abrirLanc(conta, function(r){ return r[LC.CONTA]===conta; }, 'todos os movimentos');
}
function lancDoMacro(macro){
  abrirLanc(macro, function(r){ return r[LC.MACRO]===macro; }, 'categoria inteira');
}

function renderAll(){setupMes();renderVisao();renderFluxo();renderCat();renderPessoa();renderMetas();renderIphone();renderProj();renderPatrimonio();renderCusto();renderDividas();renderAnalises();}
function initGoogle(){
  var g=document.getElementById('loginGate');
  if(!window.google||!CFG.GOOGLE_CLIENT_ID||String(CFG.GOOGLE_CLIENT_ID).indexOf('COLE')===0){g.innerHTML='<p>Configuração pendente: preencha js/config.js com GOOGLE_CLIENT_ID e APPS_SCRIPT_URL.</p>';return;}
  google.accounts.id.initialize({client_id:CFG.GOOGLE_CLIENT_ID,callback:onCred});
  google.accounts.id.renderButton(document.getElementById('googleBtn'),{theme:'outline',size:'large',text:'signin_with',shape:'pill'});
  if(idToken) verificar(idToken);
}
async function onCred(r){idToken=r.credential;sessionStorage.setItem('id_token',idToken);await verificar(idToken);}
async function verificar(token){
  var data;
  try{const resp=await fetch(CFG.APPS_SCRIPT_URL+'?token='+encodeURIComponent(token)+'&_='+Date.now(),{cache:'no-store'});data=await resp.json();}catch(e){data={error:String(e)};}
  if(data&&data.error==='not_authorized'){document.getElementById('deniedEmail').textContent=decodeJwtEmail(token);document.getElementById('loginDenied').style.display='block';sessionStorage.removeItem('id_token');idToken=null;return;}
  if(data&&data.error){document.getElementById('loginGate').innerHTML='<p>Erro ao conectar com o painel: '+data.error+'</p>';return;}
  D=data;
  document.getElementById('userEmail').textContent=data.email||'';
  document.getElementById('loginGate').style.display='none';
  document.getElementById('app').style.display='block';
  renderAll();
}
document.getElementById('btnSair').addEventListener('click',function(){sessionStorage.removeItem('id_token');location.reload();});
window.addEventListener('load',initGoogle);
