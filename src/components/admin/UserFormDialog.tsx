import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { PERMISSION_MODULES } from '@/lib/adminSections';
import type { AdminUser } from '@/hooks/useAdminUsers';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUser | null;
  onSaved: () => void;
}

type Role = 'admin' | 'manager' | 'staff';

export function UserFormDialog({ open, onOpenChange, user, onSaved }: UserFormDialogProps) {
  const { tenantId } = useTenant();
  const isEdit = !!user;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [modules, setModules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFullName(user?.full_name ?? '');
    setEmail(user?.email ?? '');
    setPassword('');
    setRole((user?.tenantRole as Role) ?? 'staff');
    setModules(user?.modules ?? []);
  }, [open, user]);

  const toggleModule = (name: string) => {
    setModules((prev) => (prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]));
  };

  const handleSave = async () => {
    if (!tenantId) return;
    if (!fullName.trim()) {
      toast.error('Informe o nome do usuário');
      return;
    }
    if (!isEdit && (!email.trim() || password.length < 8)) {
      toast.error('Informe e-mail e senha com ao menos 8 caracteres');
      return;
    }
    if (isEdit && password && password.length < 8) {
      toast.error('A nova senha deve ter ao menos 8 caracteres');
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.functions.invoke('manage-tenant-user', {
      body: isEdit
        ? {
            action: 'update',
            restaurant_id: tenantId,
            user_id: user!.id,
            full_name: fullName,
            password: password || undefined,
            role,
            modules,
          }
        : {
            action: 'create',
            restaurant_id: tenantId,
            email,
            password,
            full_name: fullName,
            role,
            modules,
          },
    });
    setSaving(false);

    const payload = data as { success?: boolean; error?: string } | null;
    if (error || !payload?.success) {
      toast.error(payload?.error || error?.message || 'Erro ao salvar usuário');
      return;
    }

    toast.success(isEdit ? 'Usuário atualizado!' : 'Usuário criado com sucesso!');
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar usuário' : 'Novo usuário'}</DialogTitle>
          <DialogDescription>
            Defina o cargo e os módulos que este usuário poderá acessar neste estabelecimento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Nome completo</Label>
            <Input
              id="user-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex.: Maria Souza"
              className="bg-surface placeholder:text-surface-foreground border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">E-mail</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              disabled={isEdit}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@email.com"
              className="bg-surface placeholder:text-surface-foreground border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">{isEdit ? 'Nova senha (opcional)' : 'Senha'}</Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="bg-surface placeholder:text-surface-foreground border-border"
            />
          </div>

          <div className="space-y-2">
            <Label>Cargo</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="bg-surface border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin — acesso total</SelectItem>
                <SelectItem value="manager">Gerente — módulos escolhidos</SelectItem>
                <SelectItem value="staff">Equipe — módulos escolhidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'admin' ? (
            <div className="flex items-start gap-2 rounded-md border border-border bg-surface p-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span>Administradores têm acesso a todos os módulos e configurações deste estabelecimento.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Módulos permitidos</Label>
              <div className="grid gap-2 rounded-md border border-border bg-surface p-3 max-h-64 overflow-y-auto">
                {PERMISSION_MODULES.map((m) => (
                  <label key={m.name} className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={modules.includes(m.name)}
                      onCheckedChange={() => toggleModule(m.name)}
                    />
                    <span className="text-sm">
                      <span className="font-medium text-foreground">{m.label}</span>
                      <span className="block text-xs text-muted-foreground">{m.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEdit ? 'Salvar' : 'Criar usuário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}