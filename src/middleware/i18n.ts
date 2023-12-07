import { Fluent } from '@moebius/fluent'
import { useFluent } from '@grammyjs/fluent'
import { BotContext, MyBot, Tg } from '@/@types/types'
import { Context } from 'grammy'
// import { MyBot, MyBotInstance } from '@/types'

const fluent = new Fluent()
export const initI18n = async () => {
  // await fluent.addTranslation({
  //   locales: ['zhCN', 'enUS'],
  //   filePath: [`${__dirname}/../i18n/zhCN.ftl`, `${__dirname}/../i18n/enUS.ftl`],
  //   bundleOptions: {
  //     useIsolating: false,
  //   },
  // })

  await fluent.addTranslation({
    locales: 'cn',
    filePath: `${__dirname}/../i18n/zhCN.ftl`,
    bundleOptions: {
      useIsolating: false,
    },
    isDefault: true,
  })
  await fluent.addTranslation({
    locales: 'en',
    filePath: `${__dirname}/../i18n/enUS.ftl`,
    bundleOptions: {
      useIsolating: false,
    },
    // isDefault: true,
  })

  return useFluent({ fluent, localeNegotiator: myLocaleNegotiator })
  // return useFluent({ fluent, defaultLocale: 'en' })
}

async function myLocaleNegotiator(context: BotContext) {
  return context.session.userinfo?.language ?? 'cn'
}
