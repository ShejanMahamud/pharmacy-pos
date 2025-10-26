import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Branch {
  id: string
  name: string
  code: string
  address?: string
  phone?: string
  email?: string
}

interface BranchState {
  selectedBranch: Branch | null
  branches: Branch[]
  setSelectedBranch: (branch: Branch) => void
  loadBranches: () => Promise<void>
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      selectedBranch: null,
      branches: [],
      setSelectedBranch: (branch: Branch) => {
        set({ selectedBranch: branch })
      },
      loadBranches: async () => {
        try {
          const branches = await window.api.branches.getAll()
          set({ branches })
          // Auto-select first branch if none selected
          const currentState = get()
          if (branches.length > 0 && !currentState.selectedBranch) {
            set({ selectedBranch: branches[0] })
          }
        } catch (error) {
          console.error('Error loading branches:', error)
        }
      }
    }),
    {
      name: 'branch-storage'
    }
  )
)
