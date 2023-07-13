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
| [Part B - Page editing](#part-b) | 15 min. | 8 |
| [Part C - Markup syntax](#part-c) | 15 min. | 8 |
| [Part D - Edit history](#part-d) | 0 min. | 0 |
| [Part E - Page tags](#part-e) | 0 min. | 0 |
| [Part F - Image & file upload](#part-f) | 0 min. | 0 |
| [Part G - User permissions](#part-g) | 0 min. | 0 |
| [Part H - Data Download](#part-h) | 0 min. | 0 |
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
<div class="p-3 center-column">
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
  var title = document.getElementById('page_title').value;
  var route = document.getElementById('page_route').value;
  var is_public = document.getElementById('is_public').checked;
  
  if (route.length < 2) {
    document.getElementById('error').innerHTML = 'Page route must be at least 2 characters..';
    return;
  } else if (title.length < 2) {
    document.getElementById('error').innerHTML = 'Page title must be at least 2 characters..';
    return;
  } else if (!page_route_regex.test(route)) {
    document.getElementById('error').innerHTML = "Page route can only contain lowercase letters, numbers, underscores and dashes.";
    return;
  }

  const http = new XMLHttpRequest();
  http.open('POST', '/api/create-page');
  http.send(JSON.stringify({
    title,
    route,
    is_public,
    created_by: _current_user.id,
    date_created: new Date().toString(),
    content: '',
    history: []
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Creating page.");
        window.location.href = '/' + route;
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
      "snakecase": "title"
    },
    {
      "name": "Page Route",
      "snakecase": "route",
      "unique": true
    },
    {
      "name": "Is Public?",
      "snakecase": "is_public"
    },
    {
      "name": "Content",
      "snakecase": "content"
    },
    {
      "name": "History",
      "snakecase": "history"
    },
    {
      "name": "Created by",
      "snakecase": "created_by"
    },
    {
      "name": "Date created",
      "snakecase": "date_created"
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
  let response = DataBase.table('pages').insert(new_page_data);
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

First, we'll update the `render_user_buttons` function, to include links to `/create-page` and `/all-pages`.
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

We're going to edit the function `respond_with_a_page`. 
This function will now check if a dynamic route exists, and send `/dynamic-page.html` if it exists, and `/404.html` otherwise. 

```javascript
function respond_with_a_page(res, url) {
  let page_content = "";

  if (pageURLkeys.includes(url)) {  //  If it's a static page route....
    url = pageURLs[url];
    try {
      page_content = fs.readFileSync( __dirname + '/..' + url);
    } catch(err) {
      page_content = fs.readFileSync(__dirname + '/../pages/misc/404.html');
    }
  } else {                          //  If it's a dynamic page route....
    let page_data = DataBase.table('pages').find({ route: url.slice(1) });  //  Removing the "/" from the route
    if (page_data.length < 1) {
      page_content = fs.readFileSync(__dirname + '/../pages/misc/404.html');
    } else {
      page_content = fs.readFileSync(__dirname + '/../pages/cms/display-page.html');
    }
  }
  res.writeHead(200, {'Content-Type': 'text/html'});
  var main_page = fs.readFileSync(__dirname + '/../pages/index.html', {encoding:'utf8'});
  var page_halves = main_page.split('<!--  Insert page content here!  -->');
  var rendered = page_halves[0] + page_content + page_halves[1];
  res.write(rendered);
  res.end();
}
```

<br/><br/><br/><br/>



<h3 id="a-8">  ☑️ Step 8: Creating <code>pages/cms/dynamic-page.html</code> </h3>

Create a new page,  `/pages/cms/dynamic-page.html`, and add this:. 

```javascript
<div class="p-3 center-column" id="dynamic-page">
  <i>Loading page...</i>
</div>

<script>
////  SECTION 1: Page memory
let page_route = _current_page.split('/')[1];
let page_data = {};

////  SECTION 2: Render
function render_page() {
  document.getElementById('dynamic-page').innerHTML = `<h1>${page_data.title}</h1>`
  document.getElementById('dynamic-page').innerHTML += page_data.content;
  document.getElementById('dynamic-page').innerHTML += `<a href="/edit/${page_data.route}"><button id="edit-button"><img src="/assets/icons/edit.svg" />Edit</button></a>`;
}

////  SECTION 4: Boot
//  Load page from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/page?route=${page_route}`);
  http.send();
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Loading page.");
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

<style>
  #edit-button {
    display: flex;
    width: 90px;
    position: absolute;
    bottom: 20px;
    right: 20px;
  }
  #edit-button img {
    height: 16px;
    margin-right: 10px;
  }
</style>
```

<br/><br/><br/><br/>


<h3 id="a-9">  ☑️ Step 9: Adding <code>GET_page</code> to <code>/server/server.js</code>  </h3>

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

Then, below `GET_user_by_session`, we'll write the function, `GET_page`:  

```javascript
function GET_page(req_data, res) {
  let page_data = DataBase.table('pages').find({ route: req_data.route });
  let response = {
    error: false,
    data: null
  }
  if (page_data.length < 1) {
    response.error = true;
    response.msg = `The page ${req_data.route} was not found.`;
  } else {
    response.data =  page_data[0];
  }
  api_response(res, 200, JSON.stringify(response));
}
```

<br/><br/><br/><br/>



<h3 id="a-10"> ☑️ Step 10:  ☞ Test the code! </h3>

Restart the server.  
Go to your browser and navigate to one of the `page_route`s you created.  
You should see that page's title, as stored in the database, displayed.  

URLs that are neither in the `pages` database, nor hardcoded, static pages, should result in the 404 page.  

<br/><br/><br/><br/>



<h3 id="a-11"> ☑️ Step 11:  Making an API route for getting all pages, in <code>server.js</code> </h3>

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
    '/api/page': GET_page,
    '/api/all-pages': GET_all_pages,
  }

  //  Call the API route function, if it exists.
  if (typeof api_map[url] == 'function') {
    api_map[url](req_data, res);
  } else {
    api_response(res, 404, `The GET API route ${url} does not exist.`);
  }
}
```

Then, right under `GET_page`, add a new function, `GET_all_pages`:
```javascript
function GET_all_pages(req_data, res) {
  let all_pages = fs.readFileSync(__dirname + '/database/table_rows/pages.json', 'utf8');
  all_pages = JSON.parse(all_pages);
  for (let i = 0; i < all_pages.length; i++) {
    let creator_id = parseInt(all_pages[i].created_by);
    all_pages[i].created_by = DataBase.table('users').find({id: creator_id})[0].username;
  }
  api_response(res, 200, JSON.stringify(all_pages));
}
```

<br/><br/><br/><br/>



<h3 id="a-12"> ☑️ Step 12:  Creating <code>pages/cms/all-pages.html</code> </h3>

This page will allow us to view all pages created in our database.  
Create a new page, `/pages/cms/all-pages.html`, and add this:

```html
<div class="p-3 center-column">
  <h3>All dynamic pages:</h3>
  <div id="search-bar-row">
    <input id="search" placeholder="Search pages..." oninput="search_pages()"/>
    <div id="search-settings-toggle" onclick="toggle_settings()">Settings  &#x25B8;</div>
  </div>
  <div id="search-settings" onclick="search_pages()">
    <div>Sort by: </div>
    <div><input type="radio" name="sort_types" value="title" checked /> Title</div>
    <div><input type="radio" name="sort_types" value="date"/> Date created</div>
    <div><input type="radio" name="sort_types" value="creator"/> Creator</div>
    <div style="display: flex;align-items: center;"><input type="checkbox" id="invert-sort"/> Invert results</div>
  </div>
  <table id="page-table">
    <!--  Page data goes here-->
  </table>
  <br/><br/><br/><br/>
  <a href="/create-page"><button>+ Create new page</button></a>
</div>

<script>
  let pageTable = document.getElementById('page-table');
  let all_pages = [];
  let show_settings = false;

  function render_table(pages) {
    pageTable.innerHTML = `<tr>
      <th>Private?</th>
      <th>Title</th>
      <th>Route</th>
      <th>Edit</th>
    </tr>`;
    for (var i = 0; i < pages.length; i++) {
      let page = pages[i];
      pageTable.insertRow().innerHTML += `<tr>
        <td>${page.is_public ? '' : '<img src="/assets/icons/lock.svg"/>'}</td>
        <td>
          <div class="page-title"><a href="/${page.route}">${page.title}</a></div>
          <div class="created-by">Created by ${page.created_by}</div>
        </td>
        <td><a href="/${page.route}">/${page.route}</a></td>
        <td>${_current_user.username == page.created_by ? `<a href="/edit/${page.route}"><img src="/assets/icons/edit.svg"/></a>` : ''}</td>
      </tr>`;
    }
    if (pages.length < 1) {
      pageTable.insertRow().innerHTML += `<tr><td></td><td id="no-pages-found">(No pages found)</td><td></td><td></td></tr>`;
    }
  }

  function search_pages() {
    let search = document.getElementById('search').value;
    if (search.length < 1) {
      return sort_pages(all_pages);
    }
    let searched_pages = all_pages.filter(page => page.title.search(search) != -1)
    sort_pages(searched_pages);
  }

  function sort_pages(pages) {
    let sort_types = document.getElementsByName('sort_types');
    let sorted_pages = [];
    if (sort_types[2].checked) {         // creator
      sorted_pages = pages.sort((a, b) => { return a.created_by > b.created_by; });
    } else if (sort_types[1].checked) {  // date
      sorted_pages = pages.sort((a, b) => { return new Date(a.date_created) > new Date(b.date_created); });
    } else {                             // title
      sorted_pages = pages.sort((a, b) => { return a.title > b.title; });
    }
    if (document.getElementById('invert-sort').checked) {
      sorted_pages.reverse();
    }
    render_table(sorted_pages);
  }

  function toggle_settings() {
    show_settings = !show_settings;
    if (!show_settings) {
      document.getElementById('search-settings').style.display = `none`;
      document.getElementById('search-settings-toggle').innerHTML = 'Settings  &#x25B8;';
    } else {
      document.getElementById('search-settings').style.display = 'flex';
      document.getElementById('search-settings-toggle').innerHTML = 'Settings  &#x25BE;';
    }
  }

  function get_all_pages() {
    const http = new XMLHttpRequest();
    http.open('GET', '/api/all-pages');
    http.send();
    http.onreadystatechange = (e) => {
      let response;      
      if (http.readyState == 4 && http.status == 200) {
        response = JSON.parse(http.responseText); 
        console.log("Pages loaded!");
        all_pages = response;
        sort_pages(all_pages);
      }
    }
  }

  current_user_loaded = function () {
    get_all_pages();
  }
  
</script>

<style>
  
  #search-bar-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  #search {
    width: calc(100% - 100px);
    padding: 10px;
    box-sizing: border-box;
    border-radius: 15px;
  }
  #search-settings-toggle {
    text-decoration: underline;
    margin-right: 10px;
    cursor: pointer;
  }

  #search-settings {
    display: none;
    flex-flow: row wrap;
    justify-content: space-around;
    margin: 10px 0px;
  }

  table {
    width: 100%;
  }
  tr th {
    color: rgba(255,255,255,0.5);
    border: none;
    text-align: left;
    font-weight: normal;
  }
  tr th:first-child, tr th:nth-child(0n + 3) {
    max-width: 100px;
  }
  td {
    border-right: none;
    border-left: none;
  }

  div.page-title {
    color: var(--yellow);
    font-size: 1.3em;
  }
  div.created-by {
    opacity: 0.5;
    font-size: 1em;
  }

  td img {
    width: 25px;
    max-width: 25px;
    max-height: 25px;
    display: block;
    margin: auto;
    cursor: pointer;
  }

  #no-pages-found {
    text-align: center;
    opacity: .5;
  }
</style>
```

<br/><br/><br/><br/>


<h3 id="a-13"> ☑️ Step 13:   ☞ Test the code!  </h3>

Restart the server, and go to `/all-pages`.  
You should see a table of all the created pages! Wonderful.   

Pages that are not "public" should have a lock displayed by them.  
Pages created by the current user should have an "edit" icon, linking to an edit page -- which is a 404 for now.  

You should also be able to search for pages by title, and sort the page display by title, creator, or date created. 

<br/><br/><br/><br/>


<h3 id="a-14">☑️ Step 14. ❖ Part A review. </h3>

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
```

<br/><br/><br/><br/>



<h3 id="b-3">  ☑️ Step 3: Create <code>/pages/cms/edit-page.html</code>  </h3>

This is another dynamic page. It will get a page's details via an API call to `POST_get_page`.  
Then, it will load the page's content, as markdown, into an editable box.

A "buffer" (a draft) of the page's markdown can then be edited.
Finally, pages can be "saved", updating the published page.  

Create the file `/pages/cms/edit-page.html`, with the following code:  

```html
<div class="p-3 center-column" id="loading-page">
  Loading page...
</div>

<div class="p-3 center-column" id="dynamic-page">
  <div class="flex-row">
    <div style="width:40%;">Route: / <input id="page-route" type="text" value="" oninput="update_pageRoute()" tabindex="1" /></div>
    <div style="display: flex; align-items: center;">Public? <input id="is-public" type="checkbox" onclick="toggle_publicity()" tabindex="2"/></div>
  </div>
  <div class="flex-row">
    <input id="page-title" type="text" value="" oninput="update_pageTitle()" tabindex="3">
    <button onclick="cancel()">Cancel</button>
    <button id="save" onclick="save()" tabindex="6">Save</button>
  </div>
  <div id="error"></div>

  <textarea id="page-buffer" oninput="update_buffer(event.currentTarget.value)" tabindex="5"></textarea/>
  <br/><br/>
  <button onclick="render_preview()">Preview</button>
  <button style="margin-left:20px;" onclick="window.location.href = `/${page_route}`">Go to Page</button>
  <br/><br/><br/><hr/><br/><br/>
  <button style="background: var(--red);" onclick="delete_page()">Delete Page</button>
</div>

<div class="p-3 center-column" id="preview-page">
  <button onclick="back_to_editor()">Edit</button><br/><hr/><br/>
  <div id="preview-content"></div>
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
  document.getElementById('page-route').value = buffer_data.route;
  document.getElementById('is-public').checked = buffer_data.is_public;
  document.getElementById('page-title').value = buffer_data.title;
  document.getElementById('page-buffer').innerHTML = buffer_data.content;
  check_if_saved();
}

function render_preview() {
  document.getElementById('dynamic-page').style.display = `none`;
  document.getElementById('preview-page').style.display = 'block';
  document.getElementById('preview-content').innerHTML = buffer_data.content;
}

function back_to_editor() {
  document.getElementById('dynamic-page').style.display = `block`;
  document.getElementById('preview-page').style.display = 'none';
  render_page();
}

////  SECTION 3: Event reactions

//  Fired if unsaved changes exist
function beforeUnloadListener(event) {
  event.preventDefault();
  return (event.returnValue = "");
};

//  Fired in render_page() and in any buffer editing function
function check_if_saved() {
  is_saved = (buffer_data.content == page_data.content) && (buffer_data.title == page_data.title) 
    && (buffer_data.is_public == page_data.is_public) && (buffer_data.route == page_data.route);
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
  buffer_data.title = document.getElementById('page-title').value;
  check_if_saved();
}

function update_pageRoute() {
  buffer_data.route = document.getElementById('page-route').value;
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
    title: buffer_data.title,
    content: buffer_data.content,
    route: buffer_data.route,
    is_public: buffer_data.is_public
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Page updated.");
        page_data.content = buffer_data.content;
        page_data.title = buffer_data.title;
        page_data.route = buffer_data.route;
        page_data.is_public = buffer_data.is_public;
        render_page();
        if (_current_page.split('/edit/')[1] != buffer_data.route) {
          window.location.href = '/edit/' + buffer_data.route;
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
  if (confirm('Are you sure? Changes will not be saved!')) {
    window.location.href = '/edit/' + page_route;
  }
}

//  Fired when the delete page button is clicked
function delete_page() {
  if (!confirm(`Are you sure you want to permanently delete /${page_route}?`)) {
    return;
  }
  const http = new XMLHttpRequest();
  http.open('POST', '/api/delete-page');
  http.send(JSON.stringify({ 
    id: page_data.id
  }));
  http.onreadystatechange = (e) => {
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        document.getElementById('error').innerHTML = "Page deleted.  Redirecting you...";
        window.location.href = '/';
      } else {
        console.warn("Err")
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}

////  SECTION 4: Boot
//  Load all page elements from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/page?route=${page_route}`);
  http.send();
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      document.getElementById('loading-page').style.display = 'none';
      document.getElementById('dynamic-page').style.display = 'block';
      if (!response.error) {
        console.log("Response recieved! Loading page.");
        page_data = response.data;
        buffer_data.content = page_data.content || "";
        buffer_data.title = page_data.title || "";
        buffer_data.route = page_data.route;
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
    display: none;
  }

  #preview-page {
    display: none;
  }

  #dynamic-page input:not([type='checkbox']) {
    font-family: CrimsonText;
    width: 60%;
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
    align-items: center;
  }

  #dynamic-page button {
    width: 15%;
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
      '/api/delete-user': POST_delete_user,
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

Then add the new function right after `POST_create_page`, called `POST_update_page`:  

```javascript
function POST_update_page(page_update, res) {  
  let response = DataBase.table('pages').update(page_update.id, page_update);
  api_response(res, 200, JSON.stringify(response));
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



<h3 id="b-6">  ☑️ Step 6: Adding <code>POST_delete_page</code> to <code>/server/server.js</code>  </h3>

Add `POST_delete_page` to the api routes:

```js
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
```

And then we'll add the  `POST_delete_page` function: 

```js
function POST_delete_page(request_info, res) {
  let page_data = DataBase.table('pages').find({ id: request_info.id });
  let response = {
    error: false,
    msg: '',
  }
  if (page_data.length < 1) {
    response.error = true;
    response.msg = 'No page found.';
  } else {
    response.msg = DataBase.table('pages').delete(request_info.id);
  }
  return api_response(res, 200, JSON.stringify(response));
}
```

<br/><br/><br/><br/>



<h3 id="b-7"> ☑️ Step 7:   ☞ Test the code!  </h3>

Restart the server. Open a page in the page editor.  Try to delete it!  
Make sure the page is deleted in the database, and no longer appears in the table of all pages. 

<br/><br/><br/><br/>



<h3 id="b-8">☑️ Step 8. ❖ Part B review. </h3>

The complete code for Part B is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_B).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-c" align="center">  Part C:  Markup Syntax </h2>

In this section, we'll implement a markup language in the text editor.
Pages will be written in "Rooftop Markup", which will be described later.

This part will accomplish:
 - Create a text editor that can display partially colored text
 - Analyzing page content, with the Rooftop Markup syntax rules
 - Display syntax highlighting while editing pages
 - Transform Rooftop Markup to HTML

<br/><br/><br/><br/>


<h3 id="c-1">  ☑️ Step 1: Enable text coloring in the textarea of <code>cms/edit-page.html</code>  </h3>

In HTML, text input tags `<input>` and `<textarea>` can only display one, uninterrupted style of text.  
However, to add syntax highlighting while editing pages, we'll need colored text in an textarea!  

This is accomplished by layering a textarea over a `<pre>` tag, and then hiding the textarea, except the caret.  
The concept implementation is described nicely [here](https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/).  

To test out the concept before we've analysed the markup syntax, we'll just replace every `b` that's typed with `<span style="color:cyan">b</span>`.  

Edit  `cms/edit-page.html`: 

```javascript
<div class="p-3 center-column" id="loading-page">
  Loading page...
</div>

<div class="p-3 center-column" id="dynamic-page">
  <div class="flex-row">
    <div style="width:40%;">Route: / <input id="page-route" type="text" value="" oninput="update_pageRoute()" tabindex="1" /></div>
    <div style="display: flex; align-items: center;">Public? <input id="is-public" type="checkbox" onclick="toggle_publicity()" tabindex="2"/></div>
  </div>
  <div class="flex-row">
    <input id="page-title" type="text" value="" oninput="update_pageTitle()" tabindex="3">
    <button onclick="cancel()">Cancel</button>
    <button id="save" onclick="save()" tabindex="6">Save</button>
  </div>
  <div id="error"></div>

  <textarea id="page-buffer" spellcheck="false" oninput="update_buffer(event.currentTarget.value)" onscroll="sync_scroll(this);" tabindex="5"></textarea>
  <pre id="highlighting" aria-hidden="true"><code id="highlighting-content"></code></pre>
    
  <br/><br/>
  <button onclick="render_preview()">Preview</button>
  <button style="margin-left:20px;" onclick="window.location.href = `/${page_route}`">Go to Page</button>
  <br/><br/><br/><hr/><br/><br/>
  <button style="background: var(--red);" onclick="delete_page()">Delete Page</button>
</div>

<div class="p-3 center-column" id="preview-page">
  <button onclick="back_to_editor()">Edit</button><br/><hr/><br/>
  <div id="preview-content"></div>
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
  document.getElementById('page-route').value = buffer_data.route;
  document.getElementById('is-public').checked = buffer_data.is_public;
  document.getElementById('page-title').value = buffer_data.title;
  document.getElementById('page-buffer').value = buffer_data.content;

  document.getElementById('highlighting-content').innerHTML = buffer_data.content.replace(/b/g, `<span style='color: cyan'>b</span>`);
  check_if_saved();
}

function render_preview() {
  document.getElementById('dynamic-page').style.display = `none`;
  document.getElementById('preview-page').style.display = 'block';
  document.getElementById('preview-content').innerHTML = buffer_data.content;
}

function back_to_editor() {
  document.getElementById('dynamic-page').style.display = `block`;
  document.getElementById('preview-page').style.display = 'none';
  render_page();
}

////  SECTION 3: Event reactions

//  Fired if unsaved changes exist
function beforeUnloadListener(event) {
  event.preventDefault();
  return (event.returnValue = "");
};

//  Fired in render_page() and in any buffer editing function
function check_if_saved() {
  is_saved = (buffer_data.content == page_data.content) && (buffer_data.title == page_data.title) 
    && (buffer_data.is_public == page_data.is_public) && (buffer_data.route == page_data.route);
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
  document.getElementById('highlighting-content').innerHTML = buffer_data.content.replace(/b/g, `<span style='color: cyan'>b</span>`);

  if(buffer_data.content[buffer_data.content.length - 1] == "\n") {     // Fixing "last newline" error -- see css-tricks article
    document.getElementById('highlighting-content').innerHTML += " ";  
  }
  check_if_saved();
}

//  Syncronizes the textarea scroll with the highlighted <pre> scroll
function sync_scroll(element) {
  let result_element = document.querySelector("#highlighting");
  result_element.scrollTop = element.scrollTop;
  result_element.scrollLeft = element.scrollLeft;
}

//  Fires when the page title is changed. 
function update_pageTitle() {
  buffer_data.title = document.getElementById('page-title').value;
  check_if_saved();
}

function update_pageRoute() {
  buffer_data.route = document.getElementById('page-route').value;
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
    title: buffer_data.title,
    content: buffer_data.content,
    route: buffer_data.route,
    is_public: buffer_data.is_public
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Page updated.");
        page_data.content = buffer_data.content;
        page_data.title = buffer_data.title;
        page_data.route = buffer_data.route;
        page_data.is_public = buffer_data.is_public;
        render_page();
        if (_current_page.split('/edit/')[1] != buffer_data.route) {
          window.location.href = '/edit/' + buffer_data.route;
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
  if (confirm('Are you sure? Changes will not be saved!')) {
    window.location.href = '/edit/' + page_route;
  }
}

//  Fired when the delete page button is clicked
function delete_page() {
  if (!confirm(`Are you sure you want to permanently delete /${page_route}?`)) {
    return;
  }
  const http = new XMLHttpRequest();
  http.open('POST', '/api/delete-page');
  http.send(JSON.stringify({ 
    id: page_data.id
  }));
  http.onreadystatechange = (e) => {
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        document.getElementById('error').innerHTML = "Page deleted.  Redirecting you...";
        window.location.href = '/';
      } else {
        console.warn("Err")
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}

////  SECTION 4: Boot
//  Load all page elements from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/page?route=${page_route}`);
  http.send();
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      document.getElementById('loading-page').style.display = 'none';
      document.getElementById('dynamic-page').style.display = 'block';
      if (!response.error) {
        console.log("Response recieved! Loading page.");
        page_data = response.data;
        console.log(page_data)
        buffer_data.content = page_data.content || "";
        buffer_data.title = page_data.title || "";
        buffer_data.route = page_data.route;
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
    padding: 40px 0px;
    display: none;
  }

  #preview-page {
    display: none;
  }

  #dynamic-page input:not([type='checkbox']) {
    font-family: CrimsonText;
    width: 60%;
  }

  input#page-route {
    font-size: 1em;
  }

  input#page-title {
    margin: 0.67em 0px;
    padding: 0px;
    font-size: 2em;
  }
  
  /*  Page buffer + highlighter */
  #page-buffer, #highlighting {
    height: 60vh;
    width: 100%;
    margin: 0px;
    padding: 5px;
    box-sizing: border-box;
    overflow-y: scroll;
  }
  #page-buffer {
    position: absolute;
    z-index: 1;
    color: transparent;
    background: transparent;
    caret-color: white;
    resize: none;
  }
  #highlighting {
    z-index: 0;
  }

  .flex-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  #dynamic-page button {
    width: 15%;
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



