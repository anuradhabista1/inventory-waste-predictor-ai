import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DateFilter from './DateFilter'
import InventoryTable from './InventoryTable'
import EditItemModal from './EditItemModal'

const RESTAURANT_ID = 'R001'

const today = new Date()
const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
const defaultTo = today.toISOString().slice(0, 10)

export default function InventoryList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isManager = user?.role === 'Manager'

  const [fromDate, setFromDate] = useState(defaultFrom)
  const [toDate, setToDate] = useState(defaultTo)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingItem, setEditingItem] = useState(null)

  const fetchInventory = async (from, to) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/inventory/list/?restaurant_id=${RESTAURANT_ID}&from_date=${from}&to_date=${to}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Failed to load inventory.')
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInventory(fromDate, toDate) }, [])

  const handleFilter = () => fetchInventory(fromDate, toDate)

  const handleSaved = () => {
    setEditingItem(null)
    fetchInventory(fromDate, toDate)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">📦 Inventory List</h2>
          <p className="text-sm text-slate-500 mt-0.5">Restaurant {RESTAURANT_ID}</p>
        </div>
        {isManager ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/summary')}
              className="px-4 py-2.5 text-sm font-semibold text-blue-600 bg-white border border-blue-300 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
            >
              📊 Monthly Summary
            </button>
            <button
              onClick={() => navigate('/intake')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              + Add Inventory
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/summary')}
              className="px-4 py-2.5 text-sm font-semibold text-blue-600 bg-white border border-blue-300 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
            >
              📊 Monthly Summary
            </button>
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              <span>🔒</span>
              <span>View-only access</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4">
        <DateFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromChange={setFromDate}
          onToChange={setToDate}
          onFilter={handleFilter}
        />
      </div>

      {/* Results card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Stats bar */}
        {data && (
          <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between text-sm bg-slate-50">
            <span className="text-slate-600">
              <strong className="text-slate-800">{data.total_items}</strong> records found
            </span>
            <span className="text-slate-600">
              Total units: <strong className="text-slate-800">{data.total_units}</strong>
            </span>
          </div>
        )}

        <div className="p-4">
          {loading && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-3xl mb-2 animate-spin">⏳</div>
              <p>Loading inventory…</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}
          {!loading && !error && data && (
            <InventoryTable
              items={data.items}
              isManager={isManager}
              onEdit={setEditingItem}
            />
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          restaurantId={RESTAURANT_ID}
          onClose={() => setEditingItem(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
