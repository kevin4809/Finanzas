// Categorías predefinidas para gastos personales
export const CATEGORIAS_GASTOS = {
  alimentacion: {
    nombre: "Alimentación",
    icono: "🍽️",
    color: "#10b981"
  },
  transporte: {
    nombre: "Transporte",
    icono: "🚗",
    color: "#3b82f6"
  },
  vivienda: {
    nombre: "Vivienda",
    icono: "🏠",
    color: "#8b5cf6"
  },
  salud: {
    nombre: "Salud",
    icono: "💊",
    color: "#ef4444"
  },
  entretenimiento: {
    nombre: "Entretenimiento",
    icono: "🎮",
    color: "#f59e0b"
  },
  ropa: {
    nombre: "Ropa",
    icono: "👕",
    color: "#ec4899"
  },
  educacion: {
    nombre: "Educación",
    icono: "📚",
    color: "#6366f1"
  },
  regalos: {
    nombre: "Regalos",
    icono: "🎁",
    color: "#14b8a6"
  },
  trabajo: {
    nombre: "Trabajo",
    icono: "💼",
    color: "#0891b2"
  },
  otros: {
    nombre: "Otros",
    icono: "💰",
    color: "#64748b"
  }
};

// Categorías predefinidas para obligaciones
export const CATEGORIAS_OBLIGACIONES = {
  arriendo: {
    nombre: "Arriendo/Hipoteca",
    icono: "🏠",
    color: "#dc2626"
  },
  servicios: {
    nombre: "Servicios Públicos",
    icono: "⚡",
    color: "#ea580c"
  },
  deudas: {
    nombre: "Deudas/Créditos",
    icono: "💳",
    color: "#991b1b"
  },
  seguros: {
    nombre: "Seguros",
    icono: "🛡️",
    color: "#b91c1c"
  },
  suscripciones: {
    nombre: "Suscripciones",
    icono: "📱",
    color: "#c2410c"
  },
  otros: {
    nombre: "Otros",
    icono: "📋",
    color: "#7f1d1d"
  }
};

// Helper para obtener categorías según tipo
export const obtenerCategoriasPorTipo = (tipo) => {
  return tipo === 'obligaciones' ? CATEGORIAS_OBLIGACIONES : CATEGORIAS_GASTOS;
};

// Helper para obtener info de una categoría
export const obtenerInfoCategoria = (tipo, categoriaKey) => {
  const categorias = obtenerCategoriasPorTipo(tipo);
  return categorias[categoriaKey] || categorias.otros;
};
