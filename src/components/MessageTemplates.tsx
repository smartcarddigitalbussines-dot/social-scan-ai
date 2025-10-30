import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[] | null;
}

export const MessageTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const extractVariables = (content: string): string[] => {
    const regex = /{(\w+)}/g;
    const matches = content.match(regex);
    return matches ? matches.map((m) => m.slice(1, -1)) : [];
  };

  const addTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Erro",
        description: "Preencha o nome e o conteúdo do template",
        variant: "destructive",
      });
      return;
    }

    try {
      const variables = extractVariables(newTemplate.content);
      const { error } = await supabase.from("message_templates").insert({
        name: newTemplate.name,
        content: newTemplate.content,
        variables,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Template criado com sucesso",
      });

      setNewTemplate({ name: "", content: "" });
      setIsAdding(false);
      fetchTemplates();
    } catch (error) {
      console.error("Error adding template:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o template",
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase.from("message_templates").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Template removido",
        description: "O template foi excluído com sucesso",
      });
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Templates de Mensagem
        </h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="p-6 border-2 border-primary/30">
          <div className="space-y-4">
            <Input
              placeholder="Nome do template"
              value={newTemplate.name}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, name: e.target.value })
              }
            />
            <Textarea
              placeholder="Conteúdo da mensagem (use {nome}, {empresa} para variáveis)"
              value={newTemplate.content}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, content: e.target.value })
              }
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={addTemplate}>Criar Template</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-lg">{template.name}</h4>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteTemplate(template.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
              {template.content}
            </p>
            {template.variables && template.variables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <Badge key={variable} variant="secondary">
                    {`{${variable}}`}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
