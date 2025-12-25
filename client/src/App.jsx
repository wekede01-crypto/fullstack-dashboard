import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // 定义状态
  const [skills, setSkills] = useState([]) 
  const [news, setNews] = useState([])     
  const [newSkill, setNewSkill] = useState("") 

  // === ⚠️ 确认你的后端地址 ===
  // 如果你在本地测试，可以用 "http://localhost:8080"
  // 如果要发布上线，请保持这个 Zeabur 的地址
  // const API_URL = "https://fullstack-dashboard-wekede.zeabur.app"; // 先注释掉云端的
// === ⚠️ 上线前必须切回云端地址 ===
  // const API_URL = "http://localhost:8080"; // ❌ 本地测试用完注释掉
  const API_URL = "https://fullstack-dashboard-wekede.zeabur.app"; // ✅ 上线必须用这个

  useEffect(() => {
    // 1. 找后端拿 MySQL 的数据
    axios.get(`${API_URL}/api/skills`)
      .then(res => setSkills(res.data))
      .catch(err => console.error("MySQL连接失败:", err))

    // 2. 找后端拿 MongoDB 的数据
    axios.get(`${API_URL}/api/news`)
      .then(res => setNews(res.data))
      .catch(err => console.error("MongoDB连接失败:", err))
  }, [])

  // === 添加技能函数 ===
  const handleAddSkill = () => {
    if (!newSkill.trim()) return; 

    // 发送 POST 请求给云端
    axios.post(`${API_URL}/api/skills`, {
      tool_name: newSkill,
      category: 'Learning',
      status: 'In Progress' 
    })
    .then(res => {
      setSkills([...skills, res.data])
      setNewSkill("") 
    })
    .catch(err => {
      console.error(err);
      alert("添加失败! 请检查网络或后端状态。");
    })
  }

  // === ⭐⭐⭐ 新增：删除技能函数 ⭐⭐⭐ ===
  const handleDelete = (id) => {
    // 发送 DELETE 请求给后端
    axios.delete(`${API_URL}/api/skills/${id}`)
      .then(() => {
        // 后端删除成功后，我们在前端也把这一项移除
        // 过滤掉那个刚刚被删的 id
        setSkills(skills.filter(skill => skill.id !== id));
      })
      .catch(err => {
        console.error("删除失败:", err);
        alert("删除失败，请检查网络");
      });
  }

  // ... 渲染部分 ...
  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem' }}>
        🚀 我的全栈仪表盘 (Live)
      </h1>
      
      {/* 添加技能的操作区 */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <input 
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          placeholder="输入新学的技能 (如: Docker)"
          style={{ 
            padding: '12px', 
            width: '300px', 
            marginRight: '10px', 
            borderRadius: '8px', 
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
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
          上云添加
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* 左卡片：MySQL 数据 */}
        <div style={{ background: '#e3f2fd', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#1565c0', borderBottom: '2px solid #1565c0', paddingBottom: '10px', marginTop: 0 }}>
            🛠️ 技能栈 (MySQL Cloud)
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {skills.length === 0 ? <p style={{color: '#666'}}>正在从云端加载...</p> : skills.map(skill => (
              
              // === ⭐⭐⭐ 修改了这里：给 li 添加了删除按钮 ⭐⭐⭐ ===
              <li key={skill.id} style={{ background: 'white', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {/* 左边的文字部分 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                </div>

                {/* 右边的删除按钮 */}
                <button 
                  onClick={() => handleDelete(skill.id)}
                  style={{
                    background: '#ffcdd2',
                    color: '#c62828',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginLeft: '10px',
                    fontSize: '0.8rem'
                  }}
                  title="从数据库删除"
                >
                  删除
                </button>
              </li>

            ))}
          </ul>
        </div>

        {/* 右卡片：MongoDB 数据 */}
        <div style={{ background: '#ffebee', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#c62828', borderBottom: '2px solid #c62828', paddingBottom: '10px', marginTop: 0 }}>
            📰 技术动态 (Mongo Cloud)
          </h2>
          {news.length === 0 ? <p style={{color: '#666'}}>暂无新闻...</p> : news.map((item, index) => (
            <div key={index} style={{ background: 'white', marginBottom: '15px', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>
                {item.summary && item.summary.startsWith('http') ? (
                  <a href={item.summary} target="_blank" rel="noreferrer" style={{color: '#333', textDecoration: 'none'}}>
                    {item.title} 🔗
                  </a>
                ) : item.title}
              </h3>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                <span style={{background: '#eee', padding: '2px 6px', borderRadius: '4px'}}>{item.tag}</span> 
                <span style={{marginLeft: '10px'}}>🕒 {item.date}</span>
              </div>
              {item.summary && !item.summary.startsWith('http') && (
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