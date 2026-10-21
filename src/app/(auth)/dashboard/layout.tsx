import Sidebar from './components/sidebar'
import { getUser } from './actions/_getUser'

// Sidebar lives here instead of in every page.tsx so it mounts once per
// session instead of unmounting/remounting (and re-fetching the user,
// unread count, and an auth token refresh) on every single navigation.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Determined once, server-side, per page load — Sidebar no longer has to
  // client-fetch the user just to decide whether to show the manager section,
  // so there's nothing to re-check (or flash in) as the user navigates.
  const user = await getUser()
  const hasManagementView = user?.position === 'manager' || user?.position === 'assistant'

  return (
    <>
      <Sidebar hasManagementView={hasManagementView} />
      {children}
    </>
  )
}
