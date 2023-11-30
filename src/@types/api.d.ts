declare namespace ApiResult {
  interface Userinfo {
    id: number
    vip: number
    lang: string
    first_name: string
    /**是否已设置安全密码 */
    safe_pwd: boolean
    /**法币单位 */
    fait_symbol: string
  }

  interface WalletIndex {
    trc20: number
    erc20: number
    bep20: number
    rate: number
    symbol: string
  }
}
