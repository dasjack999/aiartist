// const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// const { init: initDB, Counter } = require("./db");
const http = require('node:https');
const logger = morgan("tiny");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);
/**
 * 
 * @param {*} options 
 * @param {*} requestData 
 * @returns 
 */
function requestAsync(options, requestData){
  return new Promise((resolve, reject) => {
    try{
      const req = http.request(options, (res) => {
        const chunks = [];
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });  
        res.on('end', () => {
          const responseBody = Buffer.concat(chunks).toString();
          resolve({ responseBody, responseHeaders: res.headers });
        });
      });  
      req.on('error', (err) => {
        reject(err);
      });
      if (requestData) {
        req.write(requestData);
      }
      req.end();
    }catch(e){
      reject(e);
    }
  });
}
/**
 * 
 * @param {*} base 
 * @param {*} path 
 * @param {*} obj 
 * @returns 
 */
async function postJson(base,path,obj){
  const data=obj&&JSON.stringify(obj);
  const options = {
    hostname: base,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data||''),
    },
  };
  const result= await requestAsync(options,data);
  return result.responseBody;
}
/**
 * 
 * @param {*} base 
 * @param {*} path 
 * @param {*} obj 
 * @returns 
 */
async function _getJson(base,path,obj){
  
  if(obj){
    let data= '';
    for(const k in obj){
      data +=k+'='+JSON.stringify( obj[k])+'&';
    }
    path = path+'?'+data;
  }
  const options = {
    hostname: base,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  const result= await requestAsync(options,data);
  return result.responseBody;
}

// // 首页
// app.get("/", async (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
//   // res.json(await postTest());
// });

/**
 * 获取模板库
 */
app.get("/api/model", async (req, res) => {
  const result = await postJson('www.wenxinkejian.com','/api/model',req.body);
  res.send(result);
});
/**
 * 绘制
 * return:{drawid:}
 */
app.post("/api/draw", async (req, res) => {

  const result = await postJson('www.wenxinkejian.com','/api/draw',req.body);
  res.send(result);
});
/**
 * 查询绘制结果
 * req:
 * openid
 * drawid
 * res:
 *  {
        "id": 17,
        "uid": 10004,
        "image_id": 5,
        "operation": 5,
        "execution": "u_4",
        "image_addr": "8b05a5fac291d3d70e23f51ad9ca82cc.jpg",
        "image_prompt": "",
        "mid_res_data": {
            "id": "1118023017562382406",
            "uri": "https://cdn.discordapp.com/attachments/1105706108011696251/1118023017239425024/tomato-h_a_handsome_young_manprotraitghibli_style_illustration__03d9710b-c54a-4961-aa43-0960b052c639.png",
            "hash": "03d9710b-c54a-4961-aa43-0960b052c639",
            "content": "<https://s.mj.run/pnNYvMz_YII> a handsome young man,protrait,ghibli style, illustration style,clean background,--iw 1.5 --niji 5 --seed 3864 --q 0.5 --niji 5",
            "progress": "done"
        },
        "image_convert_addr": "u_4_8b05a5fac291d3d70e23f51ad9ca82cc.jpg",
        "greate_time": "2023-06-13T11:44:21+08:00",
        "update_time": "2023-06-13T11:44:21+08:00"
    }
 */
app.post("/api/work", async (req, res) => {
  //
  const result = await postJson('www.wenxinkejian.com','/api/work',req.body);
  res.send(result);
});
/**
 * 获取所有已绘制结果
 * req:
 * openid
 * 
 * res:
 * 
 */
app.post("/api/works", async (req, res) => {
  //
  const result = await postJson('www.wenxinkejian.com','/api/works',req.body);
  res.send(result);
});

/**
 * 小程序调用，获取微信 Open ID
 */
app.get("/api/wx_openid", (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.json({
      openid:req.headers["x-wx-openid"]
    });
  }
});



/**
 * 
 */
function bootstrap(port) {
  // await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap(process.env.PORT || 80);
