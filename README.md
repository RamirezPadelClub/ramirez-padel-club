# Complejo Ramirez Padel Club

Página web del Complejo Ramirez Padel Club (General Ramírez, Entre Ríos) y del Ramirez Pádel Tour.

- `index.html`: el complejo (inicio, buffet, clases, torneos, fotos, reservas)
- `tour.html`: Ramirez Pádel Tour (fechas, videos y ranking)

Es un sitio estático: no necesita build. Se publica en Cloudflare Pages (cuenta del complejo) en https://ramirezpadelclub.pages.dev cada vez que se sube un cambio a `main`.

Las inscripciones usan Google Apps Script (`inscripciones/Codigo.gs`) y la planilla "INSCRIPCIONES A TORNEOS", las dos en la cuenta de Google del complejo.
