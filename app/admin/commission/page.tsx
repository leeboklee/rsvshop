'use client'

import { useEffect, useMemo, useState } from 'react'

type Mall = {
  id: string
  name: string
  commissionRate: number
  description?: string | null
  isActive?: boolean
  createdAt?: string
}

export default function CommissionManagementPage() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<Mall[]>([])
  const [filter, setFilter] = useState<string>('')
  const [editingId, setEditingId] = useState<string>('')
  const [draft, setDraft] = useState<Partial<Mall>>({})
  const [form, setForm] = useState<{ name: string; commissionRate: number; description: string }>({ name: '', commissionRate: 0, description: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shopping-malls')
      const data = await res.json()
      const list: Mall[] = data.shoppingMalls || []
      setRows(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => r.name.toLowerCase().includes(q))
  }, [rows, filter])

  const beginEdit = (row: Mall) => {
    setEditingId(row.id)
    setDraft({ id: row.id, name: row.name, commissionRate: row.commissionRate, description: row.description || '' })
  }

  const cancelEdit = () => {
    setEditingId('')
    setDraft({})
  }

  const saveEdit = async () => {
    if (!editingId || !draft?.name || draft.commissionRate == null) return
    if (draft.commissionRate < 0 || draft.commissionRate > 100) return alert('수수료율은 0~100 사이여야 합니다')
    const res = await fetch(`/api/admin/shopping-malls/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: String(draft.name).trim(),
        commissionRate: Number(draft.commissionRate),
        description: (draft.description ?? '').toString().trim() || null,
      }),
    })
    if (!res.ok) return alert('저장 실패')
    cancelEdit()
    load()
  }

  const createMall = async () => {
    if (!form.name.trim()) return alert('쇼핑몰명을 입력하세요')
    if (form.commissionRate < 0 || form.commissionRate > 100) return alert('수수료율은 0~100 사이여야 합니다')
    const res = await fetch('/api/admin/shopping-malls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name.trim(), commissionRate: Number(form.commissionRate), description: form.description.trim() || null })
    })
    const data = await res.json()
    if (!res.ok || !data?.success) return alert(data?.error || '등록 실패')
    setForm({ name: '', commissionRate: 0, description: '' })
    load()
  }

  const removeMall = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    const res = await fetch(`/api/admin/shopping-malls/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok || !data?.success) return alert(data?.error || '삭제 실패')
    load()
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">수수료 관리</h1>
          <div className="text-sm text-gray-600">수기 예약에서 쇼핑몰 선택 시 이 수수료율로 자동 계산됩니다.</div>
        </div>

        <div className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-2 bg-white border rounded-xl p-3">
          <input className="border rounded px-2 py-1 md:col-span-1" placeholder="쇼핑몰명" value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} />
          <input type="number" className="border rounded px-2 py-1" placeholder="수수료율(%)" value={form.commissionRate} onChange={(e)=>setForm(f=>({...f, commissionRate: Number(e.target.value||0)}))} />
          <input className="border rounded px-2 py-1 md:col-span-2" placeholder="설명(선택)" value={form.description} onChange={(e)=>setForm(f=>({...f, description: e.target.value}))} />
          <div className="md:col-span-4 flex justify-end">
            <button className="px-3 py-1 rounded-md border bg-emerald-600 text-white" onClick={createMall}>추가</button>
          </div>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <input className="border rounded px-2 py-1" placeholder="검색: 쇼핑몰명" value={filter} onChange={(e)=>setFilter(e.target.value)} />
          <button className="px-3 py-1 rounded-md border" onClick={load} disabled={loading}>새로고침</button>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left">쇼핑몰</th>
                <th className="p-2 text-left">수수료율(%)</th>
                <th className="p-2 text-left">설명</th>
                <th className="p-2 text-left">작업</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r)=> (
                <tr key={r.id} className="border-t">
                  <td className="p-2">
                    {editingId===r.id ? (
                      <input className="border rounded px-2 py-1 w-full" value={draft.name as string} onChange={(e)=>setDraft(d=>({...d, name: e.target.value}))} />
                    ) : (
                      <span className="font-medium">{r.name}</span>
                    )}
                  </td>
                  <td className="p-2 w-40">
                    {editingId===r.id ? (
                      <input type="number" className="border rounded px-2 py-1 w-full" value={draft.commissionRate as number} onChange={(e)=>setDraft(d=>({...d, commissionRate: Number(e.target.value||0)}))} />
                    ) : (
                      <span>{r.commissionRate}%</span>
                    )}
                  </td>
                  <td className="p-2">
                    {editingId===r.id ? (
                      <input className="border rounded px-2 py-1 w-full" value={(draft.description as string) || ''} onChange={(e)=>setDraft(d=>({...d, description: e.target.value}))} />
                    ) : (
                      <span className="text-gray-600">{r.description || '-'}</span>
                    )}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {editingId===r.id ? (
                      <>
                        <button className="px-2 py-0.5 rounded border text-emerald-700" onClick={saveEdit}>저장</button>
                        <button className="ml-1 px-2 py-0.5 rounded border" onClick={cancelEdit}>취소</button>
                      </>
                    ) : (
                      <>
                        <button className="px-2 py-0.5 rounded border" onClick={()=>beginEdit(r)}>수정</button>
                        <button className="ml-1 px-2 py-0.5 rounded border text-red-700" onClick={()=>removeMall(r.id)}>삭제</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-3 text-sm text-gray-600">불러오는 중…</div>}
        </div>

        <div className="text-xs text-gray-500 mt-3">
          수기 예약 관리의 쇼핑몰 선택과 판매가 입력 시, 여기의 수수료율을 적용해 수수료/공급가가 자동 계산됩니다.
        </div>
      </div>
    </div>
  )
}