<h3 id="c-2"> ☑️ Step 2:   ☞ Test the code!  </h3>

Edit a page, and type some text that includes a few lowercase `b`s.  They should appear cyan!
Make sure the text editor is working correctly.  

Type a line that exceeds the text editor's length, and make sure it wraps correctly.  
Press enter enough times, and make sure the text can scroll correctly. 

<br/><br/><br/><br/>


<h3 id="c-3">  ☑️ Step 3: Add <code>cms/markup-rules.html</code> to <code>server.js</code>  </h3>

Edit `server/server.js`:
```js
//  Mapping URLs to pages
var pageURLs = {
  '/': '/pages/misc/landing.html',
  '/landing': '/pages/misc/landing.html',
  '/register': '/pages/misc/register.html',
  '/login': '/pages/misc/login.html',
  '/profile': '/pages/misc/profile.html',
  '/create-page': '/pages/cms/create-page.html',
  '/all-pages': '/pages/cms/all-pages.html',
  '/markup-rules': '/pages/cms/markup-rules.html'
}
var pageURLkeys = Object.keys(pageURLs);
```

<br/><br/><br/><br/>




<h3 id="c-4">  ☑️ Step 4: Create <code>cms/markup-rules.html</code>  </h3>

Create a new file called `/cms/markup-rules.html`. 

