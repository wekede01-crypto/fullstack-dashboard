import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // 定义状态
  const [skills, setSkills] = useState([]) // 存 MySQL 数据
  const [news, setNews] = useState([])     // 存 MongoDB 数据
  const [newSkill, setNewSkill] = useState("") // 【新增】存输入框里的内容

  // 页面加载时获取数据
  useEffect(() => {
    // 1. 找后端拿 MySQL 的数据
    axios.get('http://localhost:3000/api/skills')
      .then(res => setSkills(res.data))
      .catch(err => console.error("MySQL连接失败:", err))

    // 2. 找后端拿 MongoDB 的数据
    axios.get('http://localhost:3000/api/news')
      .then(res => setNews(res.data))
      .catch(err => console.error("MongoDB连接失败:", err))
  }, [])

  // 【新增】点击按钮触发的函数
  const handleAddSkill = () => {
    if (!newSkill.trim()) return; // 如果是空的就不发

    // 发送 POST 请求给后端
    axios.post('http://localhost:3000/api/skills', {
      tool_name: newSkill,
      category: 'Learning', // 默认分类
      status: 'In Progress' // 默认状态
    })
    .then(res => {
      // 后端保存成功后，把新技能直接加到页面显示的列表里（不用刷新网页）
      setSkills([...skills, res.data])
      setNewSkill("") // 清空输入框
    })
    .catch(err => {
      console.error(err);
      alert("添加失败! 请检查后端是否运行。");
    })
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem' }}>
        🚀 我的全栈仪表盘
      </h1>
      
      {/* === 【新增】添加技能的操作区 === */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <input 
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          placeholder="输入新学的技能 (如: Redis)"
          style={{ 
            padding: '12px', 
            width: '300px', 
            marginRight: '10px', 
            borderRadius: '8px', 
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
          // 允许按回车键提交
          onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
        />
        <button 
          onClick={handleAddSkill}
          style={{ 
            padding: '12px 25px', 
            background: '#1565c0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background 0.3s'
          }}
        >
          添加技能
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* 左卡片：MySQL 数据 */}
        <div style={{ background: '#e3f2fd', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#1565c0', borderBottom: '2px solid #1565c0', paddingBottom: '10px', marginTop: 0 }}>
            🛠️ 技能栈 (MySQL)
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {skills.length === 0 ? <p style={{color: '#666'}}>暂无数据或未连接...</p> : skills.map(skill => (
              <li key={skill.id} style={{ background: 'white', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <strong style={{ fontSize: '1.1rem' }}>{skill.tool_name}</strong>
                <span style={{ 
                  color: skill.status === 'Running' ? 'green' : '#f57c00', 
                  fontWeight: 'bold',
                  background: skill.status === 'Running' ? '#e8f5e9' : '#fff3e0',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}> 
                  {skill.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 右卡片：MongoDB 数据 */}
        <div style={{ background: '#ffebee', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#c62828', borderBottom: '2px solid #c62828', paddingBottom: '10px', marginTop: 0 }}>
            📰 技术动态 (MongoDB)
          </h2>
          {news.length === 0 ? <p style={{color: '#666'}}>暂无新闻...</p> : news.map((item, index) => (
            <div key={index} style={{ background: 'white', marginBottom: '15px', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>
                {item.summary.startsWith('http') ? (
                  <a href={item.summary} target="_blank" rel="noreferrer" style={{color: '#333', textDecoration: 'none'}}>
                    {item.title} 🔗
                  </a>
                ) : item.title}
              </h3>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                <span style={{background: '#eee', padding: '2px 6px', borderRadius: '4px'}}>{item.tag}</span> 
                <span style={{marginLeft: '10px'}}>🕒 {item.date}</span>
              </div>
              {!item.summary.startsWith('http') && (
                <p style={{ margin: 0, color: '#444', fontSize: '0.9rem', lineHeight: '1.4' }}>{item.summary}</p>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App