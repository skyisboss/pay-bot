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
  create: async (data: { uid: number; coin: string; deposit: string; amount: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/secured/create',
      data,
    })
  },
  detail: async (data: { uid: number; id: number }) => {
    return await makeRequest<SecuredItem>({
      method: 'post',
      url: '/secured/detail',
      data,
    })
  },
}

interface SecuredItem {
  id: number
  chain: string
  amount: number
  status: number
  deposit: number
  percent: number
  owner: string
  partner: string
  link: string
  content: string
}
