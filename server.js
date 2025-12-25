const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios'); // <--- ⭐ 新增：引入 axios 用于发送 AI 请求
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

// [PUT] 修改技能
app.put('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tool_name, status } = req.body;
    
    await pool.query(
      'UPDATE skills SET tool_name = ?, status = ? WHERE id = ?', 
      [tool_name, status, id]
    );
    
    console.log(`已更新 ID 为 ${id} 的技能`);
    res.json({ message: '更新成功', id, tool_name, status });
  } catch (err) {
    console.error("更新失败:", err);
    res.status(500).json({ error: '更新失败' });
  }
});

// ⭐⭐⭐ [POST] AI 智能点评接口 (DeepSeek) ⭐⭐⭐
app.post('/api/ai-review', async (req, res) => {
  try {
    // 1. 先去数据库查出你现在会什么
    const [rows] = await pool.query('SELECT tool_name, status FROM skills');
    
    // 把技能列表变成字符串，比如 "React (Running), Docker (In Progress)"
    const skillList = rows.map(r => `${r.tool_name} (${r.status})`).join(', ');

    if (!skillList) {
        return res.json({ review: "你的技能树还是空的，快去添加一些技能吧！" });
    }

    console.log("正在请求 DeepSeek...");

    // 2. 发送给 DeepSeek API
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: "deepseek-chat", // 使用 DeepSeek V3 模型
        messages: [
          { 
            role: "system", 
            content: "你是一位严厉但幽默的资深全栈架构师。请根据用户的技术栈，给出3点简短的评价：1.目前的亮点 2.致命的短板 3.下一步学习建议。语气要像个老司机，字数控制在200字以内。" 
          },
          { 
            role: "user", 
            content: `我的技术栈是: ${skillList}。请点评。` 
          }
        ],
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` // 读取 .env 里的 Key
        }
      }
    );

    // 3. 拿到结果返回给前端
    const aiReviewText = response.data.choices[0].message.content;
    res.json({ review: aiReviewText });

  } catch (err) {
    // 打印详细错误信息，方便调试
    console.error("AI 请求失败:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'AI 大脑短路了，请检查 Key 或网络' });
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