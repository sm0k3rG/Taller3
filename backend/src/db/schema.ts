import {
  mysqlTable,
  int,
  varchar,
  decimal,
  MySqlTableWithColumns,
} from "drizzle-orm/mysql-core";

export const dispositivos: MySqlTableWithColumns<any> = mysqlTable(
  "dispositivos",
  {
    id: int("ID").autoincrement().primaryKey(),
    name: varchar("NAME", { length: 100 }).notNull(),
    consumoKw: decimal("CONSUMO_KW", { precision: 3, scale: 1 }).notNull(),
  },
);

export type Dispositivo = typeof dispositivos.$inferSelect;
export type NewDispositivo = typeof dispositivos.$inferInsert;
