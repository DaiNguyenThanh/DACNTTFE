import axios from './axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');
export const CreateSubjectAPI = async ({ id, name }) => {
    try {

        const response = await axios.post(`${API_URL}/subjects`, {
            id: id,
            name: name
        }, );
        return response.data;
    } catch (error) {
        if (error.response) {
            // Lỗi từ server (status code không phải 2xx)
            throw new Error(error.response.data.message || 'Create Failed');
        } else if (error.request) {
            // Không nhận được response
            throw new Error('Can not connect to server');
        } else {
            // Lỗi khi setup request
            throw new Error('Error');
        }
    }
}
export const UpdateSubjectAPI = async ({ id, name }) => {
    try {

        const response = await axios.put(`${API_URL}/subjects`, {
            id: id,
            name: name
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Update Failed');
        } else if (error.request) {
            throw new Error('Can not connect to server');
        } else {
            throw new Error('Error');
        }
    }
}

export const DeleteSubjectAPI = async (ids) => {
    try {
        const response = await axios.delete(`${API_URL}/subjects`, {
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
            throw new Error(error.response.data.message || 'Delete Failed');
        } else if (error.request) {
            throw new Error('Can not connect to server');
        } else {
            throw new Error('Error');
        }
    }
};
export const GetAllSubjectAPI = async () => {
    try {
        const response = await axios.get(`${API_URL}/subjects/all`
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Get Data Failed');
        } else if (error.request) {
            throw new Error('Can not connect to server');
        } else {
            throw new Error('Error');
        }
    }
}

export const GetSubjectAPI = async ({ id }) => {
    try {
        const response = await axios.get(`${API_URL}/subjects/${id}`,
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Get Data Failed');
        } else if (error.request) {
            throw new Error('Can not connect to server');
        } else {
            throw new Error('Error');
        }
    }
}
export const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000,

});
