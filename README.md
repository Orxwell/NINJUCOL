# NINJUCOL

Sitio web de **NINJUCOL**, orientado a presentar información institucional, dar visibilidad a campañas y noticias, y facilitar el contacto y la participación de personas y organizaciones interesadas en la fundación.

> **Estado del proyecto:** repositorio con páginas web estáticas y una hoja de ruta de funcionalidades adicionales. Las funciones administrativas y de servidor descritas en la planificación no deben considerarse implementadas sin verificar su código.

---

## Contenido del sitio:

El repositorio organiza las rutas del sitio en archivos EJS dependientes de componentes, dependiendo de si el cliente necesita un token de acceso (`auth_token`) o si la plantilla es utilizada como recurso de un servicio:

### Rutas públicas:

*Método GET:*

| Ruta | `req.cookies` | `req.query` | `req.body` | `req.params` | Plantilla  | Propósito |
| --- | --- | --- | --- | --- | --- | --- |
| / | N/A | N/A | N/A | N/A | `home.public.ejs` | Inicio |
| /about_us | N/A | N/A | N/A | N/A | `about_us.public.ejs` | Acerca de nosotros |
| /news | N/A | error=optional | N/A | N/A | `news.public.ejs` | Área de noticias |
| /news/new | N/A | uuid=required | N/A | N/A | `news.public.ejs` | Noticia detallada |
| /campaigns | N/A | N/A | N/A | N/A | `campaigns.public.ejs` | Área de campañas |
| /repository | N/A | N/A | N/A | N/A | `repository.public.ejs` | Área de recursos |
| /join_us | N/A | N/A | N/A | N/A | `join_us.public.ejs` | Únete en nuestras misiones |
| /sign_in | auth_token=optional | error=optional | N/A | N/A | `join_us.public.ejs` | Únete en nuestras misiones |
| /api | N/A | N/A | N/A | N/A | `response` | Muestra las rutas accesibles |
| /api/:route | N/A | N/A | N/A | route=required | `response` | Muestra las rutas accesibles |
| /api/:route/:to | N/A | N/A | N/A | route=required to=required | `response` | Muestra las rutas accesibles |
| /api/:route/:to/:file | N/A | N/A | N/A | route=required to=required file=required | `response` | Devuelve el recurso solicitado |

*Método POST:*

| Ruta | `req.cookies` | `req.query` | `req.body` | `req.params` | Respuesta  | Propósito |
| --- | --- | --- | --- | --- | --- | --- |
| /sign_up | N/A | N/A | firstname=required lastname=required birthdate=required phone=required email=required password=required | N/A | Error/'OK 200' | Registrar cuentas |
| /sign_in | N/A | N/A | email=required password=required | N/A | Error/Redirect | Autenticar cuentas |
| /sign_out | auth_token=required | N/A | N/A | N/A | Error/Redirect | Revocar acceso a cuentas |

### Rutas privadas:

*Método GET:*

| Ruta | `req.cookies` | `req.query` | `req.body` | `req.params` | Plantilla  | Propósito |
| --- | --- | --- | --- | --- | --- | --- |
| /dashboard | auth_token=required | info=optional | N/A | N/A | `dashboard.private.ejs` | Panel de administración |
| /dashboard/add/new | auth_token=required| N/A | N/A | N/A | `add_new.private.ejs` | Crear noticia |
| /dashboard/upd/new | auth_token=required | uuid=required | N/A | N/A | `upd_new.private.ejs` | Actualizar noticia |
| /dashboard/add/campaign | auth_token=required| N/A | N/A | N/A | `add_campaign.private.ejs` | Crear campaña |
| /dashboard/upd/campaign | auth_token=required | uuid=required | N/A | N/A | `upd_campaign.private.ejs` | Actualizar campaña |
| /dashboard/add/repository | auth_token=required| N/A | N/A | N/A | `add_repository.private.ejs` | Crear recurso |
| /dashboard/upd/repository | auth_token=required | uuid=required | N/A | N/A | `upd_repository.private.ejs` | Actualizar recurso |
| /api/:route/:to | auth_token=optional | N/A | N/A | route=required to=required | `response` | Muestra las rutas accesibles |
| /api/:route/:to/:file | auth_token=optional | N/A | N/A | route=required to=required file=required | `response` | Devuelve el recurso solicitado |

*Método POST:*

