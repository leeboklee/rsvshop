'use client'

import { useEffect, useMemo, useState } from 'react'

export default function PaymentsAdminPage() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('')

  const load = async () => {
    setLoading(true)
    try {
      // 간단 구현: 최근 예약(결제 대상) 목록을 조회해 상태와 금액 확인
      const res = await fetch('/api/admin/reservations?limit=20')
      const data = await res.json()
      const list = (data.bookings || []).map((b: any) => ({
        id: b.id,
        guestName: b.guestName,
        totalAmount: b.totalAmount,
        status: b.status,
        createdAt: b.createdAt,
      }))
      setRows(list)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => `${r.id} ${r.guestName}`.toLowerCase().includes(q))
  }, [rows, filter])

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">결제 관리</h1>
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1" placeholder="검색: 주문ID/고객명" value={filter} onChange={(e)=>setFilter(e.target.value)} />
            <button className="px-3 py-1 rounded-md border" onClick={load} disabled={loading}>새로고침</button>
          </div>
        </div>
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left">주문ID</th>
                <th className="p-2 text-left">고객</th>
                <th className="p-2 text-left">금액</th>
                <th className="p-2 text-left">상태</th>
                <th className="p-2 text-left">일시</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2 font-mono text-xs">{r.id}</td>
                  <td className="p-2">{r.guestName || '-'}</td>
                  <td className="p-2">{Math.round(r.totalAmount||0).toLocaleString()} 원</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2 text-xs text-gray-600">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-3 text-sm text-gray-600">불러오는 중…</div>}
        </div>
        <div className="text-xs text-gray-500 mt-2">결제 성공 시 예약 상태는 자동 확정됩니다.</div>
      </div>
    </div>
  )
}


