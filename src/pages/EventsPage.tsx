import { useState } from 'react';
import { AppContext } from '@/App';
import { CRMEvent, EventType } from '@/types/crm';
import Icon from '@/components/ui/icon';
import EventModal from '@/components/EventModal';

interface Props { ctx: AppContext; }

const typeConfig = {
  inquiry: { label: 'Обращение', color: 'text-blue-600', bg: 'bg-blue-50' },
  appointment: { label: 'Запись', color: 'text-amber-600', bg: 'bg-amber-50' },
  sale: { label: 'Продажа', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

interface EditModalProps {
  event: CRMEvent;
  ctx: AppContext;
  onClose: () => void;
}

function EditEventModal({ event, ctx, onClose }: EditModalProps) {
  const { state, editEvent, removeEvent } = ctx;
  const { branches, channels, adSources, currentUser } = state;
  const [type, setType] = useState<EventType>(event.type);
  const [channelId, setChannelId] = useState(event.channelId);
  const [adSourceId, setAdSourceId] = useState(event.adSourceId);
  const [branchId, setBranchId] = useState(event.branchId);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const isManager = currentUser?.role === 'manager';
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

          {isManager && (
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
          )}

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

export default function EventsPage({ ctx }: Props) {
  const [modal, setModal] = useState<EventType | null>(null);
  const [editingEvent, setEditingEvent] = useState<CRMEvent | null>(null);
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [filterBranch, setFilterBranch] = useState('all');

  const { state } = ctx;
  const { currentUser, events, branches, channels, adSources, users } = state;

  const isAdmin = currentUser?.role === 'admin';

  const getName = (id: string, arr: { id: string; name: string }[]) =>
    arr.find(x => x.id === id)?.name || '—';

  let filtered = isAdmin
    ? events.filter(e => e.branchId === currentUser?.branchId)
    : events;

  if (filterType !== 'all') filtered = filtered.filter(e => e.type === filterType);
  if (filterBranch !== 'all') filtered = filtered.filter(e => e.branchId === filterBranch);

  return (
    <div className="p-4 md:p-8 max-w-5xl animate-fade-in">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">События</h1>
          <p className="text-muted-foreground text-sm mt-1">История всех обращений, записей и продаж</p>
        </div>
        <button
          onClick={() => setModal('inquiry')}
          className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/80 transition-all"
        >
          <Icon name="Plus" size={16} />
          <span className="hidden md:inline">Добавить</span>
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col gap-2 md:flex-row md:gap-3 mb-5 md:mb-6">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
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

      {/* Мобил — карточки */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl px-5 py-12 text-center text-muted-foreground text-sm">
            <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-30" />
            Событий не найдено
          </div>
        ) : (
          filtered.map(event => {
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
                  {!isAdmin && (
                    <div className="flex justify-between">
                      <span>Филиал</span>
                      <span className="text-foreground font-medium">{getName(event.branchId, branches)}</span>
                    </div>
                  )}
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
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(event => {
                const cfg = typeConfig[event.type];
                return (
                  <tr key={event.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors group">
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
        Показано: <span className="stat-number font-medium text-foreground">{filtered.length}</span> из {events.length}
      </div>

      {modal && <EventModal ctx={ctx} defaultType={modal} onClose={() => setModal(null)} />}
      {editingEvent && <EditEventModal event={editingEvent} ctx={ctx} onClose={() => setEditingEvent(null)} />}
    </div>
  );
}