| Ruta | `req.cookies` | `req.query` | `req.body` | `req.params` | Respuesta  | Propósito |
| --- | --- | --- | --- | --- | --- | --- |
| /dashboard/add/new | auth_token=required | N/A | title=required author=required resume=required description=required video_url=optional resource=required | N/A | Error/Redirect | Crear noticia |
| /dashboard/del/new | auth_token=required | uuid=required | N/A | N/A | Error/Redirect | Eliminar noticia |
| /dashboard/upd/new | auth_token=required | uuid=required | title=required author=required resume=required description=required video_url=optional resource=required | N/A | Error/Redirect | Actualizar noticia |
| /dashboard/add/campaign | auth_token=required | N/A | title=required description=required resource=required | N/A | Error/Redirect | Crear campaña |
| /dashboard/del/campaign | auth_token=required | uuid=required | N/A | N/A | Error/Redirect | Eliminar campaña |
| /dashboard/upd/campaign | auth_token=required | uuid=required | title=required description=required resource=required | N/A | Error/Redirect | Actualizar campaña |
| /dashboard/add/repository | auth_token=required | N/A | title=required description=required resource=required | N/A | Error/Redirect | Crear recurso |
| /dashboard/del/repository | auth_token=required | uuid=required | N/A | N/A | Error/Redirect | Eliminar recurso |
| /dashboard/upd/repository | auth_token=required | uuid=required | title=required description=required resource=required | N/A | Error/Redirect | Actualizar recurso |

---

## Tecnologías:

### Front-End:

- **EJS:** plantillas para las vistas y componentes.
- **CSS:** estilos visuales.
- **JSVanilla:** scripts del lado del navegador.

### Back-End:

- **ECMAScript:** lenguaje de programación del servidor.
- **NodeJS:** Entorno de ejecución de ExpressJS.
- **ExpressJS:** Framework sobre NodeJS para construir aplicaciones web y APIs REST.

---

>[NOTE] La estructura publicada no muestra todos los archivos del Front-End, sólo son ejemplos; el Back-End es más fidedigno al puesto en producción.

## Estructura del repositorio

```text
NINJUCOL/
├ .vscode/
├ node_modules/ # oculto
├ server/
│ ├ src/
│ │ ├ controllers/
│ │ │ ├ handler.controller.mjs
│ │ │ ├ mailer.controller.mjs
│ │ │ └ mongodb.controller.mjs
│ │ ├ importers/
│ │ │ ├ env.importer.mjs
│ │ │ └ mongodb.importer.mjs
│ │ ├ middlewares/
│ │ │ ├ body.middleware.mjs
│ │ │ ├ handler.middleware.mjs
│ │ │ ├ query.middleware.mjs
│ │ │ └ route.middleware.mjs
│ │ ├ routers/
│ │ │ ├ about_us.router.mjs
│ │ │ ├ api.router.mjs
│ │ │ ├ campaigns.router.mjs
│ │ │ ├ dashboard.router.mjs
│ │ │ ├ error.router.mjs
│ │ │ ├ forms.router.mjs
│ │ │ ├ handler.router.mjs
│ │ │ ├ home.router.mjs
│ │ │ ├ join_us.router.mjs
│ │ │ ├ news.router.mjs
│ │ │ ├ repository.router.mjs
│ │ │ └ sign.router.mjs
│ │ ├ services/
│ │ │ ├ account.service.mjs
│ │ │ ├ campaign.service.mjs
│ │ │ ├ donation.service.mjs
│ │ │ ├ handler.service.mjs
│ │ │ ├ mailer.service.mjs
│ │ │ ├ new.service.mjs
│ │ │ ├ repository.service.mjs
│ │ │ └ token.service.mjs
│ │ ├ utils/
│ │ │ ├ functions.util.mjs
│ │ │ ├ paths.util.mjs
│ │ │ └ templates.util.mjs
│ │ ├ app.mjs
│ │ ├ bootstrap.mjs
│ │ └ server.mjs
│ ├ static/
│ │ ├ css/
│ │ │ ├ components/
│ | │ | ├ [...].component.css
│ | │ | ├ bar.component.css
│ | │ | ├ donation.component.css
│ | │ | ├ footer.component.css
│ | │ | ├ instagram_feed.component.css
│ | │ | └ sign_in.component.css
│ │ │ │ └ top.component.css
│ │ │ ├ errors/
│ │ │ │ ├ at_post.error.css
│ │ │ │ └ at_get.error.css
│ │ │ ├ private/
│ │ │ │ └ dashboard.private.css
│ │ │ └ public/
│ │ │   ├ about_us.public.css
│ │ │   ├ campaigns.public.css
│ │ │   ├ home.public.css
│ │ │   ├ join_us.public.css
│ │ │   ├ news.public.css
│ │ │   ├ repository.public.css
│ │ │   ├ reset.public.css
│ │ │   ├ sign_in.public.css
│ │ │   └ styles.public.css
│ │ ├ ico/
│ │ │ ├ errors/
│ │ │ | └ [...].error.ico
│ │ │ ├ private/
│ │ │ | └ [...].private.ico
│ │ │ └ public/
│ │ │   └ favicon.public.ico
│ │ ├ js/
│ │ │ ├ errors/
│ │ | | └ [...].error.js
│ │ │ ├ private/
│ │ │ | └ multipart.private.js
│ │ │ └ public/
│ │ │   ├ alt_nav.public.js
│ │ │   ├ checkbox.public.js
│ │ │   ├ scroll.public.js
│ │ │   └ theme_toggle.public.js
│ │ ├ pdf/
│ │ │ ├ errors/
│ │ | | └ [...].error.png
│ │ │ ├ private/
│ │ | | └ [...].private.pdf
│ │ │ └ public/
│ │ |   └ [...].public.pdf
│ │ ├ png/
│ │ │ ├ errors/
│ │ | | └ [...].error.png
│ │ │ ├ private/
│ │ | | └ [...].private.png
│ │ │ └ public/
│ │ |   └ [...].public.png
│ │ ├ wav/
│ │ │ ├ errors/
│ │ | | └ [...].error.wav
│ │ │ ├ private/
│ │ | | └ [...].private.wav
│ │ │ └ public/
│ │ |   └ [...].public.wav
│ │ └ webp/
│ │   ├ errors/
│ │   | └ [...].error.webp
│ │   ├ private/
│ │   | └ [...].private.webp
│ │   └ public/
│ │     └ [...].public.webp
│ └ views/
│   ├ components/
│   │ ├ [...].component.ejs
│   │ ├ bar.component.ejs
│   │ ├ donation.component.ejs
│   │ ├ footer.component.ejs
│   │ ├ instagram_feed.component.ejs
│   │ ├ links.component.ejs
│   │ ├ scripts.component.ejs
│   │ └ top.component.ejs
│   ├ errors/
│   │ ├ at_post.error.ejs
│   │ └ at_get.error.ejs
│   ├ mails/
│   │ └ sign_in.mail.ejs
│   ├ private/
│   │ ├ add_campaign.private.ejs
│   │ ├ add_new.private.ejs
│   │ ├ add_repository.private.ejs
│   │ ├ dashboard.private.ejs
│   │ ├ upd_campaign.private.ejs
│   │ ├ upd_new.private.ejs
│   │ └ upd_repository.private.ejs
│   └ public/
│     ├ about_us.public.ejs
│     ├ campaign.public.ejs
│     ├ home.public.ejs
│     ├ join_us.public.ejs
│     ├ new.public.ejs
│     ├ news.public.ejs
│     ├ repository.public.ejs
│     └ sign_in.public.ejs
├ .env # oculto
├ .gitignore # oculto
├ package.json
├ pnpm-lock.yaml # oculto
├ pnpm-workspace.yaml # oculto
└ README.md
```

