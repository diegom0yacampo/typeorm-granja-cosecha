// Ejecuta SQL contra la base del .env.example usando el paquete pg (no hace falta psql).
//   node scripts/sql.mjs -f sql/granja-cosecha.sql   -> ejecuta un archivo .sql
//   node scripts/sql.mjs 'SELECT * FROM "GRANJA"'    -> ejecuta una consulta y la muestra como tabla
import { readFileSync } from "node:fs";
import pg from "pg";

const client = new pg.Client({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "repaso-typescript",
});

const args = process.argv.slice(2);
const sql = args[0] === "-f" ? readFileSync(args[1], "utf8") : args.join(" ");

function printTable(rows, fields) {
  const cols = fields.map((f) => f.name);
  const cells = rows.map((r) => cols.map((c) => String(r[c] ?? "NULL")));
  const widths = cols.map((c, i) => Math.max(c.length, ...cells.map((row) => row[i].length)));
  const line = (vals) => " " + vals.map((v, i) => v.padEnd(widths[i])).join(" | ");
  console.log(line(cols));
  console.log(widths.map((w) => "-".repeat(w + 2)).join("+"));
  cells.forEach((row) => console.log(line(row)));
  console.log(`(${rows.length} ${rows.length === 1 ? "fila" : "filas"})`);
}

await client.connect();
try {
  const result = await client.query(sql);
  const last = Array.isArray(result) ? result[result.length - 1] : result;
  if (last.fields && last.fields.length) printTable(last.rows, last.fields);
  else console.log(args[0] === "-f" ? `OK: ${args[1]} ejecutado` : `${last.command} ${last.rowCount ?? ""}`);
} finally {
  await client.end();
}
