import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [skills, setSkills] = useState([]) 
  const [news, setNews] = useState([])     
  const [newSkill, setNewSkill] = useState("") 
  const [editId, setEditId] = useState(null)

  // === ⭐ 新增 AI 相关状态 ===
  const [aiReview, setAiReview] = useState("") // 存 AI 说的话
  const [loading, setLoading] = useState(false) // 存是否正在加载

  // ⚠️ 测试时：使用本地地址
  // ⚠️ 上线前：记得改回 zeabur 云端地址
  //const API_URL = "http://localhost:8080"; 
   const API_URL = "https://fullstack-dashboard-wekede.zeabur.app";

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    axios.get(`${API_URL}/api/skills`).then(res => setSkills(res.data))
    axios.get(`${API_URL}/api/news`).then(res => setNews(res.data))
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) return; 
    axios.post(`${API_URL}/api/skills`, {
      tool_name: newSkill, category: 'Learning', status: 'In Progress' 
    }).then(res => {
      setSkills([...skills, res.data]); setNewSkill("") 
    }).catch(err => alert("添加失败!"))
  }

  const handleDelete = (id) => {
    if(!window.confirm("确定要删除吗？")) return;
    axios.delete(`${API_URL}/api/skills/${id}`).then(() => {
        setSkills(skills.filter(skill => skill.id !== id));
        if (id === editId) { setEditId(null); setNewSkill(""); }
    }).catch(err => alert("删除失败"));
  }

  const startEdit = (skill) => {
    setEditId(skill.id); setNewSkill(skill.tool_name);
  }

  const handleUpdate = () => {
    if (!newSkill.trim()) return;
    axios.put(`${API_URL}/api/skills/${editId}`, {
      tool_name: newSkill, status: 'In Progress'
    }).then(() => {
      const updatedSkills = skills.map(skill => skill.id === editId ? { ...skill, tool_name: newSkill } : skill);
      setSkills(updatedSkills);
      setEditId(null); setNewSkill("");
    }).catch(err => alert("更新失败"));
  }

  // === ⭐⭐⭐ 新增：召唤 AI 的函数 ⭐⭐⭐ ===
  const handleAiReview = () => {
    setLoading(true); // 开始加载，按钮变灰
    setAiReview("");  // 清空旧的评价
    
    // 发送请求给刚刚写好的后端接口
    axios.post(`${API_URL}/api/ai-review`)
      .then(res => {
        setAiReview(res.data.review); // 把 AI 的回复存起来显示
      })
      .catch(err => {
        console.error(err);
        alert("AI 似乎睡着了，请检查后端日志（是否 Key 填错了？）");
      })
      .finally(() => {
        setLoading(false); // 结束加载，按钮恢复
      });
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem' }}>
        🚀 我的全栈仪表盘 (AI版)
      </h1>

      {/* === ⭐⭐⭐ AI 区域 (新增部分) ⭐⭐⭐ === */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '20px', 
        borderRadius: '15px', 
        color: 'white', 
        marginBottom: '40px',
        boxShadow: '0 4px 15px rgba(118, 75, 162, 0.4)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <span style={{fontSize:'2rem'}}>🤖</span>
             <h2 style={{margin:0}}>AI 架构师点评</h2>
          </div>
          
          <button 
            onClick={handleAiReview}
            disabled={loading} // 加载时不能点
            style={{
              background: 'white',
              color: '#764ba2',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? "正在思考中..." : "生成点评 ✨"}
          </button>
        </div>
        
        {/* 显示 AI 回复的框：只有当 aiReview 有内容时才显示 */}
        {aiReview && (
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            marginTop: '15px', 
            padding: '20px', 
            borderRadius: '10px',
            lineHeight: '1.6',
            fontSize: '1.05rem',
            whiteSpace: 'pre-wrap', // 保持 AI 回复的换行格式
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            {aiReview}
          </div>
        )}
      </div>
      
      {/* 原来的输入框 */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <input 
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          placeholder={editId ? "正在修改技能名称..." : "输入新学的技能 (如: Docker)"}
          style={{ 
            padding: '12px', 
            width: '300px', 
            marginRight: '10px', 
            borderRadius: '8px', 
            border: '1px solid #ccc',
            fontSize: '16px',
            borderColor: editId ? '#f57c00' : '#ccc',
            background: editId ? '#fff3e0' : 'white'
          }}
        />
        {editId ? (
            <button onClick={handleUpdate} style={{ padding: '12px 25px', background: '#f57c00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>确认修改</button>
        ) : (
            <button onClick={handleAddSkill} style={{ padding: '12px 25px', background: '#1565c0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>上云添加</button>
        )}
        {editId && <button onClick={() => { setEditId(null); setNewSkill(""); }} style={{ marginLeft: '10px', padding: '12px', cursor: 'pointer', border:'none', background:'transparent', color:'#666' }}>取消</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* MySQL 列表 */}
        <div style={{ background: '#e3f2fd', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#1565c0', borderBottom: '2px solid #1565c0', paddingBottom: '10px', marginTop: 0 }}>🛠️ 技能栈</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {skills.map(skill => (
              <li key={skill.id} style={{ background: 'white', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{skill.tool_name}</strong>
                  <span style={{ color: skill.status === 'Running' ? 'green' : '#f57c00', fontWeight: 'bold', background: skill.status === 'Running' ? '#e8f5e9' : '#fff3e0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{skill.status}</span>
                </div>
                <div>
                    <button onClick={() => startEdit(skill)} style={{ background: '#fff3e0', color: '#ef6c00', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginRight: '8px', fontSize: '0.8rem' }}>编辑</button>
                    <button onClick={() => handleDelete(skill.id)} style={{ background: '#ffcdd2', color: '#c62828', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>删除</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* MongoDB 列表 */}
        <div style={{ background: '#ffebee', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#c62828', borderBottom: '2px solid #c62828', paddingBottom: '10px', marginTop: 0 }}>📰 技术动态</h2>
          {news.map((item, index) => (
            <div key={index} style={{ background: 'white', marginBottom: '15px', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{item.title}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{item.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App