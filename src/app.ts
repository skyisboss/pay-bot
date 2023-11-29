import dotenv from 'dotenv'
import { Bot } from 'grammy'
import { run } from '@grammyjs/runner'
// import { MyBot } from './types'
import { useMiddleware } from './middleware'
import { useHandler } from './handler'
import { initLogger } from './logger'
import { BotContext } from './@types/types'

dotenv.config()
export const bot = new Bot<BotContext>(process.env.BOT_TOKEN || '')

/*
const runApp = async () => {
  // 0.注册中间件
  await useMiddleware(bot);
  // 1.注册处理方法
  await useHandler(bot);
  // 2.启动
  const runner = run(bot);
  const stop = () => runner.isRunning() && runner.stop();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  console.log("app runing");
};
runApp();
*/
;(async () => {
  initLogger()
  // 0.注册中间件
  await useMiddleware(bot)
  // 1.注册处理方法
  await useHandler(bot)
  // 2.启动
  const runner = run(bot)
  const stop = () => runner.isRunning() && runner.stop()
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
  console.log('app runing')
})()
