const fs=require('fs'),path=require('path');
const cmp=require('./lib/components');
const root=__dirname;
const base=JSON.parse(fs.readFileSync(path.join(root,'config/design-system.json')));
const story=JSON.parse(fs.readFileSync(path.join(root,'content/story.json')));
const themeDir=path.join(root,'config/themes'),out=path.join(root,'build/theme-samples');
fs.mkdirSync(out,{recursive:true});
const picks=[['01-cover','cover',1],['02-timeline','timeline',.86],['03-factors','interventions',.86],['04-data','bars',.86]];
for(const file of fs.readdirSync(themeDir).filter(x=>x.endsWith('.json')).sort()){
  const name=path.basename(file,'.json'),theme=JSON.parse(fs.readFileSync(path.join(themeDir,file)));
  const ds={...base,colors:{...base.colors,...theme.colors},theme:{name,...theme}},ctx=cmp.system(ds);
  for(const [id,type,p] of picks){
    const index=story.slides.findIndex(s=>s.id===id),slide=story.slides[index];
    const args=type==='cover'?[slide,ctx,index,story.slides.length,root]:['timeline','interventions','bars'].includes(type)?[slide,ctx,index,story.slides.length,p]:[slide,ctx,index,story.slides.length];
    fs.writeFileSync(path.join(out,`${name}-${id}.svg`),cmp[type](...args));
  }
}
console.log(`Rendered ${fs.readdirSync(themeDir).filter(x=>x.endsWith('.json')).length} themes x ${picks.length} samples.`);
