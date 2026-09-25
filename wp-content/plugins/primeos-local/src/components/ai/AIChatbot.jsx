// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { primeos } from "@/api/primeosClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

const agentGreetings = {
  clara: "Olá! Sou a Clara, assistente virtual da Prime Odontologia. Como posso ajudá-lo hoje?",
  luzia: "Olá! Sou a Luzia, assistente virtual do Governo do PrimeOs App Hub. Como posso atender sua solicitação hoje?"
};

export default function AIChatbot({ customerContext }) {
  const [persona, setPersona] = useState("clara");
  const [messages, setMessages] = useState([{ role: "assistant", content: agentGreetings[persona] }] );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([{ role: "assistant", content: agentGreetings[persona] }]);
  }, [persona]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await primeos.functions.invoke('aiChatbot', {
        message: userMessage,
        conversationHistory: messages,
        customerContext,
        persona
      });

      if (response.data.success) {
        const aiResponse = response.data.data;
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: aiResponse.response,
            intent: aiResponse.intent,
            sentiment: aiResponse.sentiment,
            requiresHuman: aiResponse.requires_human
          }
        ]);

        if (aiResponse.requires_human) {
          toast.warning("Esta solicitação pode precisar de atendimento humano.");
        }
      }
    } catch (error) {
      toast.error("Erro ao processar mensagem: " + error.message);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Desculpe, ocorreu um erro. Por favor, tente novamente." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sentimentColors = {
    positive: "bg-green-100 text-green-700",
    neutral: "bg-slate-100 text-slate-700",
    negative: "bg-red-100 text-red-700"
  };

  return (
    <Card className="border-0 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            Chatbot IA - Prime Odontologia
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Agente</span>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            >
              <option value="clara">Clara (Prime Odontologia)</option>
              <option value="luzia">Luzia (Government PrimeOs App Hub)</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                )}
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.sentiment && (
                    <div className="flex gap-2">
                      <Badge variant="outline" className={`text-xs ${sentimentColors[msg.sentiment]}`}>
                        {msg.sentiment}
                      </Badge>
                      {msg.intent && (
                        <Badge variant="outline" className="text-xs">
                          {msg.intent}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Digite sua mensagem..."
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
