import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dashboard } from "@/components/Dashboard";
import { LeadImport } from "@/components/LeadImport";
import { LeadsTable } from "@/components/LeadsTable";
import { MessageTemplates } from "@/components/MessageTemplates";
import { LayoutDashboard, Users, MessageSquare, Upload } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sistema de Gestão de Leads
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie seus contatos e envie mensagens via WhatsApp
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 py-3">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2 py-3">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Importar</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2 py-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 py-3">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <LeadImport />
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-3">📋 Formato do CSV</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Seu arquivo CSV deve conter as seguintes colunas:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>Nome</strong> (obrigatório)</li>
                <li><strong>Telefone</strong> (obrigatório) - com código do país</li>
                <li>Email (opcional)</li>
                <li>Empresa (opcional)</li>
              </ul>
              <div className="mt-4 p-3 bg-muted rounded text-xs font-mono">
                Nome,Telefone,Email,Empresa<br />
                João Silva,5511999887766,joao@email.com,Empresa ABC<br />
                Maria Santos,5521988776655,maria@email.com,Empresa XYZ
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <LeadsTable />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <MessageTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
