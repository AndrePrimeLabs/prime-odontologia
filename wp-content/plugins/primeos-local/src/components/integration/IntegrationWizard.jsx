// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy,
  Settings,
  Calendar,
  TrendingUp,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const INTEGRATIONS = {
  googleAds: {
    id: 'googleAds',
    name: 'Google Ads',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Sincronize métricas de campanhas automaticamente',
    requiredSecrets: [
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'GOOGLE_ADS_CLIENT_ID', 
      'GOOGLE_ADS_CLIENT_SECRET',
      'GOOGLE_ADS_REFRESH_TOKEN',
      'GOOGLE_ADS_CUSTOMER_ID'
    ],
    steps: [
      {
        title: 'Developer Token',
        secretKey: 'GOOGLE_ADS_DEVELOPER_TOKEN',
        instructions: [
          'Acesse o Google Ads Manager',
          'Vá em Ferramentas → Configurações → Central de API',
          'Copie o Developer Token',
          'Cole em Settings → Secrets'
        ],
        link: 'https://ads.google.com'
      },
      {
        title: 'Client ID e Secret',
        secretKey: 'GOOGLE_ADS_CLIENT_ID',
        secretKey2: 'GOOGLE_ADS_CLIENT_SECRET',
        instructions: [
          'Acesse Google Cloud Console',
          'Crie/selecione um projeto',
          'APIs & Serviços → Credenciais',
          'Crie OAuth 2.0 Client ID',
          'Copie Client ID e Secret'
        ],
        link: 'https://console.cloud.google.com'
      },
      {
        title: 'Refresh Token',
        secretKey: 'GOOGLE_ADS_REFRESH_TOKEN',
        instructions: [
          'Use OAuth Playground',
          'Insira Client ID e Secret',
          'Autorize Google Ads API',
          'Troque código por tokens',
          'Copie o Refresh Token'
        ],
        link: 'https://developers.google.com/oauthplayground'
      },
      {
        title: 'Customer ID',
        secretKey: 'GOOGLE_ADS_CUSTOMER_ID',
        instructions: [
          'Acesse sua conta Google Ads',
          'Veja o ID no topo (XXX-XXX-XXXX)',
          'Use apenas os números (sem hífens)',
          'Cole em Settings → Secrets'
        ],
        link: 'https://ads.google.com'
      }
    ]
  },
  googleCalendar: {
    id: 'googleCalendar',
    name: 'Google Calendar',
    icon: Calendar,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Sincronize eventos do calendário com agendamentos',
    requiresOAuth: true,
    oauthType: 'googlecalendar',
    oauthScopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    steps: [
      {
        title: 'Autorizar Acesso',
        instructions: [
          'Clique no botão "Autorizar Google Calendar"',
          'Faça login com sua conta Google',
          'Conceda permissões de leitura/escrita',
          'Aguarde confirmação de sucesso'
        ]
      }
    ]
  }
};

