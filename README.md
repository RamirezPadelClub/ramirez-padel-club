# Complejo Ramirez Padel Club

Página web del Complejo Ramirez Padel Club (General Ramírez, Entre Ríos).

- `index.html`: el complejo (inicio, buffet, clases, torneos, fotos, reservas)
- `sitio-tour/`: página del Ramirez Pádel Tour, que va aparte (otro proyecto de Cloudflare Pages, ramirezpadeltour.pages.dev, con `sitio-tour` como carpeta de salida). En el sitio del Complejo, /tour redirige allá.

Es un sitio estático: no necesita build. Se publica en Cloudflare Pages (cuenta del complejo) en https://ramirezpadelclub.com.ar cada vez que se sube un cambio a `main`.

Las inscripciones usan Google Apps Script (`inscripciones/Codigo.gs`) y la planilla "INSCRIPCIONES A TORNEOS", las dos en la cuenta de Google del complejo.
