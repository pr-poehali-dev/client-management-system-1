import { useState } from 'react';
import { AppContext } from '@/App';
import { User, Role } from '@/types/crm';
import Icon from '@/components/ui/icon';

interface Props { ctx: AppContext; }

const roleLabels: Record<Role, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  director: 'Управляющий',
};

const roleBadge: Record<Role, string> = {
  admin: 'bg-blue-50 text-blue-700',
  manager: 'bg-amber-50 text-amber-700',
  director: 'bg-purple-50 text-purple-700',
};

export default function UsersPage({ ctx }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [branchId, setBranchId] = useState('');

  const { state, updateUsers } = ctx;
  const { users, branches } = state;

  const getName = (id: string) => branches.find(b => b.id === id)?.name || '—';

  const handleAdd = () => {
    if (!name.trim()) return;
    const newUser: User = {
      id: `u${Date.now()}`,
      name: name.trim(),
      role,
      branchId: role === 'admin' ? branchId : undefined,
    };
    updateUsers([...users, newUser]);
    setName('');
    setRole('admin');
    setBranchId('');
    setShowForm(false);
  };

  const removeUser = (id: string) => updateUsers(users.filter(u => u.id !== id));

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Сотрудники</h1>
          <p className="text-muted-foreground text-sm mt-1">Управление доступом и ролями</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/80 transition-all"
        >
          <Icon name={showForm ? 'X' : 'Plus'} size={16} />
          {showForm ? 'Отмена' : 'Добавить'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 animate-scale-in">
          <h3 className="font-medium text-foreground mb-4 text-sm">Новый сотрудник</h3>
          <div className="space-y-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Имя и фамилия"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground"
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              {(Object.keys(roleLabels) as Role[]).map(r => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
            {role === 'admin' && (
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="">Выберите филиал</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <button
              onClick={handleAdd}
              disabled={!name.trim() || (role === 'admin' && !branchId)}
              className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Добавить сотрудника
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between px-4 py-3.5 bg-card border border-border rounded-xl hover:border-foreground/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {user.branchId ? getName(user.branchId) : 'Все филиалы'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${roleBadge[user.role]}`}>
                {roleLabels[user.role]}
              </span>
              <button
                onClick={() => removeUser(user.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Icon name="Trash2" size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
