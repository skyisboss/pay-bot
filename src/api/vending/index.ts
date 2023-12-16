import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const vendingAPI = {
  index: async (data: { openid: string }) => {
    return await makeRequest<ShopInfo & ShopBalance>({
      method: 'post',
      url: '/vending/index',
      data,
    })
  },
  baseinfo: async (data: { openid: string }) => {
    return await makeRequest<ShopInfo>({
      method: 'post',
      url: '/vending/baseinfo',
      data,
    })
  },
  create: async (data: { openid: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/vending/create',
      data,
    })
  },
  /**店铺设置 */
  setting: async (data: { openid: string; action: string; value: string }) => {
    return await makeRequest<ShopInfo>({
      method: 'post',
      url: '/vending/setting',
      data,
    })
  },
  goods: async (data: { openid: string; page: number }) => {
    return await makeRequest<GoodsItem, 'list'>({
      method: 'post',
      url: '/goods/index',
      data,
    })
  },
  detail: async (data: { openid: string; id: number }) => {
    return await makeRequest<GoodsItem>({
      method: 'post',
      url: '/goods/detail',
      data,
    })
  },

  /**编辑or添加 */
  edit: async (data: {
    openid: string
    id?: number
    title: string
    price: number
    describe: string
    content: string
  }) => {
    return await makeRequest<GoodsItem>({
      method: 'post',
      url: '/goods/edit',
      data,
    })
  },
  /**店铺设置 */
  delete: async (data: { openid: string; id: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/goods/delete',
      data,
    })
  },
}

export interface ShopInfo {
  id: number
  name: string
  describe: string
  created_at: number
  link: string
  status: number
  goods_count: number
  sales_count: number
  payment: string[]
}

export interface ShopBalance {
  balance: {
    trc20: number
    erc20: number
    bep20: number
  }
}

export interface GoodsItem {
  // id: number
  // price: number
  // title: string
  // chain: string
  // create_at: number
  // selled: number

  id: number
  openid: string
  title: string
  price: number
  describe: string
  content: string
  views: number
  sales: number
  status: number
  version: number
  created_at: string
  updated_at: string
  deleted_at: any
}
