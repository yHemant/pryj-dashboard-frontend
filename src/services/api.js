import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getHQs = () => axios.get(`${API_URL}/hqs`);
export const getCLIs = (hq) => axios.get(`${API_URL}/clis?hq=${hq}`);
export const getPerformance = (cli_id, start, end) => 
    axios.get(`${API_URL}/performance?cli_id=${cli_id}&start_date=${start}&end_date=${end}`);
export const adminLogin = (password) => axios.post(`${API_URL}/admin/login`, { password });
export const uploadData = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/admin/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};