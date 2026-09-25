// @ts-nocheck
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Copy, 
  ChevronRight,
  AlertCircle,
  Zap,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GOOGLE_ADS_STEPS = [
  {
    id: 'developer_token',
    title: 'Developer Token',
    description: 'Obtenha o token de desenvolvedor do Google Ads',
    secretKey: 'GOOGLE_ADS_DEVELOPER_TOKEN',
    instructions: [
      'Acesse o Google Ads Manager: https://ads.google.com',
      'Vá em Ferramentas → Configurações → Central de API',
      'Copie o Developer Token (geralmente começa com letras e números)',
      'Cole o token abaixo'
    ]
  },
  {
    id: 'client_credentials',
    title: 'Client ID e Secret',
    description: 'Configure as credenciais OAuth do Google Cloud',
    secretKey: 'GOOGLE_ADS_CLIENT_ID',
    secretKey2: 'GOOGLE_ADS_CLIENT_SECRET',
    instructions: [
      'Acesse o Google Cloud Console: https://console.cloud.google.com',
      'Crie ou selecione um projeto',
      'Vá em APIs & Serviços → Credenciais',
      'Crie uma ID do cliente OAuth 2.0',
      'Copie Client ID e Client Secret'
    ]
  },
  {
    id: 'refresh_token',
    title: 'Refresh Token',
    description: 'Gere o token de atualização para acesso contínuo',
    secretKey: 'GOOGLE_ADS_REFRESH_TOKEN',
    instructions: [
      'Use a ferramenta OAuth Playground: https://developers.google.com/oauthplayground',
      'Insira o Client ID e Secret',
      'Autorize a API do Google Ads',
      'Troque o código por tokens',
      'Copie o Refresh Token'
    ]
  },
  {
    id: 'customer_id',
    title: 'Customer ID',
    description: 'ID da conta do Google Ads',
    secretKey: 'GOOGLE_ADS_CUSTOMER_ID',
    instructions: [
      'Acesse sua conta do Google Ads',
      'No canto superior direito, veja o número de 10 dígitos',
      'Formato: XXX-XXX-XXXX (use sem os hífens)',
      'Cole apenas os números'
    ]
  }
];

const FACEBOOK_ADS_STEPS = [
  {
    id: 'access_token',
    title: 'Access Token',
    description: 'Token de acesso do Facebook Marketing API',
    secretKey: 'FACEBOOK_ACCESS_TOKEN',
    instructions: [
      'Acesse o Facebook Business Manager: https://business.facebook.com',
      'Vá em Configurações de Negócios → Usuários do Sistema',
      'Crie um novo usuário do sistema',
      'Gere um token de acesso com permissões de ads_read',
      'Copie o token de longa duração (não expira)'
    ]
  },
  {
    id: 'ad_account',
    title: 'Ad Account ID',
    description: 'ID da conta de anúncios do Facebook',
    secretKey: 'FACEBOOK_AD_ACCOUNT_ID',
    instructions: [
      'Acesse o Gerenciador de Anúncios: https://business.facebook.com/adsmanager',
      'No canto superior esquerdo, veja o ID da conta',
      'Formato: act_XXXXXXXXXX',
      'Cole o ID completo incluindo "act_"'
    ]
  }
];

export default function SetupWizard({ platform, onComplete, existingSecrets = [] }) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = platform === 'google' ? GOOGLE_ADS_STEPS : FACEBOOK_ADS_STEPS;
  const platformName = platform === 'google' ? 'Google Ads' : 'Facebook Ads';
  
  const completedSteps = steps.filter(step => {
    if (step.secretKey2) {
      return existingSecrets.includes(step.secretKey) && existingSecrets.includes(step.secretKey2);
    }
    return existingSecrets.includes(step.secretKey);
  });

  const isComplete = completedSteps.length === steps.length;
  const currentSetupStep = steps[currentStep];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const handleOpenSettings = () => {
    window.open('https://app.primeos.com/settings/secrets', '_blank');
  };

  return (
    <>
      <Card 
        className={cn(
          "border-2 cursor-pointer transition-all hover:shadow-lg",
          isComplete ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50"
        )}
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <h3 className="font-bold text-slate-900">{platformName}</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                {steps.map((step, idx) => {
                  const isStepComplete = step.secretKey2 
                    ? existingSecrets.includes(step.secretKey) && existingSecrets.includes(step.secretKey2)
                    : existingSecrets.includes(step.secretKey);
                  
                  return (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      {isStepComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                      <span className={isStepComplete ? "text-green-700" : "text-slate-600"}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {completedSteps.length}/{steps.length}
                </span>
              </div>
            </div>
            
            <ChevronRight className="w-5 h-5 text-slate-400 ml-4" />
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Configurar {platformName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => {
                const isStepComplete = step.secretKey2 
                  ? existingSecrets.includes(step.secretKey) && existingSecrets.includes(step.secretKey2)
                  : existingSecrets.includes(step.secretKey);
                
                return (
                  <div key={step.id} className="flex items-center">
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
                    {idx < steps.length - 1 && (
                      <div className={cn(
                        "w-12 h-1 mx-2",
                        isStepComplete ? "bg-green-500" : "bg-slate-200"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current Step */}
            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">
                  {currentSetupStep.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {currentSetupStep.description}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Instruções:</p>
                <ol className="space-y-2">
                  {currentSetupStep.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                        {idx + 1}
                      </Badge>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Secret Keys */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <p className="text-sm font-medium text-slate-700">
                    Configure no Dashboard:
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                    <code className="text-xs text-slate-900 font-mono">
                      {currentSetupStep.secretKey}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(currentSetupStep.secretKey)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {currentSetupStep.secretKey2 && (
                    <div className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                      <code className="text-xs text-slate-900 font-mono">
                        {currentSetupStep.secretKey2}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(currentSetupStep.secretKey2)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>

              <Button
                onClick={handleOpenSettings}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Abrir Settings
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>

              <Button
                onClick={() => {
                  if (currentStep < steps.length - 1) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    setOpen(false);
                    if (onComplete) onComplete();
                  }
                }}
              >
                {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
