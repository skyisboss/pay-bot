import { BotContext } from '@/@types/types'
import { display, restSceneInfo } from '@/util/helper'
import { InlineKeyboard } from 'grammy'

export const StartHome = async (ctx: BotContext) => {
  // 一旦进入主页面就重置场景。
  restSceneInfo(ctx)

  const btn = new InlineKeyboard()
  btn.text(ctx.t('wallet'), '/wallet')
  btn.text(ctx.t('payment'), '/payment').row()
  btn.text(ctx.t('secured'), '/secured')
  btn.text(ctx.t('store'), '/store').row()
  btn.text(ctx.t('invite'), '/invite').row()
  btn.text(ctx.t('setting'), '/setting')

  await display(ctx, ctx.t('homeWelcome'), btn.inline_keyboard, ctx.session.request.replace)
}
