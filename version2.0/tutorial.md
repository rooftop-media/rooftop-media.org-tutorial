# NodeJS Tutorial for rooftop-media.org, version 2.0

This is a tutorial for building rooftop-media.org version 2.0.  
This version creates ....  

*Total estimated time for this tutorial: ADD ESTIMATED TIME*

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Prerequisites

This tutorial requires that you've completed [version 1.0](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md).

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Table of Contents

Click a part title to jump down to it, in this file.

| Tutorial Parts              | Est. Time | # of Steps |
| --------------------------- | ------ | ---------- |
| [Part A - /create-page, /all-pages](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-a) | 0 min. | 0 |
| [Part B - Page element editing](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-b) | 0 min. | 0 |
| [Part C - Page formatting](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-c) | 0 min. | 0 |
| [Part D - Image & file upload](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-d) | 0 min. | 0 |
| [Part E - User permissions](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-e) | 0 min. | 0 |
| [Part F - Drafting & previewing](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-f) | 0 min. | 0 |
| [Part G - Links](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-g) | 0 min. | 0 |
| [Part H - Page styling](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-h) | 0 min. | 0 |
| [Version 3.0.](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#v2) | Todo | ? |



<br/><br/><br/><br/><br/><br/><br/><br/>





<h2 id="part-a" align="center">  Part A:  <code>/create-page</code>, <code>/all-pages</code> </h2>

In this part, we'll create two static pages to facilitate the basic creation of dynamic pages:
 - `/create-page`, where users can create a new page with a specific title and route, and
 - `/pages`, where users can see all created pages.

Dynamic pages will be saved to the database, and accessible at different URL routes.  
We'll make sure a user is logged in before they can create pages. 

<br/><br/><br/><br/>



<h3 id="a-1">  ☑️ Step 1: Create <code>/pages/cms/create-page.html</code>  </h3>

Create a new folder called `/pages/cms`.  In it, add a new file, `create-page.html`.  
This page will be a form to create new dynamic pages.  

```html
<div class="px-3">
  <h3>Create a New Page</h3>
  <div>Page title: <input type="text" tabindex="1" id="page_title" placeholder="My Blog"/></div>
  <div>Page route: <input type="text" tabindex="2" id="page_route" placeholder="my-blog"/></div>
  <div>Public? <input type="checkbox" tabindex="3" id="is_public"/></div>
  <p id="error"></p>
  <button onclick="create_page()">Create Page</button>
</div>

<script>

const utility_keys = [8, 9, 39, 37, 224]; // backspace, tab, command, arrow keys

//  Page route -- lowercase, alphanumeric, and these special characters: - / _ 
const page_route_input = document.getElementById('page_route');
const page_route_regex = /^[a-z0-9_\-\/]*$/;
page_route_input.addEventListener("keydown", event => {
  if (!page_route_regex.test(event.key) && !utility_keys.includes(event.keyCode)) {
    event.preventDefault();
    document.getElementById('error').innerHTML = "Page route can only contain lowercase letters, numbers, underscores and dashes.";
  } else {
    document.getElementById('error').innerHTML = "";
  }
});

function create_page() {
  var page_title = document.getElementById('page_title').value;
  var page_route = document.getElementById('page_route').value;
  var is_public = document.getElementById('is_public').value;
  
  if (page_route.length < 2) {
    document.getElementById('error').innerHTML = 'Page route must be at least 2 characters..';
    return;
  } else if (page_title.length < 2) {
    document.getElementById('error').innerHTML = 'Page title must be at least 2 characters..';
    return;
  }

  const http = new XMLHttpRequest();
  http.open('POST', '/api/create-page');
  http.send(JSON.stringify({
    page_title,
    page_route,
    is_public,
    created_by: _current_user.id
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Creating page.");
        window.location.href = '/' + page_route;
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}
</script>
```

<br/><br/><br/><br/>



<h3 id="a-2">  ☑️ Step 2: Adding a Pages table to the database  </h3>

To add a new table, we'll first add a set of table columns.  
Add the file `/server/database/table_columns/pages.json`:  

```json
{
  "name": "Pages",
  "snakecase": "pages",
  "max_id": 0,
  "columns": [
    {
      "name": "Id",
      "snakecase": "id",
      "unique": true
    },
    {
      "name": "Page Title",
      "snakecase": "page_title"
    },
    {
      "name": "Page Route",
      "snakecase": "page_route",
      "unique": true
    },
    {
      "name": "Is Public?",
      "snakecase": "is_public"
    }
  ]
}
```

Then, add the file `/server/database/table_rows/pages.json`.  Add an empty array:  

```json
[]
```

<br/><br/><br/><br/>



<h3 id="a-3">  ☑️ Step 3: Add <code>POST_create_page</code> to <code>/server/server.js</code>  </h3>

First, add `/api/create-page` to `api_POST_routes`:  

```javascript
function api_POST_routes(url, req, res) {
  let req_data = '';
  req.on('data', chunk => {
    req_data += chunk;
  })
  req.on('end', function() {
    req_data = JSON.parse(req_data);

    if (url == '/api/register') {
      POST_register(req_data, res);
    } else if (url == '/api/login') {
      POST_login(req_data, res);
    } else if (url == '/api/logout') {
      POST_logout(req_data, res);
    } else if (url == '/api/user-by-session') {
      POST_user_by_session(req_data, res);
    } else if (url == '/api/update-user') {
      POST_update_user(req_data, res);
    } else if (url == '/api/update-password') {
      POST_update_password(req_data, res);
    } else if (url == '/api/create-page') {
      POST_create_page(req_data, res);
    }
  })
}
```

Then, after the function `POST_update_password`, add this function:  

```javascript
function POST_create_page(new_page_data, res) {
  let page_data = fs.readFileSync(__dirname + '/database/table_rows/pages.json', 'utf8');
  page_data = JSON.parse(page_data);
  let response = {
    error: false,
    msg: '',
  }
  for (let i = 0; i < page_data.length; i++) {
    if (page_data[i].route_name == new_page_data.username) {
      response.error = true;
      response.msg = 'Route name already taken.';
      break;
    } 
  }
  //  If it's a valid page, save it
  if (!response.error) {
    DataBase.table('pages').insert(new_page_data);
  }
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(JSON.stringify(response));
  res.end();
}
```

<br/><br/><br/><br/>


<h3 id="a-4">  ☑️ Step 4: Add new URL routes to <code>/server/server.js</code>  </h3>

We're also going to add our new static page URL routes to `server.js`:  

```javascript
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
```

<br/><br/><br/><br/>



<h3 id="a-5">  ☑️ Step 5: Using <code>/pages/index.js</code> to reroute and update the header </h3>

First, we'll add two more functions, right below `current_user_loaded`:  

```javascript
// Reroute the user if their log in status doesn't match the page
function reroute_if_needed() {
  if (_current_user == null) {
    if (_current_page == '/create-page' || _current_page == '/all-pages') {
      window.location.href = '/';
    }
  } else {
    if (_current_page == '/register' || _current_page == '/login') {
      window.location.href = '/';
    }
  }
}

// Update the "user buttons" in the header
function update_header() {
  if (_current_user != null) {
    document.getElementById('user-buttons').innerHTML = `<a href="/profile">${_current_user.display_name}</a>`;
    document.getElementById('user-buttons').innerHTML += `<a href="/create-page">New page</a>`;
    document.getElementById('user-buttons').innerHTML += `<a href="/all-pages">All pages</a>`;
    document.getElementById('user-buttons').innerHTML += `<button onclick="logout()">Log out</button>`;
  }
}

```

Then, we'll edit the `boot` function, to call our new functions:  

```javascript
////  SECTION 3: Boot.
function boot() {
  console.log("Welcome to Rooftop Media Dot Org!");

  //  Log user in if they have a session id. 
  if (_session_id) {
    const http = new XMLHttpRequest();
    http.open("POST", "/api/user-by-session");
    http.send(_session_id);
    http.onreadystatechange = (e) => {
      if (http.readyState == 4 && http.status == 200) {
        _current_user = JSON.parse(http.responseText);
        current_user_loaded();
        reroute_if_needed()
        update_header()
      } else if (http.readyState == 4 && http.status == 404) {
        console.log('No session found.');
        localStorage.removeItem('session_id');
        reroute_if_needed();
      }
    }
  } else {
    reroute_if_needed();
  }
  
}
window.addEventListener('load', (event) => {
  boot()
});
```

<br/><br/><br/><br/>



<h3 id="a-6"> ☑️ Step 6:  ☞ Test the code! </h3>

Restart the server!  

If you're logged in and on `/login` or `/register`, you should be rerouted to `/`.  
If you're *not* logged in and on `/create-page`, you should be rerouted to `/`.  

On `/create-page`, add a page name and page route.  
The page info should appear in the `/server/database/page_rows/pages.json` file.  
You should be rerouted to the page route, displaying the 404 page -- for now.  

Go back to `/create-page` to try creating the same page route.  You should get an error.  

<br/><br/><br/><br/>






