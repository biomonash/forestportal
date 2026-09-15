export function yearStart(year: number): string {
  return `${year}-01-01`
}

export function yearEnd(year: number): string {
  return `${year}-12-31`
}

export function clampYear(year: number, minYear: number, maxYear: number) {
  return Math.min(Math.max(year, minYear), maxYear)
}

export function normaliseYearRange(
  fromYear: number,
  toYear: number,
  minYear: number,
  maxYear: number,
) {
  const clampedFrom = clampYear(fromYear, minYear, maxYear)

  const clampedTo = clampYear(toYear, minYear, maxYear)

  return {
    fromYear: Math.min(clampedFrom, clampedTo),
    toYear: Math.max(clampedFrom, clampedTo),
  }
}
