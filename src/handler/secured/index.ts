import { AnyObjetc, BotContext } from '@/@types/types'
import { inviteAPI } from '@/api/invite'
import { checkScene, clearLastMessage, display, pager, restSceneInfo, showServerStop } from '@/util/helper'
import { InlineKeyboard } from 'grammy'
import { coinSymbols } from '../wallet'
import { storeAPI } from '@/api/store'
import { securedAPI } from '@/api/secured'

export const SecuredView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    restSceneInfo(ctx)

    const btn = new InlineKeyboard()
    btn.text(ctx.t('securedManage'), '/secured/manage?goto=index')
    btn.text(ctx.t('securedAdd'), '/secured/manage?goto=add').row()
    btn.text(`⚠️ ` + ctx.t('securedAgreement'), '/secured/manage?goto=agre').row()
    btn.text(ctx.t('goBack'), '/start?rep=1')

    await display(ctx, ctx.t('securedMsg'), btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

export const ManageView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const scene = ctx.session.scene
  const actions: AnyObjetc = {
    index: async () => {
      restSceneInfo(ctx)

      const btn = new InlineKeyboard()
      const cate = Number(request.params?.cate ?? 0)
      const securedMine = cate === 1 ? `◉ ` : `○ `
      const securedJoin = cate === 2 ? `◉ ` : `○ `
      btn.text(`${securedMine}` + ctx.t('securedMine'), '/secured/manage?cate=1')
      btn.text(`${securedJoin}` + ctx.t('securedJoin'), '/secured/manage?cate=2').row()

      let pageInfo: string = ''
      if (cate) {
        const page = request.params?.page || 1
        const api = await securedAPI.index({ uid: ctx.session.userinfo!.id })
        if (!api?.success || !api?.data) {
          return await showServerStop(ctx)
        }
        const rows = api?.data?.rows ?? []
        const statusText = [ctx.t('securedStatusPending'), ctx.t('securedStatusProgress')]
        rows.map(x => {
          const chain = coinSymbols[x.chain]
          const status = statusText[x.status]
          const title = `${status} | ${chain} | ${x.amount}`
          btn.text(title, `/secured/manage?goto=detail&cate=${cate}&id=${x.id}&page=${page}`).row()
        })
        pager(ctx, btn, api?.data?.total ?? 0, page, `/secured/manage?cate=${cate}`)
        pageInfo = ctx.t('pageInfo', {
          currPage: page,
          totalPage: api?.data?.total ?? 0,
        })
      }

      btn.text(ctx.t('goBack'), '/start?rep=1')
      const msg = ctx.t('securedManageMsg', {
        category: cate,
        totalCount: 11,
      })

      await display(ctx, msg + `\r\n\r\n` + pageInfo, btn.inline_keyboard, true)
    },
    detail: async () => {
      const id = Number(request.params?.id ?? 0)
      const cate = Number(request.params?.cate ?? 0)
      const page = Number(request.params?.page ?? 1)
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), `/secured/manage?cate=${cate}&page=${page}`)

      const msg = ctx.t('securedManageDetail', {
        chain: 1,
        amount1: 11,
        amount2: 11,
        step: 2,
        status: 1,
        exp_time: 123,
        link: '',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    agre: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('goBack'), '/secured?rep=1')

      const msg = ctx.t('securedAgreementMsg')

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    add: async () => {
      const step = {} as AnyObjetc
      const coin = request.params?.k
      const amount1 = ctx.session.scene.params?.amount1
      const btn = new InlineKeyboard()
      if (coin != undefined) {
        ctx.session.scene = {
          name: 'ManageView',
          router: `/secured/manage?goto=getInput&inputType=amount1`,
          createAt: Date.now(),
          store: new Map(),
          params: {
            chain: coin,
            amount1: '',
            amount2: '',
          },
        }

        btn.text(ctx.t('cancel'), '/secured?rep=1')
        const msg = ctx.t('securedAddMsg', {
          step: 1,
        })
        await display(ctx, msg, btn.inline_keyboard, true)
      } else if (amount1 != undefined && amount1) {
        const amount = Number(amount1)
        const percents = [1, 0.8, 0.5, 0.3, 0.1, 0]
        percents.map((e, i) => {
          let amount_percent = e * 100
          let amount_money = Math.round(e * amount).toFixed(2)
          if (i % 2 == 0) {
            btn.text(`${amount_percent}% (${amount_money})`, `/secured/manage?goto=review&amount2=${e}`)
          } else {
            btn.text(`${amount_percent}% (${amount_money})`, `/secured/manage?goto=review&amount2=${e}`).row()
          }
        })

        btn.text(ctx.t('cancel'), '/secured?rep=1')
        const msg = ctx.t('securedAddMsg', {
          step: 2,
        })
        await display(ctx, msg, btn.inline_keyboard)
      } else {
        ctx.answerCallbackQuery({
          text: ctx.t('securedAgreementAlert'),
          show_alert: true,
        })
        coinSymbols.map((item, index) => {
          btn.text(`${item}`, `/secured/manage?goto=add&k=${index}`).row()
        })
        btn.text(ctx.t('cancel'), '/secured?rep=1')

        const msg = ctx.t('securedAddMsg', {
          step: 0,
        })
        await display(ctx, msg, btn.inline_keyboard, true)
      }
    },
    edit: async () => {},
    review: async () => {
      const done = request.params?.done ?? ''
      if (done) {
        await ctx.answerCallbackQuery({
          text: ctx.t('storeGoodsAddSuccess'),
          show_alert: true,
        })
        return await actions.index()
      } else {
        const btn = new InlineKeyboard()
        btn.text(ctx.t('confirm'), '/secured/manage?goto=review&done=1')
        btn.text(ctx.t('cancel'), '/secured?rep=1')
        const amount2 = ctx.session.scene.params?.amount2
        const msg = ctx.t('securedAddMsg', {
          step: 3,
        })
        await display(ctx, msg, btn.inline_keyboard, true)
      }
    },
    getInput: async () => {
      if (!checkScene(ctx)) {
        restSceneInfo(ctx)
        return await display(ctx, ctx.t('sessionTimeOut'))
      }
      const inputType = request.params?.inputType
      const message = scene.params?.[inputType]
      if (inputType == 'amount1') {
        ctx.session.request.views[1] = 'manage'
        ctx.session.request.goto = 'add'
        ctx.session.scene.params.amount1 = message
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
