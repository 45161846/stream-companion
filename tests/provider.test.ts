import { describe,expect,it } from 'vitest';
import { demo,prompts } from '../src/data/demo';
import { MockAnswerProvider } from '../src/domain/mock-provider';
import { formatTimestamp,parseTwitchLocation,sourceUrl } from '../src/twitch/location';
const provider=new MockAnswerProvider();
const ask=(question:string)=>provider.answer({recordingId:demo.recordingId,question});
describe('prepared answers and their boundaries',()=>{
  for(const p of prompts)it(`answers ${p.kind} with sources from the selected Recrent VOD`,async()=>{
    const result=await ask(p.question);
    expect(result.kind).toBe(p.kind);expect(result.items.length).toBeGreaterThan(0);
    for(const item of result.items){expect(item.seconds).toBeGreaterThanOrEqual(demo.range[0]);expect(item.seconds).toBeLessThanOrEqual(demo.range[1]);expect(new URL(sourceUrl(demo.recordingId,item.seconds)).pathname).toBe(`/videos/${demo.recordingId}`);}
  });
  it.each(['РЕКАП!','Кратко перескажи начало','  что   я ПРОПУСТИЛ за первые 30 минут?  '])('accepts recap paraphrase %s',async question=>expect((await ask(question)).kind).toBe('recap'));
  it.each(['Что было за последние 20 минут?','Рекап за час','Перескажи всю запись','Рекап первых 10 минут','Что было вчера?','Первые 30 секунд','Рекап за первые десять минут','Покажи смешные моменты этого фрагмента','Какие были победы?','Как погода?','Почему чат пишет про холодильник?','Кратко объясни квантовую физику','Почему рюкзак тяжелый?','Что происходило в другом фильме?','Покажи моменты из другого эфира'])('does not invent unsupported answer: %s',async question=>{const result=await ask(question);expect(result.kind).toBe('unsupported');expect(result.items).toEqual([]);} );
  it('never uses the prepared answers for another VOD',async()=>expect((await provider.answer({recordingId:'123',question:'рекап'})).kind).toBe('unsupported'));
  it('honours cancellation',async()=>{const c=new AbortController();c.abort();await expect(provider.answer({recordingId:demo.recordingId,question:'рекап'},c.signal)).rejects.toMatchObject({name:'AbortError'});});
});
describe('Twitch navigation',()=>{
  it('keeps identity across timestamp navigation',()=>expect(parseTwitchLocation(`https://www.twitch.tv/videos/${demo.recordingId}?t=0h16m10s`).key).toBe(parseTwitchLocation(`https://www.twitch.tv/videos/${demo.recordingId}`).key));
  it('supports channel-scoped VOD URL',()=>expect(parseTwitchLocation(`https://www.twitch.tv/recrent/video/${demo.recordingId}`).recordingId).toBe(demo.recordingId));
  it('does not confuse live channel with a recording',()=>expect(parseTwitchLocation('https://www.twitch.tv/recrent').recordingId).toBeNull());
  it('creates exact timestamps',()=>{expect(formatTimestamp(970)).toBe('00:16:10');expect(sourceUrl(demo.recordingId,1619)).toBe(`https://www.twitch.tv/videos/${demo.recordingId}?t=0h26m59s`);});
});
