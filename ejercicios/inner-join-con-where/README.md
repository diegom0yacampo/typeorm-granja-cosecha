# INNER JOIN con WHERE

El Controller recibe un GET en `/cosechas/por-granja` y lee el nombre de la granja de la URL con `@Query("nombre")`.
El Service hace `innerJoinAndSelect("registro.granja", "principal")`, que une COSECHA con GRANJA usando la FK `ID_GRANJA`.
Después añade un `where` sobre `principal.nombre`, que es una columna de GRANJA, por eso hace falta el INNER JOIN.
`ILIKE` con `%` busca sin distinguir mayúsculas y el nombre va como parámetro `:nombre`, no metido dentro del SQL.

```bash
API="http://localhost:3000"
curl -i "$API/cosechas/por-granja?nombre=sol"
```
