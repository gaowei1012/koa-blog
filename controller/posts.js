const userModel = require('./../lib/mysql');
const moment = require('moment');
const checkNotLogin = require('./../middlewares/check').checkNotLogin;
const checkLogin = require('./../middlewares/check').checkLogin
const md = require('markdown-it')();

/**
 * 重置到posts页
 */
exports.getRedirectPosts = async ctx => {
    ctx.redirect('/posts');
};

/**
 * 文章页
 */
exports.getPosts = async ctx => {
    let res,
        postCount,
        name = decodeURIComponent(ctx.request.querystring.split('=')[1]);
    
    if (ctx.request.querystring) {
        await userModel.findDataCountByName(name)
            .then(result => {
                console.log(result);
                postCount = result[0].count;
            });
        await userModel.findPostByUserPage(name, 1)
            .then(result => {
                res = result;
            });
        await ctx.render('selfPosts', {
            session: ctx.session,
            posts: res,
            postsPageLength: Math.ceil(postCount / 10)// 每页10条数据
        });
    } else {
        await userModel.findPostByPage(1)
            .then(result => {
                res = result;
            });
        await userModel.findAllPostCount()
            .then(result => {
                postCount = result[0].count;
            });
        await ctx.render('posts', {
            session: ctx.session,
            posts: res,
            postsLenght: postCount,
            postsPageLength: Math.ceil(postCount / 10) // 每页十条
        });
    }
};

/**
 * 首页分页，每页输出十条
 */
exports.getPostsPage = async ctx => {
    let page = ctx.request.body.page;
    await userModel.findPostByPage(page)
        .then(result => {
            ctx.body = result;
        })
        .catch(err => {
            ctx.body = err;
        });
};


/**
 * 个人文章分页，每页输出十条
 */
exports.postSelfPage = async ctx => {
    let data = ctx.request.body;
    await userModel.findPostByUserPage(decodeURIComponent(data.name), data.page)
        .then(result => {
            ctx.body = result
        })
        .catch(() => {
            ctx.body = 'err';
        });
};

/**
 * 单篇文章页
 */
exports.getSinglePosts = async ctx => {
    let postId = ctx.params.postId,
        count,
        res,
        pageOne;
    await userModel.findDataById(postId)
        .then(result => {
            res = result;
        });
    await userModel.updatePostPv(postId);
    await userModel.findCommentByPage(1, postId)
        .then(result => {
            pageOne = result;
        });
    await userModel.findCommentCountById(postId)
        .then(result => {
            count = result[0].count;
        });
    await ctx.render('sPost', {
        session: ctx.session,
        posts: res[0],
        commentLength: count,
        commentPageLength: Math.ceil(count / 10),
        pageOne: pageOne
    });  
};

/**
 * 发表文章页
 */

exports.getCreate = async ctx => {
    await checkLogin(ctx); // 必须是登录情况下
    // 设置session
    await ctx.render('create', {
        session: ctx.session
    });
};

/**
 * 发表文章
 */
exports.postCreate = async ctx => {
    let { title, content } = ctx.request.body;
    let id = ctx.session.id;
    let name = ctx.session.user;
    let time = moment().format('YYYY-MM-DD HH:mm:ss');
    let avator;

    let newContent = content.replace(/[<">']/g, (target) => {
        return {
            '<': '&lt;',
            '"': '&quot;',
            '>': '&gt;',
            "'": '&#39;'
        }[target];
    });

    let newTitle = title.replace(/[<">']/g, (target) => {
        return {
            '<': '&lt;',
            '"': '&quot;',
            '>': '&gt;',
            "'": '&#39;'
        }[target];
    });

    await userModel.findUserData(ctx.session.user)
        .then(result => {
            avator = result[0]['avator'];
        });
    await userModel.insertPost([name, newTitle, md.render(content), content, id, time, avator])
        .then(() => {
            ctx.body = {
                code: 200,
                message: '发表文章成功'
            };
        })
        .catch(() => {
            ctx.body = {
                code: 500,
                message: '发表文章事变'
            };
        });
};

