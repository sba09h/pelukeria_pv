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

// Real salon photos from /src/galeria
const G = (id, file, title, category, description = '') => ({
  id, url: `/galeria/${file}`, title, category, description
})

export const MOCK_GALLERY = [
  G('g1',  '491442458_17871690399345251_3209008374417841811_n.webp',          'Corte natural',          'Corte'),
  G('g2',  '491445162_17871415572345251_368358495502043921_n.webp',           'Balayage luminoso',      'Color'),
  G('g3',  '491451782_17944704617982317_7847035535329272525_n.webp',          'Color vibrante',         'Color'),
  G('g4',  '491899885_17871415590345251_8944960919762388264_n.webp',          'Tratamiento profundo',   'Tratamientos'),
  G('g5',  '494635461_17944704626982317_3148033694217216914_n.webp',          'Corte moderno',          'Corte'),
  G('g6',  '495303305_17873120235345251_612069046376757542_n.webp',           'Mechas californianas',   'Color'),
  G('g7',  '495431612_17872970778345251_4986182817075993995_n.webp',          'Corte y forma',          'Corte'),
  G('g8',  '496757761_17873873898345251_595157736190777384_n.webp',           'Alisado progresivo',     'Tratamientos'),
  G('g9',  '497743519_17874398019345251_6611057479011005558_n.webp',          'Tonos caramelo',         'Color'),
  G('g10', '502018196_17875982268345251_4081439649387061853_n.webp',          'Corte en capas',         'Corte'),
  G('g11', '502496533_17879664138345251_2662247050742248748_n.webp',          'Color fantasía',         'Color'),
  G('g12', '503426259_17878786245345251_8228158095637401436_n.webp',          'Hidratación profunda',   'Tratamientos'),
  G('g13', '504432647_17877780966345251_665120523640951016_n.webp',           'Corte bob',              'Corte'),
  G('g14', '504503915_17878042299345251_330224239036077585_n.webp',           'Mechas rubias',          'Color'),
  G('g15', '508711483_17878573815345251_5151607868371879294_n.webp',          'Color oscuro',           'Color'),
  G('g16', '514439313_17880161571345251_5383246342923231334_n.webp',          'Nutrición capilar',      'Tratamientos'),
  G('g17', '520474025_17882291712345251_8634529825437618861_n.webp',          'Corte degradado',        'Corte'),
  G('g18', '522944113_17883322152345251_3462876965012044979_n.webp',          'Estilo natural',         'Corte'),
  G('g19', '524503246_17883322143345251_2677896351796144306_n.webp',          'Balayage natural',       'Color'),
  G('g20', '524702296_17883322164345251_7572641808358478543_n.webp',          'Tonalidades miel',       'Color'),
  G('g21', '528321554_17884572558345251_4692035691461154801_n_1_11zon.webp',  'Trabajo en color',       'Corte'),
  G('g22', '531514924_17885455341345251_7768494109051229221_n_2_11zon.webp',  'Resultado brillante',    'Color'),
  G('g23', '532319494_17885948499345251_8109603322858333682_n_3_11zon.webp',  'Tratamiento nutrición',  'Tratamientos'),
  G('g24', '537312243_17958058760982317_2913585434333238479_n_4_11zon.webp',  'Color y mechas',         'Color'),
  G('g25', '538166651_17886691155345251_8361318768342532532_n_5_11zon.webp',  'Corte clásico',          'Corte'),
  G('g26', '539394048_18149462677400511_5053722861017725537_n_6_11zon.webp',  'Diamond Rose',           'Tratamientos'),
  G('g27', '541155143_18149462695400511_1052174353474521108_n_7_11zon.webp',  'Keratina profunda',      'Tratamientos'),
  G('g28', '542356510_17889007065345251_6963409667306960528_n_8_11zon.webp',  'Mechas balayage',        'Color'),
  G('g29', '544355890_17888900547345251_4845529673562435698_n_9_11zon.webp',  'Volumen y movimiento',   'Corte'),
  G('g30', '547783918_17889233850345251_1500390999692302985_n_10_11zon.webp', 'Tintado completo',       'Color'),
  G('g31', '548836459_17889702885345251_1329868695909128978_n_1_11zon.webp',  'Corte y estilo',         'Corte'),
  G('g32', '553733579_17890685265345251_8017987194666463668_n_2_11zon.webp',  'Técnica color',          'Color'),
  G('g33', '558971087_17891704452345251_5418694123345560692_n_3_11zon.webp',  'Resultado alisado',      'Tratamientos'),
  G('g34', '560576716_17892384222345251_7254893308573367859_n_4_11zon.webp',  'Highlights',             'Color'),
  G('g35', '562978416_17899089945345251_7053797517031650051_n_5_11zon.webp',  'Estilo definitivo',      'Corte'),
  G('g36', '565041625_17892940251345251_7241160546382355240_n_6_11zon.webp',  'Tonos rubios',           'Color'),
  G('g37', '576579956_17896095672345251_4026146364305782675_n_7_11zon.webp',  'Corte y peinado',        'Corte'),
  G('g38', '583729779_17896741059345251_6499206597612808248_n_8_11zon.webp',  'Tratamiento brillo',     'Tratamientos'),
  G('g39', '584319203_17897061552345251_7843133025883705524_n_9_11zon.webp',  'Mechas finas',           'Color'),
  G('g40', '587645584_17897484435345251_8449910593676596082_n_10_11zon.webp', 'Resultado natural',      'Corte'),
  G('g41', '587890192_17898402474345251_8194834408972059895_n_1_11zon.webp',  'Balayage caramelo',      'Color'),
  G('g42', '598137587_17899532538345251_1910834724723632829_n_2_11zon.webp',  'Corte bob liso',         'Corte'),
  G('g43', '604392783_17900727498345251_4152146251467466654_n_3_11zon.webp',  'Color vibrante',         'Color'),
  G('g44', '619898757_17904244695345251_5192105155785642402_n_4_11zon.webp',  'Estilo ondulado',        'Corte'),
  G('g45', '621513586_17904482784345251_5259386822732937136_n_5_11zon.webp',  'Nutrición capilar',      'Tratamientos'),
  G('g46', '623095073_17905528272345251_7226850774660299606_n_6_11zon.webp',  'Color luminoso',         'Color'),
  G('g47', '626296687_17906323050345251_4500384965311275525_n_7_11zon.webp',  'Corte moderno',          'Corte'),
  G('g48', '626793981_17905935735345251_5110845411881018963_n_8_11zon.webp',  'Balayage y forma',       'Color'),
  G('g49', '639492507_17908258413345251_8932891077601911447_n_9_11zon.webp',  'Hidratación y brillo',   'Tratamientos'),
  G('g50', '639814250_17909269548345251_2891293347582700182_n_10_11zon.webp', 'Corte en capas',         'Corte'),
  G('g51', '641328362_17908955739345251_3618478803859562376_n_11_11zon.webp', 'Babylights',             'Color'),
  G('g52', '643566725_17910004446345251_6882107116226370791_n_12_11zon.webp', 'Estilo clásico',         'Corte'),
  G('g53', '654013292_17912125779345251_3233272375405857171_n_13_11zon.webp', 'Color profundo',         'Color'),
  G('g54', '656279620_17913433632345251_4905084951933108788_n_14_11zon.webp', 'Tratamiento alisado',    'Tratamientos'),
  G('g55', '657279559_17913607254345251_6194552253867419377_n_1_11zon.webp',  'Corte y volumen',        'Corte'),
  G('g56', '657793184_17914132998345251_8317742898041505453_n_2_11zon.webp',  'Mechas y color',         'Color'),
  G('g57', '670183837_17916947652345251_3055870547416448032_n_3_11zon.webp',  'Coloración completa',    'Color'),
  G('g58', '670272126_17916947655345251_2167683000337036081_n_4_11zon.webp',  'Corte definitivo',       'Corte'),
  G('g59', '670668383_17922104475345251_3407703863530989565_n_5_11zon.webp',  'Color y brillo',         'Color'),
  G('g60', '671260714_17917408578345251_2391417951895553459_n_6_11zon.webp',  'Hidratación shine',      'Tratamientos'),
  G('g61', '674379574_17918749563345251_1856083796498042783_n_7_11zon.webp',  'Corte limpio',           'Corte'),
  G('g62', '684930614_17920492215345251_3707199759623357610_n_8_11zon.webp',  'Tonos tierra',           'Color'),
  G('g63', '689263464_17920954512345251_446867593742996824_n_9_11zon.webp',   'Balayage rubio',         'Color'),
  G('g64', '701914667_17922769545345251_8053386365811666363_n_10_11zon.webp', 'Tratamiento progresivo', 'Tratamientos'),
  G('g65', '711630945_17925095157345251_2997818346034302124_n_11_11zon.webp', 'Corte bob moderno',      'Corte'),
  G('g66', '714716816_17925455379345251_9076292640113397866_n_12_11zon.webp', 'Color y mechas',         'Color'),
  G('g67', '722811012_17927375208345251_185932414095084365_n_13_11zon.webp',  'Estilo oscuro',          'Color'),
  G('g68', '722811016_17927375190345251_9181674774897569617_n_14_11zon.webp', 'Corte definido',         'Corte'),
  G('g69', '723988198_17927375217345251_4391557081140218318_n_15_11zon.webp', 'Nutrición y volumen',    'Tratamientos'),
  G('g70', '727772862_17928131784345251_7116847416517166193_n_16_11zon.webp', 'Coloración vibrante',    'Color'),
  G('g71', '729141093_17928489798345251_164485359652923963_n_17_11zon.webp',  'Resultado impecable',    'Corte'),
  G('g72', 'foto1_18_11zon.webp',                                             'Estilo final',           'Corte'),
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
