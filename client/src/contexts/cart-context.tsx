import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem } from '@shared/schema';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateCartItem: (index: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isInCart: (productId: number, colorId: number) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = 'ecommerce-cart';

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart(prevCart => {
      // Check if item already exists (same product and color)
      const existingItemIndex = prevCart.findIndex(
        item => item.productId === newItem.productId && item.colorId === newItem.colorId
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];
        existingItem.quantity += newItem.quantity;
        existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const updateCartItem = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCart(prevCart => {
      const updatedCart = [...prevCart];
      const item = updatedCart[index];
      if (item) {
        item.quantity = quantity;
        item.totalPrice = item.unitPrice * quantity;
      }
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getCartItemCount = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId: number, colorId: number): boolean => {
    return cart.some(item => item.productId === productId && item.colorId === colorId);
  };

  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Custom hook for cart statistics
export function useCartStats() {
  const { cart, getCartTotal, getCartItemCount } = useCart();

  const stats = {
    itemCount: getCartItemCount(),
    totalValue: getCartTotal(),
    uniqueProducts: cart.length,
    averageItemPrice: cart.length > 0 ? getCartTotal() / getCartItemCount() : 0,
    isEmpty: cart.length === 0
  };

  return stats;
}

// Helper function to format cart for display
export function formatCartSummary(cart: CartItem[]): string {
  if (cart.length === 0) return 'Carrinho vazio';

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return `${totalItems} ${totalItems === 1 ? 'item' : 'itens'} - ${new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(totalValue)}`;
}

// Helper function to validate cart item
export function validateCartItem(item: Partial<CartItem>): item is CartItem {
  return !!(
    item.productId &&
    item.productName &&
    item.colorId !== undefined &&
    item.colorName &&
    item.quantity &&
    item.quantity > 0 &&
    item.unitPrice &&
    item.unitPrice > 0 &&
    item.totalPrice &&
    item.totalPrice > 0
  );
}
