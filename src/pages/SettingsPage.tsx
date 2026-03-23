import { useState } from 'react';
import { AppContext } from '@/App';
import Icon from '@/components/ui/icon';

interface Props { ctx: AppContext; }

type Tab = 'channels' | 'sources' | 'branches';

export default function SettingsPage({ ctx }: Props) {
  const [tab, setTab] = useState<Tab>('channels');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const { state, addChannel, toggleChannel, addAdSource, toggleAdSource, addBranch } = ctx;
  const { channels, adSources, branches } = state;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'channels', label: 'Каналы связи' },
    { id: 'sources', label: 'Рекламные источники' },
    { id: 'branches', label: 'Филиалы' },
  ];

  const handleAdd = async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    if (tab === 'channels') await addChannel(newName.trim());
    else if (tab === 'sources') await addAdSource(newName.trim());
    else await addBranch(newName.trim());
    setNewName('');
    setSaving(false);
  };

  const renderChannels = () => (
    <div className="space-y-2">
      {channels.map(item => (
        <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleChannel(item.id, !item.active)}
              style={{ width: 32, height: 18 }}
              className={`rounded-full relative transition-all duration-200 flex-shrink-0 ${item.active ? 'bg-foreground' : 'bg-border'}`}
            >
              <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200 shadow-sm ${item.active ? 'left-[14px]' : 'left-0.5'}`} />
            </button>
            <span className={`text-sm font-medium ${!item.active ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.name}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-secondary text-muted-foreground'}`}>
            {item.active ? 'Активен' : 'Выключен'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderSources = () => (
    <div className="space-y-2">
      {adSources.map(item => (
        <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleAdSource(item.id, !item.active)}
              style={{ width: 32, height: 18 }}
              className={`rounded-full relative transition-all duration-200 flex-shrink-0 ${item.active ? 'bg-foreground' : 'bg-border'}`}
            >
              <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200 shadow-sm ${item.active ? 'left-[14px]' : 'left-0.5'}`} />
            </button>
            <span className={`text-sm font-medium ${!item.active ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{item.name}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-secondary text-muted-foreground'}`}>
            {item.active ? 'Активен' : 'Выключен'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderBranches = () => (
    <div className="space-y-2">
      {branches.map(item => (
        <div key={item.id} className="flex items-center px-4 py-3 bg-card border border-border rounded-lg">
          <Icon name="Building2" size={16} className="text-muted-foreground mr-3" />
          <span className="text-sm font-medium text-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Справочники</h1>
        <p className="text-muted-foreground text-sm mt-1">Управление списками каналов, источников и филиалов</p>
      </div>

      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setNewName(''); }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder={tab === 'channels' ? 'Новый канал...' : tab === 'sources' ? 'Новый источник...' : 'Новый филиал...'}
          className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim() || saving}
          className="px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/80 disabled:opacity-30 transition-all flex items-center gap-2"
        >
          {saving
            ? <span className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            : <Icon name="Plus" size={16} />
          }
          Добавить
        </button>
      </div>

      {tab === 'channels' && renderChannels()}
      {tab === 'sources' && renderSources()}
      {tab === 'branches' && renderBranches()}
    </div>
  );
}
