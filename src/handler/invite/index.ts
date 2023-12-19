import { AnyObjetc, BotContext } from '@/@types/types'
import { inviteAPI, userAPI } from '@/api/user'
import { SessionVersion, apiError, display, pager, restSceneInfo, showServerStop } from '@/util/helper'
import { format } from 'date-fns'
import { InlineKeyboard } from 'grammy'

export const InviteView = async (ctx: BotContext) => {
  const request = ctx.session.request
  if (request.homePage) {
    restSceneInfo(ctx)
    const btn = new InlineKeyboard()
    // 配合 bot.inlineQuery 使用 # src/handler/index.ts
    btn.switchInline(ctx.t('sendToFriend'), 'link').row()
    btn.text(ctx.t('inviteDetail'), '/invite/detail/?goto=index')
    btn.text(ctx.t('goBack'), '/start?rep=1')

    const bot_link = ctx.session.config?.bot_link
    const invite_code = ctx.session.userinfo?.invite_code
    const msg = ctx.t('inviteMsg', {
      link: `${bot_link}?start=${invite_code}`,
    })

    await display(ctx, msg, btn.inline_keyboard, true)
  } else {
    await views?.[request.views?.[1]]?.(ctx)
  }
}

const DetailView = async (ctx: BotContext) => {
  const request = ctx.session.request
  const actions: AnyObjetc = {
    index: async () => {
      const btn = new InlineKeyboard()
      btn.text(ctx.t('inviteUsers'), '/invite/detail/?goto=users')
      btn.text(ctx.t('inviteWithdraw'), '/invite/detail?goto=withdraw').row()
      btn.text(ctx.t('goBack'), '/invite')

      const api = await inviteAPI.index({ openid: ctx.session.userinfo!.openid })
      if (apiError(ctx, api)) {
        return
      }
      const invites = api?.data?.invites
      const balance = api?.data?.balance
      const msg = ctx.t('inviteDetailMsg', {
        count: invites?.count,
        // count1: invites?.count1,
        // count2: invites?.count2,
        // count3: invites?.count3,
        // count4: invites?.count4,
        trc20: balance?.trc20 ?? '0',
        bep20: balance?.bep20 ?? '0',
        erc20: balance?.erc20 ?? '0',
      })

      await display(ctx, msg, btn.inline_keyboard, true)
    },
    users: async () => {
      const page = Number(request.params?.page ?? 1)
      const cate = request.params?.cate ?? '1'
      const version = SessionVersion(ctx)
      const btn = new InlineKeyboard()
      const btnList = [ctx.t('inviteTime4'), ctx.t('inviteTime1'), ctx.t('inviteTime2'), ctx.t('inviteTime3')]
      btnList.map((x, index) => {
        const curr = index + 1
        let text = ''
        if (curr === Number(cate)) {
          text = `${x} ◉`
        } else {
          text = `${x} ○`
        }
        if (curr === btnList.length) {
          btn.text(text, `/invite/detail/?goto=users&cate=${curr}&v=${version}`).row()
        } else {
          btn.text(text, `/invite/detail/?goto=users&cate=${curr}&v=${version}`)
        }
      })

      const api = await inviteAPI.detail({
        openid: ctx.session.userinfo!.openid,
        page,
        cate,
      })
      if (apiError(ctx, api)) {
        return
      }
      const rows = api.data?.rows ?? []
      let text = ctx.t('inviteUsersMsg') + `\r\n\r\n`
      rows.map(x => {
        const link = `<a href="tg://user?id=${x.openid}">${x.openid}</a>`
        text += `👤 ${link} (${format(new Date(x?.created_at), 'yyyy/MM/dd HH:ii')})\r\n`
      })
      const totalItem = api?.data?.total ?? 0
      const pageSize = api?.data?.size ?? 5
      const totalPage = Math.ceil(totalItem / pageSize)
      pager(ctx, btn, totalPage, page, `/invite/detail?goto=users&cate=${cate}&v=${version}`)
      btn.text(ctx.t('goBack'), '/invite/detail')
      let pageInfo = ctx.t('pageInfo', {
        currPage: page,
        totalPage: totalPage,
      })
      await display(ctx, text + `\r\n` + pageInfo, btn.inline_keyboard, true)
    },
    withdraw: async () => {
      const api = await inviteAPI.withdraw({ openid: ctx.session.userinfo!.openid })

      if (apiError(ctx, api)) {
        return
      }
      await showServerStop(ctx, ctx.t('inviteWithdrawSuccess'))

      await actions.index()
    },
  }

  // 执行方法
  await actions?.[request.goto]?.()
}

const views: AnyObjetc = {
  detail: DetailView,
}
