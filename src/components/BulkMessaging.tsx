import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Loader2 } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
}

export const BulkMessaging = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

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

    for (const leadId of selectedLeads) {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) continue;

      const personalizedMessage = message
        .replace("{nome}", lead.name)
        .replace("{empresa}", lead.company || "sua empresa");

      const cleanPhone = lead.phone.replace(/\D/g, "");
      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`,
        "_blank"
      );

      await supabase.from("message_history").insert({
        lead_id: leadId,
        message: personalizedMessage,
        status: "sent",
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    setIsSending(false);
    toast({
      title: "Sucesso!",
      description: `${selectedLeads.length} mensagens enviadas`,
    });
    setSelectedLeads([]);
    setMessage("");
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Envio em Massa</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Mensagem (use {"{nome}"} e {"{empresa}"} para personalizar)
          </label>
          <Textarea
            placeholder="Ex: Olá {nome}, tudo bem? Vi que você trabalha na {empresa}..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <Checkbox
              checked={selectedLeads.length === leads.length && leads.length > 0}
              onCheckedChange={toggleAll}
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
          disabled={isSending}
          className="w-full"
          size="lg"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
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
