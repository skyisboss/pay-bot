declare namespace ApiResult {
  interface Userinfo {
    id: number
    rank: number
    openid: string
    language: string
    nickname: string
    /**是否已设置安全密码 */
    pin_code: string
    /**法币单位 */
    fait_symbol: string
    currency: string
    invite_code: string
    merchant: number
    vending: number
    version: number
    created: string
    backup_account: string
  }

  interface WalletInfo {
    [k: string]: {
      raw: number
      str: string
    }
  }

  interface Config {
    bot_link: string
    language: {
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
