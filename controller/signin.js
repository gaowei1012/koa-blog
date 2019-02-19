const userModel = require('./../lib/mysql');
const md5 = require('md5');
const checkLogin = require('./../middlewares/check').checkLogin;
const checkNotLogin = require('./../middlewares/check').checkNotLogin;

// 登录页
exports.getSignin = async ctx => {
    await checkNotLogin(ctx); // 未登录
    await ctx.render('signin', {
        session: ctx.session, // session
    });
};

// 登录
exports.postSignin = async ctx => {
        let {name, password} = ctx.request.body;
        console.log(ctx.request.body);
    
        // 登录
        await userModel.findDataByName(name)
            .then(result => {
                if (result.length && name === result[0]['name'] && md5(password) === result[0]['pass']) {
                    ctx.session = {
                        user: result[0]['name'],
                        id: result[0]['id']
                    };
                    ctx.body = {
                        code: 200,
                        message: '登录成功'
                    };
                } else {
                    ctx.body = {
                        code: 500,
                        message: '用户名或密码错误!'
                    }
                }
            }).catch(err => {
                console.log(err);
            });
};