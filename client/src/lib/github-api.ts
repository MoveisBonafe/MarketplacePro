// GitHub API configuration and utilities
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "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";
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || "your-username";
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || "your-repo";
const GITHUB_API_BASE = "https://api.github.com";

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  content: string;
}

export class GitHubAPI {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }

  // Get file contents from GitHub
  async getFile(path: string): Promise<any> {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // File doesn't exist
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const content = atob(data.content);
      
      try {
        return JSON.parse(content);
      } catch {
        return content;
      }
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error);
      return null;
    }
  }

  // Create or update file in GitHub
  async saveFile(path: string, content: any, message: string): Promise<boolean> {
    try {
      // Get current file SHA if it exists
      let sha: string | undefined;
      const existingFile = await this.getFileInfo(path);
      if (existingFile) {
        sha = existingFile.sha;
      }

      const encodedContent = btoa(
        typeof content === 'string' ? content : JSON.stringify(content, null, 2)
      );

      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        {
          method: 'PUT',
          headers: this.headers,
          body: JSON.stringify({
            message,
            content: encodedContent,
            sha
          })
        }
      );

      return response.ok;
    } catch (error) {
      console.error(`Error saving file ${path}:`, error);
      return false;
    }
  }

  // Get file info (metadata) from GitHub
  private async getFileInfo(path: string): Promise<GitHubFile | null> {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error getting file info ${path}:`, error);
      return null;
    }
  }

  // Upload image to GitHub
  async uploadImage(fileName: string, base64Content: string): Promise<string | null> {
    try {
      const imagePath = `Docs/Images/${fileName}`;
      const success = await this.saveFile(
        imagePath,
        base64Content,
        `Upload image: ${fileName}`
      );

      if (success) {
        return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${imagePath}`;
      }
      
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  // Data management methods
  async loadData<T>(fileName: string): Promise<T[]> {
    const data = await this.getFile(`Docs/Data/${fileName}`);
    return data || [];
  }

  async saveData<T>(fileName: string, data: T[]): Promise<boolean> {
    return this.saveFile(
      `Docs/Data/${fileName}`,
      data,
      `Update ${fileName}`
    );
  }

  // Specific data operations
  async loadProducts() {
    return this.loadData('products.json');
  }

  async saveProducts(products: any[]) {
    return this.saveData('products.json', products);
  }

  async loadCategories() {
    return this.loadData('categories.json');
  }

  async saveCategories(categories: any[]) {
    return this.saveData('categories.json', categories);
  }

  async loadColors() {
    return this.loadData('colors.json');
  }

  async saveColors(colors: any[]) {
    return this.saveData('colors.json', colors);
  }

  async loadPricingTables() {
    return this.loadData('pricing.json');
  }

  async savePricingTables(pricingTables: any[]) {
    return this.saveData('pricing.json', pricingTables);
  }

  async loadPromotions() {
    return this.loadData('promotions.json');
  }

  async savePromotions(promotions: any[]) {
    return this.saveData('promotions.json', promotions);
  }

  async loadAnnouncements() {
    return this.loadData('announcements.json');
  }

  async saveAnnouncements(announcements: any[]) {
    return this.saveData('announcements.json', announcements);
  }
}

export const githubAPI = new GitHubAPI();
