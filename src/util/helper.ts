import { AnyObjetc, BotContext, CallbackRequest, RouterInfo, Tg } from '@/@types/types'
import { logger } from '@/logger'
import { InitScene } from '@/middleware/session'
// import { MyBot, RouterInfo } from '@/types'
import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'

// 解析路由
export const parseRouter = (data: string) => {
  if (data.trim().length <= 0) {
    return
  }
  // 解析方法名 'wallet?m=index&a=detail =》 ['wallet', 'm=index&a=detail']
  const [view, query] = data.split('?')

  // 解析参数 'm=index&a=detail' => ['m=index', 'a=detail']
  const queryArr = query.split('&')

  const obj: RouterInfo = {
    view: view,
    method: '',
    action: '',
  }

  // 提取参数 'm=index' => ['m', 'index']
  queryArr.map(element => {
    let [key, val] = element.split('=')
    if (key == 'a') {
      key = 'action'
    } else if (key == 'm') {
      key = 'method'
    }
    obj[key as keyof RouterInfo] = val
  })

  return obj
}

// 解析callback_query数据
export const parseCallbackQuery = (data: string) => {
  //  http://hostname.com/wallet/deposit/xxx?id1=111&id2=222
  const location = new URL(data, 'http://hostname.com')
  // /wallet/deposit/ => ['abc', 'sada']
  const pathname = location.pathname.split('/').filter(x => !!x)
  // ?id1=111&id2=222 => { 'id1' => '111', 'id2' => '222' }
  const params = location.searchParams

  let paramsObj: AnyObjetc = {}
  if (params.size > 0) {
    params.forEach((value, key) => {
      paramsObj[key] = value
    })
  }

  const res: CallbackRequest = {
    views: pathname,
    params: paramsObj,
    homePage: pathname.length === 1,
    replace: paramsObj?.rep ?? false,
    goto: paramsObj?.goto ?? 'index',
  }

  return res
}

/**服务异常 */
export const stopService = async (ctx: BotContext, msg?: string) => {
  return await ctx.reply(msg ?? ctx.t('serverStop'))
}

/**服务异常弹框，弹框失败使用文本消息 */
export const showServerStop = async (ctx: BotContext, msg?: string) => {
  try {
    return await ctx.answerCallbackQuery({
      text: msg ?? ctx.t('serverStop'),
      show_alert: true,
    })
  } catch (error) {
    return await stopService(ctx, msg)
  }
}
/**
 * 如api发生异常，则调用 showServerStop
 * showServerStop先弹出提示，如果弹出不成功则已文本发送
 */
export const apiError = (ctx: BotContext, apiRes: AnyObjetc, onlyCheck?: boolean, msg?: string) => {
  if (!apiRes?.success || apiRes.err != 0) {
    if (!onlyCheck) {
      showServerStop(ctx, msg ?? ctx.t('httpError'))
    }
    return true
  }
  return false
}

/**渲染内容 */
export const display = async (
  ctx: BotContext,
  content: string,
  buttons?: InlineKeyboardButton[][],
  edit?: boolean,
  debug?: boolean,
) => {
  if (ctx.callbackQuery?.id) {
    await ctx.answerCallbackQuery()
  }

  let res
  try {
    if (edit && ctx.message?.message_id == undefined) {
      res = await ctx.editMessageText(content, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: buttons ?? [],
        },
      })
    } else {
      res = await ctx.reply(content, {
        parse_mode: 'HTML',
        reply_to_message_id: edit ? (ctx.message?.message_id ? ctx.message?.message_id : undefined) : undefined,
        reply_markup: {
          inline_keyboard: buttons ?? [],
        },
      })
    }
  } catch (error) {
    console.log(error)
  }

  if (debug) {
    console.log(res)
  }

  ctx.session.lastMessage = {
    chatId: (res as any)?.chat?.id,
    msgId: (res as any)?.message_id,
  }

  // 如果是带有callbackQuery，响应loading
  if (ctx.callbackQuery?.id) {
    await ctx.answerCallbackQuery()
  }
}
/**删除用户回复的消息和上次主动发送的消息 */
export const clearLastMessage = async (ctx: BotContext) => {
  try {
    if (ctx.message?.chat.id && ctx.message?.message_id) {
      deleteMessage(ctx, ctx.message.chat.id, ctx.message.message_id)
    }
    const { chatId, msgId } = ctx.session.lastMessage
    if (chatId && msgId) {
      deleteMessage(ctx, chatId, msgId)
    }
  } catch (error) {
    logger.error('deleteMessage error', { error })
  }
  return true
}
/**删除消息 */
export const deleteMessage = async (ctx: BotContext, chatId: number, msgId: number) => {
  try {
    await ctx.api.deleteMessage(chatId, msgId)
  } catch (error) {
    logger.error('deleteMessage error', { chatId, msgId })
  }
  return true
}
/**设置场景信息 */
// export const setScene = (ctx: BotContext, scene: AnyObjetc) => {
//   ctx.session.scene = { ...scene, createAt: Date.now() }
//   return true
// }

