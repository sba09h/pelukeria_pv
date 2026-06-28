// Mock data for development — replace with real Supabase queries when ready

export const MOCK_PELUQUEROS = [
  { id: 'p1', name: 'Ely Cortamelpelo', color: '#C8B89A', avatar: 'E' },
  { id: 'p2', name: 'Ori Cabrini',      color: '#A89880', avatar: 'O' },
  { id: 'p3', name: 'Valentina López',  color: '#8A7A66', avatar: 'V' },
]

export const MOCK_SERVICES = [
  { id: 's1', name: 'Corte Mujer',          category: 'Corte',         price: 14000, duration: 45  },
  { id: 's2', name: 'Corte Hombre',         category: 'Corte',         price: 9000,  duration: 30  },
  { id: 's3', name: 'Balayage',             category: 'Color',         price: 65000, duration: 180 },
  { id: 's4', name: 'Tintado Completo',     category: 'Color',         price: 35000, duration: 90  },
  { id: 's5', name: 'Alisado Diamond Rose', category: 'Tratamientos',  price: 75000, duration: 120 },
  { id: 's6', name: 'Progresivo',           category: 'Tratamientos',  price: 55000, duration: 90  },
  { id: 's7', name: 'Hidratación Profunda', category: 'Tratamientos',  price: 22000, duration: 45  },
  { id: 's8', name: 'Manicure',             category: 'Otros',         price: 12000, duration: 45  },
  { id: 's9', name: 'Peinado Evento',       category: 'Otros',         price: 30000, duration: 60  },
]

// Generate appointments for current week
const today = new Date()
const monday = new Date(today)
monday.setDate(today.getDate() - today.getDay() + 1)

function makeAppt(id, dayOffset, hour, min, serviceId, peluqueroId, clientName, status = 'confirmada') {
  const date = new Date(monday)
  date.setDate(monday.getDate() + dayOffset)
  const svc = MOCK_SERVICES.find(s => s.id === serviceId)
  return {
    id,
    client_name: clientName,
    client_phone: '+56 9 ' + Math.floor(10000000 + Math.random() * 90000000),
    service_id: serviceId,
    service: svc,
    peluquero_id: peluqueroId,
    peluquero: MOCK_PELUQUEROS.find(p => p.id === peluqueroId),
    date: date.toISOString().split('T')[0],
    hour,
    minute: min,
    status,
    notes: '',
  }
}

export const MOCK_APPOINTMENTS = [
  makeAppt('a1',  0, 9,  30, 's1', 'p1', 'María González',   'confirmada'),
  makeAppt('a2',  0, 10, 30, 's3', 'p2', 'Carolina Ramos',   'en_atencion'),
  makeAppt('a3',  0, 11,  0, 's5', 'p1', 'Javiera Muñoz',    'pendiente'),
  makeAppt('a4',  0, 14,  0, 's8', 'p3', 'Francisca Díaz',   'confirmada'),
  makeAppt('a5',  0, 15, 30, 's2', 'p2', 'Diego Pérez',      'completada'),
  makeAppt('a6',  1, 9,  30, 's4', 'p1', 'Camila Torres',    'pendiente'),
  makeAppt('a7',  1, 10,  0, 's6', 'p3', 'Andrea Soto',      'confirmada'),
  makeAppt('a8',  1, 12,  0, 's1', 'p2', 'Valentina Mora',   'confirmada'),
  makeAppt('a9',  2, 9,   0, 's7', 'p1', 'Isabel Castro',    'pendiente'),
  makeAppt('a10', 2, 11,  0, 's9', 'p3', 'Sofía Rojas',      'confirmada'),
  makeAppt('a11', 3, 10,  0, 's3', 'p2', 'Daniela Vega',     'pendiente'),
  makeAppt('a12', 3, 14, 30, 's1', 'p1', 'Patricia Lagos',   'confirmada'),
  makeAppt('a13', 4, 10,  0, 's5', 'p3', 'Lucía Herrera',    'pendiente'),
  makeAppt('a14', 4, 15,  0, 's2', 'p2', 'Matías Fuentes',   'cancelada'),
]

