import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AdminLayout from './components/Layout/AdminLayout'
import Login  from './pages/Login'
import Agenda          from './pages/admin/Agenda'
import Clientes        from './pages/admin/Clientes'
import Loyalty         from './pages/admin/Loyalty'
import Servicios       from './pages/admin/Servicios'
import Galeria         from './pages/admin/Galeria'
import Produccion       from './pages/admin/Produccion'
import Inventario       from './pages/admin/Inventario'
import Caja             from './pages/admin/Caja'
import Config           from './pages/admin/Config'
import Landing          from './pages/public/Landing'
import Agendar          from './pages/public/Agendar'
import MisPuntos        from './pages/public/MisPuntos'
import ServiciosPublico from './pages/public/Servicios'
import GaleriaPublico   from './pages/public/Galeria'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"           element={<Landing />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/agendar"    element={<Agendar />} />
          <Route path="/mis-puntos" element={<MisPuntos />} />
          <Route path="/servicios"  element={<ServiciosPublico />} />
          <Route path="/galeria"    element={<GaleriaPublico />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="agenda" replace />} />
            <Route path="agenda"    element={<Agenda />} />
            <Route path="clientes"   element={<Clientes />} />
            <Route path="produccion" element={<Produccion />} />
            <Route path="servicios" element={<Servicios />} />
            <Route path="caja"       element={<Caja />} />
            <Route path="loyalty"    element={<Loyalty />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="galeria"   element={<Galeria />} />
            <Route path="config"     element={<Config />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
