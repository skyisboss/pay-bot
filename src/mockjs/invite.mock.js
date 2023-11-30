const BASE_URL = '/api'
const Mock = require('mockjs')
const Random = require('mockjs')

const obj = {
  err: 0,
  msg: '',
  success: true,
}

const release = {
  [`POST ${BASE_URL}/invite/index`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        link: 'http://t.me/?start=iAzXOz26pE6'
      },
    })
  },
  [`POST ${BASE_URL}/invite/detail`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        invites: {
          count1:Mock.mock('@integer(10000, 100000)'),
          count2:Mock.mock('@integer(10000, 100000)'),
          count3:Mock.mock('@integer(10000, 100000)'),
          count4:Mock.mock('@integer(10000, 100000)'),
        },
        balance: {
          trc20:Mock.mock('@integer(10000, 100000)'),
          bep20:Mock.mock('@integer(10000, 100000)'),
          erc20:Mock.mock('@integer(10000, 100000)'),
        },
      },
    })
  },
  [`POST ${BASE_URL}/invite/withdraw`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      // msg: '余额不足',
      // success: false,
      data: {},
    })
  },
}

module.exports = release
