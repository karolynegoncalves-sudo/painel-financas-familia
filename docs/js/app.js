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
const TABS=[["visao","Visão geral"],["cat","Categorias & subcategorias"],["pessoa","Família / Karol / Vinícius"],["metas","Metas & delivery"],["custo","Custo de vida"],["dividas","Dívidas"],["proj","Projeção 2027"],["patrim","Patrimônio"]];
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
    b.onclick=function(){ filtroMes=b.dataset.m; aberta=null; p3Aberta=null; setupMes(); renderVisao(); renderCat(); renderPessoa(); };
  });
}
function setupMes(){MESES=Object.keys(D.mensal);
  chipsMes_('fMesCat'); chipsMes_('fMesP3');el("fMes").innerHTML=['Ano',...MESES].map(m=>`<button class="chip${m==='Ano'?' on':''}" data-m="${m}">${m==='Ano'?'Ano (média)':m}</button>`).join("");
[...el("fMes").querySelectorAll('.chip')].forEach(b=>b.onclick=()=>{filtroMes=b.dataset.m;[...el("fMes").querySelectorAll('.chip')].forEach(x=>x.classList.toggle('on',x===b));renderVisao();});}


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
    el('catBack').innerHTML=`<button class="chip" id="catBackBtn" style="margin-top:12px">← voltar às categorias</button>`;
    el('catBackBtn').onclick=()=>{catSel=null;renderCat();};
    el('catTitle').textContent=catSel+' → subcategorias';
    el('catCap').textContent='Detalhe de '+catSel+'. Clique em "voltar" pra ver todas as categorias.';
  }
  const tot=D.subflat.reduce((s,x)=>s+x.valor,0);
  el("rankBody").innerHTML=D.subflat.map((x,i)=>`<tr><td>${i+1}</td><td><i class="dot" style="background:${cor(x.macro)}"></i> ${x.sub}</td><td style="color:var(--ink-2)">${x.macro}</td><td class="n">${BRL(x.valor)}</td><td class="n">${(x.valor/tot*100).toFixed(1)}%</td></tr>`).join("");
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
function ajustarSlidersComida(){
  var C=comidaAtual();
  var pares=[['sDeli',C.deli,0.5],['sRest',C.rest,0.5],['sMerc',C.merc,0.85]];
  pares.forEach(function(p){
    var e=el(p[0]); if(!e) return;
    var max=Math.max(Math.round(p[1]),10);
    e.max=max; if(+e.value>max || e.dataset.init!=='1'){ e.value=Math.round(max*p[2]); e.dataset.init='1'; }
  });
  var ld=el('labDeli'), lr=el('labRest'), lm=el('labMerc');
  if(ld) ld.textContent='Delivery (hoje '+BRL(C.deli)+')';
  if(lr) lr.textContent='Restaurante (hoje '+BRL(C.rest)+')';
  if(lm) lm.textContent='Mercado (hoje '+BRL(C.merc)+')';
  var cc=el('cutCap');
  if(cc) cc.innerHTML='Ajuste os tetos e veja quanto corta ('+txtPeriodo()+'). Comer fora (restaurante + delivery) custa hoje <b>'+BRL(C.rest+C.deli)+'</b>.';
}
function renderMetas(){
  ajustarSlidersComida();
  const deli=+el("sDeli").value,rest=+el("sRest").value,merc=+el("sMerc").value;
  el("oDeli").textContent=BRL(deli);el("oRest").textContent=BRL(rest);el("oMerc").textContent=BRL(merc);
  const corte=(579-deli)+(804-rest)+(2244-merc);
  const meta=1200,pct=Math.min(corte/meta*100,100);
  const ok=corte>=meta;
  el("cutResult").innerHTML=`<div style="height:20px;border-radius:6px;background:var(--surface-2);overflow:hidden"><div style="width:${pct}%;height:100%;background:${ok?'var(--teal)':'var(--amber)'}"></div></div>
   <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px"><span>Corte total: <b>${BRL(corte)}/mês</b></span><span>Meta: R$ 1.200</span></div>
   <div class="callout ${ok?'ok':''}">${ok?`✅ Meta batida! Você corta <b>${BRL(corte)}/mês</b> = <b>${BRL(corte*12)}/ano</b> a mais pra investir.`:`Faltam <b>${BRL(meta-corte)}/mês</b> pra meta. Puxe mais o delivery ou o restaurante.`}</div>`;
  // teto delivery
  const sem=deli/4.33,dia=deli/30;
  el("dMes").textContent=BRL(deli);el("dSem").textContent=BRL(sem);el("dDia").textContent=BRL(dia);
  el("dNote").innerHTML=`Hoje o delivery é R$ 579/mês (~R$ 19/dia). Com o teto de <b>${BRL(deli)}/mês</b>, o limite vira <b>${BRL(sem)}/semana</b> ou <b>${BRL(dia)}/dia</b>. Combine: dias de semana sem delivery, e um "dia de delivery" no fim de semana dentro do teto.`;
}
['sDeli','sRest','sMerc'].forEach(id=>el(id).addEventListener('input',renderMetas));

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

  var reserva=D.kpi.reserva, renda=D.kpi.renda, linhas=[];
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
function renderIphone(){
  var preco=+el('ipPreco').value, meses=+el('ipMeses').value, total=preco*2;
  el('oIpPreco').textContent=BRL(preco);
  el('oIpMeses').textContent=meses+(meses>1?' meses':' mes');
  var sobra=(D&&D.kpi)?D.kpi.sobra:4515;
  var porMes=total/meses, pct=porMes/sobra*100, cabe=porMes<=sobra, msg;
  if(ipModo==='juntar'){
    msg='Guardando <b>'+BRL(porMes)+'/mes</b> por '+meses+' meses, voces compram os 2 <b>a vista</b> ('+BRL(total)+') <b>sem juros</b>. Enquanto junta, o dinheiro ainda rende na reserva. E o caminho mais barato.';
  }else{
    var j=0.03, comJuros=meses<=12?porMes:(total*j/(1-Math.pow(1+j,-meses)));
    msg='Parcelado em '+meses+'x: ~<b>'+BRL(comJuros)+'/mes</b> ('+(meses<=12?'sem juros se a loja parcelar sem juros':'com juros de cartao ~3% a.m.')+'). Compromete a sobra por '+meses+' meses. <b>Juntar sai melhor</b> — evita juros.';
  }
  el('ipResult').innerHTML='<div style="height:20px;border-radius:6px;background:var(--surface-2);overflow:hidden"><div style="width:'+Math.min(pct,100)+'%;height:100%;background:'+(cabe?'var(--teal)':'var(--coral)')+'"></div></div>'+
    '<div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px"><span>Sai <b>'+BRL(porMes)+'/mes</b></span><span>'+Math.round(pct)+'% da sobra ('+BRL(sobra)+')</span></div>'+
    '<div class="callout '+(cabe?'ok':'')+'">'+(cabe?'✅ Cabe na sobra mensal de voces. ':'⚠️ Passa da sobra atual, alonguem o prazo. ')+msg+'</div>';
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
var TETO_ALIM = 2800;
function drawPodeGastar(){
  var box=el('podeGastar'); if(!box) return;
  var MA=D.mesAtual;
  if(!MA){ box.innerHTML='<div class="note">Atualize o backend do Apps Script para ver o mes atual.</div>'; return; }
  var alim=(MA.macro&&MA.macro['Alimentação'])||0;
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
    '<div style="background:var(--surface-2);border-radius:10px;padding:12px 14px"><div style="font-size:11.5px;color:var(--ink-2)">Ja gastou em comida</div><div class="serif" style="font-size:21px">'+BRL(alim)+'</div></div>'+
    '<div style="background:var(--surface-2);border-radius:10px;padding:12px 14px"><div style="font-size:11.5px;color:var(--ink-2)">Ainda cabe no mes</div><div class="serif" style="font-size:21px;color:'+(rest>0?'var(--teal)':'var(--coral)')+'">'+BRL(rest)+'</div></div>'+
    '<div style="background:var(--surface-2);border-radius:10px;padding:12px 14px"><div style="font-size:11.5px;color:var(--ink-2)">Por dia ate o fim</div><div class="serif" style="font-size:21px">'+BRL(porDia)+'</div></div>'+
   '</div>'+
   '<div style="height:22px;border-radius:7px;background:var(--surface-2);overflow:hidden;position:relative">'+
     '<div style="width:'+pct+'%;height:100%;background:'+cor+'"></div>'+
     '<div style="position:absolute;left:'+Math.min(esperado/TETO_ALIM*100,100)+'%;top:0;bottom:0;width:2px;background:var(--ink)"></div>'+
   '</div>'+
   '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--ink-2);margin-top:6px"><span>'+BRL(alim)+' de '+BRL(TETO_ALIM)+' ('+pct.toFixed(0)+'%)</span><span>marca preta = ritmo ideal pra hoje</span></div>'+
   '<div class="callout" style="background:var(--surface-2)">'+msg+'<br><span style="font-size:12px;color:var(--ink-2)">No mes: Mercado '+BRL(merc)+' - Restaurante '+BRL(restr)+' - Delivery '+BRL(deli)+' - Gasto total do mes '+BRL(MA.total)+'</span></div>';
}

// ---------- CUSTO DE VIDA ----------
function renderCusto(){
  var CV=D.custoVida;
  if(!CV){ el('cvKpis').innerHTML='<div class="note">Atualize o backend do Apps Script para ver o custo de vida.</div>'; return; }
  el('cvKpis').innerHTML=
   '<div class="kpi wt"><div class="l">Custo fixo</div><div class="v serif">'+BRL(CV.fixo)+'</div><div class="h">todo mes</div></div>'+
   '<div class="kpi wt"><div class="l">Custo variavel</div><div class="v serif">'+BRL(CV.variavel)+'</div><div class="h">media/mes</div></div>'+
   '<div class="kpi des"><div class="l">Parcelas de dividas</div><div class="v serif">'+BRL(CV.parcelas)+'</div><div class="h">enquanto durarem</div></div>'+
   '<div class="kpi sal"><div class="l">Custo de vida previsto</div><div class="v serif">'+BRL(CV.total)+'</div><div class="h">por mes</div></div>';
  var fd=CV.fixoDet||{}, vd=CV.varDet||{};
  el('cvFixo').innerHTML=barsHTML(Object.keys(fd).map(function(k){return [k,fd[k]];}),function(){return '#5f8c7d';},false);
  el('cvVar').innerHTML=barsHTML(Object.keys(vd).map(function(k){return [k,vd[k]];}),function(){return '#e2593f';},false);
  var renda=D.kpi.renda, sobra=renda-CV.total;
  el('cvResumo').innerHTML='<h2>Cabe no orcamento?</h2>'+
   '<div style="height:24px;border-radius:7px;background:var(--surface-2);overflow:hidden;display:flex;margin:10px 0 8px">'+
   '<div style="width:'+(CV.fixo/renda*100)+'%;background:#5f8c7d"></div>'+
   '<div style="width:'+(CV.variavel/renda*100)+'%;background:#e2593f"></div>'+
   '<div style="width:'+(CV.parcelas/renda*100)+'%;background:#8a6f9e"></div></div>'+
   '<div class="legend"><span><i class="dot" style="background:#5f8c7d"></i>Fixo '+BRL(CV.fixo)+'</span><span><i class="dot" style="background:#e2593f"></i>Variavel '+BRL(CV.variavel)+'</span><span><i class="dot" style="background:#8a6f9e"></i>Dividas '+BRL(CV.parcelas)+'</span></div>'+
   '<div class="callout '+(sobra>0?'ok':'')+'">Renda <b>'+BRL(renda)+'</b> menos custo de vida <b>'+BRL(CV.total)+'</b> = <b>'+BRL(sobra)+'</b> por mes '+(sobra>0?'pra investir.':'- atencao, esta no vermelho.')+'</div>';
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
function renderAll(){setupMes();renderVisao();renderCat();renderPessoa();renderMetas();renderIphone();renderProj();renderPatrimonio();renderCusto();renderDividas();}
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
