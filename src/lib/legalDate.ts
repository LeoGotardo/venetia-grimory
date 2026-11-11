/** Data de vigência (`AAAA-MM-DD`) dos termos e da política, por extenso; meio-dia UTC, para não mudar de dia em nenhum fuso. */
export function formatLegalDate(isoDate: string, language: string): string {
  return new Intl.DateTimeFormat(language, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${isoDate}T12:00:00Z`))
}
