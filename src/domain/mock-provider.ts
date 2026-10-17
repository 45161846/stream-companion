import { demo, prompts } from '../data/demo';
import type { Answer, AnswerProvider, AnswerRequest } from './types';

export function normalizeQuestion(value:string):string {
  return value.toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}:]+/gu,' ').trim().replace(/\s+/g,' ');
}

const aliases = {
  recap: [prompts[0]!.question, 'рекап', 'краткий рекап', 'сделай рекап', 'что я пропустил', 'что было в начале', 'кратко перескажи начало', 'перескажи первые 30 минут', 'дай резюме фрагмента'],
  moments: [prompts[1]!.question, 'покажи моменты', 'покажи интересные моменты', 'покажи самые интересные моменты', 'подборка моментов', 'интересные моменты', 'хайлайты', 'покажи хайлайты этого фрагмента', 'найди интересные моменты'],
  context: [prompts[2]!.question, 'что за инвентарь', 'объясни что за инвентарь', 'объясни контекст экрана экипировки', 'что происходит в этом меню', 'почему открыт инвентарь', 'зачем открыт рюкзак', 'объясни экран снаряжения'],
};
function intentFor(question:string) {
  const normalized=normalizeQuestion(question).replace(/(?:^| )пожалуйста(?: |$)/g,' ').trim();
  return (Object.keys(aliases) as (keyof typeof aliases)[]).find(kind=>aliases[kind].some(alias=>normalizeQuestion(alias)===normalized));
}

const unsupported = (summary:string):Answer => ({kind:'unsupported',title:'В демо есть три сценария',summary,items:[]});
export class MockAnswerProvider implements AnswerProvider {
  async answer({recordingId,question}:AnswerRequest, signal?:AbortSignal):Promise<Answer> {
    if(signal?.aborted)throw new DOMException('Request aborted','AbortError');
    if(recordingId!==demo.recordingId)return unsupported('Для этой записи данных нет. Открой подготовленную запись Recrent.');
    const q=normalizeQuestion(question);
    if(!q)return unsupported('Задай вопрос о первых 30 минутах записи или выбери одну из подсказок.');
    if(/(вчера|сегодня|недел|месяц|последни|час|день|дней|дня|секунд|весь|всю|полн|друг|десять|двадцать|пятнадцать|сорок)/.test(q) || /\d/.test(q.replace(/\b30\b/g,''))) {
      return unsupported('Подготовлены только первые 30 минут этой записи. Другие периоды пока недоступны — попробуй одну из подсказок.');
    }
    if(/(смешн|забавн|смерт|побед|убийств|клатч)/.test(q)) {
      return unsupported('Такой подборки в демо пока нет. Подготовлены три интересных момента — их можно открыть через подсказку.');
    }
    const intent=intentFor(question);
    if(intent==='context') {
      const source=demo.observations[1]!;
      return {kind:'context',title:'Это экран снаряжения',summary:'На этом моменте Recrent находится в меню ARC Raiders, а не в перестрелке.',paragraphs:[
        'На экране видны оружие, рюкзак и слоты быстрого использования. Через это меню игрок просматривает и подготавливает свой набор предметов.',
        'В демо размечено то, что видно в кадре. Конкретную цель выбора предметов и реплики стримера этот набор не содержит.',
      ],items:[source]};
    }
    if(intent==='moments')return {
      kind:'moments',title:'Три момента, с которых начать',summary:'Подготовленная подборка из фрагмента 00:00:00–00:30:00. Открой любой момент в оригинале.',items:demo.observations,
    };
    if(intent==='recap')return {
      kind:'recap',title:'Первые 30 минут — коротко',summary:'Начало эфира, меню снаряжения и сцена с персонажем. Ниже — три вручную размеченных события с источниками.',items:demo.observations,
    };
    return unsupported('Я пока отвечаю на подготовленные вопросы: рекап первых 30 минут, интересные моменты и контекст экрана с рюкзаком. Выбери подсказку или перефразируй её.');
  }
}
