import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import type { Product, PricingTable, Color } from "@shared/schema";

interface ProductModalProps {
  product: Product;
  userType: string;
  pricingTables: PricingTable[];
  open: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, userType, pricingTables, open, onClose }: ProductModalProps) {
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedPriceTable, setSelectedPriceTable] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: colors } = useQuery<Color[]>({
    queryKey: ['/api/colors'],
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedColor(null);
      setSelectedPriceTable(userType === 'restaurante' ? (pricingTables[0]?.id || null) : null);
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [open, userType, pricingTables]);

  const availableColors = colors?.filter(color => 
    product.availableColors?.includes(color.id)
  ) || [];

  const getCurrentPrice = () => {
    const basePrice = parseFloat(product.basePrice);
    
    if (userType === 'restaurante') {
      // Restaurant users get base price (special pricing)
      return basePrice;
    } else {
      // Store users choose from pricing tables
      if (selectedPriceTable) {
        const table = pricingTables.find(t => t.id === selectedPriceTable);
        if (table) {
          return basePrice * parseFloat(table.multiplier);
        }
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

  const handleAddToCart = () => {
    if (!selectedColor && availableColors.length > 0) {
      toast({
        title: "Cor obrigatória",
        description: "Por favor, selecione uma cor para o produto.",
        variant: "destructive",
      });
      return;
    }

    if (userType === 'loja' && !selectedPriceTable) {
      toast({
        title: "Tabela de preço obrigatória",
        description: "Por favor, selecione uma tabela de preço.",
        variant: "destructive",
      });
      return;
    }

    const selectedColorObj = colors?.find(c => c.id === selectedColor);
    const unitPrice = getCurrentPrice();

    addToCart({
      productId: product.id,
      productName: product.name,
      colorId: selectedColor || 0,
      colorName: selectedColorObj?.name || "Sem cor",
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
      image: product.images?.[0],
    });

    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho.`,
    });

    onClose();
  };

  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const currentImage = product.images && product.images.length > 0 
    ? product.images[currentImageIndex] 
    : `https://via.placeholder.com/400x300/f0f0f0/666666?text=${encodeURIComponent(product.name)}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/400x300/f0f0f0/666666?text=${encodeURIComponent(product.name)}`;
                }}
              />
              
              {product.images && product.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/80x80/f0f0f0/666666?text=${index + 1}`;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <Label className="text-base font-semibold">Cor *</Label>
                <Select value={selectedColor?.toString()} onValueChange={(value) => setSelectedColor(parseInt(value))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color.id} value={color.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Pricing */}
            <div>
              <h3 className="font-semibold mb-3">Preços</h3>
              {userType === 'restaurante' ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-100 text-amber-800">
                      Preço Especial Restaurante
                    </Badge>
                    <span className="text-xl font-bold text-amber-600">
                      {formatPrice(getCurrentPrice())}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pricingTables.map((table) => (
                    <div
                      key={table.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPriceTable === table.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPriceTable(table.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{table.name}</div>
                          {table.description && (
                            <div className="text-sm text-gray-600">{table.description}</div>
                          )}
                        </div>
                        <div className="text-lg font-semibold">
                          {formatPrice(parseFloat(product.basePrice) * parseFloat(table.multiplier))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {!selectedPriceTable && (
                    <Alert>
                      <AlertDescription>
                        Selecione uma tabela de preço para continuar.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <Label className="text-base font-semibold">Quantidade</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Total and Add to Cart */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(getCurrentPrice() * quantity)}
                </span>
              </div>
              
              <Button
                onClick={handleAddToCart}
                className="w-full"
                size="lg"
                disabled={
                  (availableColors.length > 0 && !selectedColor) ||
                  (userType === 'loja' && !selectedPriceTable)
                }
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
