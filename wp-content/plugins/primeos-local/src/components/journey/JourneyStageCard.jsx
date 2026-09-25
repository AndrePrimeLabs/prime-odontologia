// @ts-nocheck
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit2, Check } from "lucide-react";
import { useState } from "react";

export default function JourneyStageCard({ stage, stageIndex, onUpdate, onRemove, isEditing }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(stage);

  const stageIcons = {
    awareness: "🔍",
    consideration: "🤔",
    decision: "✅",
    retention: "💎",
    advocacy: "⭐"
  };

  const stageColors = {
    awareness: "border-blue-200 bg-blue-50",
    consideration: "border-purple-200 bg-purple-50",
    decision: "border-green-200 bg-green-50",
    retention: "border-orange-200 bg-orange-50",
    advocacy: "border-pink-200 bg-pink-50"
  };

  const handleSave = () => {
    onUpdate(stageIndex, formData);
    setEditing(false);
  };

  if (editing) {
    return (
      <Card className={`border-2 ${stageColors[stage.stage] || stageColors.awareness}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Input
              value={formData.stage}
              disabled
              className="font-bold"
            />
            <Textarea
              placeholder="Descrição do estágio"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="resize-none"
              rows={3}
            />
            <div className="space-y-2">
              <p className="text-xs font-medium">Características:</p>
              <Textarea
                placeholder="Uma característica por linha"
                value={(formData.characteristics || []).join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  characteristics: e.target.value.split('\n').filter(c => c.trim())
                })}
                className="resize-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <Check className="w-3 h-3 mr-1" />
                Salvar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setFormData(stage);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${stageColors[stage.stage] || stageColors.awareness} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{stageIcons[stage.stage]}</span>
              <h3 className="font-bold text-slate-900 capitalize">{stage.stage}</h3>
            </div>
            {isEditing && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(true)}
                  className="h-7 w-7 p-0"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(stageIndex)}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {stage.description && (
            <p className="text-sm text-slate-700">{stage.description}</p>
          )}

          {stage.characteristics && stage.characteristics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stage.characteristics.map((char, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {char}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
