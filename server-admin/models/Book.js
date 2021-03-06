const {MIME_TYPE_EPUB, UPLOAD_URL, UPLOAD_PATH} = require('../utils/constant')
const fs = require('fs')
const Epub = require('../utils/epub')
const path = require('path')
const xml2js = require('xml2js').parseString

class Book {
    constructor(file, data){
        if (file) {
            this.createBookFromFile(file)
        }else{
            this.createBookFromData(data)
        }
    }

    createBookFromFile(file){
        // console.log(file,'文件')
        const {destination, filename, mimetype=MIME_TYPE_EPUB, path, originalName} = file //为mimetype添加默认值将文件类型默认设置为电子书文件
        const suffix = mimetype === MIME_TYPE_EPUB ? '.epub' : '' //电子书文件后缀名
        const oldBookPath = path  // 电子书原有路径
        const bookPath = `${destination}/${filename}${suffix}`  // 电子书新路径
        const url = `${UPLOAD_URL}/book/${filename}${suffix}` // 电子书下载url链接
        const unzipPath = `${UPLOAD_PATH}/unzip/${filename}` // 电子书解压后的文件夹路径
        const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`  // 电子书解压后文件夹url链接
        if (!fs.existsSync(unzipPath)) { //同步判断是否存在解压文件夹路径
            fs.mkdirSync(unzipPath, { recursive: true })  //recursive迭代创建unzippath
        }
        if (fs.existsSync(oldBookPath) && !fs.existsSync(bookPath)) {
            fs.renameSync(oldBookPath, bookPath)
        }
        this.fileName = filename  //文件名
        this.path = `/book/${filename}${suffix}` // epub文件相对路径
        this.filePath = this.path
        this.unzipPath = `/unzip/${filename}` // epub解压后相对路径
        this.url = url // epub下载链接
        this.title = '' // 书名
        this.author = '' //作者
        this.publisher = '' //出版社
        this.contents = [] //目录
        this.cover = '' // 封面图片url
        this.coverPath = '' // 封面图片路径
        this.category = '' // 分类ID
        this.categoryText = '' // 分类名称
        this.language = '' // 语种
        this.unzipUrl = unzipUrl // 解压后文件夹链接
        this.originalName = originalName // 电子书文件原名
    }

    createBookFromData(data){
        this.fileName = data.fileName
        this.cover = data.cover
        this.title = data.title
        this.author = data.author
        this.publisher = data.publisher
        this.bookId = data.bookId
        this.language = data.language
        this.rootFile = data.rootFile
        this.originalName = data.originalName || (data.title + '.epub')
        this.path = data.path || data.filePath
        this.filePath = data.path || data.filePath
        this.unzipPath = data.unzipPath
        this.coverPath = data.coverPath
        this.createUser = data.username
        this.createDate = new Date().getTime()
        this.updateDate = new Date().getTime()
        this.updateType = data.updateType === 0 ? data.updateType : 1
        this.category = data.category || 99
        this.categoryText = data.categoryText || '自定义'
        this.contents = data.contents || []
    }

    parse(){
        return new Promise((resolve, reject) => {
            const bookPath = `${UPLOAD_PATH}${this.filePath}`
            if (!fs.existsSync(bookPath)) {
                reject(new Error('电子书不存在'))
            }
            const epub = new Epub(bookPath)
            epub.on('error', err => {
                reject(err)
            })
            epub.on("end", err => {
                if (err) {
                    reject(err)
                }else{
                    // console.log(epub.manifest,'信息')
                    const {
                        title,
                        creator,
                        creatorFileAs,
                        language,
                        cover,
                        publisher  
                    } = epub.metadata
                    if (!title) {
                        reject(new Error('书名为空！！！'))
                    }else{
                        this.title = title
                        this.language = language || 'zh-cn'
                        this.author = creator || creatorFileAs || '佚名'
                        this.publisher = '爱读书' //将解构出的publisher赋值过来可以获得真正的出版信息
                        this.rootFile = epub.rootFile
                        const handleGetImage = (err, file, mimetype) => {
                            if (err) {
                                reject(err)
                            } else {
                                if (mimetype) {
                                    const suffix = mimetype.split('/')[1]
                                    let coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                                    let coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}` 
                                    fs.writeFileSync(coverPath, file, 'binary')
                                    this.coverPath = `/img/${this.fileName}.${suffix}` 
                                    this.cover = coverUrl
                                }
                                resolve(this)
                            }
                        }
                        try {
                            this.unzip()
                            this.parseContents(epub).then(({chapters,chapterTree}) => {
                                this.contents = chapters
                                this.contentsTree = chapterTree
                                epub.getImage(cover, handleGetImage)
                            })    
                        } catch (error) {
                            reject(error)
                        }
                    }
                }
            })
            epub.parse()
        })
    }
    unzip(){
        const AdmZip = require('adm-zip')
        const zip = new AdmZip(Book.genPath(this.path))
        zip.extractAllTo(Book.genPath(this.unzipPath), true)
    }

    parseContents(epub){
        function getNcxFilePath() {
            const spine = epub &&  epub.spine
            const manifest = epub && epub.manifest
            const ncx = spine.toc && spine.toc.href
            const id = spine.toc && spine.toc.id
            if (ncx) {
                return ncx
            } else {
                return manifest[id].href
            }
        }

        function findParent(array, level = 0, pid = '') {
            return array.map(item => {
                item.level = level
                item.pid = pid
                if (item.navPoint && item.navPoint.length > 0) {
                    item.navPoint = findParent(item.navPoint, level + 1, item['$'].id)
                } else if (item.navPoint) {
                    item.navPoint.level = level + 1
                    item.navPoint.pid = item['$'].id
                }
                return item
            })
        }

        function flatten(array) {
            // console.log(array,'5')
            // 拷贝
            return [].concat(...array.map(item => {
                if (item.navPoint && item.navPoint.length > 0) {
                    return [].concat(item.navPoint, ...flatten(item.navPoint))
                } else if (item.navPoint) {
                    return [].concat(item, item.navPoint)
                }
                return item
            }))
        }

        const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`)
        if (fs.existsSync(ncxFilePath)) {
            return new Promise((resolve, reject) => {
                const xml = fs.readFileSync(ncxFilePath, 'utf-8')
                const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH, '')
                const fileName = this.fileName
                const unzipPath = this.unzipPath
                xml2js(xml, {
                    explicitArray: false,
                    ignoreAttrs: false
                }, function (err, json) {
                    if (err) {
                        reject(err)
                    } else {
                        const navMap = json.ncx.navMap
                        // console.log(navMap.navPoint,'010')
                        if (navMap.navPoint && navMap.navPoint.length > 0) {
                            navMap.navPoint = findParent(navMap.navPoint)
                            const newNavMap = flatten(navMap.navPoint)
                            // console.log(newNavMap[0], newNavMap[1], newNavMap[2], '11111')
                            const chapters = []
                            newNavMap.forEach((chapter, index) => {
                                const src = chapter.content['$'].src
                                chapter.id = `${src}`
                                chapter.href = `${dir}/${src}`.replace(unzipPath,'')
                                chapter.text = `${UPLOAD_URL}${dir}/${src}`
                                chapter.label = chapter.navLabel.text || ''
                                chapter.navId = chapter['$'].id
                                chapter.fileName = fileName
                                chapter.order = index + 1
                                chapters.push(chapter)
                                
                            })
                            const chapterTree = Book.genContentsTree(chapters)
                            resolve({chapters, chapterTree})
                        } else {
                            reject( new Error('目录解析失败，目录数为0'))
                        }
                    }
                })
            })
        } else {
            throw new Error('目录文件缺失！！')
        }
    }

    toDb() {
        return {
            fileName: this.fileName,
            cover: this.cover,
            title: this.title,
            author: this.author,
            publisher: this.publisher,
            bookId: this.bookId || this.fileName,
            language: this.language,
            rootFile: this.rootFile,
            originalName: this.originalName,
            filePath: this.filePath,
            unzipPath: this.unzipPath,
            coverPath: this.coverPath,
            createUser: this.createUser,
            createDate: this.createDate,
            updateDate: this.updateDate,
            updateType: this.updateType,
            category: this.category,
            categoryText: this.categoryText
        }
    }

    getContents(){
        return this.contents
    }

    reset(){
        if (Book.pathExists(this.filePath)) {
            fs.unlinkSync(Book.genPath(this.filePath))
        }
        if (Book.pathExists(this.coverPath)) {
            fs.unlinkSync(Book.genPath(this.coverPath))
        }
        if (Book.pathExists(this.unzipPath)) {
            this.delDir(Book.genPath(this.unzipPath))
        }
    }

    delDir(path){
        const list = fs.readdirSync(path)
        list.forEach((v, i) => {
            let url = path + '/' + v
            let stats = fs.statSync(url)
            if (stats.isFile()) {
                fs.unlinkSync(url)
            } else {
                this.delDir(url)
            }
        })
        fs.rmdirSync(path, {recursive: true})
    }

    static genPath(path){
        if(!path.startsWith('/')){
            path = `/${path}`
        }
        return `${UPLOAD_PATH}${path}`
    }

    static pathExists(path){
        if (path.startsWith(UPLOAD_PATH)) {
            return fs.existsSync(path)
        } else {
            return fs.existsSync(Book.genPath(path))
        }
    }

    static genCoverUrl(book){
        const {cover} = book
        if (cover) {
            return cover
        }
    }

    static genContentsTree(contents){
        // const {contents} = book
        if (contents) {
            const contentsTree = []
            contents.forEach(item => {
                item.children = []
                if (item.pid === '') {
                    contentsTree.push(item)
                } else {
                    const parent = contents.find(_ => _.navId === item.pid)
                    parent.children.push(item)
                }
            })
            return contentsTree
        }
    }

}

module.exports = Book