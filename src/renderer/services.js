import axios from 'axios';
import store from './store';


let baseUrl = "http://localhost:1337/";//"http://192.168.0.50:1337/";
let apiUrl = "http://181.29.190.165:1337/";



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
                        url:`${apiUrl}user/refresh-token`,
                        method:"GET",
                        headers: {'Authorization':`Bearer ${token}`}
                    });

                    window.localStorage.setItem("token",response.data.token);
                    store.dispatch("User/setData",response.data.user);
                    //user.update(value => response.data.user);

                    authenticated = true
                }
                catch (e) {
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
          let response  = await axios.post(`${apiUrl}user/login`,account);
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
            let response = await axios.get(`${apiUrl}${resource}/?${query}`,{headers: {'Authorization':`Bearer ${token}`}});

            return response.data;
        },
        async show(resource,id)
        {
            let token = window.localStorage.getItem("token");
            let response = await axios.get(`${apiUrl}${resource}/${id}`,{headers: {'Authorization':`Bearer ${token}`}});

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
            let url = pattern.test(path) ? path : `${apiUrl}${path}`;
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
            let response = await axios.delete(`${apiUrl}${resource}/${id}`,{headers: {'Authorization':`Bearer ${token}`}});

            return response.data;
        },
        async save(data,resource,headers,id)
        {
            let token = window.localStorage.getItem("token");
            let url = id?`${apiUrl}${resource}/${id}` : `${apiUrl}${resource}/`;
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