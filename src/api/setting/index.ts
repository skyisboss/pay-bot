import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const settingAPI = {
  backup: async (data: { uid: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/setting/backup',
      data,
    })
  },
  pinpwd: async (data: { uid: number }) => {
    return await makeRequest({
      method: 'post',
      url: '/setting/pinpwd',
      data,
    })
  },
}
