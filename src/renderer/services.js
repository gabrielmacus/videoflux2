import axios from 'axios';
import store from './store';
import socketIOClient  from 'socket.io-client';
import sailsIOClient from 'sails.io.js';

import DEV_ENV from '../dev.env';
import PROD_ENV from '../prod.env';
window.ENV = DEV_ENV;
if (process.env.NODE_ENV === 'production') {

  Object.assign(window.ENV, PROD_ENV);
}




export default {

    formatBytes(bytes, decimals = 2){
         if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    toHHMMSS(secs){
        let sec_num = parseInt(secs, 10)
        let hours   = Math.floor(sec_num / 3600)
        let minutes = Math.floor(sec_num / 60) % 60
        let seconds = sec_num % 60

        return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
    },
    "API":{
        async logout()
        { 
          if(socket.isConnected())
          socket.disconnect();
          window.localStorage.removeItem("token");
          router.push("/login");
        },
        async refreshToken(redirect){
            let token = window.localStorage.getItem("token");
            let authenticated = false;
            if(token)
            {

                try
                {


                    let response = await  axios({
                        url:`${ENV.apiUrl}/user/refresh-token`,
                        method:"GET",
                        headers: {'Authorization':`Bearer ${token}`}
                    });

                    window.localStorage.setItem("token",response.data.token);
                    store.dispatch("User/setData",response.data.user);

                    //Socket connection
                    if(!window.io){
                      window.io = sailsIOClient(socketIOClient);
                      window.io.sails.autoConnect = false;
                      window.io.sails.url = ENV.apiUrl;
                      window.io.sails.reconnection = true;
                    }
                    window.io.sails.headers = { 'Authorization':`Bearer ${window.localStorage.getItem("token")}` };

                    window.socket = window.io.sails.connect(ENV.apiUrl);
                    window.socket.on('connect',()=>{
                      window.socket.post(`${ENV.apiUrl}/user/connected`)
                    });

                    //
                    //user.update(value => response.data.user);

                    authenticated = true
                }
                catch (e) {
                  console.log(e)
                }
            }

            if(redirect && !authenticated)
            {
                router.push("/login");
            }

            return authenticated;

        },
        async login(account)
        {

          let response  = await axios.post(`${ENV.apiUrl}/user/login`,account);


          window.localStorage.setItem("token",response.data.token);

          return response.data;
        },
        async list(resource,query){
            if(query)
            {
                query = Object.keys(query).map(key => key + '=' + query[key]).join('&');
            }
            else
            {
                query = "";
            }
            let token = window.localStorage.getItem("token");
            let response = await axios.get(`${ENV.apiUrl}/${resource}/?${query}`,{headers: {'Authorization':`Bearer ${token}`}});

            return response.data;
        },
        async show(resource,id)
        {
            let token = window.localStorage.getItem("token");
            let response = await axios.get(`${ENV.apiUrl}/${resource}/${id}`,{headers: {'Authorization':`Bearer ${token}`}});

            return response.data;
        },
        async execute(path, method, data,headers)
        {
            let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

            let token = window.localStorage.getItem("token");
            let url = pattern.test(path) ? path : `${ENV.apiUrl}/${path}`;
            if(headers)
            {
                headers["Authorization"]  = `Bearer ${token}`;
            }
            else
            {
                headers =  {'Authorization':`Bearer ${token}`}
            }
            let response = await  axios({
                url,
                method,
                data,
                headers: headers
            });
            return response.data;
        },
        async delete(resource,id)
        {
            let token = window.localStorage.getItem("token");
            let response = await axios.delete(`${ENV.apiUrl}/${resource}/${id}`,{headers: {'Authorization':`Bearer ${token}`}});

            return response.data;
        },
        async save(data,resource,headers,id)
        {
            let token = window.localStorage.getItem("token");
            let url = id?`${ENV.apiUrl}/${resource}/${id}` : `${ENV.apiUrl}/${resource}/`;
            let method = id?"PATCH":"POST";
            if(headers)
            {
                headers["Authorization"]  = `Bearer ${token}`;
            }
            else
            {
                headers =  {'Authorization':`Bearer ${token}`}
            }
            let response = await  axios({
                url,
                method,
                data,
                headers: headers
            });
            return response.data;
        }
    }

};
