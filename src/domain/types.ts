export type Scenario = 'recap' | 'moments' | 'context';
export type Source = { id: string; seconds: number; label: string; detail: string };
export type Answer = {
  kind: Scenario | 'unsupported';
  title: string;
  summary: string;
  items: Source[];
  paragraphs?: string[];
};
export type AnswerRequest = { recordingId: string; question: string };
export interface AnswerProvider { answer(request: AnswerRequest, signal?: AbortSignal): Promise<Answer> }
export type Message = { id: number; question: string; answer: Answer };
