const delay = require('mocker-api/lib/delay');
const wallet = require('./wallet.mock');
const payment = require('./payment.mock');
const secured = require('./secured.mock');
const vending = require('./vending.mock');
// const account = require('./account.mock');
// const secured = require('./secured.mock');
const Mock = require('mockjs')
// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

const proxy = {
  ...wallet,
  ...payment,
  // ...store,
  ...secured,
  ...vending,
  // ...account,
  // ...secured,

    // 用户session
  'POST /api/user/index': (req, res) => {
    console.log('req.body=', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {
        id: 1,
        openid: "5279874291",
        rank: 1,
        username: "",
        nickname: "fox",
        language: "cn",
        currency: "cny",
        pin_code: "123",
        invite_code: "imiTeui",
        merchant: 1,
        vending: 1,
        version: 1,
        created: "2023-12-06T11:17:28.895Z",
        backup_account: '5279874291'
      }
    });
  },
  'POST /api/user/checkUser': (req, res) => {
    console.log('req.body=', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {}
    });
  },
  [`POST /api/user/config`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {
        bot_link: 'https://t.me/beikeBot',
        language: [
          {code: 'en', lang: 'English'},
          {code: 'cn', lang: '简体中文'},
        ],
        blockchain: [
          {
            chain: 'tron',
            token: 'trc20',
            symbol: 'usdt',
          },
          {
            chain: 'bsc',
            token: 'bep20',
            symbol: 'usdt',
          },
          {
            chain: 'eth',
            token: 'erc20',
            symbol: 'usdt',
          },
        ],
        currency: [
          {code: 'usd', symbol: '$'},
          {code: 'cny', symbol: '￥'},
          {code: 'php', symbol: '₱'},
        ],
        hongbao: ['hongbao1','hongbao2','hongbao3'],
        update_at: Date.now(),
      },
    });
  },
  'POST /api/user/setting/lang': (req, res) => {
    console.log('req.body=', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {
        lang: 'cn'
      }
    });
  },
  'POST /api/user/setting/currency': (req, res) => {
    console.log('req.body=', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {
        currency: 'cny'
      }
    });
  },
  'POST /api/user/setting/pincode': (req, res) => {
    console.log('req.body=', req.body)
    const crypto = require('crypto')
    function md5(content) {
      let md5 = crypto.createHash('md5')
      return md5.update(content).digest('hex') // 把输出编程16进制的格式
    }
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {
        pin_code: md5('123456')
      }
    });
  },
  'POST /api/user/setting/backup': (req, res) => {
    console.log('req.body=', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {
        backup: 'backup'
      }
    });
  },
  'POST /api/user/assets/transfer': (req, res) => {
    console.log('req.body=', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {}
    });
  },
  [`POST /api/user/invite/withdraw`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      // msg: '余额不足',
      // success: false,
      data: {},
    })
  },
  [`POST /api/user/invite/users`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      // msg: '余额不足',
      // success: false,
      data: {
        total: 20,
        page: 1,
        rows: new Array(5).fill('').map( (item, index) => { 
          return {
            id: index + 1,
            account: Mock.mock('@integer(10000, 100000)'),
            status: Mock.mock('@pick([1,2])'),
            created_at: Date.now()
          } 
        })
      },
    })
  },
  [`POST /api/user/invite/detail`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {
        invites: {
          count:Mock.mock('@integer(10000, 100000)'),
          // count1:Mock.mock('@integer(10000, 100000)'),
          // count2:Mock.mock('@integer(10000, 100000)'),
          // count3:Mock.mock('@integer(10000, 100000)'),
          // count4:Mock.mock('@integer(10000, 100000)'),
        },
        balance: {
          trc20:Mock.mock('@integer(10000, 100000)'),
          bep20:Mock.mock('@integer(10000, 100000)'),
          erc20:Mock.mock('@integer(10000, 100000)'),
        },
      },
    })
  },
}

module.exports = (noProxy ? {} : delay(proxy, 0)); // delay模拟延迟