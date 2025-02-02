import axios from './axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');

export const GetAllTaskHistorys = async () => {
    try {
        const response = await axios.get(`${API_URL}/taskhistorys/all`
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

export const GetTaskHistory = async ( id ) => {
    try {
        const response = await axios.get(`${API_URL}/taskhistorys/${id}`,
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