export default function IntegrationWizard({ existingSecrets = [], authorizedConnectors = [] }) {
  const [open, setOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const getIntegrationProgress = (integration) => {
    if (integration.requiresOAuth) {
      return authorizedConnectors.includes(integration.oauthType) ? 100 : 0;
    }
    const completed = integration.requiredSecrets.filter(s => existingSecrets.includes(s)).length;
    return Math.round((completed / integration.requiredSecrets.length) * 100);
  };

  const isIntegrationComplete = (integration) => {
    return getIntegrationProgress(integration) === 100;
  };

  const totalProgress = Math.round(
    Object.values(INTEGRATIONS).reduce((sum, int) => sum + getIntegrationProgress(int), 0) / 
    Object.values(INTEGRATIONS).length
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const openSettings = () => {
    window.open('/settings', '_blank');
  };

  return (
    <>
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Central de Integrações
            </CardTitle>
            <Badge variant="outline" className="text-indigo-700">
              {Object.values(INTEGRATIONS).filter(isIntegrationComplete).length}/{Object.keys(INTEGRATIONS).length} Configuradas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progresso Geral</span>
              <span className="text-sm font-bold text-indigo-600">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>

          <div className="grid gap-3">
            {Object.values(INTEGRATIONS).map((integration) => {
              const Icon = integration.icon;
              const progress = getIntegrationProgress(integration);
              const isComplete = progress === 100;

              return (
                <button
                  key={integration.id}
                  onClick={() => {
                    setSelectedIntegration(integration);
                    setCurrentStep(0);
                    setOpen(true);
                  }}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                    integration.borderColor,
                    integration.bgColor
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg bg-white")}>
                      <Icon className={cn("w-5 h-5", integration.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                        {isComplete && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{integration.description}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium text-slate-700">{progress}%</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={openSettings}
          >
            <Settings className="w-4 h-4 mr-2" />
            Abrir Settings
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Step-by-step Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedIntegration && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <selectedIntegration.icon className={cn("w-5 h-5", selectedIntegration.color)} />
                  Configurar {selectedIntegration.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Progress Indicator */}
                <div className="flex items-center justify-between">
                  {selectedIntegration.steps.map((step, idx) => {
                    const isStepComplete = step.secretKey2 
                      ? existingSecrets.includes(step.secretKey) && existingSecrets.includes(step.secretKey2)
                      : existingSecrets.includes(step.secretKey) || (selectedIntegration.requiresOAuth && authorizedConnectors.includes(selectedIntegration.oauthType));
                    
                    return (
                      <div key={idx} className="flex items-center">
                        <button
                          onClick={() => setCurrentStep(idx)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                            currentStep === idx 
                              ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                              : isStepComplete
                              ? "bg-green-500 text-white"
                              : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {isStepComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </button>
                        {idx < selectedIntegration.steps.length - 1 && (
                          <div className={cn(
                            "w-12 h-1 mx-2",
                            isStepComplete ? "bg-green-500" : "bg-slate-200"
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current Step Content */}
                {selectedIntegration.steps[currentStep] && (
                  <div className={cn("rounded-lg p-6 space-y-4", selectedIntegration.bgColor)}>
                    <h3 className="font-bold text-lg text-slate-900">
                      {selectedIntegration.steps[currentStep].title}
                    </h3>

                    <ol className="space-y-2">
                      {selectedIntegration.steps[currentStep].instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                            {idx + 1}
                          </Badge>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>

                    {selectedIntegration.steps[currentStep].link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedIntegration.steps[currentStep].link, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir {selectedIntegration.steps[currentStep].title}
                      </Button>
                    )}

                    {/* Secret Keys to Configure */}
                    {selectedIntegration.steps[currentStep].secretKey && (
                      <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="w-4 h-4 text-slate-600" />
                          <p className="text-sm font-medium text-slate-700">
                            Configure em Settings → Secrets:
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                          <code className="text-xs text-slate-900 font-mono">
                            {selectedIntegration.steps[currentStep].secretKey}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(selectedIntegration.steps[currentStep].secretKey)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>

                        {selectedIntegration.steps[currentStep].secretKey2 && (
                          <div className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                            <code className="text-xs text-slate-900 font-mono">
                              {selectedIntegration.steps[currentStep].secretKey2}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(selectedIntegration.steps[currentStep].secretKey2)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    Anterior
                  </Button>

                  <Button
                    onClick={openSettings}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Abrir Settings
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>

                  <Button
                    onClick={() => {
                      if (currentStep < selectedIntegration.steps.length - 1) {
                        setCurrentStep(currentStep + 1);
                      } else {
                        setOpen(false);
                        toast.success(`${selectedIntegration.name} configurado!`);
                      }
                    }}
                  >
                    {currentStep === selectedIntegration.steps.length - 1 ? 'Concluir' : 'Próximo'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
