const router = require('koa-router')();
const controller = require('./../controller/signout');

// 登出
router.get('/signout', controller.getSignout);

module.exports = router;