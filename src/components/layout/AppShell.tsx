import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Sidebar />
      <main className="ml-64 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  )
}
