import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ShoppingCart } from "lucide-react";
import type { Product, PricingTable } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  userType: string;
  pricingTables: PricingTable[];
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, userType, pricingTables, onViewDetails }: ProductCardProps) {
  const getPrice = () => {
    if (userType === 'restaurante') {
      // Restaurant users get the base price (special pricing)
      return parseFloat(product.basePrice);
    } else {
      // Store users see multiple pricing options
      const basePrice = parseFloat(product.basePrice);
      if (pricingTables.length > 0) {
        const firstTable = pricingTables[0];
        return basePrice * parseFloat(firstTable.multiplier);
      }
      return basePrice;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const primaryImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/api/placeholder/300/200';

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/300x200/f0f0f0/666666?text=${encodeURIComponent(product.name)}`;
            }}
          />
          {product.images && product.images.length > 1 && (
            <Badge className="absolute top-2 right-2 bg-black/50 text-white">
              +{product.images.length - 1}
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="space-y-2 mb-4">
            {userType === 'restaurante' ? (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Preço Especial
                </Badge>
                <span className="text-lg font-bold text-amber-600">
                  {formatPrice(getPrice())}
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">À Vista</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(getPrice())}
                  </span>
                </div>
                {pricingTables.slice(1, 3).map((table) => (
                  <div key={table.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{table.name}</span>
                    <span className="text-gray-900">
                      {formatPrice(parseFloat(product.basePrice) * parseFloat(table.multiplier))}
                    </span>
                  </div>
                ))}
                {pricingTables.length > 3 && (
                  <div className="text-xs text-gray-500 text-center mt-1">
                    +{pricingTables.length - 3} mais opções
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(product)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
