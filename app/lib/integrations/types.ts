export type Marketplace = 'naver' | 'gmarket'

export type ProviderKeyRecord = {
  naver?: { clientId: string; clientSecret: string; shopId?: string }
  gmarket?: { apiKey: string; apiSecret: string; shopId?: string }
}

export type OrderDTO = {
  id: string
  channel: Marketplace
  number: string
  buyer: string
  total: number
  createdAt: string
}

export type ListOrdersParams = {
  since?: string // ISO string
}

export interface ProviderAdapter {
  name: Marketplace
  hasKeys: (keys: ProviderKeyRecord) => boolean
  listOrders: (keys: ProviderKeyRecord, params: ListOrdersParams) => Promise<OrderDTO[]>
}


