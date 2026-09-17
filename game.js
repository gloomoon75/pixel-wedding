const $=s=>document.querySelector(s), modal=$('#customize'),talk=$('#conversation');
let looks=[{name:"",height:0,hair:0,eyeShape:0,skinTone:1,hairColor:'#754d36',eyeColor:'#795137',outfit:0},{name:"",height:1,hair:2,eyeShape:0,skinTone:1,hairColor:'#27252d',eyeColor:'#459675',outfit:1}],party=1,editing=0,active=0,playing=false,room='garden',positions=[{x:50,y:86},{x:44,y:90}],target=null,near=null,last=0,ceremonyStart=null;const held=new Set();
function atlasPart(x,y,w,h,left,top,width,height,filter='',cls=''){return `<div class="avatar-layer ${cls}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%;background-size:${1182/w*100}% ${1330/h*100}%;background-position:${x/(1182-w)*100}% ${y/(1330-h)*100}%;filter:${filter||'none'}"></div>`}
const colorAtlas=new Image(),extraAtlas=new Image(),twinAtlas=new Image(),partedAtlas=new Image(),faceAtlas=new Image(),childrenAtlas=new Image(),undercutAtlas=new Image(),tintedCache=new Map();let atlasReady=false,baseReady=false,extrasReady=false,twinsReady=false,partedReady=false,faceReady=false,childrenReady=false,undercutReady=false;
const hairOffsets=[-26,-48,-38,-34,-60,-28,-24,-40,-30,-24,-23];
const skinTones=[['瓷白','#ffe1c6'],['白皙','#f6c5a2'],['自然','#deb08b'],['小麥','#be895f'],['棕褐','#956443'],['深棕','#63412e']];

