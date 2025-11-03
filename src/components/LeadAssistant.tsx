import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2, Bot } from "lucide-react";

export const LeadAssistant = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeadsData();
  }, []);

  const fetchLeadsData = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .limit(50);

    if (!error && data) {
      setLeadsData(data);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Aviso",
        description: "Digite uma pergunta",
        variant: "destructive",
      });
      return;
    }

    setIsAsking(true);

    try {
      const { data, error } = await supabase.functions.invoke("lead-assistant", {
        body: {
          question: question,
          leadsData: leadsData,
        },
      });

      if (error) throw error;

      setAnswer(data.answer);
    } catch (error) {
      console.error("Erro ao consultar assistente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível obter resposta",
        variant: "destructive",
      });
    } finally {
      setIsAsking(false);
    }
  };

  const suggestedQuestions = [
    "Quantos leads tenho no total?",
    "Quais empresas aparecem mais?",
    "Quais leads não têm email?",
    "Sugira estratégias para leads sem empresa",
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Assistente Virtual</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Pergunte sobre seus leads
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Quantos leads ativos eu tenho?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && askQuestion()}
            />
            <Button onClick={askQuestion} disabled={isAsking}>
              {isAsking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Perguntas sugeridas:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <Button
                key={q}
                onClick={() => setQuestion(q)}
                variant="outline"
                size="sm"
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {answer && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Resposta:
            </h3>
            <p className="whitespace-pre-wrap">{answer}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
