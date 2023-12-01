import { AnyObjetc, BotContext } from '@/@types/types'
import { paymentAPI } from '@/api/payment'
import {
  apiError,
  checkScene,
  clearLastMessage,
  display,
  getChainSymbol,
  pager,
  restSceneInfo,
  SessionVersion,
  showServerStop,
} from '@/util/helper'
import { InlineKeyboard } from 'grammy'
import { coinSymbols } from '../wallet'
import { format } from 'date-fns'

export const PaymentView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    restSceneInfo(ctx)

    const api = await paymentAPI.index({ uid: ctx.session.userinfo!.id })
    if (apiError(ctx, api)) {
      return
    }

    const btn = new InlineKeyboard()
    if (api.data?.id) {
      btn.text(ctx.t('paymentManage'), '/payment/manage?goto=index').row()
    } else {
      btn.text(ctx.t('paymentNew'), '/payment/manage?goto=create').row()
    }
    btn.url(ctx.t('paymentDocument'), 'https://google.com/').row()
    btn.text(ctx.t('goBack'), '/start?rep=1')

    await display(ctx, ctx.t('paymentMsg'), btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

const ManageView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const actions: AnyObjetc = {
    index: async () => {
      restSceneInfo(ctx)
      const btn = new InlineKeyboard()
      btn.text(ctx.t('paymentAppToken'), '/payment/manage?goto=token')
      btn.text(ctx.t('paymentAppHook'), '/payment/manage?goto=hook').row()
      btn.text(ctx.t('paymentAppDetail'), '/payment/manage?goto=detail')
      btn.text(ctx.t('paymentAppWithdraw'), '/payment/manage?goto=withdraw').row()
      btn.text(ctx.t('goBack'), '/payment')

      const api = await paymentAPI.index({ uid: ctx.session.userinfo!.id })
      if (apiError(ctx, api)) {
        return
      }

      const count = api.data?.count
      const balance = api.data?.balance
      const msg = ctx.t('paymentAppMsg', {
        count1: count?.count1 ?? 0,
        count2: count?.count2 ?? 0,
        count3: count?.count3 ?? 0,
        trc20: balance?.trc20 ?? 0,
        bep20: balance?.bep20 ?? 0,
        erc20: balance?.erc20 ?? 0,
        link: 't.me/Bot?start=IV71Q3VixUr7',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    create: async () => {
      await ctx.editMessageText(ctx.t('loading'))

      const api = await paymentAPI.create({ uid: ctx.session.userinfo!.id })
      if (apiError(ctx, api)) {
        return
      }

      const btn = new InlineKeyboard()
      btn.text(ctx.t('paymentManage'), '/payment/manage?goto=index')
      btn.text(ctx.t('goBack'), '/payment')
      await display(ctx, ctx.t('paymentCreateSuccess'), btn.inline_keyboard, true)
    },
    token: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('paymentAppTokenReset'), '/payment/manage?goto=token&reset=1')
      btn.text(ctx.t('goBack'), '/payment/manage')

      const reset = request.params?.reset
      const api = await paymentAPI.token({ uid: ctx.session.userinfo!.id, reset })
      if (apiError(ctx, api)) {
        return
      }

      if (reset) {
        await ctx.answerCallbackQuery({
          text: ctx.t('paymentAppTokenResetOK'),
          show_alert: true,
        })
      }

      const msg = ctx.t('paymentTokenMsg', {
        token: api.data?.token ?? '',
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
    hook: async () => {
      // todo 调整回调逻辑
      const btn = new InlineKeyboard()
      const rep = Number(request.params?.rep ?? '1')
      const step = request.params?.step ?? ''
      if (step) {
        const msg = ctx.t('paymentHookMsg', {
          step: 1,
          hook: '',
          hookStatus: 0,
        })
        btn.text(ctx.t('cancel'), '/payment/manage')
        await display(ctx, msg, btn.inline_keyboard, true)
        ctx.session.onMessage = {
          name: 'input-hook',
          time: Date.now(),
          call: async ctx => {
            const message = (ctx.message?.text ?? '').trim()
            if (message) {
              try {
                new URL(message)
              } catch (err) {
                const btn = new InlineKeyboard()
                btn.text(ctx.t('goBack'), '/payment/manage')
                await clearLastMessage(ctx)
                return await display(ctx, ctx.t('invalidInput'), btn.inline_keyboard)
              }
            }
            const api = await paymentAPI.hook({ uid: ctx.session.userinfo!.id, hook: message })
            if (apiError(ctx, api)) {
              return
            }

            ctx.session.request.goto = 'hook'
            ctx.session.request.params['rep'] = 0
            ctx.session.request.params['step'] = 0
            await clearLastMessage(ctx)
            await ManageView(ctx)
          },
        }
      } else {
        ctx.session.onMessage = undefined
        const api = await paymentAPI.hook({ uid: ctx.session.userinfo!.id })
        if (apiError(ctx, api)) {
          return
        }
        const webhook = api.data?.hook ?? ''
        const text = ctx.t(webhook ? 'paymentAppHookEdit' : 'paymentAppHookAdd')
        btn.text(text, '/payment/manage?goto=hook&step=1').row()
        btn.text(ctx.t('goBack'), '/payment/manage')
        const msg = ctx.t('paymentHookMsg', {
          step: 0,
          hook: webhook,
          hookStatus: webhook ? 1 : 0,
        })
        await display(ctx, msg, btn.inline_keyboard, !!rep)
      }
    },
    more: async () => {
      const itemId = request.params?.id ?? ''
      const api = await paymentAPI.detail({
        uid: ctx.session.userinfo!.id,
        id: Number(itemId),
      })
      if (apiError(ctx, api)) {
        return
      }

      const chain = getChainSymbol(ctx, api.data?.chain ?? '')
      const status = ['🕘 wait', '🟢 ok', '🔴 error'] //🟡
      const msg = ctx.t('paymentDetailMoreMsg', {
        time: format(api.data?.created_at ?? 0, 'MM/dd HH:ii'),
        amount: api.data?.amount ?? 0,
        chain: chain ?? '',
        status: status?.[api.data?.status ?? 0],
        category: Number(api.data?.category ?? ''),
      })
      await ctx.answerCallbackQuery({
        show_alert: true,
        text: msg,
      })
    },
    detail: async () => {
      const page = Number(request.params?.page ?? 1)
      const category = request.params?.cate ?? ''

      const btn = new InlineKeyboard()
      const detailInText = ctx.t('paymentDetailIn') + `${Number(category) === 1 ? ' ◉' : ' ○'}`
      const detailOutText = ctx.t('paymentDetailOut') + `${Number(category) === 2 ? ' ◉' : ' ○'}`
      const version = SessionVersion(ctx)
      btn.text(detailInText, `/payment/manage?goto=detail&cate=1&page=1&v=${version}`)
      btn.text(detailOutText, `/payment/manage?goto=detail&cate=2&page=1&v=${version}`).row()

      let pageInfo = ''
      if (category) {
        const api = await paymentAPI.category({
          uid: ctx.session.userinfo!.id,
          page,
          cate: Number(category),
        })
        if (apiError(ctx, api)) {
          return
        }
        const rows = api.data?.rows ?? []
        rows.map(x => {
          const time = format(x?.created_at ?? 0, 'MM/dd HH:ii')
          const chain = getChainSymbol(ctx, x?.chain ?? '')
          const title = `${time} | ${chain ?? '-'} | ${x.amount}`
          btn.text(title, `/payment/manage?goto=more&id=${x.id}`).row()
        })
        pager(ctx, btn, api?.data?.total ?? 0, page, `/payment/manage?goto=detail&cate=${category}`)
        pageInfo = ctx.t('pageInfo', {
          currPage: page,
          totalPage: api?.data?.total ?? 0,
        })
      }

      const msg = ctx.t('paymentDetailMsg', {
        category: Number(category),
      })
      btn.text(ctx.t('goBack'), '/payment/manage')
      await display(ctx, msg + `\r\n\r\n` + pageInfo, btn.inline_keyboard, true)
    },
    withdraw: async () => {
      const api = await paymentAPI.withdraw({ uid: ctx.session.userinfo!.id })
      console.log(api)

      if (apiError(ctx, api)) {
        return
      }
      return await showServerStop(ctx, ctx.t('paymentAppWithdrawSuccess'))
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
const views: AnyObjetc = {
  manage: ManageView,
}
