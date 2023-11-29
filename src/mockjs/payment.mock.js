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
        created: Mock.mock('@pick([false, true])')
      },
    })
  },
}

module.exports = release
