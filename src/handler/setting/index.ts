import { AnyObjetc, BotContext } from '@/@types/types'
import {
  apiError,
  checkScene,
  clearLastMessage,
  compress,
  display,
  keyboard,
  restSceneInfo,
  showServerStop,
} from '@/util/helper'
import { InlineKeyboard } from 'grammy'
import { settingAPI } from '@/api/setting'

export const SettingView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    restSceneInfo(ctx)
    const btn = new InlineKeyboard()

    btn.text(ctx.t('settingBackup'), compress.encode('/setting/backup'))
    btn.text(ctx.t('settingPinCode'), '/setting/pincode').row()
    btn.text(ctx.t('settingLang'), '/setting/lang')
    btn.text(ctx.t('settingCurrency'), '/setting/currency').row()
    btn.text(ctx.t('goBack'), '/start?rep=1')

    const lang = ctx.session.config?.lang?.find(x => x.code === ctx.session.userinfo!.lang)
    const currency = ctx.session.config?.currency.find(x => x.code === ctx.session.userinfo!.currency)
    const vip = ctx.session.userinfo!.vip
    const vipSymbol = vip <= 50 ? '🎖' : vip <= 99 ? '💎' : '👑'
    const msg = ctx.t('settingMsg', {
      uid: ctx.session.userinfo!.id.toString(),
      vip: `${vip}${vipSymbol}`,
      lang: lang?.lang ?? '',
      currency: `${currency?.symbol}(${currency?.code})`,
    })

    await display(ctx, msg, btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

const BackupView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene

  const actions: AnyObjetc = {
    index: async () => {
      restSceneInfo(ctx)
      const api = await settingAPI.backup({ uid: ctx.session.userinfo!.id })
      if (apiError(ctx, api)) {
        return
      }
      const account = api.data?.account
      const btn = new InlineKeyboard()

      // 是否被关联的账号，被关联的账号操作资产转移
      if (account?.id && account?.id === ctx.session.userinfo?.id) {
        btn.text(ctx.t('backupCopyAssets'), `/setting/backup?goto=assets&mainId=${account?.id}`).row()
      } else {
        if (account?.id) {
          // 已设置备用账户
          btn.text(ctx.t('backupEdit'), `/setting/backup?goto=add&account=${account?.id}`).row()
        } else {
          // 未设置备用账户
          btn.text(ctx.t('backupAdd'), `/setting/backup?goto=add&account=${account?.id}`).row()
        }
      }
      btn.text(ctx.t('goBack'), '/setting?rep=1')
      const msg = ctx.t('backupMsg', {
        status: account?.id ? 1 : 0,
        account: account?.username ?? '',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    add: async () => {
      ctx.session.scene = {
        name: 'BackupView',
        router: '',
        createAt: Date.now(),
        store: new Map(),
        params: {
          username: '',
        },
      }
      const account = request.params?.account ?? ''
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/setting?rep=1')
      const msg = ctx.t('backupAddMsg', {
        step: 0,
        action: account ? 1 : 0,
      })

      await display(ctx, msg, btn.inline_keyboard, true)
      ctx.session.onMessage = {
        name: '',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()
          if (!/^@\w+$/.test(message)) {
            restSceneInfo(ctx)
            const btn = new InlineKeyboard()
            btn.text(ctx.t('goBack'), '/setting/?rep=1')

            await clearLastMessage(ctx)

            return await display(ctx, msg, btn.inline_keyboard)
          }
          // 跳转操作方法
          ctx.session.scene.params['username'] = message
          ctx.session.request.goto = 'done'
          await clearLastMessage(ctx)
          await BackupView(ctx)
        },
      }
    },
    assets: async () => {
      // 关联的账号
      const mainId = request.params?.mainId ?? ''
      const api = await settingAPI.assets({ uid: ctx.session.userinfo!.id, main_id: mainId })
      if (apiError(ctx, api)) {
        return
      }

      return await ctx.answerCallbackQuery({
        text: 'ok',
        show_alert: true,
      })
    },
    done: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      const account = ctx.session.scene.params?.username ?? ''
      const msg = ctx.t('backupAddMsg', {
        step: 1,
        action: account ? 1 : 0,
        account,
      })

      await display(ctx, msg, btn.inline_keyboard)
      restSceneInfo(ctx)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
export const PinCodeView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene

  const actions: AnyObjetc = {
    index: async () => {
      const btn = new InlineKeyboard()
      const pincode = ctx.session.userinfo?.pincode ?? false
      const status = pincode ? 1 : 0
      if (status) {
        // 已设置
        btn.text(ctx.t('pinpCodeEdit'), `/setting/pincode?goto=input&status=1`).row()
      } else {
        // 未设置
        btn.text(ctx.t('pinpCodeAdd'), '/setting/pincode?goto=input&status=0').row()
      }
      btn.text(ctx.t('goBack'), '/setting?rep=1')
      const msg = ctx.t('settingPinCodeMsg', {
        status: status,
      })

      await display(ctx, msg, btn.inline_keyboard, true)
      ctx.session.scene = {
        name: 'PinCodeView',
        router: '',
        createAt: Date.now(),
        store: new Map(),
        params: {
          oldPin: '',
        },
      }
    },
    // 输入密码
    input: async () => {
      const status = Number(request.params?.status ?? '0')
      const text = request.params?.text ?? ''
      const length = text.length
      if (length === 6) {
        // edit = 1 时页面为要求输入旧密码，下一步则需要再次输入新的密码
        // 所以这一步需要校验旧密码是否正确，然后执行下一步【输入新的密码】
        if (status === 1) {
          ctx.session.scene.params['oldPin'] = text
          request.params.text = ''
          request.params.status = '0'
          await actions.input()
        } else {
          const btn = new InlineKeyboard()
          btn.text(ctx.t('confirm'), `/setting/pincode?goto=done&text=${text}`)
          btn.text(ctx.t('cancel'), '/setting/pincode?rep=1')

          await display(ctx, ctx.t('pincodeConfirm', { text, step: 0 }), btn.inline_keyboard, true)
        }
      } else {
        const msg = ctx.t('pincodeInputMsg', {
          length,
          text,
          status,
        })

        // /setting/pinpwd?goto=add&input=123
        const btn = keyboard(ctx, `/setting/pincode?goto=input&status=${status}`, text)
        btn.text(ctx.t('reset'), `/setting/pincode?goto=input&status=${status}`)
        btn.text(ctx.t('cancel'), '/setting/pincode?rep=1')

        await display(ctx, msg, btn.inline_keyboard, true)
      }
    },
    done: async () => {
      const text = request.params?.text
      const old = ctx.session.scene.params?.oldPin
      const api = await settingAPI.pincode({
        uid: ctx.session.userinfo!.id,
        pwd: text,
        old,
      })
      if (apiError(ctx, api, true)) {
        if (api?.success === undefined || api?.msg === undefined) {
          await showServerStop(ctx, ctx.t('httpError'))
        }
        // pincodeOldFail / pincodeFail
        await showServerStop(ctx, ctx.t(api?.msg || 'httpError'))
        await actions.index()
        return
      }

      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/setting/pincode?rep=1')

      await display(ctx, ctx.t('pincodeConfirm', { text, step: 1 }), btn.inline_keyboard, true)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
const LangView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const langList = ctx.session.config?.lang ?? []

  const actions: AnyObjetc = {
    index: async () => {
      const btn = new InlineKeyboard()
      const code = ctx.session.userinfo?.lang
      let lang = ''
      langList.map(x => {
        let text = x.lang
        if (x.code === code) {
          lang = x.lang
          text += ` ✅`
        }
        btn.text(text, `/setting/lang?goto=done&code=${x.code}`).row()
      })
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      const msg = ctx.t('settinglangMsg', {
        lang: lang,
      })

      await display(ctx, msg, btn.inline_keyboard, ctx.session.request.params?.rep ?? 1)
    },
    done: async () => {
      const code = ctx.session.request.params?.code
      const lang = ctx.session.userinfo?.lang
      if (lang && lang != code) {
        const api = await settingAPI.lang({ uid: ctx.session.userinfo!.id, code: code })
        if (apiError(ctx, api)) {
          return
        }
        ctx.session.userinfo!.lang = code
        ctx.session.request.params['rep'] = 1
        await ctx.answerCallbackQuery({
          text: 'ok',
          show_alert: true,
        })
        await actions.index()
      } else {
        await ctx.answerCallbackQuery({
          text: 'ok',
          show_alert: true,
        })
      }
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
const CurrencyView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const currency = ctx.session.config?.currency ?? []

  const actions: AnyObjetc = {
    index: async () => {
      const btn = new InlineKeyboard()
      const code = ctx.session.userinfo?.currency ?? ''
      let currencyName = ''
      currency.map(x => {
        let text = `${x.symbol}(${x.code})`
        if (code === x.code) {
          currencyName = text
          text += ` ✅`
        }
        btn.text(text, `/setting/currency?goto=done&code=${x.code}`).row()
      })
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      const msg = ctx.t('settingCurrencytMsg', {
        currency: currencyName,
      })

      if (request.params?.fiat != undefined) {
        await ctx.answerCallbackQuery({
          text: 'ok',
          show_alert: true,
        })
      }

      await display(ctx, msg, btn.inline_keyboard, ctx.session.request.params?.rep ?? 1)
    },
    done: async () => {
      const code = ctx.session.request.params?.code ?? ''
      const currency = ctx.session.userinfo?.currency

      if (code !== currency) {
        const api = await settingAPI.currency({ uid: ctx.session.userinfo!.id, code: code })
        if (apiError(ctx, api)) {
          return
        }
        ctx.session.userinfo!.currency = code
        ctx.session.request.params['rep'] = 1
        await ctx.answerCallbackQuery({
          text: 'ok',
          show_alert: true,
        })
        return await actions.index()
      }
      return await ctx.answerCallbackQuery()
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
const views: AnyObjetc = {
  backup: BackupView,
  pincode: PinCodeView,
  lang: LangView,
  currency: CurrencyView,
}
