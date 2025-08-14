import { create } from 'zustand'

const sessionStore = create((set) => ({
  user: {},
  token: '',
  setUser: (user) => set((state) => ({ user })),
  setToken: (token) => set((state) => ({ token })),
}))

export default sessionStore