import { dict } from '../i18n/current';

export function timeAgo(ts: number): string {
  const d = dict();
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return d.time.justNow;
  if (min < 60) return d.time.minutes(min);
  const h = Math.round(min / 60);
  if (h < 24) return d.time.hours(h);
  const days = Math.round(h / 24);
  if (days === 1) return d.time.yesterday;
  if (days < 7) return d.time.days(days);
  return new Date(ts).toLocaleDateString(d.locale);
}

export function formatTime(ts: number): string {
  const d = dict();
  const date = new Date(ts);
  const sameDay = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString(d.locale, { hour: '2-digit', minute: '2-digit' });
  return sameDay
    ? time
    : `${date.toLocaleDateString(d.locale, { day: '2-digit', month: '2-digit' })} ${time}`;
}