// Source regions are aligned to the existing 290 x 330 hair layer.
const extraHairRects=[[0,60,530,660],[535,60,500,440],[1060,100,490,410]];
const extraHairDest=[[26,0,238.5,297],[55,0,180,158.4],[55.7,0,178.6,149.45]];
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))}
function tintPixel(pixel,color){const light=(pixel[0]+pixel[1]+pixel[2])/3;return color.map(c=>Math.round(light<=140?c*light/140:c+(255-c)*(light-140)/115))}
const faceRegions=[{rect:[64,342,656,370],irises:[[222,533],[559,533]],radius:[53,51],noseX:391},{rect:[811,342,672,370],irises:[[970,529],[1322,529]],radius:[51,46],noseX:1147}];
function coloredFace(variant,hex,tone=1){
 const key='face:'+variant+':'+hex+':'+tone;if(tintedCache.has(key))return tintedCache.get(key).url;
 const spec=faceRegions[variant], [sx,sy,w,h]=spec.rect,source=document.createElement('canvas');source.width=w;source.height=h;
 const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(faceAtlas,sx,sy,w,h,0,0,w,h);
 const pixels=sc.getImageData(0,0,w,h),data=pixels.data,color=rgb(hex),skin=rgb(skinTones[tone][1]);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;if(data[i+3]<64){data[i+3]=0;continue}
  const px=x+sx,py=y+sy,light=(data[i]+data[i+1]+data[i+2])/3;
  const iris=spec.irises.some(([cx,cy])=>((px-cx)/spec.radius[0])**2+((py-cy)/spec.radius[1])**2<=1);
  if(iris&&light>=32&&light<180){const out=tintPixel([data[i],data[i+1],data[i+2]],color);data[i]=out[0];data[i+1]=out[1];data[i+2]=out[2]}
  if(Math.abs(px-spec.noseX)<9&&py>=596&&py<=628&&tone!==1){const shade=light/205;for(let k=0;k<3;k++)data[i+k]=Math.min(255,Math.round(skin[k]*shade))}
 }
 sc.putImageData(pixels,0,0);
 // Move only round-eye brows downward, keeping the eyes and other features fixed.
 if(variant===0){const brows=sc.getImageData(0,0,w,84);sc.clearRect(0,0,w,84);sc.putImageData(brows,0,12)}
 const canvas=document.createElement('canvas');canvas.width=170;canvas.height=110;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;const sxScale=170/w,syScale=110/h;
 for(const [index,cropX] of [0,w/2].entries()){
  const centerX=(spec.irises[index][0]-sx)*sxScale,centerY=(spec.irises[index][1]-sy)*syScale;
  ctx.save();ctx.translate(centerX+(index===0?6:-6),centerY+6);ctx.scale(.84,.84);ctx.drawImage(source,cropX,0,w/2,252,cropX*sxScale-centerX,-centerY,85,252*syScale);ctx.restore();
 }
 ctx.drawImage(source,0,252,w,h-252,0,252*syScale,170,(h-252)*syScale);const url=canvas.toDataURL();if(tintedCache.size>128)tintedCache.clear();tintedCache.set(key,{url,canvas});return url;
}
function coloredPart(kind,variant,hex,tone=1){
 if(kind==='eyes')return coloredFace(variant,hex,tone);
 const key='hair:'+variant+':'+hex;if(tintedCache.has(key))return tintedCache.get(key).url;
 const w=290,h=330,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(variant===0){ctx.drawImage(undercutAtlas,264,320,540,621,43,0,151.7,174.5);ctx.drawImage(undercutAtlas,804,320,186,450,194.7,0,44,126.4)}
 else if(variant>=9){if(variant===9)ctx.drawImage(partedAtlas,101,115,601,478,48.7,0,192.6,153.2);else ctx.drawImage(partedAtlas,858,124,596,822,40.6,0,208.8,288)}
 else if(variant>=7){if(variant===7){ctx.drawImage(twinAtlas,110,65,540,430,26.2,0,237.6,189.2);ctx.drawImage(twinAtlas,110,495,540,490,26.2,189.2,237.6,140.8)}else{ctx.drawImage(twinAtlas,750,65,760,440,0,0,290,167.9);ctx.drawImage(twinAtlas,750,505,760,480,0,167.9,290,162.1)}}
 else if(variant>=4){if(variant===4){ctx.drawImage(extraAtlas,0,60,530,520,35.2,10,219.4,215.3);ctx.drawImage(extraAtlas,0,580,530,130,35.2,225.3,219.4,88.3)}else ctx.drawImage(extraAtlas,...extraHairRects[variant-4],...extraHairDest[variant-4])}
 else ctx.drawImage(colorAtlas,[155,448,736,1025][variant]-145,535,w,h,0,0,w,h);
 const pixels=ctx.getImageData(0,0,w,h),color=rgb(hex),data=pixels.data;for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;if(variant===0||variant>=9){if(data[i+3]<128){data[i+3]=0;continue}data[i+3]=255}const light=(data[i]+data[i+1]+data[i+2])/3;if(light<32)continue;const out=tintPixel([data[i],data[i+1],data[i+2]],color);data[i]=out[0];data[i+1]=out[1];data[i+2]=out[2]}
 ctx.putImageData(pixels,0,0);const url=canvas.toDataURL();if(tintedCache.size>128)tintedCache.clear();tintedCache.set(key,{url,canvas});return url;
}
function isSkinPixel(r,g,b,x,y,outfit){
 const dress=outfit===1||outfit===3;
 const edge=115-Math.max(0,y-230)*.55;
 const region=y<176||(y<203&&x>104&&x<188)||(dress?((y>=176&&y<300&&(x<edge||x>290-edge))||(y>335&&((x>105&&x<140)||(x>150&&x<187)))):((y>265&&y<315)&&(x<87||x>210)));
 return region&&r>45&&r>g+7&&g>b+5&&(r-g)>.55*(g-b)
}
function coloredBody(outfit,tone=1){const key='body'+outfit+':'+tone;if(tintedCache.has(key))return tintedCache.get(key).url;const canvas=document.createElement('canvas');canvas.width=290;canvas.height=445;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(colorAtlas,[155,448,736,1025][outfit]-145,60,290,445,0,0,290,445);const patch=ctx.getImageData(126,130,38,3);for(let y=134;y<153;y++)ctx.putImageData(patch,126,y);if(tone!==1){const pixels=ctx.getImageData(0,0,290,445),p=pixels.data,targetColor=rgb(skinTones[tone][1]);for(let y=0;y<445;y++)for(let x=0;x<290;x++){const i=(y*290+x)*4;if(!p[i+3]||!isSkinPixel(p[i],p[i+1],p[i+2],x,y,outfit)||((outfit===0||outfit===2)&&x>115&&x<180&&y>185&&y<295))continue;const shade=(p[i]+p[i+1]+p[i+2])/3/205;for(let k=0;k<3;k++)p[i+k]=Math.min(255,Math.round(targetColor[k]*shade))}ctx.putImageData(pixels,0,0)}const url=canvas.toDataURL();tintedCache.set(key,{url,canvas});return url}
function colorLayer(url,left,top,width,height,cls){return `<div class="avatar-layer ${cls}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%;background-image:url('${url}');background-size:100% 100%"></div>`}
const guestSprites=new Map();
function guestHeight(look,groomHeight,brideHeight){return look.height===1?brideHeight*.94:groomHeight}
function guestSprite(look){
 const key=[look.hair,look.outfit,look.eyeShape||0,look.skinTone??1,look.hairColor,look.eyeColor].join(':');if(guestSprites.has(key))return guestSprites.get(key);
 coloredBody(look.outfit,look.skinTone??1);let body=tintedCache.get('body'+look.outfit+':'+(look.skinTone??1)).canvas;
 coloredPart('hair',look.hair,look.hairColor);const hair=tintedCache.get('hair:'+look.hair+':'+look.hairColor).canvas;
 coloredFace(look.eyeShape||0,look.eyeColor,look.skinTone??1);const face=tintedCache.get('face:'+(look.eyeShape||0)+':'+look.eyeColor+':'+(look.skinTone??1)).canvas;
 const full=document.createElement('canvas');full.width=290;full.height=535;const ctx=full.getContext('2d',{willReadFrequently:true});ctx.drawImage(body,0,90);ctx.drawImage(face,74,150,142,92);ctx.drawImage(hair,0,90+hairOffsets[look.hair]);
 const pixels=ctx.getImageData(0,0,290,535).data;let left=290,top=535,right=0,bottom=0;
 for(let y=0;y<535;y++)for(let x=0;x<290;x++)if(pixels[(y*290+x)*4+3]>=64){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1)}
 const canvas=document.createElement('canvas');canvas.width=right-left;canvas.height=bottom-top;canvas.getContext('2d').drawImage(full,left,top,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
 const result={canvas,url:canvas.toDataURL(),width:canvas.width,height:canvas.height};if(guestSprites.size>64)guestSprites.clear();guestSprites.set(key,result);return result;
}
function avatar(el,look){
 if(!atlasReady){el.innerHTML=atlasPart([155,448,736,1025][look.outfit]-145,60,290,445,0,0,100,100);return}
 const sprite=guestSprite(look),mapHeight=guestHeight(look,85*1192/1254,85*466/512),height=mapHeight*(el.id==='previewAvatar'?1.45:1),width=height*sprite.width/sprite.height;
 el.style.height=height+'px';el.style.width=width+'px';el.replaceChildren();const img=document.createElement('img');img.src=sprite.url;img.alt='';img.className='guest-sprite';el.append(img);
 if(el.id!=='previewAvatar'){el.parentElement.style.height=(mapHeight+14)+'px';el.parentElement.style.width=Math.max(width,64)+'px'}
}
function finishAtlasLoad(){atlasReady=baseReady&&extrasReady&&twinsReady&&partedReady&&faceReady&&childrenReady&&undercutReady;$('#start').disabled=!atlasReady;$('#hair').disabled=!atlasReady;$('#eyeShape').disabled=!atlasReady;appearance()}colorAtlas.onload=()=>{baseReady=true;finishAtlasLoad()};extraAtlas.onload=()=>{extrasReady=true;finishAtlasLoad()};twinAtlas.onload=()=>{twinsReady=true;finishAtlasLoad()};partedAtlas.onload=()=>{partedReady=true;finishAtlasLoad()};faceAtlas.onload=()=>{faceReady=true;finishAtlasLoad()};childrenAtlas.onload=()=>{childrenReady=true;finishAtlasLoad()};undercutAtlas.onload=()=>{undercutReady=true;finishAtlasLoad()};colorAtlas.onerror=extraAtlas.onerror=twinAtlas.onerror=partedAtlas.onerror=faceAtlas.onerror=childrenAtlas.onerror=undercutAtlas.onerror=()=>notify('造型素材未能載入，請重新整理頁面再試一次。');colorAtlas.src='customization.png';extraAtlas.src='extra-styles.png';twinAtlas.src='twin-hair.png';partedAtlas.src='parted-hair.png';faceAtlas.src='guest-faces.png';childrenAtlas.src='flower-children-chibi.png';undercutAtlas.src='undercut-hair.png';

