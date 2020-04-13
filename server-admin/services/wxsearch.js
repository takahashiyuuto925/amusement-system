const db  = require('../db/index')


function saveHotSearch(p) {
    return new Promise((resolve, reject) => {
        try {
            if (p && p.openId && p.keyword) {
                const sql = `INSERT INTO \`hot_search\`(openId, keyword, create_dt) VALUES ('${p.openId}', '${p.keyword}', ${new Date().getTime()})`
                db.querySql(sql)
                resolve()
            }
        } catch (error) {
            reject(error)
        }
    })
}

function search(p, onSuccess, onFail) {
    if (!p || !p.keyword) {
      onFail && onFail()
      return
    }
    const page = p.page || 1;
    const pageSize = p.pageSize || 20;
    const offset = (page - 1) * pageSize;
    const sql = [
      `select * from book where title like '%${p.keyword}%' limit ${pageSize} offset ${offset}`,
      `select author from book where author like '%${p.keyword}%' limit 1`,
      `select * from (select category, categoryText from book group by category) as t1 where categoryText like '%${p.keyword}%' limit 1`,
      `select * from (select publisher from book group by publisher) as t1 where publisher like '%${p.keyword}%' limit 1`
    ]
    function handleSuccess(results) {
      const book = results[0]
      const author = results[1]
      const category = results[2]
      const publisher = results[3]
      onSuccess && onSuccess({
        book, author, category, publisher
      })
    }
    db.querySqlList(sql, handleSuccess, onFail)
}

function hotSearch() {
    return new Promise((resolve, reject) => {
        try {
            const sql = 'SELECT title, fileName FROM `hot_book` ' +
                'WHERE id >= (SELECT FLOOR(RAND() * (SELECT MAX(id) FROM `hot_book`))) ' +
                'ORDER BY id LIMIT 6'
            const data = db.querySql(sql)
            resolve(data)
        } catch (err) {
            reject(err)
        }
    })
    // const sql = 'select * from (select keyword, count(*) as num from hot_search group by keyword) as t1 order by num desc, keyword asc limit 10;'

}

function saveHotBook(p) {
    if (p && p.openId && p.fileName && p.title) {
        const sql = `INSERT INTO \`hot_book\`(openId, title, fileName, create_dt) VALUES ('${p.openId}', '${p.title}', '${p.fileName}', '${new Date().getTime()}')`
        db.querySql(sql)
    }
}

function searchBook(p) {
    return new Promise((resolve, reject) => {
        try {
            let where = 'where'
            p.publisher && (where = db.andLike(where, 'publisher', p.publisher))
            p.author && (where = db.andLike(where, 'author', p.author))
            p.category && (where = db.andLike(where, 'categoryText', p.category))
            p.categoryId && (where = db.and(where, 'category', p.categoryId))
            const page = p.page || 1;
            const pageSize = p.pageSize || 20;
            const offset = (page - 1) * pageSize;
            const sql = `select * from book ${where} limit ${pageSize} offset ${offset}`
            const data = db.querySql(sql)
            resolve(data)
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = {
    saveHotSearch,
    search,
    hotSearch,
    saveHotBook,
    searchBook
}