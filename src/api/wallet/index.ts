import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const walletAPI = {
  index: async (data: { openid: string }) => {
    return await makeRequest<ApiResult.WalletInfo>({
      method: 'post',
      url: '/wallet/index',
      data,
    })
  },
  /**实时汇率 */
  getRate: async (data?: {}) => {
    return await makeRequest<RateRes>({
      method: 'post',
      url: '/wallet/rate',
      data,
    })
  },
  /**查询充值信息 */
  depositInfo: async (data: { uid: number; token: string }) => {
    return await makeRequest<DepositInfo>({
      method: 'post',
      url: '/wallet/deposit',
      data,
    })
  },
  checkUser: async (data: { uid: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/wallet/checkUser',
      data,
    })
  },
  /**
   * 获取用户的某个币种余额
   * chain 空时返回全部余额
   */
  balanceOf: async (data: { uid: number; chain?: number }) => {
    return await makeRequest<BalanceInfo, 'list'>({
      method: 'post',
      url: '/wallet/balanceOf',
      data,
    })
  },
  transfer: async (data: { openid: string; to_user: string; token: string; amount: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/wallet/transfer',
      data,
    })
  },
  /**检测提币地址 */
  checkWithdrawAddress: async (data: { uid: number; chain: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/wallet/withdrawAddress',
      data,
    })
  },
  /**提币 */
  withdraw: async (data: { openid: string; token: string; amount: string; address: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/wallet/withdraw',
      data,
    })
  },
  /**查看记录 列表 */
  historyList: async (data: { openid: string; item: number; page: number }) => {
    return await makeRequest<HistoryItem, 'list'>({
      method: 'post',
      url: '/wallet/history/index',
      data,
    })
  },
  /**查看记录 详情 */
  historyDetail: async (data: { openid: string; item: number; id: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/wallet/history/detail',
      data,
    })
  },
  /**发红包 */
  fahongbao: async (data: {
    openid: string
    type: string
    token: string
    amount: string
    user: string
    split: string
  }) => {
    return await makeRequest({
      method: 'post',
      url: '/wallet/fahongbao',
      data,
    })
  },
}

interface DepositInfo {
  address: string
  min_amount: string
  max_amount: string
  qrcode: string
}

interface BalanceInfo {
  chain: string
  amount: number
}

interface RateRes {
  cny: string
  php: string
  trc20: string
  erc20: string
  bep20: string
  updated_at: number
}

interface HistoryItem {
  id: number
  chain: string
  amount: string
  hbType?: string
  created_at: number
}
