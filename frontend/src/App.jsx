import IntakeForm from './components/IntakeForm'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Inventory Waste Predictor</h1>
            <p className="text-xs text-slate-500">Powered by AI</p>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <IntakeForm />
      </main>
    </div>
  )
}
