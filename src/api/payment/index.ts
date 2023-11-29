import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const paymentAPI = {
  index: async (data: { uid: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/payment/index',
      data,
    })
  },
}
