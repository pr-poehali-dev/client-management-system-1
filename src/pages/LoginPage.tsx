import { useState } from 'react';
import { AppContext } from '@/App';
import Icon from '@/components/ui/icon';

interface Props { ctx: AppContext; }

export default function LoginPage({ ctx }: Props) {
  const [selected, setSelected] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSelect = (id: string) => {
    setSelected(id);
    setPassword('');
    setError('');
  };

  const handleLogin = async () => {
    if (!selected || loading) return;
    setLoading(true);
    setError('');
    const res = await ctx.login(selected, password);
    if (!res.ok) {
      setError(res.error || 'Ошибка входа');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-10">
          <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">CRM Система</div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Вход в систему</h1>
          <p className="text-muted-foreground mt-2 text-sm">Выберите сотрудника для продолжения</p>
        </div>

        <div className="space-y-2 mb-6">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => handleSelect(user.id)}
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

        {selected && (
          <div className="mb-4 animate-fade-in">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Введите пароль"
                className={`w-full px-4 py-3 rounded-lg border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground pr-10 ${error ? 'border-destructive' : 'border-border'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </button>
            </div>
            {error && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={12} />
                {error}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={!selected || loading}
          className="w-full py-3 rounded-lg bg-foreground text-background font-medium text-sm transition-all duration-150 hover:bg-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />}
          {loading ? 'Проверка...' : 'Войти'}
        </button>
      </div>
    </div>
  );
}
