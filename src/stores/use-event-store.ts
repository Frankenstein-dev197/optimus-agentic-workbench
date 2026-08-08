import { create } from 'zustand';

export interface Event {
  id: string;
  type: string;
  timestamp: string;
  [key: string]: unknown;
}

interface EventStore {
  events: Event[];
  addEvent: (event: Partial<Event>) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        {
          id: Math.random().toString(36).substring(7),
          type: event.type || 'unknown',
          timestamp: new Date().toISOString(),
          ...event,
        },
      ],
    })),
  clearEvents: () => set({ events: [] }),
}));
