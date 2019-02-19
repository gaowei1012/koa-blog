const router = require('koa-router')();
const controller = require('./../controller/signin');

// 登录页
router.get('/signin', controller.getSignin);

// 登录
router.post('/signin', controller.postSignin);

module.exports = router;