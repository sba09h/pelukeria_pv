import { Construction } from 'lucide-react'

export default function Placeholder({ title, description }) {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="w-14 h-14 rounded-2xl bg-dark-100 flex items-center justify-center mb-4">
        <Construction size={24} className="text-dark-400" />
      </div>
      <h2 className="text-lg font-semibold text-dark-800">{title}</h2>
      <p className="text-sm text-dark-400 mt-1 max-w-xs">{description || 'Este módulo estará disponible próximamente.'}</p>
      <div className="mt-4 px-3 py-1.5 bg-brand-100 text-brand-700 text-xs font-medium rounded-full">
        En desarrollo
      </div>
    </div>
  )
}
