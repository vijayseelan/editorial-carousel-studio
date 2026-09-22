const fs=require('fs'),path=require('path');
const root=__dirname;
const ds=JSON.parse(fs.readFileSync(path.join(root,'config/design-system.json')));
const story=JSON.parse(fs.readFileSync(path.resolve(root,process.env.CAROUSEL_STORY||'content/story.json')));
const register=JSON.parse(fs.readFileSync(path.resolve(root,process.env.CLAIM_REGISTER||'content/claim-register.json')));
const issues=[],req=(v,msg)=>{if(!v)issues.push(msg)};
const policy=JSON.parse(fs.readFileSync(path.join(root,'config/validation-policy.json')));
req(policy.preproductionGate==='creator-approval-required','creator approval must remain mandatory');
req(register.gateStatus==='creator-approved','claim register has not passed creator approval');
if(story.production===true) req(register.exampleOnly!==true,'production story cannot use the example claim register');
const claims=new Map((register.claims||[]).map(c=>[c.id,c]));
const permitted=new Set(['verified','qualified','disputed','opinion']);
const rgb=h=>{const x=h.replace('#','');return [0,2,4].map(i=>parseInt(x.slice(i,i+2),16)/255)};
const lum=h=>rgb(h).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const [hi,lo]=[lum(a),lum(b)].sort((x,y)=>y-x);return (hi+.05)/(lo+.05)};
const themeDir=path.join(root,'config/themes');
for(const file of fs.readdirSync(themeDir).filter(x=>x.endsWith('.json'))){
  const c=JSON.parse(fs.readFileSync(path.join(themeDir,file))).colors;
  ['background','surface','surfaceStrong','foreground','muted','source','divider','track','nodeSurface','accent','gold','onAccent','coverOverlay','coverForeground','coverMuted'].forEach(k=>req(/^#[0-9a-f]{6}$/i.test(c[k]||''),`${file}: missing or invalid ${k}`));
  req(contrast(c.foreground,c.background)>=7,`${file}: foreground/background contrast below 7:1`);
  req(contrast(c.muted,c.background)>=4.5,`${file}: muted/background contrast below 4.5:1`);
  req(contrast(c.onAccent,c.accent)>=4.5,`${file}: onAccent/accent contrast below 4.5:1`);
}
req(ds.typography.sourceSize>=ds.qa.minimumSourceSize,'source typography is below the QA minimum');
req(ds.motion.finalHoldSeconds>=ds.qa.minimumFinalHoldSeconds,'animation final hold is too short');
const semantics=new Set(['editorial','chronology','measurement','conceptual','unweighted-factors','argument-map','comparison','process']);
for(const [i,s] of story.slides.entries()){
  const p=`slide ${i+1} (${s.id||'missing-id'})`;
  req(s.id&&s.type&&s.format,`${p}: missing identity/type/format`);
  req(Array.isArray(s.title)&&s.title.length,`${p}: missing title`);
  req(s.title.length<=ds.limits.titleLines+(s.type==='cover'?1:0),`${p}: too many title lines`);
  (s.title||[]).forEach(x=>req(x.length<=ds.limits.titleCharsPerLine,`${p}: title line too long: ${x}`));
  req(Array.isArray(s.body)&&s.body.length<=ds.limits.bodyLines,`${p}: body line count exceeds limit`);
  (s.body||[]).forEach(x=>req(x.length<=ds.limits.bodyCharsPerLine,`${p}: body line too long: ${x}`));
  req(Array.isArray(s.claimIds)&&s.claimIds.length,`${p}: claimIds are required`);
  for(const id of s.claimIds||[]){
    const c=claims.get(id); req(c,`${p}: unknown claim ${id}`);
    if(c){
      req(permitted.has(c.status),`${p}: claim ${id} has blocked status ${c.status}`);
      if(['verified','qualified','disputed'].includes(c.status))req(Array.isArray(c.sources)&&c.sources.length,`${p}: claim ${id} needs a source`);
      if(['qualified','disputed'].includes(c.status))req(c.safeWording||c.safe_wording,`${p}: claim ${id} needs approved safe wording`);
    }
  }
  req(semantics.has(s.visualSemantics),`${p}: visualSemantics is missing or unsupported`);
  if(['conceptual','unweighted-factors','argument-map'].includes(s.visualSemantics))req(s.visualDisclaimer,`${p}: conceptual visual needs a visible disclaimer`);
  req(Array.isArray(s.visualElements)&&s.visualElements.length,`${p}: visualElements are required`);
  req(s.storyboardIntent&&Array.isArray(s.storyboardIntent.requiredStatements)&&Array.isArray(s.storyboardIntent.requiredVisuals),`${p}: storyboardIntent is required`);
  const content=JSON.stringify({...s,storyboardIntent:undefined}).toLowerCase();
  for(const text of s.storyboardIntent?.requiredStatements||[])req(content.includes(String(text).toLowerCase()),`${p}: required statement is absent: ${text}`);
  for(const visual of s.storyboardIntent?.requiredVisuals||[])req(s.visualElements.includes(visual),`${p}: required visual is absent: ${visual}`);
  if(s.type!=='cover')req(s.source,`${p}: source footer is required`);
  if(s.format==='mp4'){
    const motion={...ds.motion,...(s.motion||{})};
    req(motion.finalHoldSeconds>=ds.qa.minimumFinalHoldSeconds,`${p}: final animation hold is too short`);
    req(motion.durationSeconds>motion.introSeconds+motion.finalHoldSeconds,`${p}: animation has no active transition time`);
  }
  if(s.type==='scenarioBars'){
    const sc=s.scenario;
    req(sc&&Array.isArray(sc.series)&&sc.series.length>=2&&sc.series.length<=6,`${p}: scenarioBars needs 2–6 series`);
    req(sc&&Array.isArray(sc.steps)&&sc.steps.length>=2&&sc.steps.length<=5,`${p}: scenarioBars needs 2–5 steps`);
    const ids=(sc?.series||[]).map(x=>x.id);
    for(const [j,step] of (sc?.steps||[]).entries()){
      req(step.label&&Array.isArray(step.bars),`${p}: scenario step ${j+1} needs a label and bars`);
      req(ids.every(id=>step.bars.some(b=>b.id===id)),`${p}: scenario step ${j+1} must include every series`);
      for(const bar of step.bars||[])for(const seg of bar.segments||[]){
        req(Number.isFinite(seg.value)||(Number.isFinite(seg.min)&&Number.isFinite(seg.max)&&seg.max>=seg.min),`${p}: every scenario segment needs a value or valid min/max range`);
        req(['known','estimated','uncertain'].includes(seg.certainty||'known'),`${p}: invalid scenario certainty`);
      }
    }
  }
}
for(const c of register.claims||[])if(c.status==='unresolved'&&c.creatorDecision!=='remove')req(false,`claim ${c.id}: unresolved claim must be removed or revalidated`);
if(issues.length){console.error(issues.join('\n'));process.exit(1)}
console.log(`VALID: evidence gate, ${story.slides.length} slides, ${claims.size} claims, ${fs.readdirSync(themeDir).filter(x=>x.endsWith('.json')).length} themes.`);
