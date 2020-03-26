const express = require("express")
const router = require("./router")
const bodyParser = require("body-parser")
const cors = require("cors")
// const fs = require("fs")
// const https = require("https") //搭建https服务器

const app = express()

app.use(bodyParser.json({limit: "210000kb"}))

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', router)


// const privateKey = fs.readFileSync('./https/域名.key','utf8') // 获取https密钥
// const pem = fs.readFileSync('./https/域名.pem','utf8') // 获取https证书
// const credentials = {
//     key : privateKey,
//     cert : pem 
// }
// const httpsServer = https.createServer(credentials, app) //启动https服务
// httpsServer.listen('端口号',function () {
//     console.log('https启动成功')
// })

const server = app.listen(5000, function(){
    const {address, port} = server.address()
    console.log('服务启动成功 http://%s:%s', address, port)
})