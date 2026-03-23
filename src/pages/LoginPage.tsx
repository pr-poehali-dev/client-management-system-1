import { useState } from 'react';
import { AppContext } from '@/App';

interface Props { ctx: AppContext; }

export default function LoginPage({ ctx }: Props) {
  const [selected, setSelected] = useState<string>('');

  const { users, branches } = ctx.state;

  const getBranchName = (branchId?: string) => {
    if (!branchId) return '';
    return branches.find(b => b.id === branchId)?.name || '';
  };

  const roleLabel = (role: string) => {
    if (role === 'admin') return 'Администратор';
    if (role === 'manager') return 'Менеджер';
    return 'Управляющий';
  };

  const handleLogin = () => {
    const user = users.find(u => u.id === selected);
    if (user) ctx.login(user);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-10">
          <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">CRM Система</div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Вход в систему</h1>
          <p className="text-muted-foreground mt-2 text-sm">Выберите сотрудника для продолжения</p>
        </div>

        <div className="space-y-2 mb-8">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setSelected(user.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg border text-left transition-all duration-150 ${
                selected === user.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card hover:border-foreground/40 hover:bg-secondary'
              }`}
            >
              <div>
                <div className="font-medium text-sm">{user.name}</div>
                <div className={`text-xs mt-0.5 ${selected === user.id ? 'text-background/60' : 'text-muted-foreground'}`}>
                  {roleLabel(user.role)}{user.branchId ? ` · ${getBranchName(user.branchId)}` : ''}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${selected === user.id ? 'bg-background' : 'bg-border'}`} />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogin}
          disabled={!selected}
          className="w-full py-3 rounded-lg bg-foreground text-background font-medium text-sm transition-all duration-150 hover:bg-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Войти
        </button>
      </div>
    </div>
  );
}
