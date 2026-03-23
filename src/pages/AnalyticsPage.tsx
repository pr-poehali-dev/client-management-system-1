import { useState } from 'react';
import { AppContext } from '@/App';
import { EventType } from '@/types/crm';

interface Props { ctx: AppContext; }

const eventTypes: EventType[] = ['inquiry', 'appointment', 'sale'];
const typeLabels: Record<EventType, string> = {
  inquiry: 'Обращения',
  appointment: 'Записи',
  sale: 'Продажи',
};

type ViewMode = 'sources' | 'channels';

export default function AnalyticsPage({ ctx }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('sources');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const { state } = ctx;
  const { events, branches, channels, adSources, users } = state;

  const getName = (id: string, arr: { id: string; name: string }[]) =>
    arr.find(x => x.id === id)?.name || '—';

  let filtered = [...events];
  if (filterBranch !== 'all') filtered = filtered.filter(e => e.branchId === filterBranch);
  if (filterUser !== 'all') filtered = filtered.filter(e => e.userId === filterUser);

  const items = viewMode === 'sources' ? adSources : channels;
  const idKey = viewMode === 'sources' ? 'adSourceId' : 'channelId';

  return (
    <div className="p-8 max-w-6xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Аналитика</h1>
        <p className="text-muted-foreground text-sm mt-1">Детальная разбивка по источникам, каналам и филиалам</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode('sources')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'sources' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Рекламные источники
          </button>
          <button
            onClick={() => setViewMode('channels')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'channels' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Каналы связи
          </button>
        </div>

        <select
          value={filterBranch}
          onChange={e => setFilterBranch(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="all">Все филиалы</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="all">Все сотрудники</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          {viewMode === 'sources' ? 'Источники' : 'Каналы'} — итого по типам событий
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {viewMode === 'sources' ? 'Источник' : 'Канал'}
                </th>
                {eventTypes.map(t => (
                  <th key={t} className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {typeLabels[t]}
                  </th>
                ))}
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Итого</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const counts = eventTypes.map(t =>
                  filtered.filter(e => e[idKey as keyof typeof e] === item.id && e.type === t).length
                );
                const total = counts.reduce((a, b) => a + b, 0);
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{item.name}</td>
                    {counts.map((c, i) => (
                      <td key={i} className="px-5 py-3.5 text-right stat-number text-foreground">{c || '—'}</td>
                    ))}
                    <td className="px-5 py-3.5 text-right stat-number font-semibold text-foreground">{total || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filterBranch === 'all' && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Разбивка по филиалам</h2>
          <div className="grid grid-cols-2 gap-4">
            {branches.map(branch => {
              const be = filtered.filter(e => e.branchId === branch.id);
              return (
                <div key={branch.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="font-semibold text-foreground mb-4">{branch.name}</div>
                  <div className="space-y-3">
                    {items.map(item => {
                      const count = be.filter(e => e[idKey as keyof typeof e] === item.id).length;
                      if (count === 0) return null;
                      const maxCount = Math.max(...items.map(i => be.filter(e => e[idKey as keyof typeof e] === i.id).length), 1);
                      return (
                        <div key={item.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-foreground">{item.name}</span>
                            <span className="stat-number text-xs font-medium text-foreground">{count}</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full transition-all duration-500"
                              style={{ width: `${(count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {be.length === 0 && <div className="text-xs text-muted-foreground">Нет данных</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          По сотрудникам — {viewMode === 'sources' ? 'источники' : 'каналы'}
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Сотрудник</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Роль / Филиал</th>
                {eventTypes.map(t => (
                  <th key={t} className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{typeLabels[t]}</th>
                ))}
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Итого</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const ue = filtered.filter(e => e.userId === user.id);
                if (ue.length === 0) return null;
                const counts = eventTypes.map(t => ue.filter(e => e.type === t).length);
                const total = counts.reduce((a, b) => a + b, 0);
                const roleLabel = user.role === 'admin' ? 'Адм' : user.role === 'manager' ? 'Мен' : 'Упр';
                return (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{user.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {roleLabel}{user.branchId ? ` · ${getName(user.branchId, state.branches)}` : ''}
                    </td>
                    {counts.map((c, i) => (
                      <td key={i} className="px-5 py-3.5 text-right stat-number">{c || '—'}</td>
                    ))}
                    <td className="px-5 py-3.5 text-right stat-number font-semibold text-foreground">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
