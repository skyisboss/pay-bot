import { AnyObjetc, BotContext } from '@/@types/types'
import { inviteAPI } from '@/api/invite'
import { display, showServerStop } from '@/util/helper'
import { InlineKeyboard } from 'grammy'

export const ExtendView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

export const InviteView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const actions: AnyObjetc = {
    index: async () => {
      const btn = new InlineKeyboard()
      // 配合 bot.inlineQuery 使用
      btn.switchInline(ctx.t('sendToFriend'), 'link').row()
      btn.text(ctx.t('inviteLog'), '/extend/invite?goto=detail')
      btn.text(ctx.t('goBack'), '/start?rep=1')

      const msg = ctx.t('inviteMsg', {
        link: 'http://t.me/?start=iAzXOz26pE6',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    // const item = index === active ? `${x} ☑` : x
    // const item = index === active ? `${x} ◉` : `${x} ○
    detail: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('inviteWithdraw'), '/extend/invite?goto=withdraw').row()
      btn.text(ctx.t('goBack'), '/extend/invite')

      const api = await inviteAPI.detail({ uid: ctx.session.userinfo!.id })
      if (!api.success || !api?.data) {
        return await showServerStop(ctx)
      }
      const invites = api?.data?.invites
      const balance = api?.data?.balance
      const msg = ctx.t('inviteDetail', {
        today: invites?.today,
        yesterday: invites?.yesterday,
        month: invites?.month,
        total: invites?.total,
        trc20: balance?.trc20,
        bep20: balance?.bep20,
        erc20: balance?.erc20,
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    withdraw: async () => {
      const api = await inviteAPI.withdraw({ uid: ctx.session.userinfo!.id })
      if (!api.success) {
        return await showServerStop(ctx, ctx.t('inviteWithdrawFail'))
      }
      return await showServerStop(ctx, ctx.t('inviteWithdrawSuccess'))
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

const views: AnyObjetc = {
  invite: InviteView,
}
