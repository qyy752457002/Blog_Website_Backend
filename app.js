// 1. Imports and Setup:

var createError = require("http-errors");
const bodyParser = require('body-parser');
var path = require("path");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

/*
当使用 express-jwt 中间件时，它会自动验证请求头中的 JWT，并将解析出的 token 信息放在 req.auth 对象中。
你可以在需要验证用户身份的路由处理器中使用这个信息。
*/
let { expressjwt } = require("express-jwt");

var articlesRouter = require("./routes/articles");
var usersRouter = require("./routes/users");
var uploadRouter = require("./routes/upload");
var commentsRouter = require("./routes/comments");

var articlesFrontRouter = require("./routes/front/articles");
var commentsFrontRouter = require("./routes/front/comments");

// 2. Express Setup:

// app is initialized as an instance of Express.
const app = express();

//设置跨域访问
app.all("*", function (req, res, next) {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    //允许的header类型
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    // //跨域允许的请求方式
    res.header(
      "Access-Control-Allow-Methods",
      "PATCH,PUT,POST,GET,DELETE,OPTIONS"
    );
    // 可以带cookies
    res.header("Access-Control-Allow-Credentials", true);
    if (req.method == "OPTIONS") {
      res.sendStatus(200).end();
    } else {
      next();
    }
  });

// 3. View Engine and Middleware Setup:

// __dirname 是Node.js中的一个特殊变量，表示当前模块（文件）所在的目录的绝对路径。
// 它用于设置Express应用程序的views选项，指定视图文件的目录。
app.set("views", path.join(__dirname, "views"));
// app.set('view engine', 'ejs'): Sets EJS (Embedded JavaScript) as the view engine for rendering templates.
app.set("view engine", "ejs");

// bodyParser.urlencoded() 和 express.static(path.join(__dirname, "public")) 是 middleware functions.

// Configure middleware for an Express.js application using the body-parser package. 
// This line specifically sets up body-parser to parse URL-encoded data with extended mode, allowing for richer data to be encoded in the URL.
// When extended is set to true, body-parser allows the use of nested objects and arrays to be encoded into the URL-encoded data. 
// This enables you to send more complex data structures through forms or requests in an Express.js application.
app.use(bodyParser.urlencoded({extended: true}));

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());

// configuring Express to serve static files from a directory named "public." 
// This is a common setup for serving assets like HTML, CSS, JavaScript, images, and other files that don't need to be processed by the server.
app.use(express.static(path.join(__dirname, "public")));

/*

这两个正则表达式用于匹配不同的API路由，并在您的应用程序中用于定义哪些路由不需要JWT认证。让我们分别来看看它们的区别：

1. `{ url: /^\/api\/articles\/\w+/, methods: ["GET"] }`:
   - 这个表达式匹配所有以`/api/articles/`开头，后面紧跟着一个或多个单词字符（字母、数字或下划线）的路由。
     例如，它会匹配`/api/articles/123`或`/api/articles/title`。
   - 这个表达式还指定了HTTP方法——只有GET请求对这些匹配的路由是免除JWT验证的。
     也就是说，如果有非GET请求（如POST、PUT等）发往这些路由，那么它们还是需要JWT认证。

2. `/^\/api\/articles\/users\/\w+/`:
   - 这个表达式匹配所有以`/api/articles/users/`开头，后面紧跟着一个或多个单词字符的路由。
     例如，它会匹配`/api/articles/users/john`或`/api/articles/users/123`。
   - 与第一个表达式不同的是，这个表达式没有指定HTTP方法，这意味着无论是GET、POST还是其他任何HTTP方法，只要URL匹配这个表达式，都不需要进行JWT验证。

总结来说，主要区别在于它们匹配的URL模式不同，并且第一个表达式对允许的HTTP方法有特定限制（只允许GET请求），而第二个表达式对HTTP方法没有限制。

*/

// 解析jwt
app.use(
  expressjwt({
    secret: "test12345",
    algorithms: ["HS256"],
  }).unless({
    // 要排除的 路由
    path: [
      "/api/users",
      "/api/upload",
      /^\/api\/articles\/users\/\w+/,
      {
        url: /^\/api\/articles\/\w+/,
        methods: ["GET"],
      },

      // 前台两个文章接口不需要权限
      "/api/front/articles",
      {
        url: /^\/api\/front\/articles\/\w+/,
        methods: ["GET"],
      },
      {
        url: /^\/api\/front\/comments\/articles\/\w+/,
        methods: ["GET"],
      },
    ],
  })
);

/*
    这段代码是使用Express.js创建一个Web应用程序的常见模式，它使用了不同的路由器（Router）来处理不同的API端点。让我解释一下每一行的作用：

    1. `app.use("/api/articles", articlesRouter);`：这一行告诉Express应用程序在访问`/api/articles`路径时，使用`articlesRouter`来处理请求。
        通常，`articlesRouter`是一个包含处理文章相关操作的路由器，它可以定义GET、POST、PUT、DELETE等HTTP方法的处理程序。

    2. `app.use("/api/users", usersRouter);`：类似于第一行，这一行告诉Express应用程序在访问`/api/users`路径时，使用`usersRouter`来处理请求。
        通常，`usersRouter`是一个包含处理用户相关操作的路由器，例如用户注册、登录、获取用户信息等。

    3. `app.use("/api/upload", uploadRouter);`：这一行告诉Express应用程序在访问`/api/upload`路径时，使用`uploadRouter`来处理请求。
        通常，`uploadRouter`可能用于处理文件上传和下载相关的操作。

    4. `app.use("/api/comments", commentsRouter);`：与前面的行类似，这一行告诉Express应用程序在访问`/api/comments`路径时，使用`commentsRouter`来处理请求。
        通常，`commentsRouter`可能包含用于处理评论相关操作的路由器，例如发布评论、获取评论等。

    这种方式允许你将不同的API端点的处理逻辑模块化，使代码更易于管理和维护。每个路由器可以专注于处理特定路径下的请求，而不需要将所有路由处理逻辑集中在一个文件中。
    这提高了代码的可读性和可维护性，使开发更加容易。
*/
app.use("/api/articles", articlesRouter);
app.use("/api/users", usersRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/front/articles", articlesFrontRouter);
app.use("/api/front/comments", commentsFrontRouter);


// 检查失败的处理
app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
      res
        .status(401)
        .json({ code: 0, msg: "无效的token或者没有没有传递token-请重新登录" });
    } else {
      next(err);
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
  
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

module.exports = app;