---

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

---

## Arquitectura de enrutamiento (documentación de diseño)

El documento **Enrutamiento.docx** (13 de octubre de 2026) especifica rutas HTTP, vistas EJS y contratos de datos para una evolución del sitio hacia una aplicación con backend. **Esta sección documenta el diseño previsto, no confirma que las rutas ya estén implementadas en el repositorio estático.**

---

La vista `/dashboard` utiliza `dashboard.private.ejs` y recibe `data.news[]`, `data.campaigns[]` y `data.repository[]`, cada elemento con su `uuid` y sus respectivos campos de contenido.

| Operación | Noticias | Campañas | Repositorio |
| --- | --- | --- | --- |
| Crear | `/dashboard/add/new` | `/dashboard/add/campaign` | `/dashboard/add/repository` |
| Eliminar | `/dashboard/del/new?uuid=UUID` | `/dashboard/del/campaign?uuid=UUID` | `/dashboard/del/repository?uuid=UUID` |
| Actualizar | `/dashboard/upd/new?uuid=UUID` | `/dashboard/upd/campaign?uuid=UUID` | `/dashboard/upd/repository?uuid=UUID` |

Cada ruta de gestión tiene una vista EJS privada con el nombre de la operación, por ejemplo `add_new.private.ejs` o `upd_repository.private.ejs`. Las vistas de actualización reciben el objeto correspondiente (`new`, `campaign` o `repository`) con los campos existentes.

## Contribuciones

Las mejoras pueden proponerse mediante *issues* o *pull requests*, de acuerdo con los permisos y las reglas de colaboración del repositorio.

Para contribuir:

1. Crea una rama a partir de `main`.
2. Realiza cambios pequeños y documentados.
3. Comprueba las páginas modificadas en un navegador.
4. Propón la integración de tus cambios mediante una *pull request* cuando esté habilitada.

---

## Licencia

Este proyecto se distribuye bajo la **licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para conocer sus términos.
