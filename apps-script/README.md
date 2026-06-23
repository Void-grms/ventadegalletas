# Guardar pedidos en Google Sheets (sin backend)

Los pedidos se siguen enviando por WhatsApp y, además, se registran en una Google Sheet
mediante un Web App de Google Apps Script. No hace falta servidor propio.

## 1. Crear la hoja

1. Crea una **Google Sheet** nueva (la de tu cuenta).
2. Copia su **ID** desde la URL: `https://docs.google.com/spreadsheets/d/`**`ESTE_ES_EL_ID`**`/edit`.

## 2. Pegar el script

1. Abre tu proyecto de Apps Script (el que ya tienes abierto).
2. Reemplaza el contenido de `Código.gs` por el de [`Codigo.gs`](./Codigo.gs).
3. Pega el ID de la hoja en la constante `SHEET_ID`.
4. Guarda (💾).

## 3. Implementar como App web

1. **Implementar → Nueva implementación**.
2. Tipo (engranaje) → **App web**.
3. Configura:
   - **Ejecutar como:** Yo (tu cuenta).
   - **Quién tiene acceso:** **Cualquier usuario**.
4. **Implementar** y autoriza los permisos cuando te lo pida.
5. Copia la **URL del App web** (termina en `/exec`).

> Cada vez que cambies el código debes hacer **Implementar → Gestionar implementaciones →
> editar (lápiz) → Versión: Nueva versión**, o crear una implementación nueva. Si no, sigue
> corriendo la versión vieja.

## 4. Conectar la web

Pega esa URL `/exec` en [`src/config/site.ts`](../src/config/site.ts):

```ts
export const SHEET_ENDPOINT = "https://script.google.com/macros/s/XXXXXXXX/exec";
```

Listo. Al enviar un pedido se añade una fila a la hoja **Pedidos** con:
fecha/hora, producto, cantidad, sabor, total, vendedor, cliente, teléfono, distrito y entrega.

## Probar

- Abre la URL `/exec` en el navegador: debe responder `{"ok":true,"status":"Endpoint de pedidos activo"}`.
- Haz un pedido de prueba en la web y revisa que aparezca la fila en el Sheet.

## Notas

- El envío es **best-effort**: si el Sheet falla o no hay internet, el pedido igual se abre en WhatsApp.
- Por usar `mode: 'no-cors'`, el navegador no puede leer la respuesta del script; esto es normal
  y suficiente para registrar (no se necesita leer nada de vuelta).
