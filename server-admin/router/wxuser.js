const express = require("express")
const request = require('request')
const Result = require('../models/Result')
const boom = require('boom')
const wxuserService = require('../services/wxuser')
const {OPEN_ID_NOT_NULL} = require('../utils/msg')

const router = express.Router()

function onFail(res, msg, code = -1, data = null) {
    const result = {
        code: code,
        msg: msg
    }
    data && (result.data = data)
    res.json(result)
}

function onSuccess(res, msg, data = {}, code = 0) {
    if (data.session_key) {
        delete data.session_key
    }
    res.json({
        code: code,
        msg: msg,
        data
    })
}

// 获取openid
router.get('/openId/get', (req, res) => {
    const appId = req.query.appId
    const code = req.query.code
    const secret = req.query.secret
    if (!appId || !code) {
      onFail(res, '获取appId失败')
    } else {
      if (!secret) {
        secret = req.query.secret
      }
      if (secret) {
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
        request.get(url, function(err, response, body) {
          if (!err) {
            const data = JSON.parse(body)
            if (data.session_key && data.openid) {
              onSuccess(res, '获取openId成功', data)
            } else {
              onFail(res, '获取openId失败')
            }
          } else {
            onFail(res, '获取openId失败')
          }
        })
      } else {
        onFail(res, '获取密钥失败')
      }
    }
})

// 注册用户信息
router.post('/register', (req, res) => {
    const openId = req.body.openId
    let platform = req.body.platform
    if (!platform) {
      req.body.platform = 'wx'
    }
    if (!openId) {
      onFail(res, OPEN_ID_NOT_NULL)
    } else {
        wxuserService.register(req.body).then(() => {
            new Result('登录成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
})

// 用户加入小程序时间
router.get('/day', (req, res, next) => {
  const openId = req.query.openId
  if (!openId) {
    onFail(res, OPEN_ID_NOT_NULL)
  } else {
    wxuserService.day(openId).then(day => {
      new Result(day, '查询成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
})

module.exports = router