export const MOCK_CLIENTS = [
  {
    id: 'c1', name: 'María González',   rut: '12.345.678-9', phone: '956781234',
    email: 'maria@email.com', birth_date: '1990-03-15', loyalty_points: 320, notes: 'Alérgica a amoniaco',
  },
  {
    id: 'c2', name: 'Carolina Ramos',   rut: '14.567.890-K', phone: '987654321',
    email: 'carolina@email.com', birth_date: '1985-07-22', loyalty_points: 85, notes: '',
  },
  {
    id: 'c3', name: 'Javiera Muñoz',    rut: '16.789.012-3', phone: '912345678',
    email: '', birth_date: '1998-11-04', loyalty_points: 150, notes: 'Prefiere Ely',
  },
  {
    id: 'c4', name: 'Francisca Díaz',   rut: '18.901.234-5', phone: '965432109',
    email: 'fran@email.com', birth_date: '1993-01-30', loyalty_points: 50, notes: '',
  },
  {
    id: 'c5', name: 'Diego Pérez',      rut: '13.456.789-0', phone: '934567890',
    email: '', birth_date: '1987-05-12', loyalty_points: 210, notes: '',
  },
  {
    id: 'c6', name: 'Camila Torres',    rut: '17.234.567-8', phone: '978901234',
    email: 'cami@email.com', birth_date: '2000-09-18', loyalty_points: 0, notes: 'Cliente nueva',
  },
  {
    id: 'c7', name: 'Andrea Soto',      rut: '15.678.901-2', phone: '923456789',
    email: '', birth_date: '1982-12-03', loyalty_points: 430, notes: 'VIP - viene cada 3 semanas',
  },
  {
    id: 'c8', name: 'Valentina Mora',   rut: '19.012.345-6', phone: '956123456',
    email: 'vale@email.com', birth_date: '1995-06-27', loyalty_points: 110, notes: '',
  },
]

// History visits per client
export const MOCK_VISITS = [
  { id: 'v1',  client_id: 'c1', date: '2026-06-10', service: 'Corte Mujer',          peluquero: 'Ely Cortamelpelo', price: 14000, points_earned: 14 },
  { id: 'v2',  client_id: 'c1', date: '2026-05-15', service: 'Balayage',             peluquero: 'Ely Cortamelpelo', price: 65000, points_earned: 65 },
  { id: 'v3',  client_id: 'c1', date: '2026-04-02', service: 'Hidratación Profunda', peluquero: 'Ori Cabrini',      price: 22000, points_earned: 22 },
  { id: 'v4',  client_id: 'c1', date: '2026-03-18', service: 'Corte Mujer',          peluquero: 'Ely Cortamelpelo', price: 14000, points_earned: 14, redeemed: true, redeemed_points: -50 },
  { id: 'v5',  client_id: 'c2', date: '2026-06-08', service: 'Tintado Completo',     peluquero: 'Ori Cabrini',      price: 35000, points_earned: 35 },
  { id: 'v6',  client_id: 'c2', date: '2026-04-20', service: 'Corte Mujer',          peluquero: 'Ori Cabrini',      price: 14000, points_earned: 14 },
  { id: 'v7',  client_id: 'c3', date: '2026-06-01', service: 'Progresivo',           peluquero: 'Ely Cortamelpelo', price: 55000, points_earned: 55 },
  { id: 'v8',  client_id: 'c3', date: '2026-04-10', service: 'Corte Mujer',          peluquero: 'Ely Cortamelpelo', price: 14000, points_earned: 14 },
  { id: 'v9',  client_id: 'c5', date: '2026-06-12', service: 'Corte Hombre',         peluquero: 'Ori Cabrini',      price: 9000,  points_earned: 9  },
  { id: 'v10', client_id: 'c5', date: '2026-05-05', service: 'Corte Hombre',         peluquero: 'Ori Cabrini',      price: 9000,  points_earned: 9  },
  { id: 'v11', client_id: 'c7', date: '2026-06-18', service: 'Alisado Diamond Rose', peluquero: 'Ely Cortamelpelo', price: 75000, points_earned: 75 },
  { id: 'v12', client_id: 'c7', date: '2026-05-28', service: 'Balayage',             peluquero: 'Ely Cortamelpelo', price: 65000, points_earned: 65, redeemed: true, redeemed_points: -100 },
  { id: 'v13', client_id: 'c7', date: '2026-05-07', service: 'Corte Mujer',          peluquero: 'Ely Cortamelpelo', price: 14000, points_earned: 14 },
]

// Real salon photos from /public/galeria
const G = (id, file, title, category) => ({
  id, url: `/galeria/${file}`, title, category, description: ''
})

