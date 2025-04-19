import axios from 'axios';
//console.log("DEV",import.meta.env.DEV)
const axiosInstance = axios.create({
    baseURL: import.meta.env.DEV ? 'http://localhost:5000/api' : '/api',
    withCredentials: true, //send cookies to the server
})
//console.log(axiosInstance.baseURL)

export default axiosInstance 