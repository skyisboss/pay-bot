import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const securedAPI = {
  index: async (data: { openid: string; cate: number; page: number }) => {
    return await makeRequest<SecuredItem, 'list'>({
      method: 'post',
      url: '/contract/index',
      data,
    })
  },
  create: async (data: { openid: string; token: string; deposit: string; amount: string; percent: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/contract/create',
      data,
    })
  },
  // edit: async (data: { openid: string; post?: AnyObjetc }) => {
  //   return await makeRequest({
  //     method: 'post',
  //     url: '/contract/edit',
  //     data,
  //   })
  // },
  edit: async (data: { openid: string; id: number; action: EditAction; info?: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/contract/edit',
      data,
    })
  },
  detail: async (data: { openid: string; id: number }) => {
    return await makeRequest<SecuredItem>({
      method: 'post',
      url: '/contract/detail',
      data,
    })
  },
}

type EditAction =
  | 'content'
  | 'join'
  | 'close'
  | 'delivery'
  | 'delivery2'
  | 'receive'
  | 'receive2'
  | 'payment'
  | 'payment2'
interface SecuredItem {
  id: number
  token: string
  amount: number
  status: number
  deposit: number
  percent: number
  owner: string
  partner: string
  link: string
  content: string
}