I need to articulate the rules of the Rooftop markup language.  
So, we may as well add them to a static page of the website.

```html
<div class="p-3 center-column" id="markup-rules">
  <h2>Rooftop Markup Rules</h2>
  <p>Hello!</p>
  <p>
    This page describes the rules for the Rooftop <a href="https://en.wikipedia.org/wiki/Markup_language" target="_blank">markup language</a>.  
    The markup language can be summarized as a sanitized subset of HTML, plus some shorthand tools inspired <a href="https://daringfireball.net/projects/markdown/" target="_blank">Markdown</a>.
  </p>
  <br/><br/>
  <h3>Table of contents:</h3>
  <ul>
    <li><a href="#valid-html">Valid HTML</a></li>
    <li><a href="#valid-shorthand">Valid Shorthand</a></li>
  </ul>
  <br/><br/><br/><br/><hr/><br/><br/><br/><br/>
  <h3 id="#valid-html">Valid HTML</h3>
  <p>Rooftop Markup recognizes HTML tags using the following system:</p>
  <ul>
    <li>Recognize significant HTML characters</li>
    <li>Use context to recognize open tags, closing tags, attributes, and values</li>
    <li>
      Remove any tags that aren't one of these: 
      <ul>
        <li>h1 - h6, p, div, span, b, i, code, pre</li>
        <li>ol, ul, li, table, tr, th, td, a, img, br, hr</li>
      </ul>
    </li>
    <li>Remove any attributes other than</li>
    <ul><li>style, img, src, href, target</li></ul>
  </ul>
  <p>This is done to sanitize the markup, ensuring no pages include extra javascript. </p>
  <p>It also ensures that no deprecated tags are used.  Note that other invalid HTML syntax, like badly nested tags or unclosed tags, are not detected nor handled.</p>
  <br/><br/><br/><br/><hr/><br/><br/><br/><br/>
  
</div>
```

