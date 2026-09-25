// @ts-nocheck
import PageHeader from "@/components/shared/PageHeader";
import AIChatbot from "@/components/ai/AIChatbot";
import FeedbackAnalysis from "@/components/ai/FeedbackAnalysis";
import ContentGenerator from "@/components/ai/ContentGenerator";
import DealForecasting from "@/components/ai/DealForecasting";
import OpportunitySuggestions from "@/components/ai/OpportunitySuggestions";
import FollowUpReminders from "@/components/ai/FollowUpReminders";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageCircle, BarChart3, PenTool, TrendingUp, Zap, Bell } from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Assistente de IA"
          subtitle="Chatbot, análise de feedback e geração de conteúdo automatizado — incluindo persona de Governo PrimeOs App Hub"
          icon={Bot}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Chatbot</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">✓</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Feedback</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">IA</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Conteúdo</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">ON</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Previsão</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">ON</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Upsell</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">IA</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Follow-up</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">ON</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chatbot" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="chatbot" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Chatbot
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <PenTool className="w-4 h-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="forecast" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Previsão
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="gap-2">
              <Zap className="w-4 h-4" />
              Upsell
            </TabsTrigger>
            <TabsTrigger value="followup" className="gap-2">
              <Bell className="w-4 h-4" />
              Follow-up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chatbot">
            <AIChatbot />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackAnalysis />
          </TabsContent>

          <TabsContent value="content">
            <ContentGenerator />
          </TabsContent>

          <TabsContent value="forecast">
            <DealForecasting />
          </TabsContent>

          <TabsContent value="opportunities">
            <OpportunitySuggestions />
          </TabsContent>

          <TabsContent value="followup">
            <FollowUpReminders />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
