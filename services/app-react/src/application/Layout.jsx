import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import AppHeader from '@/components/layout/AppHeader'
import AppSidebar from '@/components/layout/AppSidebar'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <AppHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
      />
      <div className="mx-auto flex w-full max-w-[1600px]">
        <AppSidebar collapsed={sidebarCollapsed} />
        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
