export type NavItem = { href: string; label: string; newTab?: boolean }
export type NavGroup = { label: string; items: NavItem[] }

export const navItemsGrouped: NavGroup[] = [
  { label: '대시보드', items: [
    { href: '/admin', label: '대시보드' },
  ]},
  { label: '예약/객실', items: [
    { href: '/admin/reservations', label: '예약 관리' },
    { href: '/admin/calendar', label: '달력 뷰' },
    { href: '/admin/rooms', label: '호텔 관리' },
    { href: '/admin/packages', label: '패키지 관리' },
    { href: '/admin/shopping-malls', label: '쇼핑몰 관리' },
    { href: '/admin/customers', label: '고객 관리' },
  ]},
  { label: '매출/정산', items: [
    { href: '/admin/sales', label: '매출 관리' },
    { href: '/admin/commission', label: '수수료 관리' },
    { href: '/admin/vat-management', label: '부가세 관리' },
  ]},
  { label: 'Channeling', items: [
    { href: '/channeling', label: 'Overview' },
    { href: '/channeling/integrations/marketplaces', label: '쇼핑몰 연동' },
    { href: '/channeling/integrations/orders', label: '주문 목록 연동' },
    { href: '/channeling/api-keys', label: 'API 키' },
    { href: '/hotel-admin/payments', label: '결제 관리' },
  ]},

  { label: '시스템', items: [
    { href: '/admin/database', label: 'DB 관리' },
    { href: '/admin/error-monitor', label: '에러 모니터' },
    { href: '/admin/logs', label: '로그 뷰어' },
  ]},
]


