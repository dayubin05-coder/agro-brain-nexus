/**
 * Centralized formatters (BRL currency, pt-BR dates).
 * Use these instead of inlining toLocaleString / toLocaleDateString calls.
 */

export const formatBRL = (value: number, fractionDigits = 2): string =>
  `R$ ${Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;

/** Compact currency: R$ 1.2K / R$ 3.40M / R$ 12.34 */
export const formatBRLCompact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}K`;
  return `R$ ${value.toFixed(2)}`;
};

/** Compact kilos rounded: R$ 12K */
export const formatBRLKilo = (value: number): string =>
/** Compact kilos rounded: R$ 12K */
export const formatBRLKilo = (value: number): string =>
  `R$ ${(value / 1000).toFixed(0)}K`;

/** Compact kilos with 1 decimal (lowercase k), signed: R$ 1.2k / -R$ 3.4k */
export const formatBRLk = (value: number): string =>
  value >= 0
    ? `R$ ${(value / 1000).toFixed(1)}k`
    : `-R$ ${(Math.abs(value) / 1000).toFixed(1)}k`;

/** Plain BRL using thousands separator with no fixed fraction digits */
export const formatBRLPlain = (value: number): string =>
  `R$ ${Number(value).toLocaleString("pt-BR")}`;
export const formatDateBR = (date: string | Date): string =>
  new Date(date).toLocaleDateString("pt-BR");

export const formatMonthShortBR = (yearMonth: string): string =>
  new Date(yearMonth + "-15").toLocaleDateString("pt-BR", { month: "short" });

export const formatDayMonthBR = (date: string | Date): string =>
  new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

export const formatWeekdayShortBR = (date: string): string =>
  new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" });
