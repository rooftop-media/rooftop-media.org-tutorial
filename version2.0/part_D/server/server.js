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
  '/create-page': '/pages/cms/create-page.html',
  '/all-pages': '/pages/cms/all-pages.html',
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
    if (req.method == "GET") {
      api_GET_routes(url, res);
    } else if (req.method == "POST") {
      api_POST_routes(url, req, res);
    }
  } else if (extname.length == 0) {            /*  No extension? Respond with index.html.  */
    respond_with_a_page(res, url);
  } else {    /*  Extension, like .png, .css, .js, etc? If found, respond with the asset.  */
    respond_with_asset(res, url, extname);
  }

}

function respond_with_a_page(res, url) {
  if (pageURLkeys.includes(url)) {
    url = pageURLs[url];
  } else if (url.substring(0, 6) == '/edit/') {
    url = '/pages/cms/edit-page.html';
  } else  {
    return respond_with_a_dynamic_page(res, url);
  }
  fs.readFile( __dirname + '/..' + url, function(error, content) {
    var content_page = "";
    if (error) {
      content_page = fs.readFileSync(__dirname + '/../pages/misc/404.html');
    } else {
      content_page = content;
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    var main_page = fs.readFileSync(__dirname + '/../pages/index.html', {encoding:'utf8'});
    var page_halves = main_page.split('<!--  Insert page content here!  -->');
    var rendered = page_halves[0] + content_page + page_halves[1];
    res.write(rendered);
    res.end();
  });
}

function respond_with_a_dynamic_page(res, url) {
  let page_data = DataBase.table('pages').find({ page_route: url.slice(1) });  //  Removing the "/" from the route
  let content_page = "";
  if (page_data.length < 1 || !page_data[0].is_public) {
    content_page = fs.readFileSync(__dirname + '/../pages/misc/404.html');
  } else {
    content_page = fs.readFileSync(__dirname + '/../pages/cms/display-page.html', {encoding:'utf8'});
  }
  var main_page = fs.readFileSync(__dirname + '/../pages/index.html', {encoding:'utf8'});
  var page_halves = main_page.split('<!--  Insert page content here!  -->');
  content_page = page_halves[0] + content_page + page_halves[1];
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(content_page);
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
      res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
        }
    } else {
        var contentType = mimeTypes[extname] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    }
  });
}

////  SECTION 3: API.

function api_response(res, code, text) {
  res.writeHead(code, {'Content-Type': 'text/html'});
  res.write(text);
  return res.end();
}

function api_GET_routes(url, res) {
  //  Get data, for example /api/users?userid=22&username=ben
  let req_data = {};
  if (url.indexOf('?') != -1) {
    let params = url.split('?')[1];
    url = url.split('?')[0];
    params = params.split('&');
    for (let i = 0; i < params.length; i++) {
      let parts = params[i].split('=');
      if (parts.length != 2) {
        return api_response(res, 400, `Improper data in your request.`);
      }
      req_data[parts[0]] = parts[1];
    }
  }
  
  let api_map = {
    '/api/user-by-session': GET_user_by_session,
    '/api/all-pages': GET_all_pages,
    '/api/page': GET_page,
  }

  //  Call the API route function, if it exists.
  if (typeof api_map[url] == 'function') {
    api_map[url](req_data, res);
  } else {
    api_response(res, 404, `The GET API route ${url} does not exist.`);
  }
}

function GET_user_by_session(req_data, res) {
  let session_data = DataBase.table('sessions').find({ id: parseInt(req_data.session_id) });
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

function GET_all_pages(req_data, res) {
  let all_pages = fs.readFileSync(__dirname + '/database/table_rows/pages.json', 'utf8');
  all_pages = JSON.parse(all_pages);
  for (let i = 0; i < all_pages.length; i++) {
    let owner_id = parseInt(all_pages[i].created_by);
    all_pages[i].owner = DataBase.table('users').find({id: owner_id})[0].username;
  }
  api_response(res, 200, JSON.stringify(all_pages));
}

function GET_page(req_data, res) {
  let page_data = DataBase.table('pages').find({ page_route: req_data.page_route });
  let response = {
    error: false,
    data: null
  }
  if (page_data.length < 1) {
    response.error = true;
    response.msg = `The page ${route_data.page_route} was not found.`;
  } else {
    response.data =  page_data[0];
  }
  api_response(res, 200, JSON.stringify(response));
}

function api_POST_routes(url, req, res) {
  let req_data = '';
  req.on('data', chunk => {
    req_data += chunk;
  })
  req.on('end', function() {
    //  Parse the data to JSON.
    try {
      req_data = JSON.parse(req_data);
    } catch (e) {
      return api_response(res, 400, `Improper data in your request.`);
    }

    let api_map = {
      '/api/register': POST_register,
      '/api/login': POST_login,
      '/api/logout': POST_logout,
      '/api/update-user': POST_update_user,
      '/api/update-password': POST_update_password,
      '/api/delete-user': POST_delete_user,
      '/api/check-invite-code': POST_check_invite_code,
      '/api/create-page': POST_create_page,
      '/api/update-page': POST_update_page,
      '/api/delete-page': POST_delete_page
    }
    
    //  Call the API route function, if it exists.
    if (typeof api_map[url] == 'function') {
      api_map[url](req_data, res);
    } else {
      api_response(res, 404, `The POST API route ${url} does not exist.`);
    }
  })
}

function POST_register(new_user, res) {
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

function POST_login(login_info, res) {
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

function POST_logout(session_id, res) {
  let success_msg = DataBase.table('sessions').delete(session_id);
  api_response(res, 200, success_msg);
}

function POST_update_user(user_update, res) {
  let response = DataBase.table('users').update(user_update.id, user_update);
  api_response(res, 200, JSON.stringify(response));
}

function POST_update_password(password_update, res) {
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

function POST_delete_user(user_info, res) {
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
    response.msg = DataBase.table('users').delete(user_info.id);
  }

  api_response(res, 200, JSON.stringify(response));
}

function POST_check_invite_code(data, res) {
  if (data.invite_code == 'secret123') {
    api_response(res, 200, JSON.stringify({error: false}));
  } else {
    api_response(res, 200, JSON.stringify({error: true, msg: "incorrect code"}));
  }
}

function POST_create_page(new_page_data, res) {
  let response = DataBase.table('pages').insert(new_page_data);
  api_response(res, 200, JSON.stringify(response));
}

function POST_update_page(page_update, res) {
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

function POST_delete_page(request_info, res) {
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
