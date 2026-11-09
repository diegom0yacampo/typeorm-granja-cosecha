# Granjas y cosechas · NestJS + TypeORM + PostgreSQL

Backend con dos tablas relacionadas 1:N: una **GRANJA** (lado 1) tiene muchas **COSECHAS** (lado N).
La clave foránea es `COSECHA.ID_GRANJA → GRANJA.ID`.

```
GRANJA (ID, NOMBRE)  1 ────< N  COSECHA (ID, NOMBRE, KILOS, ID_GRANJA)
```

## Las seis funciones

| # | Función | Método y ruta | Cuerpo / parámetros | Evidencia |
|---|---------|---------------|---------------------|-----------|
| 1 | Añadir un registro | `POST /cosechas` | `{"nombre":"Cosecha de pimiento","kilos":150,"granja":{"id":1}}` | [1-anadir.txt](pruebas/evidencias/1-anadir.txt) |
| 2 | Listar registros | `GET /cosechas` | — | [2-listar.txt](pruebas/evidencias/2-listar.txt) |
| 3 | Eliminar el registro elegido | `DELETE /cosechas/:id` | `:id` de la cosecha | [3-eliminar.txt](pruebas/evidencias/3-eliminar.txt) |
| 4 | Modificar un campo conservando el ID | `PATCH /cosechas/:id` | `{"kilos":175}` (o `nombre`) | [4-modificar-campo.txt](pruebas/evidencias/4-modificar-campo.txt) |
| 5 | Modificar la clave foránea | `PATCH /cosechas/:id/granja` | `{"principalId":2}` (granja existente) | [5-modificar-clave-foranea.txt](pruebas/evidencias/5-modificar-clave-foranea.txt) |
| 6 | INNER JOIN con WHERE | `GET /cosechas/por-granja?nombre=sol` | `nombre`: texto que debe contener el nombre de la granja | [6-inner-join-where.txt](pruebas/evidencias/6-inner-join-where.txt) |

- El código está en [backend/src/cosecha/](backend/src/cosecha/) (Controller, Service y entidad) y [backend/src/granja/](backend/src/granja/).
- La función 6 hace `innerJoinAndSelect("registro.granja", "principal")` y `where("principal.nombre ILIKE :nombre")`: el filtro es sobre una columna de GRANJA y cada resultado muestra datos de las dos tablas. La evidencia incluye el JOIN completo (filas que cumplen y que no) y tres peticiones: `sol`, `monte` y `valle` (vacía).
- Modificar o borrar un ID que no existe, o cambiar a una granja que no existe, responde **404** y no toca la base.

Otras consultas del Service: `GET /cosechas/granja/:id`, `GET /cosechas/buscar?texto=`, `GET /cosechas/granja/:id/minimo/:kilos`, `GET /cosechas/resumen/granja`.

## Cómo preparar y probar

Requisitos: Node ≥ 20.19, PostgreSQL con una base `repaso-typescript` (credenciales de desarrollo en [backend/.env.example](backend/.env.example)) y Git Bash.

```bash
cd backend
npm ci
node --env-file=.env.example scripts/sql.mjs -f sql/granja-cosecha.sql   # crea las tablas y los datos de ejemplo
npm run build
npm start                                                                # http://localhost:3000
```

Con el backend arrancado, desde la raíz del repositorio:

```bash
bash pruebas/ejecutar-pruebas.sh
```

El script reinicia la base con [backend/sql/granja-cosecha.sql](backend/sql/granja-cosecha.sql), lanza los curl de las seis funciones y guarda en [pruebas/evidencias/](pruebas/evidencias/) la petición, la respuesta real (`curl -i`) y el contenido de las tablas antes y después, consultado con SQL mediante [backend/scripts/sql.mjs](backend/scripts/sql.mjs) (usa el paquete `pg`, no hace falta `psql`).

Se puede usar `psql` en lugar del script: `psql -U postgres -d repaso-typescript -f backend/sql/granja-cosecha.sql`.
