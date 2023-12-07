import { AnyObjetc, BotContext, CallbackRequest, RouterInfo, Tg } from '@/@types/types'
import { logger } from '@/logger'
import { InitScene } from '@/middleware/session'
// import { MyBot, RouterInfo } from '@/types'
import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { math_div, math_multiply } from './math'
import url from 'url'
import crypto from 'crypto'

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
  const uri = 'http://hostname.com' + data
  const parse = url.parse(uri, true)
  const pathname = parse.pathname?.split('/').filter((x: any) => !!x) ?? []
  const params = parse.query

  const res = {
    views: pathname,
    params: params,
    homePage: pathname.length === 1,
    replace: params?.rep ?? false,
    goto: params?.goto ?? 'index',
  } as CallbackRequest

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
      showServerStop(ctx, msg ?? apiRes?.msg ?? ctx.t('httpError'))
    }
    return true
  }
  return false
}
export const apiErrorWithGoback = (ctx: BotContext, apiRes: AnyObjetc, goback: string) => {
  if (!apiRes?.success || apiRes.err != 0) {
    try {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), goback)
      display(ctx, apiRes?.msg ?? ctx.t('serverStop'), btn.inline_keyboard)
    } catch (error) {
      //
    }
  }
  return false
}

export const md5 = (content: string) => {
  let md5 = crypto.createHash('md5')
  return md5.update(content).digest('hex') // 把输出编程16进制的格式
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

/**解析币种 */
export const getChainSymbol = (ctx: BotContext, token: string) => {
  const blockchain = ctx.session.config?.blockchain ?? []
  const chain = blockchain.find(x => x.token === token)
  if (chain === undefined) {
    return
  }
  return `${token.toUpperCase()} · ${chain?.symbol?.toUpperCase()}`
}

/**设置session版本, 默认累计+1 */
export const SessionVersion = (ctx: BotContext, version = 1) => {
  if (version <= 0) {
    ctx.session.version = 0
  } else {
    ctx.session.version += version
  }

  return ctx.session.version
}

/**输入验证不通过的无效数据，返回信息提示 */
export const invalidInput = async (ctx: BotContext, backRouter: string, msg?: string) => {
  restSceneInfo(ctx)
  const btn = new InlineKeyboard()
  btn.text(ctx.t('goBack'), backRouter)

  await clearLastMessage(ctx)
  return await display(ctx, msg ?? ctx.t('invalidInput'), btn.inline_keyboard)
}

/**字符串加密压缩*/
export const compress = {
  /**加密 */
  // @ts-ignore
  encode: strNormalString => {
    return strNormalString

    console.log(' 压缩前长度： ' + strNormalString.length)
    var strCompressedString = ''
    var ht = new Array()
    for (i = 0; i < 128; i++) {
      ht[i] = i
    }

    var used = 128
    var intLeftOver = 0
    var intOutputCode = 0
    var pcode = 0
    var ccode = 0
    var k = 0

    for (var i = 0; i < strNormalString.length; i++) {
      ccode = strNormalString.charCodeAt(i)
      k = (pcode << 8) | ccode
      if (ht[k] != null) {
        pcode = ht[k]
      } else {
        intLeftOver += 12
        intOutputCode <<= 12
        intOutputCode |= pcode
        pcode = ccode
        if (intLeftOver >= 16) {
          strCompressedString += String.fromCharCode(intOutputCode >> (intLeftOver - 16))
          intOutputCode &= Math.pow(2, intLeftOver - 16) - 1
          intLeftOver -= 16
        }
        if (used < 4096) {
          used++
          ht[k] = used - 1
        }
      }
    }

    if (pcode != 0) {
      intLeftOver += 12
      intOutputCode <<= 12
      intOutputCode |= pcode
    }

    if (intLeftOver >= 16) {
      strCompressedString += String.fromCharCode(intOutputCode >> (intLeftOver - 16))
      intOutputCode &= Math.pow(2, intLeftOver - 16) - 1
      intLeftOver -= 16
    }

    if (intLeftOver > 0) {
      intOutputCode <<= 16 - intLeftOver
      strCompressedString += String.fromCharCode(intOutputCode)
    }

    console.log(strCompressedString + ' 压缩后长度： ' + strCompressedString.length)
    return strCompressedString
  },
  /**解密 */
  // @ts-ignore
  decode: strCompressedString => {
    return strCompressedString

    var strNormalString = ''
    var ht = new Array()

    for (i = 0; i < 128; i++) {
      ht[i] = String.fromCharCode(i)
    }

    var used = 128
    var intLeftOver = 0
    var intOutputCode = 0
    var ccode = 0
    var pcode = 0
    var key = 0

    for (var i = 0; i < strCompressedString.length; i++) {
      intLeftOver += 16
      intOutputCode <<= 16
      intOutputCode |= strCompressedString.charCodeAt(i)

      while (1) {
        if (intLeftOver >= 12) {
          ccode = intOutputCode >> (intLeftOver - 12)
          if (typeof (key = ht[ccode]) != 'undefined') {
            strNormalString += key
            if (used > 128) {
              // @ts-ignore
              ht[ht.length] = ht[pcode] + key.substr(0, 1)
            }
            pcode = ccode
          } else {
            key = ht[pcode] + ht[pcode].substr(0, 1)
            strNormalString += key
            // @ts-ignore
            ht[ht.length] = ht[pcode] + key.substr(0, 1)
            pcode = ht.length - 1
          }

          used++
          intLeftOver -= 12
          intOutputCode &= Math.pow(2, intLeftOver) - 1
        } else {
          break
        }
      }
    }
    console.log('解压缩后长度：' + strNormalString.length)
    return strNormalString
  },
}

export const WeiToEth = (amount: number, decimals: number) => {
  return math_div(amount, 10 ** decimals)
}
export const EthToWei = (amount: number, decimals: number) => {
  return math_multiply(amount, 10 ** decimals)
}
