import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const inviteAPI = {
  detail: async (data: { uid: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/invite/detail',
      data,
    })
  },
  withdraw: async (data: { uid: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/invite/withdraw',
      data,
    })
  },
}
