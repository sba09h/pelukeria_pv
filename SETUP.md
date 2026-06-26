# La Pelukeria PV — Setup Guide

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y corre el archivo `supabase/schema.sql`
3. Copia la URL y la Anon Key del proyecto

## 3. Variables de entorno

Crea un archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

> Sin estas variables, la app corre en **modo demo** con datos de ejemplo.

## 4. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## 5. Accesos demo (sin Supabase)

| Email                        | Contraseña | Rol          |
|-----------------------------|------------|--------------|
| admin@lapelukeria.cl        | demo1234   | Admin        |
| ely@lapelukeria.cl          | demo1234   | Peluquera    |
| recepcion@lapelukeria.cl    | demo1234   | Recepcionista |

## 6. URLs importantes

| Ruta             | Descripción                        |
|------------------|------------------------------------|
| `/login`         | Login del equipo                   |
| `/admin/agenda`  | Agenda interna (Módulo 1)          |
| `/agendar`       | Auto-agendamiento público (Módulo 2) |

## 7. Deploy en Vercel

1. Sube el proyecto a GitHub
2. Conecta en [vercel.com](https://vercel.com)
3. Agrega las variables de entorno en Vercel
4. Deploy automático en cada push

## Módulos disponibles

- ✅ **Módulo 1** — Agenda interna (vista semanal + diaria, estados, bloqueos)
- ✅ **Módulo 2** — Auto-agendamiento público (/agendar)
- 🔲 Módulo 3 — Clientes e historial
- 🔲 Módulo 4 — Loyalty card digital
- 🔲 Módulo 5 — Catálogo de servicios
- 🔲 Módulo 6 — Galería / Portfolio
- 🔲 Módulo 7 — Inventario de productos
- 🔲 Módulo 8 — Caja diaria
