import { OrderDTO, ProviderAdapter, ProviderKeyRecord } from '../types'

// Placeholder: 실제 OAuth 토큰 발급 및 API 호출은 네이버 문서에 맞춰 구현
async function fetchOrders(keys: ProviderKeyRecord, since?: string): Promise<OrderDTO[]> {
  // TODO: replace with real API call
  return []
}

const naverAdapter: ProviderAdapter = {
  name: 'naver',
  hasKeys: (keys) => Boolean(keys.naver?.clientId && keys.naver?.clientSecret),
  async listOrders(keys, params) {
    return fetchOrders(keys, params.since)
  },
}

export default naverAdapter


