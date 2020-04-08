const express = require("express")
const Result = require('../models/Result')
const boom = require('boom')
const bookmallService = require('../services/bookmall')

const router = express.Router()

router.get('/home', function (req, res, next) {
    bookmallService.bookHome().then(data => {
        new Result(data, '数据获取成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

router.get('/list', function(req, res, next) {
    bookmallService.bookList().then(data => {
        new Result(data, '数据获取成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})


router.get('/detail', function (req, res, next) {
    const {fileName} = req.query
    if (!fileName) {
        next(boom.badRequest(new Error('参数fileName不能为空')))
    } else {
        bookmallService.detailBook(fileName).then(book => {
            new Result(book, '获取图书成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
})

router.get('/shelf', function (req, res, next) {
    bookmallService.shelfBook().then(data => {
        new Result(data, '数据获取成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

module.exports = router