const { env } = require("./env")
const UPLOAD_PATH = env === 'dev' ? 'http://127.0.0.1:9000/upload'  : 'https://read.lxyamusement.cn:18082/upload'

const UPLOAD_URL = env === 'dev' ? 'http://127.0.0.1:9000/upload' : 'https://read.lxyamusement.cn:18082/upload'

const BANNER_URL = env === 'dev' ? 'http://127.0.0.1:9000' : 'https://read.lxyamusement.cn:18082'

const Category = [
  '玄幻',
  '奇幻',
  '都市',
  '仙侠',
  '轻小说'
]

module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS: 0,
    CODE_TOKEN_EXPIRED: -2,
    debug : true,
    PWD_SALT: 'lxy_admin',
    PRIVATE_KEY: 'lxy_admin',
    JWT_EXPIRED: 60 * 30,
    UPLOAD_PATH,
    MIME_TYPE_EPUB: 'application/epub+zip',
    UPLOAD_URL,
    Category,
    BANNER_URL
  }