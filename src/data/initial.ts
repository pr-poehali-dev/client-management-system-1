import { AppState } from '@/types/crm';

export const initialState: AppState = {
  currentUser: null,
  users: [
    { id: 'u1', name: 'Анна Смирнова', role: 'admin', branchId: 'b1' },
    { id: 'u2', name: 'Дмитрий Козлов', role: 'admin', branchId: 'b2' },
    { id: 'u3', name: 'Елена Попова', role: 'admin', branchId: 'b3' },
    { id: 'u4', name: 'Игорь Новиков', role: 'admin', branchId: 'b4' },
    { id: 'u5', name: 'Сергей Петров', role: 'manager' },
    { id: 'u6', name: 'Мария Иванова', role: 'director' },
  ],
  branches: [
    { id: 'b1', name: 'Филиал Центр' },
    { id: 'b2', name: 'Филиал Север' },
    { id: 'b3', name: 'Филиал Юг' },
    { id: 'b4', name: 'Филиал Запад' },
  ],
  channels: [
    { id: 'ch1', name: 'Телефон', active: true },
    { id: 'ch2', name: 'WhatsApp', active: true },
    { id: 'ch3', name: 'Instagram', active: true },
    { id: 'ch4', name: 'Сайт', active: true },
    { id: 'ch5', name: 'Лично', active: true },
  ],
  adSources: [
    { id: 'as1', name: 'Яндекс', active: true },
    { id: 'as2', name: 'Google', active: true },
    { id: 'as3', name: 'Instagram', active: true },
    { id: 'as4', name: 'ВКонтакте', active: true },
    { id: 'as5', name: 'Рекомендация', active: true },
    { id: 'as6', name: 'Наружная реклама', active: true },
  ],
  events: [
    { id: 'e1', type: 'inquiry', branchId: 'b1', userId: 'u1', channelId: 'ch1', adSourceId: 'as1', createdAt: '2026-03-20T10:00:00' },
    { id: 'e2', type: 'appointment', branchId: 'b1', userId: 'u1', channelId: 'ch2', adSourceId: 'as3', createdAt: '2026-03-20T11:30:00' },
    { id: 'e3', type: 'sale', branchId: 'b1', userId: 'u5', channelId: 'ch4', adSourceId: 'as1', createdAt: '2026-03-21T09:15:00' },
    { id: 'e4', type: 'inquiry', branchId: 'b2', userId: 'u2', channelId: 'ch3', adSourceId: 'as2', createdAt: '2026-03-21T10:00:00' },
    { id: 'e5', type: 'appointment', branchId: 'b2', userId: 'u5', channelId: 'ch1', adSourceId: 'as5', createdAt: '2026-03-21T14:00:00' },
    { id: 'e6', type: 'sale', branchId: 'b3', userId: 'u3', channelId: 'ch5', adSourceId: 'as4', createdAt: '2026-03-22T09:00:00' },
    { id: 'e7', type: 'inquiry', branchId: 'b3', userId: 'u3', channelId: 'ch2', adSourceId: 'as3', createdAt: '2026-03-22T11:00:00' },
    { id: 'e8', type: 'inquiry', branchId: 'b4', userId: 'u4', channelId: 'ch1', adSourceId: 'as6', createdAt: '2026-03-22T13:00:00' },
    { id: 'e9', type: 'appointment', branchId: 'b4', userId: 'u4', channelId: 'ch4', adSourceId: 'as2', createdAt: '2026-03-23T09:30:00' },
    { id: 'e10', type: 'sale', branchId: 'b1', userId: 'u1', channelId: 'ch2', adSourceId: 'as1', createdAt: '2026-03-23T10:00:00' },
    { id: 'e11', type: 'inquiry', branchId: 'b2', userId: 'u2', channelId: 'ch3', adSourceId: 'as4', createdAt: '2026-03-23T11:00:00' },
    { id: 'e12', type: 'sale', branchId: 'b3', userId: 'u5', channelId: 'ch1', adSourceId: 'as5', createdAt: '2026-03-23T12:00:00' },
  ],
};
