import type { CartItem } from "@shared/schema";
import type { User } from "@shared/schema";

// WhatsApp number for receiving orders (can be configured via environment)
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "5511999999999";

export function sendWhatsAppOrder(cartItems: CartItem[], user: User | null): boolean {
  try {
    if (!cartItems.length) {
      throw new Error("Carrinho vazio");
    }

    const message = formatOrderMessage(cartItems, user);
    const whatsappUrl = generateWhatsAppUrl(message);
    
    // Open WhatsApp with the formatted message
    window.open(whatsappUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp order:', error);
    return false;
  }
}

function formatOrderMessage(cartItems: CartItem[], user: User | null): string {
  const orderDate = new Date().toLocaleString('pt-BR');
  const userInfo = user ? `${user.name} (${user.userType})` : 'Cliente';
  
  let message = `🛒 *NOVO PEDIDO*\n\n`;
  message += `👤 *Cliente:* ${userInfo}\n`;
  message += `📅 *Data:* ${orderDate}\n\n`;
  message += `📋 *ITENS DO PEDIDO:*\n`;
  message += `${'─'.repeat(30)}\n`;

  let total = 0;
  cartItems.forEach((item, index) => {
    const itemTotal = item.totalPrice;
    total += itemTotal;

    message += `\n*${index + 1}. ${item.productName}*\n`;
    message += `   🎨 Cor: ${item.colorName}\n`;
    message += `   📦 Quantidade: ${item.quantity}\n`;
    message += `   💰 Preço unitário: ${formatCurrency(item.unitPrice)}\n`;
    message += `   💵 Subtotal: ${formatCurrency(itemTotal)}\n`;
  });

  message += `\n${'─'.repeat(30)}\n`;
  message += `💰 *TOTAL DO PEDIDO: ${formatCurrency(total)}*\n\n`;
  
  message += `📝 *Observações:*\n`;
  message += `• Confirmar disponibilidade dos produtos\n`;
  message += `• Definir prazo de entrega\n`;
  message += `• Combinar forma de pagamento\n\n`;
  
  message += `✅ Pedido gerado automaticamente pelo sistema`;

  return message;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

function generateWhatsAppUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

// Function to validate WhatsApp number format
export function validateWhatsAppNumber(number: string): boolean {
  // Remove all non-numeric characters
  const cleanNumber = number.replace(/\D/g, '');
  
  // Brazilian mobile numbers should have 13 digits (country code + area code + number)
  // Format: 55 + XX + 9XXXX-XXXX
  return cleanNumber.length >= 10 && cleanNumber.length <= 15;
}

// Function to format WhatsApp number
export function formatWhatsAppNumber(number: string): string {
  const cleanNumber = number.replace(/\D/g, '');
  
  if (cleanNumber.length === 11) {
    // Add country code if missing
    return `55${cleanNumber}`;
  }
  
  return cleanNumber;
}

// Function to send a simple WhatsApp message
export function sendWhatsAppMessage(message: string, number?: string): boolean {
  try {
    const targetNumber = number ? formatWhatsAppNumber(number) : WHATSAPP_NUMBER;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

// Template messages for different scenarios
export const WHATSAPP_TEMPLATES = {
  orderConfirmation: (orderNumber: string) => 
    `✅ Pedido #${orderNumber} confirmado! Em breve entraremos em contato com mais detalhes.`,
  
  orderInquiry: (productName: string) => 
    `Olá! Gostaria de mais informações sobre o produto: ${productName}`,
  
  generalInquiry: () => 
    `Olá! Gostaria de mais informações sobre seus produtos.`,
  
  support: () => 
    `Olá! Preciso de ajuda com o sistema de pedidos.`
};

// WhatsApp Web detection
export function isWhatsAppWebAvailable(): boolean {
  // Check if we're on mobile or desktop
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return !isMobile; // WhatsApp Web works better on desktop
}

// Get appropriate WhatsApp URL based on device
export function getWhatsAppUrl(message: string, number?: string): string {
  const targetNumber = number ? formatWhatsAppNumber(number) : WHATSAPP_NUMBER;
  const encodedMessage = encodeURIComponent(message);
  
  if (isWhatsAppWebAvailable()) {
    return `https://web.whatsapp.com/send?phone=${targetNumber}&text=${encodedMessage}`;
  } else {
    return `https://wa.me/${targetNumber}?text=${encodedMessage}`;
  }
}
