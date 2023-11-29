import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const securedAPI = {
  index: async (data: { uid: number }) => {
    return await makeRequest<SecuredItem, 'list'>({
      method: 'post',
      url: '/secured/index',
      data,
    })
  },
  detail: async (data: { uid: number; id: number }) => {
    return await makeRequest<SecuredItem, 'list'>({
      method: 'post',
      url: '/secured/detail',
      data,
    })
  },
}

interface SecuredItem {
  id: number
  chain: number
  amount: number
  status: number
}
