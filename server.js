const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

//中间件配置
app.use(cors()); // 允许跨域
app.use(express.json()); // 【关键新增】让服务器能读懂前端发来的 JSON 数据

// ===========================
// 1. MySQL 连接配置 (技能数据)
// ===========================
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // 你的数据库密码
    database: 'my_fullstack_journey'
});

mysqlConnection.connect(err => {
    if (err) console.error('❌ MySQL 连接失败:', err);
    else console.log('✅ MySQL 连接成功');
});

// ===========================
// 2. MongoDB 连接配置 (新闻数据)
// ===========================
mongoose.connect('mongodb://localhost:27017/my_fullstack_journey');

const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ MongoDB 连接错误:'));
db.once('open', function() {
  console.log('✅ MongoDB 连接成功');
});

// 定义新闻的数据模型 (Schema)
const newsSchema = new mongoose.Schema({
    title: String,
    tag: String,
    date: String,
    summary: String
}, { collection: 'tech_news' });

const NewsModel = mongoose.model('News', newsSchema);

// ===========================
// 3. API 接口定义
// ===========================

// 接口 A: 获取所有技能 (GET)
app.get('/api/skills', (req, res) => {
    mysqlConnection.query('SELECT * FROM skills', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 接口 B: 添加新技能 (POST) --- 【这是这次新增的接口】
app.post('/api/skills', (req, res) => {
    // 从前端发来的请求体里拿到数据
    const { tool_name, category, status } = req.body;
    
    // 准备 SQL 插入语句
    const sql = 'INSERT INTO skills (tool_name, category, status) VALUES (?, ?, ?)';
    
    // 执行插入
    mysqlConnection.query(sql, [tool_name, category, status], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // 成功后，返回新生成的数据（包含刚生成的 ID）
        res.json({ 
            id: result.insertId, 
            tool_name, 
            category, 
            status 
        });
    });
});

// 接口 C: 获取新闻 (GET)
app.get('/api/news', async (req, res) => {
    try {
        const news = await NewsModel.find();
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 启动服务器
app.listen(3000, () => {
    console.log('🚀 全栈服务器已启动: http://localhost:3000');
});