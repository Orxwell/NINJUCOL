# NINJUCOL

Sitio web de **NINJUCOL**, orientado a presentar información institucional, dar visibilidad a campañas y noticias, y facilitar el contacto y la participación de personas y organizaciones interesadas en la fundación.

> **Estado del proyecto:** repositorio con páginas web estáticas y una hoja de ruta de funcionalidades adicionales. Las funciones administrativas y de servidor descritas en la planificación no deben considerarse implementadas sin verificar su código.

## Contenido del sitio

El repositorio organiza las secciones del sitio en archivos HTML independientes:

| Archivo | Sección |
| --- | --- |
| `home.html` | Inicio |
| `about_us.html` | Acerca de nosotros |
| `campaigns.html` | Campañas |
| `news.html` | Noticias |
| `join_us.html` | Participación / únete |
| `repository.html` | Repositorio de contenido |

## Tecnologías

- **HTML:** estructura de las páginas.
- **CSS:** estilos y presentación visual.
- **JavaScript:** scripts del lado del navegador.
- **SVG:** recursos gráficos vectoriales.

La estructura publicada no muestra todos los archivos del Front-End, sólo son ejemplos; el Back-End es más fidedigno al puesto en producción.

## Estructura del repositorio

```text
NINJUCOL/
├── .vscode/
├── node_modules/ # oculto
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── handler.controller.mjs
│   │   │   ├── mailer.controller.mjs
│   │   │   └── mongodb.controller.mjs
│   │   ├── importers/
│   │   │   ├── env.importer.mjs
│   │   │   └── mongodb.importer.mjs
│   │   ├── middlewares/
│   │   │   ├── body.middleware.mjs
│   │   │   ├── handler.middleware.mjs
│   │   │   ├── query.middleware.mjs
│   │   │   └── route.middleware.mjs
│   │   ├── routers/
│   │   │   ├── about_us.router.mjs
│   │   │   ├── api.router.mjs
│   │   │   ├── campaigns.router.mjs
│   │   │   ├── dashboard.router.mjs
│   │   │   ├── error.router.mjs
│   │   │   ├── forms.router.mjs
│   │   │   ├── handler.router.mjs
│   │   │   ├── home.router.mjs
│   │   │   ├── join_us.router.mjs
│   │   │   ├── news.router.mjs
│   │   │   ├── repository.router.mjs
│   │   │   └── sign.router.mjs
│   │   ├── services/
│   │   │   ├── account.service.mjs
│   │   │   ├── campaign.service.mjs
│   │   │   ├── donation.service.mjs
│   │   │   ├── handler.service.mjs
│   │   │   ├── mailer.service.mjs
│   │   │   ├── new.service.mjs
│   │   │   ├── repository.service.mjs
│   │   │   └── token.service.mjs
│   │   ├── utils/
│   │   │   ├── functions.util.mjs
│   │   │   ├── paths.util.mjs
│   │   │   └── templates.util.mjs
│   │   ├── app.mjs
│   │   ├── bootstrap.mjs
│   │   └── server.mjs
│   ├── static/
│   │   ├── css/
│   │   │   ├── components/
│   │   │   │   └── footer.component.css
│   │   │   ├── errors/
│   │   │   │   ├── at_post.error.ejs
│   │   │   │   └── at_get.error.ejs
│   │   │   ├── private/
│   │   │   │   └── dashboard.private.ejs
│   │   │   └── public/
│   │   │       └── home.public.css
│   │   ├── ico/
│   │   │   ├── errors/
│   │   │   ├── private/
│   │   │   └── public/
│   │   │       └── favicon.public.ico
│   │   ├── js/
│   │   │   ├── errors/
│   │   │   ├── private/
│   │   │   └── public/
│   │   │       └── scroll.public.ejs
│   │   ├── pdf/
│   │   │   ├── errors/
│   │   │   ├── private/
│   │   │   └── public/
│   │   ├── png/
│   │   │   ├── errors/
│   │   │   ├── private/
│   │   │   └── public/
│   │   ├── wav/
│   │   │   ├── errors/
│   │   │   ├── private/
│   │   │   └── public/
│   │   └── webp/
│   │       ├── errors/
│   │       ├── private/
│   │       └── public/
│   └── static/
│       ├── api/
│       ├── components/
│       │   └── footer.component.ejs
│       ├── errors/
│       │   ├── at_post.error.ejs
│       │   └── at_get.error.ejs
│       ├── mails/
│       │   └── sign_in.mail.ejs
│       ├── private/
│       │   └── dashboard.private.ejs
│       └── public/
│           └── home.public.mjs
├── .env # oculto
├── .gitignore # oculto
├── package.json
├── pnpm-lock.yaml # oculto
├── pnpm-workspace.yaml # oculto
└── README.md
```

## Objetivos y evolución del proyecto

El plan de trabajo documentado en el repositorio contempla las siguientes etapas:

1. **Reconocimiento:** identificar accesos, frontend, backend, base de datos y política de tratamiento de datos.
2. **Levantamiento de requisitos:** precisar objetivos, alcance, arquitectura e interfaz del sitio.
3. **Implementación:** desarrollar los componentes y servicios definidos.
4. **Pruebas:** validar el funcionamiento del sistema.
5. **Puesta en producción:** seleccionar alojamiento, configurar dominio, proteger credenciales y supervisar el rendimiento.

### Funcionalidades contempladas en la planificación

- Formulario de contacto para entidades interesadas en participar.
- Acceso público a novedades y acontecimientos recientes.
- Panel administrativo para gestionar publicaciones e historial de eventos.
- Avisos sobre eventos dirigidos a usuarios suscritos.
- Rutas públicas y privadas y comunicación mediante HTTPS.
- Monitorización del rendimiento y estadísticas de visitas.

