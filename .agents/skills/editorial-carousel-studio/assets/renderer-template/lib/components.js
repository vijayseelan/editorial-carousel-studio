const fs = require('fs');
const path = require('path');

const phosphorPaths = Object.fromEntries(['person-arms-spread','stairs','hands-praying','gender-female'].map(name => {
  const raw=fs.readFileSync(path.join(__dirname,'..','assets','phosphor',`${name}.svg`),'utf8');
  return [name,(raw.match(/<path d="([^"]+)"/)||[])[1]];
}));

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const clamp = n => Math.max(0, Math.min(1, n));
const ease = t => 1 - Math.pow(1 - clamp(t), 3);

function system(ds) {
  const {width:W,height:H,safeMargin:M}=ds.canvas, c=ds.colors, t=ds.typography;
  const style = `.latin{font-family:${t.latin}}.tamil{font-family:${t.tamil}}.label{font:700 ${t.labelSize}px ${t.latin};letter-spacing:3px;fill:${c.accent}}.title{font:700 ${t.titleSize}px ${t.latin};fill:${c.foreground}}.body{font:400 ${t.bodySize}px ${t.latin};fill:${c.muted}}.source{font:400 ${t.sourceSize}px ${t.latin};fill:${c.source}}`;
  const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${c.background}"/><style>${style}</style>${body}</svg>`;
  const lines = (arr,x,y,cls,gap=82) => `<text x="${x}" y="${y}" class="${cls}">${arr.map((s,i)=>`<tspan x="${x}" dy="${i?gap:0}">${esc(s)}</tspan>`).join('')}</text>`;
  const header = s => `<g data-region="header">${lines([s.label],M,82,'label',0)}${lines(s.title,M,178,'title',82)}${lines(s.body,M,178+s.title.length*82+55,'body',43)}</g>`;
  const footer = (s,i,total) => `<g data-region="footer">${s.visualDisclaimer?`<text x="${M}" y="1194" class="latin" font-size="20" font-weight="700" fill="${c.accent}">${esc(s.visualDisclaimer)}</text>`:''}<line x1="${M}" y1="1227" x2="${W-M}" y2="1227" stroke="${c.divider}"/><text x="${M}" y="1267" class="source">${esc(s.source||'Original reconstruction study based on the referenced carousel.')}</text><text x="${M}" y="1310" class="latin" font-size="22" font-weight="700" fill="${c.foreground}">${esc(ds.brand.wordmark)} · ${esc(ds.brand.series)}</text><text x="${W-M}" y="1310" text-anchor="end" class="latin" font-size="22" fill="${c.muted}">${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</text></g>`;
  return {W,H,M,c,t,brand:ds.brand,svg,lines,header,footer,ease,esc};
}

function cover(s,ctx,i,total,root){
  const {W,H,M,c,t,svg,lines}=ctx;
  const art=fs.readFileSync(`${root}/${s.image}`).toString('base64');
  return svg(`<style>.coverTitle{font:700 ${t.titleSize}px ${t.latin};fill:${c.coverForeground}}.coverBody{font:400 ${t.bodySize}px ${t.latin};fill:${c.coverMuted}}</style><image href="data:image/png;base64,${art}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/><defs><linearGradient id="a"><stop stop-color="${c.coverOverlay}" stop-opacity=".98"/><stop offset=".62" stop-color="${c.coverOverlay}" stop-opacity=".70"/><stop offset="1" stop-color="${c.coverOverlay}" stop-opacity=".04"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="${c.coverOverlay}" stop-opacity="0"/><stop offset="1" stop-color="${c.coverOverlay}" stop-opacity=".94"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#a)"/><rect width="${W}" height="${H}" fill="url(#b)"/>${lines([s.label],M,92,'label',0)}${lines(s.title,M,225,'coverTitle',83)}${lines(s.body,M,645,'coverBody',44)}<line x1="${M}" y1="1137" x2="390" y2="1137" stroke="${c.accent}" stroke-width="5"/><text x="${M}" y="1179" class="latin" font-size="20" fill="${c.coverForeground}">${esc(s.disclosure)}</text><text x="${M}" y="1304" class="latin" font-size="22" font-weight="700" fill="${c.coverForeground}">${esc(ctx.brand.wordmark)}</text><text x="${W-M}" y="1304" text-anchor="end" class="latin" font-size="22" fill="${c.coverMuted}">${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</text>`);
}

function timeline(s,ctx,i,total,p){
  const {c,svg,header,footer,ease}=ctx; const line=ease((p-.08)/.30); let marks='';
  s.events.forEach((e,n)=>{const q=ease((p-(.23+n*.17))/.13),y=535+n*225;marks+=`<g opacity="${q}" transform="translate(${(1-q)*35} 0)"><circle cx="215" cy="${y}" r="22" fill="${n===s.events.length-1?c.accent:c.gold}"/><circle cx="215" cy="${y}" r="10" fill="${c.background}"/><text x="72" y="${y+9}" class="latin" font-size="30" font-weight="700" fill="${n===s.events.length-1?c.accent:c.gold}">${e.year}</text><text x="270" y="${y-7}" class="latin" font-size="40" font-weight="700" fill="${c.foreground}">${esc(e.title)}</text><text x="270" y="${y+39}" class="latin" font-size="28" fill="${c.muted}">${esc(e.note)}</text></g>`});
  return svg(`${header(s)}<line x1="215" y1="490" x2="215" y2="${490+560*line}" stroke="${c.accent}" stroke-width="5"/>${marks}${footer(s,i,total)}`);
}

function ladder(s,ctx,i,total){
  const {c,svg,header,footer}=ctx; let diagram=''; const ys=[1130,940,750,560];
  ys.forEach((y,n)=>{const x=255+n*205,g=n===3;diagram+=`<line x1="190" y1="${y}" x2="940" y2="${y}" stroke="${c.track}" stroke-width="18" stroke-linecap="round"/><g transform="translate(${x} ${y-45})">${g?`<circle r="75" cy="-25" fill="${c.gold}" opacity=".18"/>`:''}<circle r="25" cy="-43" fill="${g?c.gold:c.foreground}"/><path d="M-35 47Q-32-12 0-12Q32-12 35 47Z" fill="${g?c.gold:c.foreground}"/></g>`});
  return svg(`${header(s)}${diagram}<path d="M170 1150L950 480" stroke="${c.accent}" stroke-width="4" stroke-dasharray="13 15"/><text x="985" y="1110" text-anchor="end" class="latin" font-size="23" font-weight="700" fill="${c.accent}">INHERITED POSITION</text>${footer(s,i,total)}`);
}

function loop(s,ctx,i,total,p){
  const {c,svg,header,footer,ease}=ctx, cx=540,cy=765,r=255,circ=2*Math.PI*r,ring=ease((p-.08)/.30),strike=ease((p-.60)/.14),action=ease((p-.72)/.13); let nodes='';
  for(let n=0;n<6;n++){const a=-Math.PI/2+n*Math.PI/3,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r,q=ease((p-(.22+n*.055))/.10),hot=n===4;nodes+=`<g opacity="${q}"><circle cx="${x}" cy="${y}" r="47" fill="${hot?c.gold:c.nodeSurface}"/><circle cx="${x}" cy="${y}" r="14" fill="${c.background}"/>${hot?`<g opacity="${strike}"><line x1="${x-72}" y1="${y-72}" x2="${x+72}" y2="${y+72}" stroke="${c.accent}" stroke-width="15" stroke-linecap="round"/><line x1="${x+72}" y1="${y-72}" x2="${x-72}" y2="${y+72}" stroke="${c.accent}" stroke-width="15" stroke-linecap="round"/></g>`:''}</g>`}
  return svg(`${header(s)}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.track}" stroke-width="16" stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-ring)}" transform="rotate(-90 ${cx} ${cy})"/>${nodes}<g opacity="${action}"><rect x="300" y="1090" width="480" height="72" rx="36" fill="${c.accent}"/><text x="540" y="1137" text-anchor="middle" class="latin" font-size="27" font-weight="700" fill="${c.onAccent}">${esc(s.action)}</text></g>${footer(s,i,total)}`);
}

function interventions(s,ctx,i,total,p){
  const {c,svg,header,footer,ease}=ctx,cx=540,cy=835,r=220;
  const icons=['person-arms-spread','stairs','hands-praying','gender-female']; let ring='',labels='';
  for(let n=0;n<4;n++){
    const a=-Math.PI/2+n*Math.PI/2,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r,q=ease((p-(.16+n*.13))/.12),hit=ease((p-(.58+n*.07))/.10);
    const color=n<2?c.gold:c.foreground, scale=.31;
    ring+=`<g opacity="${q}"><line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${c.accent}" stroke-width="5" opacity="${hit*.75}"/><circle cx="${x}" cy="${y}" r="63" fill="${c.surface}" stroke="${c.divider}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="68" fill="none" stroke="${c.accent}" stroke-width="8" opacity="${hit}"/><g transform="translate(${x-128*scale} ${y-128*scale}) scale(${scale})" fill="${color}"><path d="${phosphorPaths[icons[n]]}"/></g></g>`;
    const ly=n===0?y-91:n===2?y+100:y+102;
    labels+=`<text x="${x}" y="${ly}" text-anchor="middle" class="latin" font-size="22" font-weight="700" fill="${color}" opacity="${q}">${esc(s.items[n])}</text>`;
  }
  return svg(`${header(s)}<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.track}" stroke-width="15"/>${ring}${labels}<circle cx="${cx}" cy="${cy}" r="73" fill="${c.background}" stroke="${c.accent}" stroke-width="5"/><text x="540" y="845" text-anchor="middle" class="latin" font-size="28" font-weight="700" fill="${c.foreground}">DIGNITY</text>${footer(s,i,total)}`);
}

function lawCards(s,ctx,i,total,p){
  const {c,svg,header,footer,ease}=ctx; let cards='';
  s.laws.forEach((x,n)=>{const q=ease((p-(.12+n*.20))/.17),y=495+n*205;cards+=`<g opacity="${q}" transform="translate(${(1-q)*55} 0)"><rect x="72" y="${y}" width="390" height="150" rx="18" fill="${c.surface}"/><text x="98" y="${y+43}" class="latin" font-size="20" font-weight="700" fill="${c.muted}">ADVOCACY</text><text x="98" y="${y+91}" class="latin" font-size="28" font-weight="700" fill="${c.foreground}">${esc(x.demand)}</text><path d="M478 ${y+75}H540" stroke="${c.accent}" stroke-width="6"/><path d="M528 ${y+60}L548 ${y+75}L528 ${y+90}" fill="none" stroke="${c.accent}" stroke-width="6"/><rect x="564" y="${y}" width="444" height="150" rx="18" fill="${n===0?c.accent:c.surfaceStrong}"/><text x="590" y="${y+40}" class="latin" font-size="20" font-weight="700" fill="${n===0?c.onAccent:c.gold}">LATER LAW / POLICY</text><text x="590" y="${y+78}" class="latin" font-size="26" font-weight="700" fill="${n===0?c.onAccent:c.foreground}">${esc(x.law)}</text><text x="590" y="${y+112}" class="latin" font-size="20" fill="${n===0?c.onAccent:c.muted}">${esc(x.note.length>54?x.note.slice(0,53)+'…':x.note)}</text></g>`});
  return svg(`${header(s)}${cards}${footer(s,i,total)}`);
}

function bars(s,ctx,i,total,p){
  const {c,svg,header,footer,ease}=ctx; let b='';
  s.bars.forEach((x,n)=>{const q=ease((p-(.20+n*.20))/.28),y=600+n*220,w=790*x.value/100;b+=`<text x="72" y="${y}" class="latin" font-size="28" font-weight="700" fill="${c.foreground}">${esc(x.label)}</text><rect x="72" y="${y+35}" width="790" height="72" rx="18" fill="${c.track}"/><rect x="72" y="${y+35}" width="${w*q}" height="72" rx="18" fill="${n?c.accent:c.gold}"/><text x="890" y="${y+92}" class="latin" font-size="52" font-weight="700" fill="${n?c.accent:c.gold}">${(x.value*q).toFixed(1)}%</text>`});
  return svg(`${header(s)}${b}<text x="72" y="1090" class="latin" font-size="24" fill="${c.muted}">${esc(s.measurementNote||'State the population, time period and measurement definition.')}</text>${footer(s,i,total)}`);
}

function scenarioBars(s,ctx,i,total,p){
  const {c,svg,header,footer,ease,esc}=ctx,steps=s.scenario.steps,series=s.scenario.series;
  const stage=Math.min(steps.length-1,Math.floor(clamp(p)*steps.length));
  const phase=clamp(p)*steps.length-stage,blend=ease((phase-.12)/.58);
  const current=steps[stage],previous=stage?steps[stage-1]:{bars:series.map(x=>({id:x.id,segments:[]}))};
  const byId=(step,id)=>step.bars.find(x=>x.id===id)||{id,segments:[]};
  const segment=(bar,id)=>bar.segments.find(x=>x.id===id)||{value:0};
  const mid=x=>Number.isFinite(x.value)?x.value:(Number(x.min||0)+Number(x.max||0))/2;
  const interp=(a,b)=>a+(b-a)*blend;
  const totals=series.map(x=>byId(current,x.id).segments.reduce((n,z)=>n+mid(z),0));
  const maxValue=s.scenario.maxValue||Math.max(...steps.flatMap(st=>st.bars.map(b=>b.segments.reduce((n,z)=>n+(Number.isFinite(z.value)?z.value:Number(z.max||0)),0))))*1.08;
  const plot={top:545,bottom:1055,height:510},barW=Math.min(150,700/series.length),gap=(840-series.length*barW)/(series.length+1);
  let defs='<defs><pattern id="uncertain" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="'+c.surface+'"/><line x1="0" y1="0" x2="0" y2="12" stroke="'+c.accent+'" stroke-width="5" opacity=".55"/></pattern></defs>',barsSvg='';
  series.forEach((meta,n)=>{
    const prev=byId(previous,meta.id),cur=byId(current,meta.id),ids=[...new Set([...prev.segments.map(x=>x.id),...cur.segments.map(x=>x.id)])];
    const x=72+gap+(barW+gap)*n; let stacked=0;
    for(const id of ids){
      const a=segment(prev,id),b=segment(cur,id),value=interp(mid(a),mid(b)),h=plot.height*value/maxValue,y=plot.bottom-stacked-h;
      const role=b.colorRole||a.colorRole||meta.colorRole||'accent',fill=(b.certainty||a.certainty)==='uncertain'?'url(#uncertain)':(c[role]||b.color||a.color||c.accent);
      barsSvg+=`<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(0,h)}" rx="10" fill="${fill}" opacity="${(b.certainty||a.certainty)==='estimated'?'.65':'1'}"/><line x1="${x}" y1="${y}" x2="${x+barW}" y2="${y}" stroke="${c.background}" stroke-width="4"/>`;
      if(b.range){const minY=plot.bottom-stacked-plot.height*Number(b.min||0)/maxValue,maxY=plot.bottom-stacked-plot.height*Number(b.max||0)/maxValue;barsSvg+=`<line x1="${x+barW/2}" y1="${maxY}" x2="${x+barW/2}" y2="${minY}" stroke="${c.foreground}" stroke-width="5"/><line x1="${x+barW*.3}" y1="${maxY}" x2="${x+barW*.7}" y2="${maxY}" stroke="${c.foreground}" stroke-width="5"/><line x1="${x+barW*.3}" y1="${minY}" x2="${x+barW*.7}" y2="${minY}" stroke="${c.foreground}" stroke-width="5"/>`}
      stacked+=h;
    }
    const prevTotal=prev.segments.reduce((z,q)=>z+mid(q),0),totalValue=interp(prevTotal,totals[n]);
    const maxTotal=cur.segments.reduce((z,q)=>z+(Number.isFinite(q.value)?q.value:Number(q.max||0)),0),top=plot.bottom-plot.height*interp(prevTotal,maxTotal)/maxValue;
    const valueLabel=(cur.totalLabel||Math.round(totalValue).toLocaleString('en-US'));
    barsSvg+=`<text x="${x+barW/2}" y="${Math.max(plot.top-15,top-18)}" text-anchor="middle" class="latin" font-size="30" font-weight="700" fill="${c.foreground}">${esc(valueLabel)}</text><text x="${x+barW/2}" y="1100" text-anchor="middle" class="latin" font-size="22" font-weight="700" fill="${c.foreground}">${esc(meta.label)}</text>`;
  });
  const callout=current.callout?`<rect x="72" y="1118" width="936" height="58" rx="18" fill="${c.surface}"/><text x="92" y="1156" class="latin" font-size="22" font-weight="700" fill="${c.foreground}">${esc(current.callout)}</text>`:'';
  return svg(`${defs}${header(s)}<text x="72" y="470" class="latin" font-size="22" font-weight="700" fill="${c.accent}">STEP ${stage+1} OF ${steps.length} · ${esc(current.label)}</text><text x="72" y="510" class="latin" font-size="24" fill="${c.muted}">${esc(current.note||'')}</text>${barsSvg}${callout}${footer(s,i,total)}`);
}

function closing(s,ctx,i,total){
  const {c,svg,header,footer}=ctx; let rungs=''; [580,760,940,1120].forEach(y=>rungs+=`<line x1="220" y1="${y}" x2="860" y2="${y}" stroke="${c.track}" stroke-width="18" stroke-linecap="round"/>`);
  return svg(`${header(s)}${rungs}<circle cx="335" cy="1075" r="28" fill="${c.accent}"/><path d="M295 1170Q300 1110 335 1110Q370 1110 375 1170Z" fill="${c.accent}"/><text x="410" y="1110" class="latin" font-size="27" font-weight="700" fill="${c.accent}">YOU</text><path d="M820 575L300 1110" stroke="${c.gold}" stroke-width="4" stroke-dasharray="15 15"/>${footer(s,i,total)}`);
}

module.exports={system,cover,timeline,ladder,loop,interventions,lawCards,bars,scenarioBars,closing};
