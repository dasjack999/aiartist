const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");
const http = require('node:https');

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  // res.sendFile(path.join(__dirname, "index.html"));
  res.json(await postTest());
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  
  res.send({
    code: 0,
    data: result,

  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

function postAsync(options, requestData){
  return new Promise((resolve, reject) => {
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
  });
}
async function postTest() {
  
  const postData = JSON.stringify({
    
      username: "admin",
      password: "admin(*)!@34\"}"
    
  });

  const options = {
    hostname: 'www.wenxinkejian.com',
    // port: 43,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  var result = await postAsync(options,postData);
  return result;
  // const req = http.request(options, (res) => {
  //   console.log(`STATUS: ${res.statusCode}`);
  //   console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  //   res.setEncoding('utf8');
  //   res.on('data', (chunk) => {
  //     console.log(`BODY: ${chunk}`);
  //   });
  //   res.on('end', () => {
  //     console.log('No more data in response.');

  //   });
  // });

  // req.on('error', (e) => {
  //   console.error(`problem with request: ${e.message}`);
  // });

  // // Write data to request body
  // req.write(postData);
  // req.end()
}
async function bootstrap() {
  // await initDB();

  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
