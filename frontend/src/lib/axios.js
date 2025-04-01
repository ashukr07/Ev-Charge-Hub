import axios from 'axios';
//console.log(import.meta.mode)
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, //send cookies to the server
})
//console.log(axiosInstance.baseURL)

export default axiosInstance 