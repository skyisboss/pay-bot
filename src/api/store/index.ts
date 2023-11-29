import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const storeAPI = {
  goods: async (data: { shop_id: number; page: number }) => {
    return await makeRequest<GoodsItem, 'list'>({
      method: 'post',
      url: '/store/goods',
      data,
    })
  },
}

export interface GoodsItem {
  id: number
  price: number
  title: string
  chain: string
  create_at: number
  selled: number
}
