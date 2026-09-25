// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function SupportChatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Olá! Bem-vindo ao suporte da Prime Odontologia. Como posso ajudar?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await primeos.functions.invoke('supportChatbot', {
        userMessage
      });

      if (response.data.success) {
        const botMessage = response.data.data.answer;
        setMessages(prev => [...prev, { 
          role: "bot", 
          content: botMessage,
          category: response.data.data.category,
          confidence: response.data.data.confidence
        }]);

        if (response.data.data.needs_agent) {
          setMessages(prev => [...prev, {
            role: "bot",
            content: "Parece que sua questão precisa de atenção de um agente. Vou transferir você para um especialista em breve."
          }]);
        }
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm h-[600px] flex flex-col">
      <CardHeader className="border-b bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Chat de Suporte
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-900 rounded-bl-none'
            }`}>
              <p className="text-sm">{msg.content}</p>
              {msg.category && (
                <div className="mt-2 flex gap-1">
                  <Badge variant="outline" className="text-xs">{msg.category}</Badge>
                  {msg.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {(msg.confidence * 100).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-lg rounded-bl-none">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t bg-slate-50 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Digite sua pergunta..."
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
          size="sm"
          className="gap-1"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
