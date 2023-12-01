import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const vendingAPI = {
  index: async (data: { uid: number }) => {
    return await makeRequest<ShopInfo>({
      method: 'post',
      url: '/vending/index',
      data,
    })
  },
  goods: async (data: { uid: number; page: number }) => {
    return await makeRequest<GoodsItem, 'list'>({
      method: 'post',
      url: '/vending/goods',
      data,
    })
  },
  detail: async (data: { uid: number; id: number }) => {
    return await makeRequest<GoodsDetail>({
      method: 'post',
      url: '/vending/detail',
      data,
    })
  },
  /**店铺设置 */
  setting: async (data: { uid: number; name?: string; status?: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/vending/setting',
      data,
    })
  },
  /**编辑or添加 */
  edit: async (data: {
    uid: number
    goods: {
      id?: string
      title: string
      price: string
      desc: string
      kami: string
    }
  }) => {
    return await makeRequest<GoodsItem>({
      method: 'post',
      url: '/vending/edit',
      data,
    })
  },
  /**店铺设置 */
  delete: async (data: { uid: number; id: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/vending/delete',
      data,
    })
  },
}

export interface ShopInfo {
  id: number
  title: string
  create_at: number
  link: string
  status: number
  count: {
    count1: number
    count2: number
  }
  amount: {
    trc20: number
    erc20: number
    bep20: number
  }
}

export interface GoodsItem {
  id: number
  price: number
  title: string
  chain: string
  create_at: number
  selled: number
}

export interface GoodsDetail {
  id: number
  title: string
  price: string
  desc: string
  kami: string
  views: string
  sales: string
  created_at: number
}
