import type { Scenario, Source } from '../domain/types';

// Visual observations of the public VOD. No invented speech, scores or chat reactions.
export const demo = {
  recordingId: '2898815300',
  channel: 'recrent',
  title: 'Крупнейшее обновление в ARC Raiders',
  recordedAt: '2026-10-12',
  range: [0, 1800] as const,
  observations: [
    {id:'opening', seconds:38, label:'Начало эфира', detail:'Recrent на экране камеры, зрители приветствуют его в чате.'},
    {id:'loadout', seconds:970, label:'Экран снаряжения', detail:'Открыто меню ARC Raiders: оружие, рюкзак и предметы быстрого использования.'},
    {id:'scene', seconds:1619, label:'Сцена с персонажем', detail:'На экране крупный план персонажа; рядом в чате обсуждают озвучку.'},
  ] satisfies Source[],
};
export const prompts: {kind:Scenario;label:string;question:string}[] = [
  {kind:'recap',label:'Краткий рекап',question:'Что я пропустил за первые 30 минут?'},
  {kind:'moments',label:'Интересные моменты',question:'Покажи интересные моменты этого фрагмента'},
  {kind:'context',label:'Объясни контекст',question:'Что происходит на экране с рюкзаком?'},
];
