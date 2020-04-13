const express = require("express")
const Result = require('../models/Result')
const boom = require('boom')
const wxbookService = require('../services/wxbook')
const wxsearchService = require('../services/wxsearch')
const wxshelfService = require('../services/wxshelf')
const {
    OPEN_ID_NOT_NULL,
    QUERY_OK,
    QUERY_FAILED
  } = require('../utils/msg')

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
    res.json({
      code: code,
      msg: msg,
      data
    })
}

// 主页数据
router.get('/home', function(req, res, next) {
    let openId = req.query.openId
    if (!openId) {
      onFail(res, OPEN_ID_NOT_NULL)
    } else {
        openId = decodeURIComponent(openId)
        wxbookService.home(openId).then(data => {
            new Result(data, '数据获取成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
})

// 推荐图书(点击换一批触发)
router.get('/home/recommend', function(req, res, next) {
    wxbookService.recommend().then(data => {
        new Result(data, '数据获取成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

// 免费阅读(点击换一批触发)
router.get('/home/freeRead', function(req, res, next) {
    wxbookService.freeRead().then(data => {
        new Result(data, '数据获取成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

// 热门图书(点击换一批触发)
router.get('/home/hotBook', function(req, res, next) {
    wxbookService.hotBook().then(data => {
        new Result(data, '数据获取成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

// 搜索图书(搜索词加入热门搜索词)
router.get('/search', (req, res) => {
    function onQuerySuccess(results) {
      onSuccess(res, QUERY_OK, results)
      if (openId && openId.trim().length > 0) {
        wxsearchService.saveHotSearch({ keyword, openId })
      }
    }
  
    let keyword = req.query.keyword
    let page = req.query.page || 1
    let pageSize = req.query.pageSize || 20
    let openId = req.query.openId
    if (keyword && keyword.length > 0) {
      keyword = decodeURIComponent(keyword)
      wxsearchService.search(
        { keyword, page, pageSize },
        onQuerySuccess,
        () => onFail(res, QUERY_FAILED)
      )
    } else {
      onFail(res, QUERY_FAILED)
    }
})

// 获取热门搜索词
router.get('/hot-search', (req, res, next) => {
    wxsearchService.hotSearch().then(data => {
        new Result(data, '查询成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

// 图书详情
router.get('/detail', (req, res, next) => {
    wxbookService.bookDetail(req.query).then(book => {
        new Result(book, '数据获取成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

// 保存评分
router.get('/rank/save', (req, res, next) => {
    const openId = req.query.openId
    const fileName = req.query.fileName
    const rank = req.query.rank
    if (!openId) {
      new Error(OPEN_ID_NOT_NULL)
    } else {
      wxbookService.saveBookRank(fileName, openId, rank).then(() => {
            new Result('保存成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    }
})

// 获取图书章节
router.get('/contents', (req, res, next) => {
    const fileName = req.query.fileName || ''
    wxbookService.getBookContents(fileName).then(data => {
        new Result(data, '查询成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

// 获取用户书架信息
router.get('/shelf/get', (req, res, next) => {
    const openId = req.query.openId
    const fileName = req.query.fileName
    wxshelfService.getShelfByOpenId({ openId, fileName }).then(data => {
        new Result(data, '获取书架信息成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

// 加入书架
router.get('/shelf/save', (req, res, next) => {
    let shelf = req.query.shelf
    if (shelf) {
        shelf = decodeURIComponent(shelf)
        wxshelfService.saveToShelf(JSON.parse(shelf)).then(() => {
            new Result('添加成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    } else {
      new Error('添加失败')
    }
})

// 移出书架
router.get('/shelf/remove', (req, res, next) => {
    let shelf = req.query.shelf
    if (shelf) {
        shelf = decodeURIComponent(shelf)
        wxshelfService.removeFromShelf(JSON.parse(shelf)).then(() => {
            new Result('移出成功').success(res)
        }).catch(err => {
            next(boom.badImplementation(err))
        })
    } else {
      new Error('移出失败')
    }
})

// 搜索图书列表
router.get('/search-list', (req, res) => {
    const publisher = req.query.publisher
    const author = req.query.author
    const category = req.query.category
    const categoryId = req.query.categoryId
    let page = req.query.page || 1
    let pageSize = req.query.pageSize || 20
    if (publisher || author || category || categoryId) {
      const params = {}
      publisher && (params.publisher = decodeURIComponent(publisher))
      author && (params.author = decodeURIComponent(author))
      category && (params.category = decodeURIComponent(category))
      categoryId && (params.categoryId = decodeURIComponent(categoryId))
      params.page = page
      params.pageSize = pageSize
      wxsearchService.searchBook(params).then(data => {
        new Result(data, '查询成功').success(res)
      }).catch(err => {
        next(boom.badImplementation(err))
      })
    } else {
      onFail(res, QUERY_FAILED)
    }
})

// 分类图书列表
router.get('/category/list', (req, res, next) => {
    wxbookService.allCategory().then(data => {
        new Result(data, '查询成功').success(res)
    }).catch(err => {
        next(boom.badImplementation(err))
    })
})

module.exports = router