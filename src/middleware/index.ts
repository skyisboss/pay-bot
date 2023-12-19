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

    // 根据获取用户信息 赋值给session
    if (ctx.from?.id) {
      console.log('step', ctx.message?.text)

      // 获取系统配置
      const api = await userAPI.getConfig({ openid: ctx.from.id.toString() })
      if (apiError(ctx, api)) {
        return await stopService(ctx, '🚧 似乎出了一点问题，请稍后再试 - 1')
      }
      ctx.session.config = api?.data
      /**
       * TODO::如果用户session已经存在，则不在重新获取
       * 但这样会导致用户修改设置session信息不同步
       * 因此可以在设计用户修改设置的地方清空session
       * 然后在这里判断session，如果session不存在就重新获取
       * if (ctx.session.userinfo?.openid) {
       *  return next()
       * } else {
       *  重新获取session
       * }
       */
      try {
        let userinfo: any
        userinfo = await userAPI.userinfo({ openid: ctx.from.id.toString() })
        // 注册用户
        if (!userinfo?.success && userinfo.err === 404) {
          /**
           * /^\/start\si[\da-zA-Z]+$/ 判断是否通过邀请链接访问
           * 规则：已/start开头，然后空格已i字母开头的任意数字、字母字符串
           */
          let playload = { openid: ctx.from.id.toString(), nickname: ctx.from.first_name }
          if (ctx.message?.text && /^\/start\si[\da-zA-Z]+$/.test(ctx.message.text)) {
            const [_, invite_code] = ctx.message.text.split('/start ')
            if (invite_code) {
              playload = { ...playload, ...{ invite_code } }
            }
          }

          userinfo = await userAPI.register(playload)
        }

        if (userinfo?.success) {
          ctx.session.userinfo = userinfo?.data
          return next()
        }
        return await stopService(ctx, '🚧 似乎出了一点问题，请稍后再试 - 2')
      } catch (error) {
        return await stopService(ctx, '🚧 似乎出了一点问题，请稍后再试 - 3')
      }
    }
  })
}
