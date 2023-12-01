const delay = require('mocker-api/lib/delay');
const wallet = require('./wallet.mock');
const setting = require('./setting.mock');
const invite = require('./invite.mock');
const payment = require('./payment.mock');
const store = require('./store.mock');
const secured = require('./secured.mock');
// const account = require('./account.mock');
// const secured = require('./secured.mock');

// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';

const proxy = {
  ...wallet,
  ...setting,
  ...invite,
  ...payment,
  ...store,
  ...secured,
  // ...account,
  // ...secured,

    // 用户session
  'POST /api/userinfo': (req, res) => {
    console.log('req.body=', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {
        id: req.body.fromId,
        first_name: 'fox',
        lang: 'cn',
        vip: 5,
        pincode: true,
        currency: 'CNY',
      }
    });
  },
  [`POST /api/config`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      err: 0,
      msg: '',
      success: true,
      data: {
        lang: [
          // {code: 'en', lang: 'English'},
          {code: 'cn', lang: '简体中文'},
        ],
        // lang: ['简体中文'],
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
        // currency: {
        //   code: ['USD', 'CNY', 'PHP'],
        //   symbol: ['$', '￥', '₱'],
        // },
        currency: [
          {code: 'USD', symbol: '$'},
          {code: 'CNY', symbol: '￥'},
          {code: 'PHP', symbol: '₱'},
        ],
        hongbao: ['hongbao1','hongbao2','hongbao3'],
        update_at: Date.now(),
      },
    });
  },

  [`POST /api/pwd/check`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      err: 0,
      msg: 'ok',
      data: [],
    });
  },
  [`POST /api/pwd/update`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      err: 0,
      msg: 'ok',
      data: [],
    });
  },
  
  'POST /api/login/account': (req, res) => {
    console.log('---->', req.body)
    console.log('---->', req.params.id)
    const { password, username } = req.body;
    if (password === '888888' && username === 'admin') {
      return res.json({
        status: 'ok',
        code: 0,
        token: "sdfsdfsdfdsf",
        data: {
          id: 1,
          username: 'kenny',
          sex: 6
        }
      });
    } else {
      return res.json({
        status: 'error',
        code: 403
      });
    }
  },
  'DELETE /api/user/:id': (req, res) => {
    console.log('---->', req.body)
    console.log('---->', req.params.id)
    res.send({ status: 'ok', message: '删除成功！' });
  },
}

module.exports = (noProxy ? {} : delay(proxy, 0)); // delay模拟延迟