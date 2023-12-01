const BASE_URL = '/api'
const Mock = require('mockjs')
const Random = require('mockjs')

const obj = {
  err: 0,
  msg: '',
  success: true,
}

const release = {
  [`POST ${BASE_URL}/vending/index`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
          id: 1,
          title: '',
          create_at: Date.now(),
          link: 'https://google.com',
          status: 1,
          count: {
            count1: 100,
            count2: 100,
          },
          amount: {
            trc20: 100,
            erc20: 100,
            bep20: 100,
          }
      },
    })
  },
  [`POST ${BASE_URL}/vending/setting`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {},
    })
  },
  [`POST ${BASE_URL}/vending/edit`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {},
    })
  },
  [`POST ${BASE_URL}/vending/delete`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {},
    })
  },
  [`POST ${BASE_URL}/vending/detail`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {
        id: 123,
        title: Mock.mock('@csentence'),
        price: Mock.mock('@integer(10, 10000)'),
        desc: Mock.mock('@csentence'),
        kami: Mock.mock('@csentence'),
        views: Mock.mock('@integer(10, 10000)'),
        sales: Mock.mock('@integer(10, 10000)'),
        created_at: Date.now(),
      },
    })
  },
}

module.exports = release
