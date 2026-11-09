# Añadir una cosecha y listarla

El Controller recibe un POST en `/cosechas` con el nombre, los kilos y la granja en el body, y se lo pasa al Service.
El Service usa `insert().into(Cosecha)` y `returning` para que PostgreSQL devuelva el ID de la cosecha nueva.
Después, con un GET en `/cosechas`, el Service hace `getMany()` y la cosecha aparece en la lista junto con su granja.
Antes de probar hay que crear las tablas con `backend/sql/granja-cosecha.sql`, porque `synchronize` está a `false`.

```bash
API="http://localhost:3000"
curl -i -X POST "$API/cosechas" -H 'Content-Type: application/json' -d '{"nombre":"Cosecha de pimiento","kilos":150,"granja":{"id":1}}'
curl -i "$API/cosechas"
```
