const mysql = require('mysql')
const config = require('../config/default')

const pool = mysql.createPool({
    host:   config.database.HOST,
    user:   config.database.USERNAME,
    password:   config.database.PASSWORD,
    database:   config.database.DATABASE
});
/**
 * 查询方法体 query 
 * @param {string} sql sql语句
 * @param {string} values 插入的value值
 */
let query = function(sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
}

// let users = 
//     `create table if not exists users(
//         id INT NULL AUTO_INCREMENT,
//         name VARCHAR(100) NOT NULL,
//         pass VARCHAR(100) NOT NULL,
//         avtor VARCHAR(100) NOT NULL,
//         moment VARCHAR(100) NOT NULL,
//         PRINMAY KEY( id )
//     );`

let users =
    `create table if not exists users(
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        pass VARCHAR(100) NOT NULL,
        avator VARCHAR(100) NOT NULL,
        moment VARCHAR(100) NOT NULL,
        PRIMARY KEY ( id )
    );`

let posts = 
    `create table if not exists posts(
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        title TEXT(0) NOT NULL,
        content TEXT(0) NOT NULL,
        md TEXT(0) NOT NULL,
        uid VARCHAR(40) NOT NULL,
        moment VARCHAR(100) NOT NULL,
        comments VARCHAR(200) NOT NULL,
        pv VARCHAR(40) NOT NULL,
        avator VARCHAR(100) NOT NULL,
        PRIMARY KEY( id )
    );`

let comment = 
        `create table if not exists comment(
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            content TEXT(0) NOT NULL,
            moment VARCHAR(40) NOT NULL,
            postid VARCHAR(40) NOT NULL,
            avator VARCHAR(100) NOT NULL,
            PRIMARY KEY( id )
        );`

// create table 
let createTable = function(sql) {
    return query(sql, [])
}

// 建表
createTable(users)
createTable(posts)
createTable(comment)

// 注册用户
let insertData = function(value) {
    let _sql = `insert into users set name=?, pass=?, avator=?, moment=?;`
    return query(_sql, value)
}

// 删除用户
let deleUserData = function(name) {
    let _sql = `delete from users where name="${name}";`
    return query(_sql)
}

// 查找用户
let findUserData = function(name) {
    let _sql = `select * from users where name="${name}";`
    return query(_sql)
}

// 发表文章
let insertPost = function(value) {
    let _sql = `insert into posts set name=?, title=?, content=?, md=?, uid=?, moment=?, avator=?;`
    return query(_sql, value)
}

// 更新文章评论数
let updatePostComment = function(value) {
    let _sql = `update posts set comments=? where id=?;`
    return (_sql, value)
}

// 更新浏览数
let updatePostPv = function(value) {
    let _sql = `update posts set pv=? where id=?;`
    return query(_sql, value)
}

// 发表评论
let insertComment = function(value) {
    let _sql = `insert into comment set name=?, content=?, moment=?, postid=?, avator=?;`
    return query(_sql, value)
}

// 通过姓名去查找用户
let findDataByName = function(name) {
    let _sql = `select * from users where name="${name}";`
    return query(_sql)
}

// 通过文章姓名找用户
let findDataByUser = function(name) {
    let _sql = `select * from posts where name="${name}";`
    return query(_sql)
}

// 通过文章ID查找
let findDataById = function (id) {
    let _sql = `select * from posts where id="${id}";`
    return query(_sql, id)
}

// 通过评论id查找
let findCommentById = function(id) {
    let _sql = `select * from comment where postid="${id}";`
    return query(_sql, id)
}

// 查询所有文章
let findAllPost = function() {
    let _sql = `select * from posts;`
    return query(_sql)
}

// 查询所有文章数
let findAllPostCount = function() {
    let _sql = `select * count(*) as count from posts;`
    return query(_sql)
}

// 查询分页文章
let findPostByPage = function(page) {
    let _sql = `select * from posts limit ${(page -1)*10},10;`
    return query(_sql, page)
}

// 查询个人分页文章
let findPostByUserPage = function(name, page) {
    let _sql = `select * from posts where name="${name}" order by id desc;`
    return query(_sql)
}

// 更新文章
let updatePost = function(values) {
    let _sql = `update posts set title=?, content=?, md=?, where id=?;`
    return query(_sql, values)
}

// 删除文章
let deletePost = function(id) {
    let _sql = `delete from posts where id=${id}`
    return query(_sql)
}

// 删除所有评论
let deleteAllPostComment = function(id) {
    let _sql = `delete from comment where postid=${id};`
}

// 查找评论数
let findCommentLength = function(id) {
    let _sql = `select content from comment where postid in (select id from posts where id=${id});`
    return query(_sql)
}

// 滚动无线加载数据
let findPageById = function(page) {
    let _sql = `select * from posts limit ${(page -1)*5}, 5;`
    return query(_sql)
}

// 评论分页
let findCommentByPage = function(page, postId) {
    let _sql = `select * from comment where postid=${postId} order by id desc limit ${(page -1)*10}, 10;`
    return query(_sql)
}

module.exports = {
    query,
    createTable,
    insertData,
    insertComment,
    deleUserData,
    findUserData,
    findDataByName,
    insertPost,
    findAllPost,
    findPostByPage,
    findPostByUserPage,
    findDataById,
    findDataByName,
    findDataByUser,
    updatePost,
    updatePostComment,
    updatePostPv,
    deletePost,
    deleteAllPostComment,
    findCommentById,
    findCommentLength,
    findPageById,
    findCommentByPage
}