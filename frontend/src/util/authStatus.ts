import { create } from 'zustand';

interface AuthStatusState {
  authed: boolean;
  login: () => void;
  logout: () => void;
}

const useAuthStatus = create<AuthStatusState>((set) => ({
  authed: false,

  login: () => set(() => ({ authed: true })),

  logout: () => set(() => ({ authed: false })),
}));

export { useAuthStatus };
export type { AuthStatusState };