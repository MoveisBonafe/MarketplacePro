import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, LogOut, ShoppingCart, Megaphone, Bell } from "lucide-react";
import ProductCard from "@/components/product-card";
import ProductModal from "@/components/product-modal";
import CartModal from "@/components/cart-modal";
import type { Product, Category, PricingTable, Promotion, Announcement } from "@shared/schema";

export default function StoreCatalog() {
  const { user, logout } = useAuth();
  const { cart, getCartTotal } = useCart();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (!user || user.userType !== 'loja') {
      setLocation('/login');
    }
  }, [user, setLocation]);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: selectedCategory ? ['/api/products', selectedCategory] : ['/api/products'],
    queryFn: async () => {
      const url = selectedCategory ? `/api/products?categoryId=${selectedCategory}` : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const { data: pricingTables } = useQuery<PricingTable[]>({
    queryKey: ['/api/pricing-tables', 'loja'],
    queryFn: async () => {
      const response = await fetch('/api/pricing-tables?userType=loja');
      if (!response.ok) throw new Error('Failed to fetch pricing tables');
      return response.json();
    }
  });

  const { data: promotions } = useQuery<Promotion[]>({
    queryKey: ['/api/promotions'],
  });

  const { data: announcements } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements', 'loja'],
    queryFn: async () => {
      const response = await fetch('/api/announcements?userType=loja');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    }
  });

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Catálogo Loja</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowCart(true)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
                {cartItemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Promotions */}
        {promotions && promotions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-500" />
              Promoções
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promotions.map((promotion) => (
                <Alert key={promotion.id} className="border-orange-200 bg-orange-50">
                  <Megaphone className="h-4 w-4 text-orange-500" />
                  <AlertDescription>
                    <div className="font-semibold text-orange-800">{promotion.title}</div>
                    <div className="text-orange-700 mt-1">{promotion.description}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              Avisos
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {announcements.map((announcement) => (
                <Alert key={announcement.id} className="border-blue-200 bg-blue-50">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <AlertDescription>
                    <div className="font-semibold text-blue-800">{announcement.title}</div>
                    <div className="text-blue-700 mt-1">{announcement.message}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Tables Info */}
        {pricingTables && pricingTables.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tabelas de Preço Disponíveis</h2>
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
              {pricingTables.map((table) => (
                <Badge key={table.id} variant="secondary" className="p-2 text-center">
                  {table.name} ({(parseFloat(table.multiplier) * 100 - 100).toFixed(1)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Categories Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar por Categoria</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              Todas
            </Button>
            {categoriesLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-20" />
                ))}
              </div>
            ) : (
              categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Produtos</h2>
          {productsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  userType="loja"
                  pricingTables={pricingTables || []}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          userType="loja"
          pricingTables={pricingTables || []}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart Modal */}
      <CartModal open={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
}
