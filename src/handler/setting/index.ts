import { AnyObjetc, BotContext } from '@/@types/types'
import { checkScene, clearLastMessage, display, keyboard, restSceneInfo } from '@/util/helper'
import { InlineKeyboard } from 'grammy'
import { WithdrawView } from '../wallet'
import { settingAPI } from '@/api/setting'

export const SettingView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    restSceneInfo(ctx)
    const btn = new InlineKeyboard()
    btn.text(ctx.t('settingBackup'), '/setting/backup')
    btn.text(ctx.t('settingPinPwd'), '/setting/pinpwd').row()
    btn.text(ctx.t('settingLang'), '/setting/lang')
    btn.text(ctx.t('settingFiat'), '/setting/fiat').row()
    btn.text(ctx.t('goBack'), '/start?rep=1')

    const msg = ctx.t('settingMsg', {
      uid: ctx.session.userinfo!.id.toString(),
      vip: ctx.session.userinfo!.vip.toString(),
      lang: ctx.session.userinfo!.lang,
      fiat: '￥(CNY)',
    })

    await display(ctx, msg, btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

export const BackupView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene

  const actions: AnyObjetc = {
    index: async () => {
      const res = await settingAPI.backup({ uid: ctx.session.userinfo!.id })
      if (!res.success) {
        return await ctx.answerCallbackQuery({
          text: ctx.t('serverStop'),
          show_alert: true,
        })
      }
      const btn = new InlineKeyboard()
      const status = res?.data?.account ? 1 : 0
      if (status) {
        // 已设置安全账户
        btn.text(ctx.t('backupEdit'), `/setting/backup?goto=add`).row()
      } else {
        // 未设置安全账户
        btn.text(ctx.t('backupAdd'), '/setting/backup?goto=add').row()
      }
      btn.text(ctx.t('goBack'), '/setting?rep=1')
      const msg = ctx.t('backupMsg', {
        status: status,
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    add: async () => {
      ctx.session.scene = {
        name: 'WithdrawView',
        router: '/setting/backup?goto=getInput&inputType=username',
        createAt: Date.now(),
        store: new Map(),
        params: {
          username: '',
        },
      }
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), '/setting?rep=1')

      await display(ctx, ctx.t('backupAddMsg'), btn.inline_keyboard, true)
    },
    getInput: async () => {
      if (!checkScene(ctx)) {
        restSceneInfo(ctx)
        return await display(ctx, ctx.t('sessionTimeOut'))
      }

      const inputType = request.params?.inputType
      const message = scene.params?.[inputType]
      if (inputType == 'username' && message) {
        ctx.session.scene.params.username = message
        ctx.session.request = {
          ...ctx.session.request,
          ...{
            goto: 'done',
          },
        }

        await clearLastMessage(ctx)
        await BackupView(ctx)
      } else {
        await ctx.answerCallbackQuery({
          text: '无效的输入',
          show_alert: true,
        })
      }
    },
    done: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      await display(ctx, ctx.t('backupAddSuccess'), btn.inline_keyboard)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
export const PinpwdView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene

  const actions: AnyObjetc = {
    index: async () => {
      const res = await settingAPI.pinpwd({ uid: ctx.session.userinfo!.id })
      if (!res.success) {
        return await ctx.answerCallbackQuery({
          text: ctx.t('serverStop'),
          show_alert: true,
        })
      }
      const btn = new InlineKeyboard()
      const status = res?.data?.pinpwd ? 1 : 0
      if (status) {
        // 已设置
        btn.text(ctx.t('pinpwdEdit'), `/setting/pinpwd?goto=input&edit=1`).row()
      } else {
        // 未设置
        btn.text(ctx.t('pinpwdAdd'), '/setting/pinpwd?goto=input&edit=0').row()
      }
      btn.text(ctx.t('goBack'), '/setting?rep=1')
      const msg = ctx.t('pinpwdMsg', {
        status: status,
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    // 输入密码
    input: async () => {
      const text = request.params?.text ?? ''
      const edit = parseInt(request.params?.edit ?? '0')
      const length = text.length
      if (length === 6) {
        // edit = 1 时页面为要求输入旧密码，下一步则需要再次输入新的密码
        // 所以这一步需要校验旧密码是否正确，然后执行下一步【输入新的密码】
        if (edit === 1) {
          request.params.text = ''
          request.params.edit = '0'
          return actions.input()
        } else {
          const btn = new InlineKeyboard()
          btn.text(ctx.t('confirm'), `/setting/pinpwd?goto=done&text=${text}`)
          btn.text(ctx.t('cancel'), '/setting?rep=1')

          await display(ctx, ctx.t('pinpwdConfirm', { text }), btn.inline_keyboard, true)
        }
      } else {
        const msg = ctx.t('pinpwdInputMsg', {
          length,
          text,
          edit,
        })

        // /setting/pinpwd?goto=add&input=123
        const btn = keyboard(ctx, `/setting/pinpwd?goto=input&edit=${edit}`, text)
        btn.text(ctx.t('reset'), `/setting/pinpwd?goto=input&edit=${edit}`)
        btn.text(ctx.t('cancel'), '/setting?rep=1')

        await display(ctx, msg, btn.inline_keyboard, true)
      }
    },
    done: async () => {
      const text = request.params?.text
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      await display(ctx, ctx.t('pinpwdAddSuccess'), btn.inline_keyboard, true)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
export const LangView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const langList = ['English', '简体中文']

  const actions: AnyObjetc = {
    index: async () => {
      const currIndex = 1
      const btn = new InlineKeyboard()
      langList.map((x, index) => {
        const lang = `${x} ${index === currIndex ? '✅' : ''}`
        btn.text(lang, `/setting/lang?goto=done&lang=${index}`).row()
      })
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      const msg = ctx.t('langMsg', {
        lang: langList?.[currIndex],
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    done: async () => {
      const currIndex = Number(request.params?.lang ?? 1)
      const btn = new InlineKeyboard()
      langList.map((x, index) => {
        const lang = `${x} ${index === currIndex ? '✅' : ''}`
        btn.text(lang, `/setting/lang?goto=done&lang=${index}`).row()
      })
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      const msg = ctx.t('langMsg', {
        lang: langList?.[currIndex],
      })

      await ctx.answerCallbackQuery({
        text: 'ok',
        show_alert: true,
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
export const FiatView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const fiatList = ['$(USD)', '￥(CNY)', '₱(PHP)']

  const actions: AnyObjetc = {
    index: async () => {
      const fiat = Number(request.params?.fiat ?? 0)
      const currIndex = fiat
      const btn = new InlineKeyboard()
      fiatList.map((x, index) => {
        if (index === currIndex) {
          btn.text(`${x} ✅`, `/setting/fiat?goto=index`).row()
        } else {
          btn.text(x, `/setting/fiat?goto=index&fiat=${index}`).row()
        }
      })
      btn.text(ctx.t('goBack'), '/setting?rep=1')

      const msg = ctx.t('fiatMsg', {
        fiat: fiatList?.[currIndex],
      })

      if (request.params?.fiat != undefined) {
        await ctx.answerCallbackQuery({
          text: 'ok',
          show_alert: true,
        })
      }

      await display(ctx, msg, btn.inline_keyboard, true)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
const views: AnyObjetc = {
  backup: BackupView,
  pinpwd: PinpwdView,
  lang: LangView,
  fiat: FiatView,
}
