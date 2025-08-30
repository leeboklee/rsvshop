import { OrderDTO, ProviderAdapter, ProviderKeyRecord } from '../types'

async function fetchOrders(keys: ProviderKeyRecord, since?: string): Promise<OrderDTO[]> {
  // TODO: replace with real API call
  return []
}

const gmarketAdapter: ProviderAdapter = {
  name: 'gmarket',
  hasKeys: (keys) => Boolean(keys.gmarket?.apiKey && keys.gmarket?.apiSecret),
  async listOrders(keys, params) {
    return fetchOrders(keys, params.since)
  },
}

export default gmarketAdapter


