# Modificar y eliminar una cosecha

Con un PATCH en `/cosechas/:id` el Service hace `update(Cosecha).set(...)` con un `where` para cambiar solo esa cosecha.
Se puede mandar solo `kilos` o solo `nombre`: el campo que no se envía llega vacío y TypeORM no lo modifica.
Con un DELETE en `/cosechas/:id` el Service hace `delete().from(Cosecha)` filtrando por la columna `"ID"`.
En las dos respuestas `affected: 1` significa que se ha cambiado o borrado una fila.

```bash
curl -i -X PATCH "$API/cosechas/$REGISTRO" -H 'Content-Type: application/json' -d '{"kilos":175}'
curl -i -X DELETE "$API/cosechas/$REGISTRO"
curl -i "$API/cosechas"
```
