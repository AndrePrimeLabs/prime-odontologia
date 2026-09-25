// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Users, Zap, Pencil, Trash2, Plus, Check, X } from "lucide-react";

const ICONS = { Building, Users, Zap };

const DEFAULT_BLOCKS = [
  {
    id: "fisica",
    title: "Infraestrutura Física",
    icon: "Building",
    items: [
      "Consultórios equipados",
      "Equipamentos odontológicos",
      "Mobiliário e decoração",
      "Sistema de esterilização"
    ]
  },
  {
    id: "humana",
    title: "Infraestrutura Humana",
    icon: "Users",
    items: [
      "Dentistas especialistas",
      "Equipe de atendimento",
      "CRM e marketing",
      "Gestão administrativa"
    ]
  },
  {
    id: "tecnologica",
    title: "Infraestrutura Tecnológica",
    icon: "Zap",
    items: [
      "Prime OS - Sistema de gestão",
      "CRM e automações",
      "AI Agents (Silvia, Government)",
      "Integrações WhatsApp/Redes"
    ]
  }
];

const STORAGE_KEY = "infra_blocks_v1";

function loadBlocks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_BLOCKS;
  } catch { return DEFAULT_BLOCKS; }
}

function saveBlocks(blocks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

export default function InfrastructureEditor() {
  const [blocks, setBlocks] = useState(loadBlocks);
  const [editingBlock, setEditingBlock] = useState(null); // block id
  const [editingTitle, setEditingTitle] = useState("");
  const [editingItemIdx, setEditingItemIdx] = useState(null); // { blockId, idx }
  const [editingItemText, setEditingItemText] = useState("");
  const [addingItem, setAddingItem] = useState(null); // blockId
  const [newItemText, setNewItemText] = useState("");

  const update = (newBlocks) => { setBlocks(newBlocks); saveBlocks(newBlocks); };

  const startEditTitle = (block) => { setEditingBlock(block.id); setEditingTitle(block.title); };
  const saveTitle = (blockId) => {
    update(blocks.map(b => b.id === blockId ? { ...b, title: editingTitle } : b));
    setEditingBlock(null);
  };

  const startEditItem = (blockId, idx, text) => { setEditingItemIdx({ blockId, idx }); setEditingItemText(text); };
  const saveItem = () => {
    const { blockId, idx } = editingItemIdx;
    update(blocks.map(b => b.id === blockId ? { ...b, items: b.items.map((it, i) => i === idx ? editingItemText : it) } : b));
    setEditingItemIdx(null);
  };

  const deleteItem = (blockId, idx) => {
    update(blocks.map(b => b.id === blockId ? { ...b, items: b.items.filter((_, i) => i !== idx) } : b));
  };

  const addItem = (blockId) => {
    if (!newItemText.trim()) return;
    update(blocks.map(b => b.id === blockId ? { ...b, items: [...b.items, newItemText.trim()] } : b));
    setNewItemText(""); setAddingItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Infraestrutura</h2>
        <span className="text-xs text-slate-400">Clique em ✏️ para editar itens</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blocks.map((block) => {
          const Icon = ICONS[block.icon] || Building;
          return (
            <Card key={block.id} className="hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm flex-shrink-0">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  {editingBlock === block.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <Input value={editingTitle} onChange={e => setEditingTitle(e.target.value)}
                        className="h-7 text-sm" onKeyDown={e => e.key === "Enter" && saveTitle(block.id)} autoFocus />
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => saveTitle(block.id)}><Check className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400" onClick={() => setEditingBlock(null)}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 flex-1">
                      <CardTitle className="text-sm flex-1">{block.title}</CardTitle>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-300 hover:text-indigo-500" onClick={() => startEditTitle(block)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {block.items.map((item, idx) => (
                  <div key={idx} className="group flex items-center gap-1 p-2 bg-slate-50 rounded-lg">
                    {editingItemIdx?.blockId === block.id && editingItemIdx?.idx === idx ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input value={editingItemText} onChange={e => setEditingItemText(e.target.value)}
                          className="h-6 text-xs flex-1" onKeyDown={e => { if (e.key === "Enter") saveItem(); if (e.key === "Escape") setEditingItemIdx(null); }} autoFocus />
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600" onClick={saveItem}><Check className="w-3 h-3" /></Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400" onClick={() => setEditingItemIdx(null)}><X className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700 flex-1">{item}</span>
                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-300 hover:text-indigo-500" onClick={() => startEditItem(block.id, idx, item)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => deleteItem(block.id, idx)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add item */}
                {addingItem === block.id ? (
                  <div className="flex items-center gap-1 pt-1">
                    <Input value={newItemText} onChange={e => setNewItemText(e.target.value)}
                      placeholder="Novo item..." className="h-7 text-xs"
                      onKeyDown={e => { if (e.key === "Enter") addItem(block.id); if (e.key === "Escape") setAddingItem(null); }}
                      autoFocus />
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => addItem(block.id)}><Check className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400" onClick={() => setAddingItem(null)}><X className="w-3.5 h-3.5" /></Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-indigo-600 text-xs mt-1"
                    onClick={() => { setAddingItem(block.id); setNewItemText(""); }}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar item
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
