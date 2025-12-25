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
  password: process.env.MYSQL_PASSWORD, // 从 .env 文件读取密码
  database: process.env.MYSQL_DATABASE || 'zeabur',
  port: process.env.MYSQL_PORT || 21007,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// === 2. MongoDB 数据库连接 ===
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
    res.json({ id: result.insertId, tool_name, category, status });
  } catch (err) {
    console.error("添加失败:", err);
    res.status(500).json({ error: '添加失败' });
  }
});

// [DELETE] 删除技能
app.delete('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM skills WHERE id = ?', [id]);
    console.log(`已删除 ID 为 ${id} 的技能`);
    res.json({ message: '删除成功', id: id });
  } catch (err) {
    console.error("删除失败:", err);
    res.status(500).json({ error: '删除失败' });
  }
});

// ⭐⭐⭐ [PUT] 修改技能 (新增部分) ⭐⭐⭐
app.put('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params; // 获取 URL 里的 id
    const { tool_name, status } = req.body; // 获取前端发来的新数据
    
    // 执行 SQL 更新命令
    await pool.query(
      'UPDATE skills SET tool_name = ?, status = ? WHERE id = ?', 
      [tool_name, status, id]
    );
    
    console.log(`已更新 ID 为 ${id} 的技能`);
    // 返回更新后的数据给前端
    res.json({ message: '更新成功', id, tool_name, status });
  } catch (err) {
    console.error("更新失败:", err);
    res.status(500).json({ error: '更新失败' });
  }
});

// [GET] 获取 MongoDB 新闻
app.get('/api/news', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
        return res.json([]);
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