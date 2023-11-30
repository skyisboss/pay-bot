import { AnyObjetc } from '@/@types/types'
import { makeRequest } from '@/http'

export const settingAPI = {
  backup: async (data: { uid: number }) => {
    return await makeRequest<Backup>({
      method: 'post',
      url: '/setting/backup',
      data,
    })
  },
  /**转移资产 */
  assets: async (data: { uid: number; main_id: number }) => {
    return await makeRequest<Backup>({
      method: 'post',
      url: '/setting/backup/assets',
      data,
    })
  },
  lang: async (data: { uid: number; code: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/setting/lang',
      data,
    })
  },
  currency: async (data: { uid: number; code: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/setting/currency',
      data,
    })
  },
  pincode: async (data: { uid: number; pwd: string; old?: string }) => {
    return await makeRequest({
      method: 'post',
      url: '/setting/pincode',
      data,
    })
  },
}

interface Backup {
  account: {
    id: number
    username: number
    // 是否子账号，子账号有权限转移资产
    sub_account: boolean
  }
}
