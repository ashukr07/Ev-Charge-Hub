import axios from 'axios';
//console.log(import.meta.mode)
const axiosInstance = axios.create({
    baseURL: import.meta.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api',
    withCredentials: true, //send cookies to the server
})
//console.log(axiosInstance.baseURL)

export default axiosInstance 