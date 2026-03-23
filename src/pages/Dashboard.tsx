import { useState } from 'react';
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

export default function Dashboard({ ctx }: Props) {
  const [modal, setModal] = useState<EventType | null>(null);
  const { state } = ctx;
  const { currentUser, events, branches, channels, adSources } = state;

  const isDirector = currentUser?.role === 'director';
  const isAdmin = currentUser?.role === 'admin';

  const myEvents = isDirector
    ? events
    : isAdmin
      ? events.filter(e => e.branchId === currentUser?.branchId)
      : events;

  const counts = {
    inquiry: myEvents.filter(e => e.type === 'inquiry').length,
    appointment: myEvents.filter(e => e.type === 'appointment').length,
    sale: myEvents.filter(e => e.type === 'sale').length,
  };

  const recent = myEvents.slice(0, 5);

  const getName = (id: string, arr: { id: string; name: string }[]) =>
    arr.find(x => x.id === id)?.name || '—';

  const getEventLabel = (type: EventType) => typeConfig[type].label;

  const today = new Date().toDateString();
  const todayEvents = myEvents.filter(e => new Date(e.createdAt).toDateString() === today);

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isDirector ? 'Вся сеть' : isAdmin ? getName(currentUser?.branchId || '', branches) : 'Все филиалы'}
          {' · '}Сегодня: <span className="stat-number font-medium text-foreground">{todayEvents.length}</span> событий
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {(Object.keys(typeConfig) as EventType[]).map(type => {
          const cfg = typeConfig[type];
          return (
            <div key={type} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${cfg.bg}`}>
                  <Icon name={cfg.icon} size={18} className={cfg.color} />
                </div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{cfg.label}</span>
              </div>
              <div className="stat-number text-3xl font-medium text-foreground">{counts[type]}</div>
              <div className="text-xs text-muted-foreground mt-1">всего записей</div>
            </div>
          );
        })}
      </div>

      {!isDirector && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(typeConfig) as EventType[]).map(type => {
              const cfg = typeConfig[type];
              return (
                <button
                  key={type}
                  onClick={() => setModal(type)}
                  className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl hover:border-foreground/40 hover:bg-secondary transition-all duration-150 group"
                >
                  <div className={`p-2 rounded-lg ${cfg.bg} group-hover:scale-105 transition-transform`}>
                    <Icon name={cfg.icon} size={16} className={cfg.color} />
                  </div>
                  <span className="font-medium text-sm text-foreground">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isDirector && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">По филиалам</h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
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

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Последние события</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
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
                {recent.map(event => (
                  <tr key={event.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${typeConfig[event.type].bg} ${typeConfig[event.type].color}`}>
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <EventModal ctx={ctx} defaultType={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
