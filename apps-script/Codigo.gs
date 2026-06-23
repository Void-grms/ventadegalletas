/**
 * Registro de pedidos de galletas en Google Sheets.
 *
 * Cómo usarlo:
 * 1. Crea una Google Sheet y copia su ID (lo que va entre /d/ y /edit en la URL).
 * 2. Pega ese ID en SHEET_ID.
 * 3. Implementar → Nueva implementación → Tipo: App web
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier usuario
 * 4. Copia la URL que termina en /exec y pégala en src/config/site.ts (SHEET_ENDPOINT).
 *
 * La web envía un POST con Content-Type text/plain (JSON en el cuerpo) para evitar
 * el preflight CORS, que Apps Script no soporta.
 */

// ⬇️ Pega aquí el ID de tu Google Sheet.
const SHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_SHEET';
const SHEET_NAME = 'Pedidos';

const HEADERS = [
  'Fecha/hora', 'Producto', 'Cantidad', 'Sabor', 'Total (S/)',
  'Pedido para', 'Cliente', 'Teléfono', 'Distrito', 'Entrega',
];

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      data.producto || '',
      data.cantidad || '',
      data.sabor    || '',
      data.total    || '',
      data.vendedor || '',
      data.nombre   || '',
      data.telefono || '',
      data.distrito || '',
      data.entrega  || '',
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Permite abrir la URL /exec en el navegador para comprobar que está publicada.
function doGet() {
  return json_({ ok: true, status: 'Endpoint de pedidos activo' });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
