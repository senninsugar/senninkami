const express = require('express');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

const app = express();
const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    followRedirects: true
});

// 設定の読み込み
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const PORT = process.env.PORT || config.port;

// 静的ファイルの提供 (publicディレクトリ)
app.use(express.static(path.join(__dirname, 'public')));

// プロキシロジック
app.all(`${config.proxy_prefix}*`, (req, res) => {
    let targetUrl = req.url.replace(config.proxy_prefix, '');
    
    if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
    }

    proxy.web(req, res, { target: targetUrl }, (e) => {
        console.error(`Proxy Error: ${e.message}`);
        res.redirect('/error.html');
    });
});

// エラーハンドリング
proxy.on('error', (err, req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Something went wrong with the proxy.');
});

app.listen(PORT, () => {
    console.log(`--------------------------------------`);
    console.log(`Stealth Browser UI active on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`--------------------------------------`);
});
