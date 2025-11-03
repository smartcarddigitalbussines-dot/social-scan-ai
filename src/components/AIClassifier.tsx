import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  tags: string[] | null;
}

export const AIClassifier = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [classifying, setClassifying] = useState<string | null>(null);
  const [isClassifyingAll, setIsClassifyingAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, phone, email, company, tags")
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

  const classifyLead = async (lead: Lead) => {
    setClassifying(lead.id);

    try {
      const { data, error } = await supabase.functions.invoke("classify-lead", {
        body: {
          name: lead.name,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
        },
      });

      if (error) throw error;

      const classification = data.classification;
      const currentTags = lead.tags || [];
      const filteredTags = currentTags.filter(
        (tag) => !["quente", "morno", "frio"].includes(tag)
      );
      const newTags = [...filteredTags, classification];

      await supabase
        .from("leads")
        .update({ tags: newTags })
        .eq("id", lead.id);

      toast({
        title: "Lead classificado!",
        description: `${lead.name} foi classificado como: ${classification}`,
      });

      fetchLeads();
    } catch (error) {
      console.error("Erro ao classificar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível classificar o lead",
        variant: "destructive",
      });
    } finally {
      setClassifying(null);
    }
  };

  const classifyAll = async () => {
    setIsClassifyingAll(true);

    for (const lead of leads) {
      await classifyLead(lead);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsClassifyingAll(false);
    toast({
      title: "Concluído!",
      description: "Todos os leads foram classificados",
    });
  };

  const getClassificationBadge = (tags: string[] | null) => {
    if (!tags) return null;
    const classification = tags.find((tag) =>
      ["quente", "morno", "frio"].includes(tag)
    );
    if (!classification) return null;

    const colors = {
      quente: "bg-red-500",
      morno: "bg-yellow-500",
      frio: "bg-blue-500",
    };

    return (
      <Badge className={colors[classification as keyof typeof colors]}>
        {classification}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Classificação por IA</h2>
        <Button
          onClick={classifyAll}
          disabled={isClassifyingAll}
          variant="outline"
        >
          {isClassifyingAll ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Classificando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Classificar Todos
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted"
          >
            <div className="flex-1">
              <div className="font-medium">{lead.name}</div>
              <div className="text-sm text-muted-foreground">
                {lead.company || "Sem empresa"} • {lead.phone}
              </div>
              <div className="mt-2">{getClassificationBadge(lead.tags)}</div>
            </div>

            <Button
              onClick={() => classifyLead(lead)}
              disabled={classifying === lead.id}
              size="sm"
              variant="outline"
            >
              {classifying === lead.id ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Classificando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-3 w-3" />
                  Classificar
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