**Nota:** estas características proceden de la hoja de ruta original; no se afirma que estén disponibles en la versión actual.

## Arquitectura de enrutamiento (documentación de diseño)

El documento **Enrutamiento.docx** (13 de octubre de 2026) especifica rutas HTTP, vistas EJS y contratos de datos para una evolución del sitio hacia una aplicación con backend. **Esta sección documenta el diseño previsto, no confirma que las rutas ya estén implementadas en el repositorio estático.**

### Rutas GET públicas

| Ruta | Vista EJS prevista | Datos de plantilla |
| --- | --- | --- |
| `/` | `home.public.ejs` | — |
| `/about_us` | `about_us.public.ejs` | — |
| `/news` | `news.public.ejs` | `news[]` |
| `/new?uuid=UUID` | `new.public.ejs` | `new` |
| `/campaigns` | `campaigns.public.ejs` | `campaigns[]` |
| `/repository` | `repository.public.ejs` | `repository[]` |
| `/join_us` | `join_us.public.ejs` | — |
| `/sign_in` | `sign_in.public.ejs` | — |

Las colecciones y objetos que reciben las plantillas están previstos con los siguientes campos:

- `news[]`: `uuid`, `title`, `resume`, `image_url`, `date`.
- `new`: `title`, `author`, `description`, `image_url`, `video_url`, `date`.
- `campaigns[]`: `title`, `description`, `image_url`, `date`.
- `repository[]`: `title`, `description`, `image_url`, `resource_url`, `date`.

### Rutas GET privadas

La vista `/dashboard` utiliza `dashboard.private.ejs` y recibe `data.news[]`, `data.campaigns[]` y `data.repository[]`, cada elemento con su `uuid` y sus respectivos campos de contenido.

| Operación | Noticias | Campañas | Repositorio |
| --- | --- | --- | --- |
| Crear | `/dashboard/add/new` | `/dashboard/add/campaign` | `/dashboard/add/repository` |
| Eliminar | `/dashboard/del/new?uuid=UUID` | `/dashboard/del/campaign?uuid=UUID` | `/dashboard/del/repository?uuid=UUID` |
| Actualizar | `/dashboard/upd/new?uuid=UUID` | `/dashboard/upd/campaign?uuid=UUID` | `/dashboard/upd/repository?uuid=UUID` |

Cada ruta de gestión tiene una vista EJS privada con el nombre de la operación, por ejemplo `add_new.private.ejs` o `upd_repository.private.ejs`. Las vistas de actualización reciben el objeto correspondiente (`new`, `campaign` o `repository`) con los campos existentes.

### Rutas POST y contratos de solicitud

| Endpoint | Cuerpo esperado | Autenticación documentada |
| --- | --- | --- |
| `POST /sign_in` | `{ "email": "...", "password": "..." }` | Pública |
| `POST /dashboard/add/new` | `{ "new": { ... } }` | Cookie `auth_token` |
| `POST /dashboard/upd/new?uuid=UUID` | `{ "new": { ... } }` | Cookie `auth_token` |
| `POST /dashboard/del/new?uuid=UUID` | No especificado | Cookie `auth_token` |
| `POST /dashboard/add/campaign` | `{ "campaign": { ... } }` | Cookie `auth_token` |
| `POST /dashboard/upd/campaign?uuid=UUID` | `{ "campaign": { ... } }` | Cookie `auth_token` |
| `POST /dashboard/del/campaign?uuid=UUID` | No especificado | Cookie `auth_token` |
| `POST /dashboard/add/repository` | `{ "repository": { ... } }` | Cookie `auth_token` |
| `POST /dashboard/upd/repository?uuid=UUID` | `{ "repository": { ... } }` | Cookie `auth_token` |
| `POST /dashboard/del/repository?uuid=UUID` | No especificado | Cookie `auth_token` |

Campos previstos para los cuerpos de creación y actualización:

```json
{
  "new": {
    "title": "Título",
    "author": "Autor",
    "resume": "Resumen",
    "description": "Descripción",
    "image_url": "https://example.com/image.jpg",
    "video_url": "https://example.com/video"
  }
}
```

- `campaign`: `title`, `description`, `image_url`.
- `repository`: `title`, `description`, `image_url`, `resource_url`.

**Notas de implementación:** la documentación identifica `auth_token` como una cookie con valor UUID, pero no define el proceso de validación, permisos ni las respuestas HTTP. Además, en el cuerpo de `POST /dashboard/upd/repository` aparece una discrepancia: se declara `BODY.campaign` y luego se enumeran campos `BODY.repository.*`. Es necesario confirmar el contrato definitivo antes de implementarlo. Las rutas indicadas como `/add/...`, `/del/...` y `/upd/...` en el documento se han expresado aquí con el prefijo `/dashboard` según su jerarquía.

## Contribuciones

Las mejoras pueden proponerse mediante *issues* o *pull requests*, de acuerdo con los permisos y las reglas de colaboración del repositorio.

Para contribuir:

1. Crea una rama a partir de `main`.
2. Realiza cambios pequeños y documentados.
3. Comprueba las páginas modificadas en un navegador.
4. Propón la integración de tus cambios mediante una *pull request* cuando esté habilitada.

## Licencia

Este proyecto se distribuye bajo la **licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para conocer sus términos.

## Repositorio

Desarrollado y mantenido en [GitHub — Orxwell/NINJUCOL](https://github.com/Orxwell/NINJUCOL).
