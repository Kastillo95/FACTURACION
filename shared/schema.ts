import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rtn: varchar("rtn", { length: 14 }).notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  taxable: boolean("taxable").notNull().default(true),
  stock: integer("stock").default(-1), // -1 for unlimited (services)
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  clientId: varchar("client_id").references(() => clients.id).notNull(),
  clientRtn: varchar("client_rtn", { length: 14 }).notNull(),
  clientName: text("client_name").notNull(),
  subtotalExempt: decimal("subtotal_exempt", { precision: 10, scale: 2 }).notNull().default("0.00"),
  subtotalTaxable: decimal("subtotal_taxable", { precision: 10, scale: 2 }).notNull().default("0.00"),
  isv: decimal("isv", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxable: boolean("taxable").notNull().default(true),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  rtn: true,
  name: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  code: true,
  description: true,
  price: true,
  category: true,
  taxable: true,
  stock: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  clientRtn: true,
  clientName: true,
  subtotalExempt: true,
  subtotalTaxable: true,
  isv: true,
  total: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).pick({
  serviceId: true,
  description: true,
  price: true,
  quantity: true,
  subtotal: true,
  taxable: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
