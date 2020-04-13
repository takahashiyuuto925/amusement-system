const db  = require('../db/index')
const wxsearchService = require('./wxsearch')
const { UPLOAD_URL, fileUrl, Category } = require('../utils/constant')

function numData(tem, num) {
    return tem.filter(item => item['category'] === num).length
}

async function home(openId) {
    if (!openId) {
        return new Error('未传入openId')
    } else {
        let hotSearchSql =  `select * from hot_search limit 1`// 搜索热门搜索
        let shelfSql = `SELECT * FROM book WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM book))) LIMIT 3` // 个人书架随机3本书
        let recommendSql = `SELECT * FROM book WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM book))) LIMIT 6` // 推荐6本书（防止个人书架为空）
        let freeReadSql = `SELECT * FROM book WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM book))) LIMIT 4` // 免费阅读4本书
        let hotBookSql = `SELECT * FROM book WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM book))) LIMIT 4` // 当前最热4本书
        let temSql = `SELECT * FROM book WHERE cover != \'\'` // 6个分类及封面图片
        let shelfCountSql = `select * from shelf where openId='${openId}'` // 书架图书统计

        const hotSearch = await db.querySql(hotSearchSql)
        const shelf = await db.querySql(shelfSql)
        const recommend = await db.querySql(recommendSql)
        const freeRead = await db.querySql(freeReadSql)
        const hotBook = await db.querySql(hotBookSql)
        let tem = await db.querySql(temSql)
        const shelfCount = await db.querySql(shelfCountSql)
        const category = [
            {category: 1,num: numData(tem, 1), categoryText: Category[1], cover: `${UPLOAD_URL}/img/74b730ade221cdfadd3ff486beb458a7.jpeg`, cover2: `${UPLOAD_URL}/img/6079911ae66591c0c92768c0d552b552.jpeg`},
            // {category: 1,num: numData(tem, 1), categoryText: Category[1], cover: `https://read.lxyamusement.cn:9000/upload/img/74b730ade221cdfadd3ff486beb458a7.jpeg`, cover2: `https://read.lxyamusement.cn:9000/upload/img/6079911ae66591c0c92768c0d552b552.jpeg`},
            {category: 2,num: numData(tem, 2), categoryText: Category[2], cover: `${UPLOAD_URL}/img/56a93c5159bb6b8c20832963511757a8.jpeg`, cover2: `${UPLOAD_URL}/img/d136190aa2fe28ef3d2d448ba1a60b09.jpeg`},
            {category: 3,num: numData(tem, 3), categoryText: Category[3], cover: `${UPLOAD_URL}/img/945052d75b96c18d922079e3afd04c62.jpeg`, cover2: `${UPLOAD_URL}/img/658857d6fd5375cd1fe63f6ec50e450f.jpeg`},
            {category: 4,num: numData(tem, 4), categoryText: Category[4], cover: `${UPLOAD_URL}/img/a41428fa1c456172c7a370cf813d309d.jpeg`, cover2: `${UPLOAD_URL}/img/f1c3820608bb3bdfd42cb16085e2e366.jpeg`},
            {category: 5,num: numData(tem, 5), categoryText: Category[5], cover: `${UPLOAD_URL}/img/3218e30466ca172f9176c5fc56ea92cf.jpeg`, cover2: `${UPLOAD_URL}/img/277a8096d9d6742f81dbd7a3b2bb43d4.jpeg`}
        ]
        let data = {}
        data.hotSearch = hotSearch[0]
        data.shelf = shelf
        data.recommend = recommend
        data.freeRead = freeRead
        data.hotBook = hotBook
        data.category = category
        data.shelfCount = (shelfCount && shelfCount.length > 0 && shelfCount.length) || 0
        data.banner = {
          img: 'https://read.lxyamusement.cn:9000/defaultCover/wxwelcomebg.jpg',
          title: '欢迎来到爱尚书城',
          subTitle: '立即找书',
          url: 'https://read.lxyamusement.cn/book'
        }
        return data
    }
}

function recommend() {
    const sql = 'select t2.* from (SELECT title, fileName FROM hot_book WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM hot_book))) LIMIT 3) as t1 left join book as t2 on t1.fileName=t2.fileName'
    const data = db.querySql(sql)
    return data
}

function freeRead() {
    const sql = 'SELECT * FROM book WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM book))) LIMIT 4'
    const data = db.querySql(sql)
    return data
}

