// import { MySession } from '@/types'
import { BotSession } from '@/@types/types'
import { Context, session } from 'grammy'
// 为用户-聊天组合存储数据。 https://grammy.dev/zh/plugins/session
const getSessionKey = (ctx: Context) => {
  // if (ctx.from && ctx.chat) {
  //   const fromId = ctx.from.id
  //   const chatId = ctx.chat.id

  //   return `${fromId}:${chatId}`
  // }
  const fromId = ctx.from?.id ?? ''
  const chatId = ctx.chat?.id ?? ''
  return `${fromId}:${chatId}`
}

export const InitScene = {
  name: '',
  router: '',
  store: new Map(),
  params: {},
  createAt: 0,
}
const initial = () => {
  return {
    store: {},
    userinfo: {},
    lastMessage: {},
    request: {},
    scene: {},
    onMessage: undefined,
    scenes: undefined,
  } as BotSession
}
export const initSession = () => {
  return session({
    initial,
    getSessionKey,
  })
}
