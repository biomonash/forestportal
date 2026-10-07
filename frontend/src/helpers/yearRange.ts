import { endOfYear, getYear, startOfYear } from 'date-fns'
import { utc } from '@date-fns/utc'

// Dates are built in UTC so toISOString() keeps the same calendar day.
// The backend only reads the yyyy-MM-dd part of the serialised date.
export function yearToStartDate(year: number): Date {
  return startOfYear(Date.UTC(year, 0, 1), { in: utc })
}

export function yearToEndDate(year: number): Date {
  return endOfYear(Date.UTC(year, 0, 1), { in: utc })
}

export function dateToYear(date: Date): number {
  return getYear(date, { in: utc })
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
