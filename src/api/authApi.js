import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const verifyTokenAPI = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    // Xử lý các loại lỗi khác nhau
    if (error.response) {
      // Lỗi từ server (status code không phải 2xx)
      throw new Error(error.response.data.message || 'Token không hợp lệ');
    } else if (error.request) {
      // Không nhận được response
      throw new Error('Không thể kết nối đến server');
    } else {
      // Lỗi khi setup request
      throw new Error('Có lỗi xảy ra');
    }
  }
};

// API đăng nhập
export const loginAPI = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Đăng nh��p thất bại');
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server');
    } else {
      throw new Error('Có lỗi xảy ra');
    }
  }
};

// Tạo axios instance với interceptor
export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu token hết hạn (status 401) và chưa thử refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi API refresh token (nếu bạn có)
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken: localStorage.getItem('refreshToken')
        });

        const { token } = response.data;
        localStorage.setItem('token', token);

        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token cũng hết hạn, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
); 