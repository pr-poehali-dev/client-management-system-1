import { useState } from 'react';
import { AppContext } from '@/App';
import { EventType } from '@/types/crm';
import Icon from '@/components/ui/icon';
import EventModal from '@/components/EventModal';

interface Props { ctx: AppContext; }

const typeConfig = {
  inquiry: { label: 'Обращение', color: 'text-blue-600', bg: 'bg-blue-50' },
  appointment: { label: 'Запись', color: 'text-amber-600', bg: 'bg-amber-50' },
  sale: { label: 'Продажа', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export default function EventsPage({ ctx }: Props) {
  const [modal, setModal] = useState<EventType | null>(null);
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [filterBranch, setFilterBranch] = useState('all');

  const { state } = ctx;
  const { currentUser, events, branches, channels, adSources, users } = state;

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';

  const getName = (id: string, arr: { id: string; name: string }[]) =>
    arr.find(x => x.id === id)?.name || '—';

  let filtered = isAdmin
    ? events.filter(e => e.branchId === currentUser?.branchId)
    : events;

  if (filterType !== 'all') filtered = filtered.filter(e => e.type === filterType);
  if (filterBranch !== 'all') filtered = filtered.filter(e => e.branchId === filterBranch);

  return (
    <div className="p-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">События</h1>
          <p className="text-muted-foreground text-sm mt-1">История всех обращений, записей и продаж</p>
        </div>
        <button
          onClick={() => setModal('inquiry')}
          className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/80 transition-all"
        >
          <Icon name="Plus" size={16} />
          Добавить
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {(['all', 'inquiry', 'appointment', 'sale'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterType === t ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'all' ? 'Все' : typeConfig[t].label}
            </button>
          ))}
        </div>

        {!isAdmin && (
          <select
            value={filterBranch}
            onChange={e => setFilterBranch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
          >
            <option value="all">Все филиалы</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-muted-foreground text-sm">
            <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-30" />
            Событий не найдено
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Тип</th>
                {!isAdmin && <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Филиал</th>}
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Сотрудник</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Канал</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Источник</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Дата</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(event => {
                const cfg = typeConfig[event.type];
                return (
                  <tr key={event.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-md ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    {!isAdmin && <td className="px-5 py-3.5 text-foreground">{getName(event.branchId, branches)}</td>}
                    <td className="px-5 py-3.5 text-foreground">{getName(event.userId, users)}</td>
                    <td className="px-5 py-3.5 text-foreground">{getName(event.channelId, channels)}</td>
                    <td className="px-5 py-3.5 text-foreground">{getName(event.adSourceId, adSources)}</td>
                    <td className="px-5 py-3.5 text-right text-muted-foreground font-mono text-xs">
                      {new Date(event.createdAt).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}
                      {' '}
                      {new Date(event.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-right">
        Показано: <span className="stat-number font-medium text-foreground">{filtered.length}</span> из {events.length}
      </div>

      {modal && <EventModal ctx={ctx} defaultType={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
