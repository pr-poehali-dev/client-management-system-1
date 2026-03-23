import { useState } from 'react';
import { AppState, User, CRMEvent, Branch, Channel, AdSource } from '@/types/crm';
import { initialState } from '@/data/initial';
import LoginPage from '@/pages/LoginPage';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import EventsPage from '@/pages/EventsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import UsersPage from '@/pages/UsersPage';

export type PageType = 'dashboard' | 'events' | 'analytics' | 'settings' | 'users';

export interface AppContext {
  state: AppState;
  currentPage: PageType;
  setPage: (page: PageType) => void;
  login: (user: User) => void;
  logout: () => void;
  addEvent: (event: Omit<CRMEvent, 'id' | 'createdAt'>) => void;
  updateBranches: (branches: Branch[]) => void;
  updateChannels: (channels: Channel[]) => void;
  updateAdSources: (adSources: AdSource[]) => void;
  updateUsers: (users: User[]) => void;
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const login = (user: User) => {
    setState(s => ({ ...s, currentUser: user }));
    setCurrentPage('dashboard');
  };

  const logout = () => {
    setState(s => ({ ...s, currentUser: null }));
    setCurrentPage('dashboard');
  };

  const addEvent = (event: Omit<CRMEvent, 'id' | 'createdAt'>) => {
    const newEvent: CRMEvent = {
      ...event,
      id: `e${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, events: [newEvent, ...s.events] }));
  };

  const updateBranches = (branches: Branch[]) => setState(s => ({ ...s, branches }));
  const updateChannels = (channels: Channel[]) => setState(s => ({ ...s, channels }));
  const updateAdSources = (adSources: AdSource[]) => setState(s => ({ ...s, adSources }));
  const updateUsers = (users: User[]) => setState(s => ({ ...s, users }));

  const ctx: AppContext = {
    state,
    currentPage,
    setPage: setCurrentPage,
    login,
    logout,
    addEvent,
    updateBranches,
    updateChannels,
    updateAdSources,
    updateUsers,
  };

  if (!state.currentUser) {
    return <LoginPage ctx={ctx} />;
  }

  const pages: Record<PageType, JSX.Element> = {
    dashboard: <Dashboard ctx={ctx} />,
    events: <EventsPage ctx={ctx} />,
    analytics: <AnalyticsPage ctx={ctx} />,
    settings: <SettingsPage ctx={ctx} />,
    users: <UsersPage ctx={ctx} />,
  };

  return (
    <Layout ctx={ctx}>
      {pages[currentPage]}
    </Layout>
  );
}
