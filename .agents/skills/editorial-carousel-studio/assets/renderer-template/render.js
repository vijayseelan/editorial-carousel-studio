const fs=require('fs'),path=require('path');
const cmp=require('./lib/components');
const root=__dirname;
const base=JSON.parse(fs.readFileSync(path.join(root,'config/design-system.json')));
const themeName=process.env.CAROUSEL_THEME||process.argv[2]||'midnight';
const themePath=path.join(root,'config/themes',`${themeName}.json`);
if(!fs.existsSync(themePath)) throw new Error(`Unknown theme: ${themeName}`);
const theme=JSON.parse(fs.readFileSync(themePath));
const ds={...base,colors:{...base.colors,...theme.colors},theme:{name:themeName,...theme}};
const storyFile=process.env.CAROUSEL_STORY||'content/story.json';
const story=JSON.parse(fs.readFileSync(path.resolve(root,storyFile)));
const ctx=cmp.system(ds), total=story.slides.length;
const svgDir=path.join(root,'build/svg'), frameDir=path.join(root,'build/frames');
fs.mkdirSync(svgDir,{recursive:true}); fs.mkdirSync(frameDir,{recursive:true});
const renderers={cover:cmp.cover,timeline:cmp.timeline,ladder:cmp.ladder,loop:cmp.loop,interventions:cmp.interventions,lawCards:cmp.lawCards,bars:cmp.bars,scenarioBars:cmp.scenarioBars,closing:cmp.closing};
story.slides.forEach((s,i)=>{
  if(!renderers[s.type]) throw new Error(`Unsupported slide type: ${s.type}`);
  if(s.format==='png') fs.writeFileSync(path.join(svgDir,`${s.id}.svg`),renderers[s.type](s,ctx,i,total,root));
  else {
    const motion={...ds.motion,...(s.motion||{})};
    const count=motion.fps*motion.durationSeconds;
    const active=motion.durationSeconds-motion.introSeconds-motion.finalHoldSeconds;
    for(let f=0;f<count;f++){
      const seconds=f/motion.fps;
      const p=Math.max(0,Math.min(1,(seconds-motion.introSeconds)/active));
      fs.writeFileSync(path.join(frameDir,`${s.id}-${String(f).padStart(3,'0')}.svg`),renderers[s.type](s,ctx,i,total,p,root));
    }
  }
});
const renderedFrames=story.slides.filter(s=>s.format==='mp4').reduce((n,s)=>{const m={...ds.motion,...(s.motion||{})};return n+m.fps*m.durationSeconds},0);
console.log(JSON.stringify({story:story.id,theme:themeName,slides:total,animationFrames:renderedFrames},null,2));
