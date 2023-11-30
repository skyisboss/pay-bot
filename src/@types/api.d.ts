declare namespace ApiResult {
  interface Userinfo {
    id: number
    vip: number
    lang: string
    first_name: string
    /**是否已设置安全密码 */
    pincode: boolean
    /**法币单位 */
    fait_symbol: string
    currency: string
  }

  interface WalletIndex {
    trc20: number
    erc20: number
    bep20: number
    rate: number
    symbol: string
  }

  interface Config {
    lang: {
      code: string
      lang: string
    }[]
    blockchain: {
      chain: string
      token: string
      symbol: string
    }[]
    currency: {
      code: string
      symbol: string
    }[]
    hongbao: string[]
    updated_at: number
  }
}