export const MOCK_GALLERY = [
  G('g1',  'lpk_galeria_01.webp', 'Corte de pelo natural mujer · La Pelukeria Puerto Varas',               'Corte'),
  G('g2',  'lpk_galeria_02.webp', 'Balayage luminoso · peluquería Puerto Varas',                           'Color'),
  G('g3',  'lpk_galeria_03.webp', 'Coloración vibrante profesional · La Pelukeria Puerto Varas',           'Color'),
  G('g4',  'lpk_galeria_04.webp', 'Tratamiento capilar profundo · peluquería Puerto Varas',                'Tratamientos'),
  G('g5',  'lpk_galeria_05.webp', 'Corte moderno mujer · La Pelukeria Puerto Varas',                       'Corte'),
  G('g6',  'lpk_galeria_06.webp', 'Mechas californianas · balayage Puerto Varas',                          'Color'),
  G('g7',  'lpk_galeria_07.webp', 'Corte y forma profesional · peluquería Puerto Varas',                   'Corte'),
  G('g8',  'lpk_galeria_08.webp', 'Alisado progresivo keratina · La Pelukeria Puerto Varas',               'Tratamientos'),
  G('g9',  'lpk_galeria_09.webp', 'Tonos caramelo coloración · peluquería Puerto Varas',                   'Color'),
  G('g10', 'lpk_galeria_10.webp', 'Corte en capas mujer · La Pelukeria Puerto Varas',                      'Corte'),
  G('g11', 'lpk_galeria_11.webp', 'Color fantasía cabello · peluquería Puerto Varas',                      'Color'),
  G('g12', 'lpk_galeria_12.webp', 'Hidratación profunda tratamiento capilar · Puerto Varas',               'Tratamientos'),
  G('g13', 'lpk_galeria_13.webp', 'Corte bob mujer · La Pelukeria Puerto Varas',                           'Corte'),
  G('g14', 'lpk_galeria_14.webp', 'Mechas rubias highlights · peluquería Puerto Varas',                    'Color'),
  G('g15', 'lpk_galeria_15.webp', 'Color oscuro tinte profesional · La Pelukeria Puerto Varas',            'Color'),
  G('g16', 'lpk_galeria_16.webp', 'Nutrición capilar tratamiento · peluquería Puerto Varas',               'Tratamientos'),
  G('g17', 'lpk_galeria_17.webp', 'Corte degradado mujer · La Pelukeria Puerto Varas',                     'Corte'),
  G('g18', 'lpk_galeria_18.webp', 'Estilo natural corte cabello · peluquería Puerto Varas',                'Corte'),
  G('g19', 'lpk_galeria_19.webp', 'Balayage natural suave · La Pelukeria Puerto Varas',                    'Color'),
  G('g20', 'lpk_galeria_20.webp', 'Tonalidades miel coloración · peluquería Puerto Varas',                 'Color'),
  G('g21', 'lpk_galeria_21.webp', 'Técnica de color avanzada · La Pelukeria Puerto Varas',                 'Corte'),
  G('g22', 'lpk_galeria_22.webp', 'Resultado brillante coloración · peluquería Puerto Varas',              'Color'),
  G('g23', 'lpk_galeria_23.webp', 'Tratamiento nutrición capilar · La Pelukeria Puerto Varas',             'Tratamientos'),
  G('g24', 'lpk_galeria_24.webp', 'Color y mechas combinadas · peluquería Puerto Varas',                   'Color'),
  G('g25', 'lpk_galeria_25.webp', 'Corte clásico profesional mujer · La Pelukeria Puerto Varas',           'Corte'),
  G('g26', 'lpk_galeria_26.webp', 'Alisado Diamond Rose · tratamiento premium Puerto Varas',               'Tratamientos'),
  G('g27', 'lpk_galeria_27.webp', 'Keratina profunda alisado · La Pelukeria Puerto Varas',                 'Tratamientos'),
  G('g28', 'lpk_galeria_28.webp', 'Mechas balayage técnica · peluquería Puerto Varas',                     'Color'),
  G('g29', 'lpk_galeria_29.webp', 'Corte con volumen y movimiento · La Pelukeria Puerto Varas',            'Corte'),
  G('g30', 'lpk_galeria_30.webp', 'Tintado completo profesional · peluquería Puerto Varas',                'Color'),
  G('g31', 'lpk_galeria_31.webp', 'Corte y estilo moderno · La Pelukeria Puerto Varas',                    'Corte'),
  G('g32', 'lpk_galeria_32.webp', 'Técnica de color avanzada · peluquería Puerto Varas',                   'Color'),
  G('g33', 'lpk_galeria_33.webp', 'Resultado alisado keratina · La Pelukeria Puerto Varas',                'Tratamientos'),
  G('g34', 'lpk_galeria_34.webp', 'Highlights rubios mechas finas · peluquería Puerto Varas',              'Color'),
  G('g35', 'lpk_galeria_35.webp', 'Estilo definitivo corte mujer · La Pelukeria Puerto Varas',             'Corte'),
  G('g36', 'lpk_galeria_36.webp', 'Tonos rubios coloración · peluquería Puerto Varas',                     'Color'),
  G('g37', 'lpk_galeria_37.webp', 'Corte y peinado profesional · La Pelukeria Puerto Varas',               'Corte'),
  G('g38', 'lpk_galeria_38.webp', 'Tratamiento brillo capilar · peluquería Puerto Varas',                  'Tratamientos'),
  G('g39', 'lpk_galeria_39.webp', 'Mechas finas highlights · La Pelukeria Puerto Varas',                   'Color'),
  G('g40', 'lpk_galeria_40.webp', 'Resultado natural corte cabello · La Pelukeria Puerto Varas',            'Corte'),
  G('g41', 'lpk_galeria_41.webp', 'Balayage caramelo dorado · peluquería Puerto Varas',                    'Color'),
  G('g42', 'lpk_galeria_42.webp', 'Corte bob liso profesional · La Pelukeria Puerto Varas',                'Corte'),
  G('g43', 'lpk_galeria_43.webp', 'Color vibrante tinte · peluquería Puerto Varas',                        'Color'),
  G('g44', 'lpk_galeria_44.webp', 'Estilo ondulado natural · La Pelukeria Puerto Varas',                   'Corte'),
  G('g45', 'lpk_galeria_45.webp', 'Nutrición capilar tratamiento · peluquería Puerto Varas',               'Tratamientos'),
  G('g46', 'lpk_galeria_46.webp', 'Color luminoso coloración · La Pelukeria Puerto Varas',                 'Color'),
  G('g47', 'lpk_galeria_47.webp', 'Corte moderno profesional · peluquería Puerto Varas',                   'Corte'),
  G('g48', 'lpk_galeria_48.webp', 'Balayage con forma y estructura · La Pelukeria Puerto Varas',           'Color'),
  G('g49', 'lpk_galeria_49.webp', 'Hidratación y brillo capilar · peluquería Puerto Varas',                'Tratamientos'),
  G('g50', 'lpk_galeria_50.webp', 'Corte en capas mujer · La Pelukeria Puerto Varas',                      'Corte'),
  G('g51', 'lpk_galeria_51.webp', 'Babylights mechas finas · peluquería Puerto Varas',                     'Color'),
  G('g52', 'lpk_galeria_52.webp', 'Estilo clásico corte · La Pelukeria Puerto Varas',                      'Corte'),
  G('g53', 'lpk_galeria_53.webp', 'Color profundo oscuro tinte · peluquería Puerto Varas',                 'Color'),
  G('g54', 'lpk_galeria_54.webp', 'Tratamiento alisado keratina · La Pelukeria Puerto Varas',              'Tratamientos'),
  G('g55', 'lpk_galeria_55.webp', 'Corte con volumen profesional · peluquería Puerto Varas',               'Corte'),
  G('g56', 'lpk_galeria_56.webp', 'Mechas y color combinado · La Pelukeria Puerto Varas',                  'Color'),
  G('g57', 'lpk_galeria_57.webp', 'Coloración completa tinte · peluquería Puerto Varas',                   'Color'),
  G('g58', 'lpk_galeria_58.webp', 'Corte definitivo estilo · La Pelukeria Puerto Varas',                   'Corte'),
  G('g59', 'lpk_galeria_59.webp', 'Color y brillo coloración · peluquería Puerto Varas',                   'Color'),
  G('g60', 'lpk_galeria_60.webp', 'Hidratación shine tratamiento · La Pelukeria Puerto Varas',             'Tratamientos'),
  G('g61', 'lpk_galeria_61.webp', 'Corte limpio preciso · peluquería Puerto Varas',                        'Corte'),
  G('g62', 'lpk_galeria_62.webp', 'Tonos tierra coloración natural · La Pelukeria Puerto Varas',           'Color'),
  G('g63', 'lpk_galeria_63.webp', 'Balayage rubio claro · peluquería Puerto Varas',                        'Color'),
  G('g64', 'lpk_galeria_64.webp', 'Tratamiento alisado progresivo · La Pelukeria Puerto Varas',            'Tratamientos'),
  G('g65', 'lpk_galeria_65.webp', 'Corte bob moderno mujer · peluquería Puerto Varas',                     'Corte'),
  G('g66', 'lpk_galeria_66.webp', 'Color y mechas profesional · La Pelukeria Puerto Varas',                'Color'),
  G('g67', 'lpk_galeria_67.webp', 'Estilo oscuro coloración · peluquería Puerto Varas',                    'Color'),
  G('g68', 'lpk_galeria_68.webp', 'Corte definido acabado · La Pelukeria Puerto Varas',                    'Corte'),
  G('g69', 'lpk_galeria_69.webp', 'Nutrición y volumen capilar · peluquería Puerto Varas',                 'Tratamientos'),
  G('g70', 'lpk_galeria_70.webp', 'Coloración vibrante profesional · La Pelukeria Puerto Varas',           'Color'),
  G('g71', 'lpk_galeria_71.webp', 'Resultado impecable corte · peluquería Puerto Varas',                   'Corte'),
  G('g72', 'lpk_galeria_72.webp', 'Estilo final transformación · La Pelukeria Puerto Varas',               'Corte'),
]

