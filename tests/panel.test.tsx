import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe,expect,it,vi} from 'vitest';
import {Panel} from '../src/components/Panel';
import {MockAnswerProvider} from '../src/domain/mock-provider';
import {demo,prompts} from '../src/data/demo';
import {mountCompanion,setHostLayout} from '../src/twitch/mount';
import type {AnswerProvider} from '../src/domain/types';
function setup(provider:AnswerProvider=new MockAnswerProvider()) {
  return render(<Panel recordingId={demo.recordingId} collapsed={false} onToggle={()=>{}} provider={provider}/>);
}
describe('chat flow',()=>{
  it('runs all three scenarios and offers source links without losing the conversation',async()=>{
    setup();const user=userEvent.setup();
    await user.click(screen.getByRole('button',{name:/Краткий рекап/}));await screen.findByRole('heading',{name:'Первые 30 минут — коротко'});
    await user.click(screen.getByRole('button',{name:'Интересные моменты'}));await screen.findByRole('heading',{name:'Три момента, с которых начать'});
    await user.click(screen.getByRole('button',{name:'Объясни контекст'}));await screen.findByRole('heading',{name:'Это экран снаряжения'});
    const links=screen.getAllByRole('link',{name:/Открыть момент/});expect(links).toHaveLength(7);
    for(const link of links){expect(link).toHaveAttribute('target','_blank');expect(link.getAttribute('href')).toContain(`/videos/${demo.recordingId}?t=`);}
  });
  it('supports free text, unsupported questions and reset',async()=>{
    setup();const user=userEvent.setup();const input=screen.getByRole('textbox',{name:'Вопрос о трансляции'});
    await user.type(input,'Почему чат пишет про холодильник?{Enter}');await screen.findByRole('heading',{name:'В демо есть три сценария'});expect(screen.queryAllByRole('link')).toHaveLength(0);
    await user.click(screen.getByRole('button',{name:'Очистить чат'}));expect(screen.getByRole('heading',{name:'Спроси трансляцию'})).toBeInTheDocument();expect(input).toHaveValue('');
  });
  it('resets when another recording opens and disables chat',async()=>{
    const view=setup();await userEvent.click(screen.getByRole('button',{name:/Краткий рекап/}));await screen.findByRole('heading',{name:'Первые 30 минут — коротко'});
    view.rerender(<Panel recordingId="999" collapsed={false} onToggle={()=>{}} provider={new MockAnswerProvider()}/>);
    expect(screen.getByRole('heading',{name:'Открой запись Recrent'})).toBeInTheDocument();expect(screen.queryByRole('textbox')).not.toBeInTheDocument();expect(screen.queryByText('Первые 30 минут — коротко')).not.toBeInTheDocument();
  });
  it('shows recoverable provider errors',async()=>{
    setup({answer:async()=>{throw new Error('test failure');}});
    await userEvent.click(screen.getByRole('button',{name:/Краткий рекап/}));expect(await screen.findByRole('alert')).toHaveTextContent('Попробуй ещё раз');expect(screen.getByRole('textbox')).toHaveValue(prompts[0]!.question);
  });
  it('prevents an in-flight answer from restoring a cleared conversation',async()=>{
    let resolve!: (value:Awaited<ReturnType<AnswerProvider['answer']>>)=>void;
    const provider={answer:vi.fn(()=>new Promise<Awaited<ReturnType<AnswerProvider['answer']>>>(r=>{resolve=r;}))};setup(provider);
    await userEvent.click(screen.getByRole('button',{name:/Краткий рекап/}));await userEvent.click(screen.getByRole('button',{name:'Очистить чат'}));
    await act(async()=>resolve({kind:'recap',title:'Old response',summary:'',items:[]}));expect(screen.queryByText('Old response')).not.toBeInTheDocument();
  });
});
describe('host integration',()=>{
  it('preserves collapsed state during fullscreen',()=>{
    const host=document.createElement('div');setHostLayout(host,true,true);expect(host.style.display).toBe('none');setHostLayout(host,true,false);expect(host.style.width).toBe('0px');expect(host.style.display).toBe('block');
  });
  it('handles SPA navigation and fullscreen events, and cleans up on removal',async()=>{
    const host=document.createElement('div');const container=document.createElement('div');host.append(container);document.body.append(host);
    let url=`https://www.twitch.tv/videos/${demo.recordingId}`;let fullscreen:Element|null=null;
    Object.defineProperty(document,'fullscreenElement',{configurable:true,get:()=>fullscreen});
    let mounted!:ReturnType<typeof mountCompanion>;
    await act(async()=>{mounted=mountCompanion(container,host,{location:()=>url,routeIntervalMs:20});});
    await userEvent.click(screen.getByRole('button',{name:'Свернуть панель'}));expect(screen.getByRole('button',{name:'Открыть Stream Companion'})).toBeInTheDocument();
    await act(async()=>{fullscreen=document.body;document.dispatchEvent(new Event('fullscreenchange'));});expect(host.style.display).toBe('none');
    await act(async()=>{fullscreen=null;document.dispatchEvent(new Event('fullscreenchange'));});expect(host.style.width).toBe('0px');
    await userEvent.click(screen.getByRole('button',{name:'Открыть Stream Companion'}));
    await userEvent.click(screen.getByRole('button',{name:/Краткий рекап/}));await screen.findByRole('heading',{name:'Первые 30 минут — коротко'});
    await act(async()=>{url='https://www.twitch.tv/recrent';window.dispatchEvent(new PopStateEvent('popstate'));});
    await waitFor(()=>expect(screen.getByRole('heading',{name:'Открой запись Recrent'})).toBeInTheDocument());
    await act(async()=>mounted.destroy());host.remove();Object.defineProperty(document,'fullscreenElement',{configurable:true,value:null});
  });
});
