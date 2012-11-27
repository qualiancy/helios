var fs = require('fs')
  , join = require('path').join;

require('http').createServer(function (req, res) {
  console.log(req.url);
  switch (req.url) {
    case '/js/build.js':
      var file = join(__dirname, '../build/build.js')
        , script = fs.readFileSync(file, 'utf8');
      res.setHeader('content-type', 'application/javascript');
      res.setHeader('content-length', Buffer.byteLength(script));
      res.writeHead(200);
      res.write(script);
      res.end();
      break;
    case '/favicon.ico':
      res.writeHead(404);
      res.end();
      break;
    default:
      var file = join(__dirname, 'index.html')
        , script = fs.readFileSync(file, 'utf8');
      res.setHeader('content-type', 'text/html');
      res.setHeader('content-length', Buffer.byteLength(script));
      res.writeHead(200);
      res.write(script);
      res.end();
      break;
  }
}).listen(8080);
