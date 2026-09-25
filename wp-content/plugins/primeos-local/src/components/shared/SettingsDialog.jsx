// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Moon, Sun, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsDialog({ open, onClose, user }) {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [deleting, setDeleting] = useState(false);

  const toggleDarkMode = (enabled) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', enabled ? 'dark' : 'light');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    if (!confirm('ATENÇÃO: Todos os seus dados serão permanentemente deletados. Deseja realmente continuar?')) {
      return;
    }

    setDeleting(true);
    try {
      await primeos.auth.updateMe({ status: 'deleted' });
      toast.success('Conta marcada para exclusão');
      setTimeout(() => {
        primeos.auth.logout();
      }, 2000);
    } catch (error) {
      toast.error('Erro ao excluir conta');
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md select-none">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400">Conta</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.full_name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{user?.email}</p>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5 text-amber-600" />}
              <div>
                <Label>Modo Escuro</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ativar tema escuro</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          {/* Danger Zone */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Zona de Perigo</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Excluir sua conta removerá permanentemente todos os seus dados.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full select-none min-h-[44px] touch-manipulation"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Minha Conta
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
