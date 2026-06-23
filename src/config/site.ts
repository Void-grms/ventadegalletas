export const WA_NUMBER = "51970642671";        // +51 970 642 671
export const WA_LINK = `https://wa.me/${WA_NUMBER}`;
export const WA_DISPLAY = "+51 970 642 671";  // formato legible para mostrar

// Endpoint del Web App de Google Apps Script para registrar pedidos en Google Sheets.
// Pega aquí la URL que termina en /exec tras "Implementar → Nueva implementación → App web".
// Si queda vacío, el pedido se sigue enviando por WhatsApp pero no se guarda en el Sheet.
export const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbzl6xpe0NEv__wra3yMp7LRBBkXVmg364vyj5mMNRPrU16QTXyxRQDcsnrIXVYGrPrj/exec";

export const BRAND = {
  name: "Galletas",
  tagline: "Hechas con amor",
};

// Entrega: horneamos el 23 y entregamos el 24.
export const DELIVERY = {
  date: "2026-06-24",                  // valor para <input type="date">
  label: "miércoles 24 de junio",      // texto legible
  note: "Horneamos el 23 y entregamos el 24.",
} as const;

export const NAV = [
  { label: "Inicio", href: "/", key: "home" },
  { label: "Las cajas", href: "/cajas", key: "cajas" },
  { label: "Por qué", href: "/nosotros", key: "nosotros" },
  { label: "Cómo pedir", href: "/como-pedir", key: "como" },
] as const;
