import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dashboard } from "@/components/Dashboard";
import { LeadImport } from "@/components/LeadImport";
import { LeadsTable } from "@/components/LeadsTable";
import { MessageTemplates } from "@/components/MessageTemplates";
import { BulkMessaging } from "@/components/BulkMessaging";
import { AIClassifier } from "@/components/AIClassifier";
import { MessageGenerator } from "@/components/MessageGenerator";
import { LeadAssistant } from "@/components/LeadAssistant";
import { FollowUpSuggestions } from "@/components/FollowUpSuggestions";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sistema de Gestão de Leads
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie seus contatos com inteligência artificial
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="bulk">Envio Massa</TabsTrigger>
            <TabsTrigger value="classifier">Classificar</TabsTrigger>
            <TabsTrigger value="generator">Gerador</TabsTrigger>
            <TabsTrigger value="assistant">Assistente</TabsTrigger>
            <TabsTrigger value="followup">Follow-up</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="import">
            <LeadImport />
            <div className="mt-6 bg-card p-6 rounded-lg border">
              <h3 className="font-semibold mb-3">📋 Formato do CSV/VCF</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Importe seus contatos em formato CSV ou VCF (vCard)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="leads">
            <LeadsTable />
          </TabsContent>

          <TabsContent value="templates">
            <MessageTemplates />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkMessaging />
          </TabsContent>

          <TabsContent value="classifier">
            <AIClassifier />
          </TabsContent>

          <TabsContent value="generator">
            <MessageGenerator />
          </TabsContent>

          <TabsContent value="assistant">
            <LeadAssistant />
          </TabsContent>

          <TabsContent value="followup">
            <FollowUpSuggestions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
