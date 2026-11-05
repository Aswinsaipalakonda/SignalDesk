export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeTime(value?: string): string {
  if (!value) return 'unknown';
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const future = diffMs < 0;
  const seconds = Math.floor(Math.abs(diffMs) / 1000);

  const label = (amount: number, unit: string) =>
    future ? `in ${amount} ${unit}${amount === 1 ? '' : 's'}` : `${amount} ${unit}${amount === 1 ? '' : 's'} ago`;

  if (seconds < 45) return 'just now';
  if (seconds < 3600) return label(Math.floor(seconds / 60), 'min');
  if (seconds < 86400) return label(Math.floor(seconds / 3600), 'hour');
  if (seconds < 86400 * 30) return label(Math.floor(seconds / 86400), 'day');
  return formatDate(value);
}

export function truncate(value: string, length = 120): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}

export function priorityShare(count: number, total: number): number {
  if (!total) return 0;
  return (count / total) * 100;
}

export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
