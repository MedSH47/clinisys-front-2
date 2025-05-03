import axios from 'axios';

const API_URL = 'http://localhost:9000/template-core/api';

const authService = {
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/authenticate`, credentials);
      localStorage.setItem('token', response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // client service
  getClient: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
    catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // user service

  verifyPassword: async (userId, password) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_URL}/verify-password`,
        { id: userId, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // { success: true/false }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUser: async (userId, userData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `${API_URL}/utilisateurs/${userId}`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getUsers: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/utilisateurs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
      `${API_URL}/utilisateurs/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

    getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // e.g. { id, login, role, ... }
  },

  // NEW: Create User function
  getUser: async (id)=>{
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${id}`,{
      headers:{Authorization: `Bearer ${token}`}
    });
    return response.data;
  }
  ,
  createUser: async (userData) => {
    const token = localStorage.getItem('token');
    console.log(token)
    try {
      const response = await axios.post(`${API_URL}/save`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // ——— Ticket methods ———
  getAllTickets: async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data; // Array of TicketDTO
  },

  getTicket: async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data; // Single TicketDTO
  },

  createTicket: async (ticketData) => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/tickets`, ticketData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data; // Created TicketDTO
  },

  updateTicket: async (id, ticketData) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`${API_URL}/tickets/${id}`, ticketData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.data; // Updated TicketDTO
  },

  deleteTicket: async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`${API_URL}/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data; // typically empty
  }

};

export default authService;