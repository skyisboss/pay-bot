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
    console.log('---->', req.body)
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
  [`POST ${BASE_URL}/wallet/rate`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {
        usd_cny: '6.58',
        usd_php: '59.00',
        usd_trc20: '0.9',
        usd_erc20: '0.9',
        usd_bep20: '0.9',
        updated: Date.now(),
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
        counts: {
          count1: Mock.mock('@integer(10000, 100000)'),
          count2: Mock.mock('@integer(10000, 100000)'),
          count3: Mock.mock('@integer(10000, 100000)'),
        },
        rows: new Array(5).fill('').map( (item, index) => { 
          return {
            id: index + 1,
            amount: Mock.mock('@integer(10000, 100000)'),
            chain: Mock.mock('@pick(["trc20", "bep20", "erc20"])'),
            hbType: Mock.mock('@pick([0,1,2])'),
            created_at: Date.now()
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

  [`POST ${BASE_URL}/wallet/fahongbao`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
      },
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