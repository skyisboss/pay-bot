const BASE_URL = '/api'
const Mock = require('mockjs')
const Random = require('mockjs')

const obj = {
  err: 0,
  msg: '',
  success: true,
}

const release = {
  [`POST ${BASE_URL}/secured/index`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        total: 20,
        page: 1,
        rows: new Array(5).fill('').map( (item, index) => { 
          return {
            id: index + 1,
            chain: Mock.mock('@pick(["trc20","bep20","erc20"])'),
            amount: Mock.mock('@integer(10000, 100000)'),
            status: Mock.mock('@pick([0,1])'),
          } 
        })
      },
    })
  },
  [`POST ${BASE_URL}/secured/withdraw`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      msg: '余额不足',
      success: false,
      data: {},
    })
  },
}

module.exports = release
