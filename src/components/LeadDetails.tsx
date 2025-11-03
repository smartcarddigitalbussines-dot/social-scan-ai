import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  User, Phone, Mail, Building2, MapPin, Calendar, 
  Briefcase, Car, Facebook, Instagram, Linkedin, 
  Twitter, MessageSquare, DollarSign, Tag
} from "lucide-react";

interface LeadDetailsProps {
  leadId: string;
  onClose: () => void;
}

export function LeadDetails({ leadId, onClose }: LeadDetailsProps) {
  const [lead, setLead] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) {
      toast.error('Erro ao carregar lead');
      return;
    }
    setLead(data);
    setLoading(false);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('leads')
      .update(lead)
      .eq('id', leadId);

    if (error) {
      toast.error('Erro ao salvar alterações');
      return;
    }
    toast.success('Lead atualizado com sucesso!');
    setIsEditing(false);
  };

  if (loading) return <div className="p-6">Carregando...</div>;
  if (!lead) return <div className="p-6">Lead não encontrado</div>;

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6" />
          Perfil Completo do Lead
        </h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} variant="default">Salvar</Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">Cancelar</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">Editar</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações Básicas
          </h3>
          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input 
                value={lead.name || ''} 
                onChange={(e) => setLead({...lead, name: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                value={lead.email || ''} 
                onChange={(e) => setLead({...lead, email: e.target.value})}
                disabled={!isEditing}
                type="email"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input 
                value={lead.phone || ''} 
                onChange={(e) => setLead({...lead, phone: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input 
                value={lead.whatsapp || ''} 
                onChange={(e) => setLead({...lead, whatsapp: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Data de Nascimento</Label>
              <Input 
                value={lead.data_nascimento || ''} 
                onChange={(e) => setLead({...lead, data_nascimento: e.target.value})}
                disabled={!isEditing}
                type="date"
              />
            </div>
            <div>
              <Label>Profissão</Label>
              <Input 
                value={lead.profissao || ''} 
                onChange={(e) => setLead({...lead, profissao: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Redes Sociais */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Redes Sociais
          </h3>
          <div className="space-y-3">
            <div>
              <Label className="flex items-center gap-2">
                <Facebook className="h-4 w-4" /> Facebook
              </Label>
              <Input 
                value={lead.facebook || ''} 
                onChange={(e) => setLead({...lead, facebook: e.target.value})}
                disabled={!isEditing}
                placeholder="facebook.com/usuario"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Instagram className="h-4 w-4" /> Instagram
              </Label>
              <Input 
                value={lead.instagram || ''} 
                onChange={(e) => setLead({...lead, instagram: e.target.value})}
                disabled={!isEditing}
                placeholder="@usuario"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </Label>
              <Input 
                value={lead.linkedin || ''} 
                onChange={(e) => setLead({...lead, linkedin: e.target.value})}
                disabled={!isEditing}
                placeholder="linkedin.com/in/usuario"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Twitter className="h-4 w-4" /> Twitter
              </Label>
              <Input 
                value={lead.twitter || ''} 
                onChange={(e) => setLead({...lead, twitter: e.target.value})}
                disabled={!isEditing}
                placeholder="@usuario"
              />
            </div>
          </div>
        </Card>

        {/* Endereço */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Endereço
          </h3>
          <div className="space-y-3">
            <div>
              <Label>Endereço Completo</Label>
              <Input 
                value={lead.endereco || ''} 
                onChange={(e) => setLead({...lead, endereco: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input 
                value={lead.cidade || ''} 
                onChange={(e) => setLead({...lead, cidade: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Input 
                value={lead.estado || ''} 
                onChange={(e) => setLead({...lead, estado: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>CEP</Label>
              <Input 
                value={lead.cep || ''} 
                onChange={(e) => setLead({...lead, cep: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Veículo e Empresa */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Car className="h-4 w-4" />
            Veículo e Empresa
          </h3>
          <div className="space-y-3">
            <div>
              <Label>Empresa</Label>
              <Input 
                value={lead.company || ''} 
                onChange={(e) => setLead({...lead, company: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Tipo de Veículo</Label>
              <Input 
                value={lead.tipo_veiculo || ''} 
                onChange={(e) => setLead({...lead, tipo_veiculo: e.target.value})}
                disabled={!isEditing}
                placeholder="Ex: Honda Civic 2020"
              />
            </div>
            <div>
              <Label>Placa do Veículo</Label>
              <Input 
                value={lead.placa_veiculo || ''} 
                onChange={(e) => setLead({...lead, placa_veiculo: e.target.value})}
                disabled={!isEditing}
                placeholder="ABC-1234"
              />
            </div>
          </div>
        </Card>

        {/* Histórico de Compras */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Histórico de Compras
          </h3>
          <div className="space-y-3">
            <div>
              <Label>Última Compra</Label>
              <Input 
                value={lead.ultima_compra || ''} 
                onChange={(e) => setLead({...lead, ultima_compra: e.target.value})}
                disabled={!isEditing}
                type="date"
              />
            </div>
            <div>
              <Label>Valor Total Gasto</Label>
              <Input 
                value={lead.valor_total_gasto || ''} 
                onChange={(e) => setLead({...lead, valor_total_gasto: e.target.value})}
                disabled={!isEditing}
                type="number"
                step="0.01"
              />
            </div>
          </div>
        </Card>

        {/* Preferências e Observações */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Preferências
          </h3>
          <div className="space-y-3">
            <div>
              <Label>Preferências</Label>
              <Textarea 
                value={lead.preferencias || ''} 
                onChange={(e) => setLead({...lead, preferencias: e.target.value})}
                disabled={!isEditing}
                placeholder="Ex: Prefere atendimento aos sábados, gosta de produtos premium..."
                rows={3}
              />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea 
                value={lead.notes || ''} 
                onChange={(e) => setLead({...lead, notes: e.target.value})}
                disabled={!isEditing}
                placeholder="Notas gerais sobre o cliente..."
                rows={3}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Input 
                value={lead.status || ''} 
                onChange={(e) => setLead({...lead, status: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
