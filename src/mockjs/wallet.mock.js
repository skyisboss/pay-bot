const BASE_URL = '/api';
const Mock = require('mockjs');
const Random = require('mockjs');

const obj = {
   err: 0,
      msg: '',
      success: true,
}
const release = {
  // [`GET ${BASE_URL}/:id`]: (req, res) => {
  //   console.log('---->', req.params)
  //   return res.json({
  //     id: 1,
  //     username: Mock.mock({ "string|1-10": "123" }),
  //     sex: Mock.mock('@integer(10000)')
  //   });
  // },
  [`POST ${BASE_URL}/wallet/index`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
          trc20: Mock.mock('@integer(10000, 100000)'),
          bep20: Mock.mock('@integer(10000, 100000)'),
          erc20: Mock.mock('@integer(10000, 100000)'),
          rate: Mock.mock('@float(6, 6, 2, 2)'),
          symbol: "CNY"
        },
    });
  },
  [`POST ${BASE_URL}/wallet/deposit/info`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
          address: '0xBb0177c45882F1E739f19bd1b00DfeCEe895f177',
          min: '0.5',
          received: '2',
          qrcode: 'https://grammy.dev/images/grammY.png',
        },
    });
  },
  [`POST ${BASE_URL}/wallet/balanceOf`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        rows: [
          {
            chain: Mock.mock('@pick(["trc20", "bep20", "erc20"])'),
            amount: 100,
          } 
        ]
      },
    });
  },
  [`POST ${BASE_URL}/wallet/transfer`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {},
    });
  },
  [`POST ${BASE_URL}/wallet/checkUser`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        user: true
      },
    });
  },
  [`POST ${BASE_URL}/wallet/withdraw`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        user: true
      },
    });
  },
  [`POST ${BASE_URL}/wallet/historyList`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        total: 20,
        page: 1,
        rows: new Array(5).fill('').map( (item, index) => { 
          return {
            id: index + 1,
            amount: Mock.mock('@integer(10000, 100000)'),
            chain: Mock.mock('@pick(["trc20", "bep20", "erc20"])'),
            create_at: Date.now()
          } 
        })
      },
    });
  },
  [`POST ${BASE_URL}/wallet/historyDetail`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        id: 1,
        amount: Mock.mock('@integer(10000, 100000)'),
        chain: Mock.mock('@pick(["trc20", "bep20", "erc20"])'),
        status: Mock.mock('@pick([0, 1])'),
        create_at: Date.now()
      },
    });
  },

  [`GET ${BASE_URL}/balance`]: (req, res) => {
    console.log('---->', req.query)
    let data = {
      trc20: Mock.mock('@integer(10000, 100000)'),
      bep20: Mock.mock('@integer(10000, 100000)'),
      erc20: Mock.mock('@integer(10000, 100000)'),
      total: Mock.mock('@integer(10000, 100000)'),
    }
    if (req.query.coin && req.query.coin in data) {
      return res.json({
        ...obj,
        data: [{
          [req.query.coin]:data[req.query.coin]
        }],
      });
    } else {
      return res.json({
        ...obj,
        data: [data],
      });
    }
    
  },
  [`POST ${BASE_URL}/pwd`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      err: 0,
      msg: 'ok',
    });
  },
  [`POST ${BASE_URL}/transfer`]: (req, res) => {
    const body = req.body
    const resMsg = ['ok', '信息不完整', '收款人不存在', '余额不足']
    if (!body.from || !body.to || !body.amount || !body.coin) {
      return res.json({
        ...obj,
        err: 1,
        msg: resMsg[1]
      }); 
    }
    console.log('---->', req.body)
    return res.json({
      ...obj,
      err: 0,
    });
  },
  // 支票列表
  [`GET ${BASE_URL}/cheques`]: (req, res) => {
    console.log('---->', req.query)
    return res.json({
      ...obj,
      data: [{
        page: req.query.page,
        total: 25,
        items: 25,
        list: new Array(5).fill('').map( (item, index) => { 
          return {
            id: index + 1,
            amount: Mock.mock('@integer(10000, 100000)'),
            coin: Mock.mock('@pick(["trc20", "bep20", "erc20"])')
          } 
        })
      }]
    });
  },
  [`GET ${BASE_URL}/cheque`]: (req, res) => {
    console.log('---->', req.query)
    return res.json({
      ...obj,
      data: [
        {
          id: 1,
          amount: Mock.mock('@integer(10000, 100000)'),
          coin: Mock.mock('@pick(["trc20", "bep20", "erc20"])'),
          link: 'http://t.me/Bot?start=a'
        }
      ]
    });
  },
  [`POST ${BASE_URL}/cheque_delete`]: (req, res) => {
    return res.json({
      ...obj,
    });
  },

  [`POST ${BASE_URL}/add_cheque`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      msg: 'ok'
    });
  },

  // 红包列表
  [`GET ${BASE_URL}/hongbaos`]: (req, res) => {
    console.log('---->', req.query)
    return res.json({
      ...obj,
      data: [{
        page: req.query.page,
        total: 25,
        items: 25,
        list: new Array(5).fill('').map( (item, index) => { 
          return {
            id: index + 1,
            amount: Mock.mock('@integer(10000, 100000)'),
            coin: Mock.mock('@pick(["trc20", "bep20", "erc20"])'),
            type: Mock.mock('@pick([0, 1, 2])'),
          } 
        })
      }]
    });
  },
  [`GET ${BASE_URL}/hongbao`]: (req, res) => {
    console.log('---->', req.query)
    return res.json({
      ...obj,
      data: [
        {
          id: 1,
          amount: Mock.mock('@integer(10000, 100000)'),
          coin: Mock.mock('@pick(["trc20", "bep20", "erc20"])'),
          link: 'http://t.me/Bot?start=a',
          type: Mock.mock('@pick([0, 1, 2])'),
          expire: '2022/05/06 15:20:30',
          from: '11111111',
          to: '55555555',
          total: '10',
        }
      ]
    });
  },

  // 提现
  [`POST ${BASE_URL}/withdraw`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      msg: 'ok'
    });
  },

  // history 历史记录
  [`GET ${BASE_URL}/historys`]: (req, res) => {
    console.log('---->', req.query)
    let title = ''
    switch (req.query.cate) {
      case '0':
        title = Mock.mock('@pick(["转入","转出"])')
        break;
      case '1':
        break;
      case '2':
        break;
      case '3':
        break;
    }
    return res.json({
      ...obj,
      data: [{
        page: req.query.page,
        total: 25,
        items: 25,
        list: new Array(5).fill('').map( (item, index) => { 
          return {
            id: index + 1,
            title: title,
            order: Mock.mock('@datetime'),
            date: Mock.mock('@datetime'),
            type: Mock.mock('@pick([0, 1, 2])'),
          } 
        })
      }]
    });
  },
}

module.exports = release