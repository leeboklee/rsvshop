"use client"

import { useEffect, useMemo, useState } from "react"

type Counts = { PENDING: number; CONFIRMED: number; CANCELLED: number; COMPLETED: number }

export default function LinkedReservationsPage() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const [status, setStatus] = useState<string>("PENDING")
  const [channel, setChannel] = useState<string>("")
  const [counts, setCounts] = useState<Counts>({ PENDING: 0, CONFIRMED: 0, CANCELLED: 0, COMPLETED: 0 })
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const channelCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of rows) {
      const ch = (r.notes || '').split(';').find((s: string) => s.trim().startsWith('channel='))?.split('=')[1] || 'SITE'
      m.set(ch, (m.get(ch) || 0) + 1)
    }
    return Array.from(m.entries()).map(([k, v]) => ({ channel: k, count: v }))
  }, [rows])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const load = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (status) qs.set("status", status)
      if (channel) qs.set("channel", channel)

      // 목록(필터 적용)
      const res = await fetch("/api/site/bookings?" + qs.toString())
      const list = await res.json()
      setRows(list)

      // 상태 요약(전체 기준)
      const allRes = await fetch("/api/site/bookings")
      const allList: any[] = await allRes.json()
      const nextCounts: Counts = { PENDING: 0, CONFIRMED: 0, CANCELLED: 0, COMPLETED: 0 }
      for (const b of allList) {
        if (b.status in nextCounts) nextCounts[b.status as keyof Counts]++
      }
      setCounts(nextCounts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, channel])

  const updateStatus = async (id: string, next: string) => {
    const res = await fetch("/api/site/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    })
    if (!res.ok) return alert("상태 변경 실패")
    await load()
    // 상태 변경 후 첫 행 상세 확인
    try {
      const first = rows[0]
      if (first?.id) {
        await fetch(`/api/admin/reservations/${first.id}`)
      }
    } catch {}
  }

  const statusChips = useMemo(
    () => [
      { key: "PENDING", label: "대기", value: counts.PENDING, color: "bg-amber-100 text-amber-700" },
      { key: "CONFIRMED", label: "확정", value: counts.CONFIRMED, color: "bg-emerald-100 text-emerald-700" },
      { key: "CANCELLED", label: "취소", value: counts.CANCELLED, color: "bg-rose-100 text-rose-700" },
      { key: "COMPLETED", label: "완료", value: counts.COMPLETED, color: "bg-slate-100 text-slate-700" },
    ],
    [counts]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">연동예약관리</h1>
        <p className="text-gray-600 mb-6">홈페이지 등 채널에서 들어오는 예약을 확인/승인/거절합니다.</p>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <select className="border rounded px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">전체</option>
            <option value="PENDING">대기</option>
            <option value="CONFIRMED">확정</option>
            <option value="CANCELLED">취소</option>
            <option value="COMPLETED">완료</option>
          </select>
          <select className="border rounded px-2 py-1" value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="">채널: 전체</option>
            <option value="SITE">SITE</option>
            <option value="LOTTE">LOTTE</option>
            <option value="HYUNDAI">HYUNDAI</option>
          </select>
          <button className="px-3 py-1 rounded-md border" onClick={load} disabled={loading}>
            새로고침
          </button>
          {/* 빠른 토글 */}
          <div className="flex flex-wrap gap-1 ml-2 text-xs">
            {['PENDING','CONFIRMED','CANCELLED'].map((s)=> (
              <button key={s} className={`px-2 py-1 rounded border ${status===s? 'bg-gray-900 text-white':'bg-white'}`} onClick={()=>setStatus(s)}>
                {s}
              </button>
            ))}
            {['SITE','LOTTE','HYUNDAI'].map((c)=> (
              <button key={c} className={`px-2 py-1 rounded border ${channel===c? 'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setChannel(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap gap-1 text-xs">
            {statusChips.map((c) => (
              <span key={c.key} className={`px-2 py-1 rounded ${c.color}`}>
                {c.label}: {c.value}
              </span>
            ))}
          </div>
        </div>

        {/* 채널별 개수 배지 */}
        <div className="mb-3 flex flex-wrap gap-1 text-xs">
          {channelCounts.map((c) => (
            <span key={c.channel} className="px-2 py-1 rounded bg-slate-100 text-slate-700 border">
              {c.channel}: {c.count}
            </span>
          ))}
        </div>

        <div className="rounded-xl bg-white border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left">생성일</th>
                <th className="p-2 text-left">고객</th>
                <th className="p-2 text-left">기간</th>
                <th className="p-2 text-left">합계</th>
                <th className="p-2 text-left">상태</th>
                <th className="p-2 text-left">액션</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <>
                  <tr key={b.id} className="border-t">
                    <td className="p-2 text-xs text-gray-500">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-0.5 rounded border text-gray-600 hover:bg-gray-50"
                          onClick={() => toggleExpand(b.id)}
                        >
                          {expandedIds.has(b.id) ? "접기" : "상세"}
                        </button>
                        <span>
                          {b.guestName} ({b.guestPhone})
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-xs">
                      {b.checkInDate?.slice(0, 10)} ~ {b.checkOutDate?.slice(0, 10)}
                    </td>
                    <td className="p-2">{Math.round(b.totalAmount || 0).toLocaleString()} 원</td>
                    <td className="p-2">{b.status}</td>
                    <td className="p-2">
                      {b.status === "PENDING" && (
                        <>
                          <button
                            className="px-2 py-0.5 rounded border text-emerald-700"
                            onClick={() => updateStatus(b.id, "CONFIRMED")}
                          >
                            확정
                          </button>
                          <button
                            className="ml-1 px-2 py-0.5 rounded border text-red-700"
                            onClick={() => updateStatus(b.id, "CANCELLED")}
                          >
                            거절
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {expandedIds.has(b.id) && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={6} className="p-3">
                        <div className="text-xs text-gray-600 mb-2">아이템</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(b.bookingItems || []).map((it: any) => (
                            <div key={`${it.date}-${it.packageId}`} className="p-2 border rounded bg-white">
                              <div className="text-xs text-gray-500">{new Date(it.date).toISOString().slice(0, 10)}</div>
                              <div className="font-medium">{Math.round(it.price).toLocaleString()} 원</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-3 text-sm text-gray-600">불러오는 중…</div>}
        </div>
      </div>
    </div>
  )
}


