require("dotenv").config(); // 加载 .env 文件中的环境变量
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth"); // 引入认证路由
const userRoutes = require("./routes/user"); // 引入用户路由
const adminRoutes = require("./routes/admin"); // 引入后台管理路由
const publicRoutes = require("./routes/public"); // 引入公开路由

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/teashop_db";

// 中间件
app.use(cors());
app.use(express.json()); // 用于解析 JSON 格式的请求体
app.use(express.static("public")); // 服务静态文件，例如上传的图片
app.use("/uploads", express.static("uploads")); // 新增：服务上传的图片文件

mongoose.set('strictQuery', true);

// 连接 MongoDB
mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB 连接成功！"))
    .catch((err) => console.error("MongoDB 连接失败：", err));

// 使用认证路由
app.use("/api/auth", authRoutes);
// 使用用户路由
app.use("/api/user", userRoutes);
// 使用后台管理路由
app.use("/api/admin", adminRoutes);
// 使用公开路由
app.use("/api", publicRoutes);

// 定义一个简单的路由
app.get("/", (req, res) => {
    res.send("茶商城后端 API 运行中！");
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器在端口 ${PORT} 运行中`);
});
