import type { User, Category, Color, Product, PricingTable, Promotion, Announcement } from '@shared/schema';

// Static data for GitHub Pages deployment
export const STATIC_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    userType: 'admin',
    name: 'Administrador',
    active: true
  },
  {
    id: 2,
    username: 'loja',
    password: 'loja123',
    userType: 'loja',
    name: 'Usuário Loja',
    active: true
  },
  {
    id: 3,
    username: 'restaurante',
    password: 'restaurante123',
    userType: 'restaurante',
    name: 'Usuário Restaurante',
    active: true
  }
];

export const STATIC_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Banquetas',
    description: 'Banquetas de diferentes alturas e estilos',
    active: true
  },
  {
    id: 2,
    name: 'Cadeiras',
    description: 'Cadeiras para diferentes ambientes',
    active: true
  },
  {
    id: 3,
    name: 'Mesas',
    description: 'Mesas de diversos tamanhos e materiais',
    active: true
  }
];

export const STATIC_COLORS: Color[] = [
  {
    id: 1,
    name: 'Marrom Natural',
    hexCode: '#8B4513',
    active: true
  },
  {
    id: 2,
    name: 'Preto',
    hexCode: '#000000',
    active: true
  },
  {
    id: 3,
    name: 'Branco',
    hexCode: '#FFFFFF',
    active: true
  },
  {
    id: 4,
    name: 'Cinza',
    hexCode: '#808080',
    active: true
  }
];

export const STATIC_PRICING_TABLES: PricingTable[] = [
  {
    id: 1,
    name: 'À Vista',
    description: 'Pagamento à vista',
    multiplier: '1.0000',
    userType: 'loja',
    active: true
  },
  {
    id: 2,
    name: '30 dias',
    description: 'Pagamento em 30 dias',
    multiplier: '1.1000',
    userType: 'loja',
    active: true
  },
  {
    id: 3,
    name: '30/60',
    description: 'Pagamento em 2x',
    multiplier: '1.1500',
    userType: 'loja',
    active: true
  },
  {
    id: 4,
    name: '30/60/90',
    description: 'Pagamento em 3x',
    multiplier: '1.2000',
    userType: 'loja',
    active: true
  },
  {
    id: 5,
    name: '30/60/90/120',
    description: 'Pagamento em 4x',
    multiplier: '1.2500',
    userType: 'loja',
    active: true
  },
  {
    id: 6,
    name: 'Preço Especial',
    description: 'Preço especial para restaurantes',
    multiplier: '0.9000',
    userType: 'restaurante',
    active: true
  }
];

export const STATIC_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Banqueta 50 cm',
    description: 'Banqueta de madeira com 50cm de altura, ideal para balcões e cozinhas',
    categoryId: 1,
    basePrice: '45.00',
    images: ['https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Banqueta+50cm'],
    availableColors: [1, 2],
    active: true
  },
  {
    id: 2,
    name: 'Banqueta 70 cm',
    description: 'Banqueta de madeira com 70cm de altura, perfeita para bancadas altas',
    categoryId: 1,
    basePrice: '55.00',
    images: ['https://via.placeholder.com/300x300/000000/FFFFFF?text=Banqueta+70cm'],
    availableColors: [1, 2, 4],
    active: true
  }
];

export const STATIC_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    title: 'Promoção de Lançamento',
    description: 'Desconto especial em todas as banquetas! Aproveite nossa oferta de inauguração.',
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const STATIC_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: 'Bem-vindos à nossa loja!',
    message: 'Agradecemos pela preferência. Nossa equipe está pronta para atendê-los.',
    userType: null,
    active: true,
    createdAt: new Date().toISOString()
  }
];