import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { sendWhatsAppOrder } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";
import { Trash2, MessageCircle, ShoppingBag } from "lucide-react";

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CartModal({ open, onClose }: CartModalProps) {
  const { cart, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleSendWhatsApp = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar o pedido.",
        variant: "destructive",
      });
      return;
    }

    const success = sendWhatsAppOrder(cart, user);
    
    if (success) {
      toast({
        title: "Pedido enviado!",
        description: "Seu pedido foi enviado via WhatsApp com sucesso.",
      });
      clearCart();
      onClose();
    } else {
      toast({
        title: "Erro ao enviar pedido",
        description: "Não foi possível abrir o WhatsApp. Verifique se o aplicativo está instalado.",
        variant: "destructive",
      });
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = getCartTotal();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Carrinho de Compras
            {totalItems > 0 && (
              <Badge variant="secondary">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Carrinho vazio</h3>
            <p className="text-gray-600">Adicione produtos ao carrinho para continuar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                {cart.map((item, index) => (
                  <div key={`${item.productId}-${item.colorId}-${index}`} className="flex gap-4 p-4 border rounded-lg">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/64x64/f0f0f0/666666?text=${item.productName.charAt(0)}`;
                        }}
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">Cor: {item.colorName}</span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">Qtd: {item.quantity}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-sm text-gray-600">
                            {formatPrice(item.unitPrice)} × {item.quantity}
                          </span>
                          <div className="font-semibold text-gray-900">
                            {formatPrice(item.totalPrice)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total do Pedido:</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Carrinho
                </Button>
                
                <Button
                  onClick={handleSendWhatsApp}
                  className="flex-1"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Finalizar via WhatsApp
                </Button>
              </div>

              <div className="text-xs text-gray-600 text-center">
                Ao finalizar, você será redirecionado para o WhatsApp com os detalhes do pedido.
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
