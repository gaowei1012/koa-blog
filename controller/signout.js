

// 退出
exports.getSignout = async ctx => {
    ctx.session = null
    ctx.body = {
        code: 200,
        message: '登出成功'
    };
};