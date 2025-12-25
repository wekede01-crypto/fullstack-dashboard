const express = require('express');
const mysql = require('mysql2');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // 允许读取本地 .env 文件 (虽然我们这次主要靠云端注入)

const app = express();

app.use(cors());
app.use(express.json());

// ===========================
// 1. MySQL 连接配置 (云端/本地自适应)
// ===========================
const mysqlConnection = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'my_fullstack_journey',
    port: process.env.MYSQL_PORT || 3306
});

mysqlConnection.connect(err => {
    if (err) {
        console.error('❌ MySQL 连接失败 (请检查账号密码):', err.message);
    } else {
        console.log('✅ MySQL 连接成功');
    }
});

// ===========================
// 2. MongoDB 连接配置 (云端/本地自适应)
// ===========================
// 如果云端提供了 MONGO_URI 就用云端的，否则用本地的
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/my_fullstack_journey';

mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB 连接成功'))
    .catch(err => console.error('❌ MongoDB 连接失败:', err));

// 定义新闻模型
const newsSchema = new mongoose.Schema({
    title: String,
    tag: String,
    date: String,
    summary: String
}, { collection: 'tech_news' });

const NewsModel = mongoose.model('News', newsSchema);

// ===========================
// 3. API 接口
// ===========================

app.get('/', (req, res) => {
    res.send('🚀 全栈后端服务器正在运行!');
});

app.get('/api/skills', (req, res) => {
    mysqlConnection.query('SELECT * FROM skills', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/skills', (req, res) => {
    const { tool_name, category, status } = req.body;
    const sql = 'INSERT INTO skills (tool_name, category, status) VALUES (?, ?, ?)';
    mysqlConnection.query(sql, [tool_name, category, status], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, tool_name, category, status });
    });
});

app.get('/api/news', async (req, res) => {
    try {
        const news = await NewsModel.find();
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 监听端口 (云端通常会指定 PORT 环境变量)
const PORT = process.env.PORT || 3306; 
// 修正：这里一般 Web 服务用 3000 或 8080，但为了兼容之前的 client 代码，我们先保持 3000
// 真正的云服务会自动分配端口到 process.env.PORT
app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 服务器运行在端口: ${process.env.PORT || 3000}`);
});