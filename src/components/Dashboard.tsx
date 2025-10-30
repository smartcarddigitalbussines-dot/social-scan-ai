import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, MessageCircle, TrendingUp, Database } from "lucide-react";

interface Stats {
  totalLeads: number;
  activeLeads: number;
  messagesSent: number;
  templates: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    activeLeads: 0,
    messagesSent: 0,
    templates: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: leads } = await supabase.from("leads").select("status");
      const { data: messages } = await supabase.from("message_history").select("id");
      const { data: templates } = await supabase.from("message_templates").select("id");

      setStats({
        totalLeads: leads?.length || 0,
        activeLeads: leads?.filter((l) => l.status === "active").length || 0,
        messagesSent: messages?.length || 0,
        templates: templates?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    {
      title: "Total de Leads",
      value: stats.totalLeads,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      color: "text-blue-600",
    },
    {
      title: "Leads Ativos",
      value: stats.activeLeads,
      icon: TrendingUp,
      gradient: "from-green-500 to-green-600",
      color: "text-green-600",
    },
    {
      title: "Mensagens Enviadas",
      value: stats.messagesSent,
      icon: MessageCircle,
      gradient: "from-purple-500 to-purple-600",
      color: "text-purple-600",
    },
    {
      title: "Templates",
      value: stats.templates,
      icon: Database,
      gradient: "from-orange-500 to-orange-600",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
