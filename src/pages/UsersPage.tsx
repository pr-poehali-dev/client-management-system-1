import { useState } from 'react';
import { AppContext } from '@/App';
import { Role, User } from '@/types/crm';
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

type PanelType = 'password' | 'edit' | null;

export default function UsersPage({ ctx }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [branchId, setBranchId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [activePanel, setActivePanel] = useState<{ id: string; type: PanelType }>({ id: '', type: null });

  const [passwordValue, setPasswordValue] = useState('');
  const [passwordShow, setPasswordShow] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordDone, setPasswordDone] = useState<string | null>(null);

  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Role>('admin');
  const [editBranchId, setEditBranchId] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const { state, addUser, updateUser, removeUser, updateUserPassword } = ctx;
  const { users, branches } = state;

  const getBranchName = (id?: string | null) => id ? branches.find(b => b.id === id)?.name || '—' : 'Все филиалы';

  const openPanel = (userId: string, type: PanelType, user?: User) => {
    if (activePanel.id === userId && activePanel.type === type) {
      setActivePanel({ id: '', type: null });
      return;
    }
    setActivePanel({ id: userId, type });
    setPasswordValue('');
    setPasswordShow(false);
    if (type === 'edit' && user) {
      setEditName(user.name);
      setEditRole(user.role);
      setEditBranchId(user.branchId || '');
    }
  };

  const handleAdd = async () => {
    if (!name.trim() || saving) return;
    if (role === 'admin' && !branchId) return;
    setSaving(true);
    await addUser({ name: name.trim(), role, branchId: role === 'admin' ? branchId : undefined, password: newPassword });
    setName(''); setRole('admin'); setBranchId(''); setNewPassword('');
    setShowForm(false);
    setSaving(false);
  };

  const handleSetPassword = async () => {
    if (!activePanel.id || !passwordValue.trim() || passwordSaving) return;
    setPasswordSaving(true);
    await updateUserPassword(activePanel.id, passwordValue.trim());
    setPasswordDone(activePanel.id);
    setActivePanel({ id: '', type: null });
    setPasswordValue('');
    setPasswordSaving(false);
    setTimeout(() => setPasswordDone(null), 3000);
  };

  const handleEditSave = async () => {
    if (!editName.trim() || editSaving) return;
    if (editRole === 'admin' && !editBranchId) return;
    setEditSaving(true);
    await updateUser({
      id: activePanel.id,
      name: editName.trim(),
      role: editRole,
      branchId: editRole === 'admin' ? editBranchId : undefined,
    });
    setActivePanel({ id: '', type: null });
    setEditSaving(false);
  };

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Сотрудники</h1>
          <p className="text-muted-foreground text-sm mt-1">Управление доступом и паролями</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setActivePanel({ id: '', type: null }); }}
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
            <input
              type="text"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Пароль для входа"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={handleAdd}
              disabled={!name.trim() || (role === 'admin' && !branchId) || saving}
              className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />}
              {saving ? 'Сохранение...' : 'Добавить сотрудника'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/20 transition-all">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
                  {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{getBranchName(user.branchId)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${roleBadge[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
                {passwordDone === user.id && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Icon name="CheckCircle" size={12} /> Пароль задан
                  </span>
                )}
                <button
                  onClick={() => openPanel(user.id, 'edit', user)}
                  className={`p-1.5 rounded transition-colors ${activePanel.id === user.id && activePanel.type === 'edit' ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Редактировать"
                >
                  <Icon name="Pencil" size={14} />
                </button>
                <button
                  onClick={() => openPanel(user.id, 'password')}
                  className={`p-1.5 rounded transition-colors ${activePanel.id === user.id && activePanel.type === 'password' ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Установить пароль"
                >
                  <Icon name="KeyRound" size={14} />
                </button>
                <button
                  onClick={() => removeUser(user.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded"
                  title="Удалить"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>

            {activePanel.id === user.id && activePanel.type === 'edit' && (
              <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-2.5">Редактирование сотрудника</p>
                <div className="space-y-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Имя и фамилия"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground"
                  />
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    {(Object.keys(roleLabels) as Role[]).map(r => (
                      <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                  </select>
                  {editRole === 'admin' && (
                    <select
                      value={editBranchId}
                      onChange={e => setEditBranchId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      <option value="">Выберите филиал</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleEditSave}
                      disabled={!editName.trim() || (editRole === 'admin' && !editBranchId) || editSaving}
                      className="flex-1 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                    >
                      {editSaving
                        ? <span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        : <Icon name="Check" size={14} />}
                      Сохранить
                    </button>
                    <button
                      onClick={() => setActivePanel({ id: '', type: null })}
                      className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activePanel.id === user.id && activePanel.type === 'password' && (
              <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-2.5">Установить новый пароль для входа</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={passwordShow ? 'text' : 'password'}
                      value={passwordValue}
                      onChange={e => setPasswordValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
                      placeholder="Новый пароль"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordShow(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Icon name={passwordShow ? 'EyeOff' : 'Eye'} size={13} />
                    </button>
                  </div>
                  <button
                    onClick={handleSetPassword}
                    disabled={!passwordValue.trim() || passwordSaving}
                    className="px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                  >
                    {passwordSaving
                      ? <span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      : <Icon name="Check" size={14} />}
                    Сохранить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