This page can be tested here, by opening up the page `/markup-rules`. 

<br/><br/><br/><br/>



<h3 id="c-5"> ☑️ Step 5:   Create <code>/cms/convert-markup.js</code>  </h3>

In this section, we'll be writing a Javascript file which will be reused in both `/edit-page.html` and `/display-page.html`.  
The script will have the following functions: 
 - `markup_to_tokens`, which accepts a text file of markup, and returns an array of labelled "tokens"
   - Token examples: `{ type: "LESS-THAN", text: "<" }`, `{ type: "TEXT", text: "a" }`. `{ type: "SINGLE-QUOTE", text: "'" }`
 - `tokens_to_parse`, which accepts an array of tokens, and uses context to return a list of "parsed tokens".
   - Parsed token examples: `{ type: "LESS-THAN", text: "<" }`, `{ type: "OPEN-TAG", text: "a" }`, `{ type: "OPEN-QUOTE", text: "'" }`
   - These tokens are used for syntax highlighting!
 - `parse_to_tags`, which accepts an array of parsed tokens, and returns an array of simplified tag tokens
   - Simplified token ex:  `{ type: "OPEN-TAG", text: "a" }`, `{ type: "ATTR-NAME", text: "href" }`, `{ type: "ATTR-VALUE", text: "link.com" }`
 - `tags_to_valid_tags`, which accepts simplified tag tokens, and returns only the valid tags and attributes.
 - `tags_to_html`, which accepts simplified tag tokens, and returns a string of html.
   - This is used for rendering pages, and page previews!
 - `validate_html`, which takes a string of HTML, converts it to tokens, validates, returns the final string

