export type TwitchLocation = { recordingId: string | null; channel: string | null; key: string };
export function parseTwitchLocation(raw: string): TwitchLocation {
  const url = new URL(raw);
  const parts = url.pathname.split('/').filter(Boolean);
  const direct = parts[0] === 'videos' && /^\d+$/.test(parts[1] ?? '') ? parts[1]! : null;
  const channelVideo = parts[1] === 'video' && /^\d+$/.test(parts[2] ?? '') ? parts[2]! : null;
  const recordingId = direct ?? channelVideo;
  const channel = !direct && parts[0] ? parts[0].toLowerCase() : null;
  return { recordingId, channel, key: recordingId ? `vod:${recordingId}` : `page:${url.pathname}` };
}
export function formatTimestamp(seconds: number): string {
  const value = Math.max(0, Math.floor(seconds));
  return [Math.floor(value / 3600), Math.floor(value / 60) % 60, value % 60]
    .map(n => String(n).padStart(2, '0')).join(':');
}
export function sourceUrl(recordingId: string, seconds: number): string {
  if (!/^\d+$/.test(recordingId)) throw new Error('Invalid Twitch recording ID');
  const value = Math.max(0, Math.floor(seconds));
  return `https://www.twitch.tv/videos/${recordingId}?t=${Math.floor(value / 3600)}h${Math.floor(value / 60) % 60}m${value % 60}s`;
}
