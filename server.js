const express = require('express'),
    Alloy = require('alloyproxy'),
    app = express(),
    http = require('http'),
    fs = require('fs'),
    path = require('path');

const config = JSON.parse(fs.readFileSync('./config.json', { encoding: 'utf8' }));
const server = http.createServer(app);

// Alloy Proxyの設定
const localprox = new Alloy({
    prefix: '/prefix/',
    error: (proxy) => {
        return proxy.res.send(fs.readFileSync(path.join(__dirname, 'public', 'error.html'), 'utf8'));
    },
    request: [],
    response: [],
    injection: true // スクリプトインジェクションを有効化
});

// Alloyのミドルウェアを適用
app.use(localprox.app);

// WebSocketの対応
localprox.ws(server);

// ルーティング
app.get('/', (req, res) => {
    res.send(fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8'));
});

app.post('/', (req, res) => {
    res.send(fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8'));
});

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, 'public')));

server.listen(process.env.PORT || config.port, () => {
    console.log(`Alloy Stealth Engine active on port ${config.port}`);
});