export const LOYALTY_CONFIG = {
  points_per_clp: 0.001,  // 1 punto cada $1.000 CLP
  levels: [
    { points: 100, reward: '10% descuento',             type: 'discount',     value: 10    },
    { points: 200, reward: 'Servicio gratis hasta $20k', type: 'free_service', value: 20000 },
    { points: 500, reward: 'Servicio gratis hasta $50k', type: 'free_service', value: 50000 },
  ],
}

export const MOCK_BLOCKED_SLOTS = [
  {
    id: 'b1',
    peluquero_id: 'p1',
    date: new Date(monday.getTime() + 2 * 86400000).toISOString().split('T')[0],
    hour_start: 13,
    hour_end: 14,
    reason: 'Almuerzo',
  },
]

// Business hours: Tue–Fri 9:30–19:00, Sat 10:00–18:00
// ── Inventory ──────────────────────────────────────────────────────────────
export const MOCK_INVENTORY = [
  { id: 'i1',  name: 'Shampoo Keratina Pro',       brand: 'Wella',     category: 'Shampoo',       stock: 8,  stock_min: 3,  cost_price: 12000, unit: 'unidad' },
  { id: 'i2',  name: 'Acondicionador Hidratante',   brand: 'Wella',     category: 'Acondicionador',stock: 5,  stock_min: 3,  cost_price: 11000, unit: 'unidad' },
  { id: 'i3',  name: 'Tinte Castaño Espresso',      brand: 'Schwarzkopf',category: 'Tinte',        stock: 12, stock_min: 5,  cost_price: 8500,  unit: 'tubo'   },
  { id: 'i4',  name: 'Tinte Rubio Ceniza',          brand: 'Schwarzkopf',category: 'Tinte',        stock: 2,  stock_min: 5,  cost_price: 8500,  unit: 'tubo'   },
  { id: 'i5',  name: 'Oxidante 20 vol',             brand: 'Igora',     category: 'Oxidante',      stock: 3,  stock_min: 4,  cost_price: 4500,  unit: 'litro'  },
  { id: 'i6',  name: 'Diamond Rose Alisado',        brand: 'Brazil Cacau',category: 'Tratamiento', stock: 4,  stock_min: 2,  cost_price: 45000, unit: 'frasco' },
  { id: 'i7',  name: 'Mascarilla Progresiva',       brand: 'Cadiveu',   category: 'Tratamiento',   stock: 1,  stock_min: 2,  cost_price: 32000, unit: 'frasco' },
  { id: 'i8',  name: 'Aceite Argan Serum',          brand: 'Moroccan Oil',category: 'Finalizador', stock: 6,  stock_min: 2,  cost_price: 22000, unit: 'unidad' },
  { id: 'i9',  name: 'Spray Fijador Extra Fuerte',  brand: 'Tigi',      category: 'Finalizador',   stock: 9,  stock_min: 3,  cost_price: 9500,  unit: 'unidad' },
  { id: 'i10', name: 'Papel de Aluminio 100m',      brand: 'Genérico',  category: 'Insumo',        stock: 3,  stock_min: 2,  cost_price: 3500,  unit: 'rollo'  },
  { id: 'i11', name: 'Guantes Latex M (100u)',      brand: 'Genérico',  category: 'Insumo',        stock: 0,  stock_min: 2,  cost_price: 4800,  unit: 'caja'   },
  { id: 'i12', name: 'Esmalte Gel Nude Rose',       brand: 'OPI',       category: 'Manicure',      stock: 7,  stock_min: 2,  cost_price: 7500,  unit: 'unidad' },
]

