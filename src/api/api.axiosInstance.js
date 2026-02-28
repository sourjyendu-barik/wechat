import axios from "axios";

let _token = null;

//export the hook to context so that it can update api memory
export const setApiToken = (token) => {
  _token = token;
};

//the main api or root api
const api = axios.create({
  baseURL: "https://wechat-middlewire.vercel.app/api/",
  timeout: 10000,
  withCredentials: true, //allows browser to send and receive cookie
  headers: {
    "Content-Type": "application/json",
  },
});

//while requesting attaching token wheather its expired or not
api.interceptors.request.use(
  //param 1 config
  (config) => {
    // console.log("Interceptor _token value:", _token); // DEBUG HERE
    if (_token) {
      config.headers.Authorization = `Bearer ${_token}`;
    }

    return config;
  },
  //if the interseptor see any error it will not pass the further api call
  (error) => {
    return Promise.reject(error);
  },
);

//after checking or getting response if exppired token then
//1-clear cookie(http)
//2- Redirect to login page
api.interceptors.response.use(
  // Axios interceptors have two parts: "(response) => response" when when request succeeds and (error) => {} when when request fails
  //first param
  (res) => res,
  //second param for error handling
  async (error) => {
    if (!error.response || !error.config) {
      return Promise.reject(error);
    }
    const originalrequest = error.config; //Axios stores the config or api even if in error
    if (error.response?.status === 401 && !originalrequest._retry) {
      originalrequest._retry = true;
      //without _retry : request-> 401-> refresh -> retry->401 because Axios interceptor runs on every 401 response. and we added a refresh logic in interceptor
      //_retry is not available in axios config we used this as flag so after first 401 request it go to promise.reject
      try {
        //if accessToken expire->
        const res = await axios.post(
          "https://wechat-middlewire.vercel.app/api/auth/refresh",
          {},
          { withCredentials: true },
        );

        const newAccessToken = res?.data?.accessToken;
        setApiToken(newAccessToken);

        // originalrequest.headers.Authorization = `Bearer ${newAccessToken}`;
        originalrequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalrequest);
      } catch (error) {
        //refresh failed then logout user
        await axios.post(
          "https://wechat-middlewire.vercel.app/api/auth/logout",
          {},
          { withCredentials: true },
        );
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
