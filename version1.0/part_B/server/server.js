////  SECTION 1: Imports.

//  Importing NodeJS libraries.
var http = require('http');     // listen to HTTP requests
var path = require('path');     // manage filepath names
var fs   = require('fs');       // access files on the server
var crypto = require('crypto'); // encrypt user passwords

//  Importing our custom libraries
const DataBase = require('./database/database.js');

////  SECTION 2: Request response.

//  This dictionary of media types (MIME types) will be used in the server func.
var mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

//  Mapping URLs to pages
var pageURLs = {
  '/': '/pages/misc/landing.html',
  '/landing': '/pages/misc/landing.html',
  '/register': '/pages/misc/register.html',
  '/login': '/pages/misc/login.html'
}
var pageURLkeys = Object.keys(pageURLs);

//  This function will fire upon every request to our server.
function server_request(req, res) {
  var url = req.url;
  console.log(`\x1b[36m >\x1b[0m New ${req.method} request: \x1b[34m${url}\x1b[0m`);
  var extname = String(path.extname(url)).toLowerCase();

  if (url.split('/')[1] == 'server') {  /*  Don't send anything from the /server/ folder.  */
    respond_with_a_page(res, '/404');
  } else if (extname.length == 0 && url.split('/')[1] == 'api') {     /*  API routes.      */
    api_routes(url, req, res)
  } else if (extname.length == 0) {            /*  No extension? Respond with index.html.  */
    respond_with_a_page(res, url);
  } else {    /*  Extension, like .png, .css, .js, etc? If found, respond with the asset.  */
    respond_with_asset(res, url, extname);
  }

}

function respond_with_a_page(res, url) {
  let page_content = "";
  if (pageURLkeys.includes(url)) {
    url = pageURLs[url];
  } else {
    url = '/pages/misc/404.html';
  }
  try {
    page_content = fs.readFileSync( __dirname + '/..' + url);
  } catch(err) {
    page_content = fs.readFileSync(__dirname + '/../pages/misc/404.html');
  }
  res.writeHead(200, {'Content-Type': 'text/html'});
  var main_page = fs.readFileSync(__dirname + '/../pages/index.html', {encoding:'utf8'});
  var page_halves = main_page.split('<!--  Insert page content here!  -->');
  var rendered = page_halves[0] + page_content + page_halves[1];
  res.write(rendered);
  res.end();
}

function respond_with_asset(res, url, extname) {
  fs.readFile( __dirname + '/..' + url, function(error, content) {
    if (error) {
      if(error.code == 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 -- asset not found', 'utf-8');
      }
      else {
        res.writeHead(500);
        res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
      }
    } else {
      var contentType = mimeTypes[extname] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

////  SECTION 3: API.

let GET_routes = {};  //  Stores all GET route methods!
let POST_routes = {}; //  Stores all POST route methods!

//  Responds to HTTP requests. "code" might be 404, 200, etc. 
function api_response(res, code, text) {
  res.writeHead(code, {'Content-Type': 'text/html'});
  res.write(text);
  return res.end();
}

//  Parses the data sent with a request
function parse_req_data(req_data, res) {
  try {
    let parsed_req_data = JSON.parse(req_data);
    if (typeof parsed_req_data === 'object' && !Array.isArray(parse_req_data) && parse_req_data !== null) {
      return parsed_req_data;
    } else {
      return { body: req_data };
    }
  } catch (e) {
    return { body: req_data };
  }
}

//  Parse URL params for example /api/users?userid=22&username=ben
function parse_url_params(url, res) {
  let params = { _url: url };
  if (url.indexOf('?') != -1) {
    let param_string = url.split('?')[1];
    let param_pairs = param_string.split('&');
    for (let i = 0; i < param_pairs.length; i++) {
      let parts = param_pairs[i].split('=');
      if (parts.length != 2) {
        return api_response(res, 400, `Improper URL parameters.`);
      }
      params[parts[0]] = parts[1];
    }
    params._url = url.split('?')[0];
  }
  return params;
}

//  This is called in server_request for any req starting with /api/.  It uses the functions above and calls the functions below.
function api_routes(url, req, res) {

  let req_data = '';
  req.on('data', chunk => {
    req_data += chunk;
  })
  req.on('end', function() {

    //  Parse the data to JSON.
    req_data = parse_req_data(req_data, res);

    //  Get data, for example /api/users?userid=22&username=ben
    req_data._params = parse_url_params(url, res);
    url = req_data._params._url;

    if (req.method == "GET" && typeof GET_routes[url] == 'function') {
      GET_routes[url](req_data._params, res);
    } else if (req.method == "POST" && typeof POST_routes[url] == 'function') {
      POST_routes[url](req_data, res);
    } else {
      api_response(res, 404, `The ${req.method} API route ${url} does not exist.`);
    }

  })
}

POST_routes['/api/register'] = function(new_user, res) {
  new_user.salt = crypto.randomBytes(16).toString('hex');
  new_user.password = crypto.pbkdf2Sync(new_user.password, new_user.salt, 1000, 64, `sha512`).toString(`hex`);
  //  Add the user to the db, if their username, email and phone # are unique.
  let response = DataBase.table('users').insert(new_user);
  api_response(res, 200, JSON.stringify(response));
}


////  SECTION 4: Boot.

console.log("\x1b[32m >\x1b[0m Starting the rooftop server, at \x1b[36mlocalhost:8080\x1b[0m !");

//  Creating the server!
var server = http.createServer(
  server_request
);
server.on('close', () => {
  console.log("\x1b[31m >\x1b[0m Shutting down server. Bye!")
})
process.on('SIGINT', function() {
  server.close();
});
server.listen(8080);