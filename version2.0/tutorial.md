# NodeJS Tutorial for rooftop-media.org, version 2.0

This is a tutorial for building rooftop-media.org version 2.0.  
This version creates a Content Management System (CMS), allowing users to:
 - Create new website pages
 - Add and edit page content
 - Manage page permissions

*Total estimated time for this tutorial: ADD ESTIMATED TIME*

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Prerequisites

This tutorial requires that you've completed [version 1.0](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md).

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Table of Contents

Click a part title to jump down to it, in this file.

| Tutorial Parts              | Est. Time | # of Steps |
| --------------------------- | ------ | ---------- |
| [Part A - /create-page, /all-pages](#part-a) | 20 min. | 13 |
| [Part B - Page editing](#part-b) | 15 min. | 6 |
| [Part C - Page display](#part-c) | 15 min. | 8 |
| [Part D - User permissions](#part-d) | 0 min. | 0 |
| [Part E - Data Download](#part-e) | 0 min. | 0 |
| [Part F - Image & file upload](#part-f) | 0 min. | 0 |
| [Part G - Saving drafts](#part-g) | 0 min. | 0 |
| [Part H - Edit history](#part-h) | 0 min. | 0 |
| [Version 3.0.](#v3) | Todo | ? |



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
<div class="p-3">
  <h3>Create a New Page</h3>
  <div>Page title: <input type="text" tabindex="1" id="page_title" placeholder="My Blog"/></div>
  <div>Page route: <input type="text" tabindex="2" id="page_route" placeholder="my-blog"/></div>
  <div>Public? <input type="checkbox" tabindex="3" id="is_public"/></div>
  <p id="error"></p>
  <button onclick="create_page()" tabindex="4">Create Page</button>
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
  var is_public = document.getElementById('is_public').checked;
  
  if (page_route.length < 2) {
    document.getElementById('error').innerHTML = 'Page route must be at least 2 characters..';
    return;
  } else if (page_title.length < 2) {
    document.getElementById('error').innerHTML = 'Page title must be at least 2 characters..';
    return;
  } else if (!page_route_regex.test(page_route)) {
    document.getElementById('error').innerHTML = "Page route can only contain lowercase letters, numbers, underscores and dashes.";
    return;
  }

  const http = new XMLHttpRequest();
  http.open('POST', '/api/create-page');
  http.send(JSON.stringify({
    page_title,
    page_route,
    is_public,
    created_by: _current_user.id,
    content: ''
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
  "max_id": 2,
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
    },
    {
      "name": "Content",
      "snakecase": "content"
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
      '/api/check-invite-code': POST_check_invite_code,
      '/api/create-page': POST_create_page
    }
    
    //  Call the API route function, if it exists.
    if (typeof api_map[url] == 'function') {
      api_map[url](req_data, res);
    } else {
      api_response(res, 404, `The POST API route ${url} does not exist.`);
    }
  })
}
```

Then, after the function `POST_check_invite_code`, add this function:  

```javascript
function POST_create_page(new_page_data, res) {
  let page_data = fs.readFileSync(__dirname + '/database/table_rows/pages.json', 'utf8');
  page_data = JSON.parse(page_data);
  let response = {
    error: false,
    msg: '',
  }
  for (let i = 0; i < page_data.length; i++) {
    if (page_data[i].page_route == new_page_data.page_route) {
      response.error = true;
      response.msg = 'Route name already taken.';
      break;
    } 
  }
  //  If it's a valid page, save it
  if (!response.error) {
    DataBase.table('pages').insert(new_page_data);
  }
  api_response(res, 200, JSON.stringify(response));
}
```

<br/><br/><br/><br/>


<h3 id="a-4">  ☑️ Step 4: Add new URL routes to <code>/server/server.js</code>  </h3>

We're also going to add two new static page URL routes to `server.js`:  

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

Open up `/pages/index.js`.  We'll make two changes.

First, we'll update the`render_user_buttons` function, to include links to `/create-page` and `/all-pages`.
```
// Update the "user buttons" in the header
function render_user_buttons() {
  let userButtonsEl = document.getElementById('user-buttons');
  let buttonText = `Menu`;
  let menuHTML = `<div id="user-menu">`;

  if (_current_user == null) {
    menuHTML += `<a href="/register">Register</a>`;
    menuHTML += `<a href="/login">Login</a>`;
  } else {
    buttonText = _current_user.display_name;
    menuHTML += `<a href="/profile">Your profile</a>`;
    menuHTML += `<a href="/create-page">New page</a>`;
    menuHTML += `<a href="/all-pages">All pages</a>`;
    menuHTML += `<button onclick="logout()">Log out</button>`;
  }
  
  userButtonsEl.innerHTML = `<button onclick="_show_user_menu = !_show_user_menu;render_user_buttons();">${buttonText}</button>`;
  if (_show_user_menu) {
    userButtonsEl.innerHTML += menuHTML + `</div>`;
  }

}
```

Then, we'll edit the `boot` function.   
We'll clean up the section that redirects the user to the home page under certain circumstances.  
We'll also redirect to the home page if on `/create-page` or `/all-pages` and not logged in, or on any route starting with `/edit/`.

```javascript
////  SECTION 3: Boot.
function boot() {
  console.log('Welcome to Rooftop Media Dot Org!');

  //  Log user in if they have a session id. 
  if (_session_id) {
    const http = new XMLHttpRequest();
    http.open('GET', `/api/user-by-session?session_id=${_session_id}`);
    http.send();
    http.onreadystatechange = (e) => {
      if (http.readyState == 4 && http.status == 200) {
        _current_user = JSON.parse(http.responseText);
        current_user_loaded();
      } else if (http.readyState == 4 && http.status == 404) {
        console.log('No session found.');
        localStorage.removeItem('session_id');
      }
      render_user_buttons();
    }
  } else {
    render_user_buttons();
  }
  
  //  Redirect to home if...
  var onALoggedOutPage = (_current_page == '/register' || _current_page == '/login');
  var loggedIn = _session_id != null;
  var redirectToHome = (onALoggedOutPage && loggedIn);
  var onALoggedInPage = (_current_page == '/create-page' || _current_page == '/all-pages' || _current_page.split('/')[1] == 'edit');
  redirectToHome = redirectToHome || (onALoggedInPage && !loggedIn);
  if (redirectToHome) {
    window.location.href = '/';
  }

}
window.addEventListener('load', (event) => {
  boot()
});
```

<br/><br/><br/><br/>

<!--Note that most would suggest I put the AJAX call set up in a [separate reusable function](https://stackoverflow.com/questions/2818648/using-two-xmlhttprequest-calls-on-a-page).  I'm not doing that for now. -->



<h3 id="a-6"> ☑️ Step 6:  ☞ Test the code! </h3>

Restart the server!  

If you're logged in and on `/login` or `/register`, you should be rerouted to `/`.  
If you're *not* logged in and on `/create-page`, you should be rerouted to `/`.  

On `/create-page`, add a page name and page route.  
The page info should appear in the `/server/database/page_rows/pages.json` file.  
You should be rerouted to the page route, displaying the 404 page -- for now.  

Go back to `/create-page` to try creating the same page route.  You should get an error.  

<br/><br/><br/><br/>



<h3 id="a-7">  ☑️ Step 7: Creating dynamic pages in <code>server/server.js</code> </h3>

First, we're going to edit the function `respond_with_a_page`.  
Then, add one more function right below it, `respond_with_a_dynamic_page`.  
For now, this function will generate a page that just shows the page title.  

```javascript
function respond_with_a_page(res, url) {
  if (pageURLkeys.includes(url)) {
    url = pageURLs[url];
  } else {
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
  if (page_data.length < 1) {
    content_page = fs.readFileSync(__dirname + '/../pages/misc/404.html');
  } else {
    content_page = `<div class="p-3"><h2>${page_data[0].page_title}</h2></div>`
  }
  var main_page = fs.readFileSync(__dirname + '/../pages/index.html', {encoding:'utf8'});
  var page_halves = main_page.split('<!--  Insert page content here!  -->');
  content_page = page_halves[0] + content_page + page_halves[1];
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(content_page);
  res.end();
}
```

There's some repeated code that could be factored into a new function, here.  
(Dividing the page at `<!--  Insert page content here!  -->`, inserting the content.)  
For now, I've decided to leave it as two functions.  

<!-- This would be a good opportunity to factor out repeated code...
But is it worth adding a new function? Could it even be named clearly? -->

<br/><br/><br/><br/>



<h3 id="a-8"> ☑️ Step 8:  ☞ Test the code! </h3>

Restart the server.  
Go to your browser and navigate to one of the `page_route`s you created.  
You should see that page's title, as stored in the database, displayed.  

URLs that are neither in the `pages` database, nor hardcoded, static pagess, should result in the 404 page.  

<br/><br/><br/><br/>



<h3 id="a-9"> ☑️ Step 9:  Making an API route for getting all pages, in <code>server.js</code> </h3>

First, edit `api_GET_routes`:

```javascript
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
    '/api/all-pages': GET_all_pages
  }

  //  Call the API route function, if it exists.
  if (typeof api_map[url] == 'function') {
    api_map[url](req_data, res);
  } else {
    api_response(res, 404, `The GET API route ${url} does not exist.`);
  }
}
```

Then, right under `GET_user_by_session`, add a new function, `GET_all_pages`:
```javascript
function GET_all_pages(req_data, res) {
  let all_pages = fs.readFileSync(__dirname + '/database/table_rows/pages.json', 'utf8');
  all_pages = JSON.parse(all_pages);
  for (let i = 0; i < all_pages.length; i++) {
    let owner_id = parseInt(all_pages[i].created_by);
    all_pages[i].owner = DataBase.table('users').find({id: owner_id})[0].username;
  }
  api_response(res, 200, JSON.stringify(all_pages));
}
```

<br/><br/><br/><br/>



<h3 id="a-10"> ☑️ Step 10:  Creating <code>pages/cms/all-pages.html</code> </h3>

This page will allow us to view all pages created in our database.  
Create a new page, `/pages/cms/all-pages.html`, and add this:

```html
<div class="p-3 center-column">
  <h3>All dynamic pages:</h3>
  <table id="page-table">
    <tr>
      <th>Title</th>
      <th>Route</th>
      <th>Edit link</th>
      <th>Public?</th>
      <th>Owned by</th>
    </tr>
  </table>
</div>

<script>
  let pageTable = document.getElementById('page-table');
  get_all_pages();

  function get_all_pages() {
    pageTable.innerHTML = `<tr>
      <th>Title</th>
      <th>Route</th>
      <th>Edit link</th>
      <th>Public?</th>
      <th>Owned by</th>
    </tr>`;
    const http = new XMLHttpRequest();
    http.open('GET', '/api/all-pages');
    http.send();
    http.onreadystatechange = (e) => {
      let response;      
      if (http.readyState == 4 && http.status == 200) {
        response = JSON.parse(http.responseText); 
        console.log("Pages loaded!");
        for (var i = 0; i < response.length; i++) {
          pageTable.insertRow().innerHTML += `<tr>
            <td>${response[i].page_title}</td>
            <td><a href="/${response[i].page_route}">/${response[i].page_route}</a></td>
            <td><a href="/edit/${response[i].page_route}">Edit</a></td>
            <td>${response[i].is_public ? 'Yes' : 'No'}</td>
            <td>${response[i].owner}</td>
          </tr>`;
        }
      }
    }
  }
  
</script>

<style>
  table, th, td {
    border: solid 1px var(--brown);
    border-collapse: collapse;
  }
  table {
    box-shadow: 2px 2px 10px rgba(0,0,0,.5);
  }
  th, td {
    padding: 5px 10px;
  }
  th {
    background: var(--brown);
  }
  tr {
    background: var(--lighter-brown);
  }
  tr:nth-child(even) {
    background: #5a4433;
  }
  a {
    color: var(--yellow);
  }
</style>
```

<br/><br/><br/><br/>


<h3 id="a-11"> ☑️ Step 11:   ☞ Test the code!  </h3>

Restart the server, and go to `/all-pages`.  
You should see a table of all the created pages! Wonderful.   

<br/><br/><br/><br/>


<h3 id="a-12">☑️ Step 12. ❖ Part A review. </h3>

The complete code for Part A is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_A).

<br/><br/><br/><br/>
<br/><br/><br/><br/>




<h2 id="part-b" align="center">  Part B:  Page element editing </h2>

In this section, we'll create a new dynamic route, `/edit/:page_route`.  
On this page, users can edit a page's title, add elements to the page, and edit those element's properties. 

This page is a true webapp interface, and thus deserves a lot of attention, similar to a full [terminal app](https://github.com/rooftop-media/ktty-tutorial/blob/main/js/version1.0/tutorial.md).

<br/><br/><br/><br/>



<h3 id="b-1">  ☑️ Step 1: Adding <code>/edit/:page_route</code> to <code>/server/server.js</code>  </h3>

First, we'll edit `respond_with_a_page` to check for URLs starting with `/edit/`: 

```js
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
```

<br/><br/><br/><br/>



<h3 id="b-2">  ☑️ Step 2: Adding <code>GET_page</code> to <code>/server/server.js</code>  </h3>

This route will return a page's details and content, given a page's route.  

First, we'll add the API route to `api_GET_routes`:

```javascript
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
```

Then, below `GET_all_pages`, we'll write the function, `GET_page`:  

```javascript
function GET_page(req_data, res) {
  let page_data = DataBase.table('pages').find({ page_route: req_data.page_route });
  let response = {
    error: false,
    data: null
  }
  if (page_data.length < 1) {
    response.error = true;
    response.msg = `The page ${req_data.page_route} was not found.`;
  } else {
    response.data =  page_data[0];
  }
  api_response(res, 200, JSON.stringify(response));
}
```

<br/><br/><br/><br/>



<h3 id="b-3">  ☑️ Step 3: Create <code>/pages/cms/edit-page.html</code>  </h3>

This is another dynamic page. It will get a page's details via an API call to `POST_get_page`.  
Then, it will load the page's content, as markdown, into an editable box.

A "buffer" (a draft) of the page's markdown can then be edited.
Finally, pages can be "saved", updating the published page.  

Create the file `/pages/cms/edit-page.html`, with the following code:  

```html
<div class="p-3 center-column" id="dynamic-page">
  <i>Loading page...</i>
</div>

<script>

////  SECTION 1: Page memory
let page_route = _current_page.split('/edit/')[1];
let buffer_data = {};
let page_data = {};
let is_saved = true;

////  SECTION 2: Render

//  Renders the text editor, final page, or "page does not exist" message.
function render_page() {
  let page_editor = `
  <div class="flex-row">
    <div style="width:40%;">Route: / <input id="page-route" type="text" value="${buffer_data.page_route}" oninput="update_pageRoute()" tabindex="1" /></div>
    <div style="display: flex; align-items: center;">Public? <input type="checkbox" onclick="toggle_publicity()" ${buffer_data.is_public ? 'checked' : ''} tabindex="2"/></div>
  </div>
  <div class="flex-row">
    <input id="page-title" type="text" value="${buffer_data.page_title}" oninput="update_pageTitle()" tabindex="3">
    <button onclick="cancel()">Cancel</button>
    <button id="save" onclick="save()" tabindex="6">Save</button>
  </div>`;
  page_editor += `<div id="error"></div>`;
  page_editor += `<textarea id="page-buffer" oninput="update_buffer(event.currentTarget.value)" tabindex="5">${buffer_data.content}</textarea/><br/><br/>`;
  page_editor += `<button onclick="render_preview()">Preview</button>
  <button style="margin-left:20px;" onclick="window.location.href = '/${page_route}'">Go to Page</button>`;
  document.getElementById('dynamic-page').innerHTML = page_editor;
  check_if_saved();
}

function render_preview() {
  document.getElementById('dynamic-page').innerHTML = `<button onclick="render_page()">Edit</button><br/><hr/><br/>`;
  document.getElementById('dynamic-page').innerHTML += buffer_data.content;
}

////  SECTION 3: Event reactions

//  Fired if unsaved changes exist
function beforeUnloadListener(event) {
  event.preventDefault();
  return (event.returnValue = "");
};

//  Fired in render_page() and in any buffer editing function
function check_if_saved() {
  is_saved = (buffer_data.content == page_data.content) && (buffer_data.page_title == page_data.page_title) 
    && (buffer_data.is_public == page_data.is_public) && (buffer_data.page_route == page_data.page_route);
  if (!is_saved) {
    addEventListener("beforeunload", beforeUnloadListener, { capture: true });
    document.getElementById('save').classList.remove('inactive');
  } else {
    removeEventListener("beforeunload", beforeUnloadListener, { capture: true, });
    document.getElementById('save').classList.add('inactive');
  }
}

//  Fires when new page content is typed.
function update_buffer(newval) {
  buffer_data.content = newval;
  check_if_saved();
}

//  Fires when the page title is changed. 
function update_pageTitle() {
  buffer_data.page_title = document.getElementById('page-title').value;
  check_if_saved();
}

function update_pageRoute() {
  buffer_data.page_route = document.getElementById('page-route').value;
  check_if_saved();
}

function toggle_publicity() {
  buffer_data.is_public = !buffer_data.is_public;
  render_page();
}

//  Fires when "Save page changes" is clicked.
function save() {
  console.log("saving...")
  const http = new XMLHttpRequest();
  http.open('POST', '/api/update-page');
  http.send(JSON.stringify({ 
    id: page_data.id,
    page_title: buffer_data.page_title,
    content: buffer_data.content,
    page_route: buffer_data.page_route,
    is_public: buffer_data.is_public
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Page updated.");
        page_data.content = buffer_data.content;
        page_data.page_title = buffer_data.page_title;
        page_data.page_route = buffer_data.page_route;
        page_data.is_public = buffer_data.is_public;
        render_page();
        if (_current_page.split('/edit/')[1] != buffer_data.page_route) {
          window.location.href = '/edit/' + buffer_data.page_route;
        }
      } else {
        console.warn("Err")
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}

//  Fires when the cancel button is clicked.
function cancel() {
  if (confirm("Are you sure? Changes will not be saved!")) {
    window.location.href = '/edit/' + page_route;
  }
}



////  SECTION 4: Boot
//  Load all page elements from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/page?page_route=${page_route}`);
  http.send();
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Loading page.");
        page_data = response.data;
        buffer_data.content = page_data.content || "";
        buffer_data.page_title = page_data.page_title || "";
        buffer_data.page_route = page_data.page_route;
        buffer_data.is_public = page_data.is_public;
        render_page();
      } else {
        document.getElementById('dynamic-page').innerHTML = response.msg;
      }
    }
  }
}
load_page();

</script>

<style> 
  #dynamic-page {
    position: relative;
  }
  #dynamic-page input {
    font-family: CrimsonText;
    width: 60%;
  }
  #dynamic-page input, #dynamic-page textarea {
    background: var(--brown);
    color: white;
    border: solid 1px black;
    
  }
  #dynamic-page input:focus, #dynamic-page textarea:focus {
    outline: solid 1px var(--yellow);
  }

  input#page-route {
    font-size: 1em;
  }

  input#page-title {
    margin: 0.67em 0px;
    padding: 0px;
    font-size: 2em;
  }
  
  #page-buffer {
    min-height: 60vh;
    min-width: 100%;
  }

  .flex-row {
    display: flex;
    justify-content: space-between;
    align-items: center;;
  }

  #dynamic-page button {
    padding: 10px 0px;
    border-radius: 5px;
    width: 15%;
    background: var(--light-brown);
    color: var(--yellow);
    border: 1px solid var(--brown);
    cursor: pointer;
  }

  #dynamic-page button#save {
    background: #3A7B64;
  }
  .inactive {
    opacity: 0.5;
  }

