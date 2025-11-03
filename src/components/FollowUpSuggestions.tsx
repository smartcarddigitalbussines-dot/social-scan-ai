import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb, Loader2 } from "lucide-react";
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
  tags: string[] | null;
  status: string;
}

export const FollowUpSuggestions = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<string>("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, phone, email, company, tags, status")
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

  const getSuggestion = async () => {
    if (!selectedLead) {
      toast({
        title: "Aviso",
        description: "Selecione um lead",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const lead = leads.find((l) => l.id === selectedLead);
      if (!lead) return;

      const { data: historyData } = await supabase
        .from("message_history")
        .select("*")
        .eq("lead_id", selectedLead)
        .order("sent_at", { ascending: false })
        .limit(5);

      const { data, error } = await supabase.functions.invoke("suggest-followup", {
        body: {
          leadData: lead,
          messageHistory: historyData || [],
        },
      });

      if (error) throw error;

      setSuggestion(data.suggestion);
      toast({
        title: "Sugestão gerada!",
        description: "Veja as recomendações de follow-up",
      });
    } catch (error) {
      console.error("Erro ao obter sugestão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar sugestão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Sugestões de Follow-up</h2>
      </div>

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

        <Button
          onClick={getSuggestion}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Obter Sugestões
            </>
          )}
        </Button>

        {suggestion && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recomendações:
            </h3>
            <div className="whitespace-pre-wrap space-y-2">{suggestion}</div>
          </div>
        )}
      </div>
    </Card>
  );
};
