import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,  // Important for cookies (refresh token)
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                const response = await api.post('/auth/refresh');
                const { access_token } = response.data;
                
                // Save new token
                localStorage.setItem('access_token', access_token);
                
                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear everything and redirect to login
                localStorage.removeItem('access_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export const register = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
        const response = await api.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        // After successful registration, automatically log in
        await login(username, password);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response?.data);
        throw error;
    }
};

export const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
        const response = await api.post('/auth/token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        // Save access token to localStorage
        localStorage.setItem('access_token', response.data.access_token);
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data);
        throw error;
    }
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
        // Clear access token from localStorage
        localStorage.removeItem('access_token');
    } catch (error) {
        console.error('Logout error:', error.response?.data);
        throw error;
    }
};

export const createBoard = async (boardName, boardDescription) => {
    try {
        const response = await api.post('/board', {
            title: boardName,
            description: boardDescription,
        });
        return response.data;
    } catch (error) {
        console.error('Create board error:', error.response?.data);
        throw error;
    }
};

export const getBoards = async () => {
    try {
        const response = await api.get('/board');
        return response.data;
    } catch (error) {
        console.error('Get boards error:', error.response?.data);
        throw error;    
    }
};

export const getBoard = async (boardId) => {
    try {
        const response = await api.get(`/board/${boardId}`);
        return response.data;
    } catch (error) {
        console.error('Get board error:', error.response?.data);
        throw error;
    }
};

export const createList = async (boardId, title) => {
    try {
        const response = await api.post(`/board/${boardId}/list`, {
            title: title
        });
        return response.data;
    } catch (error) {
        console.error('Create list error:', error.response?.data);
        throw error;
    }
};

export const createCard = async (boardId, listId, cardName) => {
    try {
        console.log('Creating card:', cardName);
        const response = await api.post(`/board/${boardId}/list/${listId}/card`, {
            title: cardName
        });
        return response.data;
    } catch (error) {
        console.error('Create card error:', error.response?.data);
        throw error;
    }
};

export const getCards = async (boardId, listId) => {
    try {
        const response = await api.get(`/board/${boardId}/list/${listId}/card`);
        return response.data;
    } catch (error) {
        console.error('Get cards error:', error.response?.data);
        throw error;    
    }
};


