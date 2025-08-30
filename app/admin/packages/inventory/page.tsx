'use client'

import { useEffect, useMemo, useState } from 'react'

type CellState = { allotment: number; closed: boolean; dirty?: boolean }

export default function PackageInventoryPage() {
  const [month, setMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<Record<string, CellState>>({})
  const [hotels, setHotels] = useState<Array<{ id: string; name: string }>>([])
  const [rooms, setRooms] = useState<Array<{ id: string; name: string; hotelId?: string }>>([])
  const [packages, setPackages] = useState<Array<{ id: string; name: string; roomId?: string }>>([])
  const [hotelId, setHotelId] = useState<string>('')
  const [roomId, setRoomId] = useState<string>('')
  const [packageId, setPackageId] = useState<string>('')
  const [range, setRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [dowMask, setDowMask] = useState<number>(127) // 1=일 ... 64=토
  const ym = useMemo(() => ({ y: month.getFullYear(), m: month.getMonth() + 1 }), [month])

  useEffect(() => {
    const boot = async () => {
      try {
        const [h, r, p] = await Promise.all([
          fetch('/api/admin/hotels').then((r) => r.json()).catch(()=>({ hotels: [] })),
          fetch('/api/rooms').then((r) => r.json()),
          fetch('/api/packages').then((r) => r.json()).catch(()=>[]),
        ])
        setHotels((h.hotels || []).map((x: any) => ({ id: x.id, name: x.name })))
        setRooms(r.map((x: any) => ({ id: x.id, name: x.name, hotelId: x.hotelId })))
        setPackages(p.map((x: any) => ({ id: x.id, name: x.name, roomId: x.roomId })))
      } catch {}
    }
    boot()
  }, [])

  useEffect(() => {
    const fetchMonth = async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams(range.from && range.to ? { from: range.from, to: range.to } : { year: String(ym.y), month: String(ym.m) })
        if (hotelId) qs.set('hotelId', hotelId)
        if (roomId) qs.set('roomId', roomId)
        if (packageId) qs.set('packageId', packageId)
        const res = await fetch(`/api/inventory?${qs.toString()}`)
        const list = await res.json()
        const next: Record<string, CellState> = {}
        for (const it of list) {
          const key = new Date(it.date).toISOString().slice(0, 10)
          next[key] = { allotment: it.allotment ?? 0, closed: !!it.closed }
        }
        setData(next)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchMonth()
  }, [ym.y, ym.m, roomId, packageId])

  const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate()
  const firstDow = new Date(month.getFullYear(), month.getMonth(), 1).getDay() // 0=Sun
  const dates: (Date | null)[] = []
  for (let i=0;i<firstDow;i++) dates.push(null)
  for (let d=1; d<=daysInMonth; d++) dates.push(new Date(month.getFullYear(), month.getMonth(), d))

  const changeMonth = (delta: number) => {
    const m = new Date(month)
    m.setMonth(m.getMonth()+delta)
    setMonth(m)
  }

  const onChangeCell = (dt: Date, next: Partial<CellState>) => {
    const key = dt.toISOString().slice(0, 10)
    setData((prev) => ({
      ...prev,
      [key]: { allotment: prev[key]?.allotment ?? 0, closed: prev[key]?.closed ?? false, ...next, dirty: true },
    }))
  }

  const saveAll = async () => {
    const items = Object.entries(data)
      .filter(([, v]) => v.dirty)
      .map(([k, v]) => ({ date: k, allotment: v.allotment ?? 0, closed: !!v.closed }))
    if (items.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error('save failed')
      setData((prev) => {
        const copy: Record<string, CellState> = {}
        for (const [k, v] of Object.entries(prev)) copy[k] = { allotment: v.allotment, closed: v.closed }
        return copy
      })
    } catch (e) {
      console.error(e)
      alert('저장 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">재고/마감 관리</h1>
          <div className="flex flex-wrap items-center gap-2">
            <select className="border rounded px-2 py-1" value={hotelId} onChange={(e)=>{ setHotelId(e.target.value); setRoomId(''); setPackageId('') }}>
              <option value="">호텔: 전체</option>
              {hotels.map(h=> <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <select className="border rounded px-2 py-1" value={roomId} onChange={(e)=>{ setRoomId(e.target.value); setPackageId('') }}>
              <option value="">객실: 전체</option>
              {rooms.filter(r => !hotelId || r.hotelId===hotelId).map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select className="border rounded px-2 py-1" value={packageId} onChange={(e)=> setPackageId(e.target.value)}>
              <option value="">패키지: 전체</option>
              {packages.filter(p=> !roomId || p.roomId===roomId).map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="date" className="border rounded px-2 py-1" value={range.from} onChange={(e)=> setRange(r=>({...r, from: e.target.value}))} />
            <span>~</span>
            <input type="date" className="border rounded px-2 py-1" value={range.to} onChange={(e)=> setRange(r=>({...r, to: e.target.value}))} />
            <div className="ml-2 flex items-center gap-1 text-xs">
              {[1,2,4,8,16,32,64].map((bit, idx)=> (
                <label key={bit} className={`px-2 py-1 rounded border cursor-pointer ${dowMask & bit ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
                  <input type="checkbox" className="hidden" checked={!!(dowMask & bit)} onChange={()=> setDowMask(m=> m ^ bit)} />
                  {['일','월','화','수','목','금','토'][idx]}
                </label>
              ))}
            </div>
            <button className="px-3 py-1 rounded-md border" onClick={()=>changeMonth(-1)} disabled={loading}>&lt;</button>
            <div className="min-w-44 text-center font-semibold">{month.getFullYear()}년 {month.getMonth()+1}월</div>
            <button className="px-3 py-1 rounded-md border" onClick={()=>changeMonth(1)} disabled={loading}>&gt;</button>
            <button className="ml-4 px-3 py-1 rounded-md border bg-emerald-600 text-white disabled:opacity-60" onClick={saveAll} disabled={saving}>
              {saving ? '저장중…' : '저장'}
            </button>
            <button className="px-3 py-1 rounded-md border bg-rose-600 text-white" onClick={()=>{
              // 일괄 마감: 현재 표시되는 날짜 키에 대해 closed=true 반영
              const keys = Object.keys(data)
              const apply = (dt: string) => {
                const d = new Date(dt)
                const dow = d.getDay()
                if (!(dowMask & (1 << dow))) return
                onChangeCell(d, { closed: true })
              }
              keys.forEach(apply)
            }}>일괄 마감</button>
            <button className="px-3 py-1 rounded-md border bg-amber-600 text-white" onClick={()=>{
              const keys = Object.keys(data)
              const apply = (dt: string) => {
                const d = new Date(dt)
                const dow = d.getDay()
                if (!(dowMask & (1 << dow))) return
                onChangeCell(d, { closed: false })
              }
              keys.forEach(apply)
            }}>일괄 재오픈</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 bg-white p-4 rounded-xl border">
          {['일','월','화','수','목','금','토'].map((d)=>(
            <div key={d} className="text-center text-xs font-semibold text-gray-500">{d}</div>
          ))}
          {dates.map((dt, idx)=> (
            <div key={idx} className={`min-h-24 rounded-lg border p-2 ${dt ? '' : 'bg-gray-50'}`}>
              {dt && (
                <>
                  <div className="text-sm font-semibold flex items-center justify-between">
                    <span>{dt.getDate()}</span>
                    {data[dt.toISOString().slice(0,10)]?.dirty && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-700">수정</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                    <span>재고:</span>
                    <input type="number" min={0} className="w-16 border rounded px-1 py-0.5"
                      value={data[dt.toISOString().slice(0,10)]?.allotment ?? 0}
                      onChange={(e)=>onChangeCell(dt, { allotment: Number(e.target.value || 0) })}
                    />
                  </div>
                  <label className="mt-1 inline-flex items-center gap-1 text-xs text-gray-700">
                    <input type="checkbox" className="w-4 h-4"
                      checked={data[dt.toISOString().slice(0,10)]?.closed ?? false}
                      onChange={(e)=>onChangeCell(dt, { closed: e.target.checked })}
                    /> 마감
                  </label>
                </>
              )}
            </div>
          ))}
        </div>
        {loading && <div className="mt-3 text-sm text-gray-600">불러오는 중…</div>}
      </div>
    </div>
  )
}


