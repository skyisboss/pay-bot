import { clearLastMessage, compress, deleteMessage, parseCallbackQuery, parseRouter } from '@/util/helper'
import { GrammyError, HttpError, InlineKeyboard, InlineQueryResultBuilder } from 'grammy'
import { StartHome } from './start'
import { logger } from '@/logger'
import { WalletView } from './wallet'
import { MyBot, BotContext, AnyObjetc, SceneInfo, CallbackRequest } from '@/@types/types'
import { SettingView } from './setting'
import { PaymentView } from './payment'
import { SecuredView } from './secured'
import { InviteView } from './invite'
import { VendingView } from './vending'

const ViewsObject: AnyObjetc = {
  start: StartHome,
  wallet: WalletView,
  setting: SettingView,
  payment: PaymentView,
  vending: VendingView,
  secured: SecuredView,
  invite: InviteView,
}
export const useHandler = async (bot: MyBot) => {
  // 开始页面
  bot.command('start', async ctx => {
    ctx.session.request.views = ['start']
    await callBotView(ctx)
  })

  // 监听按钮点击事件
  bot.on('callback_query:data', async ctx => {
    try {
      const request = parseCallbackQuery(compress.decode(ctx.callbackQuery.data))
      // const request = parseCallbackQuery(ctx.callbackQuery.data)
      logger.debug('监听按钮点击事件', request)
      ctx.session.request = request

      // 分配视图
      await callBotView(ctx)

      // // 如果是带有callbackQuery，响应loading
      // if (ctx.callbackQuery?.id) {
      //   await ctx.answerCallbackQuery()
      // }
    } catch (error) {
      logger.error('err', error)
      await ctx.answerCallbackQuery()
    }
  })
  // 行内查询 输入框搜索，使用方法：@机器人名称 关键词
  // 示例： @beikeBot link
  // https://grammy.dev/zh/plugins/inline-query
  bot.inlineQuery(/link/, async ctx => {
    // 创建一个单独的 inline query 结果。
    const result = InlineQueryResultBuilder.article('id:link', 'beikePay钱包邀请链接', {
      reply_markup: new InlineKeyboard().url('beikePay', 'https://t.me/beikeBot'),
    }).text(
      `<b>beikePay</b> 邀请您使用beikePay钱包 
转账收款 实时到账 无手续费`,
      { parse_mode: 'HTML' },
    )

    // 回复 inline query.
    // await ctx.answerInlineQuery(
    //   [result], // 用结果列表回复
    //   // { cache_time: 30 * 24 * 3600 }, // 30 天的秒数
    // )
    // return

    const button = {
      text: 'Open private chat',
      start_parameter: 'login',
    }
    await ctx.answerInlineQuery([result], { button })
  })

  /**
   * 监听用户发送的文本消息
   * 另一种场景是某个操作时要求用户回复信息，然后从回复的信息里提取数据，然后继续执行前一步操作
   * 因此，这需要在上一步里设置一个场景 ctx.session.scene
   * 然后此处才能解析
   */
  bot.on('message:text', async ctx => {
    console.log('session场景', ctx.session)

    const message = ctx.message.text.trim()
    logger.debug('监听文本消息', message)

    const scene = ctx.session.scene
    logger.debug('读取场景信息', scene)

    if (ctx.session?.onMessage) {
      const name = ctx.session.onMessage?.name
      const time = ctx.session?.onMessage?.time
      logger.debug('监听onMessage', { name, time })
      // 检测是否过期 30分钟内有效
      if (time >= Date.now() - 30 * 60 * 1000) {
        return await ctx.session.onMessage.call(ctx)
      } else {
        ctx.session.onMessage = undefined
        clearLastMessage(ctx)
        return await ctx.reply(ctx.t('sessionTimeOut'))
      }
    }
    if (scene?.router) {
      // 删除前一条信息，避免信息太多
      // const { chatId, msgId } = ctx.session?.lastMessage
      // if (chatId && msgId) {
      //   return await deleteMessage(ctx, chatId, msgId)
      // }

      const result = parseCallbackQuery(scene.router)
      logger.debug('处理场景信息', result)

      // 执行方法
      ctx.session.request = result

      // 存储用户输入
      const inputType = result.params?.inputType
      if (inputType) {
        ctx.session.scene.params[inputType] = message
      }

      // 调度
      await callBotView(ctx)
    }
  })
  /*
  bot.on('message:text', async ctx => {
    let result: RouterInfo = {
      view: '',
      method: '',
      action: '',
    }
    switch (ctx.message.text) {
      case ctx.t('wallet'):
        result.method = 'wallet'
        break
      case ctx.t('account'):
        result.method = 'account'
        break
      case ctx.t('secured'):
        result.method = 'secured'
        break
      case ctx.t('payment'):
        result.method = 'payment'
        break
      case ctx.t('miniApp'):
        result.method = 'miniapp'
        break
      case ctx.t('more'):
        result.method = 'more'
        break
      default:
        const router = ctx.session.scene.router
        if (router != undefined && router != '') {
          const res = parseRouter(`${router}&_text=${ctx.message.text}`)
          if (res) {
            result = res
          }
        }
        break
    }

    if (result.method) {
      dispatchRouter(ctx, result)
    } else {
      console.log('未匹配到任何操作')
    }
  })
  */

  bot.catch(err => {
    const ctx = err.ctx
    console.error(`Error while handling update ${ctx.update.update_id}:`)
    const e = err.error
    if (e instanceof GrammyError) {
      console.error('Error in request:', e.description)
    } else if (e instanceof HttpError) {
      console.error('Could not contact Telegram:', e)
    } else {
      console.error('Unknown error:', e)
    }
  })
}

/**调度视图 */
const callBotView = async (ctx: BotContext) => {
  const request = ctx.session.request

  await ViewsObject?.[request.views?.[0]]?.(ctx)

  // const viewName = callbackQuery.views?.[0] ?? ''
  // await ViewsObject?.[viewName as keyof Tg.AnyObjetc]?.(ctx)
  // try {
  //   // await viewObj[callbackQuery.views[0] as keyof Tg.AnyObjetc](ctx)
  // } catch (error) {
  //   logger.error('err', error)
  // }
}