export const MOCK_MOVEMENTS = [
  { id: 'm1',  item_id: 'i1',  type: 'entrada', qty: 6,  date: '2026-06-01', reason: 'Compra proveedor', created_by: 'Admin Dueño' },
  { id: 'm2',  item_id: 'i1',  type: 'salida',  qty: 2,  date: '2026-06-10', reason: 'Uso en servicio',  created_by: 'Ely Cortamelpelo' },
  { id: 'm3',  item_id: 'i3',  type: 'entrada', qty: 15, date: '2026-06-01', reason: 'Compra proveedor', created_by: 'Admin Dueño' },
  { id: 'm4',  item_id: 'i3',  type: 'salida',  qty: 3,  date: '2026-06-12', reason: 'Tintado Completo', created_by: 'Ori Cabrini' },
  { id: 'm5',  item_id: 'i4',  type: 'salida',  qty: 2,  date: '2026-06-08', reason: 'Balayage',         created_by: 'Ely Cortamelpelo' },
  { id: 'm6',  item_id: 'i5',  type: 'salida',  qty: 1,  date: '2026-06-08', reason: 'Uso en servicio',  created_by: 'Ori Cabrini' },
  { id: 'm7',  item_id: 'i6',  type: 'entrada', qty: 5,  date: '2026-06-01', reason: 'Compra proveedor', created_by: 'Admin Dueño' },
  { id: 'm8',  item_id: 'i6',  type: 'salida',  qty: 1,  date: '2026-06-18', reason: 'Alisado Diamond Rose', created_by: 'Ely Cortamelpelo' },
  { id: 'm9',  item_id: 'i7',  type: 'salida',  qty: 1,  date: '2026-06-01', reason: 'Progresivo',       created_by: 'Valentina López' },
  { id: 'm10', item_id: 'i11', type: 'salida',  qty: 2,  date: '2026-06-05', reason: 'Uso general',      created_by: 'Admin Dueño' },
]

