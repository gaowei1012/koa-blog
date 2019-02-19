const router = require('koa-router')()
const userModel = require('../lib/mysql')
const md5 = require('md5')
const checkNotLogin = require('../middlewares/check').checkNotLogin
const checkLogin = require('../middlewares/check').checkLogin
const moment = require('moment')
const fs = require('fs')

router.get('/signup', async (ctx, next) => {
    await checkNotLogin(ctx) // not login 
    await ctx.render('signup', {
        session: ctx.session // save session
    })
})

/**
 * 
 *  登录 --
 *  首先去数据库中查找是否有该用户，有就不需要插入--
 *  反之，插入当前注册用户到数据库
 *      对密码进行加密处理(md5)
 */

router.post('/signup', async (ctx, next) => {
    // console.log(ctx)
    let user = {
        name: ctx.request.body.name,
        pass: ctx.request.body.password,
        avator: ctx.request.body.avator,
        repeatpass: ctx.request.body.repeatpass
    }

    await userModel.findDataByName(user.name)
        .then(async (result) => {
            console.log(result)
            if(result.length) {
                try {
                    throw Error('用户已存在!')

                } catch(err) {
                    console.log(err)
                }

                // 当前用户存在的话 code码为1，反之为2
                ctx.body = {
                    data: 1
                }
            } else if (user.pass !== user.repeatpass || user.pass === '') {
                ctx.body = {
                    data: 2
                }
            } else {
                let base64Data = user.avator.replace(/^data:image\/\w+;base64,/, '') // 对image路径进行截取
                let dataBuffer = Buffer.from(base64Data, 'base64') // 把街取到的转为buffer
                let getName = Number(Math.random().toString().substr(3).toString(36) + Date.now())
                await fs.writeFile('./public/images/' + getName + '.png', dataBuffer, err => {
                    if (err) throw err
                    console.log('头像上传成功')
                })
                await userModel.insertData([user.name, md5(user.pass), getName, moment().format('YYYY-MM-DD HH:mm:ss')])
                    .then(res => {
                        console.log('注册成功')
                        ctx.body = {
                            data: 3
                        }
                    })
            }
        })
})

module.exports = router