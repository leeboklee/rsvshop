"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type NavItem = { href: string; label: string; newTab?: boolean }
type NavGroup = { label: string; items: NavItem[] }

export default function AdminShellClient({
  children,
  navItems,
}: {
  children: React.ReactNode
  navItems: (NavItem | NavGroup)[]
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [mobileOpen, setMobileOpen] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const saved = window.localStorage.getItem('admin.sidebar.collapsed')
    if (saved) setIsCollapsed(saved === '1')
    try {
      const raw = window.localStorage.getItem('admin.sidebar.expanded')
      if (raw) setExpanded(JSON.parse(raw))
    } catch {}
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem('admin.sidebar.collapsed', next ? '1' : '0')
      return next
    })
  }

  const persistExpanded = (next: Record<string, boolean>) => {
    try { window.localStorage.setItem('admin.sidebar.expanded', JSON.stringify(next)) } catch {}
  }

  const isGroup = (entry: any): entry is NavGroup => !!entry && Array.isArray(entry.items)

  const initialExpanded = useMemo(() => {
    const map: Record<string, boolean> = {}
    navItems.forEach((e: any) => { if (isGroup(e)) map[e.label] = true })
    return map
  }, [navItems])

  const isOpen = (label: string) => (expanded[label] ?? initialExpanded[label] ?? true)

  const toggleGroup = (label: string) => {
    const next = { ...expanded, [label]: !isOpen(label) }
    setExpanded(next)
    persistExpanded(next)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              {/* 모바일: 메뉴 열기 */}
              <button
                aria-label="메뉴"
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border hover:bg-gray-50"
                onClick={() => setMobileOpen(true)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* 데스크톱: 사이드바 접기/펼치기 */}
              <button
                aria-label="사이드바 토글"
                className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-md border hover:bg-gray-50"
                onClick={toggleCollapse}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6l-6 6 6 6M14 6l6 6-6 6" />
                </svg>
              </button>

              <Link href="/admin" className="text-xl font-bold text-gray-900">
                RSVShop 관리자
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 본문 - 좌측 사이드바 + 콘텐츠 */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex gap-6">
          {/* 좌측 사이드바 (데스크톱) */}
          <aside className={`hidden md:block shrink-0 transition-all duration-200 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="bg-white border rounded-lg p-2 h-full">
              <ul className="space-y-1">
                {navItems.map((entry, idx) => {
                  const group = entry as NavGroup
                  if (isGroup(group)) {
                    return (
                      <li key={`grp-${idx}`} className="mt-2">
                        <button
                          type="button"
                          onClick={() => !isCollapsed && toggleGroup(group.label)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md border text-xs transition-colors ${isCollapsed ? 'sr-only' : ''} ${isOpen(group.label) ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          <span className="tracking-wide">{group.label}</span>
                          <svg className={`w-4 h-4 transition-transform ${isOpen(group.label) ? 'text-gray-700' : 'text-gray-400 -rotate-90'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                        </button>
                        {isOpen(group.label) && (
                          <ul className="ml-0 mt-1 border-l-2 border-gray-200 pl-2">
                            {group.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                                  title={item.label}
                                  target={item.newTab ? '_blank' : undefined}
                                  rel={item.newTab ? 'noopener noreferrer' : undefined}
                                >
                                  <span className={`${isCollapsed ? 'sr-only' : 'inline'} whitespace-nowrap`}>{item.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  }
                  const item = entry as NavItem
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                        title={item.label}
                        target={item.newTab ? '_blank' : undefined}
                        rel={item.newTab ? 'noopener noreferrer' : undefined}
                      >
                        <span className={`${isCollapsed ? 'sr-only' : 'inline'} whitespace-nowrap`}>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>

          {/* 모바일 드로어 사이드바 */}
          {mobileOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-64 bg-white border-r shadow-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">메뉴</span>
                  <button
                    aria-label="닫기"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-md border hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ul className="space-y-1">
                  {navItems.map((entry, idx) => {
                    const group = entry as NavGroup
                    if (isGroup(group)) {
                      return (
                        <li key={`mgrp-${idx}`} className="mt-2">
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.label)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-md border text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50"
                          >
                            <span>{group.label}</span>
                            <svg className={`w-4 h-4 transition-transform ${isOpen(group.label) ? 'text-gray-700' : 'text-gray-400 -rotate-90'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                          </button>
                          {isOpen(group.label) && (
                            <ul className="mt-1 border-l-2 border-gray-200 pl-2">
                              {group.items.map((item) => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMobileOpen(false)}
                                    target={item.newTab ? '_blank' : undefined}
                                    rel={item.newTab ? 'noopener noreferrer' : undefined}
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      )
                    }
                    const item = entry as NavItem
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setMobileOpen(false)}
                          target={item.newTab ? '_blank' : undefined}
                          rel={item.newTab ? 'noopener noreferrer' : undefined}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* 메인 콘텐츠 */}
          <main className="flex-1 min-w-0 overflow-x-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}