// ── Cash register ──────────────────────────────────────────────────────────
const todayStr = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const twoDaysAgo = new Date(Date.now() - 2*86400000).toISOString().split('T')[0]

export const MOCK_CASH_ENTRIES = [
  // Today
  { id: 'ca1', date: todayStr, client: 'María González',   service: 'Corte Mujer',          amount: 14000, method: 'transferencia', loyalty_discount: 0,    closed: false },
  { id: 'ca2', date: todayStr, client: 'Carolina Ramos',   service: 'Balayage',             amount: 58500, method: 'debito',        loyalty_discount: 6500, closed: false },
  { id: 'ca3', date: todayStr, client: 'Francisca Díaz',   service: 'Manicure',             amount: 12000, method: 'efectivo',      loyalty_discount: 0,    closed: false },
  { id: 'ca4', date: todayStr, client: 'Diego Pérez',      service: 'Corte Hombre',         amount: 9000,  method: 'efectivo',      loyalty_discount: 0,    closed: false },
  // Yesterday (closed)
  { id: 'ca5', date: yesterday, client: 'Camila Torres',   service: 'Tintado Completo',     amount: 35000, method: 'credito',       loyalty_discount: 0,    closed: true  },
  { id: 'ca6', date: yesterday, client: 'Andrea Soto',     service: 'Progresivo',           amount: 55000, method: 'transferencia', loyalty_discount: 0,    closed: true  },
  { id: 'ca7', date: yesterday, client: 'Valentina Mora',  service: 'Corte Mujer',          amount: 14000, method: 'efectivo',      loyalty_discount: 0,    closed: true  },
  // Two days ago (closed)
  { id: 'ca8', date: twoDaysAgo, client: 'Isabel Castro',  service: 'Hidratación Profunda', amount: 22000, method: 'debito',        loyalty_discount: 0,    closed: true  },
  { id: 'ca9', date: twoDaysAgo, client: 'Sofía Rojas',    service: 'Peinado Evento',       amount: 30000, method: 'efectivo',      loyalty_discount: 0,    closed: true  },
  { id:'ca10', date: twoDaysAgo, client: 'Andrea Soto',    service: 'Alisado Diamond Rose', amount: 67500, method: 'transferencia', loyalty_discount: 7500, closed: true  },
]

export const BUSINESS_HOURS = {
  1: null,                          // Monday closed
  2: { open: '09:30', close: '19:00' },
  3: { open: '09:30', close: '19:00' },
  4: { open: '09:30', close: '19:00' },
  5: { open: '09:30', close: '19:00' },
  6: { open: '10:00', close: '18:00' },
  0: null,                          // Sunday closed
}

