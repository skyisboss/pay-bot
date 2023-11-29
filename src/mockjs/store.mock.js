const BASE_URL = '/api'
const Mock = require('mockjs')
const Random = require('mockjs')

const obj = {
  err: 0,
  msg: '',
  success: true,
}

const release = {
  [`POST ${BASE_URL}/store/goods`]: (req, res) => {
    console.log('---->', req.params)
    return res.json({
      ...obj,
      data: {
        total: 20,
        page: 1,
        rows: new Array(5).fill('').map( (item, index) => { 
          return {
            id: index + 1,
            title: Mock.mock('@csentence'), //字符串
          } 
        })
      },
    })
  },
}

module.exports = release
