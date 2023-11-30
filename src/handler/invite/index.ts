import { AnyObjetc, BotContext } from '@/@types/types'
import { inviteAPI } from '@/api/invite'
import { apiError, display, showServerStop } from '@/util/helper'
import { InlineKeyboard } from 'grammy'

export const InviteView = async (ctx: BotContext) => {
  const request = ctx.session.request
  if (request.homePage) {
    const api = await inviteAPI.index({ uid: ctx.session.userinfo!.id })
    if (apiError(ctx, api)) {
      return
    }

    const btn = new InlineKeyboard()
    // 配合 bot.inlineQuery 使用 # src/handler/index.ts
    btn.switchInline(ctx.t('sendToFriend'), 'link').row()
    btn.text(ctx.t('inviteLog'), '/invite/logs/?goto=detail')
    btn.text(ctx.t('goBack'), '/start?rep=1')

    const msg = ctx.t('inviteMsg', {
      link: api.data?.link ?? '',
    })

    await display(ctx, msg, btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

export const LogsView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const actions: AnyObjetc = {
    detail: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('inviteWithdraw'), '/invite/logs?goto=withdraw').row()
      btn.text(ctx.t('goBack'), '/invite')

      const api = await inviteAPI.detail({ uid: ctx.session.userinfo!.id })
      if (apiError(ctx, api)) {
        return
      }
      const invites = api?.data?.invites
      const balance = api?.data?.balance
      const msg = ctx.t('inviteDetail', {
        count1: invites?.count1,
        count2: invites?.count2,
        count3: invites?.count3,
        count4: invites?.count4,
        trc20: balance?.trc20,
        bep20: balance?.bep20,
        erc20: balance?.erc20,
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    withdraw: async () => {
      const api = await inviteAPI.withdraw({ uid: ctx.session.userinfo!.id })

      if (apiError(ctx, api)) {
        return
      }
      await showServerStop(ctx, ctx.t('inviteWithdrawSuccess'))

      await actions.detail()
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

const views: AnyObjetc = {
  logs: LogsView,
}
