import { AnyObjetc, BotContext } from '@/@types/types'
import {
  SessionVersion,
  apiError,
  apiErrorWithGoback,
  checkScene,
  clearLastMessage,
  compress,
  display,
  keyboard,
  md5,
  restSceneInfo,
  showServerStop,
} from '@/util/helper'
import { InlineKeyboard } from 'grammy'
import { userAPI } from '@/api/user'

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

    const userinfo = ctx.session.userinfo
    const config = ctx.session.config
    const language = config?.language?.find(x => x.code === userinfo?.language)?.lang ?? ''
    const currency = config?.currency.find(x => x.code === userinfo?.currency)

    const rank = userinfo?.rank ?? 1
    const rankStr = rank <= 50 ? '🎖' : rank <= 99 ? '💎' : '👑'
    const msg = ctx.t('settingMsg', {
      uid: userinfo?.openid ?? '',
      rank: `${rankStr}(${rank})`,
      language: language,
      currency: `${currency?.symbol ?? ''}(${currency?.code?.toUpperCase() ?? ''})`,
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
      const btn = new InlineKeyboard()

      // 是否被关联的账号，被关联的账号操作资产转移
      const backup_account = ctx.session.userinfo?.backup_account
      if (backup_account === ctx.session.userinfo?.openid) {
        btn.text(ctx.t('backupCopyAssets'), `/setting/backup?goto=assets&account=${backup_account}`).row()
      } else {
        if (backup_account) {
          // 已设置备用账户
          btn.text(ctx.t('backupRemove'), `/setting/backup?goto=remove&account=${backup_account}`).row()
        } else {
          // 未设置备用账户
          btn.text(ctx.t('backupAdd'), `/setting/backup?goto=add&account=${backup_account}`).row()
        }
      }
      btn.text(ctx.t('goBack'), '/setting?rep=1')
      const msg = ctx.t('backupMsg', {
        status: backup_account ? 1 : 0,
        account: backup_account ?? '',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    remove: async () => {
      const confirm = request.params?.yes
      const account = request.params?.account ?? ''
      if (confirm) {
        const api = await userAPI.settingBackup({ openid: ctx.session.userinfo!.openid, account, remove: true })
        if (apiError(ctx, api)) {
          return
        }
        ctx.session.userinfo!.backup_account = ''
        ctx.session.request.params = {}
        return actions.index()
      }
      const btn = new InlineKeyboard()
      btn.text(ctx.t('confirm'), `/setting/backup?goto=remove&account=${account}&yes=1`)
      btn.text(ctx.t('cancel'), '/setting?rep=1')
      const msg = ctx.t('backupMsg', {
        status: 2,
        account,
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
    add: async () => {
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
          if (!/^\d+$/.test(message)) {
            restSceneInfo(ctx)
            const btn = new InlineKeyboard()
            btn.text(ctx.t('goBack'), '/setting/?rep=1')

            await clearLastMessage(ctx)
            return await display(ctx, ctx.t('invalidInput'), btn.inline_keyboard)
          }
          if (message === ctx.session.userinfo?.openid) {
            restSceneInfo(ctx)
            const btn = new InlineKeyboard()
            btn.text(ctx.t('goBack'), '/setting/?rep=1')

            await clearLastMessage(ctx)
            return await display(ctx, ctx.t('backupEditFail'), btn.inline_keyboard)
          }
          // 跳转操作方法
          ctx.session.scene.params = { account: message }
          ctx.session.request.goto = 'done'
          await clearLastMessage(ctx)
          await BackupView(ctx)
        },
      }
    },
    assets: async () => {
      // 关联的账号
      const account = request.params?.account ?? ''
      const api = await userAPI.assetsTransfer({ openid: ctx.session.userinfo!.openid, account })
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
      const account = ctx.session.scene.params?.account ?? ''
      const api = await userAPI.settingBackup({ openid: ctx.session.userinfo!.openid, account })
      if (apiError(ctx, api, true)) {
        btn.text(ctx.t('goBack'), '/setting?rep=1')
        await display(ctx, api?.msg || ctx.t('httpError'), btn.inline_keyboard)
        return
      }
      restSceneInfo(ctx)
      ctx.session.onMessage = undefined
      ctx.session.userinfo!.backup_account = account

      btn.text(ctx.t('goBack'), '/setting?rep=1')
      const msg = ctx.t('backupAddMsg', {
        step: 1,
        action: account ? 1 : 0,
        account,
      })

      await display(ctx, msg, btn.inline_keyboard)
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
      const pincode = ctx.session.userinfo?.pin_code
      // const status = pincode ? 1 : 0
      if (pincode) {
        // 已设置
        btn.text(ctx.t('pinpCodeEdit'), `/setting/pincode?goto=input&status=1`).row()
      } else {
        // 未设置
        btn.text(ctx.t('pinpCodeAdd'), '/setting/pincode?goto=input&status=0').row()
      }
      btn.text(ctx.t('goBack'), '/setting?rep=1')
      const msg = ctx.t('settingPinCodeMsg', {
        status: pincode ? 1 : 0,
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
      if (length === 4) {
        // status = 1 时页面为要求输入旧密码，下一步则需要再次输入新的密码
        // 所以这一步需要校验旧密码是否正确，然后执行下一步【输入新的密码】
        if (status === 1) {
          request.params.text = ''
          const hash = md5(ctx.session.userinfo?.openid + text + ctx.session.userinfo?.invite_code)
          if (hash !== ctx.session.userinfo?.pin_code) {
            await showServerStop(ctx, ctx.t('pincodeOldFail'))
          } else {
            request.params.status = '0'
          }
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
      const api = await userAPI.settingPinCode({
        openid: ctx.session.userinfo!.openid,
        pin_code: text,
      })
      if (apiError(ctx, api)) {
        return
      }
      ctx.session.userinfo!.pin_code = api?.data?.pin_code ?? ''

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
  const langList = ctx.session.config?.language ?? []

  const actions: AnyObjetc = {
    index: async () => {
      const btn = new InlineKeyboard()
      const version = SessionVersion(ctx)
      let code = ctx.session.userinfo?.language ?? ''
      if (request.params?.v) {
        code = request.params?.code ?? ''
        const api = await userAPI.settingLang({ openid: ctx.session.userinfo!.openid, lang_code: code ?? '' })
        if (apiError(ctx, api)) {
          return
        }
        // await ctx.answerCallbackQuery({
        //   text: 'ok',
        //   show_alert: true,
        // })
      }

      let lang = ''
      langList.map(x => {
        let text = x.lang
        if (x.code === code) {
          lang = x.lang
          text += ` ✅`
        }
        btn.text(text, `/setting/lang?goto=index&code=${x.code}&v=${version}`).row()
      })
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      const msg = ctx.t('settinglangMsg', {
        lang: lang,
      })

      await display(ctx, msg, btn.inline_keyboard, ctx.session.request.params?.rep ?? 1)
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
      const version = SessionVersion(ctx)
      let code = ctx.session.userinfo?.currency ?? ''
      if (request.params?.v) {
        code = request.params?.code
        const api = await userAPI.settingCurrency({ openid: ctx.session.userinfo!.openid, currency: code })
        if (apiError(ctx, api)) {
          return
        }
        // await ctx.answerCallbackQuery({
        //   text: 'ok',
        //   show_alert: true,
        // })
      }

      let currencyName = ''
      currency.map(x => {
        let text = `${x.symbol}(${x.code.toUpperCase()})`
        if (code === x.code) {
          currencyName = text
          text += ` ✅`
        }
        btn.text(text, `/setting/currency?goto=index&code=${x.code}&v=${version}`).row()
      })
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      const msg = ctx.t('settingCurrencytMsg', {
        currency: currencyName,
      })

      await display(ctx, msg, btn.inline_keyboard, ctx.session.request.params?.rep ?? 1)
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
