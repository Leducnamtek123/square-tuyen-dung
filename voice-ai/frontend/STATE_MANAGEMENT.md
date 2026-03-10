# State Management Guidelines (Constitution)

This document establishes the "Division of Power" rules for state management in this project using **Zustand** and **TanStack Query**. Strict adherence to these rules is required to maintain a clean, maintainable, and predictable codebase.

---

## Rule 1: Server State → TanStack Query

> **Anything from API, DB, Backend ⇒ Managed by Query**

### Includes:
*   Data fetch (`GET`)
*   Pagination, infinite scroll
*   Cache, stale, refetch
*   Loading / error states of API
*   Mutation + invalidation

### STRICTLY FORBIDDEN:
*   Copying data from query → zustand
*   Manually syncing query data

### ✅ CORRECT Usage:
```ts
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
})
```

### ❌ ANTI-PATTERN:
```ts
// NEVER DO THIS
useEffect(() => {
  setUsers(query.data)
}, [query.data])
```

---

## Rule 2: Client / UI / App State → Zustand

> **Things that do NOT exist on the server ⇒ Managed by Zustand**

### Examples:
*   Auth state (token, role, temporary user info)
*   **UI State:**
    *   Modal open/close
    *   Sidebar collapse
    *   Selected tab
*   **Workflow State:** (step, draft, wizard)
*   Feature flags
*   Temporary user input (before submission)

### ✅ CORRECT Usage:
```ts
const useUIStore = create(set => ({
  isSidebarOpen: true,
  toggleSidebar: () =>
    set(s => ({ isSidebarOpen: !s.isSidebarOpen }))
}))
```

---

## Rule 3: No Duplicate Ownership

> **1 type of state has ONLY 1 "source of truth"**

| State | Location |
| :--- | :--- |
| User list from API | **Query** |
| Selected User | **Zustand** |
| Filter / search keyword | **Zustand** |
| Result after filter | **Derived from Query + Zustand** |

### ✅ CORRECT Usage:
```ts
const { data: users } = useUsersQuery()
const keyword = useFilterStore(s => s.keyword)

// Derive on the fly, do not store "filteredUsers" in state
const filteredUsers = useMemo(
  () => users?.filter(u => u.name.includes(keyword)),
  [users, keyword]
)
```

---

## Rule 4: Zustand does NOT do Async Business

> **Zustand does NOT fetch API, does NOT retry, does NOT cache.**

### ❌ WRONG:
```ts
const useUserStore = create(set => ({
  users: [],
  fetchUsers: async () => {
    const res = await api.get('/users') // NO API CALLS HERE
    set({ users: res.data })
  }
}))
```

### ✅ CORRECT:
*   **Query** handles fetching.
*   **Zustand** only controls behavior/UI state.

---

## Rule 5: Mutation Complete → Invalidate Query

> **Instead of setting data manually**

### ✅ CORRECT Usage:
```ts
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    // Force refetch to ensure source of truth is updated
    queryClient.invalidateQueries({ queryKey: ['users'] })
  }
})
```

**Zustand is ONLY used for:**
*   Closing modal
*   Resetting form
*   Changing step

---

## Rule 6: Derived State → Do NOT Store

> **If it can be calculated, do now store it.**

### ❌ WRONG:
```ts
state: {
  users: [...],
  totalUsers: 10 // Redundant
}
```

### ✅ CORRECT:
```ts
// Calculate in component
const totalUsers = users?.length ?? 0
```

---

## Rule 7: Naming Rules

*   **Query:** `useUsersQuery`, `useUserDetailQuery`
*   **Mutation:** `useCreateUserMutation`
*   **Zustand:** `useUIStore`, `useAuthStore`, `useWorkflowStore`

> Name it so you know **who manages what**.

---

## Mental Model Map 🧠

```
Backend
   ↓
TanStack Query  ← cache, refetch, stale
   ↓
Derived data (filter, sort)
   ↑
Zustand ← UI / App logic / Workflow
```

---

## When to COMBINE

**Example:** Search + Pagination
*   **Zustand:** holds `page`, `keyword`
*   **Query:** fetches data based on that state

### ✅ CORRECT Pattern:
```ts
const { page, keyword } = useFilterStore()

useQuery({
  queryKey: ['users', page, keyword],
  // Pass state to fetcher
  queryFn: () => fetchUsers({ page, keyword })
})
```
