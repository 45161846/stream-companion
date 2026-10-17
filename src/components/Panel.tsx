import { useEffect, useRef, useState } from 'react';
import type { AnswerProvider, Message } from '../domain/types';
import { demo, prompts } from '../data/demo';
import { AnswerCard } from './AnswerCard';
import { Icon } from './Icon';
import { formatTimestamp, sourceUrl } from '../twitch/location';

export function Panel({recordingId,provider,onToggle,onResize,collapsed}: {
  recordingId:string|null;provider:AnswerProvider;onToggle:()=>void;onResize?:(collapsed:boolean)=>void;collapsed:boolean;
}) {
  const [question,setQuestion]=useState('');
  const [messages,setMessages]=useState<Message[]>([]);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const scrollRef=useRef<HTMLDivElement>(null);
  const textarea=useRef<HTMLTextAreaElement>(null);
  const requestRef=useRef<AbortController|null>(null);
  const supported=recordingId===demo.recordingId;
  useEffect(()=>{
    requestRef.current?.abort();setMessages([]);setQuestion('');setPending(false);setError(null);
    return ()=>requestRef.current?.abort();
  },[recordingId]);
  useEffect(()=>onResize?.(collapsed),[collapsed,onResize]);
  useEffect(()=>{const element=scrollRef.current;if(element)element.scrollTo?.({top:messages.length||pending||error?element.scrollHeight:0,behavior:'smooth'});},[messages,pending,error,collapsed]);
  const clear=()=>{requestRef.current?.abort();requestRef.current=null;setMessages([]);setQuestion('');setPending(false);setError(null);textarea.current?.focus();};
  async function submit(value:string) {
    const text=value.trim();if(!text||requestRef.current||!supported||!recordingId)return;
    const controller=new AbortController();requestRef.current=controller;setPending(true);setError(null);setQuestion('');
    try {
      const answer=await provider.answer({recordingId,question:text},controller.signal);
      if(controller.signal.aborted)return;
      setMessages(prev=>[...prev,{id:Date.now(),question:text,answer}]);
    }catch {if(!controller.signal.aborted){setQuestion(text);setError('Не удалось получить ответ. Попробуй ещё раз.');}}
    finally {if(!controller.signal.aborted){setPending(false);requestRef.current=null;textarea.current?.focus();}}
  }
  if(collapsed)return <button className="launcher" onClick={onToggle} aria-label="Открыть Stream Companion" title="Открыть Stream Companion"><Icon name="spark" size={20}/><span>Спроси трансляцию</span><Icon name="chevron" size={14}/></button>;
  return <section className="panel" aria-label="Stream Companion">
    <header className="panel-header"><span className="brand-mark"><Icon name="spark" size={21}/></span><div className="brand"><strong>Stream Companion</strong><span><i/>Рядом с трансляцией</span></div>
      <button className="icon-button" onClick={clear} aria-label="Очистить чат" title="Очистить чат" disabled={!messages.length&&!pending&&!error}><Icon name="clear" size={16}/></button>
      <button className="icon-button" onClick={onToggle} aria-label="Свернуть панель" title="Свернуть панель"><Icon name="close" size={18}/></button>
    </header>
    <div className="recording-strip"><div className="avatar">R</div><div><strong>Recrent</strong><span>ARC Raiders · запись эфира</span></div><span className="demo-badge">ДЕМО</span></div>
    <div className="scope"><Icon name="clock" size={13}/><span>Подготовленный фрагмент</span><strong>{formatTimestamp(demo.range[0])}–{formatTimestamp(demo.range[1])}</strong></div>
    <div className="conversation" ref={scrollRef} role="log" aria-label="Диалог с ассистентом" aria-live="polite" aria-relevant="additions">
      {!supported ? <div className="unsupported-recording"><span className="intro-mark"><Icon name="play" size={25}/></span><h2>Открой запись Recrent</h2><p>В этом демо подготовлены ответы для одной записи. На других эфирах и видео данных пока нет.</p><a className="primary-link" href={sourceUrl(demo.recordingId,demo.range[0])}>Открыть запись<Icon name="chevron" size={15}/></a></div> : <>
        {!messages.length&&!pending&&<div className="welcome"><span className="intro-mark"><Icon name="spark" size={29}/></span><div className="eyebrow">МЕНЬШЕ ПОИСКА. БОЛЬШЕ ЭФИРА.</div><h2>Спроси трансляцию</h2><p>Догони события, найди интересный момент или разберись в контексте.</p><div className="prompt-list">{prompts.map(p=><button key={p.kind} onClick={()=>void submit(p.question)}><span className="prompt-icon"><Icon name={p.kind==='recap'?'clock':p.kind==='moments'?'play':'spark'} size={17}/></span><span><strong>{p.label}</strong><small>{p.question}</small></span><Icon name="chevron" size={15}/></button>)}</div><div className="welcome-note">Готовые ответы. Можно перефразировать вопросы.</div></div>}
        {messages.map(m=><div className="exchange" key={m.id}><div className="question-bubble">{m.question}</div><AnswerCard answer={m.answer} recordingId={demo.recordingId}/></div>)}
        {pending&&<div className="pending" role="status"><span/><span/><span/>Готовлю ответ</div>}
        {error&&<p className="error" role="alert">{error}</p>}
      </>}
    </div>
    {supported&&<div className="composer-area">{messages.length>0&&<div className="quick-prompts">{prompts.map(p=><button key={p.kind} disabled={pending} onClick={()=>void submit(p.question)}>{p.label}</button>)}</div>}
      <form className="composer" onSubmit={e=>{e.preventDefault();void submit(question);}}>
        <textarea ref={textarea} value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void submit(question);}}} placeholder="Что ты пропустил?" aria-label="Вопрос о трансляции" maxLength={500} rows={2} disabled={pending}/>
        <button className="send-button" type="submit" disabled={!question.trim()||pending} aria-label="Отправить вопрос"><Icon name="arrow" size={18}/></button>
      </form><div className="composer-note"><span className="local-dot"/>Готовые ответы · без AI</div>
    </div>}
  </section>;
}