Create a new file, `/cms/convert-markup.js`, and add the following: 

```js
//  Convert-markup.js -- Functions to sanitize and convert markup to html

//  Tokens include <, /, =, ", ', >, whitespace, and text. 
function markup_to_tokens(markup) {
  let tokens = [];
  let tokenNames = {
    '<': 'LESS-THAN',
    '/': 'FORWARD-SLASH',
    '=': 'EQUALS',
    '"': 'DOUBLE-QUOTE',
    "'": 'SINGLE-QUOTE',
    '>': 'GREATER-THAN'
  }
  let tokenKeys = Object.keys(tokenNames);
  let currentText = ''

  function addCurrentText() {
    if (currentText.length > 0) {
      tokens.push({ type: 'TEXT', value: currentText });
      currentText = '';
    }
  }
  
  for (let i = 0; i < markup.length; i++) {
    if (tokenKeys.includes(markup[i])) {
      addCurrentText();
      tokens.push({ type: tokenNames[markup[i]], value: markup[i] });
    } else {
      currentText += markup[i];
    }
  }
  addCurrentText();

  return tokens;
}

//  Uses context to create an array of "parsed tokens."
function tokens_to_parse(tokens) {
  let parsed_tokens = [];
  let context = 'text';
  let current_text = '';

  function addCurrentText() {  
    if (current_text.length > 0) {
      parsed_tokens.push({ type: 'TEXT', value: current_text });
      current_text = '';
    }
  }

  for (let i = 0; i < tokens.length; i++) {

    if (context == 'text') {                  ////  If we're looking at text, outside a tag, check only for "<"
      if (tokens[i].type == 'LESS-THAN') {
        context = 'start-of-tag';
        addCurrentText();
        parsed_tokens.push(tokens[i]);
      } else {
        current_text = tokens[i].value;
      }

    } else if (context == 'start-of-tag') {   ////  If we just saw a "<", check for text or a "/".  Anything else is invalid.
      if (tokens[i].type == 'TEXT') {           
        let tag_name = tokens[i].value;
        let index_of_space = tokens[i].value.indexOf(' ');  //  If the tag name looks like "a href" only get text b4 the space. 
        if (index_of_space > 0) {
          tag_name = tokens[i].value.substring(0, index_of_space);
        }
        parsed_tokens.push({ type: 'OPEN-TAG', value: tag_name });
        context = 'in-a-tag';
        if (index_of_space > 0) {                         //  If the tag name looks like "a href", try the "href" again in new context.
          tokens[i].value = tokens[i].value.substring(tokens[i].value.indexOf(' '), tokens[i].value.length);
          i--;
        }
      } else if (tokens[i].type == 'FORWARD-SLASH') {
        context = 'start-of-close-tag';
        parsed_tokens.push(tokens[i]);
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'in-a-tag') {     ////  If in a tag, look for text (attr-name), a /, or a >. Anything else is invalid
      if (tokens[i].type == 'TEXT') {
        context = 'attribute-equals';
        let attr_name = tokens[i].value;
        let index_of_space = tokens[i].value.indexOf(' ');  //  If the attr name looks like "checked class" only get text b4 the space. 
        if (index_of_space > 0) {                           //  Note:  If the space is at index 0, like " class", ignore it.
          attr_name = tokens[i].value.substring(0, index_of_space);
        }
        parsed_tokens.push({ type: 'ATTR-NAME', value: attr_name });
        if (index_of_space > 0) {                         //  If the tag name looks like "checked class", try the "class" again.
          tokens[i].value = tokens[i].value.substring(tokens[i].value.indexOf(' '), tokens[i].value.length);
          i--;
          context = 'in-a-tag';
        }
      } else if (tokens[i].type == 'FORWARD-SLASH') {       //  As in, <br/>
        context = 'end-of-single-tag';
        parsed_tokens.push(tokens[i]);
      } else if (tokens[i].type == 'GREATER-THAN') {
        context = 'text';
        parsed_tokens.push(tokens[i]);
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'attribute-equals') {    ////  If we just saw an ATTR-NAME, expect an equal sign. (or a space, but that's handled in 'in-a-tag')
      if (tokens[i].type == 'EQUALS') {
        parsed_tokens.push(tokens[i]);
        context = 'start-of-attribute'
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'start-of-attribute') {  ////  If we just saw something like "class=", expect either ' or ".  Anything else is invalid.
      if (tokens[i].type == 'SINGLE-QUOTE') {
        parsed_tokens.push(tokens[i]);
        context = 'single-quote-attr-value';
      } else if (tokens[i].type == 'DOUBLE-QUOTE') {
        parsed_tokens.push(tokens[i]);
        context = 'double-quote-attr-value';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'single-quote-attr-value') {   ////  If we just saw a single quote, expect text or another single quote. 
      if (tokens[i].type == 'TEXT') {
        parsed_tokens.push({ type: 'ATTR-VALUE', value: tokens[i].value });
      } else if (tokens[i].type == 'SINGLE-QUOTE') {
        parsed_tokens.push(tokens[i]);
        context = 'in-a-tag';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'double-quote-attr-value') {   ////  If we just saw a double quote, expect text or another double quote. 
      if (tokens[i].type == 'TEXT') {
        parsed_tokens.push({ type: 'ATTR-VALUE', value: tokens[i].value });
      } else if (tokens[i].type == 'DOUBLE-QUOTE') {
        parsed_tokens.push(tokens[i]);
        context = 'in-a-tag';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }
 
    } else if (context == 'end-of-single-tag') {    ////  If we just saw a / inside a tag, after the tag name, expect >.  Anything else is invalid
      if (tokens[i].type == 'GREATER-THAN') {               //  Examples:  <br/>   or <img src="cat.png" />
        parsed_tokens.push(tokens[i]);
        context = 'text';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'start-of-close-tag') {  ////  If we just saw </ , expect text (the close tag name)
      if (tokens[i].type == 'TEXT') { 
        parsed_tokens.push({ type: 'CLOSE-TAG', value: tokens[i].value });
        context = 'in-a-close-tag';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }
      
    } else if (context == 'in-a-close-tag') {      ////  If we just saw a close tag name, expect >
      if (tokens[i].type == 'GREATER-THAN') {  
        parsed_tokens.push(tokens[i]);
        context = 'text';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }
      
    } else if (context == 'invalid') {
      current_text += tokens[i].value;
    }
  }

  addCurrentText();
  return parsed_tokens;
}

//  Accepts an array of parsed tokens, returns a "simplified" list of tag tokens
function parse_to_tags(parsed_tokens) {
  let simple_tags = ['TEXT', 'OPEN-TAG', 'ATTR-NAME', 'ATTR-VALUE', 'CLOSE-TAG', 'INVALID'];
  let tag_tokens = [];
  for (let i = 0; i < parsed_tokens.length; i++) {
    if (simple_tags.includes(parsed_tokens[i].type)) {
      tag_tokens.push(parsed_tokens[i]);
    }
  }
  return tag_tokens;
}

//  This converts the simplified tags into validated simplified tags!
function tags_to_valid_tags(tag_tokens) {
  let allowed_tags = [
    'h1','h2','h3','h4','h5','h6','p','div','span','b','i','pre','code',
    'ol','ul','li','table','tr','th','td','a','img','br','hr'
  ];
  let allowed_attributes = ['style','src','alt','href','target'];
  let delete_tag = false;   //  Flag to start skipping attributes, once invalid open tag is found
  let valid_tags = [];
  for (let i = 0; i < tag_tokens.length; i++) {
    if (tag_tokens[i].type == 'OPEN-TAG' && !allowed_tags.includes(tag_tokens[i].value)) {
      delete_tag = true;    //  Skip any tags, and any subsequentattr's belonging to tags, not included in the allowed tags. 
    } else if (['TEXT', 'CLOSE-TAG', 'OPEN-TAG'].includes(tag_tokens[i].type)) {
      delete_tag = false;   // Stop skipping tags (set to false) if we're at a TEXT or CLOSE-TAG, or a new OPEN-TAG that's allowed
    }
    if (delete_tag) {
      continue;
    }
    if (tag_tokens[i].type == 'CLOSE-TAG' && !allowed_tags.includes(tag_tokens[i].value)) {
      continue;
    }
    if (tag_tokens[i].type == 'ATTR-NAME' && !allowed_attributes.includes(tag_tokens[i].value.trim())) {
      if (tag_tokens[i+1].type == 'ATTR-VALUE') {
        i++;
      }
      continue;
    }
    valid_tags.push(tag_tokens[i]);
  }
  return valid_tags;
}

//  Takes an array of simplified tag tokens, returns a string of HTML
function tags_to_html(tag_tokens) {
  let final_html = '';
  for (let i = 0; i < tag_tokens.length; i++) {
    let _type = tag_tokens[i].type;
    let _value = tag_tokens[i].value;
    if (_type == 'OPEN-TAG') {
      final_html += `<` + _value;
    } else if (_type == 'ATTR-NAME') {
      final_html += _value + `='`;
    } else if (_type == 'ATTR-VALUE') {
      final_html += _value + `'`;
    } else if (_type == 'CLOSE-TAG') {
      final_html += '</' + _value + '>';
    } else if (_type == 'TEXT' && i != 0 && ['OPEN-TAG', 'ATTR-NAME', 'ATTR-VALUE'].includes(tag_tokens[i-1].type)) {
      final_html += '>' + _value;
    } else if (_type == 'TEXT') {
      final_html += _value;
    }
    if (i != 0)
    console.log(i + ', ' + _type + ': ' + ['OPEN-TAG', 'ATTR-NAME', 'ATTR-VALUE'].includes(tag_tokens[i-1].type));
  }
  return final_html;
}

