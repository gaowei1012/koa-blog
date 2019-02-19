const fs = require('fs');
const md = require('md5');
const moment = require('moment');
const userModel = require('./../lib/mysql');
const checkLogin = require('./../middlewares/check').checkLogin;
const checkNotLogin = require('./../middlewares/check').checkNotLogin;

// 注册页
exports.getSignup = async ctx => {
    await checkNotLogin(ctx);
    await ctx.render('signup', {
        session: ctx.session
    });
};

// 注册
exports.postSignup = async ctx => {
    let user = {
        name: ctx.request.body.name,
        pass: ctx.request.body.password,
        avator: ctx.request.body.avator,
        repeatpass: ctx.request.body.repeatpass
    };

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
}
