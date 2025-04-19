import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('讀取錯誤：', error);
      return;
    }
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!input.trim()) return;

    const { data, error } = await supabase
      .from('todos')
      .insert([{ text: input, completed: false }])
      .single();

    if (error) {
      console.error('新增失敗：', error);
      return;
    }

    setTodos([...todos, data]);
    setInput('');
  };

  const toggleTodo = async (todo) => {
    if (!todo) return;
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id);

    if (error) console.error('更新錯誤：', error);
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) console.error('刪除錯誤：', error);
    fetchTodos();
  };

  const formatTaiwanTime = (utcString) => {
    if (!utcString) return '';
    return new Date(utcString).toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei'
    });
  };

  // ✏️ 編輯功能邏輯
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('todos')
      .update({ text: editText })
      .eq('id', id);

    if (error) {
      console.error('更新失敗：', error);
      return;
    }

    setEditingId(null);
    setEditText('');
    fetchTodos();
  };

  return (
    <div className="container">
      <h2>📋 Supabase 待辦清單</h2>
      <div className="input-container">
        <input
          placeholder="輸入待辦事項..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addTodo}>新增</button>
      </div>

      <div className="todo-list">
        {todos && todos.length > 0 ? (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-card ${todo.completed ? 'completed' : ''}`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
              />

              {editingId === todo.id ? (
                <div className="edit-section">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  <button onClick={() => saveEdit(todo.id)}>✅ 儲存</button>
                  <button onClick={cancelEdit}>❌ 取消</button>
                </div>
              ) : (
                <div className="todo-text">
                  <span
                    style={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                    }}
                  >
                    {todo.text}
                  </span>
                  <div className="timestamp">
                    建立時間：{formatTaiwanTime(todo.created_at)}
                  </div>
                </div>
              )}

              {editingId !== todo.id && (
                <div className="btn-group">
                  <button onClick={() => startEdit(todo)}>✏️ 編輯</button>
                  
                  <button onClick={() => deleteTodo(todo.id)}>🗑️ 刪除</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>沒有待辦事項</p>
        )}
      </div>
    </div>
  );
}

export default App;