// 发表评论
exports.postComment = async ctx => {
    let name = ctx.session.user,
        content = ctx.body.content,
        postId = ctx.params.postId,
        time = moment().format('YYYY-MM-DD HH:mm:ss'),
        avator,
        user = ctx.session.user;
    await userModel.findUserData(user)
        .then(result => {
            console.log(result);
            // 头像
            avator = result[0]['avator'];
        });
    await userModel.insertComment([name, md.render(content), time, postId, avator])
    await userModel.addPostCommentCount(postId)
        .then(result => {
            ctx.body = {
                code: 200,
                message: '发表评论成功'
            };
        })
        .catch(() => {
            ctx.body = {
                code: 500,
                message: '发表评论失败'
            };
        });
};

// 编辑单篇文章页面
exports.getEditPage = async ctx => {
    let name = ctx.session.user,
        postId = ctx.params.postId,
        res;
    await checkLogin(ctx); // 报证在登录的情况下
    await userModel.findDataById(postId)
        .then(result => {
            res = result[0];
        });
    await ctx.render('edit', {
        session: ctx.session,
        postContent: res.md,
        postsTitle: res.title
    });
};

// post 编辑单篇文章
exports.postEditPage = async ctx => {
    let title = ctx.body.title,
        content = ctx.body.content,
        id = ctx.session.id,
        postId = ctx.params.postId,
        allowEdit = true,
        newTitle = title.replace(/[<">']/g, (target) => {
            return {
                '<': '&lt;',
                '"': '&quot;',
                '>': '&gt;',
                "'": '&#39;'
            }[target];
        }),
        newContent = content.replace(/[<">']/g, (target) => {
            return {
                '<': '&lt;',
                '"': '&quot;',
                '>': '&gt;',
                "'": '&#39;'
            }[target];
        });
    await userModel.findDataById(postId)
        .then(result => {
            if (result[0].name != ctx.session.user) {
                allowEdit = false; // 不可以编辑
            } else {
                allowEdit = true; // 可编辑
            }
        })
    if (allowEdit) {
        await userModel.updatePost([newTitle, md.render(content), content, postId])
            .then(() => {
                ctx.body = {
                    code: 200,
                    message: '编辑成功'
                }
            })
            .catch(() => {
                ctx.body = {
                    code: 500,
                    message: '编辑失败'
                }
            });
    } else {
        ctx.body = {
            code: 404,
            message: '无权限'
        }
    };
};

// 删除单篇文章
exports.postDeletePost = async ctx => {
    let postId = ctx.params.postId,
        allow;
    await userModel.findDataById(postId)
        .then(result => {
            if (result[0].name !== ctx.session.user) {
                allow = false;
            } else {
                allow = true;
            }
        })
    if (allow) {
        await userModel.deleteAllPostComment(postId)
        await userModel.deletePost(postId)
            .then(() => {
                ctx.body = {
                    code: 200,
                    message: '删除成功'
                };
            })
            .catch(() => {
                ctx.body = {
                    code: 500,
                    message: '删除失败'
                };
            });
    } else {
        ctx.body = {
            code: 404,
            message: '无权限'
        }
    };
};

// 删除评论
exports.postDeleteComment = async ctx => {
    let postId = ctx.params.postId,
        commentId = ctx.params.commentId,
        allow;
    await userModel.findComment(commentId)
        .then(result => {
            if (result[0].name !== ctx.session.user) {
                allow = false;
            } else {
                allow = true;
            }
        })
    if (allow) {
        await userModel.reducePostCommentCount(postId);
        await userModel.deleteComment(commentId)
            .then(result => {
                ctx.body = {
                    code: 200,
                    message: '删除评论成功'
                };
            })
            .catch(() => {
                ctx.body = {
                    code: 500,
                    message: '删除评论失败'
                };
            });
    } else {
        ctx.body = {
            code: 404,
            message: '无权限'
        };
    };
};

// 评分页
exports.postCommentPage = async ctx => {
    let postId = ctx.params.postId,
        page = ctx.body.page;
    await userModel.findCommentByPage(page, postId)
        .then(result => {
            ctx.body = result;
        })
        .catch(() => {
            ctx.body = 'err';
        });
};