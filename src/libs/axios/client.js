import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '', // 동일 origin
  withCredentials: true,
  timeout: 10000,
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

function subscribeRefresh(cb) {
  refreshSubscribers.push(cb);
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 서버에서 명시적으로 401 반환한 경우에만 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const res = await axiosClient.post('/api/auth/refresh');
          if (res.data.success) {
            isRefreshing = false;
            onRefreshed();
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('[axiosClient] 토큰 갱신 실패:', refreshError);
        }

        isRefreshing = false;
        return Promise.reject(error);
      }

      return new Promise((resolve) => {
        subscribeRefresh(() => {
          resolve(axiosClient(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
