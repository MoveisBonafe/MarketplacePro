import { 
  users, categories, colors, products, pricingTables, promotions, announcements,
  type User, type InsertUser, type Category, type InsertCategory,
  type Color, type InsertColor, type Product, type InsertProduct,
  type PricingTable, type InsertPricingTable, type Promotion, type InsertPromotion,
  type Announcement, type InsertAnnouncement
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Colors
  getColors(): Promise<Color[]>;
  getColor(id: number): Promise<Color | undefined>;
  createColor(color: InsertColor): Promise<Color>;
  updateColor(id: number, color: Partial<InsertColor>): Promise<Color | undefined>;
  deleteColor(id: number): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Pricing Tables
  getPricingTables(): Promise<PricingTable[]>;
  getPricingTablesByUserType(userType: string): Promise<PricingTable[]>;
  createPricingTable(pricingTable: InsertPricingTable): Promise<PricingTable>;
  updatePricingTable(id: number, pricingTable: Partial<InsertPricingTable>): Promise<PricingTable | undefined>;
  deletePricingTable(id: number): Promise<boolean>;

  // Promotions
  getPromotions(): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  deletePromotion(id: number): Promise<boolean>;

  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsByUserType(userType?: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private colors: Map<number, Color> = new Map();
  private products: Map<number, Product> = new Map();
  private pricingTables: Map<number, PricingTable> = new Map();
  private promotions: Map<number, Promotion> = new Map();
  private announcements: Map<number, Announcement> = new Map();
  private currentId = 1;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Create default admin user
    await this.createUser({
      username: 'admin',
      password: 'admin123',
      userType: 'admin',
      name: 'Administrador',
      active: true
    });

    // Create demo users
    await this.createUser({
      username: 'loja',
      password: 'loja123',
      userType: 'loja',
      name: 'Usuário Loja',
      active: true
    });

    await this.createUser({
      username: 'restaurante',
      password: 'restaurante123',
      userType: 'restaurante',
      name: 'Usuário Restaurante',
      active: true
    });

    // Create default categories
    await this.createCategory({
      name: 'Banquetas',
      description: 'Banquetas de diferentes alturas e estilos',
      active: true
    });

    await this.createCategory({
      name: 'Cadeiras',
      description: 'Cadeiras para diferentes ambientes',
      active: true
    });

    await this.createCategory({
      name: 'Mesas',
      description: 'Mesas de diversos tamanhos e materiais',
      active: true
    });

    // Create default colors
    const defaultColors = [
      { name: 'Marrom Natural', hexCode: '#8B4513' },
      { name: 'Preto', hexCode: '#000000' },
      { name: 'Branco', hexCode: '#FFFFFF' },
      { name: 'Cinza', hexCode: '#808080' },
    ];

    for (const color of defaultColors) {
      await this.createColor({
        ...color,
        active: true
      });
    }

    // Create default pricing tables for lojas
    const lojaPricingTables = [
      { name: 'À Vista', description: 'Pagamento à vista', multiplier: '1.0000', userType: 'loja' },
      { name: '30 dias', description: 'Pagamento em 30 dias', multiplier: '1.1000', userType: 'loja' },
      { name: '30/60', description: 'Pagamento em 2x', multiplier: '1.1500', userType: 'loja' },
      { name: '30/60/90', description: 'Pagamento em 3x', multiplier: '1.2000', userType: 'loja' },
      { name: '30/60/90/120', description: 'Pagamento em 4x', multiplier: '1.2500', userType: 'loja' }
    ];

    for (const table of lojaPricingTables) {
      await this.createPricingTable({
        ...table,
        active: true
      });
    }

    // Create default pricing table for restaurantes
    await this.createPricingTable({
      name: 'Preço Especial',
      description: 'Preço especial para restaurantes',
      multiplier: '0.9000',
      userType: 'restaurante',
      active: true
    });

    // Create sample products
    const sampleProducts = [
      {
        name: 'Banqueta 50 cm',
        description: 'Banqueta de madeira com 50cm de altura, ideal para balcões e cozinhas',
        categoryId: 1,
        basePrice: '45.00',
        images: ['https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Banqueta+50cm'],
        availableColors: [1, 2],
        active: true
      },
      {
        name: 'Banqueta 70 cm',
        description: 'Banqueta de madeira com 70cm de altura, perfeita para bancadas altas',
        categoryId: 1,
        basePrice: '55.00',
        images: ['https://via.placeholder.com/300x300/000000/FFFFFF?text=Banqueta+70cm'],
        availableColors: [1, 2, 4],
        active: true
      }
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product);
    }

    // Create sample promotion
    await this.createPromotion({
      title: 'Promoção de Lançamento',
      description: 'Desconto especial em todas as banquetas! Aproveite nossa oferta de inauguração.',
      active: true,
      createdAt: new Date().toISOString()
    });

    // Create sample announcements
    await this.createAnnouncement({
      title: 'Bem-vindos à nossa loja!',
      message: 'Agradecemos pela preferência. Nossa equipe está pronta para atendê-los.',
      userType: null, // All users
      active: true,
      createdAt: new Date().toISOString()
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.active);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Colors
  async getColors(): Promise<Color[]> {
    return Array.from(this.colors.values()).filter(color => color.active);
  }

  async getColor(id: number): Promise<Color | undefined> {
    return this.colors.get(id);
  }

  async createColor(insertColor: InsertColor): Promise<Color> {
    const id = this.currentId++;
    const color: Color = { ...insertColor, id };
    this.colors.set(id, color);
    return color;
  }

  async updateColor(id: number, colorData: Partial<InsertColor>): Promise<Color | undefined> {
    const color = this.colors.get(id);
    if (!color) return undefined;
    const updatedColor = { ...color, ...colorData };
    this.colors.set(id, updatedColor);
    return updatedColor;
  }

  async deleteColor(id: number): Promise<boolean> {
    return this.colors.delete(id);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.active);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.active && product.categoryId === categoryId
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Pricing Tables
  async getPricingTables(): Promise<PricingTable[]> {
    return Array.from(this.pricingTables.values()).filter(table => table.active);
  }

  async getPricingTablesByUserType(userType: string): Promise<PricingTable[]> {
    return Array.from(this.pricingTables.values()).filter(
      table => table.active && table.userType === userType
    );
  }

  async createPricingTable(insertPricingTable: InsertPricingTable): Promise<PricingTable> {
    const id = this.currentId++;
    const pricingTable: PricingTable = { ...insertPricingTable, id };
    this.pricingTables.set(id, pricingTable);
    return pricingTable;
  }

  async updatePricingTable(id: number, tableData: Partial<InsertPricingTable>): Promise<PricingTable | undefined> {
    const table = this.pricingTables.get(id);
    if (!table) return undefined;
    const updatedTable = { ...table, ...tableData };
    this.pricingTables.set(id, updatedTable);
    return updatedTable;
  }

  async deletePricingTable(id: number): Promise<boolean> {
    return this.pricingTables.delete(id);
  }

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    return Array.from(this.promotions.values()).filter(promo => promo.active);
  }

  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const id = this.currentId++;
    const promotion: Promotion = { ...insertPromotion, id };
    this.promotions.set(id, promotion);
    return promotion;
  }

  async updatePromotion(id: number, promoData: Partial<InsertPromotion>): Promise<Promotion | undefined> {
    const promotion = this.promotions.get(id);
    if (!promotion) return undefined;
    const updatedPromotion = { ...promotion, ...promoData };
    this.promotions.set(id, updatedPromotion);
    return updatedPromotion;
  }

  async deletePromotion(id: number): Promise<boolean> {
    return this.promotions.delete(id);
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).filter(ann => ann.active);
  }

  async getAnnouncementsByUserType(userType?: string): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).filter(
      announcement => announcement.active && 
      (announcement.userType === null || announcement.userType === userType)
    );
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentId++;
    const announcement: Announcement = { ...insertAnnouncement, id };
    this.announcements.set(id, announcement);
    return announcement;
  }

  async updateAnnouncement(id: number, announcementData: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    if (!announcement) return undefined;
    const updatedAnnouncement = { ...announcement, ...announcementData };
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcements.delete(id);
  }
}

export const storage = new MemStorage();
