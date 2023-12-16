import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const paymentAPI = {
  /**查询是否已经开通支付 */
  index: async (data: { openid: string }) => {
    return await makeRequest<PaymentApp>({
      method: 'post',
      url: '/payment/index',
      data,
    })
  },
  create: async (data: { openid: string }) => {
    return await makeRequest<PaymentApp>({
      method: 'post',
      url: '/payment/create',
      data,
    })
  },
  /**查看密钥 */
  token: async (data: { openid: string; reset?: boolean }) => {
    return await makeRequest({
      method: 'post',
      url: '/payment/token',
      data,
    })
  },
  /**查看hook */
  webhook: async (data: { openid: string; webhook?: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/payment/webhook',
      data,
    })
  },
  /**申请提款 */
  withdraw: async (data: { openid: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/payment/withdraw',
      data,
    })
  },
  /**查看详情列表 */
  record: async (data: { openid: string; page: number; item: number }) => {
    return await makeRequest<PaymentRecord, 'list'>({
      method: 'post',
      url: '/payment/log/record',
      data,
    })
  },
  /**查看详情 */
  detail: async (data: { openid: string; id: number }) => {
    return await makeRequest<PaymentRecord>({
      method: 'post',
      url: '/payment/log/detail',
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

interface PaymentRecord {
  id: number
  type: string
  token: string
  amount: string
  status: number
  created_at: number
}
