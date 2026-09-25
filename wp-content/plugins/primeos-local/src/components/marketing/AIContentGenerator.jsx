// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Copy, 
  Loader2, 
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

export default function AIContentGenerator({ performanceData }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    contentType: 'ad_copy',
    platform: 'Google Ads',
    audience: '',
    objective: '',
    context: ''
  });

  const generateContent = async () => {
    setLoading(true);
    try {
      const { data } = await primeos.functions.invoke('generateMarketingContent', {
        ...formData,
        performanceData
      });

      if (data.success) {
        setResults(data.content);
        toast.success('Conteúdo gerado com sucesso!');
      } else {
        toast.error('Erro ao gerar conteúdo');
      }
    } catch (error) {
      toast.error('Erro ao gerar conteúdo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Gerador de Conteúdo com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Conteúdo</Label>
              <Select 
                value={formData.contentType} 
                onValueChange={(v) => setFormData({ ...formData, contentType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ad_copy">Copy para Anúncios</SelectItem>
                  <SelectItem value="social_media">Posts para Redes Sociais</SelectItem>
                  <SelectItem value="email_sequence">Sequência de Emails</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Plataforma</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(v) => setFormData({ ...formData, platform: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Email">Email Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Público-Alvo</Label>
            <Input
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              placeholder="Ex: Mulheres 25-45 anos interessadas em bem-estar"
            />
          </div>

          <div>
            <Label>Objetivo</Label>
            <Input
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              placeholder="Ex: Aumentar agendamentos em 30%"
            />
          </div>

          <div>
            <Label>Contexto do Negócio</Label>
            <Textarea
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              placeholder="Descreva seu negócio, proposta de valor, diferenciais..."
              rows={3}
            />
          </div>

          {performanceData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Dados de performance detectados
                </span>
              </div>
              <p className="text-xs text-blue-700">
                A IA usará seus dados de performance para otimizar as sugestões
              </p>
            </div>
          )}

          <Button
            onClick={generateContent}
            disabled={loading || !formData.audience || !formData.objective}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando conteúdo...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Conteúdo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Conteúdo Gerado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.variations && (
              <div className="space-y-4">
                {results.variations.map((variation, idx) => (
                  <Card key={idx} className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">Variação {idx + 1}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${variation.headline}\n\n${variation.body}\n\n${variation.cta}`)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-slate-500">Título</Label>
                          <p className="font-bold text-slate-900">{variation.headline}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Copy Principal</Label>
                          <p className="text-slate-700">{variation.body}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Call-to-Action</Label>
                          <p className="text-purple-600 font-medium">{variation.cta}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <Label className="text-xs text-slate-500">Estratégia</Label>
                          <p className="text-xs text-slate-600">{variation.strategy}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {results.ideas && (
              <div className="space-y-4">
                {results.ideas.map((idea, idx) => (
                  <Card key={idx} className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">Ideia {idx + 1}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${idea.theme}\n\n${idea.copy}\n\n${idea.hashtags.join(' ')}`)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-slate-500">Tipo</Label>
                          <Badge className="bg-indigo-100 text-indigo-700">{idea.type}</Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Tema</Label>
                          <p className="font-bold text-slate-900">{idea.theme}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Copy</Label>
                          <p className="text-slate-700 whitespace-pre-line">{idea.copy}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Hashtags</Label>
                          <p className="text-blue-600 text-sm">{idea.hashtags.join(' ')}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                          <div>
                            <Label className="text-xs text-slate-500">Melhor Horário</Label>
                            <p className="text-xs text-slate-700">{idea.bestTime}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-500">Objetivo</Label>
                            <p className="text-xs text-slate-700">{idea.objective}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {results.sequence && (
              <div className="space-y-4">
                {results.sequence.map((email, idx) => (
                  <Card key={idx} className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Email {idx + 1}</Badge>
                          <Badge className="bg-amber-100 text-amber-700">{email.timing}</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`Assunto: ${email.subject}\n\nPreview: ${email.previewText}\n\n${email.body}\n\n${email.cta}`)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-slate-500">Assunto</Label>
                          <p className="font-bold text-slate-900">{email.subject}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Preview Text</Label>
                          <p className="text-sm text-slate-600">{email.previewText}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Corpo do Email</Label>
                          <p className="text-slate-700 text-sm whitespace-pre-line">{email.body}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500">Call-to-Action</Label>
                          <p className="text-purple-600 font-medium">{email.cta}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <Label className="text-xs text-slate-500">Objetivo</Label>
                          <p className="text-xs text-slate-600">{email.objective}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
