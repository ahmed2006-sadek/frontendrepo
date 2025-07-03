const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    return null;
  }

  return response;
};

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response;
  },

  addUser: async (userData) => {
    const response = await makeRequest('/auth/add-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  },

  updateUser: async (userData) => {
    const response = await makeRequest('/auth/update-user', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    return response;
  },

  deleteUser: async (userId) => {
    const response = await makeRequest('/auth/delete-user', {
      method: 'DELETE',
      body: JSON.stringify({ id: userId }),
    });
    return response;
  },

  getUser: async (userId) => {
    const response = await makeRequest(`/auth/user/${userId}`);
    return response;
  },
};

// Leads API calls
export const leadsAPI = {
  createLead: async (leadData) => {
    const response = await makeRequest('/leads/create-lead', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
    return response;
  },

  getLeads: async () => {
    const response = await makeRequest('/leads/find-leads');
    return response;
  },

  updateLead: async (leadId, leadData) => {
    const response = await makeRequest(`/leads/update-lead/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(leadData),
    });
    return response;
  },
};

// Inventory API calls
export const inventoryAPI = {
  create: async (inventoryData) => {
    const response = await makeRequest('/inventory/create', {
      method: 'POST',
      body: JSON.stringify(inventoryData),
    });
    return response;
  },

  getAll: async () => {
    const response = await makeRequest('/inventory/get-all');
    return response;
  },

  update: async (inventoryId, inventoryData) => {
    const response = await makeRequest(`/inventory/update/${inventoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(inventoryData),
    });
    return response;
  },

  delete: async (inventoryId) => {
    const response = await makeRequest(`/inventory/delete/${inventoryId}`, {
      method: 'DELETE',
    });
    return response;
  },

  filter: async (filterParams) => {
    const queryString = new URLSearchParams(filterParams).toString();
    const response = await makeRequest(`/inventory/filter?${queryString}`);
    return response;
  },
};

// Projects API calls
export const projectsAPI = {
  create: async (projectData) => {
    const response = await makeRequest('/projects/create', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response;
  },

  getAll: async () => {
    const response = await makeRequest('/projects/all');
    return response;
  },

  getProject: async (projectId) => {
    const response = await makeRequest(`/projects/project/${projectId}`);
    return response;
  },

  update: async (projectId, projectData) => {
    const response = await makeRequest(`/projects/update/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(projectData),
    });
    return response;
  },

  delete: async (projectId) => {
    const response = await makeRequest(`/projects/delete/${projectId}`, {
      method: 'DELETE',
    });
    return response;
  },
};

// Calls API calls
export const callsAPI = {
  create: async (callData) => {
    const response = await makeRequest('/calls/create', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
    return response;
  },

  getByLead: async (leadId) => {
    const response = await makeRequest(`/calls/lead/${leadId}`);
    return response;
  },
};

// Visits API calls
export const visitsAPI = {
  create: async (visitData) => {
    const response = await makeRequest('/visits/create', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
    return response;
  },

  getAll: async () => {
    const response = await makeRequest('/visits/all');
    return response;
  },

  getVisit: async (visitId) => {
    const response = await makeRequest(`/visits/${visitId}`);
    return response;
  },
};

