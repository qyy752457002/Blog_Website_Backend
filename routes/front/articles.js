var express = require("express");
var router = express.Router();
var { Article } = require("../../models/index");

/* 
 /api/front/articles
 获取所有文章列表
 
*/
router.get("/", function (req, res, next) {
    console.log(req.query);

  /*
    这段代码是用于获取HTTP请求的查询参数（query parameters）的值，并将它们赋值给两个变量：`pagesize` 和 `pagenum`。

    具体解释如下：

    - `req.query.pagesize || 10;`：这一行代码首先尝试从HTTP请求的查询参数中获取名为 "pagesize" 的值，使用`req.query.pagesize`来表示。
      查询参数是包含在URL中的键值对，例如 `?pagesize=10`，其中 "pagesize" 是参数名，而 "10" 是参数值。

      - 如果 "pagesize" 参数存在且有值，那么`req.query.pagesize`将返回该值。
      - 如果 "pagesize" 参数不存在或没有值（比如请求中没有指定该参数），则使用 `10` 作为默认值。

    - 同理，`req.query.pagenum || 1;` 的部分也是一样的操作，只是针对名为 "pagenum" 的查询参数。

    所以，这段代码的目的是在没有明确指定查询参数 "pagesize" 和 "pagenum" 的值时，为它们分别设置默认值为 `10` 和 `1`。
    这通常用于在分页查询中，如果客户端没有提供分页参数，那么就使用默认的分页大小和页码来返回结果。
  */

    // 设置默认值
    let pagesize = req.query.pagesize || 10;
    let pagenum = req.query.pagenum || 1;

    Article.find({})
    .populate("author", { password: 0 })
    .populate("coms")
    // 第一页，skip 0, limit 10
    // 第二页, skip 10, limit 20
    // 第三页，skip 20, limit 30
    // 第二页, skip 30, limit 40
    .skip((pagenum - 1) * pagesize)
    .limit(pagesize)
    .then((r) => {
      res.json({
        code: 1,
        msg: "获取文章列表成功",
        data: r,
      });
    })
    .catch((err) => {
      res.json({
        code: 0,
        msg: "获取文章列表失败",
      });
    });
});

/* 
 /api/front/articles/:aid
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

module.exports = router;