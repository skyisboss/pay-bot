import { AnyObjetc, BotContext } from '@/@types/types'
import { securedAPI } from '@/api/secured'
import {
  EthToWei,
  SessionVersion,
  WeiToEth,
  apiError,
  clearLastMessage,
  display,
  getChainSymbol,
  invalidInput,
  pager,
  restSceneInfo,
} from '@/util/helper'
import { math_multiply } from '@/util/math'
import { InlineKeyboard } from 'grammy'

export const ContractView = async (ctx: BotContext) => {
  const request = ctx.session.request

  if (request.homePage) {
    restSceneInfo(ctx)

    const btn = new InlineKeyboard()
    btn.text(ctx.t('securedManage'), '/contract/manage?goto=index')
    btn.text(ctx.t('securedAdd'), '/contract/manage?goto=create').row()
    btn.text(`⚠️ ` + ctx.t('securedAgreement'), '/contract/manage?goto=terms').row()
    btn.text(ctx.t('goBack'), '/start?rep=1')

    await display(ctx, ctx.t('securedMsg'), btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

type StepType = {
  condition: boolean
  callback: () => Promise<void>
}
export const ManageView = async (ctx: BotContext) => {
  const request = ctx.session.request

  const actions: AnyObjetc = {
    index: async () => {
      restSceneInfo(ctx)

      const btn = new InlineKeyboard()
      const cate = Number(request.params?.cate ?? 0)
      const securedMine = cate === 1 ? `◉ ` : `○ `
      const securedJoin = cate === 2 ? `◉ ` : `○ `
      const version = SessionVersion(ctx)
      btn.text(`${securedMine}` + ctx.t('securedMine'), `/contract/manage?cate=1&v=${version}`)
      btn.text(`${securedJoin}` + ctx.t('securedJoin'), `/contract/manage?cate=2&v=${version}`).row()

      let pageInfo = ''
      let totalCount = 0
      if (cate) {
        const page = request.params?.page || 1
        const api = await securedAPI.index({ uid: ctx.session.userinfo!.id })
        if (apiError(ctx, api)) {
          return
        }
        totalCount = api?.data?.total ?? 0
        if (totalCount) {
          const rows = api?.data?.rows ?? []
          const statusText = [ctx.t('securedStatusPending'), ctx.t('securedStatusProgress')]
          rows.map(x => {
            const symbol = getChainSymbol(ctx, x.chain) ?? ''
            const status = statusText[x.status]
            const title = `${status} | ${symbol} | ${x.amount}`
            btn.text(title, `/contract/manage?goto=detail&cate=${cate}&id=${x.id}&page=${page}`).row()
          })
          pager(ctx, btn, api?.data?.total ?? 0, page, `/contract/manage?cate=${cate}`)
          pageInfo = ctx.t('pageInfo', {
            currPage: page,
            totalPage: api?.data?.total ?? 0,
          })
        } else {
          pageInfo = ctx.t('nodata')
        }
      }

      btn.text(ctx.t('goBack'), '/contract?rep=1')
      const msg = ctx.t('securedManageMsg', {
        category: cate,
        totalCount: totalCount,
      })

      await display(ctx, msg + `\r\n\r\n` + pageInfo, btn.inline_keyboard, true)
    },
    create: async () => {
      const coin = request.params?.coin
      const amount = ctx.session.scene.params?.amount
      const btn = new InlineKeyboard()
      const steps: AnyObjetc<StepType> = {
        step1: {
          condition: coin,
          callback: async () => {
            btn.text(ctx.t('cancel'), '/contract?rep=1')
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
                ctx.session.request.goto = 'create'
                ctx.session.scene.params = { coin, amount, deposit: '' }

                ctx.session.onMessage = undefined
                await clearLastMessage(ctx)
                await ManageView(ctx)
              },
            }
          },
        },
        step2: {
          condition: amount,
          callback: async () => {
            const percents = [1, 0, 0.8, 0.6, 0.4, 0.2]
            percents.map((e, i) => {
              let text = ''
              switch (e) {
                case 1:
                  text = '全额保证金'
                  break
                case 0:
                  text = '无需保证金'
                  break
                default:
                  const wei = EthToWei(amount, 6)
                  const eth = WeiToEth(math_multiply(wei, e), 6)
                  text = eth.toFixed(2)
              }
              if (i % 2 == 0) {
                btn.text(`${e * 100}% (${text})`, `/contract/manage?goto=review&deposit=${e}`)
              } else {
                btn.text(`${e * 100}% (${text})`, `/contract/manage?goto=review&deposit=${e}`).row()
              }
            })

            btn.text(ctx.t('cancel'), '/contract?rep=1')
            const coin = ctx.session.scene.params?.coin
            const symbol = getChainSymbol(ctx, coin) ?? ''
            const msg = ctx.t('securedAddMsg', {
              step: 2,
              symbol,
              amount,
            })
            await display(ctx, msg, btn.inline_keyboard)
          },
        },
        default: {
          condition: true,
          callback: async () => {
            // ctx.answerCallbackQuery({
            //   text: ctx.t('securedAgreementAlert'),
            //   show_alert: true,
            // })
            const blockchain = ctx.session.config?.blockchain ?? []
            blockchain.map(x => {
              const symbol = `${x.token.toUpperCase()} · ${x.symbol.toUpperCase()}`
              btn.text(`${symbol}`, `/contract/manage?goto=create&coin=${x.token}`).row()
            })
            btn.text(ctx.t('cancel'), '/contract?rep=1')

            const msg = ctx.t('securedAddMsg', {
              step: 0,
            })
            await display(ctx, msg, btn.inline_keyboard, true)
          },
        },
      }

      for (let index = 0; index < Object.keys(steps).length; index++) {
        const key = Object.keys(steps)[index]
        if (steps[key].condition) {
          if (key !== 'default') {
            steps[key].condition = false
          }
          await steps[key].callback()

          break
        }
      }
    },
    terms: async () => {
      const btn = new InlineKeyboard()
      // 点击按钮后跳转地址
      const jump = request.params?.jump
      if (jump) {
        btn.text(ctx.t('confirm'), `/contract/manage?goto=${jump}`)
      } else {
        btn.text(ctx.t('confirm'), '/contract')
      }

      const msg = ctx.t('securedAgreementMsg')

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    review: async () => {
      const coin = ctx.session.scene.params?.coin
      const amount = ctx.session.scene.params?.amount
      const deposit = ctx.session.request.params?.deposit ?? ctx.session.scene.params?.deposit
      if (request.params?.yes) {
        const api = await securedAPI.create({
          uid: ctx.session.userinfo!.id,
          coin,
          amount,
          deposit,
        })
        if (apiError(ctx, api)) {
          return
        }
        await ctx.answerCallbackQuery({
          text: ctx.t('securedAddSuccess'),
          show_alert: true,
        })

        ctx.session.request.params = { id: api.data?.id, cate: 1 }
        return await actions.detail()
      } else {
        const btn = new InlineKeyboard()
        btn.text(ctx.t('confirm'), `/contract/manage?goto=review&yes=1`)
        btn.text(ctx.t('cancel'), '/contract?rep=1')

        ctx.session.scene.params['deposit'] = deposit
        const msg = ctx.t('securedAddMsg', {
          step: 3,
          amount,
          symbol: getChainSymbol(ctx, coin) ?? '',
          deposit: Number(amount) * parseFloat(deposit),
        })
        await display(ctx, msg, btn.inline_keyboard, true)
      }
    },
    detail: async () => {
      let status = 1
      const id = Number(request.params?.id ?? 0)
      const cate = Number(request.params?.cate ?? 0)
      const page = Number(request.params?.page ?? 1)
      const rep = request.params?.rep ?? '1'

      const api = await securedAPI.detail({ uid: ctx.session.userinfo!.id, id })
      if (apiError(ctx, api)) {
        return
      }
      const btn = new InlineKeyboard()
      const baseRouter = `/contract/manage?goto=edit&opt=${id}:${cate}:${page}` //   id=${id}&cate=${cate}&page=${page}
      const isOwner = cate === 1
      // 根据status和user显示对应操作
      if (status === 1) {
        if (isOwner) {
          btn.text(ctx.t('securedManageContent'), `${baseRouter}:content`)
          btn.text(ctx.t('securedManageClose'), `${baseRouter}:close`).row()
        } else {
          btn.text(ctx.t('securedManageJoin'), `${baseRouter}:join`).row()
        }
      }
      if (status === 2) {
        if (isOwner) {
          btn.text(ctx.t('securedManageDelivery'), `${baseRouter}:delivery`).row()
        } else {
          btn.text(ctx.t('securedManageNotify') + ctx.t('securedManageDelivery'), `${baseRouter}:delivery2`).row()
        }
      }
      if (status === 3) {
        if (isOwner) {
          btn.text(ctx.t('securedManageNotify') + ctx.t('securedManageReceive'), `${baseRouter}:receive2`).row()
        } else {
          btn.text(ctx.t('securedManageReceive'), `${baseRouter}:receive`).row()
        }
      }
      if (status === 4) {
        if (isOwner) {
          btn.text(ctx.t('securedManageNotify') + ctx.t('securedManagePayment'), `${baseRouter}:payment2`).row()
        } else {
          btn.text(ctx.t('securedManagePayment'), `${baseRouter}:payment`).row()
        }
      }

      btn.text(ctx.t('goBack'), `/contract/manage?cate=${cate}&page=${page}`)

      const msg = ctx.t('securedManageDetail', {
        id: (api.data?.id ?? '').toString(),
        step: status,
        content: api.data?.content || ctx.t('securedManageCompleteContent'),
        chain: getChainSymbol(ctx, api.data?.chain ?? '') ?? '',
        amount: api.data?.amount ?? '',
        deposit: api.data?.deposit ?? '',
        percent: api.data?.percent ?? '',
        owner: api.data?.owner ?? '',
        partner: api.data?.partner || '--',
        link: api.data?.link ?? '',
      })

      await display(ctx, msg, btn.inline_keyboard, rep)
    },
    edit: async () => {
      const params = request.params?.opt ?? ''
      const [id, cate, page, step] = params.split(':')

      const btn = new InlineKeyboard()
      ctx.session.onMessage = undefined
      switch (step) {
        case 'content':
          btn.text(ctx.t('cancel'), `/contract/manage/?goto=detail&id=${id}&cate=${cate}&page=${page}`)
          await display(ctx, ctx.t('securedManageContentMsg', { step: 0 }), btn.inline_keyboard, true)
          ctx.session.onMessage = {
            name: 'input-secured-content',
            time: Date.now(),
            call: async ctx => {
              const message = (ctx.message?.text ?? '').trim()
              if (!message || message.length > 1024) {
                ctx.session.onMessage = undefined
                return await invalidInput(ctx, '/contract/manage/', ctx.t('invalidAmount'))
              }
              const api = await securedAPI.edit({
                uid: ctx.session.userinfo!.id,
                post: {
                  id,
                  content: message,
                },
              })
              if (apiError(ctx, api)) {
                return
              }

              ctx.session.request.params = { id, cate, page, rep: 0 }
              ctx.session.request.views[1] = 'manage'
              ctx.session.request.goto = 'detail'

              ctx.session.onMessage = undefined
              await clearLastMessage(ctx)
              await ManageView(ctx)
            },
          }
          break
        case 'join':
          const api = await securedAPI.edit({
            uid: ctx.session.userinfo!.id,
            post: {
              id,
              join: ctx.session.userinfo?.id,
            },
          })
          if (apiError(ctx, api)) {
            return
          }
          btn.text(ctx.t('cancel'), `/contract/manage/?goto=detail&id=${id}&cate=${cate}&page=${page}`)
          await display(ctx, ctx.t('securedManageActionMsg', { action: 1 }), btn.inline_keyboard, true)
          break
        case 'close':
          if (request.params?.yes) {
            const api = await securedAPI.edit({
              uid: ctx.session.userinfo!.id,
              post: {
                id,
                close: id,
              },
            })
            if (apiError(ctx, api)) {
              return
            }
            ctx.answerCallbackQuery({
              text: ctx.t('securedManageCloseSuccess'),
              show_alert: true,
            })
            ctx.session.request.params = { cate }
            ctx.session.request.goto = 'index'
            return await actions.index()
          } else {
            btn.text(ctx.t('confirm'), `/contract/manage?goto=edit&opt=${id}:${cate}:${page}:close&yes=1`)
            btn.text(ctx.t('cancel'), `/contract/manage/?goto=detail&id=${id}&cate=${cate}&page=${page}`)
            await display(ctx, ctx.t('securedManageCloseMsg'), btn.inline_keyboard, true)
          }
          break
        case 'delivery':
          {
            const api = await securedAPI.edit({
              uid: ctx.session.userinfo!.id,
              post: {
                id,
                delivery: id,
              },
            })
            if (apiError(ctx, api)) {
              return
            }
          }
          btn.text(ctx.t('confirm'), `/contract/manage/?goto=detail&id=${id}&cate=${cate}&page=${page}`)
          btn.text(ctx.t('cancel'), `/contract/manage/?goto=detail&id=${id}&cate=${cate}&page=${page}`)
          await display(ctx, ctx.t('securedManageActionMsg', { action: 2 }), btn.inline_keyboard, true)
          break
        case 'delivery2':
          {
            const api = await securedAPI.edit({
              uid: ctx.session.userinfo!.id,
              post: {
                id,
                delivery2: id,
              },
            })
            if (apiError(ctx, api)) {
              return
            }
          }
          ctx.answerCallbackQuery({
            text: ctx.t('securedManageNotifyMsg', { action: 2 }),
            show_alert: true,
          })
          break
        case 'receive':
          {
            const api = await securedAPI.edit({
              uid: ctx.session.userinfo!.id,
              post: {
                id,
                receive: id,
              },
            })
            if (apiError(ctx, api)) {
              return
            }
          }
          btn.text(ctx.t('confirm'), `/contract/manage/?goto=detail&id=${id}&cate=${cate}&page=${page}`)
          btn.text(ctx.t('cancel'), `/contract/manage/?goto=detail&id=${id}&cate=${cate}&page=${page}`)
          await display(ctx, ctx.t('securedManageActionMsg', { action: 3 }), btn.inline_keyboard, true)
          break
        case 'receive2':
          {
            const api = await securedAPI.edit({
              uid: ctx.session.userinfo!.id,
              post: {
                id,
                receive2: id,
              },
            })
            if (apiError(ctx, api)) {
              return
            }
          }
          ctx.answerCallbackQuery({
            text: ctx.t('securedManageNotifyMsg', { action: 3 }),
            show_alert: true,
          })
          break
        case 'payment':
          {
            const api = await securedAPI.edit({
              uid: ctx.session.userinfo!.id,
              post: {
                id,
                payment: id,
              },
            })
            if (apiError(ctx, api)) {
              return
            }
          }
          btn.text(ctx.t('confirm'), `/contract/manage/?goto=detail&id=${id}&cate=${cate}&page=${page}`)
          btn.text(ctx.t('cancel'), `/contract/manage/?goto=detail&id=${id}&cate=${cate}&page=${page}`)
          await display(ctx, ctx.t('securedManageActionMsg', { action: 4 }), btn.inline_keyboard, true)
          break
        case 'payment2':
          {
            const api = await securedAPI.edit({
              uid: ctx.session.userinfo!.id,
              post: {
                id,
                payment2: id,
              },
            })
            if (apiError(ctx, api)) {
              return
            }
          }
          ctx.answerCallbackQuery({
            text: ctx.t('securedManageNotifyMsg', { action: 4 }),
            show_alert: true,
          })
          break
      }
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

const views: AnyObjetc = {
  manage: ManageView,
}
