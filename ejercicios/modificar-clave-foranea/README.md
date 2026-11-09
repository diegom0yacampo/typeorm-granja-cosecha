# Modificar la clave foránea de una cosecha

La clave foránea es `ID_GRANJA`, que indica a qué granja pertenece cada cosecha.
Con un PATCH en `/cosechas/:id/granja` se manda el ID de la granja nueva en `principalId`.
El Service hace `set({ granja: { id: principalId } })` y TypeORM traduce la propiedad `granja` a la columna `ID_GRANJA`.
La cosecha mantiene su ID y, al listar por granja, deja de salir en la antigua y aparece en la nueva.

```bash
curl -i -X PATCH "$API/cosechas/$REGISTRO/granja" -H 'Content-Type: application/json' -d '{"principalId":2}'
curl -i "$API/cosechas/granja/2"
```
