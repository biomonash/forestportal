import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../hooks/redux'
import { normaliseYearRange } from '../../../helpers/yearRange'
import {
  selectAvailableYears,
  selectFromYear,
  selectToYear,
  updateYearRange,
} from '../../../store/mapSlice'

/**
 * Two overlapping native range inputs form the dual-handle slider.
 * Native inputs keep keyboard and screen-reader support without
 * adding another slider dependency.
 */
export default function YearRangeFilter() {
  const dispatch = useAppDispatch()

  const availableYears = useAppSelector(selectAvailableYears)
  const fromYear = useAppSelector(selectFromYear)
  const toYear = useAppSelector(selectToYear)

  const fallbackYear = new Date().getFullYear()

  const minYear = availableYears[0] ?? fallbackYear
  const maxYear = availableYears[availableYears.length - 1] ?? fallbackYear

  // Local state is used while dragging.
  // Redux/API only updates when the user releases the handle.
  const [draft, setDraft] = useState<[number, number]>([
    fromYear ?? minYear,
    toYear ?? maxYear,
  ])

  const [draftFrom, draftTo] = draft

  const isFiltered = fromYear !== undefined || toYear !== undefined

  /**
   * Keep the slider synced with Redux.
   *
   * This also handles:
   * - Reset Filters
   * - URL values
   * - available years arriving from the API
   * - reversed/out-of-range URL values
   */
  useEffect(() => {
    if (availableYears.length < 2) return

    const currentFrom = fromYear ?? minYear
    const currentTo = toYear ?? maxYear

    const normalised = normaliseYearRange(
      currentFrom,
      currentTo,
      minYear,
      maxYear,
    )

    setDraft([normalised.fromYear, normalised.toYear])

    const fromWasInvalid =
      fromYear !== undefined && fromYear !== normalised.fromYear

    const toWasInvalid = toYear !== undefined && toYear !== normalised.toYear

    const wasReversed =
      fromYear !== undefined && toYear !== undefined && fromYear > toYear

    // If URL/query values were invalid, correct Redux as well.
    if (fromWasInvalid || toWasInvalid || wasReversed) {
      const isFullSpan =
        normalised.fromYear === minYear && normalised.toYear === maxYear

      if (isFullSpan) {
        dispatch(updateYearRange(null, null))
      } else {
        dispatch(updateYearRange(normalised.fromYear, normalised.toYear))
      }
    }
  }, [availableYears.length, dispatch, fromYear, toYear, minYear, maxYear])

  /**
   * Save the selected range into Redux.
   * This is called only after the user finishes interacting
   * with the slider.
   */
  const commit = useCallback(
    (next: [number, number]) => {
      const normalised = normaliseYearRange(next[0], next[1], minYear, maxYear)

      const nextRange: [number, number] = [
        normalised.fromYear,
        normalised.toYear,
      ]

      setDraft(nextRange)

      // Full range means "All years".
      // Clear Redux values so from/to are not sent to the API.
      if (normalised.fromYear === minYear && normalised.toYear === maxYear) {
        dispatch(updateYearRange(null, null))
        return
      }

      dispatch(updateYearRange(normalised.fromYear, normalised.toYear))
    },
    [dispatch, minYear, maxYear],
  )

  const handleFromChange = (value: number) => {
    setDraft(([, currentTo]) => [Math.min(value, currentTo), currentTo])
  }

  const handleToChange = (value: number) => {
    setDraft(([currentFrom]) => [currentFrom, Math.max(value, currentFrom)])
  }

  const handleAllYears = () => {
    setDraft([minYear, maxYear])
    dispatch(updateYearRange(null, null))
  }

  /**
   * Calculate where the selected green section should appear
   * on the slider track.
   */
  const { leftPercent, rightPercent } = useMemo(() => {
    const span = maxYear - minYear || 1

    return {
      leftPercent: ((draftFrom - minYear) / span) * 100,
      rightPercent: ((draftTo - minYear) / span) * 100,
    }
  }, [draftFrom, draftTo, minYear, maxYear])

  // There is no useful slider when fewer than two years exist.
  if (availableYears.length < 2) {
    return null
  }

  return (
    <div className="flex flex-col">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          Year{' '}
          <span className="font-normal normal-case text-gray-400">
            (optional)
          </span>
        </span>

        {isFiltered && (
          <button
            type="button"
            onClick={handleAllYears}
            className="text-[11px] font-semibold text-green-700 hover:underline"
          >
            All years
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white/50 px-3 py-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-bold text-black">{draftFrom}</span>

          <span className="text-xs text-gray-400">to</span>

          <span className="text-sm font-bold text-black">{draftTo}</span>
        </div>

        <div className="relative h-5">
          {/* Grey background track */}
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-gray-300" />

          {/* Green selected range */}
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-green-700"
            style={{
              left: `${leftPercent}%`,
              width: `${rightPercent - leftPercent}%`,
            }}
          />

          {/* Start-year handle */}
          <input
            type="range"
            min={minYear}
            max={maxYear}
            step={1}
            value={draftFrom}
            onChange={(event) => handleFromChange(Number(event.target.value))}
            onMouseUp={() => commit(draft)}
            onTouchEnd={() => commit(draft)}
            onKeyUp={() => commit(draft)}
            aria-label="Start year"
            className="year-range-input absolute inset-0 h-5 w-full"
            style={{
              zIndex: draftFrom >= maxYear ? 5 : 3,
            }}
          />

          {/* End-year handle */}
          <input
            type="range"
            min={minYear}
            max={maxYear}
            step={1}
            value={draftTo}
            onChange={(event) => handleToChange(Number(event.target.value))}
            onMouseUp={() => commit(draft)}
            onTouchEnd={() => commit(draft)}
            onKeyUp={() => commit(draft)}
            aria-label="End year"
            className="year-range-input absolute inset-0 h-5 w-full"
            style={{ zIndex: 4 }}
          />
        </div>

        <div className="mt-1 flex justify-between text-[10px] text-gray-400">
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>
      </div>
    </div>
  )
}
