import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Copy, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
}

export const MessageGenerator = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<string>("");
  const [context, setContext] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generateMessage = async () => {
    if (!selectedLead) {
      toast({
        title: "Aviso",
        description: "Selecione um lead",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const lead = leads.find((l) => l.id === selectedLead);
      if (!lead) return;

      const { data, error } = await supabase.functions.invoke("generate-message", {
        body: {
          name: lead.name,
          company: lead.company,
          email: lead.email,
          context: context,
        },
      });

      if (error) throw error;

      setGeneratedMessage(data.message);
      toast({
        title: "Mensagem gerada!",
        description: "Sua mensagem personalizada está pronta",
      });
    } catch (error) {
      console.error("Erro ao gerar mensagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência",
    });
  };

  const sendMessage = () => {
    const lead = leads.find((l) => l.id === selectedLead);
    if (!lead) return;

    const cleanPhone = lead.phone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedMessage)}`,
      "_blank"
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gerador de Mensagens IA</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Selecione o Lead
          </label>
          <Select value={selectedLead} onValueChange={setSelectedLead}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um lead" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.name} - {lead.company || "Sem empresa"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Contexto (opcional)
          </label>
          <Input
            placeholder="Ex: Follow-up após reunião, Proposta comercial..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        <Button
          onClick={generateMessage}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Gerar Mensagem
            </>
          )}
        </Button>

        {generatedMessage && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Mensagem Gerada
              </label>
              <Textarea
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={copyMessage} variant="outline" className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
              <Button onClick={sendMessage} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Enviar WhatsApp
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
