const { env } = require("./env")
// const UPLOAD_PATH = env === 'dev' ? 'E:/webDevelope/nginx/nginx-1.16.1/conf/Users/lxy/read/upload'  : '线上地址'
const UPLOAD_PATH = 'E:/webDevelope/nginx/nginx-1.16.1/lxy/read/upload'

// const UPLOAD_URL = env === 'dev' ? 'http://lxy.amusement.com' : '线上地址'
const UPLOAD_URL = 'http://lxy.amusement.com/upload'

const OLD_UPLOAD_URL = 'https://www.youbaobao.xyz/book/res/img'

// const DEFAULT_COVER_PATH = 'E:/webDevelope/nginx/nginx-1.16.1/lxy/read/defaultCover'
// const DEFAULT_COVER_URL = 'http://lxy.amusement.com/defaultCover'

module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS: 0,
    CODE_TOKEN_EXPIRED: -2,
    debug : true,
    PWD_SALT: 'lxy_admin',
    // PWD_SALT: 'admin_imooc_node',
    PRIVATE_KEY: 'lxy_admin',
    // PRIVATE_KEY: 'admin_imooc_node_test_youbaobao_xyz',
    JWT_EXPIRED: 60 * 30,
    UPLOAD_PATH,
    MIME_TYPE_EPUB: 'application/epub+zip',
    UPLOAD_URL,
    OLD_UPLOAD_URL
    // DEFAULT_COVER_PATH,
    // DEFAULT_COVER_URL
  }