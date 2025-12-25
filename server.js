const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 中间件配置
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析 JSON 请求体

// === 1. MySQL 数据库连接池 ===
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'sjc1.clusters.zeabur.com',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD, // 这里的密码会从 .env 文件或 Zeabur 环境变量里读取
  database: process.env.MYSQL_DATABASE || 'zeabur',
  port: process.env.MYSQL_PORT || 21007,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// === 2. MongoDB 数据库连接 ===
// 如果环境变量里配置了 MONGO_URI 才会尝试连接
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB 连接成功'))
    .catch(err => console.error('❌ MongoDB 连接失败:', err));
}

// 定义 MongoDB News 模型
const newsSchema = new mongoose.Schema({
  title: String,
  summary: String,
  tag: String,
  date: String
});
const News = mongoose.model('News', newsSchema);


// === 3. API 路由定义 ===

// 根目录：健康检查
app.get('/', (req, res) => {
  res.send('🚀 全栈后端服务器正在运行!');
});

// [GET] 获取所有技能
app.get('/api/skills', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM skills');
    res.json(rows);
  } catch (err) {
    console.error("查询失败:", err);
    res.status(500).json({ error: '数据库查询失败' });
  }
});

// [POST] 添加新技能
app.post('/api/skills', async (req, res) => {
  try {
    const { tool_name, category, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO skills (tool_name, category, status) VALUES (?, ?, ?)',
      [tool_name, category, status]
    );
    // 返回新添加的数据（包含生成的 ID）
    res.json({ id: result.insertId, tool_name, category, status });
  } catch (err) {
    console.error("添加失败:", err);
    res.status(500).json({ error: '添加失败' });
  }
});

// ⭐⭐⭐ [DELETE] 删除技能 (新增部分) ⭐⭐⭐
app.delete('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params; // 获取 URL 里的 id (例如 /api/skills/5 中的 5)
    
    // 执行 SQL 删除命令
    await pool.query('DELETE FROM skills WHERE id = ?', [id]);
    
    console.log(`已删除 ID 为 ${id} 的技能`);
    // 告诉前端：任务完成
    res.json({ message: '删除成功', id: id });
  } catch (err) {
    console.error("删除失败:", err);
    res.status(500).json({ error: '删除失败' });
  }
});

// [GET] 获取 MongoDB 新闻
app.get('/api/news', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
        return res.json([]); // 如果没连上 Mongo，返回空数组
    }
    const news = await News.find().sort({ _id: -1 }).limit(10);
    res.json(news);
  } catch (err) {
    console.error("MongoDB 查询失败:", err);
    res.status(500).json({ error: 'MongoDB 查询失败' });
  }
});

// === 4. 启动服务器 ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口: ${PORT}`);
});