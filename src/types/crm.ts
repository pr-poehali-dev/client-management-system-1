export type Role = 'admin' | 'manager' | 'director';

export interface User {
  id: string;
  name: string;
  role: Role;
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
}

export interface Channel {
  id: string;
  name: string;
  active: boolean;
}

export interface AdSource {
  id: string;
  name: string;
  active: boolean;
}

export type EventType = 'inquiry' | 'appointment' | 'sale';

export interface CRMEvent {
  id: string;
  type: EventType;
  branchId: string;
  userId: string;
  channelId: string;
  adSourceId: string;
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  branches: Branch[];
  channels: Channel[];
  adSources: AdSource[];
  events: CRMEvent[];
}