function hotBook() {
    const sql = 'select t2.* from (SELECT title, fileName FROM `hot_book` WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM `hot_book`))) LIMIT 4) as t1 left join book as t2 on t1.fileName=t2.fileName'
    const data = db.querySql(sql)
    return data
}

function bookDetail(query) {
    return new Promise(async (resolve, reject) => {
        try {
            const fileName = query.fileName
            const openId = query.openId
            const sql = `select * from book where fileName='${fileName}'`
            const results = await db.querySql(sql)
            if (results && results.length === 0) {
                resolve([])
            } else {
                const book = results[0]
                book['cover'] = `${book.cover}`
                book['selected'] = false
                book['private'] = false
                book['cache'] = false
                book['haveRead'] = 0
                book['opf'] = `${fileUrl}/${book.fileName}/${book.rootFile}`
                if (openId && openId.length > 0) {
                    wxsearchService.saveHotBook({
                        fileName: book.fileName,
                        title: book.title,
                        openId
                    })
                }
                const sql1 = [
                    'select t2.avatarUrl, t2.nickName, t1.create_dt ' +
                    'from (select openId, title, fileName, max(create_dt) as create_dt ' +
                    'from hot_book ' +
                    'where fileName=\'' + fileName + '\' ' +
                    'group by openId ' +
                    'order by create_dt desc ' +
                    'limit 10) as t1 ' +
                    'left join `user` as t2 on t1.openId=t2.openId',
                    'select count(*) as count from hot_book where fileName=\'' + fileName + '\'',
                    `select * from \`rank\` where fileName='${fileName}' and openId='${openId}'`,
                    `select count(*) as count, ROUND(avg(\`rank\`), 2) as \`rank\` from \`rank\` where fileName='${fileName}'`
                  ]
                await db.querySqlList(sql1, 
                    (results) => {
                        book.readers = results[0]
                        book.readerNum = results[1][0].count
                        book.rank = (results[2] && results[2].length > 0 && results[2][0].rank) || 0
                        book.rankNum = results[3][0].count || 0
                        book.rankAvg = results[3][0].rank || 0
                    },
                    (err) => {
                        reject(err)
                    }        
                )
                resolve(book)
            }
        } catch (err) {
            reject(err)
        }
    })
}

function saveBookRank(fileName, openId, rank) {
    return new Promise(async (resolve, reject) => {
        try {
            const querySql = `select * from \`rank\` where fileName='${fileName}' and openId='${openId}'`
            const insertSql = `INSERT INTO \`rank\`(fileName, openId, \`rank\`, create_dt) VALUES ('${fileName}', '${openId}', '${rank}', ${new Date().getTime()})`
            const updateSql = `update \`rank\` set \`rank\`='${rank}',create_dt=${new Date().getTime()} where fileName='${fileName}' and openId='${openId}'`
            const result = await db.querySql(querySql)
            if (result && result.length > 0) {
                await db.querySql(updateSql)
            } else {
                await db.querySql(insertSql)
            }
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

function getBookContents(fileName) {
    return new Promise((resolve, reject) => {
        try {
            const sql = `select * from contents where fileName='${fileName}' order by \`order\` asc`
            const data = db.querySql(sql)
            if (data && data.length === 0) {
                reject(new Error('查询失败，无该类数据'))
            } else {
                resolve(data)
            }
        } catch (err) {
            reject(err)
        }
    })
}

// function allCategory() {
//     return new Promise((resolve, reject) => {
//         const sql = 'select t1.cover, t2.* from (' +
//           'select t1.cover, t1.category, t1.categoryText, count(1) as `rank` ' +
//           'from book as t1 ' +
//           'left join book as t2 ' +
//           'on t1.category=t2.category and t1.id>=t2.id ' +
//           'where t1.category in (select category from category) ' +
//           'group by t1.category, t1.fileName ' +
//           'order by t1.categoryText ' +
//           ') as t1 ' +
//           'left join category_limit as t2 ' +
//           'on t1.category=t2.category ' +
//           'where `rank` < 3;'
//         let data = db.querySql(sql)
//         const _category = []
//         data.forEach(item => {
//             const findItem = _category.find(i => i.category === item.category)
//             if (!findItem) {
//                 _category.push(item)
//             } else {
//                 findItem.cover2 = item.cover
//             }
//         })
//         resolve(data)
//     })
// }

module.exports = {
    home,
    recommend,
    freeRead,
    hotBook,
    bookDetail,
    saveBookRank,
    getBookContents,
    allCategory
}