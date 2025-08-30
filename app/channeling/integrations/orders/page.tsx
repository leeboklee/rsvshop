'use client'

import { useEffect, useState } from 'react'

type Order = {
  id: string
  channel: 'naver' | 'gmarket'
  number: string
  buyer: string
  total: number
  createdAt: string
}

export default function OrdersIntegrationPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  const syncNow = async () => {
    setLoading(true)
    try {
      await fetch('/api/integrations/sync', { method: 'POST' })
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">주문 목록 연동</h1>
          <div className="flex items-center gap-2">
            <button onClick={syncNow} className="px-3 py-1 rounded bg-blue-600 text-white" disabled={loading}>동기화</button>
            <button onClick={refresh} className="px-3 py-1 rounded bg-emerald-600 text-white" disabled={loading}>새로고침</button>
          </div>
        </div>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left">채널</th>
                <th className="p-2 text-left">주문번호</th>
                <th className="p-2 text-left">구매자</th>
                <th className="p-2 text-left">총액</th>
                <th className="p-2 text-left">주문일</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && !loading && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">표시할 주문이 없습니다</td></tr>
              )}
              {orders.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="p-2">{o.channel}</td>
                  <td className="p-2">{o.number}</td>
                  <td className="p-2">{o.buyer}</td>
                  <td className="p-2">{o.total.toLocaleString()}</td>
                  <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-3 text-sm text-gray-600">불러오는 중…</div>}
        </div>
      </div>
    </div>
  )
}


