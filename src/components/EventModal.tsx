import { useState } from 'react';
import { AppContext } from '@/App';
import { EventType } from '@/types/crm';
import Icon from '@/components/ui/icon';

interface Props {
  ctx: AppContext;
  defaultType?: EventType;
  onClose: () => void;
}

const typeLabels: Record<EventType, string> = {
  inquiry: 'Обращение',
  appointment: 'Запись',
  sale: 'Продажа',
};

export default function EventModal({ ctx, defaultType = 'inquiry', onClose }: Props) {
  const { state, addEvent } = ctx;
  const { currentUser, branches, channels, adSources } = state;

  const [type, setType] = useState<EventType>(defaultType);
  const [channelId, setChannelId] = useState('');
  const [adSourceId, setAdSourceId] = useState('');
  const [branchId, setBranchId] = useState(currentUser?.branchId || '');
  const [saving, setSaving] = useState(false);

  const activeChannels = channels.filter(c => c.active);
  const activeAdSources = adSources.filter(a => a.active);
  const isManager = currentUser?.role === 'manager';

  const needsChannel = type === 'inquiry';
  const canSubmit = adSourceId && branchId && (!needsChannel || channelId);

  const handleSubmit = async () => {
    if (!currentUser || !canSubmit) return;
    setSaving(true);
    await addEvent({ type, branchId, userId: currentUser.id, channelId, adSourceId });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Новое событие</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Тип события</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(typeLabels) as EventType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-md text-sm font-medium border transition-all duration-150 ${
                    type === t ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  {typeLabels[t]}
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
                <option value="">Выберите филиал</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {needsChannel && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Канал связи</label>
              <select
                value={channelId}
                onChange={e => setChannelId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                <option value="">Выберите канал</option>
                {activeChannels.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Рекламный источник</label>
            <select
              value={adSourceId}
              onChange={e => setAdSourceId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              <option value="">Выберите источник</option>
              {activeAdSources.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            className="flex-1 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />}
            {saving ? 'Сохранение...' : 'Зафиксировать'}
          </button>
        </div>
      </div>
    </div>
  );
}