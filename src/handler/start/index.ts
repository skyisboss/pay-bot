import { BotContext } from '@/@types/types'
import { display, restSceneInfo } from '@/util/helper'
import { InlineKeyboard } from 'grammy'

export const StartHome = async (ctx: BotContext) => {
  // 一旦进入主页面就重置场景。
  restSceneInfo(ctx)
  // 邀请吗
  const inviteCode = ctx.session.request.params?.invite ?? ''
  if (inviteCode) {
    // 处理邀请码绑定逻辑
  }

  const btn = new InlineKeyboard()
  btn.text(ctx.t('wallet'), '/wallet')
  btn.text(ctx.t('payment'), '/payment').row()
  btn.text(ctx.t('secured'), '/contract')
  // btn.text('担保交易2', '/contract')
  btn.text(ctx.t('vending'), '/vending').row()
  btn.text(ctx.t('invite'), '/invite').row()
  btn.text(ctx.t('setting'), '/setting')

  await display(ctx, ctx.t('homeWelcome'), btn.inline_keyboard, ctx.session.request.replace)
}
