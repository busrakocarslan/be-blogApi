"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM BLOG API | NODEJS / EXPRESS |
------------------------------------------------------- */
// $ npm i morgan
// app.use(logger):

const morgan=require("mprgan")
const fs=require("node:fs")

const now = new Date()
const today = now.toISOString().split('T')[0]

module.exports=morgan('combined',{stream:fs.createWriteStream(`./logs/${today}.log`,{flag:"a+"})})
// morgan modulü içinde en kapsamlı hazır yapılardan olan combined methodunu al ve bugünün tarihi ile fs modul sayasinde logları dosyala flag kdou ile de dosyaya ne yapacağını bil diyorum
// mkdir logs ile terminalden logs dosyaysını oluştur. 