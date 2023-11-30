const BASE_URL = '/api'
const Mock = require('mockjs')
const Random = require('mockjs')

const obj = {
  err: 0,
  msg: '',
  success: true,
}

const release = {
  [`POST ${BASE_URL}/setting/backup`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        account: {
          id: 123123,
          username: '@pkmp4',
          sub_account: true
        }
      },
    })
  },
  [`POST ${BASE_URL}/setting/pincode`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {},
    })
  },
  [`POST ${BASE_URL}/setting/lang`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {},
    })
  },
  [`POST ${BASE_URL}/setting/currency`]: (req, res) => {
    console.log('---->', req.body)
    return res.json({
      ...obj,
      data: {},
    })
  },
}

module.exports = release