//  Takes a string of HTML, converts it to tokens, validates, returns the final string
function validate_html(_html) {
  let _tokens = markup_to_tokens(_html)
  let _parsed = tokens_to_parse(_tokens);
  let _tags = parse_to_tags(_parsed);
  let _valid_tags = tags_to_valid_tags(_tags);
  let final_html = tags_to_html(_valid_tags);
  return final_html;
}
```

<br/><br/><br/><br/>


<h3 id="c-6"> ☑️ Step 6:   ☞ Test the code!  </h3>

Here are three strings I used for testing: 

```js
`<html>Hello! This is some html! <a href="link.com" target="_blank">Link!</a></html>Text at the end! This is valid!`

`<tag><"This whole string is now valid, because you can't have "<" followed by '"'.  No highlighting here </tag>`

`<div style="color:pink;" alt="hi">This is valid, and will be kept!</div>
<button onclick="hack()" style="color: purple;">This whole tag is not valid, the text will be kept though!</button>`
```

The first two

<br/><br/><br/><br/>



<h3 id="c-7">  ☑️ Step 7: Add syntax highlighting in <code>cms/edit-page.html</code>  </h3>

In this step, we'll use `/cms/convert-markup.js` to add syntax highlighting.  
Open up `/cms/edit-page.html` and edit it: 

```html
<div class="p-3 center-column" id="loading-page">
  Loading page...
