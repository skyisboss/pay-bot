const BASE_URL = '/api'
const Mock = require('mockjs')
const Random = require('mockjs')

const obj = {
  err: 0,
  msg: '',
  success: true,
}

const release = {
  [`POST ${BASE_URL}/payment/index`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        // id: 123
        // created: Mock.mock('@pick([false, true])')
      },
    })
  },
  [`POST ${BASE_URL}/payment/create`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      // err: 1,
      // msg: '前置条件不符合',
      data: {
        // created: Mock.mock('@pick([false, true])')
      },
    })
  },
  [`POST ${BASE_URL}/payment/token`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        token:  Mock.mock('@integer(10000, 100000)') + ':AACsE5fTREoQNCxOsLQ4ZsJsDZBOJiV8n068855'
      },
    })
  },
  [`POST ${BASE_URL}/payment/webhook`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        hook: 'https://google.com'
      },
    })
  },
  [`POST ${BASE_URL}/payment/withdraw`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      // success: false,
      // msg: '余额不足',
      data: {},
    })
  },
  [`POST ${BASE_URL}/payment/log/record`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        total: 20,
        page: 1,
        rows: new Array(5).fill('').map( (item, index) => { 
          return {
            id: index + 1,
            type: Mock.mock('@pick([1,2])'),
            token: Mock.mock('@pick(["bep20","erc20","trc20"])'),
            amount: Mock.mock('@integer(10000, 100000)'),
            status: Mock.mock('@pick([0,1])'),
            created_at: Date.now()
          } 
        })
      },
    })
  },
  [`POST ${BASE_URL}/payment/log/detail`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        id: 1,
        type: Mock.mock('@pick([1,2])'),
        token: Mock.mock('@pick(["bep20","erc20","trc20"])'),
        amount: Mock.mock('@integer(10000, 100000)'),
        status: Mock.mock('@pick([0,1])'),
        created_at: Date.now()
      },
    })
  },
}

module.exports = release
