const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const options = {
    hostname: 'inputtools.google.com',
    port: 443,
    path: '/request?itc=zh-t-i0-pinyin&num=[candidate_num]&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage',
    method: 'GET'
};

const requestIMECandidate = function(req, res, callback) {
    const text = req.query.text;
    const num = req.query.num;
    options.path += `&text=${text}`;
    options.path.replace('[candidate_num]', num);
    return https.request(options, res => {
        let body = '';
        res.on('data', chunk => {
            body = body + chunk;
        });
        res.on('end',function(){
            if (res.statusCode != 200) {
              callback("Api call failed with response code " + res.statusCode);
            } else {
              callback(body);
            }
        });
    });
};
app.use(express.static(__dirname));
app.get('/ime', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/candidate', function (req, res) {
    let request = requestIMECandidate(req, res, (candidateData) => {
        //console.log(candidateData);
        res.status(200).json(candidateData);
    });
    request.end();
});

app.get('/more', function (req, res) {
    let request = requestIMECandidate(req, res, (candidateData) => {
        //console.log(candidateData);
        res.status(200).json(candidateData);
    });
    request.end();
});

app.listen(2022);