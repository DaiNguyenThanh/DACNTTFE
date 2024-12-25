
import axios from "axios";
axios.interceptors.request.use(config => {
    
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['ngrok-skip-browser-warning'] = 1;
    } else {
        console.warn('Token không tồn tại'); 
    }
    return config;
}, error => {
    return Promise.reject(error);
});
export default axios