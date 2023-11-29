import { AnyObjetc, BotContext } from '@/@types/types'
import { storeAPI } from '@/api/store'
import { checkScene, clearLastMessage, display, pager, restSceneInfo, showServerStop, stopService } from '@/util/helper'
import { InlineKeyboard } from 'grammy'

export const StoreView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    restSceneInfo(ctx)
    const btn = new InlineKeyboard()
    btn.text(ctx.t('storeGoodsView'), '/store/manage?goto=index')
    btn.text(ctx.t('storeGoodsAdd'), '/store/manage?goto=add').row()
    btn.text(ctx.t('storeSetting'), '/store/manage?goto=setting').row()
    btn.text(ctx.t('goBack'), '/start?rep=1')
    const msg = ctx.t('storeHomeMsg', {
      trc20: '0.00',
      bep20: '0.00',
      erc20: '0.00',
      link: 'https://grammy.dev',
    })

    await display(ctx, msg, btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

export const ManageView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const actions: AnyObjetc = {
    index: async () => {
      const page = request.params?.page || 1
      const api = await storeAPI.goods({ shop_id: 123, page: page })
      if (!api?.success || !api?.data) {
        return await showServerStop(ctx)
      }

      const btn = new InlineKeyboard()
      ;(api.data?.rows ?? []).map(x => {
        btn.text(x.title, `/store/manage?goto=detail&id=${x.id}&page=${page}`).row()
      })
      pager(ctx, btn, api?.data?.total ?? 0, page, `/store/manage?goto=index`)
      btn.text(ctx.t('goBack'), '/store?rep=1')

      const msg = ctx.t('storeGoodsViewMsg', {
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
      ctx.session.scene = {
        name: 'ManageView',
        router: '/store/manage?goto=getInput&inputType=goods',
        createAt: Date.now(),
        store: new Map(),
        params: {
          goods: '',
          actionType: 0,
        },
      }
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), `/store/`)
      await display(ctx, ctx.t('storeGoodsAddMsg'), btn.inline_keyboard, true)
    },
    edit: async () => {
      ctx.session.scene = {
        name: 'ManageView',
        router: '/store/manage?goto=getInput&inputType=goods',
        createAt: Date.now(),
        store: new Map(),
        params: {
          goods: '',
          actionType: 1,
        },
      }
      const btn = new InlineKeyboard()
      btn.text(ctx.t('cancel'), `/store/`)
      const msg = ctx.t('storeGoodsEditMsg', {
        title: 'vip会员',
        price: '100',
        desc: '试用3天',
        kami: '账号jkhas 卡密1231231',
      })
      await display(ctx, msg, btn.inline_keyboard, true)
    },
    review: async () => {
      const btn = new InlineKeyboard()
      const confirm = request.params?.yes
      const { title, price, desc, kami, actionType } = ctx.session.scene.params
      if (confirm) {
        await ctx.answerCallbackQuery({
          text: ctx.t('storeGoodsAddSuccess'),
          show_alert: true,
        })
        return await actions.index()
      } else {
        btn.text(ctx.t('confirm'), `/store/manage?goto=review&yes=1`)
        btn.text(ctx.t('cancel'), `/store/manage?goto=add`)
        const msg = ctx.t('storeGoodsReviewMsg', {
          title,
          price,
          desc,
          kami,
          type: Number(actionType), // 0-add 1-edit
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
        btn.text(ctx.t('goBack'), `/store/manage?goto=index&page=${page}`)
        await display(ctx, ctx.t('storeGoodsDeleteSuccess'), btn.inline_keyboard, true)
      } else {
        btn.text(ctx.t('confirm'), `/store/manage?goto=delete&id=${id}&page=${page}&yes=1`)
        btn.text(ctx.t('cancel'), `/store/manage?goto=index&page=${page}`)
        const msg = ctx.t('storeGoodsDeleteConfirm', {
          title: 'asdadaxxxadass商品标题',
        })

        await display(ctx, msg, btn.inline_keyboard, true)
      }
    },
    detail: async () => {
      const id = request.params?.id || 0
      const page = request.params?.page || 1
      const btn = new InlineKeyboard()
      btn.text(ctx.t('storeGoodsEdit'), `/store/manage?goto=edit&id=${id}&page=${page}`)
      btn.text(ctx.t('storeGoodsDelete'), `/store/manage?goto=delete&id=${id}&page=${page}`).row()
      btn.text(ctx.t('goBack'), `/store/manage?goto=index&page=${page}`)

      await display(ctx, ctx.t('storeGoodsDetailMsg'), btn.inline_keyboard, true)
    },
    setting: async () => {
      const btn = new InlineKeyboard()
      const setIndex = Number(request.params?.set ?? 0)
      if (setIndex) {
        const setList = [
          '',
          '/store/manage?goto=getInput&inputType=name',
          '/store/manage?goto=getInput&inputType=timeout',
        ]
        ctx.session.scene = {
          name: 'ManageView',
          router: setList[setIndex],
          createAt: Date.now(),
          store: new Map(),
          params: {
            name: '',
            timeout: '',
          },
        }
        btn.text(ctx.t('cancel'), '/store/manage?goto=setting')
        const msg = ctx.t('storeSettingItemMsg', {
          index: setIndex,
        })
        await display(ctx, msg, btn.inline_keyboard, true)
      } else {
        restSceneInfo(ctx)

        btn.text(ctx.t('storeSetName'), '/store/manage?goto=setting&set=1').row()
        btn.text(ctx.t('storeSetTimeout'), '/store/manage?goto=setting&set=2').row()
        btn.text(ctx.t('goBack'), '/store?rep=1')

        const replaceMsg = request.params?.replace ?? 1
        await display(ctx, ctx.t('storeSettingMsg'), btn.inline_keyboard, !!replaceMsg)
      }
    },
    getInput: async () => {
      if (!checkScene(ctx)) {
        restSceneInfo(ctx)
        return await display(ctx, ctx.t('sessionTimeOut'))
      }

      const inputType = request.params?.inputType
      const message = scene.params?.[inputType]
      if (inputType == 'name') {
        ctx.session.request.views[1] = 'manage'
        ctx.session.request.goto = 'setting'
        ctx.session.request.params = { replace: 0 }

        // TODO::保存设置数据
      }

      if (inputType == 'timeout') {
        const amount = parseFloat(message)
        if (Number.isNaN(amount) || amount <= 0) {
          restSceneInfo(ctx)
          const btn = new InlineKeyboard()
          btn.text(ctx.t('goBack'), '/start?rep=1')

          await clearLastMessage(ctx)
          return await display(ctx, ctx.t('invalidInput'), btn.inline_keyboard)
        }

        ctx.session.request.views[1] = 'manage'
        ctx.session.request.goto = 'setting'
        ctx.session.request.params = { replace: 0 }

        // TODO::保存设置数据
      }

      if (inputType == 'goods') {
        const goods = message.trim()
        if (!goods) {
          restSceneInfo(ctx)
          const btn = new InlineKeyboard()
          btn.text(ctx.t('goBack'), '/store/?rep=1')

          await clearLastMessage(ctx)
          return await display(ctx, ctx.t('invalidInput'), btn.inline_keyboard)
        }

        // 解析内容
        const arr = goods.split(/\n/g) as any[]
        const regs = {
          title: /(?<=标题=\[)(.+?)(?=\])/g,
          price: /(?<=价格=\[)(.+?)(?=\])/g,
          desc: /(?<=描述=\[)(.+?)(?=\])/g,
          kami: /(?<=卡密=\[)(.+?)(?=\])/g,
        } as { [k: string]: RegExp }
        let ret = {} as AnyObjetc
        for (let index = 0; index < arr.length; index++) {
          const item = arr[index]
          Object.keys(regs).map(x => {
            const pattern = regs[x]
            if (pattern.test(item)) {
              ret[x] = RegExp.$1
            }
          })
        }
        if (Object.keys(ret).length != 4) {
          restSceneInfo(ctx)
          const btn = new InlineKeyboard()
          btn.text(ctx.t('goBack'), '/store/?rep=1')

          await clearLastMessage(ctx)
          return await display(ctx, ctx.t('invalidInput'), btn.inline_keyboard)
        }

        ctx.session.request.views[1] = 'manage'
        ctx.session.request.goto = 'review'
        ctx.session.scene.params = { ...ret, actionType: scene.params?.['actionType'] }
      }

      await clearLastMessage(ctx)
      await ManageView(ctx)
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}
const views: AnyObjetc = {
  manage: ManageView,
}
