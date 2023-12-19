import { makeRequest } from '@/http'

export const userAPI = {
  userinfo: async (data: { openid: string }) => {
    return await makeRequest<ApiResult.Userinfo>({
      method: 'post',
      url: '/user/info',
      data,
    })
  },
  register: async (data: { openid: string; nickname: string; invite_code?: string }) => {
    return await makeRequest<ApiResult.Userinfo>({
      method: 'post',
      url: '/user/register',
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
  getConfig: async (data?: { openid: string }) => {
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
  // inviteDetail: async (data: { openid: string }) => {
  //   return await makeRequest({
  //     method: 'post',
  //     url: '/user/invite/detail',
  //     data,
  //   })
  // },
  // inviteUsers: async (data: { openid: string; cate: string; page: number }) => {
  //   return await makeRequest<InviteUsers, 'list'>({
  //     method: 'post',
  //     url: '/user/invite/users',
  //     data,
  //   })
  // },
  // inviteWithdraw: async (data: { openid: string }) => {
  //   return await makeRequest({
  //     method: 'post',
  //     url: '/user/invite/withdraw',
  //     data,
  //   })
  // },
}

export const inviteAPI = {
  index: async (data: { openid: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/invite/index',
      data,
    })
  },
  detail: async (data: { openid: string; cate: string; page: number }) => {
    return await makeRequest<InviteUsers, 'list'>({
      method: 'post',
      url: '/invite/detail',
      data,
    })
  },
  withdraw: async (data: { openid: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/invite/withdraw',
      data,
    })
  },
}

interface InviteUsers {
  id: number
  lavel: number
  openid: string
  parent: string
  created_at: string
}
