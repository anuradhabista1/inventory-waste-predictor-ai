export default function SuccessSummary({ data, onAddMore }) {
  const { payload } = data
  const totalUnits = payload.items.reduce((sum, i) => sum + i.units, 0)

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 flex items-center gap-4">
        <span className="text-4xl">✅</span>
        <div>
          <h2 className="text-white text-xl font-semibold">Intake Submitted Successfully</h2>
          <p className="text-green-100 text-sm mt-1">
            {payload.items.length} item{payload.items.length !== 1 ? 's' : ''} recorded for {payload.restaurant_id} — {payload.month}
          </p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Meta */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Restaurant', value: payload.restaurant_id },
            { label: 'Month', value: payload.month },
            { label: 'Delivery Date', value: payload.delivery_date },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-slate-800 font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Items table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-2">Item ID</div>
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-3 text-right">Units</div>
          </div>
          <div className="divide-y divide-slate-100">
            {payload.items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 px-4 py-3 text-sm text-slate-700">
                <div className="col-span-2 font-mono text-xs text-slate-500">{item.item_id}</div>
                <div className="col-span-4 font-medium">{item.name}</div>
                <div className="col-span-3">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
                <div className="col-span-3 text-right font-semibold">{item.units}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-12 px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm font-semibold text-slate-700">
            <div className="col-span-9">Total</div>
            <div className="col-span-3 text-right">{totalUnits}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={onAddMore}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>+</span> Add More Intake
          </button>
        </div>
      </div>
    </div>
  )
}
