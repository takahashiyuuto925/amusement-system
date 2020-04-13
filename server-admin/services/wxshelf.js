const db  = require('../db/index')
const { debug } = require('../utils/constant')

function getShelfByOpenId(shelf = null) {
    // debug && console.log(shelf,'shelf')
    return new Promise(async (resolve, reject) => {
        try {
            if (!shelf) {
                reject(new Error('未获取到用户信息，或没有该本书籍'))
            }
            let where = ''
            if (shelf.openId) {
                where += `t1.openId='${shelf.openId}'`
            }
            if (shelf.fileName) {
                if (where.length > 0) {
                    where += `and t1.fileName='${shelf.fileName}'`
                } else {
                    where = `t1.fileName='${shelf.fileName}'`
                }
            }
            const sql = `select t1.fileName, t1.openId, t1.\`date\`, t2.id, t2.cover, t2.title, t2.author, t2.publisher, t2.bookId, t2.category, t2.categoryText, t2.\`language\`, t2.rootFile from shelf as t1 left join book as t2 on t1.fileName=t2.fileName where ${where} order by t1.\`date\` asc`
            const data = await db.querySql(sql)
            resolve(data)
        } catch (err) {
            reject(err)
        }
    })
}

function saveToShelf(shelf) {
    return new Promise((resolve, reject) => {
        try {
            if (!shelf) {
                reject(new Error('添加书架失败，传入数据非对象'))
            } else {
                shelf.date = new Date().getTime()
                db.insert(shelf, 'shelf')
                resolve()
            }
        } catch (err) {
            reject(err)
        }
    })
}

function removeFromShelf(shelf) {
    return new Promise((resolve, reject) => {
        try {
            if (!shelf) {
                reject(new Error('未添加删除书籍信息'))
            }
            db.querySql(`DELETE FROM \`shelf\` where fileName='${shelf.fileName}' and openId='${shelf.openId}'`)
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = {
    getShelfByOpenId,
    saveToShelf,
    removeFromShelf
}