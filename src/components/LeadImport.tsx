import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const LeadImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseVCF = (text: string) => {
    const vcards = text.split("BEGIN:VCARD").filter(v => v.trim());
    return vcards.map(vcard => {
      const lines = vcard.split("\n");
      const lead: any = { tags: [], status: "active" };
      
      lines.forEach(line => {
        if (line.startsWith("FN:")) lead.name = line.substring(3).trim();
        else if (line.startsWith("TEL")) {
          const tel = line.split(":")[1]?.trim();
          if (!lead.phone) lead.phone = tel;
          if (line.includes("WhatsApp") || line.includes("CELL")) lead.whatsapp = tel;
        }
        else if (line.startsWith("EMAIL")) lead.email = line.split(":")[1]?.trim();
        else if (line.startsWith("ORG:")) lead.company = line.substring(4).trim();
        else if (line.startsWith("ADR")) {
          const parts = line.split(":")[1]?.split(";");
          if (parts && parts.length > 0) lead.endereco = parts.join(", ").trim();
        }
        else if (line.startsWith("BDAY:")) lead.data_nascimento = line.substring(5).trim();
        else if (line.startsWith("TITLE:")) lead.profissao = line.substring(6).trim();
        else if (line.startsWith("NOTE:")) lead.notes = line.substring(5).trim();
        else if (line.includes("X-SOCIALPROFILE") || line.includes("URL")) {
          const url = line.split(":")[1]?.trim().toLowerCase();
          if (url?.includes("facebook")) lead.facebook = url;
          else if (url?.includes("instagram")) lead.instagram = url;
          else if (url?.includes("linkedin")) lead.linkedin = url;
          else if (url?.includes("twitter")) lead.twitter = url;
        }
      });
      
      return lead;
    }).filter(lead => lead.name && lead.phone);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
    const isVCF = file.name.endsWith(".vcf") || file.name.endsWith(".vcard");

    if (!isCSV && !isVCF) {
      toast({
        title: "Erro",
        description: "Por favor, envie um arquivo CSV ou VCF válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      let leads;

      if (isVCF) {
        leads = parseVCF(text);
      } else {
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        const nameIndex = headers.findIndex((h) => h.includes("nome") || h === "name");
        const phoneIndex = headers.findIndex((h) => h.includes("telefone") || h.includes("phone") || h.includes("whatsapp"));
        const emailIndex = headers.findIndex((h) => h.includes("email") || h.includes("e-mail"));
        const companyIndex = headers.findIndex((h) => h.includes("empresa") || h.includes("company"));

        if (nameIndex === -1 || phoneIndex === -1) {
          toast({
            title: "Erro no CSV",
            description: "O arquivo deve conter pelo menos as colunas: Nome e Telefone",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        leads = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          return {
            name: values[nameIndex],
            phone: values[phoneIndex],
            email: emailIndex !== -1 ? values[emailIndex] : null,
            company: companyIndex !== -1 ? values[companyIndex] : null,
            tags: [],
            status: "active",
          };
        }).filter((lead) => lead.name && lead.phone);
      }

      const { error } = await supabase.from("leads").insert(leads);

      if (error) throw error;

      toast({
        title: "Sucesso! 🎉",
        description: `${leads.length} leads importados com sucesso`,
      });

      e.target.value = "";
    } catch (error) {
      console.error("Error importing leads:", error);
      toast({
        title: "Erro",
        description: "Falha ao importar leads. Verifique o formato do arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 bg-primary/10 rounded-full">
          <FileSpreadsheet className="h-12 w-12 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Importar Leads</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Envie um arquivo CSV ou VCF com suas leads
          </p>
          <p className="text-xs text-muted-foreground">
            CSV: Nome, Telefone (obrigatórios) | Email, Empresa (opcionais)
          </p>
          <p className="text-xs text-muted-foreground">
            VCF: Formato vCard padrão
          </p>
        </div>
        <Input
          id="file-upload"
          type="file"
          accept=".csv,.vcf,.vcard"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isLoading}
        />
        <Button asChild disabled={isLoading}>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? "Importando..." : "Escolher Arquivo (CSV/VCF)"}
          </label>
        </Button>
      </div>
    </Card>
  );
};
