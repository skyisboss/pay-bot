import { initI18n } from './i18n'
import { initSession } from './session'
import { userAPI } from '@/api/user'
import { hydrateReply } from '@grammyjs/parse-mode'
import { initLogger } from '@/logger'
import { MyBot } from '@/@types/types'
import { apiError, stopService } from '@/util/helper'

export const useMiddleware = async (bot: MyBot) => {
  bot.use(initSession())
  bot.use(await initI18n())
  // 安装常用的 reply 方法到 ctx 中
  bot.use(hydrateReply)

  bot.use(async (ctx, next) => {
    // ctx.fluent.useLocale(ctx.session.user?.lang ?? '')
    // console.log(ctx.fluent.instance)

    // 获取系统配置
    // if (!ctx.session.config) {
    const api = await userAPI.getConfig()
    if (apiError(ctx, api)) {
      return
    }

    ctx.session.config = api?.data
    // }

    // 根据获取用户信息 赋值给session
    if (ctx.from?.id) {
      if (ctx.session.userinfo?.id) {
        return next()
      } else {
        try {
          const userinfo = await userAPI.userinfo({ uid: ctx.from.id, nickname: ctx.from.first_name })

          if (userinfo?.success) {
            ctx.session.userinfo = userinfo?.data
            return next()
          }
          return await stopService(ctx, '🚧 似乎出了一点问题，请稍后再试 - 1000')
        } catch (error) {
          return await stopService(ctx, '🚧 似乎出了一点问题，请稍后再试 - 1001')
        }
      }
    }
  })
}
