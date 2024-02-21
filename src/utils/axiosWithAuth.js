import axios from "axios";

export const axiosWithAuth = () => {
  // get the backend URL from the environment variables
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  // get token from local storage
  const token = window.localStorage.getItem("token");
  // create a new instance of axios with the config object
  return axios.create({
    headers: {
      authorization: token,
    },
    baseURL: backendUrl,
  });
};
