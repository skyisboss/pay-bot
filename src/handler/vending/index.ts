import { AnyObjetc, BotContext } from '@/@types/types'
import { ShopInfo, vendingAPI } from '@/api/vending'
import {
  SessionVersion,
  apiError,
  checkScene,
  clearLastMessage,
  display,
  invalidInput,
  pager,
  restSceneInfo,
  showServerStop,
} from '@/util/helper'
import { format } from 'date-fns'
import { InlineKeyboard } from 'grammy'

export const VendingView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    restSceneInfo(ctx)
    let msg = ''
    const btn = new InlineKeyboard()
    const vendingStatus = ctx.session.userinfo?.vending ?? 0
    if (vendingStatus) {
      const api = await vendingAPI.index({ openid: ctx.session.userinfo!.openid })
      if (apiError(ctx, api)) {
        return
      }

      btn.text(ctx.t('vendingManage'), '/vending/manage?goto=index')
      btn.text(ctx.t('vendingPublish'), '/vending/manage?goto=add').row()
      btn.text(ctx.t('vendingSetting'), '/vending/setting?goto=index').row()
      btn.text(ctx.t('goBack'), '/start?rep=1')
      msg = ctx.t('vendingHomeMsg', {
        count1: api.data?.goods_count ?? 0,
        count2: api.data?.sales_count ?? 0,
        trc20: api.data?.balance?.trc20 ?? 0,
        erc20: api.data?.balance?.erc20 ?? 0,
        bep20: api.data?.balance?.bep20 ?? 0,
        link: api.data?.link ?? '',
        status: api.data?.status ?? -1,
      })
    } else {
      btn.text(ctx.t('vendingCreate'), '/vending/manage?goto=create').row()
      btn.text(ctx.t('goBack'), '/start?rep=1')
      msg = ctx.t('vendingMsg')
    }

    await display(ctx, msg, btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

const ManageView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene

  /**解析输入的商品内容 */
  const parseInputGoods = (message: string) => {
    const arr = message.split(/\n/g) as any[]
    const regs = {
      title: new RegExp(`(?<=${ctx.t('vendingTextTitle')}=\\[)(.+?)(?=\\])`, 'g'),
      price: new RegExp(`(?<=${ctx.t('vendingTextPrice')}=\\[)(.+?)(?=\\])`, 'g'),
      desc: new RegExp(`(?<=${ctx.t('vendingTextDesc')}=\\[)(.+?)(?=\\])`, 'g'),
      kami: new RegExp(`(?<=${ctx.t('vendingTextKami')}=\\[)(.+?)(?=\\])`, 'g'),
    } as { [k: string]: RegExp }
    const result = {} as AnyObjetc
    for (let index = 0; index < arr.length; index++) {
      const item = arr[index]
      Object.keys(regs).map(x => {
        const pattern = regs[x]
        if (pattern.test(item)) {
          result[x] = RegExp.$1
        }
      })
    }

    return result
  }

  const actions: AnyObjetc = {
    index: async () => {
      ctx.session.onMessage = undefined
      const page = request.params?.page || 1
      const api = await vendingAPI.goods({ openid: ctx.session.userinfo!.openid, page: page })
      if (!api?.success || !api?.data) {
        return await showServerStop(ctx)
      }

      const btn = new InlineKeyboard()
      ;(api.data?.rows ?? []).map(x => {
        btn.text(x.title, `/vending/manage?goto=detail&id=${x.id}&page=${page}`).row()
      })
      const totalItem = api?.data?.total ?? 0
      const pageSize = api?.data?.size ?? 5
      const totalPage = Math.ceil(totalItem / pageSize)
      pager(ctx, btn, totalPage, page, `/vending/manage?goto=index`)
      btn.text(ctx.t('goBack'), '/vending?rep=1')

      const msg = ctx.t('vendingManageMsg', {
        name: '',
        index: 0,
      })
      const pageInfo = ctx.t('pageInfo', {
        currPage: page,
        totalPage: totalPage,
      })
      await display(ctx, msg + `\r\n\r\n` + pageInfo, btn.inline_keyboard, true)
    },
    create: async () => {
      const api = await vendingAPI.create({ openid: ctx.session.userinfo!.openid })
      if (apiError(ctx, api)) {
        return
      }
      await ctx.answerCallbackQuery({
        text: ctx.t('vendingSettingSuccess'),
        show_alert: true,
      })
      ctx.session.request.params['goto'] = ''
      ctx.session.request.homePage = true
      ctx.session.userinfo!['vending'] = 1
      return await VendingView(ctx)
    },
    add: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), `/vending`)
      await display(ctx, ctx.t('vendingGoodsMsg', { step: 0, action: 0 }), btn.inline_keyboard, true)
      ctx.session.onMessage = {
        name: 'input-goods',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()

          // 解析内容
          const result = parseInputGoods(message)
          // 输入数据不合法
          if (Object.keys(result).length != 4) {
            return await invalidInput(ctx, '/vending')
          }
          // 价格不能为0, 这里暂时不严重，留给后端处理
          //   const amount = parseFloat(ret?.price ?? 0)
          //   if (!ret?.price || Number.isNaN(amount) || amount <= 0) {
          //     return await invalidInput(ctx, '/vending', ctx.t('vendingPriceFail'))
          //   }

          ctx.session.request.views[1] = 'manage'
          ctx.session.request.goto = 'review'
          ctx.session.scene.params = { ...result, actionType: 0 }

          await clearLastMessage(ctx)
          await ManageView(ctx)
        },
      }
    },
    edit: async () => {
      const id = request.params?.id || 0
      const page = request.params?.page || 1
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), `/vending/manage?goto=detail&id=${id}&page=${page}`)

      const api = await vendingAPI.detail({ openid: ctx.session.userinfo!.openid, id })
      if (apiError(ctx, api)) {
        return
      }
      const msg = ctx.t('vendingGoodsMsg', {
        title: api.data?.title ?? '',
        price: api.data?.price ?? '',
        desc: api.data?.describe ?? '',
        kami: api.data?.content ?? '',
        step: 1,
        action: 1,
      })
      await display(ctx, msg, btn.inline_keyboard, true)
      ctx.session.onMessage = {
        name: 'input-goods',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()

          // 解析内容
          const result = parseInputGoods(message)
          // 输入数据不合法
          if (Object.keys(result).length != 4) {
            return await invalidInput(ctx, '/vending')
          }

          // 价格不能为0, 这里暂时不严重，留给后端处理
          //   const amount = parseFloat(ret?.price ?? 0)
          //   if (!ret?.price || Number.isNaN(amount) || amount <= 0) {
          //     return await invalidInput(ctx, '/vending', ctx.t('vendingPriceFail'))
          //   }

          ctx.session.request.views[1] = 'manage'
          ctx.session.request.goto = 'review'
          result['id'] = id
          ctx.session.scene.params = { ...result, actionType: 1 }

          await clearLastMessage(ctx)
          await ManageView(ctx)
        },
      }
    },
    review: async () => {
      const btn = new InlineKeyboard()
      const confirm = request.params?.yes
      const { id, title, price, desc, kami, actionType } = ctx.session.scene.params
      if (confirm) {
        const api = await vendingAPI.edit({
          openid: ctx.session.userinfo!.openid,
          id: Number(id) || 0,
          title,
          price: Number(price) || 0,
          describe: desc,
          content: kami,
        })
        if (apiError(ctx, api)) {
          return
        }
        await ctx.answerCallbackQuery({
          text: ctx.t('vendingSettingSuccess'),
          show_alert: true,
        })
        // 跳转到商品详情
        return await actions.detail()
      } else {
        btn.text(ctx.t('confirm'), `/vending/manage?goto=review&yes=1`)
        btn.text(ctx.t('cancel'), `/vending/manage?goto=add`)

        const msg = ctx.t('vendingGoodsMsg', {
          title: title ?? '',
          price: price ?? '',
          desc: desc ?? '',
          kami: kami ?? '',
          step: 2,
          action: Number(actionType), // 0-add 1-edit
        })
        await display(ctx, msg, btn.inline_keyboard)
      }
    },
    delete: async () => {
      const id = request.params?.id || 0
      const page = request.params?.page || 1
      const confirm = request.params?.yes || 0
      const btn = new InlineKeyboard()

      const api = await vendingAPI.detail({ openid: ctx.session.userinfo!.openid, id })
      if (apiError(ctx, api)) {
        return
      }
      if (confirm) {
        const api = await vendingAPI.delete({ openid: ctx.session.userinfo!.openid, id })
        if (apiError(ctx, api)) {
          return
        }

        btn.text(ctx.t('goBack'), `/vending/manage?goto=index&page=${page}`)
        const msg = ctx.t('vendingGoodsDeleteMsg', {
          step: 1,
          title: api.data?.title ?? '',
        })
        await display(ctx, msg, btn.inline_keyboard, true)
      } else {
        btn.text(ctx.t('confirm'), `/vending/manage?goto=delete&id=${id}&page=${page}&yes=1`)
        btn.text(ctx.t('cancel'), `/vending/manage?goto=index&page=${page}`)
        const msg = ctx.t('vendingGoodsDeleteMsg', {
          step: 0,
          title: api.data?.title ?? '',
        })

        await display(ctx, msg, btn.inline_keyboard, true)
      }
    },
    detail: async () => {
      const id = request.params?.id || 0
      const page = request.params?.page || 1
      const btn = new InlineKeyboard()
      btn.text(ctx.t('vendingEdit'), `/vending/manage?goto=edit&id=${id}&page=${page}`)
      btn.text(ctx.t('vendingDelete'), `/vending/manage?goto=delete&id=${id}&page=${page}`).row()
      btn.text(ctx.t('vending'), `/vending/`).row()
      btn.text(ctx.t('goBack'), `/vending/manage?goto=index&page=${page}`)

      const api = await vendingAPI.detail({ openid: ctx.session.userinfo!.openid, id })
      if (apiError(ctx, api)) {
        return
      }

      const msg = ctx.t('vendingGoodsDetailMsg', {
        title: api.data?.title ?? '',
        price: api.data?.price ?? '',
        desc: api.data?.describe ?? '',
        kami: api.data?.content ?? '',
        views: api.data?.views ?? '',
        sales: api.data?.sales ?? '',
        time: format(new Date(api.data?.created_at ?? ''), 'yyyy-MM-dd HH:ii'),
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

const SettingView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene

  const actions: AnyObjetc = {
    index: async () => {
      ctx.session.onMessage = undefined
      const version = SessionVersion(ctx)
      const api = await vendingAPI.index({ openid: ctx.session.userinfo!.openid })
      if (apiError(ctx, api)) {
        return
      }

      const btn = new InlineKeyboard()
      btn.text(ctx.t('vendingSettingName'), '/vending/setting?goto=name').row()
      btn.text(ctx.t('vendingSettingDescribe'), '/vending/setting?goto=describe').row()
      btn.text(ctx.t('vendingSettingPayment'), '/vending/setting?goto=payment').row()
      const status = api.data?.status ?? 0 ? 0 : 1
      btn.text(ctx.t('vendingSettingStatus', { status }), `/vending/setting?goto=status&status=${status}`).row()
      btn.text(ctx.t('goBack'), `/vending?v=${version}`)
      const rep = ctx.session.request.params?.rep ?? 1

      const msg = ctx.t('vendingSettingMsg', {
        name: api.data?.name || ctx.t('vendingUnSetting'),
        describe: api.data?.describe || ctx.t('vendingUnSetting'),
        status: api.data?.status ? ctx.t('vendingStatusOpen') : ctx.t('vendingStatusClose'),
        payment: 'USDT » (' + (api.data?.payment ?? []).map(x => x.toUpperCase()).join() + ')',
      })
      await display(ctx, msg, btn.inline_keyboard, !!rep)
    },
    name: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/vending/setting?goto=index')
      await display(ctx, ctx.t('vendingSettingTypeMsg', { type: 1 }), btn.inline_keyboard, true)
      ctx.session.onMessage = {
        name: 'input-vending-name',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()
          if (!message) {
            return await invalidInput(ctx, '/vending')
          }
          const api = await vendingAPI.setting({
            openid: ctx.session.userinfo!.openid,
            action: 'name',
            value: message,
          })
          if (apiError(ctx, api)) {
            return
          }

          ctx.session.request.views = ['vending', 'setting']
          ctx.session.request.goto = 'index'
          ctx.session.request.params['rep'] = 0
          await clearLastMessage(ctx)
          await actions.index()
        },
      }
    },
    describe: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/vending/setting?goto=index')
      await display(ctx, ctx.t('vendingSettingTypeMsg', { type: 2 }), btn.inline_keyboard, true)
      ctx.session.onMessage = {
        name: 'input-vending-describe',
        time: Date.now(),
        call: async ctx => {
          const message = (ctx.message?.text ?? '').trim()
          if (!message) {
            return await invalidInput(ctx, '/vending')
          }
          const api = await vendingAPI.setting({
            openid: ctx.session.userinfo!.openid,
            action: 'describe',
            value: message,
          })
          if (apiError(ctx, api)) {
            return
          }

          ctx.session.request.views = ['vending', 'setting']
          ctx.session.request.goto = 'index'
          ctx.session.request.params['rep'] = 0
          await clearLastMessage(ctx)
          await actions.index()
        },
      }
    },
    payment: async () => {
      // `◉ ` : `○ ` ☑□
      const token = request.params?.token ?? ''
      let api: any
      if (token) {
        api = await vendingAPI.setting({
          openid: ctx.session.userinfo!.openid,
          action: 'payment',
          value: token,
        })
        if (apiError(ctx, api)) {
          return
        }
      } else {
        api = await vendingAPI.baseinfo({ openid: ctx.session.userinfo!.openid })
        if (apiError(ctx, api)) {
          return
        }
      }

      const btn = new InlineKeyboard()
      const version = SessionVersion(ctx)
      const blockchain = ctx.session.config?.blockchain ?? []
      blockchain.map(x => {
        const symbol = x.symbol
        const token = x.token
        const select = api.data?.payment?.includes(token) ? '◉' : '○'
        const text = `${token.toUpperCase()} · ${symbol.toUpperCase()} ${select}`
        btn.text(text, `/vending/setting?goto=payment&token=${token}&v=${version}`).row()
      })

      btn.text(ctx.t('goBack'), '/vending/setting?goto=index')
      await display(ctx, ctx.t('vendingSettingTypeMsg', { type: 3 }), btn.inline_keyboard, true)
    },
    status: async () => {
      const status = Number(request.params?.status ?? 0)
      const api = await vendingAPI.setting({
        openid: ctx.session.userinfo!.openid,
        action: 'status',
        value: status.toString(),
      })
      if (apiError(ctx, api)) {
        return
      }

      ctx.answerCallbackQuery({
        text: ctx.t('vendingSettingSuccess'),
        show_alert: true,
      })
      ctx.session.request.goto = 'index'
      await SettingView(ctx)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
const views: AnyObjetc = {
  manage: ManageView,
  setting: SettingView,
}
