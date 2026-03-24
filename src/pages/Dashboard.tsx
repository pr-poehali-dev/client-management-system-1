import { useState, useMemo } from 'react';
import { AppContext } from '@/App';
import { CRMEvent, EventType } from '@/types/crm';
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

type Tab = 'overview' | 'events';

function filterByPeriod<T extends { createdAt: string }>(events: T[], period: Period): T[] {
  if (period === 'all') return events;
  const now = new Date();
  const start = new Date();
  if (period === 'today') { start.setHours(0, 0, 0, 0); }
  else if (period === 'week') { start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0); }
  else if (period === 'month') { start.setDate(1); start.setHours(0, 0, 0, 0); }
  return events.filter(e => new Date(e.createdAt) >= start);
}

interface EditModalProps {
  event: CRMEvent;
  ctx: AppContext;
  onClose: () => void;
}

function EditEventModal({ event, ctx, onClose }: EditModalProps) {
  const { state, editEvent, removeEvent } = ctx;
  const { branches, channels, adSources } = state;
  const [type, setType] = useState<EventType>(event.type);
  const [channelId, setChannelId] = useState(event.channelId);
  const [adSourceId, setAdSourceId] = useState(event.adSourceId);
  const [branchId, setBranchId] = useState(event.branchId);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const activeChannels = channels.filter(c => c.active);
  const activeAdSources = adSources.filter(a => a.active);

  const handleSave = async () => {
    setSaving(true);
    await editEvent({ ...event, type, branchId, channelId, adSourceId });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    setSaving(true);
    await removeEvent(event.id);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Редактировать событие</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Тип события</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(typeConfig) as EventType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-md text-sm font-medium border transition-all duration-150 ${
                    type === t ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  {typeConfig[t].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Филиал</label>
            <select
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Канал связи</label>
            <select
              value={channelId}
              onChange={e => setChannelId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              <option value="">Не указан</option>
              {activeChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Рекламный источник</label>
            <select
              value={adSourceId}
              onChange={e => setAdSourceId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              <option value="">Не указан</option>
              {activeAdSources.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>

        {confirming ? (
          <div className="px-6 pb-6">
            <p className="text-sm text-muted-foreground mb-3">Удалить это событие? Действие необратимо.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 py-2.5 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
              >
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Удалить
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => setConfirming(true)}
              className="p-2.5 rounded-md border border-border text-muted-foreground hover:text-red-500 hover:border-red-300 transition-all"
            >
              <Icon name="Trash2" size={16} />
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/80 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />}
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ ctx }: Props) {
  const [modal, setModal] = useState<EventType | null>(null);
  const [editingEvent, setEditingEvent] = useState<CRMEvent | null>(null);
  const [period, setPeriod] = useState<Period>('month');
  const [tab, setTab] = useState<Tab>('overview');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');

  const { state } = ctx;
  const { currentUser, events, branches, channels, adSources, users } = state;

  const isDirector = currentUser?.role === 'director';
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';

  const scopedEvents = isAdmin
    ? events.filter(e => e.branchId === currentUser?.branchId)
    : isManager
    ? events.filter(e => e.userId === currentUser?.id)
    : events;

  const directorFiltered = useMemo(() => {
    let ev = scopedEvents;
    if (filterBranch !== 'all') ev = ev.filter(e => e.branchId === filterBranch);
    if (filterUser !== 'all') ev = ev.filter(e => e.userId === filterUser);
    return ev;
  }, [scopedEvents, filterBranch, filterUser]);

  const baseForStats = isDirector ? directorFiltered : scopedEvents;
  const myEvents = useMemo(() => filterByPeriod(baseForStats, period), [baseForStats, period]);

  const counts = {
    inquiry: myEvents.filter(e => e.type === 'inquiry').length,
    appointment: myEvents.filter(e => e.type === 'appointment').length,
    sale: myEvents.filter(e => e.type === 'sale').length,
  };

  const conv1 = counts.inquiry > 0 ? Math.round((counts.appointment / counts.inquiry) * 100) : null;
  const conv2 = counts.appointment > 0 ? Math.round((counts.sale / counts.appointment) * 100) : null;

  const recent = (isDirector ? directorFiltered : scopedEvents).slice(0, 5);

  const getName = (id: string, arr: { id: string; name: string }[]) =>
    arr.find(x => x.id === id)?.name || '—';

  const getEventLabel = (type: EventType) => typeConfig[type].label;

  const today = new Date().toDateString();
  const todayEvents = (isDirector ? directorFiltered : scopedEvents).filter(e => new Date(e.createdAt).toDateString() === today);

  const eventsFiltered = useMemo(() => {
    let ev = isDirector ? directorFiltered : scopedEvents;
    if (filterType !== 'all') ev = ev.filter(e => e.type === filterType);
    return ev;
  }, [directorFiltered, scopedEvents, isDirector, filterType]);

  const usersInBranch = useMemo(() => {
    if (filterBranch === 'all') return users.filter(u => u.role !== 'director');
    return users.filter(u => u.branchId === filterBranch && u.role !== 'director');
  }, [users, filterBranch]);

  return (
    <div className="p-4 md:p-8 max-w-5xl animate-fade-in">
      {/* Заголовок */}
      <div className="flex items-start justify-between mb-5 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Дашборд</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isDirector ? 'Вся сеть' : isAdmin ? getName(currentUser?.branchId || '', branches) : isManager ? 'Мои события' : 'Все филиалы'}
            {' · '}Сегодня: <span className="stat-number font-medium text-foreground">{todayEvents.length}</span> событий
          </p>
        </div>
      </div>

      {/* Вкладки директора */}
      {isDirector && (
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 mb-5 w-fit">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'overview' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Обзор
          </button>
          <button
            onClick={() => setTab('events')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'events' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            История событий
          </button>
        </div>
      )}

      {/* Фильтры директора */}
      {isDirector && (
        <div className="flex flex-col gap-2 md:flex-row md:gap-3 mb-5">
          <select
            value={filterBranch}
            onChange={e => { setFilterBranch(e.target.value); setFilterUser('all'); }}
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
            {usersInBranch.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}

      {/* ===== ВКЛАДКА ИСТОРИЯ СОБЫТИЙ (директор) ===== */}
      {isDirector && tab === 'events' && (
        <div>
          {/* Фильтр по типу */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 mb-4 w-fit overflow-x-auto">
            {(['all', 'inquiry', 'appointment', 'sale'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterType === t ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'all' ? 'Все' : typeConfig[t].label}
              </button>
            ))}
          </div>

          {/* Мобил — карточки */}
          <div className="md:hidden space-y-2">
            {eventsFiltered.length === 0 ? (
              <div className="bg-card border border-border rounded-xl px-5 py-12 text-center text-muted-foreground text-sm">
                <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-30" />
                Событий не найдено
              </div>
            ) : (
              eventsFiltered.map(event => {
                const cfg = typeConfig[event.type];
                return (
                  <div key={event.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-md ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(event.createdAt).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}
                          {' '}
                          {new Date(event.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          <Icon name="Pencil" size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Филиал</span>
                        <span className="text-foreground font-medium">{getName(event.branchId, branches)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Сотрудник</span>
                        <span className="text-foreground font-medium">{getName(event.userId, users)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Канал</span>
                        <span className="text-foreground font-medium">{getName(event.channelId, channels)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Источник</span>
                        <span className="text-foreground font-medium">{getName(event.adSourceId, adSources)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Десктоп — таблица */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            {eventsFiltered.length === 0 ? (
              <div className="px-5 py-12 text-center text-muted-foreground text-sm">
                <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-30" />
                Событий не найдено
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Тип</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Филиал</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Сотрудник</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Канал</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Источник</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Дата</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {eventsFiltered.map(event => {
                    const cfg = typeConfig[event.type];
                    return (
                      <tr key={event.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors group">
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-md ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-foreground">{getName(event.branchId, branches)}</td>
                        <td className="px-5 py-3.5 text-foreground">{getName(event.userId, users)}</td>
                        <td className="px-5 py-3.5 text-foreground">{getName(event.channelId, channels)}</td>
                        <td className="px-5 py-3.5 text-foreground">{getName(event.adSourceId, adSources)}</td>
                        <td className="px-5 py-3.5 text-right text-muted-foreground font-mono text-xs">
                          {new Date(event.createdAt).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}
                          {' '}
                          {new Date(event.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-3 py-3.5">
                          <button
                            onClick={() => setEditingEvent(event)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all p-1.5 rounded-md hover:bg-secondary"
                          >
                            <Icon name="Pencil" size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-right">
            Показано: <span className="stat-number font-medium text-foreground">{eventsFiltered.length}</span> из {events.length}
          </div>
        </div>
      )}

      {/* ===== ВКЛАДКА ОБЗОР (или не-директор) ===== */}
      {(!isDirector || tab === 'overview') && (
        <>
          {/* Переключатель периода */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 mb-5 md:mb-6 w-full md:w-fit overflow-x-auto">
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
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-5">
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

          {/* Конверсия */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-card border border-border rounded-xl p-3 md:p-5 flex items-center gap-3 md:gap-4">
              <div className="p-1.5 md:p-2 rounded-lg bg-violet-50 shrink-0">
                <Icon name="ArrowRight" size={16} className="text-violet-600" />
              </div>
              <div>
                <div className="stat-number text-2xl md:text-3xl font-medium text-foreground">
                  {conv1 !== null ? `${conv1}%` : '—'}
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Обращение → Запись</div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 md:p-5 flex items-center gap-3 md:gap-4">
              <div className="p-1.5 md:p-2 rounded-lg bg-emerald-50 shrink-0">
                <Icon name="ArrowRight" size={16} className="text-emerald-600" />
              </div>
              <div>
                <div className="stat-number text-2xl md:text-3xl font-medium text-foreground">
                  {conv2 !== null ? `${conv2}%` : '—'}
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Запись → Продажа</div>
              </div>
            </div>
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
                  const be = directorFiltered.filter(e => e.branchId === branch.id);
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
                      const be = directorFiltered.filter(e => e.branchId === branch.id);
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
        </>
      )}

      {modal && <EventModal ctx={ctx} defaultType={modal} onClose={() => setModal(null)} />}
      {editingEvent && <EditEventModal event={editingEvent} ctx={ctx} onClose={() => setEditingEvent(null)} />}
    </div>
  );
}