</div>

<div class="p-3 center-column" id="dynamic-page">
  <div class="flex-row">
    <div style="width:40%;">Route: / <input id="page-route" type="text" value="" oninput="update_pageRoute()" tabindex="1" /></div>
    <div style="display: flex; align-items: center;">Public? <input id="is-public" type="checkbox" onclick="toggle_publicity()" tabindex="2"/></div>
  </div>
  <div class="flex-row">
    <input id="page-title" type="text" value="" oninput="update_pageTitle()" tabindex="3">
    <button onclick="cancel()">Cancel</button>
    <button id="save" onclick="save()" tabindex="6">Save</button>
  </div>
  <div id="error"></div>

  <textarea id="page-buffer" spellcheck="false" oninput="update_buffer(event.currentTarget.value)" onscroll="sync_scroll(this);" tabindex="5"></textarea>
  <pre id="highlighting" aria-hidden="true"><code id="highlighting-content"></code></pre>
    
  <br/><br/>
  <button onclick="render_preview()">Preview</button>
  <button style="margin-left:20px;" onclick="window.location.href = `/${page_route}`">Go to Page</button>
  <br/><br/><br/><hr/><br/><br/>
  <button style="background: var(--red);" onclick="delete_page()">Delete Page</button>
</div>

<div class="p-3 center-column" id="preview-page">
  <button onclick="back_to_editor()">Edit</button><br/><hr/><br/>
  <div id="preview-content"></div>
</div>

<script src="/pages/cms/convert-markup.js"></script>
<script>

////  SECTION 1: Page memory
let page_route = _current_page.split('/edit/')[1];
let buffer_data = {};
let page_data = {};
let is_saved = true;

////  SECTION 2: Render

//  Renders the text editor, final page, or "page does not exist" message.
function render_page() {
  document.getElementById('page-route').value = buffer_data.route;
  document.getElementById('is-public').checked = buffer_data.is_public;
  document.getElementById('page-title').value = buffer_data.title;
  document.getElementById('page-buffer').value = buffer_data.content;

  document.getElementById('highlighting-content').innerHTML = create_highlighting(buffer_data.content);
  check_if_saved();
}

function render_preview() {
  document.getElementById('dynamic-page').style.display = `none`;
  document.getElementById('preview-page').style.display = 'block';
  document.getElementById('preview-content').innerHTML = buffer_data.content;
}

function back_to_editor() {
  document.getElementById('dynamic-page').style.display = `block`;
  document.getElementById('preview-page').style.display = 'none';
  render_page();
}

function create_highlighting(markup_text) {
  let tokens = markup_to_tokens(markup_text);
  let parsed = tokens_to_parse(tokens);
  let colors = {
    'LESS-THAN': 'var(--yellow)',
    'GREATER-THAN': 'var(--yellow)',
    'OPEN-TAG': '#90E2B6',
    'CLOSE-TAG': '#90E2B6',
    'FORWARD-SLASH': 'white',
    'ATTR-NAME': '#FFD024',
    'EQUALS': 'white',
    'ATTR-VALUE': '#86C3FD',
    'DOUBLE-QUOTE': '#86C3FD',
    'SINGLE-QUOTE': '#86C3FD',
    'TEXT': 'white',
    'INVALID': 'white'
  }
  let highlighted = '';
  for (let i = 0; i < parsed.length; i++) {
    let escaped_text = parsed[i].value.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#39;");
    highlighted += parsed[i].type == 'INVALID' ? '<span style="text-decoration:underline;text-decoration-color:red;">' : '';
    highlighted += `<span style="color:${colors[parsed[i].type]};">${escaped_text}</span>`;
    highlighted += parsed[i].type == 'INVALID' ? '</span>' : '';

  }
  return highlighted;
}

////  SECTION 3: Event reactions

//  Fired if unsaved changes exist
function beforeUnloadListener(event) {
  event.preventDefault();
  return (event.returnValue = "");
};

//  Fired in render_page() and in any buffer editing function
function check_if_saved() {
  is_saved = (buffer_data.content == page_data.content) && (buffer_data.title == page_data.title) 
    && (buffer_data.is_public == page_data.is_public) && (buffer_data.route == page_data.route);
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
  document.getElementById('highlighting-content').innerHTML = create_highlighting(buffer_data.content);

  if(buffer_data.content[buffer_data.content.length - 1] == "\n") {     // Fixing "last newline" error -- see css-tricks article
    document.getElementById('highlighting-content').innerHTML += " ";  
  }
  check_if_saved();
}

//  Syncronizes the textarea scroll with the highlighted <pre> scroll
function sync_scroll(element) {
  let result_element = document.querySelector("#highlighting");
  result_element.scrollTop = element.scrollTop;
  result_element.scrollLeft = element.scrollLeft;
}

//  Fires when the page title is changed. 
function update_pageTitle() {
  buffer_data.title = document.getElementById('page-title').value;
  check_if_saved();
}

