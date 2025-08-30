'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'

type MarketplaceKey = 'naver' | 'gmarket'

export default function MarketplacesIntegrationPage() {
  const [form, setForm] = useState<Record<MarketplaceKey, any>>({
    naver: { clientId: '', clientSecret: '' },
    gmarket: { apiKey: '', apiSecret: '' },
  })
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch('/api/integrations/marketplaces/keys')
      if (res.ok) {
        const data = await res.json()
        setForm({
          naver: { clientId: data?.naver?.clientId || '', clientSecret: data?.naver?.clientSecret || '' },
          gmarket: { apiKey: data?.gmarket?.apiKey || '', apiSecret: data?.gmarket?.apiSecret || '' },
        })
        setLastSavedAt(data?._meta?.savedAt || null)
      }
    } catch {}
  }

  // 초기 로딩 시 저장된 키 불러오기
  useEffect(() => { load() }, [])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const save = async () => {
    setSaving(true); setMessage(null)
    const res = await fetch('/api/integrations/marketplaces/keys', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    })
    setSaving(false)
    if (res.ok) {
      const r = await res.json()
      setLastSavedAt(r.savedAt || null)
      setMessage('저장되었습니다')
    }
    else setMessage('저장 실패')
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">쇼핑몰 연동</h1>
        {lastSavedAt && <div className="text-xs text-gray-500">최근 저장: {new Date(lastSavedAt).toLocaleString()}</div>}
        <p className="text-sm text-gray-600">오픈 API 키를 저장하고 주문 연동을 설정합니다.</p>

        <section className="bg-white border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">네이버 스마트스토어</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="border rounded px-3 py-2" placeholder="Client ID"
              value={form.naver.clientId}
              onChange={(e)=>setForm(f=>({ ...f, naver: { ...f.naver, clientId: e.target.value }}))}
            />
            <input className="border rounded px-3 py-2" placeholder="Client Secret"
              value={form.naver.clientSecret}
              onChange={(e)=>setForm(f=>({ ...f, naver: { ...f.naver, clientSecret: e.target.value }}))}
            />
          </div>
          <div className="text-xs text-gray-500">참고: 네이버 오픈 API 가이드에 따라 발급한 자격 증명을 입력하세요.</div>
        </section>

        <section className="bg-white border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">G마켓</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="border rounded px-3 py-2" placeholder="API Key"
              value={form.gmarket.apiKey}
              onChange={(e)=>setForm(f=>({ ...f, gmarket: { ...f.gmarket, apiKey: e.target.value }}))}
            />
            <input className="border rounded px-3 py-2" placeholder="API Secret"
              value={form.gmarket.apiSecret}
              onChange={(e)=>setForm(f=>({ ...f, gmarket: { ...f.gmarket, apiSecret: e.target.value }}))}
            />
          </div>
          <div className="text-xs text-gray-500">참고: G마켓 파트너 오픈 API 문서의 키를 입력합니다.</div>
        </section>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded bg-emerald-600 text-white" onClick={save} disabled={saving}>저장</button>
          {message && <span className="text-sm text-gray-600">{message}</span>}
          <Link href="/channeling/integrations/orders" className="ml-auto underline text-sm">주문 목록 연동으로 이동 →</Link>
        </div>
      </div>
    </div>
  )
}


