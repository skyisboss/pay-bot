import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const walletAPI = {
  index: async (data: { fromId: number }) => {
    return await makeRequest<ApiResult.WalletIndex>({
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
  depositInfo: async (data: { uid: number; chain: string }) => {
    return await makeRequest<DepositInfo>({
      method: 'post',
      url: '/wallet/deposit/info',
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
  transfer: async (data: { uid: number; chain: string; payee: string; amount: string }) => {
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
  withdraw: async (data: { uid: number; chain: string; amount: string; address: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/wallet/withdraw',
      data,
    })
  },
  /**查看记录 列表 */
  historyList: async (data: { item: number; page: number }) => {
    return await makeRequest<HistoryItem, 'list'>({
      method: 'post',
      url: '/wallet/historyList',
      data,
    })
  },
  /**查看记录 详情 */
  historyDetail: async (data: { item: number; id: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/wallet/historyDetail',
      data,
    })
  },
  /**发红包 */
  fahongbao: async (data: {
    uid: number
    type: string
    chain: string
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
  min: string
  received: string
  qrcode: string
}

interface BalanceInfo {
  chain: string
  amount: number
}

interface RateRes {
  usd_cny: string
  usd_php: string
  usd_trc20: string
  usd_erc20: string
  usd_bep20: string
  updated_at: number
}

interface HistoryItem {
  id: number
  chain: string
  amount: string
  hbType?: string
  created_at: number
}
