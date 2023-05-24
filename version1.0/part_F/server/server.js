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
  '/profile': '/pages/misc/profile.html'
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

function api_GET_routes(url, res) {

}


function api_POST_routes(url, req, res) {
  let req_data = '';
  req.on('data', chunk => {
    req_data += chunk;
  })
  req.on('end', function() {
    req_data = JSON.parse(req_data);

    let api_map = {
      '/api/register': POST_register,
      '/api/login': POST_login,
      '/api/logout': POST_logout,
      '/api/user-by-session': POST_user_by_session,
      '/api/update-user': POST_update_user,
      '/api/update-password': POST_update_password,
      '/api/check-invite-code': POST_check_invite_code
    }
    
    //  Calling the API route's function
    api_map[url](req_data, res);
  })
}

function POST_register(new_user, res) {
  let user_data = fs.readFileSync(__dirname + '/database/table_rows/users.json', 'utf8');
  user_data = JSON.parse(user_data);
  let response = {
    error: false,
    msg: '',
    session_id: ''
  }
  for (let i = 0; i < user_data.length; i++) {
    if (user_data[i].username == new_user.username) {
      response.error = true;
      response.msg = 'Username already taken.';
      break;
    } else if (user_data[i].email == new_user.email) {
      response.error = true;
      response.msg = 'Email already taken.';
      break;
    } else if (user_data[i].phone == new_user.phone) {
      response.error = true;
      response.msg = 'Phone number already taken.';
      break;
    }
  }
  if (new_user.invite_code != 'secret123') {
    response.error = true;
    response.msg = 'Incorrect invite code!';
  }

  //  If it's not a duplicate, encrypt the pass, and save it. 
  if (!response.error) {
    new_user.salt = crypto.randomBytes(16).toString('hex');
    new_user.password = crypto.pbkdf2Sync(new_user.password, new_user.salt, 1000, 64, `sha512`).toString(`hex`);
    //  Add the user to the db.
    let user_id = DataBase.table('users').insert(new_user);
    //  Add a session to the db.
    let expire_date = new Date()
    expire_date.setDate(expire_date.getDate() + 30);
    response.session_id = DataBase.table('sessions').insert({
      user_id: user_id,
      expires: expire_date
    })
  }
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(JSON.stringify(response));
  res.end();
}

function POST_login(login_info, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
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
    res.write(JSON.stringify(response));
    res.end();
    return;
  }
  let password = crypto.pbkdf2Sync(login_info.password, user_data[0].salt, 1000, 64, `sha512`).toString(`hex`);
  if (password != user_data[0].password) {
    response.error = true;
    response.msg = 'Incorrect password.';
  } else {
    response.user_data = user_data[0];
    let expire_date = new Date()
    expire_date.setDate(expire_date.getDate() + 30);
    response.session_id = DataBase.table('sessions').insert({
      user_id: user_data[0].id,
      expires: expire_date
    })
  }
  res.write(JSON.stringify(response));
  res.end();
}

function POST_logout(session_id, res) {
  let success_msg = DataBase.table('sessions').delete(session_id);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(success_msg);
  res.end();
}

function POST_user_by_session(session_id, res) {
  let session_data = DataBase.table('sessions').find({ id: session_id });
  if (session_data.length < 1) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write("No session found.");
    res.end();
    return;
  }
  let user_data = DataBase.table('users').find({ id: session_data[0].user_id });
  if (user_data.length < 1) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write(`No user found for session ${session_data[0].id}.`);
    res.end();
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(JSON.stringify(user_data[0]));
    res.end();
  }
}

function POST_update_user(user_update, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});

  //  Make sure the username, email, and phone are unique. 
  let user_data = fs.readFileSync(__dirname + '/database/table_rows/users.json', 'utf8');
  user_data = JSON.parse(user_data);
  let response = {
    error: false,
    msg: '',
    updated_user: ''
  }
  for (let i = 0; i < user_data.length; i++) {
    if (user_data[i].id != user_update.id) {
      if (user_data[i].username == user_update.username) {
        response.error = true;
        response.msg = 'Username already taken.';
        break;
      } else if (user_data[i].email == user_update.email) {
        response.error = true;
        response.msg = 'Email already taken.';
        break;
      } else if (user_data[i].phone == user_update.phone) {
        response.error = true;
        response.msg = 'Phone number already taken.';
        break;
      }
    }
  }

  //  If the update is valid, save it.
  if (!response.error) {
    response.updated_user = DataBase.table('users').update(user_update.id, user_update);
    if (response.updated_user == null) {
      response.error = true;
      response.msg = `No user found for ${user_update.id}.`
    }
  }

  res.write(JSON.stringify(response));
  res.end();
}

function POST_update_password(password_update, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});

  let user_data = DataBase.table('users').find({ id: password_update.id });
  let response = {
    error: false,
    msg: '',
  }
  if (user_data.length < 1) {
    response.error = true;
    response.msg = 'No user found.';
    res.write(JSON.stringify(response));
    res.end();
    return;
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

  res.write(JSON.stringify(response));
  res.end();
}

function POST_check_invite_code(data, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  if (data.invite_code == 'secret123') {
    res.write(JSON.stringify({error: false}));
  } else {
    res.write(JSON.stringify({error: true, msg: "incorrect code"}));
  }
  res.end();
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