function update_pageRoute() {
  buffer_data.route = document.getElementById('page-route').value;
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
    title: buffer_data.title,
    content: buffer_data.content,
    route: buffer_data.route,
    is_public: buffer_data.is_public
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Page updated.");
        page_data.content = buffer_data.content;
        page_data.title = buffer_data.title;
        page_data.route = buffer_data.route;
        page_data.is_public = buffer_data.is_public;
        render_page();
        if (_current_page.split('/edit/')[1] != buffer_data.route) {
          window.location.href = '/edit/' + buffer_data.route;
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
  if (confirm('Are you sure? Changes will not be saved!')) {
    window.location.href = '/edit/' + page_route;
  }
}

//  Fired when the delete page button is clicked
function delete_page() {
  if (!confirm(`Are you sure you want to permanently delete /${page_route}?`)) {
    return;
  }
  const http = new XMLHttpRequest();
  http.open('POST', '/api/delete-page');
  http.send(JSON.stringify({ 
    id: page_data.id
  }));
  http.onreadystatechange = (e) => {
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        document.getElementById('error').innerHTML = "Page deleted.  Redirecting you...";
        window.location.href = '/';
      } else {
        console.warn("Err")
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}

////  SECTION 4: Boot
//  Load all page elements from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/page?route=${page_route}`);
  http.send();
  console.log('Requesting page')
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      document.getElementById('loading-page').style.display = 'none';
      document.getElementById('dynamic-page').style.display = 'block';
      if (!response.error) {
        console.log("Response recieved! Loading page.");
        page_data = response.data;
        buffer_data.content = page_data.content || "";
        buffer_data.title = page_data.title || "";
        buffer_data.route = page_data.route;
        buffer_data.is_public = page_data.is_public;
        render_page();
      } else {
        document.getElementById('dynamic-page').innerHTML = response.msg;
      }
    }
  }
}
window.addEventListener('load', (event) => {
  load_page();
});

</script>

<style> 
  #dynamic-page {
    position: relative;
    padding: 40px 0px;
    display: none;
  }

  #preview-page {
    display: none;
  }

  #dynamic-page input:not([type='checkbox']) {
    font-family: CrimsonText;
    width: 60%;
  }

  input#page-route {
    font-size: 1em;
  }

  input#page-title {
    margin: 0.67em 0px;
    padding: 0px;
    font-size: 2em;
  }
  
  /*  Page buffer + highlighter */
  #page-buffer, #highlighting {
    height: 60vh;
    width: 100%;
    margin: 0px;
    padding: 5px;
    box-sizing: border-box;
    overflow-y: scroll;
  }
  #page-buffer {
    position: absolute;
    z-index: 1;
    color: transparent;
    background: transparent;
    caret-color: white;
    resize: none;
  }
  #highlighting {
    z-index: 0;
  }

  .flex-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  #dynamic-page button {
    width: 15%;
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



<h3 id="c-8"> ☑️ Step 8:   ☞ Test the code!  </h3>

Edit a page.  You should see syntax highlighting when you type html!  

<br/><br/><br/><br/>



<h3 id="c-9">  ☑️ Step 9: Display page preview in <code>cms/edit-page.html</code>  </h3>

We'll make the page editor preview display the sanitized version of pages as well.   

In `/cms/edit-page.html`, edit the function `render_preview`:

```js
function render_preview() {
  document.getElementById('dynamic-page').style.display = `none`;
  document.getElementById('preview-page').style.display = 'block';
  document.getElementById('preview-content').innerHTML = validate_html(buffer_data.content);
}
```

<br/><br/><br/><br/>



<h3 id="c-10"> ☑️ Step 10:   ☞ Test the code!  </h3>

Edit a page to have something like this:
```html
<div style="color:pink;" alt="hi">This is valid, and will be kept!</div>
<button onclick="hack()" style="color: purple;">This whole tag is not valid, the text will be kept though!</button>
```

Click "preview".  The page should appear, with pink text on the first line, but no button or styling on the second. 

<br/><br/><br/><br/>



<h3 id="c-11">  ☑️ Step 11: Display validated pages in <code>cms/display-page.html</code>  </h3>

We now need to apply our validation to `/cms/display-page.html`.  
We'll add one line, importing our new script, right before our inline script tag:
```html
<script src="/pages/cms/convert-markup.js"></script>
```

Then, we'll delete a line and edit a line in this function:
```js
////  SECTION 2: Render
function render_page() {
  document.getElementById('dynamic-page').innerHTML += validate_html(page_data.content);
  document.getElementById('dynamic-page').innerHTML += `<a href="/edit/${page_data.route}"><button id="edit-button"><img src="/assets/icons/edit.svg" />Edit</button></a>`;
}
```

<br/><br/><br/><br/>




<h3 id="c-12"> ☑️ Step 12:   ☞ Test the code!  </h3>

Save a page with something like the test markup from [step 10](#c-10), then go to the page.   
The valid markup should appear! 

<br/><br/><br/><br/>



<h3 id="c-13">☑️ Step 13. ❖ Part C review. </h3>

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
        console.warn(response.msg);
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


<h3 id="d-6">  ☑️ Step 6: Editing <code>POST_delete_page</code> in <code>server.js</code>  </h3>

We're going to edit `POST_delete_page` to require the user's session id, just like `POST_update_page`.  

```js
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
```
<br/><br/><br/><br/>



<h3 id="d-7">  ☑️ Step 7: Editing <code>delete_page</code> in <code>edit-page.html</code>  </h3>

Now, we need to edit `delete_page()` in `edit-page.html`, to submit the user's `session_id` with the delete request. 

```js
//  Fired when the delete page button is clicked
function delete_page() {
  if (!confirm(`Are you sure you want to permanently delete /${page_route}?`)) {
    return;
  }
  const http = new XMLHttpRequest();
  http.open('POST', '/api/delete-page');
  http.send(JSON.stringify({ 
    id: page_data.id,
    session_id: _session_id
  }));
  http.onreadystatechange = (e) => {
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        document.getElementById('error').innerHTML = "Page deleted.  Redirecting you...";
        window.location.href = '/';
      } else {
        console.warn(response.msg);
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}
```

<br/><br/><br/><br/>



<h3 id="d-8">  ☑️  Step 8: ☞ Test the code!  </h3>

Restart the server.  Try to delete a page like before -- you should have no problem. 

Now, right click, inspect the page's elements, find the script tag, and find the `load_page` function.  
Change the line that says `if (page_data.created_by != _current_user.id) {` to `if (false) {`.  
Then, copy paste the entire contents of the `load_page` function into the console.  The edit page should load, even though you're not the correct user!!  

Edit the page and click "save".  Our "update-page" api route should prevent the page from being updated, since it checks the user's session id. 

<br/><br/><br/><br/>


<h3 id="d-6">☑️ Step 6. ❖ Part D review. </h3>

The complete code for Part D is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_D).

<br/><br/><br/><br/>
<br/><br/><br/><br/>









