const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Format an ISO date string (YYYY-MM-DD) for display, e.g. "Jan 8, 1991". */
export function formatDate(val: string | null | undefined): string {
	if (!val) return '—';
	const [y, m, d] = val.split('-');
	if (!y || !m || !d) return val; // not the expected shape — show as-is
	const month = MONTHS[Number(m) - 1] ?? m;
	return `${month} ${Number(d)}, ${y}`;
}
