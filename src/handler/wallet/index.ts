import { AnyObjetc, BotContext } from '@/@types/types'
import { walletAPI } from '@/api/wallet'
import { logger } from '@/logger'
import {
  apiError,
  checkScene,
  clearLastMessage,
  deleteMessage,
  display,
  pager,
  restSceneInfo,
  showServerStop,
  stopService,
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
export const coinChain = ['tron', 'bsc', 'eth']

/**充值 */
export const DepositView = async (ctx: BotContext) => {
  const request = ctx.session.request

  const actions: AnyObjetc = {
    // 充值首页
    index: async () => {
      const btn = new InlineKeyboard()
      coinSymbols.map((item, index) => {
        btn.text(`${item}`, `/wallet/deposit?goto=done&coin=${index}`).row()
      })
      btn.text(ctx.t('goBack'), '/wallet?rep=1')

      await display(ctx, ctx.t('depositCurrency'), btn.inline_keyboard, true)
    },

    // 选择币种
    done: async () => {
      const coin = Number(request.params?.coin ?? 0)
      const qrCode = Number(request.params?.qrCode ?? 0)
      const symbol = coinSymbols?.[coin]
      const chain = coinChain[coin]
      const show = qrCode === 1
      const api = await walletAPI.depositInfo({ uid: ctx.session.userinfo!.id, token: chain })
      if (apiError(ctx, api)) {
        return
      }

      const btn = new InlineKeyboard()
      if (show) {
        btn.text(ctx.t('hideQrCode'), `/wallet/deposit?goto=done&coin=${coin}&qrCode=0`).row()
      } else {
        btn.text(ctx.t('showQrCode'), `/wallet/deposit?goto=done&coin=${coin}&qrCode=1`).row()
      }
      btn.text(ctx.t('goBack'), '/wallet/deposit?rep=1')

      const msg = ctx.t('depositAddress', {
        address: api?.data?.address ?? '',
        token: symbol,
        min_amount: api?.data?.min_amount ?? '',
        qrcode: api?.data?.qrcode ?? '',
        show: show ? 1 : 0,
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
      coinSymbols.map((item, index) => {
        btn.text(`${item}`, `/wallet/transfer?goto=amount&chain=${index}`).row()
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
        chain: '',
        payee: '',
        amount: '',
        payee_name: '',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    // 输入收款人
    payee: async () => {
      // 选择的币种
      ctx.session.scene.params.chain = request.params?.chain ?? ''
      ctx.session.scene.router = '/wallet/transfer?goto=getInput&inputType=payee'
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/start?rep=1')
      const msg = ctx.t('transferActionMsg', {
        step: 2,
        chain: coinSymbols?.[request.params?.chain],
        payee: '',
        amount: ctx.session.scene.params?.amount ?? '',
        payee_name: '',
      })
      ctx.session.onMessage = {
        name: 'payee',
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

          ctx.session.scene.params.payee = message
          ctx.session.scene.params.payee_info = api?.data ?? {}

          // 删除用户回复的信息
          deleteMessage(ctx, ctx.message!.chat.id, ctx.message!.message_id)
          // 删除前一条信息，避免信息太多
          const { chatId, msgId } = ctx.session.lastMessage
          if (chatId && msgId) {
            deleteMessage(ctx, chatId, msgId)
          }

          // return await actions.review()
          ctx.session.request.goto = 'review'
          await TransferView(ctx)
        },
      }

      await display(ctx, msg, btn.inline_keyboard)
    },
    // 输入金额
    amount: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/wallet/transfer?rep=1')
      const msg = ctx.t('transferActionMsg', {
        step: 1,
        chain: coinSymbols?.[request.params?.chain],
        payee: '',
        amount: '',
        payee_name: '',
      })
      // 初始化场景
      ctx.session.onMessage = {
        name: 'amount',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()
          const amount = parseFloat(message)
          if (Number.isNaN(amount) || amount <= 0) {
            return await invalidInput(ctx, ctx.t('invalidAmount'))
          }
          // 查询余额
          const chain = Number(ctx.session.scene.params?.chain ?? '')
          const api = await walletAPI.balanceOf({ uid: ctx.session.userinfo!.id, chain: chain })
          if (apiError(ctx, api, true)) {
            return await invalidInput(ctx, ctx.t('invalidPayee'))
          }
          const balance = api.data?.rows?.[0].amount ?? 0
          if (balance < amount) {
            const symbol = coinSymbols?.[chain] ?? ''
            return await invalidInput(ctx, ctx.t('transferBalanceFail', { symbol: symbol }))
          }

          // 删除用户回复的信息
          deleteMessage(ctx, ctx.message!.chat.id, ctx.message!.message_id)
          // 删除前一条信息，避免信息太多
          const { chatId, msgId } = ctx.session.lastMessage
          if (chatId && msgId) {
            deleteMessage(ctx, chatId, msgId)
          }
          // 跳转操作方法
          ctx.session.scene.params.amount = message
          ctx.session.request.goto = 'payee'
          await TransferView(ctx)
        },
      }

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    review: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('confirm'), '/wallet/transfer?goto=done')
      btn.text(ctx.t('cancel'), '/wallet/transfer?rep=1')

      const { chain, amount, payee, payee_name } = ctx.session.scene.params
      const msg = ctx.t('transferActionMsg', {
        step: 3,
        chain: coinSymbols?.[chain],
        payee: payee ?? '',
        amount: amount ?? '',
        payee_name: payee_name?.first_name ?? '',
      })

      await display(ctx, msg, btn.inline_keyboard)
    },
    done: async () => {
      await ctx.editMessageText('💸')

      const { chain, amount, payee, payee_name } = ctx.session.scene.params
      ctx.session.onMessage = undefined
      restSceneInfo(ctx)
      const api = await walletAPI.transfer({
        openid: ctx.session.userinfo!.openid,
        amount: amount,
        token: chain,
        to_user: payee,
      })
      if (apiError(ctx, api)) {
        return
      }

      const btn = new InlineKeyboard()
      btn.text(ctx.t('goback'), '/wallet')
      const msg = ctx.t('transferActionMsg', {
        step: 4,
        chain: coinSymbols?.[chain],
        payee: payee ?? '',
        amount: amount ?? '',
        payee_name: payee_name?.first_name ?? '',
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
      ctx.session.scene = {
        name: 'WithdrawView',
        router: '',
        createAt: Date.now(),
        store: new Map(),
        params: {
          chain: '',
          balance: '',
          address: '',
        },
      }

      ctx.session.onMessage = undefined
      const btn = new InlineKeyboard()
      coinSymbols.map((item, index) => {
        btn.text(`${item}`, `/wallet/withdraw?goto=address&chain=${index}`).row()
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
      const chain = request.params?.chain ?? ''
      const api = await walletAPI.balanceOf({ uid: ctx.session.userinfo!.id, chain })
      if (apiError(ctx, api)) {
        return
      }
      const balance = api.data?.rows?.[0]?.amount ?? 0
      if (balance <= 0) {
        return await ctx.answerCallbackQuery({
          text: ctx.t('withdrawBalanceFail'),
          show_alert: true,
        })
      }
      ctx.session.scene.params['balance'] = balance.toString()

      ctx.session.scene.params['chain'] = chain
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/wallet?rep=1')

      const msg = ctx.t('withdrawActionMsg', {
        step: 1,
        chain: coinSymbols?.[chain] ?? '',
        balance: '',
        address: '',
      })
      await display(ctx, msg, btn.inline_keyboard, true)
      ctx.session.onMessage = {
        name: 'payee',
        time: Date.now(),
        call: async ctx => {
          const chain = Number(ctx.session.scene.params?.chain ?? -1)
          const message = (ctx.message?.text ?? '').trim()
          const addressRegx = [/^T[a-zA-HJ-NP-Z0-9]{33}$/, /^0x[0-9a-fA-F]{40}$/, /^0x[0-9a-fA-F]{40}$/]
          if (chain < 0 || !addressRegx[chain].test(message)) {
            return await invalidInput(ctx, '无效地址')
          }

          // 跳转操作方法
          ctx.session.scene.params['address'] = message
          ctx.session.request.goto = 'review'
          await clearLastMessage(ctx)
          await WithdrawView(ctx)
        },
      }
    },
    review: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('confirm'), '/wallet/withdraw?goto=done')
      btn.text(ctx.t('cancel'), '/wallet?rep=1')

      ctx.session.onMessage = undefined
      const { chain, balance, address } = ctx.session.scene.params
      const msg = ctx.t('withdrawActionMsg', {
        step: 2,
        chain: coinSymbols?.[chain] ?? '',
        balance: balance ?? '',
        address: address ?? '',
      })

      await display(ctx, msg, btn.inline_keyboard)
    },
    done: async () => {
      const { chain, balance, address } = ctx.session.scene.params
      await ctx.editMessageText(ctx.t('loading'))
      const api = await walletAPI.withdraw({
        openid: ctx.session.userinfo!.openid,
        token: chain,
        address,
        amount: balance,
      })
      if (apiError(ctx, api)) {
        return
      }

      const btn = new InlineKeyboard()
      btn.text(ctx.t('goHome'), 'start?rep=1').row()
      btn.text(ctx.t('wallet'), 'wallet?rep=1')

      restSceneInfo(ctx)
      const msg = ctx.t('withdrawActionMsg', {
        step: 3,
        chain: coinSymbols?.[chain] ?? '',
        balance: balance ?? '',
        address: address ?? '',
      })
      const span = `\r\n<span class="tg-spoiler">防伪码: 52033</span>`

      await display(ctx, msg + span, btn.inline_keyboard, true)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

/**历史记录 */
export const HistoryView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const items = [ctx.t('depositHistory'), ctx.t('transferHistory'), ctx.t('withdrawHistory'), ctx.t('hongbaoHistory')]

  const actions: AnyObjetc = {
    index: async () => {
      const btn = new InlineKeyboard()
      items.map((item, index) => {
        if (index % 2 == 0) {
          btn.text(item, `/wallet/history?goto=list&item=${index}`)
        } else {
          btn.text(item, `/wallet/history?goto=list&item=${index}`).row()
        }
      })
      btn.text(ctx.t('goBack'), '/wallet?rep=1')

      await display(ctx, ctx.t('historyMsg'), btn.inline_keyboard, true)
    },
    list: async () => {
      const item = Number(request.params?.item ?? '')
      const page = request.params?.page || 1
      const api = await walletAPI.historyList({ item, page, openid: ctx.session.userinfo!.openid })
      if (apiError(ctx, api)) {
        return
      }

      const btn = new InlineKeyboard()
      const typeList = [ctx.t('hongbao1'), ctx.t('hongbao2'), ctx.t('hongbao3')]
      api?.data?.rows?.map(x => {
        let showText = ''
        // 红包
        if (3 === item) {
          // showText = `${format(x.created_at, 'MM/dd HH:ii')} · ${typeList?.[Number(x?.hbType)]}(💎${x.amount})`
          showText = `${format(x.created_at, 'MM/dd HH:ii')} · ${x.token} · 🧧${x.amount}`
        } else {
          showText = `${format(x.created_at, 'MM/dd HH:ii')} · ${x.token} · 💎${x.amount}`
        }
        btn.text(showText, `/wallet/history?goto=detail&item=${item}&id=${x.id}`).row()
      })
      const totalItem = api?.data?.total ?? 0
      const pageSize = api?.data?.size ?? 5
      const totalPage = Math.ceil(totalItem / pageSize)
      pager(ctx, btn, totalPage, page, `/wallet/history?goto=list&item=${item}`)
      btn.text(ctx.t('goBack'), '/wallet/history')

      const pageInfo = ctx.t('pageInfo', {
        currPage: page,
        totalPage: totalPage,
      })

      const counts = (api?.data as any)?.counts ?? {}
      const msg = ctx.t('historyListMsg', {
        item,
        count1: counts?.count1 ?? '',
        count2: counts?.count2 ?? '',
        count3: counts?.count3 ?? '',
        pageInfo,
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    detail: async () => {
      const item = Number(request.params?.item ?? '')
      const id = Number(request.params?.id)
      const apiRes = await walletAPI.historyDetail({ item, id, openid: ctx.session.userinfo!.openid })
      if (apiError(ctx, apiRes)) {
        return
      }

      const time = format(apiRes?.data?.create_at, 'yy/MM/dd HH:ii')
      const status = [ctx.t('statusFail'), ctx.t('statusSuccess')]
      const msg = ctx.t('depositHistoryDetail', {
        time: time,
        amount: apiRes?.data?.amount,
        token: apiRes?.data?.token,
        status: status?.[apiRes?.data?.status ?? 0],
      })
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
      const msg = ctx.t('hongbaoActionMsg', {
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
    chain: async () => {
      ctx.session.scene = {
        name: 'WithdrawView',
        router: '',
        createAt: Date.now(),
        store: new Map(),
        params: {
          type: '',
          name: '',
          chain: '',
          amount: '',
          user: '',
          split: '',
          balance: '0',
        },
      }
      const type = request.params?.type ?? ''
      ctx.session.scene.params['type'] = type
      const btn = new InlineKeyboard()
      coinSymbols.map((item, index) => {
        btn.text(`${item}`, `/wallet/hongbao?goto=amount&type=${type}&chain=${index}`).row()
      })
      btn.text(ctx.t('cancel'), '/wallet?rep=1')
      const msg = ctx.t('hongbaoActionMsg', {
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
    amount: async () => {
      const type = request.params?.type ?? ''
      const chain = request.params?.chain
      ctx.session.onMessage = undefined
      ctx.session.scene.params['chain'] = chain
      // 判断用户是否有余额
      const api = await walletAPI.balanceOf({ uid: ctx.session.userinfo!.id, chain: chain })
      if (apiError(ctx, api)) {
        return
      }
      const balance = api.data?.rows?.[0].amount ?? 0
      if (balance <= 0) {
        return await invalidInput(ctx, ctx.t('hongbaoBalanceFail'))
      }
      ctx.session.scene.params['balance'] = balance

      const btn = new InlineKeyboard()
      amountList.map((amount, index) => {
        let to = 'review'
        if (Number(type) === 1) to = 'user'
        if (Number(type) === 2) to = 'split'
        const router = `/wallet/hongbao?goto=${to}&type=${type}&chain=${chain}&amount=${amount}&rep=1`
        if (index % 3 == 2) {
          btn.text(`🧧 ${amount}`, router).row()
        } else {
          btn.text(`🧧 ${amount}`, router)
        }
      })
      btn.text(ctx.t('hongbaoOtherAmount'), `/wallet/hongbao?goto=inputAmount&type=${type}&chain=${chain}`)
      btn.text(ctx.t('cancel'), '/wallet/hongbao?rep=1')

      const msg = ctx.t('hongbaoActionMsg', {
        step: 2,
        type: Number(type),
        name: typeList[type],
        chain: coinSymbols[chain],
        amount: '',
        user: '',
        split: '',
        balance: balance,
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
    // 输入金额
    inputAmount: async () => {
      const { chain, type, amount, user, split } = request.params
      // 11-输入红包金额 2-红包接收用户ID 3-红包拆分数量
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), `/wallet/hongbao?goto=amount&type=${type}&chain=${chain}`)

      const msg = ctx.t('hongbaoActionMsg', {
        step: 20,
        type: Number(type),
        name: typeList[type],
        chain: coinSymbols[chain],
        amount: '',
        user: '',
        split: '',
        balance: ctx.session.scene.params?.balance ?? '',
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
          ctx.session.scene.params['amount'] = message
          let to = 'review'
          if (Number(type) === 1) to = 'user'
          if (Number(type) === 2) to = 'split'
          ctx.session.request.goto = to
          ctx.session.request.params['rep'] = '0'
          await clearLastMessage(ctx)
          await HongbaoView(ctx)
        },
      }
    },
    // 专属红包
    user: async () => {
      const { type, chain } = request.params
      const amount = ctx.session.request.params?.amount ?? ctx.session.scene.params?.amount ?? ''
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/wallet?rep=1')
      const msg = ctx.t('hongbaoActionMsg', {
        step: 21,
        type: Number(type),
        name: typeList[type],
        chain: coinSymbols[chain],
        amount: amount ?? '',
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
            return await invalidInput(ctx, ctx.t('hongbaoUserFail'))
          }

          // 判断用户是否存在
          const api = await userAPI.checkUser({ openid: message })
          if (apiError(ctx, api, true)) {
            return await invalidInput(ctx, ctx.t('hongbaoUserFail'))
          }

          // 跳转操作方法
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
      const { type, chain } = request.params
      const amount = ctx.session.request.params?.amount ?? ctx.session.scene.params?.amount ?? ''
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/wallet?rep=1')
      const msg = ctx.t('hongbaoActionMsg', {
        step: 22,
        type: Number(type),
        name: typeList[type],
        chain: coinSymbols[chain],
        amount: amount ?? '',
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
          const amount = parseFloat(message)
          if (Number.isNaN(amount) || amount <= 0) {
            return await invalidInput(ctx, ctx.t('hongbaoInputFail'))
          }

          // 跳转操作方法
          ctx.session.scene.params['split'] = message
          ctx.session.request.goto = 'review'
          ctx.session.request.params['rep'] = '0'
          await clearLastMessage(ctx)
          return await HongbaoView(ctx)
        },
      }
    },
    review: async () => {
      ctx.session.onMessage = undefined
      const { chain, type, user, split } = ctx.session.scene.params
      const amount = ctx.session.request.params?.amount ?? ctx.session.scene.params?.amount ?? ''

      const btn = new InlineKeyboard()
      btn.text(ctx.t('confirm'), `/wallet/hongbao?goto=done&type=${type}&chain=${chain}&amount=${amount}`)
      btn.text(ctx.t('cancel'), '/wallet/hongbao?rep=1')
      let msg = ctx.t('hongbaoActionMsg', {
        step: 3,
        type: Number(type),
        name: typeList[type],
        chain: coinSymbols[chain],
        amount: amount ?? '',
        user: user ?? '',
        split: split ?? '',
      })
      msg = msg.replace(/DELETE_EMPTY_STRING\n/, '')

      const isRep = Number(ctx.session.request.params?.rep ?? '') === 1
      await display(ctx, msg, btn.inline_keyboard, isRep)
    },
    done: async () => {
      await ctx.editMessageText(ctx.t('loading'))

      const { chain, type, user, split } = ctx.session.scene.params
      const amount = ctx.session.request.params?.amount ?? ctx.session.scene.params?.amount ?? ''

      const api = await walletAPI.fahongbao({
        openid: ctx.session.userinfo!.openid,
        type,
        token: chain,
        amount,
        user,
        split,
      })
      if (apiError(ctx, api)) {
        return
      }

      restSceneInfo(ctx)
      ctx.session.onMessage = undefined

      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/wallet?rep=1')

      let msg = ctx.t('hongbaoActionMsg', {
        step: 4,
        type: Number(type),
        name: typeList[type],
        chain: coinSymbols[chain],
        amount: amount ?? '',
        user: user ?? '',
        split: split ?? '',
      })
      await display(ctx, msg, btn.inline_keyboard, true)
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
