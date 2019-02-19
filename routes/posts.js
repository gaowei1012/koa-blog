const router = require('koa-router')();
const controller = require('../controller/posts');

// 重置到posts页面
router.get('/', controller.getRedirectPosts);

// 文章页
router.get('/posts', controller.getPosts);

// 首页分页，每次显示十条文章
router.post('/posts/page', controller.getPostsPage);

// 个人文章页
router.post('/posts/self/page', controller.postSelfPage);

// 单独文章页
router.post('/posts/:postsId', controller.getSinglePosts);

// 发表文章页
router.get('/create', controller.getCreate);

// 发表文章
router.post('/create', controller.postCreate);

// 发表评论
router.post('/:postId', controller.postComment);

// 编辑单篇文章页面
router.get('/posts/:postsId/edit', controller.getEditPage);

// 编辑单篇文章
router.post('/posts/:postsId/edit', controller.postEditPage);

// 删除单篇文章
router.post('/posts/:postsId/remove', controller.postDeletePost);

// 删除评论
router.post('/posts/:postsId/comment/:commentId/remove', controller.postDeleteComment);

// 评论分页
router.post('/posts/:postsId/commentPage', controller.postCommentPage);


module.exports = router;