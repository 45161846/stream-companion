import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Panel } from '../components/Panel';
import type { AnswerProvider } from '../domain/types';
import { MockAnswerProvider } from '../domain/mock-provider';
import { parseTwitchLocation } from './location';

export function setHostLayout(host:HTMLElement,collapsed:boolean,fullscreen:boolean) {
  host.style.display=fullscreen?'none':'block';
  host.style.flex=collapsed?'0 0 0px':'0 0 clamp(310px, 25vw, 370px)';
  host.style.width=collapsed?'0':'clamp(310px, 25vw, 370px)';
  host.style.height='100%';host.style.minHeight='0';host.style.position='relative';
  host.style.alignSelf='stretch';host.style.zIndex=collapsed?'1000':'1';
  host.dataset.collapsed=String(collapsed);host.dataset.fullscreen=String(fullscreen);
}

export function mountCompanion(container:HTMLElement,host:HTMLElement,options:{
  location?:()=>string;provider?:AnswerProvider;routeIntervalMs?:number;
}={}) {
  const readLocation=options.location??(()=>window.location.href);
  const provider=options.provider??new MockAnswerProvider();
  container.style.height='100%';
  const root=createRoot(container);
  function Application() {
    const [location,setLocation]=useState(()=>parseTwitchLocation(readLocation()));
    const [collapsed,setCollapsed]=useState(false);
    const [fullscreen,setFullscreen]=useState(Boolean(document.fullscreenElement));
    useEffect(()=>{
      const onLocation=()=>{const next=parseTwitchLocation(readLocation());setLocation(prev=>prev.key===next.key?prev:next);};
      const onFullscreen=()=>setFullscreen(Boolean(document.fullscreenElement));
      const interval=window.setInterval(onLocation,options.routeIntervalMs??250);
      window.addEventListener('popstate',onLocation);
      document.addEventListener('fullscreenchange',onFullscreen);
      document.addEventListener('webkitfullscreenchange',onFullscreen);
      return ()=>{window.clearInterval(interval);window.removeEventListener('popstate',onLocation);document.removeEventListener('fullscreenchange',onFullscreen);document.removeEventListener('webkitfullscreenchange',onFullscreen);};
    },[]);
    useEffect(()=>setHostLayout(host,collapsed,fullscreen),[collapsed,fullscreen]);
    return <Panel key={location.key} recordingId={location.recordingId} provider={provider} onToggle={()=>setCollapsed(prev=>!prev)} collapsed={collapsed}/>;
  }
  root.render(<Application/>);
  return {destroy:()=>root.unmount()};
}
