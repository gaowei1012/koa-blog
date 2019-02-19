const router = require('koa-router')();
const controller = require('../controller/signup');

// 注册页
router.get('/signup', controller.getSignup);

// 注册
router.post('/signup', controller.postSignup);

module.exports = router;