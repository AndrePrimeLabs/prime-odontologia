// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { primeos } from "@/api/primeosClient";
import { RefreshCw, Settings, Cloud, Wrench, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SetupWizard from "./SetupWizard";

export default function MarketingSyncCard() {
  const [syncing, setSyncing] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [lastSync, setLastSync] = useState({
    googleAds: null,
    facebookAds: null
  });

  // Check which secrets are configured
  const existingSecrets = [
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_DEVELOPER_TOKEN'
  ]; // This will be dynamic based on actual secrets

  const syncPlatform = async (platform) => {
    setSyncing(true);
    try {
      const functionName = platform === 'google' ? 'syncGoogleAds' : 'syncFacebookAds';
      const response = await primeos.functions.invoke(functionName, {});
      
      if (response.data?.success) {
        toast.success(response.data.message);
        setLastSync(prev => ({
          ...prev,
          [platform === 'google' ? 'googleAds' : 'facebookAds']: new Date()
        }));
      } else {
        const error = response.data?.error || response.data?.message || 'Erro ao sincronizar';
        
        if (error.includes('Missing credentials')) {
          toast.error('Configure os secrets primeiro', {
            description: 'Vá em Dashboard → Settings → Secrets',
            duration: 5000
          });
        } else {
          toast.error(error);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const syncAll = async () => {
    setSyncing(true);
    try {
      const response = await primeos.functions.invoke('syncAllMarketingPlatforms', {});
      
      if (response.data?.success) {
        toast.success(response.data.message);
        const now = new Date();
        setLastSync({
          googleAds: now,
          facebookAds: now
        });
      } else {
        toast.error('Erro ao sincronizar algumas plataformas', {
          description: 'Verifique as configurações no Dashboard'
        });
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const platforms = [
    {
      name: 'Google Ads',
      key: 'google',
      color: 'bg-blue-500',
      lastSync: lastSync.googleAds
    },
    {
      name: 'Facebook Ads',
      key: 'facebook',
      color: 'bg-indigo-500',
      lastSync: lastSync.facebookAds
    }
  ];

  return (
    <>
      {showSetup ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              Configurar Integrações
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSetup(false)}
            >
              Voltar
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <SetupWizard 
              platform="google" 
              existingSecrets={existingSecrets}
              onComplete={() => toast.success('Google Ads configurado!')}
            />
            <SetupWizard 
              platform="facebook" 
              existingSecrets={existingSecrets}
              onComplete={() => toast.success('Facebook Ads configurado!')}
            />
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Cloud className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-1">Como funciona?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Após configurar os secrets, o sistema sincronizará automaticamente as métricas 
                    do Google Ads e Facebook Ads todos os dias às 8h. Você também pode sincronizar 
                    manualmente a qualquer momento.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Importa impressões, cliques, gastos e conversões
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Sincronização automática diária
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Histórico dos últimos 30 dias
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                Sincronização Automática
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSetup(true)}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {platforms.map((platform) => (
            <div key={platform.key} className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{platform.name}</span>
                <div className={cn("w-2 h-2 rounded-full", platform.lastSync ? "bg-green-500" : "bg-slate-300")} />
              </div>
              {platform.lastSync && (
                <p className="text-xs text-slate-500 mb-2">
                  Última: {platform.lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => syncPlatform(platform.key)}
                disabled={syncing}
                className="w-full"
              >
                {syncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={syncAll}
          disabled={syncing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {syncing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Todas
            </>
          )}
        </Button>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Settings className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-900 mb-1">Configuração necessária</p>
              <p className="text-xs text-amber-700">
                Configure os secrets das APIs no <strong>Dashboard → Settings → Secrets</strong>
              </p>
            </div>
          </div>
        </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
