const db  = require('../db/index')

function register(user) {
    return new Promise(async (resolve, reject) => {
        const querySql = `select * from user where openId='${user.openId}'`
        const checkUser = await db.querySql(querySql)
        if (checkUser && checkUser.length === 0) {
            user.create_dt = new Date().getTime()
            await db.insert(user, 'user')
            resolve()
        } else {
            user.update_dt = new Date().getTime()
            await db.update(user, 'user', `WHERE openId='${user.openId}'`)
            resolve()
        }
    })
}

function day(openId) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!openId) {
                reject(new Error('未传入openId或openId为空'))
            }
            const sql = `select * from \`user\` where openId='${openId}'`
            let data = await db.querySql(sql)
            if (data && data.length > 0) {
                const user = data[0]
                const start = user.create_dt
                const now = new Date().getTime()
                const day = Math.ceil((now - start) / 1000 / 3600 / 24)
                resolve(day)
            } else {
                reject(new Error('查询失败，未获得该用户数据'))
            }
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = {
    register,
    day
}