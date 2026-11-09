#!/usr/bin/env bash
# Ejecuta las seis pruebas y guarda en pruebas/evidencias/ el curl, la respuesta real
# y el estado de las tablas antes y después (consultado con SQL).
# Requisitos: backend arrancado (npm start en backend/) y la base preparada con backend/sql/granja-cosecha.sql.
# Uso desde la raíz del repositorio (Git Bash):  bash pruebas/ejecutar-pruebas.sh
set -u
cd "$(dirname "$0")/.."
API="${API:-http://localhost:3000}"
OUT="pruebas/evidencias"
mkdir -p "$OUT"

sql() {  # muestra la consulta y su resultado
  echo "SQL> $1"
  (cd backend && node --env-file=.env.example scripts/sql.mjs "$1")
  echo
}
peticion() {  # muestra el curl y su respuesta real (cabeceras + cuerpo)
  local linea="\$ curl -i" a
  for a in "$@"; do
    case "$a" in -*) linea+=" $a" ;; *) linea+=" '$a'" ;; esac
  done
  echo "$linea"
  curl -s -i "$@" | tr -d '\r'
  echo; echo
}
titulo() { printf '%s\n%s\n\n' "$1" "$(printf '=%.0s' $(seq 1 ${#1}))"; }

TODAS='SELECT c."ID", c."NOMBRE", c."KILOS", c."ID_GRANJA" FROM "COSECHA" c ORDER BY c."ID"'

echo "Reiniciando la base con backend/sql/granja-cosecha.sql"
(cd backend && node --env-file=.env.example scripts/sql.mjs -f sql/granja-cosecha.sql)

# ---------------------------------------------------------------- 1
{
  titulo "1. AÑADIR UN REGISTRO  (POST /cosechas)"
  echo "Finalidad: crear una cosecha nueva enlazada con una granja existente mediante la FK ID_GRANJA."
  echo
  echo "--- ANTES ---"; sql "$TODAS"
  echo "--- PETICIÓN ---"
  peticion -X POST "$API/cosechas" -H 'Content-Type: application/json' \
    -d '{"nombre":"Cosecha de pimiento","kilos":150,"granja":{"id":1}}'
  echo "--- DESPUÉS ---"; sql "$TODAS"
  echo "Resultado: aparece la fila ID 4 'Cosecha de pimiento' con ID_GRANJA = 1."
} > "$OUT/1-anadir.txt"

# ---------------------------------------------------------------- 2
{
  titulo "2. LISTAR REGISTROS  (GET /cosechas)"
  echo "Finalidad: devolver todas las cosechas, cada una con los datos de su granja."
  echo
  echo "--- DATOS EN LA BASE ---"; sql "$TODAS"
  echo "--- PETICIÓN ---"
  peticion "$API/cosechas"
  echo "Resultado: la API devuelve las mismas 4 filas que hay en COSECHA (incluida la añadida en la prueba 1)."
} > "$OUT/2-listar.txt"

# ---------------------------------------------------------------- 3
{
  titulo "3. ELIMINAR EL REGISTRO ELEGIDO  (DELETE /cosechas/:id)"
  echo "Finalidad: borrar solo la cosecha cuyo ID va en la ruta (aquí la 2)."
  echo
  echo "--- ANTES ---"; sql "$TODAS"
  echo "--- PETICIÓN ---"
  peticion -X DELETE "$API/cosechas/2"
  echo "--- DESPUÉS ---"; sql "$TODAS"
  echo "--- Caso de error: el ID 2 ya no existe ---"
  peticion -X DELETE "$API/cosechas/2"
  echo "Resultado: affected = 1 y la fila ID 2 ya no está; el resto no cambia. Repetir el borrado da 404."
} > "$OUT/3-eliminar.txt"

# ---------------------------------------------------------------- 4
{
  titulo "4. MODIFICAR UN CAMPO CONSERVANDO EL IDENTIFICADOR  (PATCH /cosechas/:id)"
  echo "Finalidad: cambiar solo los kilos de la cosecha 4; su ID, nombre y granja se mantienen."
  echo
  echo "--- ANTES ---"; sql 'SELECT "ID", "NOMBRE", "KILOS", "ID_GRANJA" FROM "COSECHA" WHERE "ID" = 4'
  echo "--- PETICIÓN ---"
  peticion -X PATCH "$API/cosechas/4" -H 'Content-Type: application/json' -d '{"kilos":175}'
  echo "--- DESPUÉS ---"; sql 'SELECT "ID", "NOMBRE", "KILOS", "ID_GRANJA" FROM "COSECHA" WHERE "ID" = 4'
  echo "Resultado: KILOS pasa de 150 a 175 y el ID sigue siendo 4."
} > "$OUT/4-modificar-campo.txt"

