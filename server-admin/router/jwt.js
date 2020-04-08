const jwt = require('express-jwt')
const { PRIVATE_KEY } = require('../utils/constant')

module.exports = jwt({
    secret : PRIVATE_KEY,
    credentialsRequired: true  // 值为true时，开启jwt认证
}).unless({
    path: [
        '/',
        '/user/login',
        '/bookmall/home',
        '/bookmall/list',
        '/bookmall/detail',
        '/bookmall/shelf',
    ] // jwt认证白名单
})