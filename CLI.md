CLI del servidor (por el momento):

# Comandos

## Middleware

Para llamar al comando, usa: `server> middleware`

> [!NOTE]
> `app.mjs` maneja middlewares globales, a diferencia de cada router, cada clúster de métodos y cada ruta.

Al llamar al comando, te retorna todos los enrutadores, con sus métodos y sus rutas, y también qué middlewares están unidos a ellos, como en este ejemplo:

```text
app
├ audit (global: primero en ver la request)
└ router
  ├ HOME
  │ └ GET
  │   └ "/"
  │     ├ ratelimit (enrutado: primero en ver la request)
  │     └ query
  └ SIGN
    ├ GET
    │ └ "/sign/in"
    │   ├ ratelimit
    │   └ query
    └ POST
      └ "/sign/in"
        ├ ratelimit
        ├ query
        └ body
```

---

### Argumentos, *middleware*:
  - Ejemplo:
    **`middleware`** _`:router`_ _`:method`_ _`:path`_ _`:middlewares`_

_`:router`_: **Especifica qué enrutado quieres afectar.**

> [!NOTE]
> Si no se especifíca, afecta a todos los enrutadores, para manejar los middlewares globales de `app.mjs` se usa un `*`; majear middlewares globales inhabilita los argumentos _`:method`_ y _`:path`_.

_`:method`_: **Especifica a qué métodos quieres afectar.**

> [!NOTE]
> Si no se especifíca, afecta a todos los métodos.

_`:path`_: **Especifica a qué rutas quieres afectar.**

> [!NOTE]
> Si no se especifíca, afecta a todas las rutas; para que este argumento tenga efecto se necesita especificar por lo menos el argumento _`:method`_.

_`:middleware`_: **Especifica a qué middlewares quieres afectar, puedes especificar una lista o simplemente anotar uno.**

> [!NOTE]
> Si no se especifíca, afecta a todos los middlewares.

---

### Ejemplos, *middleware*:

> `>middleware stop`\
> Detén todos los middlewares de todos los enrutadores.

> `>middleware router=* stop`\
> Detén todos los middlewares globales.

> `>middleware router=* middleware=audit stop`\
> Detén el **middleware `audit`** global.

> `>middleware router=HOME stop`\
> Detén todos los middlewares del enrutador HOME.

> `>middleware router=[HOME, SIGN] stop`\
> Detén todos los middlewares de los enrutadores especificados.

> `>middlewares method=GET stop`\
> Detén todos los middlewares de los métodos GET de todos los enrutadores.

> `>middlewares method=[GET, POST] stop`\
> Detén todos los middlewares de los métodos especificados de todos los enrutadores.

> `>middlewares path="/" stop`\
> Detén todos los middlewares de ese ruta.

> `>middlewares path=["/", "/sign"] stop`\
> Detén todos los middlewares de las rutas especificadas.

> `>middlewares middleware=query stop`\
> Detén el **middleware `query`** de todos los enrutadores, si no tienen ese middleware entonces se omite puntualmente.

> `>middlewares middleware=[query, sign] stop`\
> Detén los middlewares especificados de todos los enrutadores, si no tienen ese middleware entonces se omite puntualmente.

> `>middlewares router=HOME method=GET stop`\
> Detén todos los middlewares de ese enrutador que usen ese método.

> `>middlewares router=[HOME, SIGN] method=GET stop`\
> Detén todos los middlewares de los enrutadores especificados que usen ese método.

> `>middlewares router=HOME method=[GET, POST] stop`\
> Detén todos los middlewares de ese enrutador que usen ese los métodos especificados.

> `>middlewares router=[HOME, SIGN] method=[GET, POST] stop`\
> Detén todos los middlewares de los enrutadores especificados que usen los métodos especificados.

> `>middlewares router=HOME method=GET path="/" stop`\
> Detén todos los middlewares de ese enrutador que usen ese método en esa ruta, si la ruta no existe se omite puntualmente.

> `>middlewares router=[HOME, SIGN] method=GET path="/" stop`\
> Detén todos los middlewares de los enrutadores especificados que usen ese método en esa ruta, si la ruta no existe se omite puntualmente.

> `>middlewares router=HOME method=[GET, POST] path="/" stop`\
> Detén todos los middlewares de ese enrutador que usen los métodos especificados en esa ruta, si la ruta no existe se omite puntualmente.

> `>middlewares router=HOME method=GET path=["/", "/sign"] stop`\
> Detén todos los middlewares de ese enrutador que usen ese método en las rutas especificadas, si la ruta no existe se omite puntualmente.

> `>middlewares router=[HOME, SIGN] method=[GET, POST] path="/" stop`\
> Detén todos los middlewares de los enrutadores especificados que usen los métodos especificos en esa ruta, si la ruta no existe se omite puntualmente.

> `>middlewares router=HOME method=[GET, POST] path=["/", "/sign"] stop`\
> Detén todos los middlewares de ese enrutador que usen los métodos especificos en las rutas especificadas, si la ruta no existe se omite puntualmente.
