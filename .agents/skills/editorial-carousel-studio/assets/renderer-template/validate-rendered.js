const fs=require('fs'),path=require('path');
const root=__dirname,ds=JSON.parse(fs.readFileSync(path.join(root,'config/design-system.json')));
const dirs=[path.join(root,'build/svg'),path.join(root,'build/frames')];
const files=dirs.flatMap(d=>fs.existsSync(d)?fs.readdirSync(d).filter(x=>x.endsWith('.svg')).map(x=>path.join(d,x)):[]);
const issues=[],qa=ds.qa,{width,height,safeMargin}=ds.canvas;
const classSize={label:ds.typography.labelSize,title:ds.typography.titleSize,body:ds.typography.bodySize,source:ds.typography.sourceSize,coverTitle:ds.typography.titleSize,coverBody:ds.typography.bodySize};
for(const file of files){
  const raw=fs.readFileSync(file,'utf8'),name=path.basename(file);
  if(/\b(?:textLength|lengthAdjust)=/.test(raw))issues.push(`${name}: compressed SVG text is forbidden; wrap, edit or enlarge the container`);
  for(const m of raw.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)){
    const attrs=m[1],body=m[2],num=k=>{const x=attrs.match(new RegExp(`${k}="(-?[0-9.]+)"`));return x?Number(x[1]):null};
    const x=num('x'),y=num('y'),anchor=(attrs.match(/text-anchor="([^"]+)"/)||[])[1]||'start';
    const cls=(attrs.match(/class="([^"]+)"/)||[])[1]||'';
    const explicit=num('font-size'),size=explicit||Object.entries(classSize).find(([k])=>cls.split(/\s+/).includes(k))?.[1];
    if(size&&size<qa.minimumTextSize)issues.push(`${name}: text smaller than ${qa.minimumTextSize}px`);
    if(y!==null&&(y<qa.topSafe||y>height-qa.bottomSafe))issues.push(`${name}: text baseline outside vertical safe area at y=${y}`);
    if(x!==null&&anchor==='start'&&(x<safeMargin||x>width-safeMargin))issues.push(`${name}: start-aligned text outside horizontal safe area at x=${x}`);
    if(x!==null&&anchor==='end'&&(x>width-safeMargin||x<safeMargin))issues.push(`${name}: end-aligned text outside horizontal safe area at x=${x}`);
    const dys=[...body.matchAll(/dy="([0-9.]+)"/g)].map(z=>Number(z[1]));
    if(y!==null&&y+dys.reduce((a,b)=>a+b,0)>height-qa.bottomSafe)issues.push(`${name}: multiline text extends below safe area`);
    const box=(attrs.match(/data-box="([0-9., -]+)"/)||[])[1];
    if(box&&size){
      const [bx,by,bw,bh]=box.split(',').map(Number),plain=body.replace(/<[^>]+>/g,'').replace(/&[^;]+;/g,'X').trim();
      const lines=Math.max(1,1+[...body.matchAll(/<tspan\b/g)].length),lineHeight=size*1.28,estimatedWidth=plain.length*size*.68/lines;
      if(estimatedWidth>bw*.88)issues.push(`${name}: bounded text exceeds conservative inner width (${Math.round(estimatedWidth)} > ${Math.round(bw*.88)})`);
      if(lines*lineHeight>bh)issues.push(`${name}: bounded text exceeds inner height`);
      if(!Number.isFinite(bx+by+bw+bh)||bw<=0||bh<=0)issues.push(`${name}: invalid data-box metadata`);
    }
  }
}
if(!files.length)issues.push('no rendered SVG files found');
if(issues.length){console.error([...new Set(issues)].join('\n'));process.exit(1)}
console.log(`VALID: ${files.length} rendered SVGs pass text-size and safe-area checks.`);