</style>
```

<br/><br/><br/><br/>


<h3 id="b-4">  ☑️ Step 4: Adding <code>POST_update_page</code> to <code>/server/server.js</code>  </h3>

Another API route, here we go.  First, update `api_POST_routes`...

```javascript
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
      '/api/check-invite-code': POST_check_invite_code,
      '/api/create-page': POST_create_page,
      '/api/update-page': POST_update_page
    }
    
    //  Call the API route function, if it exists.
    if (typeof api_map[url] == 'function') {
      api_map[url](req_data, res);
    } else {
      api_response(res, 404, `The POST API route ${url} does not exist.`);
    }
  })
}
```

Then add the new function, `POST_update_page`:  

```javascript
function POST_update_page(page_update, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  
  let response = {
    error: false,
    msg: '',
    updated_page: ''
  }

  //  If the update is valid, save it.
  if (!response.error) {
    response.updated_page = DataBase.table('pages').update(page_update.id, page_update);
    if (response.updated_page == null) {
      response.error = true;
      response.msg = `No page found for ${page_update.id}.`
    }
  }

  res.write(JSON.stringify(response));
  res.end();
}
```

<br/><br/><br/><br/>


<h3 id="b-5"> ☑️ Step 5:   ☞ Test the code!  </h3>

Restart the server and go to `localhost:8080/edit/` followed by a dynamic page route name.  
If it's a saved page route, you should see several inputs, to edit the page's route, title, and content.

Try editing the page's title and content, and click save.  Refresh the page -- your changes should be saved.

Change the page's route and click save.  The page should refresh to that route. 

Edit the page without saving, and then click "Cancel".  
You should be prompted to confirm, and then the page should refresh.  

The preview button will not do anything for the moment. 

<br/>

Finally, go to `localhost:8080/edit/not-a-route` to display an error message.

<br/><br/><br/><br/>




<h3 id="b-6">☑️ Step 6. ❖ Part B review. </h3>

The complete code for Part B is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_B).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-c" align="center">  Part C:  Page Sanitizing & Display </h2>

In this section, we'll display our pages.  
Pages will be written in "Rooftop Markup", which is just a "sanitized" version of HTML, with fewer tags.  


<br/><br/><br/><br/>


<h3 id="c-1">  ☑️ Step 1: Updating <code>respond_with_a_dynamic_page</code> in <code>/server/server.js</code>  </h3>

In `server.js`, change one line in `respond_with_a_dynamic_page` to send the page, `cms/display-page.html`: 

```javascript
function respond_with_a_dynamic_page(res, url) {
  let page_data = DataBase.table('pages').find({ page_route: url.slice(1) });  //  Removing the "/" from the route
  let content_page = "";
  if (page_data.length < 1) {
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
```

<br/><br/><br/><br/>



<h3 id="c-2">  ☑️ Step 2: Create <code>cms/display-page.html</code>  </h3>

Create a new file called `/cms/display-page.html`. 

At this point, this file will insert the page's content as it is, with no changes.  
In [step 4](#c-4), we'll edit this code to sanitize it of potentially harmful tags. 

For now, here's the page's code:  

```html
<div class="p-3 center-column" id="dynamic-page">
  <i>Loading page...</i>
</div>

<script>
////  SECTION 1: Page memory
let page_route = _current_page.split('/')[1];
let page_data = {};

////  SECTION 2: Render
//  Renders the text editor, final page, or "page does not exist" message.
function render_page() {
  let page = `<h1>${page_data.page_title}</h1>`;
  let markup = page_data.content;
  page += markup_to_html(markup); //  markup -> html 
  document.getElementById('dynamic-page').innerHTML = page;
}

////  SECTION 3: Functions 
function markup_to_html(markup) {
  return markup;
}

////  SECTION 4: Boot
//  Load all page elements from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/page?page_route=${page_route}`);
  http.send();
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Creating page.");
        console.log(response.data);
        page_data = response.data;
        render_page();
      } else {
        document.getElementById('dynamic-page').innerHTML = response.msg;
      }
    }
  }
}
load_page();

