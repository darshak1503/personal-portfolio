export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDateRange(
  start: string,
  end: string | null,
  current?: boolean,
) {
  const startLabel = formatMonthYear(start);
  if (current || !end) return `${startLabel} — Present`;
  return `${startLabel} — ${formatMonthYear(end)}`;
}

function formatMonthYear(value: string) {
  if (/^\d{4}$/.test(value)) return value;
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}