# ---------------------------------------------------------------- 5
{
  titulo "5. MODIFICAR LA CLAVE FORÁNEA  (PATCH /cosechas/:id/granja)"
  echo "Finalidad: pasar la cosecha 4 de la granja 1 a la granja 2 (que existe) cambiando ID_GRANJA."
  echo
  echo "--- ANTES ---"
  sql 'SELECT * FROM "GRANJA" ORDER BY "ID"'
  sql 'SELECT c."ID", c."NOMBRE", c."ID_GRANJA", g."NOMBRE" AS "GRANJA" FROM "COSECHA" c INNER JOIN "GRANJA" g ON g."ID" = c."ID_GRANJA" WHERE c."ID" = 4'
  echo "--- PETICIÓN ---"
  peticion -X PATCH "$API/cosechas/4/granja" -H 'Content-Type: application/json' -d '{"principalId":2}'
  echo "--- DESPUÉS ---"
  sql 'SELECT c."ID", c."NOMBRE", c."ID_GRANJA", g."NOMBRE" AS "GRANJA" FROM "COSECHA" c INNER JOIN "GRANJA" g ON g."ID" = c."ID_GRANJA" WHERE c."ID" = 4'
  peticion "$API/cosechas/granja/2"
  echo "--- Caso de error: la granja 99 no existe, la FK no cambia ---"
  peticion -X PATCH "$API/cosechas/4/granja" -H 'Content-Type: application/json' -d '{"principalId":99}'
  sql 'SELECT "ID", "ID_GRANJA" FROM "COSECHA" WHERE "ID" = 4'
  echo "Resultado: la cosecha 4 conserva su ID y ahora pertenece a 'Granja del Monte' (ID_GRANJA = 2)."
} > "$OUT/5-modificar-clave-foranea.txt"

# ---------------------------------------------------------------- 6
{
  titulo "6. INNER JOIN CON WHERE  (GET /cosechas/por-granja?nombre=...)"
  echo "Finalidad: unir COSECHA con GRANJA por ID_GRANJA y quedarse solo con las cosechas"
  echo "cuya granja contiene el texto indicado (WHERE sobre GRANJA.NOMBRE, ILIKE sin distinguir mayúsculas)."
  echo
  echo "--- TODOS LOS DATOS DEL JOIN (sin WHERE): unos cumplen y otros no ---"
  sql 'SELECT c."ID", c."NOMBRE", c."KILOS", g."ID" AS "ID_GRANJA", g."NOMBRE" AS "GRANJA" FROM "COSECHA" c INNER JOIN "GRANJA" g ON g."ID" = c."ID_GRANJA" ORDER BY c."ID"'
  echo "--- MISMO JOIN CON EL WHERE: g.\"NOMBRE\" ILIKE '%sol%' ---"
  sql "SELECT c.\"ID\", c.\"NOMBRE\", c.\"KILOS\", g.\"ID\" AS \"ID_GRANJA\", g.\"NOMBRE\" AS \"GRANJA\" FROM \"COSECHA\" c INNER JOIN \"GRANJA\" g ON g.\"ID\" = c.\"ID_GRANJA\" WHERE g.\"NOMBRE\" ILIKE '%sol%' ORDER BY c.\"ID\""
  echo "--- PETICIÓN: nombre=sol ---"
  peticion "$API/cosechas/por-granja?nombre=sol"
  echo "--- PETICIÓN: nombre=monte ---"
  peticion "$API/cosechas/por-granja?nombre=monte"
  echo "--- PETICIÓN: nombre=valle (ninguna granja cumple) ---"
  peticion "$API/cosechas/por-granja?nombre=valle"
  echo "Resultado: con 'sol' solo sale la cosecha 1 (Granja del Sol); las cosechas 3 y 4 son de"
  echo "Granja del Monte y no cumplen, por eso salen con 'monte' y no con 'sol'. Con 'valle' la lista está vacía."
  echo "Cada elemento de la respuesta muestra columnas de COSECHA (id, nombre, kilos) y de GRANJA (granja.id, granja.nombre)."
} > "$OUT/6-inner-join-where.txt"

echo "Evidencias guardadas en $OUT/"
ls "$OUT"
