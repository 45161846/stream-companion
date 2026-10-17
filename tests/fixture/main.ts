import { mountCompanion } from '../../src/twitch/mount';
import css from '../../src/components/panel.css?inline';
import { demo } from '../../src/data/demo';
const host=document.createElement('stream-companion');
document.querySelector('main')!.insertAdjacentElement('afterend',host);
const shadow=host.attachShadow({mode:'open'});
const style=document.createElement('style');style.textContent=css;shadow.append(style);
const container=document.createElement('div');shadow.append(container);
for(const event of ['keyup','keydown','keypress'])shadow.addEventListener(event,e=>e.stopPropagation());
let location=`https://www.twitch.tv/videos/${demo.recordingId}`;
mountCompanion(container,host,{location:()=>location});
document.getElementById('supported')!.onclick=()=>{location=`https://www.twitch.tv/videos/${demo.recordingId}`;window.dispatchEvent(new PopStateEvent('popstate'));};
document.getElementById('other')!.onclick=()=>{location='https://www.twitch.tv/videos/12345';window.dispatchEvent(new PopStateEvent('popstate'));};
document.getElementById('fullscreen')!.onclick=()=>{void document.querySelector('.video-frame')!.requestFullscreen();};

document.getElementById('exit-fullscreen')!.onclick=()=>{void document.exitFullscreen();};
