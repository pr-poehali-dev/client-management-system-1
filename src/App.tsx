import { useState, useEffect } from 'react';
import { AppState, User, CRMEvent, Branch, Channel, AdSource } from '@/types/crm';
import { initialState } from '@/data/initial';
import { fetchData, fetchEvents, createEvent, addItem, updateItem, removeItem, authUser, setUserPassword } from '@/api/client';
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
  loading: boolean;
  currentPage: PageType;
  setPage: (page: PageType) => void;
  login: (userId: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  addEvent: (event: Omit<CRMEvent, 'id' | 'createdAt'>) => Promise<void>;
  addChannel: (name: string) => Promise<void>;
  toggleChannel: (id: string, active: boolean) => Promise<void>;
  removeChannel: (id: string) => Promise<void>;
  addAdSource: (name: string) => Promise<void>;
  toggleAdSource: (id: string, active: boolean) => Promise<void>;
  removeAdSource: (id: string) => Promise<void>;
  addBranch: (name: string) => Promise<void>;
  removeBranch: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'> & { password?: string }) => Promise<void>;
  removeUser: (id: string) => void;
  updateUserPassword: (userId: string, password: string) => Promise<void>;
  reloadData: () => Promise<void>;
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const loadAll = async () => {
    setLoading(true);
    const [dataRes, eventsRes] = await Promise.all([fetchData(), fetchEvents()]);
    setState(s => ({
      ...s,
      branches: dataRes.branches || [],
      users: dataRes.users || [],
      channels: dataRes.channels || [],
      adSources: dataRes.adSources || [],
      events: eventsRes.events || [],
    }));
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const login = async (userId: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await authUser(userId, password);
    if (res.ok) {
      setState(s => ({ ...s, currentUser: res.user as User }));
      setCurrentPage('dashboard');
    }
    return res;
  };

  const logout = () => {
    setState(s => ({ ...s, currentUser: null }));
    setCurrentPage('dashboard');
  };

  const addEvent = async (event: Omit<CRMEvent, 'id' | 'createdAt'>) => {
    const res = await createEvent(event);
    const newEvent: CRMEvent = { ...event, id: res.id, createdAt: res.createdAt };
    setState(s => ({ ...s, events: [newEvent, ...s.events] }));
  };

  const addChannel = async (name: string) => {
    const res = await addItem('channels', { name });
    setState(s => ({ ...s, channels: [...s.channels, res] }));
  };

  const toggleChannel = async (id: string, active: boolean) => {
    await updateItem('channels', { id, active });
    setState(s => ({ ...s, channels: s.channels.map(c => c.id === id ? { ...c, active } : c) }));
  };

  const removeChannel = async (id: string) => {
    await removeItem('channels', id);
    setState(s => ({ ...s, channels: s.channels.filter(c => c.id !== id) }));
  };

  const addAdSource = async (name: string) => {
    const res = await addItem('sources', { name });
    setState(s => ({ ...s, adSources: [...s.adSources, res] }));
  };

  const toggleAdSource = async (id: string, active: boolean) => {
    await updateItem('sources', { id, active });
    setState(s => ({ ...s, adSources: s.adSources.map(a => a.id === id ? { ...a, active } : a) }));
  };

  const removeAdSource = async (id: string) => {
    await removeItem('sources', id);
    setState(s => ({ ...s, adSources: s.adSources.filter(a => a.id !== id) }));
  };

  const addBranch = async (name: string) => {
    const res = await addItem('branches', { name });
    setState(s => ({ ...s, branches: [...s.branches, res] }));
  };

  const removeBranch = async (id: string) => {
    await removeItem('branches', id);
    setState(s => ({ ...s, branches: s.branches.filter(b => b.id !== id) }));
  };

  const addUser = async (user: Omit<User, 'id'> & { password?: string }) => {
    const res = await addItem('users', { name: user.name, role: user.role, branchId: user.branchId, password: user.password || '' });
    setState(s => ({ ...s, users: [...s.users, res] }));
  };

  const removeUser = (id: string) => {
    setState(s => ({ ...s, users: s.users.filter(u => u.id !== id) }));
  };

  const updateUserPassword = async (userId: string, password: string) => {
    await setUserPassword(userId, password);
  };

  const ctx: AppContext = {
    state,
    loading,
    currentPage,
    setPage: setCurrentPage,
    login,
    logout,
    addEvent,
    addChannel,
    toggleChannel,
    removeChannel,
    addAdSource,
    toggleAdSource,
    removeAdSource,
    addBranch,
    removeBranch,
    addUser,
    removeUser,
    updateUserPassword,
    reloadData: loadAll,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

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