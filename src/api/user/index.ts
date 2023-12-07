import { makeRequest } from '@/http'

export const userAPI = {
  userinfo: async (data: { uid: number; nickname: string }) => {
    return await makeRequest<ApiResult.Userinfo>({
      method: 'post',
      url: '/user/index',
      data,
    })
  },
  checkUser: async (data: { openid: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/user/checkUser',
      data,
    })
  },
  getConfig: async (data?: {}) => {
    return await makeRequest<ApiResult.Config>({
      method: 'post',
      url: '/user/config',
      data,
    })
  },
  settingLang: async (data: { openid: string; lang_code: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/user/setting/lang',
      data,
    })
  },
  settingCurrency: async (data: { openid: string; currency: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/user/setting/currency',
      data,
    })
  },
  settingPinCode: async (data: { openid: string; pin_code: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/user/setting/pincode',
      data,
    })
  },
  settingBackup: async (data: { openid: string; account: string; remove?: boolean }) => {
    return await makeRequest({
      method: 'post',
      url: '/user/setting/backup',
      data,
    })
  },
  assetsTransfer: async (data: { openid: string; account: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/user/assets/transfer',
      data,
    })
  },
  /**邀请 */
  inviteDetail: async (data: { openid: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/user/invite/detail',
      data,
    })
  },
  inviteUsers: async (data: { openid: string; cate: string; page: number }) => {
    return await makeRequest<InviteUsers, 'list'>({
      method: 'post',
      url: '/user/invite/users',
      data,
    })
  },
  inviteWithdraw: async (data: { openid: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/user/invite/withdraw',
      data,
    })
  },
}

interface InviteUsers {
  id: number
  account: string
  status: number
  created_at: number
}
