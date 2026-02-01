import { create } from "zustand"

interface SSEState {
  isConnected: boolean
  clientId: string | null
  reconnectAttempts: number
  maxReconnectAttempts: number
  lastEventTime: Date | null
  setConnected: (connected: boolean, clientId?: string | null) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
  setLastEventTime: (time: Date) => void
}

export const useSSEStore = create<SSEState>((set) => ({
  isConnected: false,
  clientId: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  lastEventTime: null,

  setConnected: (connected, clientId = null) =>
    set({ isConnected: connected, clientId }),

  incrementReconnectAttempts: () =>
    set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),

  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),

  setLastEventTime: (time) => set({ lastEventTime: time }),
}))
