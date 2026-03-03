import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import BoughtVsConsumedChart from './BoughtVsConsumedChart'
import ForecastChart from './ForecastChart'

const RESTAURANT_ID = 'R001'

export default function ReportSection() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReports = async () => {
    if (history) return   // already loaded
    setLoading(true)
    setError('')
    try {
      const [hRes, fRes] = await Promise.all([
        fetch(`/inventory/report/history?restaurant_id=${RESTAURANT_ID}&months=6`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`/inventory/report/forecast?restaurant_id=${RESTAURANT_ID}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
      ])
      const [hData, fData] = await Promise.all([hRes.json(), fRes.json()])
      if (!hRes.ok) throw new Error(hData.detail || 'Failed to load history.')
      if (!fRes.ok) throw new Error(fData.detail || 'Failed to load forecast.')
      setHistory(hData)
      setForecast(fData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next) fetchReports()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📈</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Reports & Forecast</p>
            <p className="text-xs text-slate-500">Bought vs consumed trends · AI consumption forecast</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm font-medium transition-transform duration-200"
          style={{ display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100">
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <span className="animate-spin mr-2 text-xl">⏳</span>
              <span className="text-sm">Loading reports…</span>
            </div>
          )}

          {error && (
            <div className="m-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {!loading && !error && history && forecast && (
            <div className="p-6 space-y-8">

              {/* Chart 1 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base font-semibold text-slate-700">📊 Bought vs Consumed</span>
                  <span className="text-xs text-slate-400">— last 6 months</span>
                </div>
                {history.series.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No historical data available.</p>
                ) : (
                  <BoughtVsConsumedChart months={history.months} series={history.series} />
                )}
              </div>

              <hr className="border-slate-100" />

              {/* Chart 2 */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-semibold text-slate-700">🤖 AI Consumption Forecast</span>
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                    {forecast.forecast_month}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Weighted moving average of last 6 months · upgradeable to ML model
                </p>
                {forecast.forecasts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Insufficient data for forecast.</p>
                ) : (
                  <ForecastChart history={history} forecast={forecast} />
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  )
}
