declare namespace ApiResult {
  interface Userinfo {
    id: number
    vip: number
    lang: string
    first_name: string
  }

  interface WalletIndex {
    trc20: number
    erc20: number
    bep20: number
    rate: number
    symbol: string
  }
}
