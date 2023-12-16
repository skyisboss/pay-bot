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
          name: '',
          describe: '',
          payment: ['trc20','erc20','bep20'],
          created_at: Date.now(),
          link: 'https://google.com',
          status: 1,
          goods_count: 100,
          sales_count: 100,
          balance: {
            trc20: 100,
            erc20: 100,
            bep20: 100,
          }
      },
    })
  },
  [`POST ${BASE_URL}/vending/baseinfo`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        id: 1,
        name: '',
        describe: '',
        payment: ['trc20','erc20','bep20'],
        created_at: Date.now(),
        link: 'https://google.com',
        status: 1,
        goods_count: 100,
        sales_count: 100,
      },
    })
  },
  [`POST ${BASE_URL}/vending/create`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {},
    })
  },
  [`POST ${BASE_URL}/vending/setting`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {
        id: 1,
        name: '',
        describe: '',
        payment: ['trc20','erc20','bep20'],
        created_at: Date.now(),
        link: 'https://google.com',
        status: 1,
        goods_count: 100,
        sales_count: 100,
      },
    })
  },
  [`POST ${BASE_URL}/goods/index`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {
        total: 1,
        size: 5,
        page: 1,
        rows: [
          {
            id: 5,
            openid: "5279874291",
            title: "填写商品标题",
            price: 10,
            describe: "填写商品描述",
            content: "付款后显示内容",
            views: 0,
            sales: 0,
            status: 1,
            version: 17,
            logs: "[]",
            created_at: "2023-12-15T18:26:29.000Z",
            updated_at: "2023-12-15T15:59:18.000Z",
            deleted_at: null
          }
        ]
      },
    })
  },
  [`POST ${BASE_URL}/goods/edit`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {},
    })
  },
  [`POST ${BASE_URL}/goods/delete`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {},
    })
  },
  [`POST ${BASE_URL}/goods/detail`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {
        id: 123,
        title: Mock.mock('@csentence'),
        price: Mock.mock('@integer(10, 10000)'),
        describe: Mock.mock('@csentence'),
        content: Mock.mock('@csentence'),
        views: Mock.mock('@integer(10, 10000)'),
        sales: Mock.mock('@integer(10, 10000)'),
        status: 1,
        created_at: Date.now(),
      },
    })
  },
}

module.exports = release
