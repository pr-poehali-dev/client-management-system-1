import { useState, useMemo } from 'react';
import { AppContext } from '@/App';
import { EventType } from '@/types/crm';
import Icon from '@/components/ui/icon';
import EventModal from '@/components/EventModal';

interface Props { ctx: AppContext; }

const typeConfig = {
  inquiry: { label: 'Обращение', icon: 'MessageSquare', color: 'text-blue-600', bg: 'bg-blue-50' },
  appointment: { label: 'Запись', icon: 'CalendarCheck', color: 'text-amber-600', bg: 'bg-amber-50' },
  sale: { label: 'Продажа', icon: 'TrendingUp', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

type Period = 'today' | 'week' | 'month' | 'all';
const periodLabels: Record<Period, string> = { today: 'Сегодня', week: 'Неделя', month: 'Месяц', all: 'Всё время' };

function filterByPeriod<T extends { createdAt: string }>(events: T[], period: Period): T[] {
  if (period === 'all') return events;
  const now = new Date();
  const start = new Date();
  if (period === 'today') { start.setHours(0, 0, 0, 0); }
  else if (period === 'week') { start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0); }
  else if (period === 'month') { start.setDate(1); start.setHours(0, 0, 0, 0); }
  return events.filter(e => new Date(e.createdAt) >= start);
}

export default function Dashboard({ ctx }: Props) {
  const [modal, setModal] = useState<EventType | null>(null);
  const [period, setPeriod] = useState<Period>('month');
  const { state } = ctx;
  const { currentUser, events, branches, channels, adSources } = state;

  const isDirector = currentUser?.role === 'director';
  const isAdmin = currentUser?.role === 'admin';

  const scopedEvents = isAdmin
    ? events.filter(e => e.branchId === currentUser?.branchId)
    : events;

  const myEvents = useMemo(() => filterByPeriod(scopedEvents, period), [scopedEvents, period]);

  const counts = {
    inquiry: myEvents.filter(e => e.type === 'inquiry').length,
    appointment: myEvents.filter(e => e.type === 'appointment').length,
    sale: myEvents.filter(e => e.type === 'sale').length,
  };

  const recent = scopedEvents.slice(0, 5);

  const getName = (id: string, arr: { id: string; name: string }[]) =>
    arr.find(x => x.id === id)?.name || '—';

  const getEventLabel = (type: EventType) => typeConfig[type].label;

  const today = new Date().toDateString();
  const todayEvents = scopedEvents.filter(e => new Date(e.createdAt).toDateString() === today);

  return (
    <div className="p-4 md:p-8 max-w-5xl animate-fade-in">
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Дашборд</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isDirector ? 'Вся сеть' : isAdmin ? getName(currentUser?.branchId || '', branches) : 'Все филиалы'}
            {' · '}Сегодня: <span className="stat-number font-medium text-foreground">{todayEvents.length}</span> событий
          </p>
        </div>
      </div>

      {/* Переключатель периода */}
      <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 mb-6 md:mb-8 w-full md:w-fit overflow-x-auto">
        {(Object.keys(periodLabels) as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${period === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        {(Object.keys(typeConfig) as EventType[]).map(type => {
          const cfg = typeConfig[type];
          return (
            <div key={type} className="bg-card border border-border rounded-xl p-3 md:p-5">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className={`p-1.5 md:p-2 rounded-lg ${cfg.bg}`}>
                  <Icon name={cfg.icon} size={16} className={cfg.color} />
                </div>
                <span className="hidden md:block text-xs text-muted-foreground font-medium uppercase tracking-wider">{cfg.label}</span>
              </div>
              <div className="stat-number text-2xl md:text-3xl font-medium text-foreground">{counts[type]}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground mt-1">{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Быстрые действия (не директор) */}
      {!isDirector && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 md:mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {(Object.keys(typeConfig) as EventType[]).map(type => {
              const cfg = typeConfig[type];
              return (
                <button
                  key={type}
                  onClick={() => setModal(type)}
                  className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3 px-2 md:px-5 py-3 md:py-4 bg-card border border-border rounded-xl hover:border-foreground/40 hover:bg-secondary transition-all duration-150 group"
                >
                  <div className={`p-2 rounded-lg ${cfg.bg} group-hover:scale-105 transition-transform`}>
                    <Icon name={cfg.icon} size={16} className={cfg.color} />
                  </div>
                  <span className="font-medium text-xs md:text-sm text-foreground text-center md:text-left">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Таблица по филиалам (директор) */}
      {isDirector && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 md:mb-4">По филиалам</h2>

          {/* Мобил — карточки */}
          <div className="md:hidden space-y-2">
            {branches.map(branch => {
              const be = events.filter(e => e.branchId === branch.id);
              return (
                <div key={branch.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="font-medium text-foreground text-sm mb-3">{branch.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="stat-number text-lg font-medium text-blue-600">{be.filter(e => e.type === 'inquiry').length}</div>
                      <div className="text-[10px] text-muted-foreground">Обращения</div>
                    </div>
                    <div>
                      <div className="stat-number text-lg font-medium text-amber-600">{be.filter(e => e.type === 'appointment').length}</div>
                      <div className="text-[10px] text-muted-foreground">Записи</div>
                    </div>
                    <div>
                      <div className="stat-number text-lg font-medium text-emerald-600">{be.filter(e => e.type === 'sale').length}</div>
                      <div className="text-[10px] text-muted-foreground">Продажи</div>
                    </div>
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
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Филиал</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Обращения</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Записи</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Продажи</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(branch => {
                  const be = events.filter(e => e.branchId === branch.id);
                  return (
                    <tr key={branch.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground">{branch.name}</td>
                      <td className="px-5 py-3.5 text-right stat-number">{be.filter(e => e.type === 'inquiry').length}</td>
                      <td className="px-5 py-3.5 text-right stat-number">{be.filter(e => e.type === 'appointment').length}</td>
                      <td className="px-5 py-3.5 text-right stat-number">{be.filter(e => e.type === 'sale').length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Последние события */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 md:mb-4">Последние события</h2>

        {/* Мобил — карточки */}
        <div className="md:hidden space-y-2">
          {recent.length === 0 ? (
            <div className="bg-card border border-border rounded-xl px-5 py-10 text-center text-muted-foreground text-sm">Событий пока нет</div>
          ) : (
            recent.map(event => {
              const cfg = typeConfig[event.type];
              return (
                <div key={event.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-md ${cfg.bg} ${cfg.color}`}>
                      {getEventLabel(event.type)}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(event.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {!isAdmin && <div>Филиал: <span className="text-foreground">{getName(event.branchId, branches)}</span></div>}
                    <div>Канал: <span className="text-foreground">{getName(event.channelId, channels)}</span></div>
                    <div>Источник: <span className="text-foreground">{getName(event.adSourceId, adSources)}</span></div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Десктоп — таблица */}
        <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center text-muted-foreground text-sm">Событий пока нет</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Тип</th>
                  {!isAdmin && <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Филиал</th>}
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Канал</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Источник</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Время</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(event => {
                  const cfg = typeConfig[event.type];
                  return (
                    <tr key={event.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-md ${cfg.bg} ${cfg.color}`}>
                          {getEventLabel(event.type)}
                        </span>
                      </td>
                      {!isAdmin && <td className="px-5 py-3.5 text-foreground">{getName(event.branchId, branches)}</td>}
                      <td className="px-5 py-3.5 text-foreground">{getName(event.channelId, channels)}</td>
                      <td className="px-5 py-3.5 text-foreground">{getName(event.adSourceId, adSources)}</td>
                      <td className="px-5 py-3.5 text-right text-muted-foreground font-mono text-xs">
                        {new Date(event.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <EventModal ctx={ctx} defaultType={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
