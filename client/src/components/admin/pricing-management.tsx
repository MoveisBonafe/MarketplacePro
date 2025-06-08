import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, DollarSign, Percent } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { PricingTable } from "@shared/schema";

export default function PricingManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<PricingTable | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    multiplier: "1.0000",
    userType: "",
  });
  const { toast } = useToast();

  const { data: pricingTables, isLoading } = useQuery<PricingTable[]>({
    queryKey: ['/api/pricing-tables'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/pricing-tables', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-tables'] });
      toast({ title: "Tabela de preço criada com sucesso!" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar tabela de preço", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/pricing-tables/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-tables'] });
      toast({ title: "Tabela de preço atualizada com sucesso!" });
      resetForm();
      setIsDialogOpen(false);
      setEditingTable(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar tabela de preço", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/pricing-tables/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-tables'] });
      toast({ title: "Tabela de preço excluída com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir tabela de preço", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      multiplier: "1.0000",
      userType: "",
    });
  };

  const handleEdit = (table: PricingTable) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      description: table.description || "",
      multiplier: table.multiplier,
      userType: table.userType,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.userType || !formData.multiplier) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    const multiplier = parseFloat(formData.multiplier);
    if (isNaN(multiplier) || multiplier <= 0) {
      toast({ title: "Multiplicador deve ser um número positivo", variant: "destructive" });
      return;
    }

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      multiplier: multiplier.toFixed(4),
      userType: formData.userType,
      active: true,
    };

    if (editingTable) {
      updateMutation.mutate({ id: editingTable.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePercentageChange = (percentage: string) => {
    const percent = parseFloat(percentage) || 0;
    const multiplier = (100 + percent) / 100;
    setFormData(prev => ({ ...prev, multiplier: multiplier.toFixed(4) }));
  };

  const getPercentageFromMultiplier = (multiplier: string) => {
    const mult = parseFloat(multiplier) || 1;
    return ((mult - 1) * 100).toFixed(1);
  };

  const formatPercentage = (multiplier: string) => {
    const percentage = getPercentageFromMultiplier(multiplier);
    const num = parseFloat(percentage);
    return num >= 0 ? `+${percentage}%` : `${percentage}%`;
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'loja': return 'Loja';
      case 'restaurante': return 'Restaurante';
      default: return userType;
    }
  };

  // Group tables by user type
  const tablesByUserType = pricingTables?.reduce((acc, table) => {
    if (!acc[table.userType]) {
      acc[table.userType] = [];
    }
    acc[table.userType].push(table);
    return acc;
  }, {} as Record<string, PricingTable[]>) || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tabelas de Preço</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tabela
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTable ? "Editar Tabela de Preço" : "Nova Tabela de Preço"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Tabela *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: À Vista, 30/60/90..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="userType">Tipo de Usuário *</Label>
                  <Select
                    value={formData.userType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loja">Loja</SelectItem>
                      <SelectItem value="restaurante">Restaurante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional da tabela de preço"
                  rows={2}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-semibold">Configuração de Preço</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="percentage">Porcentagem sobre o preço base</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="percentage"
                        type="number"
                        step="0.1"
                        value={getPercentageFromMultiplier(formData.multiplier)}
                        onChange={(e) => handlePercentageChange(e.target.value)}
                        placeholder="0.0"
                      />
                      <Percent className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="multiplier">Multiplicador *</Label>
                    <Input
                      id="multiplier"
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={formData.multiplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, multiplier: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Price Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">Exemplo de Preço:</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Preço Base:</span>
                      <span>R$ 100,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajuste:</span>
                      <span className={parseFloat(getPercentageFromMultiplier(formData.multiplier)) >= 0 ? "text-red-600" : "text-green-600"}>
                        {formatPercentage(formData.multiplier)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Preço Final:</span>
                      <span>R$ {(100 * parseFloat(formData.multiplier)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingTable(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Carregando tabelas de preço...</div>
      ) : Object.keys(tablesByUserType).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(tablesByUserType).map(([userType, tables]) => (
            <div key={userType}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Tabelas para {getUserTypeLabel(userType)}
                <Badge variant="secondary">{tables.length} tabelas</Badge>
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tables.map((table) => (
                  <Card key={table.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{table.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(table)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(table.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {table.description && (
                        <p className="text-sm text-gray-600">{table.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Multiplicador:</span>
                          <Badge variant="outline">{table.multiplier}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Ajuste:</span>
                          <Badge 
                            variant="secondary"
                            className={parseFloat(getPercentageFromMultiplier(table.multiplier)) >= 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}
                          >
                            {formatPercentage(table.multiplier)}
                          </Badge>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500">
                          Exemplo: R$ 100,00 → R$ {(100 * parseFloat(table.multiplier)).toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert>
          <DollarSign className="h-4 w-4" />
          <AlertDescription>
            Nenhuma tabela de preço cadastrada. Clique em "Nova Tabela" para começar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
