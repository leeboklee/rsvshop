// DbOverlayClient 제거됨 - iframe 방식 대신 직접 페이지로 이동
import AdminShellClient from './AdminShellClient'
import { navItemsGrouped } from './nav.config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = navItemsGrouped

  return (
    <AdminShellClient navItems={navItems}>
      {children}
      {/* DbOverlayClient 제거됨 - iframe 방식 대신 직접 페이지로 이동 */}
    </AdminShellClient>
  )
}
