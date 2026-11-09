-- Se puede ejecutar varias veces: borra las tablas (primero la del lado N) y las vuelve a crear
DROP TABLE IF EXISTS "COSECHA";
DROP TABLE IF EXISTS "GRANJA";

-- Tabla del lado 1: cada granja tiene su ID y su nombre
CREATE TABLE "GRANJA" (
  "ID" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "NOMBRE" varchar(120) NOT NULL
);

-- Tabla del lado N: la FK ID_GRANJA indica a qué granja pertenece cada cosecha
CREATE TABLE "COSECHA" (
  "ID" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "NOMBRE" varchar(120) NOT NULL,
  "KILOS" integer NOT NULL,
  "ID_GRANJA" integer NOT NULL,
  CONSTRAINT "FK_COSECHA_GRANJA" FOREIGN KEY ("ID_GRANJA") REFERENCES "GRANJA" ("ID")
);

-- Datos de ejemplo para poder probar las rutas
INSERT INTO "GRANJA" ("NOMBRE") VALUES ('Granja del Sol'), ('Granja del Monte');

INSERT INTO "COSECHA" ("NOMBRE", "KILOS", "ID_GRANJA") VALUES
  ('Cosecha de tomate', 80, 1),
  ('Cosecha de calabaza', 220, 1),
  ('Cosecha de tomate · nuevo', 300, 2);
