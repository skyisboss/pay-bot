import { AnyObjetc, BotContext } from '@/@types/types'
import {
  SessionVersion,
  apiError,
  checkScene,
  clearLastMessage,
  display,
  getChainSymbol,
  invalidInput,
  pager,
  restSceneInfo,
  showServerStop,
} from '@/util/helper'
import { InlineKeyboard } from 'grammy'
import { coinSymbols } from '../wallet'
import { securedAPI } from '@/api/secured'

export const SecuredView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    restSceneInfo(ctx)

    const btn = new InlineKeyboard()
    btn.text(ctx.t('securedManage'), '/secured/manage?goto=index')
    btn.text(ctx.t('securedAdd'), '/secured/manage?goto=agre&jump=add').row()
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
      const version = SessionVersion(ctx)
      btn.text(`${securedMine}` + ctx.t('securedMine'), `/secured/manage?cate=1&v=${version}`)
      btn.text(`${securedJoin}` + ctx.t('securedJoin'), `/secured/manage?cate=2&v=${version}`).row()

      let pageInfo = ''
      let totalCount = 0
      if (cate) {
        const page = request.params?.page || 1
        const api = await securedAPI.index({ uid: ctx.session.userinfo!.id })
        if (apiError(ctx, api)) {
          return
        }
        const rows = api?.data?.rows ?? []
        const statusText = [ctx.t('securedStatusPending'), ctx.t('securedStatusProgress')]
        rows.map(x => {
          const chain = '' //coinSymbols[x.chain]
          const status = statusText[x.status]
          const title = `${status} | ${chain} | ${x.amount}`
          btn.text(title, `/secured/manage?goto=detail&cate=${cate}&id=${x.id}&page=${page}`).row()
        })
        pager(ctx, btn, api?.data?.total ?? 0, page, `/secured/manage?cate=${cate}`)
        pageInfo = ctx.t('pageInfo', {
          currPage: page,
          totalPage: api?.data?.total ?? 0,
        })
        totalCount = api?.data?.total ?? 0
      }

      btn.text(ctx.t('goBack'), '/secured?rep=1')
      const msg = ctx.t('securedManageMsg', {
        category: cate,
        totalCount: totalCount,
      })

      await display(ctx, msg + `\r\n\r\n` + pageInfo, btn.inline_keyboard, true)
    },
    detail: async () => {
      const id = Number(request.params?.id ?? 0)
      const cate = Number(request.params?.cate ?? 0)
      const page = Number(request.params?.page ?? 1)
      let status = 4
      const btn = new InlineKeyboard()
      if (cate === 1 && status === 1) {
        btn.text(ctx.t('securedManageEdit'), `/secured/manage?cate=${cate}&page=${page}`)
        btn.text(ctx.t('securedManageDele'), `/secured/manage?cate=${cate}&page=${page}`).row()
      }
      // 如果是参与方，并且
      if (cate === 2 && status <= 2) {
        btn.text(ctx.t('securedManageExit'), `/secured/manage?cate=${cate}&page=${page}`).row()
      }
      if (status === 3) {
        btn.text(ctx.t('securedDetailStep3Text'), `/secured/manage?cate=${cate}&page=${page}`).row()
      }
      if (status === 4) {
        btn.text(ctx.t('securedDetailStep4Text'), `/secured/manage?cate=${cate}&page=${page}`).row()
      }
      btn.text(ctx.t('goBack'), `/secured/manage?cate=${cate}&page=${page}`)

      const api = await securedAPI.index({ uid: ctx.session.userinfo!.id })
      if (apiError(ctx, api)) {
        return
      }

      const msg = ctx.t('securedManageDetail', {
        id: '592813',
        step: status,
        title: '购买vip账号',
        chain: 'BEP20 · USDT',
        amount: 5391,
        deposit: 1617.3,
        percent: '30%',
        owner: '@pkmp4',
        partner: '@pkmp5',
        expire: '12/02 24:00:00',
        link: 'https://t.me?bot?start=123',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    agre: async () => {
      const btn = new InlineKeyboard()
      // 点击按钮后跳转地址
      const jump = request.params?.jump
      if (jump) {
        btn.text(ctx.t('confirm'), `/secured/manage?goto=${jump}`)
      } else {
        btn.text(ctx.t('confirm'), '/secured')
      }

      const msg = ctx.t('securedAgreementMsg')

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    add: async () => {
      const coin = request.params?.coin
      const amount = ctx.session.scene.params?.amount
      const btn = new InlineKeyboard()
      if (coin) {
        btn.text(ctx.t('cancel'), '/secured?rep=1')
        const symbol = getChainSymbol(ctx, coin) ?? ''
        const msg = ctx.t('securedAddMsg', {
          step: 1,
          symbol,
        })
        await display(ctx, msg, btn.inline_keyboard, true)
        ctx.session.onMessage = {
          name: 'input-secured-amount',
          time: Date.now(),
          call: async ctx => {
            const message = (ctx.message?.text ?? '').trim()
            const amount = parseFloat(message)
            if (Number.isNaN(amount) || amount <= 0) {
              return await invalidInput(ctx, ctx.t('invalidAmount'))
            }
            ctx.session.request.params.coin = undefined
            ctx.session.request.views[1] = 'manage'
            ctx.session.request.goto = 'add'
            ctx.session.scene.params = { coin, amount, deposit: '' }

            await clearLastMessage(ctx)
            await ManageView(ctx)
          },
        }
      } else if (amount) {
        btn.text(`100% (同等金额)`, `/secured/manage?goto=review&deposit=1`)
        btn.text(`0% (无需保证金)`, `/secured/manage?goto=review&deposit=0`).row()
        const percents = [0.8, 0.5, 0.3, 0.1]
        percents.map((e, i) => {
          let amount_percent = e * 100
          let amount_money = Math.round(e * amount).toFixed(2)
          if (i % 2 == 0) {
            btn.text(`${amount_percent}% (${amount_money})`, `/secured/manage?goto=review&deposit=${e}`)
          } else {
            btn.text(`${amount_percent}% (${amount_money})`, `/secured/manage?goto=review&deposit=${e}`).row()
          }
        })

        btn.text(ctx.t('cancel'), '/secured?rep=1')
        const coin = ctx.session.scene.params?.coin
        const symbol = getChainSymbol(ctx, coin) ?? ''
        const msg = ctx.t('securedAddMsg', {
          step: 2,
          symbol,
          amount,
        })
        await display(ctx, msg, btn.inline_keyboard)
      } else {
        ctx.answerCallbackQuery({
          text: ctx.t('securedAgreementAlert'),
          show_alert: true,
        })
        const blockchain = ctx.session.config?.blockchain ?? []
        blockchain.map(x => {
          const symbol = `${x.token.toUpperCase()} · ${x.symbol.toUpperCase()}`
          btn.text(`${symbol}`, `/secured/manage?goto=add&coin=${x.token}`).row()
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
      if (request.params?.done) {
        await ctx.answerCallbackQuery({
          text: ctx.t('securedAddSuccess'),
          show_alert: true,
        })
        ctx.session.onMessage = undefined
        ctx.session.scene.params = { id: 123 }
        return await actions.detail()
      } else {
        const btn = new InlineKeyboard()
        btn.text(ctx.t('confirm'), '/secured/manage?goto=review&done=1')
        btn.text(ctx.t('cancel'), '/secured?rep=1')
        const coin = ctx.session.scene.params?.coin
        const amount = ctx.session.scene.params?.amount
        const deposit = ctx.session.request.params?.deposit
        const msg = ctx.t('securedAddMsg', {
          step: 3,
          amount,
          symbol: getChainSymbol(ctx, coin) ?? '',
          deposit: Number(amount) * parseFloat(deposit),
        })
        await display(ctx, msg, btn.inline_keyboard, true)
      }
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

const views: AnyObjetc = {
  manage: ManageView,
}
