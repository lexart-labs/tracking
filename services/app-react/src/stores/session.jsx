import { create } from 'zustand'

const sessionStore = create((set) => ({
  user: null,
  token: null,
  setUser: (user) => set((state) => ({ user })),
  setToken: (token) => set((state) => ({ token })),
}))

export default sessionStore
