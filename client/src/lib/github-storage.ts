import { githubAPI } from './github-api';
import {
  STATIC_USERS, STATIC_CATEGORIES, STATIC_COLORS, STATIC_PRODUCTS,
  STATIC_PRICING_TABLES, STATIC_PROMOTIONS, STATIC_ANNOUNCEMENTS
} from './static-data';
import type {
  User, Category, Color, Product, PricingTable, Promotion, Announcement,
  InsertUser, InsertCategory, InsertColor, InsertProduct,
  InsertPricingTable, InsertPromotion, InsertAnnouncement
} from '@shared/schema';

export class GitHubStorage {
  private currentId = 100; // Start high to avoid conflicts with static data

  // Initialize with static data if no data exists in GitHub
  async initialize() {
    try {
      // Check if data files exist, if not create them with static data
      const categories = await this.getCategories();
      if (categories.length === 0) {
        await githubAPI.saveCategories(STATIC_CATEGORIES);
      }

      const colors = await this.getColors();
      if (colors.length === 0) {
        await githubAPI.saveColors(STATIC_COLORS);
      }

      const products = await this.getProducts();
      if (products.length === 0) {
        await githubAPI.saveProducts(STATIC_PRODUCTS);
      }

      const pricingTables = await this.getPricingTables();
      if (pricingTables.length === 0) {
        await githubAPI.savePricingTables(STATIC_PRICING_TABLES);
      }

      const promotions = await this.getPromotions();
      if (promotions.length === 0) {
        await githubAPI.savePromotions(STATIC_PROMOTIONS);
      }

      const announcements = await this.getAnnouncements();
      if (announcements.length === 0) {
        await githubAPI.saveAnnouncements(STATIC_ANNOUNCEMENTS);
      }
    } catch (error) {
      console.warn('Failed to initialize GitHub storage, using static data:', error);
    }
  }

  // Users - use static data for authentication (GitHub storage not suitable for passwords)
  async getUser(id: number): Promise<User | undefined> {
    return STATIC_USERS.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return STATIC_USERS.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = { ...user, id: this.currentId++ };
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = STATIC_USERS.find(u => u.id === id);
    if (!existingUser) return undefined;
    return { ...existingUser, ...user };
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const categories = await githubAPI.loadCategories();
      return (categories as Category[]).filter(cat => cat.active);
    } catch (error) {
      console.warn('Failed to load categories from GitHub, using static data:', error);
      return STATIC_CATEGORIES.filter(cat => cat.active);
    }
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(cat => cat.id === id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const categories = await githubAPI.loadCategories();
    const newCategory: Category = { ...category, id: this.currentId++ };
    const updatedCategories = [...categories, newCategory];
    await githubAPI.saveCategories(updatedCategories);
    return newCategory;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const categories = await githubAPI.loadCategories();
    const index = categories.findIndex((cat: Category) => cat.id === id);
    if (index === -1) return undefined;
    
    const updatedCategory = { ...categories[index], ...categoryData };
    categories[index] = updatedCategory;
    await githubAPI.saveCategories(categories);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const categories = await githubAPI.loadCategories();
    const filteredCategories = categories.filter((cat: Category) => cat.id !== id);
    await githubAPI.saveCategories(filteredCategories);
    return true;
  }

  // Colors
  async getColors(): Promise<Color[]> {
    try {
      const colors = await githubAPI.loadColors();
      return colors.filter((color: Color) => color.active);
    } catch (error) {
      console.warn('Failed to load colors from GitHub, using static data:', error);
      return STATIC_COLORS.filter(color => color.active);
    }
  }

  async getColor(id: number): Promise<Color | undefined> {
    const colors = await this.getColors();
    return colors.find(color => color.id === id);
  }

  async createColor(color: InsertColor): Promise<Color> {
    const colors = await githubAPI.loadColors();
    const newColor: Color = { ...color, id: this.currentId++ };
    const updatedColors = [...colors, newColor];
    await githubAPI.saveColors(updatedColors);
    return newColor;
  }

  async updateColor(id: number, colorData: Partial<InsertColor>): Promise<Color | undefined> {
    const colors = await githubAPI.loadColors();
    const index = colors.findIndex((color: Color) => color.id === id);
    if (index === -1) return undefined;
    
    const updatedColor = { ...colors[index], ...colorData };
    colors[index] = updatedColor;
    await githubAPI.saveColors(colors);
    return updatedColor;
  }

