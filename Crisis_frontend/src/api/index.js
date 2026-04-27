import api from './axios';

// ── AUTH ─────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  getMe:          ()     => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (token, data) => api.put(`/auth/reset-password/${token}`, data),
};

// ── USERS ─────────────────────────────────────────────
export const usersAPI = {
  getAll:         (params) => api.get('/users', { params }),
  getById:        (id)     => api.get(`/users/${id}`),
  update:         (id, data) => api.put(`/users/${id}`, data),
  toggleStatus:   (id)     => api.patch(`/users/${id}/toggle-status`),
  delete:         (id)     => api.delete(`/users/${id}`),
};

// ── HELP REQUESTS ─────────────────────────────────────
export const requestsAPI = {
  getAll:    (params) => api.get('/requests', { params }),
  getById:   (id)     => api.get(`/requests/${id}`),
  create:    (data)   => api.post('/requests', data),
  update:    (id, data) => api.put(`/requests/${id}`, data),
  addNote:   (id, data) => api.post(`/requests/${id}/notes`, data),
  delete:    (id)     => api.delete(`/requests/${id}`),
};

// ── VOLUNTEERS ────────────────────────────────────────
export const volunteersAPI = {
  getAll:            (params) => api.get('/volunteers', { params }),
  getProfile:        (id)     => api.get(`/volunteers/${id}`),
  toggleAvailability:(id)     => api.patch(`/volunteers/${id}/availability`),
};

// ── ASSIGNMENTS ───────────────────────────────────────
export const assignmentsAPI = {
  getAll:       (params) => api.get('/assignments', { params }),
  getMy:        (params) => api.get('/assignments/my', { params }),
  create:       (data)   => api.post('/assignments', data),
  updateStatus: (id, data) => api.patch(`/assignments/${id}/status`, data),
  delete:       (id)     => api.delete(`/assignments/${id}`),
  getBestMatch: (reqId)  => api.get(`/assignments/best-match/${reqId}`),
};

// ── DASHBOARD ─────────────────────────────────────────
export const dashboardAPI = {
  getStats:    () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
  getHeatmap:  () => api.get('/dashboard/heatmap'),
  getVolunteerPositions: () => api.get('/dashboard/volunteer-positions'),
};

// ── COORDINATOR APPLICATIONS ──────────────────────────
export const coordinatorApplicationsAPI = {
  submit:    (formData) => api.post('/coordinator-applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll:    (params) => api.get('/coordinator-applications', { params }),
  getById:   (id)     => api.get(`/coordinator-applications/${id}`),
  review:    (id, data) => api.patch(`/coordinator-applications/${id}/review`, data),
};

// ── VICTIM ────────────────────────────────────────────
export const victimAPI = {
  // Victim actions
  submitRequest: (data)   => api.post('/victim/requests', data),
  getMyRequests: (params) => api.get('/victim/requests/my', { params }),
  getRequestById:(id)     => api.get(`/victim/requests/${id}`),
  updateRequest: (id, data) => api.put(`/victim/requests/${id}`, data),
  cancelRequest: (id)     => api.delete(`/victim/requests/${id}`),
  // Admin/Coordinator actions
  getAll:        (params) => api.get('/victim', { params }),
  manage:        (id, data) => api.patch(`/victim/${id}/manage`, data),
};
