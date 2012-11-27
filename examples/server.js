var fs = require('fs')
  , join = require('path').join;

var examples = fs.readdirSync(__dirname).filter(function (file) {
  return fs.statSync(join(__dirname, file)).isDirectory();
});

require('http').createServer(function (req, res) {
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
      var url = req.url.split('/')
        , example = url[1]
        , filename;

      function render (file) {
        var html = fs.readFileSync(file, 'utf8');
        res.setHeader('content-type', 'text/html');
        res.setHeader('content-length', Buffer.byteLength(html));
        res.writeHead(200);
        res.write(html);
        res.end();
      }

      if (!example) {
        filename = join(__dirname, 'index.html')
        render(filename);
      } else if (~examples.indexOf(example)) {
        if (url.length === 2) {
          res.writeHead(302, { 'location': '/' + example + '/' });
          res.end();
          return;
        }

        filename = join(__dirname, example, 'index.html')
        render(filename);
      } else {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.write('404 - Example not found');
        res.end();
      }

      break;
  }
}).listen(3000);
