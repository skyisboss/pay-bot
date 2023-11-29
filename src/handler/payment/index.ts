import { AnyObjetc, BotContext } from '@/@types/types'
import { paymentAPI } from '@/api/payment'
import { checkScene, clearLastMessage, display, restSceneInfo, showServerStop } from '@/util/helper'
import { InlineKeyboard, InlineQueryResultBuilder } from 'grammy'
import { WithdrawView } from '../wallet'

export const PaymentView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    restSceneInfo(ctx)

    let apiRes
    try {
      apiRes = await paymentAPI.index({ uid: ctx.session.userinfo!.id })
      if (!apiRes.success || !apiRes?.data) {
        return await showServerStop(ctx)
      }
    } catch (error) {
      return await showServerStop(ctx)
    }

    const btn = new InlineKeyboard()
    if (apiRes.data?.created) {
      btn.text(ctx.t('paymentManage'), '/payment/manage?goto=index').row()
    } else {
      btn.text(ctx.t('paymentNew'), '/payment/manage?goto=create').row()
    }
    btn.url(ctx.t('paymentDocument'), 'https://grammy.dev/').row()
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

      const msg = ctx.t('paymentAppMsg', {
        today: 0,
        trc20: 0,
        bep20: 0,
        erc20: 0,
        link: 't.me/Bot?start=IV71Q3VixUr7',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    create: async () => {
      await ctx.editMessageText(ctx.t('loading'))
      const btn = new InlineKeyboard()
      btn.text(ctx.t('paymentManage'), '/payment/manage?goto=index')
      btn.text(ctx.t('goBack'), '/payment')

      setTimeout(async () => {
        await display(ctx, ctx.t('paymentCreateSuccess'), btn.inline_keyboard, true)
      }, 1000)
    },
    token: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('paymentAppTokenReload'), '/payment/manage?goto=token&reload=1')
      btn.text(ctx.t('goBack'), '/payment/manage')

      if (request.params?.reload) {
        await ctx.answerCallbackQuery({
          text: ctx.t('paymentAppTokenReloadOK'),
          show_alert: true,
        })
      }

      const msg = ctx.t('paymentTokenMsg', {
        token: '46299:AACsE5fTREoQNCxOsLQ4ZsJsDZBOJiV8n068855',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    hook: async () => {
      const btn = new InlineKeyboard()
      const setHook = request.params?.setHook ?? ''
      if (setHook) {
        ctx.session.scene = {
          name: 'ManageView',
          router: '/payment/manage?goto=getInput&inputType=webhook',
          createAt: Date.now(),
          store: new Map(),
          params: {
            webhook: '',
          },
        }
        btn.text(ctx.t('cancel'), '/payment/manage')

        await display(ctx, ctx.t('paymentHookInput'), btn.inline_keyboard, true)
      } else {
        const webhook = request.params?.webhook ?? ''

        btn
          .text(ctx.t(webhook ? 'paymentAppHookEdit' : 'paymentAppHookAdd'), '/payment/manage?goto=hook&setHook=1')
          .row()
        btn.text(ctx.t('goBack'), '/payment/manage')

        const msg = ctx.t('paymentHookMsg', {
          index: webhook ? 1 : 0,
          webhook: webhook,
        })

        await display(ctx, msg, btn.inline_keyboard, !webhook && !setHook ? true : false)
        if (webhook) {
          restSceneInfo(ctx)
        }
      }
    },
    detail: async () => {
      const currSelect = Number(request.params?.cate ?? 0)
      const lastSelect = Number(request.params?.last ?? 0)
      if (lastSelect && lastSelect === currSelect) {
        return ctx.answerCallbackQuery()
      }
      const detailInText = ctx.t('paymentDetailIn') + `${currSelect === 1 ? ' ◉' : ' ○'}`
      const detailOutText = ctx.t('paymentDetailOut') + `${currSelect === 2 ? ' ◉' : ' ○'}`
      const btn = new InlineKeyboard()
      btn.text(detailInText, `/payment/manage?goto=detail&cate=1&last=${currSelect}`)
      btn.text(detailOutText, `/payment/manage?goto=detail&cate=2&last=${currSelect}`).row()

      let msg = ctx.t('paymentAppDetailMsg', {
        index: currSelect > 0 ? 1 : 0,
      })
      // 构建详细记录
      if (currSelect) {
        const page = `\r\n当前第 1 页, 共 3 页, 100 项记录`
        // msg += page
      }

      btn.text(ctx.t('goBack'), '/payment/manage')
      await display(ctx, msg, btn.inline_keyboard, true)
    },
    withdraw: async () => {
      return await showServerStop(ctx, ctx.t('paymentAppWithdrawSuccess'))
    },
    getInput: async () => {
      if (!checkScene(ctx)) {
        restSceneInfo(ctx)
        return await display(ctx, ctx.t('sessionTimeOut'))
      }

      const inputType = request.params?.inputType
      const message = scene.params?.[inputType]

      if (inputType == 'webhook') {
        ctx.session.request.goto = 'hook'
        ctx.session.request.params = { webhook: message }
        await clearLastMessage(ctx)
        await ManageView(ctx)
      }
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
const views: AnyObjetc = {
  manage: ManageView,
}
