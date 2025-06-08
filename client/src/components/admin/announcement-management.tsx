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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Bell, Calendar, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Announcement } from "@shared/schema";

export default function AnnouncementManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    userType: "",
    active: true,
  });
  const { toast } = useToast();

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/announcements', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: "Aviso criado com sucesso!" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar aviso", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/announcements/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: "Aviso atualizado com sucesso!" });
      resetForm();
      setIsDialogOpen(false);
      setEditingAnnouncement(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar aviso", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: "Aviso excluído com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir aviso", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await apiRequest('PUT', `/api/announcements/${id}`, { active });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({ title: "Status do aviso atualizado!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      userType: "",
      active: true,
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      userType: announcement.userType || "",
      active: announcement.active || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    const data = {
      title: formData.title.trim(),
      message: formData.message.trim(),
      userType: formData.userType || null,
      active: formData.active,
    };

    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getUserTypeLabel = (userType: string | null) => {
    switch (userType) {
      case 'loja': return 'Loja';
      case 'restaurante': return 'Restaurante';
      case null: return 'Todos os usuários';
      default: return userType || 'Todos os usuários';
    }
  };

  const getUserTypeBadgeColor = (userType: string | null) => {
    switch (userType) {
      case 'loja': return 'bg-blue-100 text-blue-800';
      case 'restaurante': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeAnnouncements = announcements?.filter(a => a.active) || [];
  const inactiveAnnouncements = announcements?.filter(a => !a.active) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Avisos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? "Editar Aviso" : "Novo Aviso"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Aviso *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Manutenção do Sistema"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Digite a mensagem do aviso..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="userType">Público Alvo</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os usuários</SelectItem>
                    <SelectItem value="loja">Apenas Lojas</SelectItem>
                    <SelectItem value="restaurante">Apenas Restaurantes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Aviso ativo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingAnnouncement(null);
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
        <div>Carregando avisos...</div>
      ) : announcements && announcements.length > 0 ? (
        <div className="space-y-8">
          {/* Active Announcements */}
          {activeAnnouncements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Avisos Ativos
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {activeAnnouncements.length}
                </Badge>
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          {announcement.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(announcement.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-blue-800">{announcement.message}</p>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-blue-600" />
                        <Badge className={`text-xs ${getUserTypeBadgeColor(announcement.userType)}`}>
                          {getUserTypeLabel(announcement.userType)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <Calendar className="w-3 h-3" />
                          {formatDate(announcement.createdAt)}
                        </div>
                        <Switch
                          checked={announcement.active}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: announcement.id, active: checked })
                          }
                          disabled={toggleActiveMutation.isPending}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Announcements */}
          {inactiveAnnouncements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-500" />
                Avisos Inativos
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  {inactiveAnnouncements.length}
                </Badge>
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inactiveAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="border-gray-200 bg-gray-50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          {announcement.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(announcement.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{announcement.message}</p>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-gray-500" />
                        <Badge className={`text-xs ${getUserTypeBadgeColor(announcement.userType)}`}>
                          {getUserTypeLabel(announcement.userType)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(announcement.createdAt)}
                        </div>
                        <Switch
                          checked={announcement.active}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: announcement.id, active: checked })
                          }
                          disabled={toggleActiveMutation.isPending}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            Nenhum aviso cadastrado. Clique em "Novo Aviso" para começar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
