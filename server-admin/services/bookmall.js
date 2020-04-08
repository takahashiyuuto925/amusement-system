const db = require('../db')
const { UPLOAD_URL, BANNER_URL, Category } = require('../utils/constant')
const Book = require('../models/Book')

function randomArray(n, l) {
    let rnd = []
    for (let i = 0; i < n; i++) {
        rnd.push(Math.floor(Math.random() * l))
    }
    return rnd
}

function createData(tem, key) {
    return handleData(tem[key])
     
}

function handleData(data) {
    data['selected'] = false
    data['private'] = false
    data['cache'] = false
    data['haveRead'] = 0
    return data
}

function createGuessYouLike(data) {
    const n = parseInt(randomArray(1, 3)) + 1
    data['type'] = n
    switch (n) {
        case 1:
            data['result'] = data.id % 2 === 0 ? '玄幻' : '都市'
            data['percent'] = data.id % 2 === 0 ? '78%' : '50%'
            break;
        case 2:
            data['result'] = data.id % 2 === 0 ? '奇幻' : '轻小说'
            data['percent'] = data.id % 2 === 0 ? '76%' : '80%'
            break;
        case 3:
            data['result'] = data.id % 2 === 0 ? '仙侠' : '猎奇'
            data['percent'] = data.id % 2 === 0 ? '92%' : '85%'
            break;
    }
    return data
}

function createRecommend(data) {
    data['readers'] = Math.floor(data.id / 2 * randomArray(1 ,100))
    return data
}

function categoryListData(tem) {
    const len = Category.length + 1
    let data = []
    for (let i = 1; i < len; i++) {
        let list = tem.filter(item => item['category'] === i).slice(0,4)
        let res = {'category': i, list}
        data.push(res)
    }
    // console.log(data,'789987')
    return data
}

function numData(tem, num) {
    // console.log(tem.filter(item => item['category'] === num),'00')
    return tem.filter(item => item['category'] === num).length
}

function categoryName(categoryText) {
    switch (categoryText) {
        case '玄幻':
            return 'xuanhuan'
            break;
        case '奇幻':
            return 'qihuan'
            break;
        case '仙侠':
            return 'xianxia'
            break;
        case '都市':
            return 'dushi'
            break;
        case '轻小说':
            return 'qingxiaoshuo'
            break;
    }
}

function setListData(res, categoryText) {
    return res.filter(item => item.categoryText === categoryText)
}

async function bookList() {
    const sql = `SELECT * FROM book WHERE cover != \'\'`
    let res = await db.querySql(sql)
    let data = {}
    res.map(item => handleData(item))
    Category.forEach(categoryText => {
        data[categoryName(categoryText)] = setListData(res, categoryText)
    })
    return {data, 'total':res.length}
}

async function bookHome() {
    const sql = `SELECT * FROM book WHERE cover != \'\'`
    let tem = await db.querySql(sql)
    const length = tem.length
    const banner = `${BANNER_URL}/defaultCover/home_banner.jpg`
    const guessYouLike = []
    const recommend = []
    const featured = []
    const random = []
    const categoryList = []
    const categories = [
        {category: 1,num: numData(tem, 1), img1: `${UPLOAD_URL}/img/74b730ade221cdfadd3ff486beb458a7.jpeg`, img2: `${UPLOAD_URL}/img/6079911ae66591c0c92768c0d552b552.jpeg`},
        {category: 2,num: numData(tem, 2), img1: `${UPLOAD_URL}/img/56a93c5159bb6b8c20832963511757a8.jpeg`, img2: `${UPLOAD_URL}/img/d136190aa2fe28ef3d2d448ba1a60b09.jpeg`},
        {category: 3,num: numData(tem, 3), img1: `${UPLOAD_URL}/img/945052d75b96c18d922079e3afd04c62.jpeg`, img2: `${UPLOAD_URL}/img/658857d6fd5375cd1fe63f6ec50e450f.jpeg`},
        {category: 4,num: numData(tem, 4), img1: `${UPLOAD_URL}/img/a41428fa1c456172c7a370cf813d309d.jpeg`, img2: `${UPLOAD_URL}/img/f1c3820608bb3bdfd42cb16085e2e366.jpeg`},
        {category: 5,num: numData(tem, 5), img1: `${UPLOAD_URL}/img/3218e30466ca172f9176c5fc56ea92cf.jpeg`, img2: `${UPLOAD_URL}/img/277a8096d9d6742f81dbd7a3b2bb43d4.jpeg`}
    ]
    randomArray(9, length).forEach(key => {
        guessYouLike.push(createGuessYouLike(createData(tem, key)))
    })
    randomArray(3, length).forEach(key => {
        recommend.push(createRecommend(createData(tem, key)))
    })
    randomArray(6, length).forEach(key => {
        featured.push(createData(tem, key))
    })
    randomArray(1, length).forEach(key => {
        random.push(createData(tem, key))
    })
    categoryList.push(...categoryListData(tem))
    const data = {guessYouLike, banner, recommend, featured, random, categoryList, categories}
    return data
}

async function detailBook(fileName) {
    return new Promise(async (resolve, reject) => {
        const bookSql = `select * from book where fileName='${fileName}'`
        const contentsSql = `select * from contents where fileName='${fileName}' order by \`order\``
        const book = await db.queryOne(bookSql)
        const contents = await db.querySql(contentsSql)
        if (book) {
            book.cover = Book.genCoverUrl(book)
            book.contentsTree = Book.genContentsTree(contents)
            resolve(book)
        } else {
            reject(new Error('电子书不存在'))
        }
    })
}

async function shelfBook() {
    let bookList = [] // 书架内的书籍内容
    return {bookList}
}
module.exports = {
    detailBook,
    shelfBook,
    bookList,
    bookHome
}