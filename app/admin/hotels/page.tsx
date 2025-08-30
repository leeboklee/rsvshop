'use client'

import { useEffect, useMemo, useState } from 'react'

type Hotel = { id: string; name: string; address?: string | null; phone?: string | null; email?: string | null; description?: string | null; createdAt?: string }

export default function HotelsManagementPage() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<Hotel[]>([])
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState<Hotel>({ id: '', name: '', address: '', phone: '', email: '', description: '' })
  const [editingId, setEditingId] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/hotels')
      const data = await res.json()
      setRows((data.hotels || []) as Hotel[])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => r.name.toLowerCase().includes(q))
  }, [rows, filter])

  const submit = async () => {
    if (!form.name.trim()) return alert('호텔명을 입력하세요')
    const method = editingId ? 'PATCH' : 'POST'
    const body = editingId ? { id: editingId, ...form, name: form.name.trim() } : { ...form, name: form.name.trim() }
    const res = await fetch('/api/admin/hotels', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) return alert(data?.error || '저장 실패')
    setForm({ id: '', name: '', address: '', phone: '', email: '', description: '' })
    setEditingId('')
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('삭제하시겠습니까? 관련 데이터가 있으면 삭제할 수 없습니다.')) return
    const res = await fetch(`/api/admin/hotels?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return alert(data?.error || '삭제 실패')
    load()
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">호텔 관리</h1>
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1" placeholder="검색: 호텔명" value={filter} onChange={(e)=>setFilter(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-white rounded-xl border p-3 mb-4">
          <input className="border rounded px-2 py-1" placeholder="호텔명" value={form.name || ''} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} />
          <input className="border rounded px-2 py-1" placeholder="주소" value={form.address || ''} onChange={(e)=>setForm(f=>({...f, address: e.target.value}))} />
          <input className="border rounded px-2 py-1" placeholder="전화" value={form.phone || ''} onChange={(e)=>setForm(f=>({...f, phone: e.target.value}))} />
          <input className="border rounded px-2 py-1" placeholder="이메일" value={form.email || ''} onChange={(e)=>setForm(f=>({...f, email: e.target.value}))} />
          <div className="flex items-center justify-end">
            <button className="px-3 py-1 rounded-md border bg-emerald-600 text-white" onClick={submit}>{editingId ? '수정' : '추가'}</button>
          </div>
          <input className="md:col-span-5 border rounded px-2 py-1" placeholder="설명" value={form.description || ''} onChange={(e)=>setForm(f=>({...f, description: e.target.value}))} />
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left">호텔</th>
                <th className="p-2 text-left">연락처</th>
                <th className="p-2 text-left">이메일</th>
                <th className="p-2 text-left">주소</th>
                <th className="p-2 text-left">작업</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h)=> (
                <tr key={h.id} className="border-t">
                  <td className="p-2 font-medium">{h.name}</td>
                  <td className="p-2">{h.phone || '-'}</td>
                  <td className="p-2">{h.email || '-'}</td>
                  <td className="p-2 text-gray-600">{h.address || '-'}</td>
                  <td className="p-2 whitespace-nowrap">
                    <button className="px-2 py-0.5 rounded border" onClick={()=>{ setEditingId(h.id); setForm({ id: h.id, name: h.name, address: h.address||'', phone: h.phone||'', email: h.email||'', description: h.description||'' }) }}>수정</button>
                    <button className="ml-1 px-2 py-0.5 rounded border text-red-700" onClick={()=>remove(h.id)}>삭제</button>
                    <button
                      className="ml-1 px-2 py-0.5 rounded border text-indigo-700"
                      onClick={async()=>{
                        const url = `${window.location.origin}/site/${encodeURIComponent(h.name)}/book?channel=SITE`
                        try { await navigator.clipboard.writeText(url); alert('링크가 복사되었습니다.') } catch { prompt('링크 복사 실패. 수동으로 복사하세요:', url) }
                      }}
                    >링크 복사</button>
                  </td>
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


