import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
}

type SendStatus = "pending" | "sending" | "sent" | "error";

interface LeadSendStatus {
  leadId: string;
  status: SendStatus;
  error?: string;
}

export const BulkMessaging = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendStatuses, setSendStatuses] = useState<LeadSendStatus[]>([]);
  const [currentSending, setCurrentSending] = useState<string | null>(null);
  const { toast } = useToast();
  
  const MANAGER_WHATSAPP = "5531980252882"; // Número de gestão

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, phone, email, company")
      .eq("status", "active");

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads",
        variant: "destructive",
      });
    } else {
      setLeads(data || []);
    }
  };

  const toggleLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  // Função para gerar delay variado entre 7 e 20 segundos
  const getRandomDelay = () => {
    const delays = [7, 10, 12, 15, 18, 20]; // Segundos
    return delays[Math.floor(Math.random() * delays.length)] * 1000; // Converter para ms
  };

  const sendBulkMessages = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos um lead",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Aviso",
        description: "Digite uma mensagem",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setSendProgress(0);
    
    // Inicializar status de todos os leads selecionados
    const initialStatuses: LeadSendStatus[] = selectedLeads.map(id => ({
      leadId: id,
      status: "pending" as SendStatus
    }));
    setSendStatuses(initialStatuses);

    let sentCount = 0;
    let errorCount = 0;

    for (let i = 0; i < selectedLeads.length; i++) {
      const leadId = selectedLeads[i];
      const lead = leads.find((l) => l.id === leadId);
      
      if (!lead) continue;

      setCurrentSending(leadId);
      
      // Atualizar status para "sending"
      setSendStatuses(prev => prev.map(s => 
        s.leadId === leadId ? { ...s, status: "sending" as SendStatus } : s
      ));

      try {
        const personalizedMessage = message
          .replace(/{nome}/g, lead.name)
          .replace(/{empresa}/g, lead.company || "sua empresa")
          .replace(/{telefone}/g, lead.phone);

        const cleanPhone = lead.phone.replace(/\D/g, "");
        const phoneWithCountry = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
        
        console.log(`Enviando mensagem automaticamente para ${lead.name} (${phoneWithCountry})`);
        
        // Chamar Edge Function de automação do WhatsApp
        const { data: automationResult, error: automationError } = await supabase.functions.invoke(
          'whatsapp-automation',
          {
            body: {
              phone: phoneWithCountry,
              message: personalizedMessage,
              leadName: lead.name
            }
          }
        );

        if (automationError) {
          throw new Error(automationError.message);
        }

        if (!automationResult?.success) {
          throw new Error(automationResult?.error || 'Falha no envio automático');
        }

        console.log(`Mensagem enviada com sucesso:`, automationResult);

        // Salvar no histórico
        await supabase.from("message_history").insert({
          lead_id: leadId,
          message: personalizedMessage,
          status: "sent",
        });

        // Atualizar status para "sent"
        setSendStatuses(prev => prev.map(s => 
          s.leadId === leadId ? { ...s, status: "sent" as SendStatus } : s
        ));
        
        sentCount++;
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Falha ao enviar";
        
        // Atualizar status para "error"
        setSendStatuses(prev => prev.map(s => 
          s.leadId === leadId ? { 
            ...s, 
            status: "error" as SendStatus,
            error: errorMessage
          } : s
        ));
        
        errorCount++;
      }

      // Atualizar progresso
      const progress = ((i + 1) / selectedLeads.length) * 100;
      setSendProgress(progress);

      // Delay variado entre envios (7-20 segundos) para evitar bloqueio pelo WhatsApp
      if (i < selectedLeads.length - 1) {
        const delay = getRandomDelay();
        console.log(`Aguardando ${delay / 1000} segundos antes do próximo envio...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    setCurrentSending(null);
    setIsSending(false);
    
    // Notificação de resumo
    if (errorCount === 0) {
      toast({
        title: "✅ Envio Concluído!",
        description: `${sentCount} mensagens enviadas com sucesso`,
      });
    } else {
      toast({
        title: "⚠️ Envio Concluído com Erros",
        description: `${sentCount} enviadas, ${errorCount} falharam`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: SendStatus) => {
    switch (status) {
      case "sent":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "sending":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: SendStatus) => {
    switch (status) {
      case "sent":
        return <Badge variant="default" className="bg-green-500">Enviado</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      case "sending":
        return <Badge variant="secondary">Enviando...</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Envio em Massa - WhatsApp</h2>
        <Badge variant="outline" className="text-xs">
          Gestão: {MANAGER_WHATSAPP}
        </Badge>
      </div>

      {/* Aviso de Automação */}
      <div className="mb-4 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
        <div className="flex gap-2">
          <div className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠️</div>
          <div className="flex-1 text-sm">
            <p className="font-semibold mb-1">Automação em Modo Simulado</p>
            <p className="text-muted-foreground">
              Esta é uma simulação de envio automático. Para envios reais via WhatsApp Business API, 
              configure o token WHATSAPP_BUSINESS_TOKEN nas configurações.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Importante:</strong> Automação do WhatsApp pode violar os Termos de Serviço e resultar em banimento da conta.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Mensagem (use {"{nome}"}, {"{empresa}"} e {"{telefone}"} para personalizar)
          </label>
          <Textarea
            placeholder="Ex: Olá {nome}, tudo bem? Vi que você trabalha na {empresa}. Somos especializados em higienização de estofados e estética automotiva. Gostaria de conhecer nossos serviços?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            disabled={isSending}
          />
        </div>

        {/* Progresso do envio */}
        {isSending && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progresso do Envio</span>
              <span className="text-muted-foreground">
                {Math.round(sendProgress)}%
              </span>
            </div>
            <Progress value={sendProgress} className="h-2" />
          </div>
        )}

        {/* Status de envio individual */}
        {sendStatuses.length > 0 && (
          <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-muted/30">
            <h3 className="text-sm font-medium mb-3">Status do Envio</h3>
            <div className="space-y-2">
              {sendStatuses.map((status) => {
                const lead = leads.find(l => l.id === status.leadId);
                if (!lead) return null;
                
                return (
                  <div 
                    key={status.leadId} 
                    className={`flex items-center justify-between p-2 rounded ${
                      currentSending === status.leadId ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {getStatusIcon(status.status)}
                      <div>
                        <div className="text-sm font-medium">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">{lead.phone}</div>
                      </div>
                    </div>
                    {getStatusBadge(status.status)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de leads para selecionar */}
        <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <Checkbox
              checked={selectedLeads.length === leads.length && leads.length > 0}
              onCheckedChange={toggleAll}
              disabled={isSending}
            />
            <span className="font-medium">
              Selecionar todos ({selectedLeads.length}/{leads.length})
            </span>
          </div>

          <div className="space-y-2">
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                <Checkbox
                  checked={selectedLeads.includes(lead.id)}
                  onCheckedChange={() => toggleLead(lead.id)}
                  disabled={isSending}
                />
                <div className="flex-1">
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {lead.phone} {lead.company && `• ${lead.company}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={sendBulkMessages}
          disabled={isSending || selectedLeads.length === 0}
          className="w-full"
          size="lg"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando {Math.round(sendProgress)}%...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar para {selectedLeads.length} lead(s)
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
