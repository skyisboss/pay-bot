import { Bot, Context, session, SessionFlavor } from 'grammy'
import { ScenesFlavor } from 'grammy-scenes'
import type { ParseModeFlavor } from '@grammyjs/parse-mode'
import { FluentContextFlavor } from '@grammyjs/fluent'
import { I18n, I18nFlavor } from '@grammyjs/i18n'

declare namespace Tg {
  type MyBot = ParseModeFlavor<Context & FluentContextFlavor & SessionFlavor<MySession>>
  type BotInstance = Bot<MyBot>

  interface AnyObjetc {
    [k: string]: any
  }

  interface CallbackQuery {
    /**视图 */
    views: string[]
    /**参数 */
    params: AnyObjetc
    /**是否首页 */
    homePage: boolean
    /**是否替换当前视图 */
    replace: boolean
    /**控制器 */
    action: string
  }
}

/**bot */
type BotContext = ParseModeFlavor<Context & FluentContextFlavor & SessionFlavor<BotSession>>
type MyBot = Bot<BotContext>

/**session */
interface BotSession {
  /**临时存储 */
  store: AnyObjetc
  /**
   * 存储机器人发送的最后一条信息
   * 这样就可以对这条消息进行编辑、删除等操作
   */
  lastMessage: LastMessage

  /**
   * 用户信息
   */
  userinfo?: Userinfo

  /**
   * 解析后的按钮请求
   */
  request: CallbackRequest

  /**
   * 场景信息
   */
  scene: SceneInfo
  /**
   * 每个session绑定的场景信息
   */
  scenes?: {
    /**名称 */
    name: string
    /**参数 */
    params: AnyObjetc
    /**过期时间 */
    expired: number
    /**回调 */
    callback: (ctx: BotContext) => Promise<void>
  }

  /**
   * 监听用户输入回调
   */
  onMessage?: {
    /**回调名称，用于debug */
    name: string
    /**创建时间，用于检测是否过期 */
    time: number
    /**回调方法 */
    call: (ctx: BotContext) => Promise<void>
  }

  /**配置信息 */
  config?: ApiResult.Config
}

/**解析后的按钮请求 callback_query */
type CallbackRequest = {
  /**视图 索引0是主视图 其他为子视图 */
  views: string[]
  /**将要执行的方法，默认执行 index 入口方法 */
  goto: string
  /**参数 */
  params: AnyObjetc
  /**是否首页 */
  homePage: boolean
  /**是否替换原内容方式来渲染输出 */
  replace: boolean
}

/**用户信息 */
interface Userinfo extends ApiResult.Userinfo {}

type LastMessage = {
  chatId: number
  msgId: number
}

type SceneInfo = {
  // 场景名称
  name: string
  // 路由信息
  router: string
  // 参数
  params: AnyObjetc
  /**存储 */
  store: Map<string, any>
  // 时间戳
  createAt: number
}

type RouterInfo = {
  view: string
  method: string
  action: string
}

/**空对象*/
type AnyObjetc = {
  [k: string]: any
}
