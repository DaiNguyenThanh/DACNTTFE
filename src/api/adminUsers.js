import axios from './axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');
export const GetUserAPI = async () => {
    try {
       
        const response = await axios.get(`${API_URL}/admin/users`,
           );
        return response.data;
    } catch (error) {
        if (error.response) {
            // Lỗi từ server (status code không phải 2xx)
            throw new Error(error.response.data.message || 'Get User Failed');
        } else if (error.request) {
            // Không nhận được response
            throw new Error('Can not connect to server');
        } else {
            // Lỗi khi setup request
            throw new Error('Error');
        }
    }
}

export const updateUserAPI = async ({ id, email, name, role, subject_id }) => {
    try {
        const response = await axios.put(`${API_URL}/admin/users/${id}`, {
            id,
            email,
            name,
            role,
            subject:{
                id:subject_id
            }
        } );
        return response.data;
    } catch (error) {
        if (error.response) {
            // Lỗi từ server (status code không phải 2xx)
            throw new Error(error.response.data.message || 'Update User Failed');
        } else if (error.request) {
            // Không nhận được response
            throw new Error('Can not connect to server');
        } else {
            // Lỗi khi setup request
            throw new Error('Error');
        }
    }
}
export const patchUserAPI = async ({ id, field }) => {
    try {
        const response = await axios.patch(`${API_URL}/admin/users/${id}`, {
            [field.key]: field.value
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            // Lỗi từ server (status code không phải 2xx)
            throw new Error(error.response.data.message || 'Update User Failed');
        } else if (error.request) {
            // Không nhận được response
            throw new Error('Can not connect to server');
        } else {
            // Lỗi khi setup request
            throw new Error('Error');
        }
    }
}

export const DeleteUserAPI = async ({ ids }) => {
    try {
        
        const response = await axios.delete(`${API_URL}/admin/users`, {
            data: {
                ids: ids
            },
            headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": 1
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            // Lỗi từ server (status code không phải 2xx)
            throw new Error(error.response.data.message || 'Update User Failed');
        } else if (error.request) {
            // Không nhận được response
            throw new Error('Can not connect to server');
        } else {
            // Lỗi khi setup request
            throw new Error('Error');
        }
    }
}