import { ReactNode } from 'react';
import { AppContext, PageType } from '@/App';
import Icon from '@/components/ui/icon';

interface Props {
  ctx: AppContext;
  children: ReactNode;
}

interface NavItem {
  id: PageType;
  label: string;
  icon: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard', roles: ['admin', 'manager', 'director'] },
  { id: 'events', label: 'События', icon: 'Activity', roles: ['admin', 'manager'] },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart2', roles: ['director', 'manager'] },
  { id: 'settings', label: 'Справочники', icon: 'Settings', roles: ['director'] },
  { id: 'users', label: 'Сотрудники', icon: 'Users', roles: ['director'] },
];

const roleLabel = (role: string) => {
  if (role === 'admin') return 'Администратор';
  if (role === 'manager') return 'Менеджер';
  return 'Управляющий';
};

export default function Layout({ ctx, children }: Props) {
  const { currentUser, branches } = ctx.state;
  if (!currentUser) return null;

  const branchName = currentUser.branchId
    ? branches.find(b => b.id === currentUser.branchId)?.name
    : null;

  const visibleNav = navItems.filter(n => n.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Боковая панель — только десктоп */}
      <aside className="hidden md:flex w-56 shrink-0 border-r border-border bg-card flex-col">
        <div className="px-5 py-5 border-b border-border">
          <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">CRM Система</div>
          <div className="font-semibold text-sm text-foreground leading-tight">{currentUser.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {roleLabel(currentUser.role)}{branchName ? ` · ${branchName}` : ''}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNav.map(item => (
            <button
              key={item.id}
              onClick={() => ctx.setPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
                ctx.currentPage === item.id
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={ctx.logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
          >
            <Icon name="LogOut" size={16} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Шапка — только мобил */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-40">
          <div>
            <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase leading-none">CRM</div>
            <div className="font-semibold text-sm text-foreground leading-tight">{currentUser.name}</div>
          </div>
          <button
            onClick={ctx.logout}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
          >
            <Icon name="LogOut" size={18} />
          </button>
        </header>

        <main className="flex-1 overflow-auto scrollbar-thin pb-20 md:pb-0">
          {children}
        </main>

        {/* Нижняя навигация — только мобил */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 flex">
          {visibleNav.map(item => (
            <button
              key={item.id}
              onClick={() => ctx.setPage(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-all duration-150 ${
                ctx.currentPage === item.id
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon
                name={item.icon}
                size={20}
                className={ctx.currentPage === item.id ? 'text-foreground' : 'text-muted-foreground'}
              />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
