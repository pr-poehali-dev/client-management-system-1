import { useState } from 'react';
import { AppContext } from '@/App';
import { Channel, AdSource, Branch } from '@/types/crm';
import Icon from '@/components/ui/icon';

interface Props { ctx: AppContext; }

type Tab = 'branches' | 'channels' | 'sources';

export default function SettingsPage({ ctx }: Props) {
  const [tab, setTab] = useState<Tab>('channels');
  const [newName, setNewName] = useState('');

  const { state, updateBranches, updateChannels, updateAdSources } = ctx;
  const { branches, channels, adSources } = state;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'channels', label: 'Каналы связи' },
    { id: 'sources', label: 'Рекламные источники' },
    { id: 'branches', label: 'Филиалы' },
  ];

  const addChannel = () => {
    if (!newName.trim()) return;
    updateChannels([...channels, { id: `ch${Date.now()}`, name: newName.trim(), active: true }]);
    setNewName('');
  };

  const toggleChannel = (id: string) => {
    updateChannels(channels.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const removeChannel = (id: string) => updateChannels(channels.filter(c => c.id !== id));

  const addSource = () => {
    if (!newName.trim()) return;
    updateAdSources([...adSources, { id: `as${Date.now()}`, name: newName.trim(), active: true }]);
    setNewName('');
  };

  const toggleSource = (id: string) => {
    updateAdSources(adSources.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const removeSource = (id: string) => updateAdSources(adSources.filter(a => a.id !== id));

  const addBranch = () => {
    if (!newName.trim()) return;
    updateBranches([...branches, { id: `b${Date.now()}`, name: newName.trim() }]);
    setNewName('');
  };

  const removeBranch = (id: string) => updateBranches(branches.filter(b => b.id !== id));

  const renderList = (
    items: (Channel | AdSource | Branch)[],
    onToggle?: (id: string) => void,
    onRemove?: (id: string) => void,
  ) => (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-3">
            {'active' in item && (
              <button
                onClick={() => onToggle?.(item.id)}
                className={`w-8 h-4.5 rounded-full relative transition-all duration-200 ${item.active ? 'bg-foreground' : 'bg-border'}`}
                style={{ width: 32, height: 18 }}
              >
                <span
                  className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200 shadow-sm ${item.active ? 'left-[14px]' : 'left-0.5'}`}
                />
              </button>
            )}
            <span className={`text-sm font-medium ${'active' in item && !item.active ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {item.name}
            </span>
          </div>
          <button
            onClick={() => onRemove?.(item.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
          >
            <Icon name="Trash2" size={15} />
          </button>
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
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (tab === 'channels') addChannel();
              else if (tab === 'sources') addSource();
              else addBranch();
            }
          }}
          placeholder={tab === 'channels' ? 'Новый канал...' : tab === 'sources' ? 'Новый источник...' : 'Новый филиал...'}
          className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={() => {
            if (tab === 'channels') addChannel();
            else if (tab === 'sources') addSource();
            else addBranch();
          }}
          className="px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/80 transition-all flex items-center gap-2"
        >
          <Icon name="Plus" size={16} />
          Добавить
        </button>
      </div>

      {tab === 'channels' && renderList(channels, toggleChannel, removeChannel)}
      {tab === 'sources' && renderList(adSources, toggleSource, removeSource)}
      {tab === 'branches' && renderList(branches, undefined, removeBranch)}
    </div>
  );
}
