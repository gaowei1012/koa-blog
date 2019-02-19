const router = require('koa-router')()
const checkNotLogin = require('./../middlewares/check').checkNotLogin
const checkLogin = require('../middlewares/check').checkLogin
const userModel = require('./../lib/mysql')
const md = require('markdown-it')()
const moment = require('moment')

router.get('/', async (ctx, next) => {
    ctx.redirect('/posts')
})


router.get('/posts', async(ctx, next) => {
    let res,
        postsLength,
        name = decodeURIComponent(ctx.request.querystring.split('=')[1]);
    if (ctx.request.querystring) {
        console.log('ctx.request.querystring', name)
        await userModel.findDataByUser(name)
            .then(result => {
                postsLength = result.length
            })
        await userModel.findPostByUserPage(name,1)
            .then(result => {
                res = result
            })
        await ctx.render('selfPosts', {
            session: ctx.session,
            posts: res,
            postsPageLength:Math.ceil(postsLength / 10),
        })
    } else {
        await userModel.findPostByPage(1)
            .then(result => {
                console.log(result)
                res = result
            })
        await userModel.findAllPost()
            .then(result=>{
                postsLength = result.length
            })    
        await ctx.render('posts', {
            session: ctx.session,
            posts: res,
            postsLength: postsLength,
            postsPageLength: Math.ceil(postsLength / 10),
        })
    }
})

// 分页
router.post('/posts/self/page', async(ctx, next) => {
    let data = ctx.request.body
    await userModel.findPostByUserPage(data.name, data.page)
        .then(result => {
            ctx.body = result
        }).catch(() => {
            ctx.body = 'error'
        })
})

// 发表文章页面
router.get('/create', async(ctx, next) => {
    await ctx.render('create', {
        session: ctx.session,
    })
})

// post 发表文章
router.post('/create', async(ctx, next) => {
    let title = ctx.request.body.title,
        content = ctx.request.body.content,
        id = ctx.session.id,
        name = ctx.session.user,
        time = moment().format('YYYY-MM-DD HH:mm:ss'),
        avator,
        // 现在使用markdown不需要单独转义
        newContent = content.replace(/[<">']/g, (target) => { 
            return {
                '<': '&lt;',
                '"': '&quot;',
                '>': '&gt;',
                "'": '&#39;'
            }[target]
        }),
        newTitle = title.replace(/[<">']/g, (target) => {
            return {
                '<': '&lt;',
                '"': '&quot;',
                '>': '&gt;',
                "'": '&#39;'
            }[target]
        });

    console.log([name, newTitle, content, id, time])
    await userModel.findUserData(ctx.session.user)
        .then(res => {
            console.log(res[0]['avator'])
            avator = res[0]['avator']       
        })
    await userModel.insertPost([name, newTitle, md.render(content), content, id, time,avator])
            .then(() => {
                ctx.body = true
            }).catch(() => {
                ctx.body = false
            })

})

module.exports = router;