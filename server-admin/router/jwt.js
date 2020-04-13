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
        '/wxbook/home',
        '/wxbook/home/recommend',
        '/wxbook/home/freeRead',
        '/wxbook/home/hotBook',
        '/wxbook/search',
        '/wxbook/hot-search',
        '/wxbook/search-list',
        '/wxbook/detail',
        '/wxbook/rank/save',
        '/wxbook/contents',
        '/wxbook/shelf/get',
        '/wxbook/shelf/save',
        '/wxbook/shelf/remove',
        '/wxbook/category/list',
        '/wxuser/openId/get',
        '/wxuser/register',
        '/wxuser/day'
    ] // jwt认证白名单
})