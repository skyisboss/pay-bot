import { AnyObjetc, BotContext } from '@/@types/types'
import { BalanceInfo, walletAPI } from '@/api/wallet'
import { logger } from '@/logger'
import {
  EthToWei,
  BotLinkCode,
  SessionVersion,
  WeiToEth,
  apiError,
  checkScene,
  clearLastMessage,
  deleteMessage,
  display,
  getTokenList,
  pager,
  restSceneInfo,
  showServerStop,
  stopService,
  getChainSymbol,
  formatAmount,
} from '@/util/helper'
import { Composer, Filter, FilterQuery, InlineKeyboard } from 'grammy'
import { format } from 'date-fns'
import { userAPI } from '@/api/user'
import { PinCodeView, SettingView } from '../setting'

export const WalletView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    // 如果未设置安全密码，需要先设置
    if (!ctx.session?.userinfo?.pin_code) {
      ctx.answerCallbackQuery({
        text: ctx.t('pinpwdSetAlert'),
        show_alert: true,
      })
      ctx.session.request.views = ['setting', 'pinpwd']
      return await PinCodeView(ctx)
    }

    restSceneInfo(ctx)
    const btn = new InlineKeyboard()

    btn.text(ctx.t('deposit'), '/wallet/deposit')
    btn.text(ctx.t('withdraw'), '/wallet/withdraw').row()
    btn.text(ctx.t('transfer'), '/wallet/transfer')
    btn.text(ctx.t('hongbao'), '/wallet/hongbao').row()
    btn.text(ctx.t('exchangeRate'), '/wallet/rate')
    btn.text(ctx.t('history'), '/wallet/history').row()
    btn.text(ctx.t('goBack'), '/start?rep=1')

    // 获取钱包信息
    const api = await walletAPI.index({ openid: ctx.session.userinfo.openid })
    if (apiError(ctx, api)) {
      return
    }

    const userinfo = ctx.session.userinfo
    const currencyRows = ctx.session.config?.currency ?? []
    const currency = currencyRows.find(x => x.code == userinfo.currency)

    const msg = ctx.t('walletHomeMsg', {
      uid: ctx.from!.id.toString(),
      trc20: api?.data?.trc20?.str ?? 0,
      bep20: api?.data?.bep20?.str ?? 0,
      erc20: api?.data?.erc20?.str ?? 0,
      fait_currency: (currency?.code ?? '').toUpperCase(),
      fait_symbol: currency?.symbol ?? '',
      fait_balance: api?.data?.fait?.str ?? '',
    })

    await display(ctx, msg, btn.inline_keyboard, true)
  } else {
    if ('rate' === request.views?.[1]) {
      const api = await walletAPI.getRate()
      if (apiError(ctx, api)) {
        return
      }

      const msg = ctx.t('showRate', {
        usd_cny: api.data?.cny ?? '',
        usd_php: api.data?.php ?? '',
        usd_trc20: api.data?.trc20 ?? '',
        usd_erc20: api.data?.erc20 ?? '',
        usd_bep20: api.data?.bep20 ?? '',
        updated: format(api.data?.updated_at ?? 0, 'MM/dd HH:ii'),
      })

      return await ctx.answerCallbackQuery({
        text: msg,
        show_alert: true,
      })
    }
    await views?.[request.views?.[1]]?.(ctx)
  }
}

export const coinSymbols = ['TRC20 · USDT', 'BEP20 · USDT', 'ERC20 · USDT']
// export const coinChain = ['tron', 'bsc', 'eth']

