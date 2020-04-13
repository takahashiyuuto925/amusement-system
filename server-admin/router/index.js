const express = require('express')
const boom = require('boom')
const userRouter = require('./user')
const bookRouter = require('./book')
const bookmallRouter = require('./bookmall')
const wxbookRouter = require('./wxbook')
const wxuserRouter = require('./wxuser')
const jwtAuth = require('./jwt')
const Result = require('../models/Result')

// 注册路由
const router = express.Router()

router.use(jwtAuth)

// router.get('/', (req, res) => {
//     res.send('测试语句')
// })

router.use('/user', userRouter)
router.use('/book', bookRouter)
router.use('/bookmall', bookmallRouter)
router.use('/wxbook', wxbookRouter)
router.use('/wxuser', wxuserRouter)

router.get('/transaction/list', function (req, res) {
  res.send({
    code: 0,
    data: {
      total: 1,
      items: [{ order_no: "F50d3f0c-A432-c69F-77F2-89b43eACcaFA",
      timestamp: 259630222282,
      username: "Maria Hernandez",
      price: 8396.08,
      status: "pending" }]
    }
  })
})

/**
 * 集中处理404请求的中间件
 * 该中间件必须放在正常处理流程之后
 * 否则，会拦截正常请求
 */
router.use((req, res, next) => {
    next(boom.notFound('接口不存在'))
})

/**
 * 自定义路由异常处理中间件
 * 方法的参数不能减少
 * 方法的必须放在路由最后
 */
router.use((err, req, res, next) => {
    // console.log(err)
    if (err.name && err.name === 'UnauthorizedError') {
      const { status = 401, message } = err
      new Result(null, 'token验证失败', {
        error: status,
        errMsg: message
      }).jwtError(res.status(status))
    }else {
      const msg = (err && err.message) || '系统错误'
      const statusCode = (err.output && err.output.statusCode) || 500;
      const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
      new Result(null, msg, {
        error: statusCode,
        errorMsg
      }).fail(res.status(statusCode))
    }
    
})
  
module.exports = router