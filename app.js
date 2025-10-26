// Todo App JavaScript
class TodoApp {
    constructor() {
        this.currentUser = null;
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
    }

    checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        // Verify token with server
        fetch('php/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'verify', token: token })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.currentUser = data.user;
                this.updateUserDisplay();
                this.loadTodos();
            } else {
                localStorage.removeItem('auth_token');
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            localStorage.removeItem('auth_token');
            window.location.href = 'login.html';
        });
    }

    bindEvents() {
        // Add todo form
        const addForm = document.getElementById('add-todo-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    updateUserDisplay() {
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay && this.currentUser) {
            usernameDisplay.textContent = `Halo, ${this.currentUser.username}`;
        }
    }

    async loadTodos() {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('php/todo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'get', token: token })
            });
            
            const data = await response.json();
            if (data.success) {
                this.todos = data.todos;
                this.renderTodos();
                this.updateStats();
            } else {
                console.error('Error loading todos:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async handleAddTodo(e) {
        e.preventDefault();
        
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        
        if (!text) return;
        
        const token = localStorage.getItem('auth_token');
        
        try {
            const response = await fetch('php/todo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'add', 
                    token: token,
                    text: text 
                })
            });
            
            const data = await response.json();
            if (data.success) {
                this.todos.unshift(data.todo);
                input.value = '';
                this.renderTodos();
                this.updateStats();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding todo');
        }
    }

    async toggleTodo(id) {
        const token = localStorage.getItem('auth_token');
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        try {
            const response = await fetch('php/todo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'toggle', 
                    token: token,
                    id: id 
                })
            });
            
            const data = await response.json();
            if (data.success) {
                todo.completed = data.todo.completed;
                todo.updated_at = data.todo.updated_at;
                this.renderTodos();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async deleteTodo(id) {
        if (!confirm('Yakin ingin menghapus todo ini?')) return;
        
        const token = localStorage.getItem('auth_token');
        
        try {
            const response = await fetch('php/todo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'delete', 
                    token: token,
                    id: id 
                })
            });
            
            const data = await response.json();
            if (data.success) {
                this.todos = this.todos.filter(t => t.id !== id);
                this.renderTodos();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTodos();
    }

    renderTodos() {
        const todoList = document.getElementById('todo-list');
        if (!todoList) return;

        let filteredTodos = this.todos;
        
        if (this.currentFilter === 'pending') {
            filteredTodos = this.todos.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTodos = this.todos.filter(t => t.completed);
        }

        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Belum ada todo ${this.currentFilter === 'all' ? '' : this.currentFilter === 'completed' ? 'yang completed' : 'yang pending'}</p>
                </div>
            `;
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-header">
                    <div style="display: flex; align-items: center;">
                        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                               onchange="app.toggleTodo(${todo.id})">
                        <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                    </div>
                    <div class="todo-actions">
                        <button onclick="app.deleteTodo(${todo.id})" class="btn btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="todo-date">
                    Dibuat: ${this.formatDate(todo.created_at)}
                    ${todo.updated_at ? ` | Diedit: ${this.formatDate(todo.updated_at)}` : ''}
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('total-todos').textContent = total;
        document.getElementById('completed-todos').textContent = completed;
        document.getElementById('pending-todos').textContent = pending;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for login/register
function showRegister() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
}

function showLogin() {
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('php/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('auth_token', data.token);
            window.location.href = 'index.html';
        } else {
            alert('Login gagal: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error login');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch('php/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'register',
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Registrasi berhasil! Silakan login.');
            showLogin();
            document.getElementById('login-username').value = username;
        } else {
            alert('Registrasi gagal: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error registrasi');
    }
}

function logout() {
    localStorage.removeItem('auth_token');
    window.location.href = 'login.html';
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        app = new TodoApp();
    }
});