import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const paymentAPI = {
  /**查询是否已经开通支付 */
  index: async (data: { uid: number }) => {
    return await makeRequest<PaymentApp>({
      method: 'post',
      url: '/payment/index',
      data,
    })
  },
  create: async (data: { uid: number }) => {
    return await makeRequest<PaymentApp>({
      method: 'post',
      url: '/payment/create',
      data,
    })
  },
  /**查看密钥 */
  token: async (data: { uid: number; reset?: boolean }) => {
    return await makeRequest({
      method: 'post',
      url: '/payment/token',
      data,
    })
  },
  /**查看hook */
  hook: async (data: { uid: number; hook?: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/payment/hook',
      data,
    })
  },
  /**申请提款 */
  withdraw: async (data: { uid: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/payment/withdraw',
      data,
    })
  },
  /**查看详情列表 */
  category: async (data: { uid: number; page: number; cate: number }) => {
    return await makeRequest<PaymentListItem, 'list'>({
      method: 'post',
      url: '/payment/detail/category',
      data,
    })
  },
  /**查看详情 */
  detail: async (data: { uid: number; id: number }) => {
    return await makeRequest<PaymentListItem>({
      method: 'post',
      url: '/payment/detail',
      data,
    })
  },
}

interface PaymentApp {
  id: string
  name: string
  link: string
  count: {
    count1: number
    count2: number
    count3: number
  }
  balance: {
    trc20: number
    erc20: number
    bep20: number
  }
  hook: string
  created_at: number
}

interface PaymentListItem {
  id: number
  chain: string
  amount: string
  category: string
  status: number
  created_at: number
}
