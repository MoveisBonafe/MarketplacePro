import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Palette } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Color } from "@shared/schema";

export default function ColorManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    hexCode: "#000000",
  });
  const { toast } = useToast();

  const { data: colors, isLoading } = useQuery<Color[]>({
    queryKey: ['/api/colors'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/colors', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colors'] });
      toast({ title: "Cor criada com sucesso!" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar cor", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/colors/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colors'] });
      toast({ title: "Cor atualizada com sucesso!" });
      resetForm();
      setIsDialogOpen(false);
      setEditingColor(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar cor", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/colors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/colors'] });
      toast({ title: "Cor excluída com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir cor", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      hexCode: "#000000",
    });
  };

  const handleEdit = (color: Color) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      hexCode: color.hexCode,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: "Nome da cor é obrigatório", variant: "destructive" });
      return;
    }

    // Validate hex color
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexPattern.test(formData.hexCode)) {
      toast({ title: "Código hexadecimal inválido", variant: "destructive" });
      return;
    }

    const data = {
      name: formData.name.trim(),
      hexCode: formData.hexCode.toUpperCase(),
      active: true,
    };

    if (editingColor) {
      updateMutation.mutate({ id: editingColor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Common color presets
  const colorPresets = [
    { name: "Branco", hex: "#FFFFFF" },
    { name: "Preto", hex: "#000000" },
    { name: "Marrom", hex: "#8B4513" },
    { name: "Azul", hex: "#0066CC" },
    { name: "Verde", hex: "#228B22" },
    { name: "Vermelho", hex: "#DC143C" },
    { name: "Amarelo", hex: "#FFD700" },
    { name: "Cinza", hex: "#808080" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cores</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Cor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingColor ? "Editar Cor" : "Nova Cor"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Cor *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Azul Royal, Marrom Escuro..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="hexCode">Código Hexadecimal *</Label>
                <div className="flex gap-2">
                  <Input
                    id="hexCode"
                    value={formData.hexCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, hexCode: e.target.value }))}
                    placeholder="#000000"
                    required
                  />
                  <input
                    type="color"
                    value={formData.hexCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, hexCode: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Color Preview */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: formData.hexCode }}
                />
                <div>
                  <div className="font-medium">{formData.name || "Nome da cor"}</div>
                  <div className="text-sm text-gray-600">{formData.hexCode}</div>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <Label>Cores Pré-definidas</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        name: prev.name || preset.name,
                        hexCode: preset.hex 
                      }))}
                      className="flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingColor(null);
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
        <div>Carregando cores...</div>
      ) : colors && colors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {colors.map((color) => (
            <Card key={color.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    {color.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(color)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(color.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="font-mono">
                    {color.hexCode}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    ID: {color.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <Palette className="h-4 w-4" />
          <AlertDescription>
            Nenhuma cor cadastrada. Clique em "Nova Cor" para começar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
