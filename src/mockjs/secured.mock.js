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
    console.log('---->', req.body)
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
  [`POST ${BASE_URL}/secured/create`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {
        id: 123
      },
    })
  },
  [`POST ${BASE_URL}/secured/edit`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {},
    })
  },
  [`POST ${BASE_URL}/secured/detail`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {
        id: 592813,
        chain: 'trc20',
        amount: 100,
        status: 1,
        deposit: 50,
        percent: 0.5,
        owner: '@pkmp4',
        partner: '',
        link: 'https://t.me?bot?start=123',
        content: ''
      },
    })
  },
}

module.exports = release
