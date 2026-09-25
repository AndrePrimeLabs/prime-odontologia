// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { primeos } from "@/api/primeosClient";
import PageHeader from "@/components/shared/PageHeader";
import NurtureWorkflowBuilder from "@/components/marketing/NurtureWorkflowBuilder";
import ABTestBuilder from "@/components/marketing/ABTestBuilder";
import ABTestResults from "@/components/marketing/ABTestResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export default function MarketingAutomation() {
  const [refreshWorkflows, setRefreshWorkflows] = useState(0);
  const [refreshTests, setRefreshTests] = useState(0);

  const { data: workflows = [] } = useQuery({
    queryKey: ["workflows", refreshWorkflows],
    queryFn: () => primeos.entities.AutomationWorkflow.list(),
  });

  const { data: abTests = [] } = useQuery({
    queryKey: ["ab_tests", refreshTests],
    queryFn: () => primeos.entities.ABTest.list(),
  });

  const activeWorkflows = workflows.filter(w => w.is_active);
  const runningTests = abTests.filter(t => t.status === "running");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Automação de Marketing com IA"
          subtitle="Crie fluxos de nutrição, segmentação dinâmica e testes A/B automatizados"
          icon={Zap}
        />

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workflows">Fluxos de Nutrição</TabsTrigger>
            <TabsTrigger value="tests">Testes A/B</TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">Fluxos Ativos</p>
                  <p className="text-3xl font-bold mt-2">{activeWorkflows.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">Total de Contatos</p>
                  <p className="text-3xl font-bold mt-2">
                    {workflows.reduce((sum, w) => sum + (w.contacts_enrolled || 0), 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">Taxa de Sucesso Média</p>
                  <p className="text-3xl font-bold mt-2">
                    {workflows.length > 0
                      ? (workflows.reduce((sum, w) => sum + (w.success_rate || 0), 0) / workflows.length).toFixed(1)
                      : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <NurtureWorkflowBuilder 
              onCreated={() => setRefreshWorkflows(r => r + 1)}
            />

            {/* Active Workflows */}
            {activeWorkflows.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Fluxos Ativos</h2>
                <div className="grid gap-4">
                  {activeWorkflows.map((workflow) => (
                    <Card key={workflow.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{workflow.name}</CardTitle>
                            <p className="text-xs text-slate-500 mt-1">{workflow.description}</p>
                          </div>
                          <Badge className="bg-green-600">{workflow.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-slate-600">Gatilho</p>
                            <p className="text-sm font-semibold mt-1 capitalize">
                              {workflow.trigger.event_type.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Contatos Inscritos</p>
                            <p className="text-sm font-semibold mt-1">{workflow.contacts_enrolled}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Taxa de Sucesso</p>
                            <p className="text-sm font-semibold mt-1">{workflow.success_rate || 0}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">Testes em Execução</p>
                  <p className="text-3xl font-bold mt-2">{runningTests.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">Total de Testes</p>
                  <p className="text-3xl font-bold mt-2">{abTests.length}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-50">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">Testes Concluídos</p>
                  <p className="text-3xl font-bold mt-2">
                    {abTests.filter(t => t.status === "completed").length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <ABTestBuilder 
              onCreated={() => setRefreshTests(r => r + 1)}
            />

            {/* Running Tests */}
            {runningTests.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Testes em Execução</h2>
                <div className="space-y-4">
                  {runningTests.map((test) => (
                    <ABTestResults key={test.id} test={test} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