/**充值 */
export const DepositView = async (ctx: BotContext) => {
  const request = ctx.session.request

  const actions: AnyObjetc = {
    // 充值首页
    index: async () => {
      const btn = new InlineKeyboard()
      getTokenList(ctx).map(x => {
        btn.text(`${x.text}`, `/wallet/deposit?goto=show&token=${x.token}`).row()
      })
      btn.text(ctx.t('goBack'), '/wallet?rep=1')

      await display(ctx, ctx.t('depositCurrency'), btn.inline_keyboard, true)
    },

    // 选择币种
    show: async () => {
      const qrcode = request.params?.qrcode ?? ''
      const token = request.params?.token ?? ''
      const version = SessionVersion(ctx)
      const api = await walletAPI.depositInfo({ openid: ctx.session.userinfo!.openid, token: token })
      if (apiError(ctx, api)) {
        return
      }

      const btn = new InlineKeyboard()
      if (Number(qrcode)) {
        btn.text(ctx.t('hideQrCode'), `/wallet/deposit?goto=show&token=${token}&qrcode=0&v=${version}`).row()
      } else {
        btn.text(ctx.t('showQrCode'), `/wallet/deposit?goto=show&token=${token}&qrcode=1&v=${version}`).row()
      }
      btn.text(ctx.t('goBack'), '/wallet/deposit?rep=1')

      const msg = ctx.t('depositAddress', {
        address: api?.data?.address ?? '',
        token: token ?? '',
        min_amount: api?.data?.min_amount ?? '',
        qrcode: api?.data?.qrcode ?? '',
        show: Number(qrcode) ? 1 : 0,
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

/**转账 */
export const TransferView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const invalidInput = async (ctx: BotContext, msg: string) => {
    restSceneInfo(ctx)
    const btn = new InlineKeyboard()
    btn.text(ctx.t('goBack'), '/wallet/transfer?goto=index')

    await clearLastMessage(ctx)

    return await display(ctx, msg, btn.inline_keyboard)
  }
  const actions: AnyObjetc = {
    // 选择币种
    index: async () => {
      const btn = new InlineKeyboard()
      getTokenList(ctx).map(x => {
        btn.text(`${x.text}`, `/wallet/transfer?goto=amount&token=${x.token}`).row()
      })
      btn.text(ctx.t('cancel'), '/wallet?rep=1')

      ctx.session.onMessage = undefined
      ctx.session.scene = {
        name: 'WithdrawView',
        router: '',
        createAt: Date.now(),
        store: new Map(),
        params: {
          chain: '',
          payee: '',
          amount: '',
          payee_info: {},
        },
      }
      const msg = ctx.t('transferActionMsg', {
        step: 0,
        token: '',
        touser: '',
        amount: '',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },

    // 输入金额
    amount: async () => {
      const token = request.params?.token ?? ''
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/wallet/transfer?rep=1')
      const msg = ctx.t('transferActionMsg', {
        step: 1,
        token: token,
        touser: '',
        amount: '',
      })
      // 初始化场景
      ctx.session.onMessage = {
        name: 'input-amount',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()
          const amount = Number(message)
          if (Number.isNaN(amount) || amount <= 0) {
            return await invalidInput(ctx, ctx.t('invalidAmount'))
          }
          // 查询余额
          const api = await walletAPI.balanceOf({ openid: ctx.session.userinfo!.openid, account: 'wallet' })
          if (apiError(ctx, api, true)) {
            return await invalidInput(ctx, ctx.t('invalidPayee'))
          }
          // const token = ctx.session.scene.params?.token ?? ''
          const balance = Number(api.data?.[token as keyof BalanceInfo] ?? 0)
          const amountRaw = EthToWei(amount, 6)
          if (balance < amountRaw) {
            return await invalidInput(ctx, ctx.t('transferBalanceFail', { symbol: token }))
          }

          // 跳转操作方法
          ctx.session.onMessage = undefined
          ctx.session.scene.params = {}
          ctx.session.scene.params['token'] = token
          ctx.session.scene.params['amount'] = message
          ctx.session.request.goto = 'touser'
          await clearLastMessage(ctx)
          await TransferView(ctx)
        },
      }

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    // 输入收款人
    touser: async () => {
      // 选择的币种
      // ctx.session.scene.params.chain = request.params?.chain ?? ''
      // ctx.session.scene.router = '/wallet/transfer?goto=getInput&inputType=payee'
      const amount = ctx.session.scene.params?.amount ?? 0
      const token = ctx.session.scene.params?.token ?? ''
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/start?rep=1')
      const msg = ctx.t('transferActionMsg', {
        step: 2,
        token: token,
        amount: amount,
        touser: '',
      })
      ctx.session.onMessage = {
        name: 'input-touser',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()
          if (!/^\d+$/.test(message)) {
            return await invalidInput(ctx, ctx.t('invalidPayee'))
          }

          // 判断收款人是否存在
          const api = await userAPI.checkUser({ openid: message })
          if (apiError(ctx, api, true)) {
            return await invalidInput(ctx, ctx.t('invalidPayee'))
          }

          // 跳转操作方法
          ctx.session.onMessage = undefined
          ctx.session.scene.params['touser'] = message
          ctx.session.request.goto = 'review'
          await clearLastMessage(ctx)
          await TransferView(ctx)

          // ctx.session.scene.params.payee = message
          // ctx.session.scene.params.payee_info = api?.data ?? {}

          // // 删除用户回复的信息
          // deleteMessage(ctx, ctx.message!.chat.id, ctx.message!.message_id)
          // // 删除前一条信息，避免信息太多
          // const { chatId, msgId } = ctx.session.lastMessage
          // if (chatId && msgId) {
          //   deleteMessage(ctx, chatId, msgId)
          // }

          // // return await actions.review()
          // ctx.session.request.goto = 'review'
          // await TransferView(ctx)
        },
      }

      await display(ctx, msg, btn.inline_keyboard)
    },
    review: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('confirm'), '/wallet/transfer?goto=done')
      btn.text(ctx.t('cancel'), '/wallet/transfer?rep=1')

      const { token, amount, touser } = ctx.session.scene.params
      const msg = ctx.t('transferActionMsg', {
        step: 3,
        token: token ?? '',
        touser: touser ?? '',
        amount: amount ?? '',
      })

      await display(ctx, msg, btn.inline_keyboard)
    },
    done: async () => {
      const btn = new InlineKeyboard()
      await ctx.editMessageText('💸')

      const { token, amount, touser } = ctx.session.scene.params
      const api = await walletAPI.transfer({
        openid: ctx.session.userinfo!.openid,
        amount: amount,
        token: token,
        touser: touser,
      })
      if (apiError(ctx, api, true)) {
        await ctx.editMessageText(api?.msg || ctx.t('httpError'))
        btn.text(ctx.t('goback'), '/wallet')
        return
      }

      btn.text(ctx.t('goback'), '/wallet')
      const msg = ctx.t('transferActionMsg', {
        step: 4,
        token: token ?? '',
        touser: touser ?? '',
        amount: amount ?? '',
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

/**提现 */
export const WithdrawView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const invalidInput = async (ctx: BotContext, msg: string) => {
    restSceneInfo(ctx)
    const btn = new InlineKeyboard()
    btn.text(ctx.t('goBack'), '/wallet/withdraw?goto=index')

    await clearLastMessage(ctx)

    return await display(ctx, msg, btn.inline_keyboard)
  }
  const actions: AnyObjetc = {
    index: async () => {
      restSceneInfo(ctx)
      ctx.session.onMessage = undefined
      const btn = new InlineKeyboard()
      getTokenList(ctx).map(x => {
        btn.text(`${x.text}`, `/wallet/withdraw?goto=address&token=${x.token}`).row()
      })
      btn.text(ctx.t('goBack'), '/wallet?rep=1')
      const msg = ctx.t('withdrawActionMsg', {
        step: 0,
        chain: '',
        balance: '',
        address: '',
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
    address: async () => {
      const token = request.params?.token ?? ''
      const api = await walletAPI.balanceOf({ openid: ctx.session.userinfo!.openid, account: 'wallet' })
      if (apiError(ctx, api)) {
        return
      }
      const balance = Number(api.data?.[token as keyof BalanceInfo] ?? 0)
      if (balance <= 0) {
        return await ctx.answerCallbackQuery({
          text: ctx.t('withdrawBalanceFail'),
          show_alert: true,
        })
      }
      ctx.session.scene.params = {}
      ctx.session.scene.params['balance'] = WeiToEth(balance, 6).toString()
      ctx.session.scene.params['token'] = token
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/wallet?rep=1')

      const msg = ctx.t('withdrawActionMsg', {
        step: 1,
        chain: token,
        balance: '',
        address: '',
      })
      await display(ctx, msg, btn.inline_keyboard, true)
      ctx.session.onMessage = {
        name: 'input-address',
        time: Date.now(),
        call: async ctx => {
          const token = ctx.session.scene.params?.token
          const message = (ctx.message?.text ?? '').trim()
          const addressRegx = [
            {
              token: ['eth', 'erc20', 'bnb', 'bep20'],
              regx: /^0x[0-9a-fA-F]{40}$/,
            },
            {
              token: ['trx', 'trc20'],
              regx: /^T[a-zA-HJ-NP-Z0-9]{33}$/,
            },
          ]
          const regx = addressRegx.find(x => x.token.includes(token))
          if (!regx?.regx.test(message)) {
            return await invalidInput(ctx, '无效地址')
          }

          // 跳转操作方法
          ctx.session.scene.params['address'] = message
          ctx.session.request.goto = 'review'
          ctx.session.onMessage = undefined
          await clearLastMessage(ctx)
          await WithdrawView(ctx)
        },
      }
    },
    review: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('confirm'), '/wallet/withdraw?goto=done')
      btn.text(ctx.t('cancel'), '/wallet?rep=1')

      const { token, balance, address } = ctx.session.scene.params
      const msg = ctx.t('withdrawActionMsg', {
        step: 2,
        chain: token ?? '',
        balance: balance ?? '',
        address: address ?? '',
      })

      await display(ctx, msg, btn.inline_keyboard)
    },
    done: async () => {
      const { token, balance, address } = ctx.session.scene.params
      await ctx.editMessageText(ctx.t('loading'))
      const api = await walletAPI.withdraw({
        openid: ctx.session.userinfo!.openid,
        token,
        address,
        amount: balance,
      })
      if (apiError(ctx, api)) {
        return
      }

      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/wallet?rep=1')

      restSceneInfo(ctx)
      const msg = ctx.t('withdrawActionMsg', {
        step: 3,
        chain: token ?? '',
        balance: balance ?? '',
        address: address ?? '',
      })
      const span = '' //`\r\n<span class="tg-spoiler">防伪码: 52033</span>`

      await display(ctx, msg + span, btn.inline_keyboard, true)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

/**历史记录 */
export const HistoryView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const btnItems = [
    ctx.t('depositHistory'),
    ctx.t('transferHistory'),
    ctx.t('withdrawHistory'),
    ctx.t('hongbaoHistory'),
  ]
  const hbType = [ctx.t('hongbao1'), ctx.t('hongbao2'), ctx.t('hongbao3')]

  const actions: AnyObjetc = {
    index: async () => {
      const btn = new InlineKeyboard()
      btnItems.map((item, index) => {
        if (index % 2 == 0) {
          btn.text(item, `/wallet/history?goto=view&view=${index}`)
        } else {
          btn.text(item, `/wallet/history?goto=view&view=${index}`).row()
        }
      })

      btn.text(ctx.t('goBack'), '/wallet?rep=1')
      await display(ctx, ctx.t('historyMsg'), btn.inline_keyboard, true)
    },
    view: async () => {
      const view = Number(request.params?.view ?? '')
      const page = request.params?.page || 1
      const api = await walletAPI.historyList({ view, page, openid: ctx.session.userinfo!.openid })
      if (apiError(ctx, api)) {
        return
      }

      const btn = new InlineKeyboard()
      api?.data?.rows?.map(x => {
        let showText = ''
        const d = new Date(x.created_at)
        // 红包
        showText = `${getChainSymbol(ctx, x.token)} · ${formatAmount(x.amount)}`
        if (3 === view) {
          showText = `${hbType[x.type]} · ${showText}`
        }
        btn.text(showText, `/wallet/history?goto=detail&view=${view}&id=${x.id}`).row()
      })
      const totalItem = api?.data?.total ?? 0
      const pageSize = api?.data?.size ?? 5
      const totalPage = Math.ceil(totalItem / pageSize)
      pager(ctx, btn, totalPage, page, `/wallet/history?goto=view&view=${view}`)
      btn.text(ctx.t('goBack'), '/wallet/history')

      const pageInfo = ctx.t('pageInfo', {
        currPage: page,
        totalPage: totalPage,
      })

      const counts = (api?.data as any)?.counts ?? {}
      const msg = ctx.t('historyListMsg', {
        item: view,
        count1: counts?.count1 ?? '',
        count2: counts?.count2 ?? '',
        count3: counts?.count3 ?? '',
        pageInfo,
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    detail: async () => {
      const view = Number(request.params?.view ?? '')
      const id = Number(request.params?.id)
      const apiRes = await walletAPI.historyDetail({ view, id, openid: ctx.session.userinfo!.openid })
      if (apiError(ctx, apiRes)) {
        return
      }

      const time = format(new Date(apiRes?.data?.created_at), 'yy/MM/dd HH:ii')

      let msg = ''
      let status = 0
      switch (view) {
        case 3:
          {
            let status = ''
            if (apiRes?.data?.available_claim === 0) {
              status = ctx.t('hongbaoClaimStatus1')
            } else {
              status = ctx.t('hongbaoClaimStatus0')
            }
            if (apiRes?.data?.type === 2) {
              status = `${ctx.t('hongbaoClaimStatus1')}(${apiRes?.data?.available_claim}/${
                apiRes?.data?.available_balance?.length
              })`
            }

            msg = ctx.t('hongbaoHistoryDetail', {
              name: hbType[apiRes?.data?.type ?? 0],
              time: time,
              amount: formatAmount(apiRes?.data?.amount),
              token: apiRes?.data?.token,
              status: status,
            })
          }
          break
        default:
          const statusText = [ctx.t('statusFail'), ctx.t('statusSuccess')]
          msg = ctx.t('depositHistoryDetail', {
            item: view || 0,
            time: time,
            amount: formatAmount(apiRes?.data?.amount),
            token: apiRes?.data?.token,
            status: statusText[status],
          })
          break
      }
      await ctx.answerCallbackQuery({
        show_alert: true,
        text: msg,
      })
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

/**发红包 */
export const HongbaoView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const typeList = [ctx.t('hongbao1'), ctx.t('hongbao2'), ctx.t('hongbao3')]
  const amountList = [5, 10, 20, 50, 100, 200]
  const invalidInput = async (ctx: BotContext, msg: string) => {
    restSceneInfo(ctx)
    const btn = new InlineKeyboard()
    btn.text(ctx.t('goBack'), '/wallet/hongbao?goto=index')

    await clearLastMessage(ctx)

    return await display(ctx, msg, btn.inline_keyboard)
  }

  const actions: AnyObjetc = {
    index: async () => {
      restSceneInfo(ctx)
      ctx.session.onMessage = undefined

      const btn = new InlineKeyboard()
      typeList.map((item, index) => {
        btn.text(item, `/wallet/hongbao?goto=chain&type=${index}`).row()
      })
      btn.text(ctx.t('cancel'), '/wallet?rep=1')
      const msg = ctx.t('hongbaoMsg', {
        step: 0,
        type: '',
        chain: '',
        amount: '',
        name: '',
        user: '',
        split: '',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    // 选择币种
    chain: async () => {
      const type = request.params?.type ?? ''

      const btn = new InlineKeyboard()
      getTokenList(ctx).map(x => {
        btn.text(`${x.text}`, `/wallet/hongbao?goto=amount&type=${type}&token=${x.token}`).row()
      })
      btn.text(ctx.t('cancel'), '/wallet?rep=1')
      const msg = ctx.t('hongbaoMsg', {
        step: 1,
        type: Number(type),
        name: typeList[type],
        chain: '',
        amount: '',
        user: '',
        split: '',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    // 选择金额
    amount: async () => {
      const type = request.params?.type ?? ''
      const token = request.params?.token ?? ''
      ctx.session.onMessage = undefined
      ctx.session.scene.params = {}
      ctx.session.scene.params['type'] = type
      ctx.session.scene.params['token'] = token
      // 判断用户是否有余额
      const api = await walletAPI.balanceOf({ openid: ctx.session.userinfo!.openid, account: 'wallet' })
      if (apiError(ctx, api)) {
        return
      }
      const balance = Number(api.data?.[token as keyof BalanceInfo] ?? 0)
      if (balance <= 0) {
        await ctx.answerCallbackQuery({
          text: ctx.t('hongbaoBalanceFail'),
          show_alert: true,
        })
        return
        // return await invalidInput(ctx, ctx.t('hongbaoBalanceFail'))
      }
      const balanceEth = WeiToEth(balance, 6)
      ctx.session.scene.params['balanceRaw'] = balance
      ctx.session.scene.params['balanceEth'] = balanceEth

      const btn = new InlineKeyboard()
      amountList.map((amount, index) => {
        let to = 'review'
        if (Number(type) === 1) to = 'user'
        if (Number(type) === 2) to = 'split'
        const router = `/wallet/hongbao?goto=${to}&type=${type}&token=${token}&amount=${amount}&rep=1`
        if (index % 3 == 2) {
          btn.text(`🧧 ${amount}`, router).row()
        } else {
          btn.text(`🧧 ${amount}`, router)
        }
      })
      btn.text(ctx.t('hongbaoOtherAmount'), `/wallet/hongbao?goto=input&type=${type}&token=${token}`)
      btn.text(ctx.t('cancel'), '/wallet/hongbao?rep=1')

      const msg = ctx.t('hongbaoMsg', {
        step: 2,
        type: Number(type),
        name: typeList[type],
        chain: token,
        amount: '',
        user: '',
        split: '',
        balance: balanceEth,
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
    // 输入金额
    input: async () => {
      const { token, type, balanceEth, user, split } = ctx.session.scene.params
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), `/wallet/hongbao?goto=amount&type=${type}&token=${token}`)
      const msg = ctx.t('hongbaoMsg', {
        step: 3,
        type: Number(type),
        name: typeList[type],
        chain: token ?? '',
        amount: '',
        user: '',
        split: '',
        balance: balanceEth ?? '',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
      ctx.session.onMessage = {
        name: 'input-amount',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()
          const amount = parseFloat(message)
          if (Number.isNaN(amount) || amount <= 0) {
            return await invalidInput(ctx, ctx.t('invalidAmount'))
          }

          // 跳转操作方法
          ctx.session.onMessage = undefined
          ctx.session.scene.params['amount'] = message
          ctx.session.request.params['rep'] = '0'
          if (Number(type) === 0) {
            ctx.session.request.goto = 'review'
          }
          if (Number(type) === 1) {
            ctx.session.request.goto = 'user'
          }
          if (Number(type) === 2) {
            ctx.session.request.goto = 'split'
          }

          await clearLastMessage(ctx)
          await HongbaoView(ctx)
        },
      }
    },
    // 专属红包
    user: async () => {
      const { token, type, balanceEth, user, split, amount } = ctx.session.scene.params

      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/wallet?rep=1')
      const msg = ctx.t('hongbaoMsg', {
        step: 4,
        type: Number(type),
        name: typeList[type],
        chain: token,
        amount: amount ?? ctx.session.request.params?.amount ?? '',
        user: '',
        split: '',
      })

      const isRep = Number(ctx.session.request.params?.rep ?? '') === 1
      await display(ctx, msg, btn.inline_keyboard, isRep)
      ctx.session.onMessage = {
        name: 'input-user',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()
          if (!/^\d+$/.test(message)) {
            return await invalidInput(ctx, ctx.t('hongbaoInputFail'))
          }

          if (message === ctx.session.userinfo?.openid) {
            return await invalidInput(ctx, ctx.t('hongbaoUserSelfFail'))
          }

          // 判断用户是否存在
          const api = await userAPI.checkUser({ openid: message })
          if (apiError(ctx, api, true)) {
            return await invalidInput(ctx, ctx.t('hongbaoUserFail'))
          }

          // 跳转操作方法
          ctx.session.onMessage = undefined
          ctx.session.scene.params['user'] = message
          ctx.session.request.goto = 'review'
          ctx.session.request.params['rep'] = '0'
          await clearLastMessage(ctx)
          return await HongbaoView(ctx)
        },
      }
    },
    // 拆分红包
    split: async () => {
      const { token, type, balanceEth, user, split, amount } = ctx.session.scene.params
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/wallet?rep=1')
      const msg = ctx.t('hongbaoMsg', {
        step: 5,
        type: Number(type),
        name: typeList[type],
        chain: token,
        amount: amount ?? ctx.session.request.params?.amount ?? '',
        user: '',
        split: '',
      })

      const isRep = Number(ctx.session.request.params?.rep ?? '') === 1
      await display(ctx, msg, btn.inline_keyboard, isRep)
      ctx.session.onMessage = {
        name: 'input-split',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()
          const split = Number(message)
          if (Number.isNaN(split) || split <= 0 || split > 100) {
            return await invalidInput(ctx, ctx.t('hongbaoInputFail'))
          }

          // 跳转操作方法
          ctx.session.onMessage = undefined
          ctx.session.scene.params['split'] = message
          ctx.session.request.goto = 'review'
          ctx.session.request.params['rep'] = '0'
          await clearLastMessage(ctx)
          return await HongbaoView(ctx)
        },
      }
    },
    review: async () => {
      const { token, type, balanceEth, user, split, amount } = ctx.session.scene.params
      const getAmount = amount ?? ctx.session.request.params?.amount ?? ''

      const btn = new InlineKeyboard()
      let msg = ''
      if (Number(getAmount) > Number(balanceEth)) {
        btn.text(ctx.t('goBack'), '/wallet/hongbao?rep=1')
        msg = ctx.t('hongbaoBalanceFail')
      } else {
        btn.text(ctx.t('confirm'), `/wallet/hongbao?goto=done&type=${type}&token=${token}&amount=${getAmount}`)
        btn.text(ctx.t('cancel'), '/wallet/hongbao?rep=1')
        msg = ctx.t('hongbaoMsg', {
          step: 6,
          type: Number(type),
          name: typeList[type],
          chain: token,
          amount: getAmount,
          user: user ?? '',
          split: split ?? '',
        })
      }
      const isRep = Number(ctx.session.request.params?.rep ?? '') === 1
      await display(ctx, msg, btn.inline_keyboard, isRep)
    },
    done: async () => {
      await ctx.editMessageText(ctx.t('loading'))
      const { token, type, balanceEth, user, split, amount } = ctx.session.scene.params
      const api = await walletAPI.fahongbao({
        openid: ctx.session.userinfo!.openid,
        token,
        type: String(type),
        amount: String(amount ?? ctx.session.request.params?.amount ?? ''),
        touser: user ?? ctx.session.request.params?.user,
        split: split ?? ctx.session.request.params?.split,
      })

      let msg = ''
      if (apiError(ctx, api, true)) {
        msg = api?.msg || ctx.t('httpError')
      } else {
        msg = ctx.t('hongbaoMsg', {
          step: 7,
          type: Number(type),
          name: typeList[type],
          chain: token,
          amount: amount ?? ctx.session.request.params?.amount ?? '',
          user: user ?? '',
          split: split ?? '',
          link: BotLinkCode(ctx, api?.data?.link),
        })
      }
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/wallet?rep=1')
      await display(ctx, msg, btn.inline_keyboard, true)
    },
    claim: async () => {
      const link = request.params?.link ?? ''
      const claim = request.params?.claim ?? ''
      const btn = new InlineKeyboard()

      if (claim) {
        const api = await walletAPI.claim({ openid: ctx.session.userinfo!.openid, link: link })
        if (apiError(ctx, api, true)) {
          btn.text(ctx.t('goBack'), '/start?rep=1')
          await display(ctx, api?.msg ?? ctx.t('httpError'), btn.inline_keyboard, true)
          return
        }

        btn.text(ctx.t('wallet'), '/wallet?rep=1')
        const type = Number(api?.data?.type ?? 0)
        const msg = ctx.t('hongbaoClaimMsg', {
          step: 1,
          type: type,
          name: typeList[type],
          token: api.data?.token ?? '',
          amount: api.data?.amount ?? '',
          user: api.data?.touser ?? '',
          split: api.data?.split ?? '',
        })
        await clearLastMessage(ctx)
        await display(ctx, msg, btn.inline_keyboard)
      } else {
        const api = await walletAPI.hongbaoInfo({ openid: ctx.session.userinfo!.openid, link: link })
        if (apiError(ctx, api, true)) {
          btn.text(ctx.t('goBack'), '/start?rep=1')
          await display(ctx, api?.msg ?? ctx.t('httpError'), btn.inline_keyboard, true)
          return
        }

        const type = Number(api?.data?.type ?? 0)
        const msg = ctx.t('hongbaoClaimMsg', {
          step: 0,
          type: type,
          name: typeList[type],
          token: api.data?.token ?? '',
          amount: api.data?.amount ?? '',
          user: api.data?.touser ?? '',
          split: api.data?.split ?? '',
        })
        btn.text(ctx.t('hongbaoClaim'), `/wallet/hongbao?goto=claim&link=${link}&claim=1`).row()
        btn.text(ctx.t('logo') + ' ' + ctx.t('brand'), '/start?rep=1')

        await clearLastMessage(ctx)
        await display(ctx, msg, btn.inline_keyboard)
      }
    },
  }
  // 执行方法
  await actions?.[request.goto]?.()
}

const views: AnyObjetc = {
  deposit: DepositView,
  transfer: TransferView,
  withdraw: WithdrawView,
  history: HistoryView,
  hongbao: HongbaoView,
}