function guestName(i){return looks[i].name?.trim()||(i===0?"你":"同行夥伴")}
function appearance(){avatar($('#previewAvatar'),looks[editing]);avatar($('#playerAvatar'),looks[0]);avatar($('#companionAvatar'),looks[1]);$('#guestName').value=looks[editing].name||'';document.querySelectorAll('[data-height]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.height===(looks[editing].height||0)));$('#hair').value=looks[editing].hair;$('#eyeShape').value=looks[editing].eyeShape||0;$('#outfit').value=looks[editing].outfit;document.querySelectorAll('[data-skin]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.skin===(looks[editing].skinTone??1)));document.querySelectorAll('[data-edit]').forEach(b=>b.classList.toggle('active',+b.dataset.edit===editing));for(const key of ['hairColor','eyeColor']){$('#'+key).value=looks[editing][key];$('#'+key+'Hex').value=looks[editing][key]}$('#lookTitle').textContent=party===2?(editing===0?'挑選你的婚禮造型':'挑選夥伴的婚禮造型'):'挑選你的婚禮造型'}
$('#guestName').addEventListener('input',e=>{looks[editing].name=Array.from(e.target.value).slice(0,16).join('');render()});
document.querySelectorAll('[data-height]').forEach(b=>b.onclick=()=>{looks[editing].height=+b.dataset.height;appearance()});
skinTones.forEach(([name,color],i)=>{const b=document.createElement('button');b.type='button';b.className='skin-option';b.dataset.skin=i;b.setAttribute('aria-label',name);b.innerHTML=`<span style="background:${color}"></span>${name}`;b.onclick=()=>{looks[editing].skinTone=i;appearance()};$('#skinOptions').append(b)});
for(const key of ['hairColor','eyeColor']){const picker=$('#'+key),hex=$('#'+key+'Hex');picker.addEventListener('input',e=>{looks[editing][key]=e.target.value;appearance()});hex.addEventListener('input',e=>{if(/^#[0-9a-f]{6}$/i.test(e.target.value)){looks[editing][key]=e.target.value.toLowerCase();appearance()}});hex.addEventListener('change',()=>{hex.value=looks[editing][key]})}
for(const key of ['hair','outfit','eyeShape'])$('#'+key).onchange=e=>{looks[editing][key]=+e.target.value;appearance()};
document.querySelectorAll('[data-party]').forEach(b=>b.onclick=()=>{party=+b.dataset.party;editing=0;active=0;$('#partyStep').hidden=true;$('#lookStep').hidden=false;$('#editTabs').hidden=party!==2;$('#companion').hidden=party!==2;$('#switchPlayer').hidden=party!==2;appearance();render()});
document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{editing=+b.dataset.edit;appearance()});$('#back').onclick=()=>{$('#partyStep').hidden=false;$('#lookStep').hidden=true};
modal.addEventListener('cancel',e=>{if(!playing)e.preventDefault()});$('#closet').onclick=()=>{if(ceremonyStart!==null)return;held.clear();target=null;$('#partyStep').hidden=true;$('#lookStep').hidden=false;$('#editTabs').hidden=party!==2;$('#start').textContent='換好造型，回到婚禮 →';appearance();modal.showModal()};
let audioCtx,musicGain,musicOn=false,musicTimer;const musicSources=new Set();
// A short original synthesized arrangement of the public-domain Bridal Chorus.
const melody=[['G4',1],['C5',1.5],['C5',.5],['C5',2],['G4',1],['D5',1.5],['B4',.5],['C5',2],['G4',1],['C5',1.5],['F5',.5],['F5',1],['E5',1],['D5',1],['C5',1],['D5',2],['G4',1],['C5',1.5],['C5',.5],['C5',2],['G4',1],['D5',1.5],['B4',.5],['C5',2],['G4',1],['C5',1],['E5',1],['G5',1],['E5',1],['C5',1],['A4',1],['B4',1],['C5',3]];
function frequency(note){const m=note.match(/([A-G])([0-9])/),semitones={C:-9,D:-7,E:-5,F:-4,G:-2,A:0,B:2};return 440*2**((semitones[m[1]]+(+m[2]-4)*12)/12)}
function tone(f,t,d,volume){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(musicGain);musicSources.add(o);o.onended=()=>musicSources.delete(o);o.start(t);o.stop(t+d+.03)}
function musicPhrase(){if(!musicOn)return;let t=audioCtx.currentTime+.1;melody.forEach(([n,b],i)=>{const d=b*.44;tone(frequency(n),t,d*.95,.16);if(i%3===0){tone(frequency('C4')/2,t,d,.055);tone(frequency('E4'),t,d,.025)}t+=d});musicTimer=setTimeout(musicPhrase,(t-audioCtx.currentTime)*1000+900)}
async function startMusic(){try{if(!audioCtx){audioCtx=new(window.AudioContext||window.webkitAudioContext)();musicGain=audioCtx.createGain();musicGain.connect(audioCtx.destination)}await audioCtx.resume();if(!musicOn){musicOn=true;musicGain.gain.value=.65;musicPhrase()}$('#sound').textContent='♫';$('#sound').setAttribute('aria-label','關閉音樂');$('#sound').setAttribute('aria-pressed','true')}catch{notify('點上方音符可再試一次播放音樂')}}
$('#sound').onclick=()=>{if(musicOn){musicOn=false;clearTimeout(musicTimer);musicSources.forEach(o=>{try{o.stop()}catch{}});musicSources.clear();musicGain.gain.value=0;$('#sound').textContent='♪';$('#sound').setAttribute('aria-label','開啟音樂');$('#sound').setAttribute('aria-pressed','false')}else startMusic()};
$('#start').onclick=()=>{modal.close();appearance();if(!playing){playing=true;startMusic();beginCeremony()}else render()};
let lastPetalBurst=-1;
function syncChildren(){
 for(const [id,x] of [['saviri',37],['diana',63]]){
  const el=$('#'+id);el.hidden=room!=='hall';el.style.left=x+'%';el.style.top='37%';el.classList.toggle('playing-child',room==='hall');el.classList.remove('flower-walk');
 }
}
function clearPetals(){$('#petalLayer').replaceChildren();lastPetalBurst=-1}
function scatterPetals(x,y,amount=4){
 for(let i=0;i<amount;i++){
  const p=document.createElement('span');p.className='flower-petal';p.textContent='✿';p.style.left=(x+(i-amount/2)*1.4)+'%';p.style.top=(y-7)+'%';p.style.setProperty('--drift',((i%2?-1:1)*(18+i*8))+'px');p.style.setProperty('--spin',(i%2?180:-160)+'deg');p.style.color=i%2?'#f9fdff':'#a7cff3';$('#petalLayer').append(p);p.addEventListener('animationend',()=>p.remove(),{once:true});
 }
}
function beginCeremony(){switchRoom('garden');positions=[{x:50,y:86},{x:44,y:90}];ceremonyStart=performance.now();held.clear();target=null;clearPetals();$('.app').classList.add('in-ceremony');$('#ceremony').hidden=false;$('#bear').hidden=true;$('#player').hidden=true;$('#companion').hidden=true;$('#groom').style.left='45%';$('#bride').style.left='55%';$('#bride').style.top='94%';$('#ceremonyText').textContent='狄安娜與薩維里，撒下幸福的花瓣';for(const [id,x] of [['saviri',44],['diana',56]]){const el=$('#'+id);el.hidden=false;el.style.left=x+'%';el.style.top='83%';el.classList.remove('playing-child');el.classList.add('flower-walk')}}
function finishCeremony(){$('#leaveWedding').disabled=false;ceremonyStart=null;$('.app').classList.remove('in-ceremony');$('#ceremony').hidden=true;$('#ceremony').classList.remove('kiss-mode');$('#kiss').hidden=true;$('#hearts').hidden=true;$('#groom').hidden=false;$('#bride').hidden=false;$('#bear').hidden=false;$('#player').hidden=false;$('#companion').hidden=party!==2;$('#bride').classList.remove('walking');$('#bride').style.left='57%';$('#bride').style.top='24%';$('#groom').style.left='45%';clearPetals();syncChildren();$('#state').textContent='禮成，小花童已到宴會廳玩耍';render();if(new URLSearchParams(location.search).has('board'))openStickerBoard()}
$('#skip').onclick=finishCeremony;
function ceremonyFrame(t){
 const elapsed=(t-ceremonyStart)/1000;
 if(elapsed<12){
  const y=83-Math.min(elapsed/12,1)*55;
  $('#saviri').style.top=y+'%';$('#diana').style.top=(y+Math.sin(elapsed*3)*1.2)+'%';$('#diana').style.left=(56+Math.sin(elapsed*2)*1.5)+'%';
  const burst=Math.floor(elapsed*2);if(burst!==lastPetalBurst){lastPetalBurst=burst;scatterPetals(44,y,3);scatterPetals(56,y,5)}
  if(elapsed>=4){$('#ceremonyText').textContent='請迎接新娘';$('#bride').classList.add('walking');$('#bride').style.top=(94-(elapsed-4)/8*70)+'%'}
 }else if(elapsed<14){$('#bride').style.top='24%';$('#ceremonyText').textContent='從今天起，與你相伴';$('#bride').classList.remove('walking');$('#bride').style.left=(55-(elapsed-12)*3)+'%';$('#groom').style.left=(45+(elapsed-12)*1.5)+'%';$('#saviri').style.left='34%';$('#diana').style.left='66%';for(const id of ['saviri','diana'])$('#'+id).classList.remove('flower-walk')}
 else if(elapsed<22){$('#ceremony').classList.add('kiss-mode');$('#ceremonyText').textContent='以一個吻，許下永遠';for(const id of ['bride','groom','saviri','diana'])$('#'+id).hidden=true;clearPetals();$('#kiss').hidden=false;$('#hearts').hidden=false}else finishCeremony();
}
const places={garden:[{x:22,y:63,r:12,name:'貼紙祝福板',board:true},{x:45,y:29,r:12,name:'伊薩克',art:'special mature',text:'歡迎。',action:'送上新婚祝福 ♡'},{x:57,y:29,r:12,name:'白暝',art:'sprite s1',text:'歡迎來到我們的婚禮～',action:'送上新婚祝福 ♡'},{x:22,y:40,r:13,name:'鮑里斯',art:'special boris',text:'「嗚！」四肢著地的鮑里斯抬起頭，輕輕嗅了嗅空氣，脖子上的藍色蝴蝶結也跟著晃了晃。',action:'向鮑里斯打招呼 ♡'},{x:22,y:72,r:15,name:'花園蛋糕',text:'小巧的藍白奶油花，藏著甜甜的心意。宴會廳裡還有大婚禮蛋糕等著你！',action:'品嚐一小口 ♡'}],hall:[{x:37,y:37,r:11,name:'薩維里',child:'saviri',art:'child-portrait',text:'薩維里把小花籃抱在懷裡，輕輕點頭。「這朵……給你。」他安安靜靜地挑了一朵小白花。',action:'收下小白花，陪他坐一會兒 ♡'},{x:63,y:37,r:11,name:'狄安娜',child:'diana',art:'child-portrait',text:'「你看、你看！花花飛起來了！」狄安娜晃著藍色蝴蝶結，開心地把花瓣分給你。「一起玩嘛～」',action:'和狄安娜一起玩撒花 ♡'},{x:50,y:49,r:17,name:'大結婚蛋糕',text:'層層白色奶油綴著藍色花朵，這座大蛋糕是今天最甜蜜的主角。一起分享伊薩克與白暝的幸福吧。',action:'享用婚禮蛋糕 ♡'},{x:19,y:33,r:12,name:'花好月圓（炸湯圓）',text:'粉紅與金黃的小湯圓炸得外酥內軟，撒上香甜花生粉。花好月圓，祝新人團團圓圓、甜甜蜜蜜！',action:'品嚐花好月圓 ♡'},{x:83,y:34,r:13,name:'婚宴佳餚',text:'香烤雞肉、鮮蝦與熱騰騰的料理已經上桌，為今天的相聚添上豐盛的滋味。',action:'享用美食 ♡'},{x:83,y:55,r:14,name:'水果與甜點',text:'繽紛水果、精緻小蛋糕與甜點擺滿了餐桌，挑一份喜歡的，慢慢享用吧。',action:'拿一份甜點 ♡'}]};
function switchRoom(next){room=next;held.clear();target=null;$('#map').src=room==='garden'?'garden.png':'banquet.png';$('#map').alt=room==='garden'?'藍白花園婚禮':'室內宴會廳，中央大結婚蛋糕與兩側美食餐桌';$('#roomName').textContent=room==='garden'?'藍色花園':'室內宴會廳';for(const id of ['groom','bride','bear','blessingBoard'])$('#'+id).hidden=room!=='garden';syncChildren();$('#portal').textContent=room==='garden'?'宴會廳 →':'← 主會場';$('#portal').classList.toggle('return',room==='hall');if(playing){positions=room==='hall'?[{x:16,y:55},{x:18,y:62}]:[{x:84,y:54},{x:79,y:59}]}render()}
$('#portal').onclick=e=>{e.stopPropagation();if(ceremonyStart===null)switchRoom(room==='garden'?'hall':'garden')};$('#portal').onpointerdown=e=>e.stopPropagation();
$('#switchPlayer').onclick=()=>{active=1-active;target=null;held.clear();$('#switchPlayer').textContent='交換主控 · '+guestName(active)+' ↔';render()};
function render(){$('#switchPlayer').textContent='交換主控 · '+guestName(active)+' ↔';['player','companion'].forEach((id,i)=>{const p=$('#'+id);p.style.left=positions[i].x+'%';p.style.top=positions[i].y+'%';p.querySelector('span').textContent=guestName(i);let pointer=p.querySelector('.pointer');if(pointer)pointer.remove();if(active===i){pointer=document.createElement('div');pointer.className='pointer';pointer.textContent='▼';p.prepend(pointer)}});const pos=positions[active];near=(typeof weddingPlaces==='function'?weddingPlaces():places[room]).map(o=>({...o,d:Math.hypot(pos.x-o.x,pos.y-o.y)})).filter(o=>o.d<o.r).sort((a,b)=>a.d-b.d)[0];$('#interact').disabled=!near;$('#location').textContent=room==='hall'?'婚宴時光':pos.y<40?'誓約花亭':pos.y<68?'藍色花道':'花園入口';$('#hint').textContent=near?'點「互動」：'+near.name:room==='garden'?'點擊地面移動 · 往右前往宴會廳':'點擊地面移動 · 走近餐桌享用美食'}
function openTalk(){if(!near||modal.open||talk.open||$('#stickerDialog').open||ceremonyStart!==null)return;if(near.board){openStickerBoard();return;}held.clear();target=null;$('#speaker').textContent=near.name;$('#speakerArt').className=near.art||'';$('#speakerArt').innerHTML=near.child?'<div class="child-art '+near.child+'-art"></div>':'';$('#speech').textContent=near.text;$('#reply').textContent=near.action;$('#feedBoris').hidden=near.name!=='鮑里斯';talk.showModal()}
$('#interact').onclick=openTalk;$('#closeTalk').onclick=()=>talk.close();let toastTimer;function notify(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2800)}$('#reply').onclick=()=>{talk.close();$('#state').textContent='♡ 幸福，有你一份';notify(near?.child==='saviri'?'薩維里悄悄靠近了一點，把小白花放進你的掌心 ♡':near?.child==='diana'?'狄安娜笑著撒起花瓣：「再玩一次！」 ♡':near?.name==='鮑里斯'?'鮑里斯開心地晃了晃藍色蝴蝶結 ♡':room==='hall'||near?.name==='花園蛋糕'?'一口甜蜜，幸福滿滿 ♡':'你的祝福，已送達新人心裡 ♡')};
let borisFeedCount=0,borisFeedTimer;
$('#feedBoris').onclick=()=>{
 if(!talk.open||near?.name!=='鮑里斯'||room!=='garden')return;
 borisFeedCount++;$('#speech').textContent='你遞上一塊蘋果。鮑里斯低下頭，咔嚓咔嚓地吃了起來，滿足地輕哼一聲，藍色蝴蝶結隨著動作輕輕搖晃。';
 $('#feedBoris').hidden=true;$('#reply').textContent='吃飽了，要乖乖的喔 ♡';$('#state').textContent='已餵鮑里斯 '+borisFeedCount+' 次 ♡';
 const bear=$('#bear');bear.classList.remove('feeding');void bear.offsetWidth;bear.classList.add('feeding');clearTimeout(borisFeedTimer);borisFeedTimer=setTimeout(()=>bear.classList.remove('feeding'),2400);
 notify('鮑里斯吃掉了你給的蘋果，開心地向你點點頭 ♡');
};
$('#world').onpointerdown=e=>{if(!playing||modal.open||talk.open||$('#stickerDialog').open||document.querySelector('#momentDialog')?.open||(typeof momentBusy!=='undefined'&&momentBusy)||ceremonyStart!==null)return;const r=$('#world').getBoundingClientRect();target={x:Math.max(10,Math.min(93,(e.clientX-r.left)/r.width*100)),y:Math.max(28,Math.min(94,(e.clientY-r.top)/r.height*100))}};
function step(t){const dt=Math.min((t-last)/1000,.035);last=t;let dx=0,dy=0;if(ceremonyStart!==null)ceremonyFrame(t);else if(playing&&!modal.open&&!talk.open&&!$('#stickerDialog').open){dx=(held.has('right')?1:0)-(held.has('left')?1:0);dy=(held.has('down')?1:0)-(held.has('up')?1:0);const pos=positions[active];if(target&&!dx&&!dy){const a=target.x-pos.x,b=target.y-pos.y,d=Math.hypot(a,b);if(d<.8)target=null;else{dx=a/d;dy=b/d}}if(dx||dy){const len=Math.hypot(dx,dy);pos.x=Math.max(7,Math.min(95,pos.x+dx/len*25*dt));pos.y=Math.max(28,Math.min(94,pos.y+dy/len*25*dt));if(party===2){const partner=positions[1-active],dist=Math.hypot(pos.x-partner.x,pos.y-partner.y);if(dist>9){partner.x+=(pos.x-partner.x)/dist*23*dt;partner.y+=(pos.y-partner.y)/dist*23*dt}}if(room==='garden'&&pos.x>93&&pos.y>43&&pos.y<63)switchRoom('hall');else if(room==='hall'&&pos.x<9&&pos.y>43&&pos.y<63)switchRoom('garden');render()}}['player','companion'].forEach((id,i)=>$('#'+id).classList.toggle('walking',!!(dx||dy)&&(i===active||party===2)));requestAnimationFrame(step)}
$('#companion').hidden=true;appearance();render();modal.showModal();requestAnimationFrame(step);

// The souvenir uses the same selected sprite layers as the live guests.
const farewell=$('#farewell');let photoUrl=null,photoRun=0,resumeMusic=false;
function loadPhotoImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('照片素材未能載入'));im.src=src})}
async function composeSouvenir(snapshot,count){
 const [garden,groom,bride,atlas]=await Promise.all(['photo-stage.png','isaac.png','characters.png','customization.png'].map(loadPhotoImage));
 if(!atlasReady){await Promise.all([colorAtlas.decode(),extraAtlas.decode(),twinAtlas.decode(),partedAtlas.decode(),faceAtlas.decode(),childrenAtlas.decode(),undercutAtlas.decode()]);baseReady=true;extrasReady=true;twinsReady=true;partedReady=true;faceReady=true;childrenReady=true;undercutReady=true;atlasReady=true}
 await document.fonts.load('72px WeddingScript');
 const guests=snapshot.slice(0,count).map(guestSprite);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1200;const ctx=canvas.getContext('2d');ctx.fillStyle='#fdfefe';ctx.fillRect(0,0,1080,1200);ctx.imageSmoothingEnabled=false;
 ctx.drawImage(garden,0,0,garden.naturalWidth,garden.naturalHeight,40,40,1000,840);
 ctx.fillStyle='#ecf5fc';ctx.fillRect(40,890,1000,270);ctx.strokeStyle='#99b9d6';ctx.lineWidth=3;ctx.strokeRect(23,23,1034,1154);
 const centers=count===2?[200,880]:[300];
 // Newlyweds stand together at the centre, guests alongside them.
 const groomCenter=count===2?425:530,brideCenter=count===2?655:745;
 const groomHeight=count===2?550:570,groomWidth=groomHeight*530/1220,brideHeight=count===2?520:540,brideWidth=brideHeight*.75;
 ctx.drawImage(groom,383,24,479,1192,groomCenter-(groomHeight*479/1220)/2,860-groomHeight*1192/1220,groomHeight*479/1220,groomHeight*1192/1220);
 ctx.drawImage(bride,408,44,358,466,brideCenter-(brideHeight*358/512)/2,860-brideHeight*466/512,brideHeight*358/512,brideHeight*466/512);
 for(let i=0;i<count;i++){const sprite=guests[i],height=guestHeight(snapshot[i],groomHeight*1192/1220,brideHeight*466/512),width=height*sprite.width/sprite.height;ctx.drawImage(sprite.canvas,centers[i]-width/2,860-height,width,height)}

 ctx.imageSmoothingEnabled=true;ctx.fillStyle='#315d88';ctx.textAlign='center';ctx.font='72px WeddingScript';const message='Thank you for your blessings.';if(ctx.measureText(message).width>960)ctx.font='60px WeddingScript';ctx.fillText(message,540,997);ctx.font='28px Georgia, serif';ctx.fillText('Isaac & Baiming',540,1060);ctx.font='18px Georgia, serif';ctx.fillStyle='#7d9bb6';ctx.fillText('A LITTLE BLUE WEDDING',540,1150);ctx.fillStyle='#315d88';for(let i=0;i<count;i++){const label='WITH  '+(snapshot[i].name?.trim()||(i===0?'你':'同行夥伴'));let size=25;ctx.font=size+'px sans-serif';while(ctx.measureText(label).width>900&&size>16){size--;ctx.font=size+'px sans-serif'}ctx.fillText(label,540,count===1?1100:1088+i*32);}
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('照片未能產生')),'image/png'));
}
async function generatePhoto(){const run=++photoRun,snapshot=looks.map(l=>({...l})),count=party;$('#photoStatus').textContent='正在準備你的紀念合照…';$('#photoStatus').hidden=false;$('#souvenir').hidden=true;$('#downloadPhoto').hidden=true;$('#saveTip').hidden=true;$('#retryPhoto').hidden=true;try{const blob=await composeSouvenir(snapshot,count);if(run!==photoRun||!farewell.open)return;if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=URL.createObjectURL(blob);$('#souvenir').src=photoUrl;$('#souvenir').hidden=false;$('#downloadPhoto').href=photoUrl;$('#downloadPhoto').hidden=false;$('#saveTip').hidden=false;$('#photoStatus').textContent='感謝你的祝福。願這張合照，留下今天的美好。'}catch{if(run!==photoRun)return;$('#photoStatus').textContent='照片暫時未能完成，請再試一次。你的造型仍然保留。';$('#retryPhoto').hidden=false}}
$('#leaveWedding').onclick=()=>{if(!playing||ceremonyStart!==null)return;held.clear();target=null;playing=false;resumeMusic=musicOn;if(musicOn)$('#sound').click();farewell.showModal();generatePhoto()};
$('#retryPhoto').onclick=generatePhoto;
function returnToWedding(){photoRun++;farewell.close();playing=true;held.clear();if(resumeMusic)startMusic()}
$('#returnWedding').onclick=returnToWedding;farewell.addEventListener('cancel',e=>{e.preventDefault();returnToWedding()});

