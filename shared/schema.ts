import { pgTable, text, serial, integer, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // 'admin', 'loja', 'restaurante'
  name: text("name").notNull(),
  active: boolean("active").default(true),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").default(true),
});

// Colors table
export const colors = pgTable("colors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hexCode: text("hex_code").notNull(),
  active: boolean("active").default(true),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  images: text("images").array(), // Array of image URLs
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  availableColors: integer("available_colors").array(), // Array of color IDs
  active: boolean("active").default(true),
});

// Pricing tables
export const pricingTables = pgTable("pricing_tables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  multiplier: decimal("multiplier", { precision: 5, scale: 4 }).notNull(), // Percentage multiplier
  userType: text("user_type").notNull(), // 'loja' or 'restaurante'
  active: boolean("active").default(true),
});

// Promotions table
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  active: boolean("active").default(true),
  createdAt: text("created_at").notNull(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  userType: text("user_type"), // null for all users, or specific user type
  active: boolean("active").default(true),
  createdAt: text("created_at").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertColorSchema = createInsertSchema(colors).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertPricingTableSchema = createInsertSchema(pricingTables).omit({ id: true });
export const insertPromotionSchema = createInsertSchema(promotions).omit({ id: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Color = typeof colors.$inferSelect;
export type InsertColor = z.infer<typeof insertColorSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type PricingTable = typeof pricingTables.$inferSelect;
export type InsertPricingTable = z.infer<typeof insertPricingTableSchema>;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// Cart item type
export const cartItemSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  colorId: z.number(),
  colorName: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  totalPrice: z.number(),
  image: z.string().optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
