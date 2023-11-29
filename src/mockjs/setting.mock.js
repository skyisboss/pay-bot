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
        account: Mock.mock('@pick(["", "pkmp4"])'),
      },
    })
  },
  [`POST ${BASE_URL}/setting/pinpwd`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        pinpwd: Mock.mock('@pick([false, true])'),
      },
    })
  },
}

module.exports = release