// ── Producción mensual ────────────────────────────────────────────────────────
// Cada entrada = un servicio realizado por un peluquero
export const MOCK_PRODUCCION = [
  // ── Abril 2026 ──────────────────────────────────────────────────────────
  { id:'pr1',  peluquero_id:'p1', date:'2026-04-02', client:'Javiera Muñoz',    service:'Corte Mujer',          category:'Corte',         amount:14000 },
  { id:'pr2',  peluquero_id:'p1', date:'2026-04-05', client:'María González',   service:'Alisado Diamond Rose', category:'Tratamientos',  amount:75000 },
  { id:'pr3',  peluquero_id:'p1', date:'2026-04-09', client:'Patricia Lagos',   service:'Balayage',             category:'Color',         amount:65000 },
  { id:'pr4',  peluquero_id:'p1', date:'2026-04-14', client:'Isabel Castro',    service:'Corte Mujer',          category:'Corte',         amount:14000 },
  { id:'pr5',  peluquero_id:'p1', date:'2026-04-18', client:'Camila Torres',    service:'Hidratación Profunda', category:'Tratamientos',  amount:22000 },
  { id:'pr6',  peluquero_id:'p1', date:'2026-04-22', client:'Sofía Rojas',      service:'Progresivo',           category:'Tratamientos',  amount:55000 },
  { id:'pr7',  peluquero_id:'p1', date:'2026-04-26', client:'Daniela Vega',     service:'Tintado Completo',     category:'Color',         amount:35000 },
  { id:'pr8',  peluquero_id:'p2', date:'2026-04-03', client:'Carolina Ramos',   service:'Tintado Completo',     category:'Color',         amount:35000 },
  { id:'pr9',  peluquero_id:'p2', date:'2026-04-07', client:'Valentina Mora',   service:'Corte Mujer',          category:'Corte',         amount:14000 },
  { id:'pr10', peluquero_id:'p2', date:'2026-04-11', client:'Diego Pérez',      service:'Corte Hombre',         category:'Corte',         amount:9000  },
  { id:'pr11', peluquero_id:'p2', date:'2026-04-16', client:'Francisca Díaz',   service:'Balayage',             category:'Color',         amount:65000 },
  { id:'pr12', peluquero_id:'p2', date:'2026-04-24', client:'Matías Fuentes',   service:'Corte Hombre',         category:'Corte',         amount:9000  },
  { id:'pr13', peluquero_id:'p3', date:'2026-04-04', client:'Andrea Soto',      service:'Manicure',             category:'Manicure',      amount:12000 },
  { id:'pr14', peluquero_id:'p3', date:'2026-04-10', client:'Lucía Herrera',    service:'Manicure',             category:'Manicure',      amount:12000 },
  { id:'pr15', peluquero_id:'p3', date:'2026-04-17', client:'Francisca Díaz',   service:'Peinado Evento',       category:'Otros',         amount:30000 },
  { id:'pr16', peluquero_id:'p3', date:'2026-04-23', client:'Sofía Rojas',      service:'Manicure',             category:'Manicure',      amount:12000 },
  // ── Mayo 2026 ────────────────────────────────────────────────────────────
  { id:'pr17', peluquero_id:'p1', date:'2026-05-03', client:'María González',   service:'Balayage',             category:'Color',         amount:65000 },
  { id:'pr18', peluquero_id:'p1', date:'2026-05-07', client:'Javiera Muñoz',    service:'Corte Mujer',          category:'Corte',         amount:14000 },
  { id:'pr19', peluquero_id:'p1', date:'2026-05-10', client:'Andrea Soto',      service:'Balayage',             category:'Color',         amount:65000 },
  { id:'pr20', peluquero_id:'p1', date:'2026-05-15', client:'Camila Torres',    service:'Hidratación Profunda', category:'Tratamientos',  amount:22000 },
  { id:'pr21', peluquero_id:'p1', date:'2026-05-20', client:'Patricia Lagos',   service:'Alisado Diamond Rose', category:'Tratamientos',  amount:75000 },
  { id:'pr22', peluquero_id:'p1', date:'2026-05-24', client:'Daniela Vega',     service:'Corte Mujer',          category:'Corte',         amount:14000 },
  { id:'pr23', peluquero_id:'p1', date:'2026-05-28', client:'Andrea Soto',      service:'Balayage',             category:'Color',         amount:65000 },
  { id:'pr24', peluquero_id:'p2', date:'2026-05-04', client:'Diego Pérez',      service:'Corte Hombre',         category:'Corte',         amount:9000  },
  { id:'pr25', peluquero_id:'p2', date:'2026-05-08', client:'Valentina Mora',   service:'Tintado Completo',     category:'Color',         amount:35000 },
  { id:'pr26', peluquero_id:'p2', date:'2026-05-13', client:'Carolina Ramos',   service:'Corte Mujer',          category:'Corte',         amount:14000 },
  { id:'pr27', peluquero_id:'p2', date:'2026-05-19', client:'Matías Fuentes',   service:'Corte Hombre',         category:'Corte',         amount:9000  },
  { id:'pr28', peluquero_id:'p2', date:'2026-05-22', client:'Francisca Díaz',   service:'Balayage',             category:'Color',         amount:65000 },
  { id:'pr29', peluquero_id:'p2', date:'2026-05-27', client:'Isabel Castro',    service:'Tintado Completo',     category:'Color',         amount:35000 },
  { id:'pr30', peluquero_id:'p3', date:'2026-05-06', client:'Lucía Herrera',    service:'Manicure',             category:'Manicure',      amount:12000 },
  { id:'pr31', peluquero_id:'p3', date:'2026-05-12', client:'Sofía Rojas',      service:'Manicure',             category:'Manicure',      amount:12000 },
  { id:'pr32', peluquero_id:'p3', date:'2026-05-16', client:'Andrea Soto',      service:'Peinado Evento',       category:'Otros',         amount:30000 },
  { id:'pr33', peluquero_id:'p3', date:'2026-05-21', client:'Francisca Díaz',   service:'Manicure',             category:'Manicure',      amount:12000 },
  { id:'pr34', peluquero_id:'p3', date:'2026-05-26', client:'Carolina Ramos',   service:'Manicure',             category:'Manicure',      amount:12000 },
  // ── Junio 2026 ───────────────────────────────────────────────────────────
  { id:'pr35', peluquero_id:'p1', date:'2026-06-01', client:'Javiera Muñoz',    service:'Progresivo',           category:'Tratamientos',  amount:55000 },
  { id:'pr36', peluquero_id:'p1', date:'2026-06-04', client:'María González',   service:'Corte Mujer',          category:'Corte',         amount:14000 },
  { id:'pr37', peluquero_id:'p1', date:'2026-06-08', client:'Patricia Lagos',   service:'Balayage',             category:'Color',         amount:65000 },
  { id:'pr38', peluquero_id:'p1', date:'2026-06-10', client:'Camila Torres',    service:'Corte Mujer',          category:'Corte',         amount:14000 },
  { id:'pr39', peluquero_id:'p1', date:'2026-06-14', client:'Daniela Vega',     service:'Tintado Completo',     category:'Color',         amount:35000 },
  { id:'pr40', peluquero_id:'p1', date:'2026-06-18', client:'Andrea Soto',      service:'Alisado Diamond Rose', category:'Tratamientos',  amount:75000 },
  { id:'pr41', peluquero_id:'p1', date:'2026-06-22', client:'Isabel Castro',    service:'Hidratación Profunda', category:'Tratamientos',  amount:22000 },
  { id:'pr42', peluquero_id:'p2', date:'2026-06-03', client:'Carolina Ramos',   service:'Tintado Completo',     category:'Color',         amount:35000 },
  { id:'pr43', peluquero_id:'p2', date:'2026-06-06', client:'Diego Pérez',      service:'Corte Hombre',         category:'Corte',         amount:9000  },
  { id:'pr44', peluquero_id:'p2', date:'2026-06-09', client:'Valentina Mora',   service:'Corte Mujer',          category:'Corte',         amount:14000 },
  { id:'pr45', peluquero_id:'p2', date:'2026-06-12', client:'Matías Fuentes',   service:'Corte Hombre',         category:'Corte',         amount:9000  },
  { id:'pr46', peluquero_id:'p2', date:'2026-06-17', client:'Francisca Díaz',   service:'Balayage',             category:'Color',         amount:65000 },
  { id:'pr47', peluquero_id:'p2', date:'2026-06-20', client:'Isabel Castro',    service:'Tintado Completo',     category:'Color',         amount:35000 },
  { id:'pr48', peluquero_id:'p3', date:'2026-06-05', client:'Sofía Rojas',      service:'Manicure',             category:'Manicure',      amount:12000 },
  { id:'pr49', peluquero_id:'p3', date:'2026-06-11', client:'Lucía Herrera',    service:'Manicure',             category:'Manicure',      amount:12000 },
  { id:'pr50', peluquero_id:'p3', date:'2026-06-14', client:'Andrea Soto',      service:'Peinado Evento',       category:'Otros',         amount:30000 },
  { id:'pr51', peluquero_id:'p3', date:'2026-06-19', client:'Francisca Díaz',   service:'Manicure',             category:'Manicure',      amount:12000 },
  { id:'pr52', peluquero_id:'p3', date:'2026-06-23', client:'Carolina Ramos',   service:'Manicure',             category:'Manicure',      amount:12000 },
]

// Porcentajes de comisión por peluquero (configurables)
export const MOCK_COMISIONES = {
  p1: 40,  // Ely — 40% sobre producción
  p2: 38,  // Ori — 38%
  p3: 35,  // Valentina — 35%
}
