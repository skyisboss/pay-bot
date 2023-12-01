import { AnyObjetc, BotContext } from '@/@types/types'
import { inviteAPI } from '@/api/invite'
import { storeAPI } from '@/api/store'
import { vendingAPI } from '@/api/vending'
import {
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
    const api = await vendingAPI.index({ uid: ctx.session.userinfo!.id })
    if (apiError(ctx, api)) {
      return
    }

    const btn = new InlineKeyboard()
    btn.text(ctx.t('vendingManage'), '/vending/manage?goto=index')
    btn.text(ctx.t('vendingPublish'), '/vending/manage?goto=add').row()
    btn.text(ctx.t('vendingSetting'), '/vending/manage?goto=setting').row()
    btn.text(ctx.t('goBack'), '/start?rep=1')
    const msg = ctx.t('vendingHomeMsg', {
      count1: api.data?.count?.count1 ?? 0,
      count2: api.data?.count?.count2 ?? 0,
      trc20: api.data?.amount?.trc20 ?? 0,
      erc20: api.data?.amount?.erc20 ?? 0,
      bep20: api.data?.amount?.bep20 ?? 0,
      link: api.data?.link ?? '',
      status: api.data?.status ?? -1,
    })

    await display(ctx, msg, btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

export const ManageView = async (ctx: BotContext) => {
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
      const api = await storeAPI.goods({ uid: ctx.session.userinfo!.id, page: page })
      if (!api?.success || !api?.data) {
        return await showServerStop(ctx)
      }

      const btn = new InlineKeyboard()
      ;(api.data?.rows ?? []).map(x => {
        btn.text(x.title, `/vending/manage?goto=detail&id=${x.id}&page=${page}`).row()
      })
      pager(ctx, btn, api?.data?.total ?? 0, page, `/vending/manage?goto=index`)
      btn.text(ctx.t('goBack'), '/vending?rep=1')

      const msg = ctx.t('vendingManageMsg', {
        name: '',
        index: 0,
      })
      const pageInfo = ctx.t('pageInfo', {
        currPage: page,
        totalPage: api?.data?.total ?? 0,
      })
      await display(ctx, msg + `\r\n\r\n` + pageInfo, btn.inline_keyboard, true)
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
      const msg = ctx.t('vendingGoodsMsg', {
        title: 'vip会员',
        price: '100',
        desc: '试用3天',
        kami: '账号jkhas 卡密1231231',
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
          uid: ctx.session.userinfo!.id,
          goods: {
            id,
            title,
            price,
            desc,
            kami,
          },
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
      if (confirm) {
        const api = await vendingAPI.delete({ uid: ctx.session.userinfo!.id, id })
        if (apiError(ctx, api)) {
          return
        }

        btn.text(ctx.t('goBack'), `/vending/manage?goto=index&page=${page}`)
        const msg = ctx.t('vendingGoodsDeleteMsg', {
          step: 1,
          title: 'asdadaxxxadass商品标题',
        })
        await display(ctx, msg, btn.inline_keyboard, true)
      } else {
        btn.text(ctx.t('confirm'), `/vending/manage?goto=delete&id=${id}&page=${page}&yes=1`)
        btn.text(ctx.t('cancel'), `/vending/manage?goto=index&page=${page}`)
        const msg = ctx.t('vendingGoodsDeleteMsg', {
          step: 0,
          title: 'asdadaxxxadass商品标题',
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

      const api = await vendingAPI.detail({ uid: ctx.session.userinfo!.id, id })
      if (apiError(ctx, api)) {
        return
      }

      const msg = ctx.t('vendingGoodsDetailMsg', {
        title: api.data?.title ?? '',
        price: api.data?.price ?? '',
        desc: api.data?.desc ?? '',
        kami: api.data?.kami ?? '',
        views: api.data?.views ?? '',
        sales: api.data?.sales ?? '',
        time: format(api.data?.created_at ?? 0, 'yyyy-MM-dd HH:ii'),
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
    setting: async () => {
      ctx.session.onMessage = undefined
      const btn = new InlineKeyboard()
      const action = request.params?.action ?? ''
      if (action) {
        if (action === '1') {
          btn.text(ctx.t('goBack'), '/vending/manage?goto=setting')
          await display(ctx, ctx.t('vendingSettingMsg', { step: 1 }), btn.inline_keyboard, true)
          ctx.session.onMessage = {
            name: 'input-vending-name',
            time: Date.now(),
            call: async ctx => {
              const message = (ctx.message?.text ?? '').trim()
              if (!message) {
                return await invalidInput(ctx, '/vending')
              }
              const api = await vendingAPI.setting({ uid: ctx.session.userinfo!.id, name: message || '' })
              if (apiError(ctx, api)) {
                return
              }

              ctx.session.request.views = ['vending', 'manage']
              ctx.session.request.goto = 'setting'
              ctx.session.request.params['rep'] = 0
              ctx.session.request.params['action'] = ''
              await clearLastMessage(ctx)
              await ManageView(ctx)
            },
          }
        }
        if (action === '2') {
          const status = ctx.session.request.params?.status
          const api = await vendingAPI.setting({ uid: ctx.session.userinfo!.id, status: status })
          if (apiError(ctx, api)) {
            return
          }
          await ctx.answerCallbackQuery({
            text: ctx.t('vendingSettingSuccess'),
            show_alert: true,
          })
          ctx.session.request.params['action'] = ''
          actions.setting()
        }
      } else {
        const api = await vendingAPI.index({ uid: ctx.session.userinfo!.id })
        if (apiError(ctx, api)) {
          return
        }

        btn.text(ctx.t('vendingSettingName'), '/vending/manage?goto=setting&action=1').row()
        btn
          .text(ctx.t('vendingSettingStatus'), `/vending/manage?goto=setting&action=2&status=${api.data?.status}`)
          .row()
        btn.text(ctx.t('goBack'), '/vending')
        const rep = ctx.session.request.params?.rep ?? 1
        await display(ctx, ctx.t('vendingSettingMsg', { step: 0 }), btn.inline_keyboard, !!rep)
      }
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
const views: AnyObjetc = {
  manage: ManageView,
}
