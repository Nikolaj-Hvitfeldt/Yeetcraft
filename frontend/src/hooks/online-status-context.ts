import { createContext, useContext } from 'react'

export const OnlineStatusContext = createContext(true)

export function useOnlineStatus(): boolean {
  return useContext(OnlineStatusContext)
}
