export function formatDate(value, region = 'uk-UA') {
  if (!value) return '-';
  return new Intl.DateTimeFormat(region, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export function formatShortDate(value, region = 'uk-UA') {
  if (!value) return '-';
  return new Intl.DateTimeFormat(region, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function formatMoney(value, region = 'uk-UA', currency = 'UAH') {
  return new Intl.NumberFormat(region, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function sortByLocale(items, selector, region = 'uk-UA', direction = 'asc') {
  return [...items].sort((a, b) => {
    const left = String(selector(a) ?? '');
    const right = String(selector(b) ?? '');
    const result = left.localeCompare(right, region, { sensitivity: 'base', numeric: true });
    return direction === 'desc' ? -result : result;
  });
}

export function statusClass(status) {
  const map = {
    Active: 'success',
    Draft: 'warning',
    Cancelled: 'danger',
    Expired: 'muted',
    Created: 'warning',
    InReview: 'info',
    Approved: 'success',
    Rejected: 'danger',
    Paid: 'success',
    PaidOut: 'success',
    critical: 'danger',
    normal: 'success'
  };
  return map[status] || 'muted';
}

export function makeId(items) {
  return Math.max(0, ...items.map(item => Number(item.id) || 0)) + 1;
}

export function downloadText(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
