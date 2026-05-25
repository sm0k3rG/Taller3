import { getDb } from "./connection";
import { dispositivos } from "./schema";

const seedData = [
  { name: "Refrigerador", consumoKw: "0.8" },
  { name: "Microondas", consumoKw: "1.2" },
  { name: "Lavadora", consumoKw: "2.0" },
  { name: "Aire Acondicionado", consumoKw: "0.7" },
  { name: "Computador de Escritorio", consumoKw: "2.7" },
  { name: "Hervidor Electrico", consumoKw: "0.3" },
];

async function seed() {
  console.log("Insertando dispositivos de prueba...");
  for (const d of seedData) {
    await getDb().insert(dispositivos).values(d);
    console.log(` ${d.name} (${d.consumoKw} kW)`);
  }
  console.log("Seed completado");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});