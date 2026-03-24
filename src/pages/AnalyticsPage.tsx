import { useState, useMemo } from 'react';
import { AppContext } from '@/App';
import { EventType } from '@/types/crm';
import Icon from '@/components/ui/icon';

interface Props { ctx: AppContext; }

const eventTypes: EventType[] = ['inquiry', 'appointment', 'sale'];
const typeLabels: Record<EventType, string> = {
  inquiry: 'Обращения',
  appointment: 'Записи',
  sale: 'Продажи',
};

type ViewMode = 'sources' | 'channels';
type Period = 'today' | 'week' | 'month' | 'custom';

const periodLabels: Record<Period, string> = {
  today: 'Сегодня',
  week: 'Неделя',
  month: 'Месяц',
  custom: 'Период',
};

function getDateRange(period: Period, from: string, to: string): { start: Date; end: Date } | null {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (period === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { start, end: endOfDay };
  }
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end: endOfDay };
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: endOfDay };
  }
  if (period === 'custom' && from && to) {
    const start = new Date(from + 'T00:00:00');
    const end = new Date(to + 'T23:59:59');
    return { start, end };
  }
  return null;
}

export default function AnalyticsPage({ ctx }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('sources');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [period, setPeriod] = useState<Period>('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { state } = ctx;
  const { events, branches, channels, adSources, users } = state;

  const getName = (id: string, arr: { id: string; name: string }[]) =>
    id === 'unknown' ? 'Неизвестный' : arr.find(x => x.id === id)?.name || '—';

  const filtered = useMemo(() => {
    let result = [...events];

    const range = getDateRange(period, dateFrom, dateTo);
    if (range) {
      result = result.filter(e => {
        const d = new Date(e.createdAt);
        return d >= range.start && d <= range.end;
      });
    }

    if (filterBranch !== 'all') result = result.filter(e => e.branchId === filterBranch);
    if (filterUser !== 'all') result = result.filter(e => e.userId === filterUser);

    return result;
  }, [events, period, dateFrom, dateTo, filterBranch, filterUser]);

  const items = viewMode === 'sources' ? adSources : channels;
  const idKey = viewMode === 'sources' ? 'adSourceId' : 'channelId';

  const totalEvents = filtered.length;
  const todayRange = getDateRange('today', '', '');
  const todayCount = todayRange
    ? events.filter(e => { const d = new Date(e.createdAt); return d >= todayRange.start && d <= todayRange.end; }).length
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-6xl animate-fade-in">
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Аналитика</h1>
          <p className="text-muted-foreground text-sm mt-1">Детальная разбивка по источникам, каналам и филиалам</p>
        </div>
        <div className="text-right">
          <div className="stat-number text-xl md:text-2xl font-medium text-foreground">{totalEvents}</div>
          <div className="text-xs text-muted-foreground">событий · <span className="text-foreground font-medium">{todayCount}</span> сегодня</div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
        {/* Период */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider md:w-16">Период</span>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 overflow-x-auto">
            {(Object.keys(periodLabels) as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <span className="text-muted-foreground text-xs">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          )}
        </div>

        {/* Фильтры и вид */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider md:w-16">Фильтры</span>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
              className="flex-1 md:flex-none px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              <option value="all">Все филиалы</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            <select
              value={filterUser}
              onChange={e => setFilterUser(e.target.value)}
              className="flex-1 md:flex-none px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              <option value="all">Все сотрудники</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 md:ml-auto w-fit">
            <button
              onClick={() => setViewMode('sources')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'sources' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Источники
            </button>
            <button
              onClick={() => setViewMode('channels')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'channels' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Каналы
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl py-16 text-center">
          <Icon name="BarChart2" size={36} className="mx-auto mb-3 text-muted-foreground opacity-30" />
          <div className="text-sm text-muted-foreground">Нет данных за выбранный период</div>
        </div>
      ) : (
        <>
          {/* Итоговая таблица */}
          <div className="mb-6">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {viewMode === 'sources' ? 'Рекламные источники' : 'Каналы связи'} — итого
            </h2>

            {/* Мобил — карточки */}
            <div className="md:hidden space-y-2">
              {items.map(item => {
                const counts = eventTypes.map(t =>
                  filtered.filter(e => e[idKey as keyof typeof e] === item.id && e.type === t).length
                );
                const total = counts.reduce((a, b) => a + b, 0);
                const share = totalEvents > 0 ? Math.round((total / totalEvents) * 100) : 0;
                if (total === 0) return null;
                return (
                  <div key={item.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground text-sm">{item.name}</span>
                      <span className="stat-number text-sm font-semibold text-foreground">{total}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      {eventTypes.map((t, i) => (
                        <div key={t}>
                          <div className="stat-number text-base font-medium text-foreground">{counts[i] || 0}</div>
                          <div className="text-[10px] text-muted-foreground">{typeLabels[t]}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-foreground rounded-full" style={{ width: `${share}%` }} />
                      </div>
                      <span className="stat-number text-xs text-muted-foreground">{share}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Десктоп — таблица */}
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
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
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">Доля</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => {
                    const counts = eventTypes.map(t =>
                      filtered.filter(e => e[idKey as keyof typeof e] === item.id && e.type === t).length
                    );
                    const total = counts.reduce((a, b) => a + b, 0);
                    const share = totalEvents > 0 ? Math.round((total / totalEvents) * 100) : 0;
                    if (total === 0) return null;
                    return (
                      <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-foreground">{item.name}</td>
                        {counts.map((c, i) => (
                          <td key={i} className="px-5 py-3.5 text-right stat-number text-foreground">{c || '—'}</td>
                        ))}
                        <td className="px-5 py-3.5 text-right stat-number font-semibold text-foreground">{total}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-foreground rounded-full" style={{ width: `${share}%` }} />
                            </div>
                            <span className="stat-number text-xs text-muted-foreground w-8">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* По филиалам */}
          {filterBranch === 'all' && (
            <div className="mb-6">
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">По филиалам</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {branches.map(branch => {
                  const be = filtered.filter(e => e.branchId === branch.id);
                  if (be.length === 0) return null;
                  const maxCount = Math.max(...items.map(i => be.filter(e => e[idKey as keyof typeof e] === i.id).length), 1);
                  return (
                    <div key={branch.id} className="bg-card border border-border rounded-xl p-4 md:p-5">
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="font-semibold text-foreground text-sm">{branch.name}</div>
                        <span className="stat-number text-xs text-muted-foreground">{be.length} событий</span>
                      </div>
                      <div className="space-y-3">
                        {items.map(item => {
                          const count = be.filter(e => e[idKey as keyof typeof e] === item.id).length;
                          if (count === 0) return null;
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* По сотрудникам */}
          <div>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">По сотрудникам</h2>

            {/* Мобил — карточки */}
            <div className="md:hidden space-y-2">
              {users.map(user => {
                const ue = filtered.filter(e => e.userId === user.id);
                if (ue.length === 0) return null;
                const counts = eventTypes.map(t => ue.filter(e => e.type === t).length);
                const total = counts.reduce((a, b) => a + b, 0);
                const roleLabel = user.role === 'admin' ? 'Адм' : user.role === 'manager' ? 'Мен' : 'Упр';
                return (
                  <div key={user.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-foreground text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {roleLabel}{user.branchId ? ` · ${getName(user.branchId, state.branches)}` : ''}
                        </div>
                      </div>
                      <span className="stat-number text-sm font-semibold text-foreground">{total}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {eventTypes.map((t, i) => (
                        <div key={t}>
                          <div className="stat-number text-base font-medium text-foreground">{counts[i] || 0}</div>
                          <div className="text-[10px] text-muted-foreground">{typeLabels[t]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Десктоп — таблица */}
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
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
        </>
      )}
    </div>
  );
}