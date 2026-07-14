import { createContext, useContext } from 'react'

export const QueryRestoreContext = createContext(false)

export function useQueryRestorePending(): boolean {
  return useContext(QueryRestoreContext)
}