</script>
```

<br/><br/><br/><br/>



<h3 id="c-3"> ☑️ Step 3:   ☞ Test the code!  </h3>

In this section, we'll be writing a function to produce HTML text, following the Rooftop Markup rules.

Rooftop Markup works like this...
 - The following html tags are allowed: 
   - h1 - h6, p, div, span
   - b, i
   - code, pre
   - ol, ul, li
   - table, tr, th, td
   - a
   - img
   - br, hr
 - The following attributes are allowed:
   - style, img, alt, href
 - Those tags and attributes are kept. 
 - All other tags and attributes are removed.

The main purpose of this is to prevent users from adding malicious scripts to dynamic pages.  
Consider it dangerous to have SCRIPT tags, or ONCLICK or ONLOAD attributes.  

Edit a dynamic page route and add the following text, to test it:

```
<h1>Hello! This is an h1 tag!</h1>
<h3>And this is an h3 tag!</h3>
<p>This is a p tag, with some <b>bold</b>, <i>italic</i>, and <i><b>both</b></i>.</p>

<p><button>This text should <i>not</i> be in a button. </button></p>

<div style="color:red; background: blue;cursor:pointer;" onclick="alert('hacked')">This p should be red on blue, but should not have an onclick event.</div>

<script> alert("This text should appear, but the script tag should not."); </script>