  async deleteColor(id: number): Promise<boolean> {
    const colors = await githubAPI.loadColors();
    const filteredColors = colors.filter((color: Color) => color.id !== id);
    await githubAPI.saveColors(filteredColors);
    return true;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    try {
      const products = await githubAPI.loadProducts();
      return products.filter((product: Product) => product.active);
    } catch (error) {
      console.warn('Failed to load products from GitHub, using static data:', error);
      return STATIC_PRODUCTS.filter(product => product.active);
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(product => product.id === id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(product => product.categoryId === categoryId);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const products = await githubAPI.loadProducts();
    const newProduct: Product = { ...product, id: this.currentId++ };
    const updatedProducts = [...products, newProduct];
    await githubAPI.saveProducts(updatedProducts);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const products = await githubAPI.loadProducts();
    const index = products.findIndex((product: Product) => product.id === id);
    if (index === -1) return undefined;
    
    const updatedProduct = { ...products[index], ...productData };
    products[index] = updatedProduct;
    await githubAPI.saveProducts(products);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const products = await githubAPI.loadProducts();
    const filteredProducts = products.filter((product: Product) => product.id !== id);
    await githubAPI.saveProducts(filteredProducts);
    return true;
  }

  // Pricing Tables
  async getPricingTables(): Promise<PricingTable[]> {
    try {
      const tables = await githubAPI.loadPricingTables();
      return tables.filter((table: PricingTable) => table.active);
    } catch (error) {
      console.warn('Failed to load pricing tables from GitHub, using static data:', error);
      return STATIC_PRICING_TABLES.filter(table => table.active);
    }
  }

  async getPricingTablesByUserType(userType: string): Promise<PricingTable[]> {
    const tables = await this.getPricingTables();
    return tables.filter(table => table.userType === userType);
  }

  async createPricingTable(pricingTable: InsertPricingTable): Promise<PricingTable> {
    const tables = await githubAPI.loadPricingTables();
    const newTable: PricingTable = { ...pricingTable, id: this.currentId++ };
    const updatedTables = [...tables, newTable];
    await githubAPI.savePricingTables(updatedTables);
    return newTable;
  }

  async updatePricingTable(id: number, tableData: Partial<InsertPricingTable>): Promise<PricingTable | undefined> {
    const tables = await githubAPI.loadPricingTables();
    const index = tables.findIndex((table: PricingTable) => table.id === id);
    if (index === -1) return undefined;
    
    const updatedTable = { ...tables[index], ...tableData };
    tables[index] = updatedTable;
    await githubAPI.savePricingTables(tables);
    return updatedTable;
  }

  async deletePricingTable(id: number): Promise<boolean> {
    const tables = await githubAPI.loadPricingTables();
    const filteredTables = tables.filter((table: PricingTable) => table.id !== id);
    await githubAPI.savePricingTables(filteredTables);
    return true;
  }

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    try {
      const promotions = await githubAPI.loadPromotions();
      return promotions.filter((promo: Promotion) => promo.active);
    } catch (error) {
      console.warn('Failed to load promotions from GitHub, using static data:', error);
      return STATIC_PROMOTIONS.filter(promo => promo.active);
    }
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const promotions = await githubAPI.loadPromotions();
    const newPromotion: Promotion = { ...promotion, id: this.currentId++ };
    const updatedPromotions = [...promotions, newPromotion];
    await githubAPI.savePromotions(updatedPromotions);
    return newPromotion;
  }

  async updatePromotion(id: number, promoData: Partial<InsertPromotion>): Promise<Promotion | undefined> {
    const promotions = await githubAPI.loadPromotions();
    const index = promotions.findIndex((promo: Promotion) => promo.id === id);
    if (index === -1) return undefined;
    
    const updatedPromotion = { ...promotions[index], ...promoData };
    promotions[index] = updatedPromotion;
    await githubAPI.savePromotions(promotions);
    return updatedPromotion;
  }

  async deletePromotion(id: number): Promise<boolean> {
    const promotions = await githubAPI.loadPromotions();
    const filteredPromotions = promotions.filter((promo: Promotion) => promo.id !== id);
    await githubAPI.savePromotions(filteredPromotions);
    return true;
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const announcements = await githubAPI.loadAnnouncements();
      return announcements.filter((ann: Announcement) => ann.active);
    } catch (error) {
      console.warn('Failed to load announcements from GitHub, using static data:', error);
      return STATIC_ANNOUNCEMENTS.filter(ann => ann.active);
    }
  }

  async getAnnouncementsByUserType(userType?: string): Promise<Announcement[]> {
    const announcements = await this.getAnnouncements();
    return announcements.filter(
      announcement => announcement.userType === null || announcement.userType === userType
    );
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const announcements = await githubAPI.loadAnnouncements();
    const newAnnouncement: Announcement = { ...announcement, id: this.currentId++ };
    const updatedAnnouncements = [...announcements, newAnnouncement];
    await githubAPI.saveAnnouncements(updatedAnnouncements);
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, announcementData: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const announcements = await githubAPI.loadAnnouncements();
    const index = announcements.findIndex((ann: Announcement) => ann.id === id);
    if (index === -1) return undefined;
    
    const updatedAnnouncement = { ...announcements[index], ...announcementData };
    announcements[index] = updatedAnnouncement;
    await githubAPI.saveAnnouncements(announcements);
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    const announcements = await githubAPI.loadAnnouncements();
    const filteredAnnouncements = announcements.filter((ann: Announcement) => ann.id !== id);
    await githubAPI.saveAnnouncements(filteredAnnouncements);
    return true;
  }
}

export const githubStorage = new GitHubStorage();