const { env } = require("./env")
const UPLOAD_PATH = env === 'dev' ? 'E:/webDevelope/nginx/nginx-1.16.1/lxy/read/upload'  : '/root/nginx/read/upload'

const UPLOAD_URL = env === 'dev' ? 'http://127.0.0.1:9000/upload' : 'https://read.lxyamusement.cn:9000/upload'

const BANNER_URL = env === 'dev' ? 'http://127.0.0.1:9000' : 'https://read.lxyamusement.cn:9000'

const fileUrl = env === 'dev' ? 'http://127.0.0.1:9000/upload/unzip' : 'https://read.lxyamusement.cn:9000/upload/unzip'

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
    debug : false,
    PWD_SALT: 'lxy_admin',
    PRIVATE_KEY: 'lxy_admin',
    JWT_EXPIRED: 60 * 30,
    UPLOAD_PATH,
    MIME_TYPE_EPUB: 'application/epub+zip',
    UPLOAD_URL,
    Category,
    BANNER_URL,
    fileUrl
  }