/**重置场景信息 */
export const restSceneInfo = (ctx: BotContext) => {
  ctx.session.scene = {
    name: '',
    router: '',
    params: {},
    store: new Map(),
    createAt: 0,
  }
  return true
}

/**重置请求信息 */
export const restRequest = (ctx: BotContext) => {
  ctx.session.request = { views: [], goto: '', params: {}, homePage: false, replace: false }
  return true
}

/**检测场景是否有效期 60分钟 */
export const checkScene = (ctx: BotContext) => {
  const createAt = ctx.session.scene?.createAt ?? 0
  return createAt >= Date.now() - 60 * 60 * 1000
}

/**解析用户输入消息 */
export const parseInputMessage = (ctx: BotContext) => {
  // const message: string = ctx.session.scene.params?.message
  // const inputType: string = ctx.session.callbackQuery.params?.inputType
  // const success: boolean = message != '' && inputType != '' && ctx.session.scene.store?.size > 0
  const success: boolean = ctx.session.scene.store?.size > 0
  const timeout: boolean = checkScene(ctx)

  return { success, timeout }
}

/** 分页 */
export const pager = (ctx: BotContext, btn: InlineKeyboard, total: number, page: number, router: string) => {
  page = Number(page)
  if (page == 1) {
    btn.text(ctx.t('endPage'), `${router}&page=${total}`)
    btn.text(ctx.t('nextPage'), `${router}&page=${page + 1}`).row()
  } else {
    btn.text(ctx.t('firstPage'), `${router}&page=1`)
    btn.text(ctx.t('endPage'), `${router}&page=${total}`)
    btn.text(ctx.t('prvePage'), `${router}&page=${page - 1}`)
    btn.text(ctx.t('nextPage'), `${router}&page=${page + 1}`).row()
  }
}

export const keyboard = (ctx: BotContext, router: string, text: string) => {
  const btn = new InlineKeyboard()
  const numberList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

  numberList.map(x => {
    if (x % 3 === 0 || x === 0) {
      btn.text(`${x}`, `${router}&text=${text}${x}`).row()
    } else {
      btn.text(`${x}`, `${router}&text=${text}${x}`)
    }
  })

  return btn
}

// 安全密码输入
export const pincode = (ctx: BotContext, params?: AnyObjetc) => {
  let pwd = '',
    msg = ''
  pwd += params?.pwd
  msg += `\r\n<b>${pwd}</b><code>${new Array(7 - pwd.length).join('*')}</code>`
  // msg += `\r\n${new Array(num.length + 1).join("*")}`

  let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
  let buttons = new InlineKeyboard()
  nums.map((e, i) => {
    if (i % 3 == 2 || i == 9) {
      buttons.text(`${e}`, `${params?.router || 'account?m=password'}&pwd=${pwd}${e}`).row()
    } else {
      buttons.text(`${e}`, `${params?.router || 'account?m=password'}&pwd=${pwd}${e}`)
    }
  })
  if (pwd.length == 6) {
    buttons = new InlineKeyboard()
    buttons.text(ctx.t('btn-confirm'), params?.confirm || `account?m=index`)
    buttons.text(ctx.t('btn-cancel'), params?.cancel || `account?m=keyboard`).row()
  } else {
    buttons.text(ctx.t('btn-go-back'), params?.cancel || `account?m=index`)
    buttons.text(ctx.t('btn-reset'), params?.router || `account?m=index`).row()
  }

  return { msg, buttons }
}
