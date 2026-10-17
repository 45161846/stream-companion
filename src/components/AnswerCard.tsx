import type { Answer } from '../domain/types';
import { formatTimestamp, sourceUrl } from '../twitch/location';
import { Icon } from './Icon';
export function AnswerCard({answer,recordingId}: {answer: Answer;recordingId:string}) {
  return <div className={`answer answer--${answer.kind}`}>
    <div className="answer-eyebrow"><Icon name="spark" size={14}/><span>STREAM COMPANION</span></div>
    <h3>{answer.title}</h3><p className="answer-summary">{answer.summary}</p>
    {answer.paragraphs?.map(p=><p className="answer-paragraph" key={p}>{p}</p>)}
    {answer.items.length > 0 && <div className={answer.kind==='moments'?'moment-list':'source-list'}>
      {answer.items.map((item,index)=><a className="source-card" key={item.id} href={sourceUrl(recordingId,item.seconds)} target="_blank" rel="noopener noreferrer" aria-label={`Открыть момент ${formatTimestamp(item.seconds)}: ${item.label}`}>
        {answer.kind==='moments' && <span className="moment-number">{String(index+1).padStart(2,'0')}</span>}
        <span className="source-copy"><span className="source-title">{item.label}</span><span className="source-detail">{item.detail}</span><span className="source-time"><Icon name="play" size={12}/>{formatTimestamp(item.seconds)}<span>Открыть на Twitch</span></span></span>
        <Icon name="chevron" size={16}/>
      </a>)}
    </div>}
    {answer.kind!=='unsupported' && <div className="answer-footnote"><Icon name="check" size={12}/>Подготовлено вручную по записи</div>}
  </div>;
}