<p>Here's a <a href="http://link.com">link</a>. And an image:</p>

<img src="https://upload.wikimedia.org/wikipedia/en/e/ed/Nyan_cat_250px_frame.PNG" />

<p>Here's a nested list:</p>
<ol>
  <li>Item one</li>
  <ul>
    <li>A subitem</li>
    <li>Another subitem</li>
  </ul>
  <li>Item two</li>
  <li>Item threee</li>
</ol>

<p>Here's a table...</p>
<table>
  <tr> <th>Company</th><th>Contact</th><th>Country</th> </tr>
  <tr> <td>Alfreds Futterkiste</td><td>Maria Anders</td><td>Germany</td> </tr>
  <tr> <td>Centro comercial Moctezuma</td><td>Francisco Chang</td><td>Mexico</td> </tr>
</table>

<p>Here's a properly escaped less than sign: &lt;3 </p>
```

Open the page, and you should see it display.  Note that it isn't sanitized yet.  

<br/><br/><br/><br/>



<h3 id="c-4">  ☑️ Step 4: Compile the markup to sanitized html, in <code>cms/display-page.html</code>  </h3>

In this step, we'll sanitize our markup. Here are the steps to understand this function...
_I'm postponing this entire section for now, due to complexity._
<!--
First, we'll _tokenize_ the text into the following tokens:
| Symbol | Token name | 
|--------|------------|
| < | LESS-THAN |
| / | FORWARD-SLASH |
| = | EQUALS | 
| " | DOUBLE-QUOTE |
| ' | SINGLE-QUOTE |
| > | GREATER-THAN |
|   | WHITESPACE |
| (all other text) | TEXT |

We'll then run a parsing function, creating a new token using the following rule:  
| Token name      | Production rule | 
|-----------------|------------------|
| OPEN-TAG        | Any `LESS-THAN TEXT` pattern is an OPEN-TAG.                                                |

Next we'll parse the text, getting rid of the WHITESPACE tokens. 
| Token name      | Production rules | 
|-----------------|------------------|
| TEXT            | Any `TEXT WHITESPACE` pattern is a TEXT token. |
|                 | Any `WHITESPACE TEXT` pattern is a TEXT token. | 
|                 | Any `TEXT TEXT` pattern is a TEXT token.       |

Next, we'll find one set of ATTR-NAME tokens: attributes named directly after the open tag name. -->
<!--
Next, we'll parse forward-slashes. Some forward slashes can be combined into text. 
| Token name      | Production rules | 
|-----------------|------------------|
| TEXT            | Any `TEXT FORWARD-SLASH` pattern is a TEXT token. |
|                 | Any `FORWARD-SLASH TEXT` pattern is a TEXT token. | 
|                 | Any `FORWARD-SLASH` _not_ after a `LESS-THAN` _or_ before a `GREATER-THAN` is a TEXT token. | -->

<!--| Token name      | Production rules | 
|-----------------|------------------|
| ATTR-NAME       | Any `OPEN-TAG TEXT` pattern is an ATTR-NAME.                                                |
|                 | After an `ATTR-VALUE`, any `TEXT` pattern is an ATTR-NAME.                      | 
| ATTR-VALUE      | After an `ATTR-NAME`, any `EQUALS DOUBLE-QUOTE TEXT DOUBLE-QUOTE` pattern is an ATTR-VALUE. |
|                 | After an `ATTR-NAME`, any `EQUALS SINGLE-QUOTE TEXT SINGLE-QUOTE` pattern is an ATTR-VALUE. |
| \*END-OPEN-TAG  | After an `OPEN-TAG`, a `GREATER-THAN` token is a END-CLOSE-TAG.                           |
|                 | After an `ATTR-VALUE`, a `GREATER-THAN` token is a END-CLOSE-TAG.                         |
| CLOSE-TAG       | Any `LESS-THAN FORWARD-SLASH TEXT` pattern is a CLOSE-TAG.                                |
|                 | After an `OPEN-TAG`, a `FORWARD-SLASH` token is a CLOSE-TAG.  (ex: <br/>)                 |
|                 | After an `ATTR-VALUE`, a `FORWARD-SLASH` token is a CLOSE TAG. (ex: <img src=".png" />    |-->

<br/><br/><br/><br/>



<h3 id="c-5"> ☑️ Step 5:   ☞ Test the code!  </h3>

Load the page with our test markup.  It should appear sanitized! (_But actually not yet!_)

<br/><br/><br/><br/>



<h3 id="c-6">  ☑️ Step 6: Display page preview in <code>cms/edit-page.html</code>  </h3>

We'll make the page editor preview display the sanitized version of pages as well.   
_This is also postponed for now._

<br/><br/><br/><br/>



<h3 id="c-7"> ☑️ Step 7:   ☞ Test the code!  </h3>

Open the page editor and click "preview".  It should appear sanitized! (_But actually not yet!_)

<br/><br/><br/><br/>



<h3 id="c-8">☑️ Step 8. ❖ Part C review. </h3>

The complete code for Part C is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_C).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-d" align="center">  Part D:  User Permissions </h2>

In this section, we'll let users make pages public or private.  
Public pages will be available to anyone on the internet who visits the page route.  
Private pages will only be available on the edit page.  
We'll also make sure that only the user who creates a page can edit it. 

<br/><br/><br/><br/>



<h3 id="d-1">  ☑️ Step 1: Editing <code>respond_with_a_dynamic_page</code> in <code>server.js</code>  </h3>

If a requested page is private, we won't send it to the browser at all.  
We'll check for that in the `respond_with_a_dynamic_page` function in `server/server.js`, by adding an "or" to the first "if". 

```js
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
```

<br/><br/><br/><br/>



<h3 id="d-2"> ☑️ Step 2:   ☞ Test the code!  </h3>

Make sure one of your pages is public, and then view it.  It should display.  

Edit the page to make it private, save it, and then view it.  It should appear as a 404 now.  

Back on the edit page, you should still be able to see your private page by previewing it. 

<br/><br/><br/><br/>



<h3 id="d-3">  ☑️ Step 3: Editing <code>POST_update_page</code> in <code>server.js</code>  </h3>

We now need to make sure that only the user that creates a page can edit that page.  

We _could_ do this by sending the user's id to the server, and comparing it to the page's "created_by" user.  
But then, users could gain access to pages by editing the request code -- they'd just need to know the "created_by" user's id. 
The user's id might be public, for example, in data sent for a user's page.  

Instead, we'll send a user's current session id.  On the server, we'll use that to get their user id, and compare that to the page's "created_by" user.  

Open `/server/server.js` and edit the function `POST_update_page`. 

```js
function POST_update_page(page_update, res) {  
  let response = {
    error: false,
    msg: '',
    updated_page: ''
  }

  //  Make sure the current user created the current page
  let page_data = DataBase.table('pages').find({ page_route: page_update.id });
  let session_data = DataBase.table('sessions').find({ id: page_update.session_id });
  if (page_data[0].created_by != session_data[0].user_id) {
    response.error = true;
    response.msg = `You don't have permission to update this page.`;
  }

  //  If the update is valid, save it.
  if (!response.error) {
    response.updated_page = DataBase.table('pages').update(page_update.id, page_update);
    if (response.updated_page == null) {
      response.error = true;
      response.msg = `No page found for ${page_update.id}.`
    }
  }

  api_response(res, 200, JSON.stringify(response));
}
```

<br/><br/><br/><br/>


<h3 id="d-4">  ☑️ Step 4: Editing <code>load_page</code> and <code>save</code> in <code>edit-page.html</code>  </h3>

We now need to edit `cms/edit-page.html`, to prevent the user from editing the page if their user id doesn't match the page's creator.  

Open that file and edit the `load_page` function:

```js
////  SECTION 4: Boot
//  Load all page elements from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/page?page_route=${page_route}`);
  http.send();
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Loading page.");
        page_data = response.data;
        if (page_data.created_by != _current_user.id) {
          document.getElementById('dynamic-page').innerHTML = "You don't have permission to edit this page.";
          return;
        }
        buffer_data.content = page_data.content || "";
        buffer_data.page_title = page_data.page_title || "";
        buffer_data.page_route = page_data.page_route;
        buffer_data.is_public = page_data.is_public;
        render_page();
      } else {
        document.getElementById('dynamic-page').innerHTML = response.msg;
      }
    }
  }
}
function current_user_loaded() {
  load_page();
}
```

We also need to update the `save` function, to send the user's session_id, ensuring they have permission to update the page.

```js
//  Fires when "Save page changes" is clicked.
function save() {
  console.log("saving...")
  const http = new XMLHttpRequest();
  http.open('POST', '/api/update-page');
  http.send(JSON.stringify({ 
    id: page_data.id,
    page_title: buffer_data.page_title,
    content: buffer_data.content,
    page_route: buffer_data.page_route,
    is_public: buffer_data.is_public,
    session_id: _session_id
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Page updated.");
        page_data.content = buffer_data.content;
        page_data.page_title = buffer_data.page_title;
        page_data.page_route = buffer_data.page_route;
        page_data.is_public = buffer_data.is_public;
        render_page();
        if (_current_page.split('/edit/')[1] != buffer_data.page_route) {
          window.location.href = '/edit/' + buffer_data.page_route;
        }
      } else {
        console.warn("Err")
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}
```

<br/><br/><br/><br/>



<h3 id="d-5">  ☑️  ☞ Test the code!  </h3>

Restart the server.

While logged in as one user, create a page.  Make sure you can still edit the page and save it with no problems.  
Then, log in as a different user, and try to edit that page.  
You should get an error telling you that you don't have permission!  

Now, right click, inspect the page's elements, find the script tag, and find the `load_page` function.  
Change the line that says `if (page_data.created_by != _current_user.id) {` to `if (false) {`.  
Then, copy paste the entire contents of the `load_page` function into the console.  The edit page should load, even though you're not the correct user!!  

Edit the page and click "save".  Our "update-page" api route should prevent the page from being updated, since it checks the user's session id. 

<br/><br/><br/><br/>



<h3 id="d-6">☑️ Step 6. ❖ Part D review. </h3>

The complete code for Part D is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_D).

<br/><br/><br/><br/>
<br/><br/><br/><br/>









