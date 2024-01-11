let mongoose = require("mongoose");

mongoose
    .connect("mongodb+srv://Krismile:Qyy2614102@todolistcluster.dalyaca.mongodb.net/ExpressBlogDB", { useNewUrlParser: true })
    .then((res) => {
        console.log("链接成功");
    })
    .catch((err) => {
        console.log("链接失败");
    });

let Schema = mongoose.Schema;

// 定义 文章表 结构
let ArticleSchema = new Schema(
    {
        title: String,
        content: String,
        tag: String,
        author: {type:Schema.Types.ObjectId, ref: 'User'}, // 文章的作者
        views: {
            type: Number,
            default: 0,
        }, // 文章的浏览量
    }, 
    
    {
        timestamps: true, 
        // 启用时间戳
        // 启用时间戳时，Mongoose 会将 createdAt 和 updatedAt 属性添加到模型中。
        // 表中添加一行数据的时候会产生时间戳，记录，数据的创建时间和修改时间
    }
);

// 关联查询（一对多）一篇文章对应多个评论

// 创建数据模型--根据表结构创建数据模型---》并且把表结构映射数据中一个表 Articles
// Article 通过这个对象我们就可以数据库中的数据进行增删改查CRUD
ArticleSchema.virtual("coms", {
    ref: "Comment",
    localField: "_id",
    foreignField: "article_id",
    justOne: false, // 取Array值- 会把文章对应的评论全部提取出来
    // count: true, // 取总数  如果为true 只显示数组的长度，不显示数组的内容
  });
  // 下面这两句只有加上了， 虚拟字段才可以显性的看到，不然只能隐性使用
  ArticleSchema.set("toObject", { virtuals: true });
  ArticleSchema.set("toJSON", { virtuals: true });

// 定义 用户表 结构
let UserSchema = new Schema(
    {
        username: {
            type: String,
            // 如果数据库已经有了重复的数据，再次修改了结构--清空数据库的数据， 断开数据库连接-
            unique: true,
            required: true,
        },
        password: String,
        nickname: String,
        headImgUrl: String,
    }, 

    {
        timestamps: true, // 启用时间戳
    }
);

// 评论表
let CommentSchema = new Schema(
    {
        // 评论内容
        content: String,
        // 评论所属文章的id
        article_id: { type: Schema.Types.ObjectId , ref: "Article"},
        // 评论人id
        reply_user_id: { type: Schema.Types.ObjectId, ref: "User" },
    },

    {
        // 记录创建时间和修改时间
        timestamps: true,
    }
);

// estabish an Article mongoose model as a collection
let Article = mongoose.model("Article", ArticleSchema);

// estabish a User mongoose model as a collection
let User = mongoose.model("User", UserSchema);

// estabish a Comment mongoose model as a collection
let Comment = mongoose.model("Comment", CommentSchema);

// 创建新的用户
// User.create({
//   username: "lisi",
//   password: "12345",
//   nickname: "李姐",
//   headImgUrl:
//     "https://img0.baidu.com/it/u=740679572,1472990262&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
// }).then((r) => {
//   console.log(r);
// });

// 李姐的ID: 659d20da935394a709ca040f

// 创建新的文章
// Article.create({
//   title: "今天天气很好啊666",
//   content: "我想要在中午的时候出去玩",
//   tag: "日常生活",
//   author: "659d20da935394a709ca040f",
// },
// {
//     title: "今天天气很好啊777",
//     content: "我想要在上午的时候出去玩",
//     tag: "日常生活",
//     author: "659d20da935394a709ca040f",
// },
// {
//     title: "今天天气很好啊888",
//     content: "我想要在午夜的时候出去玩",
//     tag: "日常生活",
//     author: "659d20da935394a709ca040f",
// },
// {
//     title: "今天天气很好啊999",
//     content: "我想要在傍晚的时候出去玩",
//     tag: "日常生活",
//     author: "659d20da935394a709ca040f",
// }
// ).then((r) => {
//   console.log(r);
//   console.log("创建-并且插入数据成功");
// });


// Article.find({})
//     .sort({ _id: -1 }) // 根据id 1 升序 -1 降序
//     .skip(0) // 跳过前0条
//     .limit(10) // 获取10条事件
//     .populate('author',{password:0}) // 使用 populate('author',{password:0}) 就可以把用户表的信息关联到author字段，并且不显示用户的password信息
//     .exec() // 执行查询
//     .then((res) => {
//     // 查询成功
//     console.log(res);
//     });

// 创建新的评论
// Comment.create({
//   content: "确实好",
//   article_id: "659d20fe3ec7bd35159dbac1",
//   reply_user_id: "659d20da935394a709ca040f",
// }).then((r) => {
//   console.log(r);
// });

// 查一篇文章的所有评论
// Comment.find({ article_id: "659d1653d74b5c30e10f6956" })
//     .populate("reply_user_id", { password: 0 })
//     .then((res) => {
//     // 查询成功
//     console.log(res)
// });

// Article.find({
//     views: { $gte: 0, $lt: 1000 }, 
//     title: /今天天气很好啊/,}) // 搜索 title包含 哈哈 ，搜索条件是正则
//     .sort({ _id: -1 }) // 根据id 1 升序 -1 降序
//     .skip(0) // 跳过前0条
//     .limit(10) // 获取10条事件
//     .populate("author", { password: 0 }) // 关联author的id对应的用户表中用户信息，并且不显示用户的password信息
//     .populate("coms") // 关联comments的id对应的用户表中用户信息
//     .exec() // 执行查询
//     .then((res) => {
//     // 查询成功
//     console.log(res);
//     console.log(JSON.stringify(res));
// });

module.exports = {
    Comment, Article, User
}