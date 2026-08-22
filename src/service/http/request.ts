import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';

class request {
    private static axiosInstance: AxiosInstance;
    // 转发路径
    private static readonly baseURL = import.meta.env.VITE_API_URL + '/jeecg-boot';
    // 初始化 Axios 实例
    private static init() {
        request.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // 添加请求拦截器
        request.axiosInstance.interceptors.request.use(
            (config) => {
                // 在发送请求之前做些什么
                // 可以在这里添加认证信息、token等
                return config;
            },
            (error) => {
                // 对请求错误做些什么
                return Promise.reject(error);
            }
        );

        // 添加响应拦截器
        request.axiosInstance.interceptors.response.use(this.responseInterceptor, this.errorHandler);
    }

    public static get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        if (!request.axiosInstance) {
            request.init();
        }
        return request.axiosInstance.get(url, config);
    }
    public static post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!request.axiosInstance) {
            request.init();
        }
        return request.axiosInstance.post(url, data, config);
    }

    public static put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!request.axiosInstance) {
            request.init();
        }
        return request.axiosInstance.put(url, data, config);
    }

    public static delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        if (!request.axiosInstance) {
            request.init();
        }
        return request.axiosInstance.delete(url, config);
    }
    /**
     * 响应拦截器处理方法
     * */
    private static responseInterceptor(response: AxiosResponse) {
        const { data } = response;

        if (data.code === 200 && data.success) {
            return data.result;
        }
        return data;
    }
    /**
     *  错误处理方法
     * */
    private static errorHandler(error: AxiosError) {
        if (error.code === 'ECONNABORTED') {
            // 请求超时
            message.error('请求超时').then();
            return Promise.reject(error.message);
        }
        switch (error.response?.status) {
            case 401:
                // 未授权
                message.error('未授权错误').then();
                break;
            case 403:
                // 拒绝访问
                message.error('拒绝访问').then();
                break;
            case 404:
                // 未找到
                message.error('未找到').then();
                break;
            case 500:
                // 服务器错误
                message.error('服务器错误').then();
                break;
            default:
                message.error(error.message).then();
                break;
        }
        // @ts-ignore
        return Promise.reject(error.response?.data?.message);
    }
}

export default request;
