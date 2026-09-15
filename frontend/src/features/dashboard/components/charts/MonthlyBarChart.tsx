import { useEffect, useState } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { getObservationsMonthlyTimeseries, getObservationsMonthlyTimeseriesAllYears } from '../../../../apis/stats.api'
type MonthEntry = { month: string; Native: number; Invasive: number }

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const chartTheme = {
  axis: {
    ticks: { text: { fill: '#ffffff', fontSize: 11 } },
    legend: { text: { fill: '#ffffff', fontSize: 12 } },
  },
  legends: { text: { fill: '#ffffff' } },
  grid: { line: { stroke: 'rgba(255,255,255,0.1)' } },
  tooltip: { container: { background: '#1a1a1a', color: '#ffffff' } },
}

export const MonthlyBarChart = ({ year }: { year: string }) => {
  const [data, setData] = useState<MonthEntry[]>([])
//Call based on if all is pressed 
useEffect(() => {
  const request =
    year === 'all'
      ? getObservationsMonthlyTimeseriesAllYears({})
      : getObservationsMonthlyTimeseries({
          from: new Date(`${year}-01-01`),
          to: new Date(`${year}-12-31`),
        })

  request
    .then((res) => {
      if (res && res.series) {
        const monthMap: Record<string, MonthEntry> = {}
        MONTH_NAMES.forEach((m) => {
          monthMap[m] = { month: m, Native: 0, Invasive: 0 }
        })

        Object.entries(res.series).forEach(([type, points]) => {
          const normalizedType =
            type.toLowerCase().includes('native') || type === 'true'
              ? 'Native'
              : 'Invasive'

          points.forEach((p) => {
            const monthName =
              'month' in p
                ? MONTH_NAMES[p.month - 1]
                : MONTH_NAMES[new Date(p.timestamp).getMonth()]
            monthMap[monthName][normalizedType] += p.speciesCount
          })
        })

        setData(Object.values(monthMap))
      }
    })
    .catch((err) => console.error('MonthlyBarChart API Error:', err))
}, [year])

  return (
    <div className="h-[300px]">
      {data.length > 0 ? (
        <ResponsiveBar
          data={data}
          keys={['Native', 'Invasive']}
          indexBy="month"
          margin={{ top: 50, right: 50, bottom: 50, left: 100 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          colors={{ scheme: 'nivo' }}
          theme={chartTheme}
          enableLabel={true}
          labelSkipHeight={12}
          labelTextColor="#000000"
          axisBottom={{ legend: 'Month', legendPosition: 'middle', legendOffset: 40 }}
          axisLeft={{ legend: 'Total Species', legendPosition: 'middle', legendOffset: -75 }}
          tooltip={({ id, value, indexValue, color }) => (
            <div className="bg-[#1a1a1a] text-white px-3 py-2 rounded-lg text-xs border border-white/20 shadow-2xl flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
              <span>
                <strong>{id}</strong> ({indexValue}):{' '}
                <strong>{value} Species</strong>
              </span>
            </div>
          )}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          Loading Monthly Data...
        </div>
      )}
    </div>
  )
}