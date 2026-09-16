import axios from 'axios'

const API_BASE = 'https://vergabe-advisor-production.up.railway.app/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// JWT Token hinzufügen zu jedem Request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login(email, password) {
    return api.post('/auth/login', { email, password })
  }
}

export const vergabenService = {
  getList() {
    return api.get('/vergaben')
  },
  getById(id) {
    return api.get(`/vergaben/${id}`)
  },
  create(data) {
    return api.post('/vergaben', data)
  },
  update(id, data) {
    return api.put(`/vergaben/${id}`, data)
  },
  submit(id) {
    return api.post(`/vergaben/${id}/submit`)
  },
  approve(id, userId) {
    return api.post(`/vergaben/${id}/approve/${userId}`)
  },
  reject(id, userId, grund) {
    return api.post(`/vergaben/${id}/reject/${userId}`, { grund })
  }
}

export const freigabeService = {
  getRegeln() {
    return api.get('/freigabe-regeln')
  }
}

export default api
