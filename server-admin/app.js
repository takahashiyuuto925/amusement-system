const express = require("express")
const router = require("./router")
const bodyParser = require("body-parser")
const cors = require("cors")
const fs = require("fs")
const https = require("https") //搭建https服务器

const app = express()

app.use(bodyParser.json({limit: "210000kb"}))

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', router)


const privateKey = fs.readFileSync('./https/read_lxyamusement_cn.key') // 获取https密钥
const pem = fs.readFileSync('./https/read_lxyamusement_cn.pem') // 获取https证书
const credentials = {
    key : privateKey,
    cert : pem 
}
const httpsServer = https.createServer(credentials, app) //启动https服务
httpsServer.listen(18082,function () {
    console.log('https启动成功 https://%s:%s', 18082)
})

const server = app.listen(5000, function(){
    const {address, port} = server.address()
    console.log('服务启动成功 http://%s:%s', address, port)
})