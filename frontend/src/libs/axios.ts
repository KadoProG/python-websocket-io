import Axios from "axios";

const axios = Axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URL,
});

export default axios;
