var express = require("express");
var router = express.Router();
let { Article } = require("../models/index");

/* GET home page. *

/* 
 发布文章
 /api/articles

*/

/*
解析的结果会被输出到req.auth
我们在需要登录的路由做测试打印一下，请求的时候需要在请求头中传入token才能成功被解析到
*/
router.post("/", function (req, res, next) {
    console.log(req.body);
    // { username: 'admin', iat: 1668954424, exp: 1668954544 }
    console.log(req.auth.uid);
    //
    Article.create({
      ...req.body,
      author: req.auth.uid,
    })
      .then((r) => {
        res.json({
          code: 1,
          msg: "发布文章成功",
          data: r,
        });
      })
      .catch((r) => {
        res.json({
          code: 0,
          msg: "发布文章失败",
        });
      });
  });

/* 
 根据用户id获取文章列表
 /api/articles/users/:uid
 
*/
router.get("/users/:uid", function (req, res, next) {
    console.log(req.params); // ex. {uid:11}
    Article.find({ author: req.params.uid })
    .populate("author", { password: 0 }) //关联author的id对应的用户表中用户信息，并且不显示用户的password信息
    .populate("coms") //关联comments的id对应的用户表中用户信息
    .then((r) => {
      res.json({
        code: 1,
        msg: "根据用户id获取文章列表成功",
        data: r,
      });
    })
    .catch((err) => {
      res.json({
        code: 0,
        msg: "根据用户id获取文章列表失败",
      });
    });
});

/* 
 /api/articles/:aid
 根据文章id获取文章详情
*/
router.get("/:aid", function (req, res, next) {
    console.log(req.params); // ex. {aid: 11}
    /*
        这段代码是使用Mongoose库的JavaScript代码，通常用于与MongoDB数据库一起在Node.js中工作。
        它用于更新MongoDB集合中的文档，并且具体解释如下：

        1. `Article`：这似乎是Mongoose模型，用于表示MongoDB中的"articles"集合。

        2. `.findByIdAndUpdate()`：这是Mongoose提供的一个方法，用于查找具有特定唯一标识符（在`req.params.aid`中指定）的文档，
                                并在单个操作中对其进行更新。

        3. `req.params.aid`：这可能是从HTTP请求中提取的参数，用于根据其唯一标识符来识别要更新的文章。

        4. `{ $inc: { views: 1 } }`：这是更新操作。它使用`$inc`（增加）运算符来将找到的文档中的"views"字段的值增加1。
                                    换句话说，它用于递增文章的"views"计数。

        5. `{ new: true }`：此选项指定在执行更新操作后，方法应返回已更新的文档。
                        如果省略此选项或将其设置为`false`，则方法将返回更新之前的文档。

        总之，这段代码通过唯一标识符（在`req.params.aid`中指定）找到一个MongoDB集合中的文章，将"views"计数递增1，并返回已更新的文档。
        这通常用于跟踪文章的浏览次数或执行类似的操作，其中您需要在一个操作中更新文档的字段并获取更新后的文档。
    */
    Article.findByIdAndUpdate(
        req.params.aid, 
        { $inc: { views: 1 } },
        { new: true }
    )
        .then((r) => {
            res.json({
            code: 1,
            msg: "根据文章id获取文章详情",
            data: r,
            });
        })
        .catch((err) => {
            res.json({
            code: 0,
            msg: "根据文章id获取文章失败",
            });
        });
});

/* 
 /api/articles/:aid
 根据文章id删除文章
*/
router.delete("/:aid", function (req, res, next) {
    console.log(req.params); // ex. {aid:11}
    Article.findByIdAndDelete(req.params.aid)
      .then((r) => {
        if (r) {
          res.json({
            code: 1,
            msg: "根据文章id删除文章",
          });
        } else {
          res.json({
            code: 0,
            msg: "根据文章id删除文章--文章已经不存在了",
          });
        }
      })
      .catch((err) => {
        res.json({
          code: 0,
          msg: "根据文章id删除文章--操作失败",
        });
      });
});

/* 
 /api/articles/:aid
 根据文章id编辑文章
*/
router.patch("/:aid", function (req, res, next) {
    console.log(req.params); // {aid: 11}
    console.log(req.body);
    /*
        这段代码仍然是使用Mongoose库的JavaScript代码，通常用于与MongoDB数据库一起在Node.js中工作。它用于更新MongoDB集合中的文档，并且具体解释如下：

        1. `Article`：这似乎是Mongoose模型，用于表示MongoDB中的"articles"集合。

        2. `.findByIdAndUpdate()`：这是Mongoose提供的一个方法，用于查找具有特定唯一标识符（在`req.params.aid`中指定）的文档，并在单个操作中对其进行更新。

        3. `req.params.aid`：这可能是从HTTP请求中提取的参数，用于根据其唯一标识符来识别要更新的文章。

        4. `{ ...req.body }`：这是更新操作的一部分。它使用`req.body`对象中的字段来更新找到的文档。具体来说，它会将`req.body`中的字段值应用到文档中，以实现更新。

        5. `{ new: true }`：此选项指定在执行更新操作后，方法应返回已更新的文档。如果省略此选项或将其设置为`false`，则方法将返回更新之前的文档。

        总之，这段代码通过唯一标识符（在`req.params.aid`中指定）找到一个MongoDB集合中的文章，然后使用`req.body`中的字段值来更新该文章的文档，并返回已更新的文档。
        这通常用于根据HTTP请求的主体数据来更新文档，以便修改文章的内容或其他属性。

    */
    Article.findByIdAndUpdate(req.params.aid, { ...req.body }, { new: true })
    .then((r) => {
        res.json({
          code: 1,
          msg: "根据文章id编辑文章",
          data: r,
        });
      })
      .catch((err) => {
        res.json({
          code: 0,
          msg: "根据文章id编辑文章 -- 失败",
        });
      });
});

module.exports = router;