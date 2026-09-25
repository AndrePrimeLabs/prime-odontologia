// @ts-nocheck
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

export default function MultiUserAssignment({ responsaveis = [], onChange }) {
  const [newUser, setNewUser] = useState("");

  const handleAdd = () => {
    if (newUser.trim() && !responsaveis.includes(newUser.trim())) {
      onChange([...responsaveis, newUser.trim()]);
      setNewUser("");
    }
  };

  const handleRemove = (user) => {
    onChange(responsaveis.filter(r => r !== user));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">Responsáveis</label>

      <div className="space-y-2">
        {responsaveis.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-lg">
            {responsaveis.map(user => (
              <Badge key={user} variant="secondary" className="flex items-center gap-1">
                {user}
                <button
                  onClick={() => handleRemove(user)}
                  className="hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Nome da pessoa..."
            value={newUser}
            onChange={e => setNewUser(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <Button
            onClick={handleAdd}
            variant="outline"
            size="sm"
            disabled={!newUser.trim() || responsaveis.includes(newUser.trim())}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
