import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '', // 동일 origin
  withCredentials: true, // 쿠키 자동 포함
  timeout: 10000,
});

export default axiosClient;
