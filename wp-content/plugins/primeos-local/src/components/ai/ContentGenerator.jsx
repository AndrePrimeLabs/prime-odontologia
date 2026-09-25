// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenTool, Copy, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ContentGenerator() {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [formData, setFormData] = useState({
    contentType: "post",
    topic: "",
    segmentId: "",
    tone: "professional",
    platform: "email"
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["segments"],
    queryFn: () => primeos.entities.CustomerSegment.list(),
  });

  const generateContent = async () => {
    if (!formData.topic) {
      toast.error("Digite um tópico");
      return;
    }

    setLoading(true);
    try {
      const response = await primeos.functions.invoke('generateMarketingContent', formData);

      if (response.data.success) {
        setContent(response.data.data);
        toast.success("Conteúdo gerado!");
      }
    } catch (error) {
      toast.error("Erro ao gerar conteúdo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-purple-600" />
            Gerador de Conteúdo IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tópico / Tema *</Label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Ex: Invisalign para adultos"
              />
            </div>

            <div>
              <Label>Segmento</Label>
              <Select
                value={formData.segmentId}
                onValueChange={(value) => setFormData({ ...formData, segmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhum</SelectItem>
                  {segments.map((seg) => (
                    <SelectItem key={seg.id} value={seg.id}>
                      {seg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Plataforma</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Marketing</SelectItem>
                  <SelectItem value="social_media">Redes Sociais</SelectItem>
                  <SelectItem value="blog">Blog / Artigo</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tom de Voz</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => setFormData({ ...formData, tone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="friendly">Amigável</SelectItem>
                  <SelectItem value="educational">Educativo</SelectItem>
                  <SelectItem value="promotional">Promocional</SelectItem>
                  <SelectItem value="empathetic">Empático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateContent}
            disabled={loading || !formData.topic}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
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

      {content && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Conteúdo Gerado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.subject && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Assunto</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(content.subject)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <Input value={content.subject} readOnly />
              </div>
            )}

            {content.preheader && (
              <div>
                <Label>Pré-header</Label>
                <Input value={content.preheader} readOnly />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Conteúdo</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(content.content)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <Textarea value={content.content} readOnly rows={12} />
            </div>

            {content.cta && (
              <div>
                <Label>Call to Action</Label>
                <Input value={content.cta} readOnly />
              </div>
            )}

            {content.hashtags?.length > 0 && (
              <div>
                <Label>Hashtags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {content.hashtags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {content.performance_tips?.length > 0 && (
              <div>
                <Label>Dicas de Performance</Label>
                <ul className="mt-2 space-y-1">
                  {content.performance_tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
