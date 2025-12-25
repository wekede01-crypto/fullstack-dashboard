import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [skills, setSkills] = useState([]) 
  const [news, setNews] = useState([])     
  const [newSkill, setNewSkill] = useState("") 
  
  // === ⭐ 新增状态：记录当前正在编辑哪一个 ID ===
  // 如果是 null，说明是“添加模式”；如果有值，说明是“编辑模式”
  const [editId, setEditId] = useState(null)

  // ⚠️ 记得切换回云端地址
  //const API_URL = "https://fullstack-dashboard-wekede.zeabur.app";
   const API_URL = "http://localhost:8080"; 

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = () => {
    axios.get(`${API_URL}/api/skills`).then(res => setSkills(res.data))
    axios.get(`${API_URL}/api/news`).then(res => setNews(res.data))
  }

  // === 添加技能 ===
  const handleAddSkill = () => {
    if (!newSkill.trim()) return; 

    axios.post(`${API_URL}/api/skills`, {
      tool_name: newSkill,
      category: 'Learning',
      status: 'In Progress' 
    })
    .then(res => {
      setSkills([...skills, res.data])
      setNewSkill("") 
    })
    .catch(err => alert("添加失败!"))
  }

  // === 删除技能 ===
  const handleDelete = (id) => {
    if(!window.confirm("确定要删除吗？")) return; // 加个确认框防止手滑

    axios.delete(`${API_URL}/api/skills/${id}`)
      .then(() => {
        setSkills(skills.filter(skill => skill.id !== id));
        // 如果删掉的是正在编辑的那个，要重置输入框
        if (id === editId) {
            setEditId(null);
            setNewSkill("");
        }
      })
      .catch(err => alert("删除失败"));
  }

  // === ⭐ 新增：开始编辑 (点击“编辑”按钮时触发) ===
  const startEdit = (skill) => {
    setEditId(skill.id);      // 记下正在改哪个 ID
    setNewSkill(skill.tool_name); // 把它的名字填回输入框
  }

  // === ⭐ 新增：保存修改 (点击“确认修改”时触发) ===
  const handleUpdate = () => {
    if (!newSkill.trim()) return;

    axios.put(`${API_URL}/api/skills/${editId}`, {
      tool_name: newSkill,
      status: 'In Progress' // 这里暂时不改状态，只改名字
    })
    .then(() => {
      // 本地更新列表，不用刷新网页
      const updatedSkills = skills.map(skill => {
        if (skill.id === editId) {
          return { ...skill, tool_name: newSkill }; // 只改名字
        }
        return skill;
      });
      setSkills(updatedSkills);
      
      // 改完后，还原成“添加模式”
      setEditId(null);
      setNewSkill("");
    })
    .catch(err => alert("更新失败"));
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem' }}>
        🚀 我的全栈仪表盘 (Live)
      </h1>
      
      {/* === 输入区域 (会根据 editId 变身) === */}
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
            // 编辑模式下给个黄色边框提示
            borderColor: editId ? '#f57c00' : '#ccc',
            background: editId ? '#fff3e0' : 'white'
          }}
        />
        
        {/* 按钮逻辑：如果有 editId，显示“确认修改”，否则显示“上云添加” */}
        {editId ? (
            <button 
            onClick={handleUpdate}
            style={{ 
                padding: '12px 25px', 
                background: '#f57c00', // 橙色表示修改
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
            }}
            >
            确认修改
            </button>
        ) : (
            <button 
            onClick={handleAddSkill}
            style={{ 
                padding: '12px 25px', 
                background: '#1565c0', // 蓝色表示添加
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
            }}
            >
            上云添加
            </button>
        )}
        
        {/* 如果在编辑模式，加个“取消”按钮 */}
        {editId && (
            <button 
                onClick={() => { setEditId(null); setNewSkill(""); }}
                style={{ marginLeft: '10px', padding: '12px', cursor: 'pointer', border:'none', background:'transparent', color:'#666' }}
            >
                取消
            </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* 左卡片：MySQL 数据 */}
        <div style={{ background: '#e3f2fd', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#1565c0', borderBottom: '2px solid #1565c0', paddingBottom: '10px', marginTop: 0 }}>
            🛠️ 技能栈 (MySQL Cloud)
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {skills.map(skill => (
              <li key={skill.id} style={{ background: 'white', margin: '10px 0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
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

                <div>
                    {/* === ⭐ 新增：编辑按钮 === */}
                    <button 
                    onClick={() => startEdit(skill)}
                    style={{
                        background: '#fff3e0',
                        color: '#ef6c00',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginRight: '8px',
                        fontSize: '0.8rem'
                    }}
                    >
                    编辑
                    </button>

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
                        fontSize: '0.8rem'
                    }}
                    >
                    删除
                    </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 右卡片：MongoDB 数据 */}
        <div style={{ background: '#ffebee', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#c62828', borderBottom: '2px solid #c62828', paddingBottom: '10px', marginTop: 0 }}>
            📰 技术动态 (Mongo Cloud)
          </h2>
          {news.map((item, index) => (
            <div key={index} style={{ background: 'white', marginBottom: '15px', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
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