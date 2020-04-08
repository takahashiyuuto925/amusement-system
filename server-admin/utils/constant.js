const { env } = require("./env")
const UPLOAD_PATH = env === 'dev' ? 'E:/webDevelope/nginx/nginx-1.16.1/lxy/read/upload'  : 'http://39.100.30.211/upload'
// const UPLOAD_PATH = 'E:/webDevelope/nginx/nginx-1.16.1/lxy/read/upload'

const UPLOAD_URL = env === 'dev' ? 'http://127.0.0.1:9000/upload' : 'http://39.100.30.211/upload'
// const UPLOAD_URL = 'http://127.0.0.1:9000/upload'

// const OLD_UPLOAD_URL = 'https://www.youbaobao.xyz/book/res/img'
const BANNER_URL = env === 'dev' ? 'http://127.0.0.1:9000' : 'http://39.100.30.211'

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
    // OLD_UPLOAD_URL
  }