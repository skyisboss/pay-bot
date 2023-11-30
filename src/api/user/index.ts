import { makeRequest } from '@/http'

export const userAPI = {
  userinfo: async (data: { fromId: number }) => {
    return await makeRequest<ApiResult.Userinfo>({
      method: 'post',
      url: '/userinfo',
      data,
    })
  },
  getUserinfo: async (data: { uid: string }) => {
    return await makeRequest<ApiResult.Userinfo>({
      method: 'post',
      url: '/userinfo',
      data,
    })
  },
  getConfig: async (data?: {}) => {
    return await makeRequest<ApiResult.Config>({
      method: 'post',
      url: '/config',
      data,
    })
  },
}
