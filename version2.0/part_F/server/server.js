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
  '/login': '/pages/misc/login.html',
  '/profile': '/pages/misc/profile.html',
  '/new-page': '/pages/cms/new-page.html',
  '/pages': '/pages/cms/pages.html',
  '/markup-rules': '/pages/cms/markup-rules.html',
  '/upload-file': '/pages/cms/upload-file.html',
  '/files': '/pages/cms/files.html'
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

  if (pageURLkeys.includes(url)) {  //  If it's a static page route....
    url = pageURLs[url];
    try {
      page_content = fs.readFileSync( __dirname + '/..' + url);
    } catch(err) {
      page_content = fs.readFileSync(__dirname + '/../pages/misc/404.html');
    }
  } else if (url.substring(0, 6) == '/edit/') {
    page_content = fs.readFileSync(__dirname + '/../pages/cms/edit-page.html');
  } else {                          //  If it's a dynamic page route....
    let page_data = DataBase.table('pages').find({ route: url.slice(1) });  //  Removing the "/" from the route
    if (page_data.length < 1) {
      page_content = fs.readFileSync(__dirname + '/../pages/misc/404.html');
    } else {
      page_content = fs.readFileSync(__dirname + '/../pages/cms/dynamic-page.html');
    }
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
function parse_req_data(req_data) {
  try {
    let parsed_req_data = JSON.parse(req_data);
    if (typeof parsed_req_data === 'object' && !Array.isArray(parsed_req_data) && parsed_req_data !== null) {
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
  let buffer_chunks = [];
  req.on('data', chunk => {
    if (req.headers['content-type'] != 'application/octet-stream') {
      req_data += chunk;
    } else {
      buffer_chunks.push(chunk);
    }
  })
  req.on('end', function() {    

    //  Parse the data to JSON.
    if (req.headers['content-type'] != 'application/octet-stream') {
      req_data = parse_req_data(req_data, res);
    } else {
      req_data = { body: Buffer.concat(buffer_chunks) };
    }

    //  Get data, for example /api/users?userid=22&username=ben
    req_data._params = parse_url_params(url);
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

GET_routes['/api/user-by-session'] = function(params, res) {
  let session_data = DataBase.table('sessions').find({ id: parseInt(params.session_id) });
  if (session_data.length < 1) {
    return api_response(res, 404, 'No session found');
  }
  let user_data = DataBase.table('users').find({ id: session_data[0].user_id });
  if (user_data.length < 1) {
    api_response(res, 404, `No user found for session ${session_data[0].id}.`);
  } else {
    api_response(res, 200, JSON.stringify(user_data[0]));
  }
}

GET_routes['/api/page'] = function(req_data, res) {
  let response = { error: false };
  let page_data = DataBase.table('pages').find({ route: req_data.route });
  let session_data = DataBase.table('sessions').find({ id: req_data.session_id });
  if (page_data.length < 1) {
    response.error = true;
    response.msg = `The page ${req_data.route} was not found.`;
  } else if (page_data[0].is_public || (session_data.length > 0 && page_data[0].created_by == session_data[0].user_id)) {
    response.data =  page_data[0];
  } else {
    response.error = true;
    response.msg = `You don't have permission to view this page.`;
  } 
  api_response(res, 200, JSON.stringify(response));
}


GET_routes['/api/all-pages'] = function(req_data, res) {
  let all_pages = fs.readFileSync(__dirname + '/database/table_rows/pages.json', 'utf8');
  all_pages = JSON.parse(all_pages);
  for (let i = 0; i < all_pages.length; i++) {
    let creator_id = parseInt(all_pages[i].created_by);
    all_pages[i].created_by = DataBase.table('users').find({id: creator_id})[0].username;
  }
  api_response(res, 200, JSON.stringify(all_pages));
}

GET_routes['/api/all-files'] = function(req_data, res) {
  let all_files = fs.readFileSync(__dirname + '/database/table_rows/files.json', 'utf8');
  all_files = JSON.parse(all_files);
  for (let i = 0; i < all_files.length; i++) {
    let creator_id = parseInt(all_files[i].created_by);
    all_files[i].created_by = DataBase.table('users').find({id: creator_id})[0].username;
  }
  api_response(res, 200, JSON.stringify(all_files));
}

POST_routes['/api/register'] = function(new_user, res) {
  new_user.salt = crypto.randomBytes(16).toString('hex');
  new_user.password = crypto.pbkdf2Sync(new_user.password, new_user.salt, 1000, 64, `sha512`).toString(`hex`);
  //  Add the user to the db.
  let response = DataBase.table('users').insert(new_user);
  
  if (new_user.invite_code != 'secret123') {
    response.error = true;
    response.msg = 'Incorrect invite code!';
  }
  
  if (!response.error) {
    //  Add a session to the db.
    let expire_date = new Date()
    expire_date.setDate(expire_date.getDate() + 30);
    let new_session_response = DataBase.table('sessions').insert({
      user_id: response.id,
      expires: expire_date
    })
    response.error = new_session_response.error;
    response.session_id = new_session_response.id;
  }
  api_response(res, 200, JSON.stringify(response));
}

POST_routes['/api/login'] = function(login_info, res) {
  let user_data = DataBase.table('users').find({ username: login_info.username });
  let response = {
    error: false,
    msg: '',
    user_data: '',
    session_id: ''
  }
  if (user_data.length < 1) {
    response.error = true;
    response.msg = 'No user found.';
    return api_response(res, 200, JSON.stringify(response));
  }
  let password = crypto.pbkdf2Sync(login_info.password, user_data[0].salt, 1000, 64, `sha512`).toString(`hex`);
  if (password != user_data[0].password) {
    response.error = true;
    response.msg = 'Incorrect password.';
  } else {
    response.user_data = user_data[0];
    let expire_date = new Date()
    expire_date.setDate(expire_date.getDate() + 30);
    let session_data = DataBase.table('sessions').insert({
      user_id: user_data[0].id,
      expires: expire_date
    })
    response.error = session_data.error;
    response.session_id = session_data.id;
  }
  api_response(res, 200, JSON.stringify(response));
}

POST_routes['/api/logout'] = function(req_data, res) {
  let success_msg = DataBase.table('sessions').delete(req_data.body);
  api_response(res, 200, success_msg);
}

POST_routes['/api/update-user'] = function(user_update, res) {
  let response = DataBase.table('users').update(user_update.id, user_update);
  api_response(res, 200, JSON.stringify(response));
}

POST_routes['/api/update-password'] = function(password_update, res) {
  let user_data = DataBase.table('users').find({ id: password_update.id });
  let response = {
    error: false,
    msg: '',
  }
  if (user_data.length < 1) {
    response.error = true;
    response.msg = 'No user found.';
    return api_response(res, 200, JSON.stringify(response));
  }
  let password = crypto.pbkdf2Sync(password_update.old_password, user_data[0].salt, 1000, 64, `sha512`).toString(`hex`);
  let new_pass = '';
  if (password != user_data[0].password) {
    response.error = true;
    response.msg = 'Incorrect password.';
  } else {
    new_pass = crypto.pbkdf2Sync(password_update.new_password, user_data[0].salt, 1000, 64, `sha512`).toString(`hex`);
  }

  if (!response.error) {
    response.updated_user = DataBase.table('users').update(password_update.id, {password: new_pass});
    if (response.updated_user == null) {
      response.error = true;
      response.msg = `No user found for session ${password_update.id}.`
    }
  }

  api_response(res, 200, JSON.stringify(response));
}

POST_routes['/api/delete-user'] = function(user_info, res) {
  let user_data = DataBase.table('users').find({ id: user_info.id });
  let response = {
    error: false,
    msg: '',
  }
  if (user_data.length < 1) {
    response.error = true;
    response.msg = 'No user found.';
    return api_response(res, 200, JSON.stringify(response));
  }
  let password = crypto.pbkdf2Sync(user_info.password, user_data[0].salt, 1000, 64, `sha512`).toString(`hex`);
  if (password != user_data[0].password) {
    response.error = true;
    response.msg = 'Incorrect password.';
  } else {
    let success_msg = DataBase.table('users').delete(user_info.id);
    response.msg = `Deleted user ${user_info.id} successfully.`;
  }

  api_response(res, 200, JSON.stringify(response));
}

POST_routes['/api/check-invite-code'] = function(data, res) {
  if (data.invite_code == 'secret123') {
    api_response(res, 200, JSON.stringify({error: false}));
  } else {
    api_response(res, 200, JSON.stringify({error: true, msg: "incorrect code"}));
  }
}

POST_routes['/api/create-page'] = function(new_page_data, res) {
  let response = DataBase.table('pages').insert(new_page_data);
  api_response(res, 200, JSON.stringify(response));
}

POST_routes['/api/update-page'] = function(page_update, res) {
  let response = { error: false };
  let page_data = DataBase.table('pages').find({ id: page_update.id });
  let session_data = DataBase.table('sessions').find({ id: page_update.session_id });
  if (page_data[0].created_by != session_data[0].user_id) {
    response.error = true;
    response.msg = `You don't have permission to update this page.`;
  }
  if (!response.error) {
    response = DataBase.table('pages').update(page_update.id, page_update);
  }
  api_response(res, 200, JSON.stringify(response));
}

POST_routes['/api/delete-page'] = function(request_info, res) {
  let page_data = DataBase.table('pages').find({ id: request_info.id });
  let session_data = DataBase.table('sessions').find({ id: request_info.session_id });
  let response = {
    error: false,
    msg: '',
  }
  if (page_data.length < 1) {
    response.error = true;
    response.msg = 'No page found.';
  } else if  (page_data[0].created_by != session_data[0].user_id) {
    response.error = true;
    response.msg = `You don't have permission to delete this page.`;
  } else {
    response.msg = DataBase.table('pages').delete(request_info.id);
  }
  return api_response(res, 200, JSON.stringify(response));
}

POST_routes['/api/upload-file'] = function(req_data, res) {
  req_data._params.name = req_data._params.name.replace('%2E', '.');

  let file_data = DataBase.table('files').find({ name: req_data._params.name });
  let response = {
    error: false,
    msg: '',
  }
  if (file_data.length != 0) {
    response.error = true;
    response.msg = `The file name ${req_data._params.name} already exists.`;
    return api_response(res, 400, JSON.stringify(response));
  }

  try {
    fs.writeFileSync(__dirname + '/../assets/uploads/' + req_data._params.name, req_data.body);
  } catch (err) {
    return api_response(res, 400, JSON.stringify(err));
  }
  let feedback = DataBase.table('files').insert({
    name: req_data._params.name,
    description: req_data._params.description.replace(/%20/g, ' '),
    date_created: new Date().toString(),
    created_by: req_data._params.created_by,
    is_public: req_data._params.is_public
  })
  if (feedback.error) {
    return feedback;
  }
  return api_response(res, 200, JSON.stringify({error: false, msg: 'File uploaded successfully!'}));
}

POST_routes['/api/delete-file'] = function(request_info, res) {
  let file_data = DataBase.table('files').find({ id: request_info._params.id });
  let session_data = DataBase.table('sessions').find({ id: request_info._params.session_id });
  let response = {
    error: false,
    msg: '',
  }
  if (file_data.length < 1) {
    response.error = true;
    response.msg = 'No file found.';
  } else if  (file_data[0].created_by != session_data[0].user_id) {
    response.error = true;
    response.msg = `You don't have permission to delete this file.`;
  } else {
    fs.unlinkSync(__dirname + '/../assets/uploads/' + file_data[0].name);
    response.msg = DataBase.table('files').delete(request_info._params.id);
  }
  return api_response(res, 200, JSON.stringify(response));
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