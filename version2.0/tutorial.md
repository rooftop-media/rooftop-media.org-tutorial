# NodeJS Tutorial for rooftop-media.org, version 2.0

This is a tutorial for building rooftop-media.org version 2.0.  
This version creates a web-based file manager, allowing users to:
 - 👤📁 Create "user folders" for users when they log in
 - ➕📄 Create and write new text files, saved on the webserver 
 - 💽📄 Upload files from their computer to the webserver
 - ➕📁 Create and manage folders, to organize files
 - 👀📄 Let users access their files, including rendered web pages
 - 🔐📄 Manage who can access their files

*Total estimated time for this tutorial: ADD ESTIMATED TIME*

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Prerequisites

This tutorial requires that you've completed [version 1.0](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md).

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Table of Contents

Click a part title to jump down to it, in this file.

| Tutorial Parts              | Est. Time | # of Steps |
| --------------------------- | ------ | ---------- |
| [Part A - /files](#part-a) | 20 min. | 13 |
| [Part B - ](#part-b) | 15 min. | 8 |
| [Part C - ](#part-c) | 15 min. | 8 |
| [Part D - ](#part-d) | 0 min. | 0 |
| [Part E - ](#part-e) | 0 min. | 0 |
| [Part F - ](#part-f) | 0 min. | 0 |
| [Part G - ](#part-g) | 0 min. | 0 |
| [Part H - ](#part-h) | 0 min. | 0 |
| [Version 3.0. - CMS](#v3) | Todo | ? |



<br/><br/><br/><br/><br/><br/><br/><br/>





<h2 id="part-a" align="center">  Part A:  <code>/files</code> </h2>

In this part, we'll create a static page, where one can view and manage webserver files.  

![An image of the file editor page interface](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/tutorial_assets/v2/file_manager.png?raw=true)

In part A, we'll implement a few features this page, including:
 - The entire interface
 - Loading all root folders (but not contents)
 - Loading all user folders (but not contents)

We'll also make sure a new "user folder" is created when users are registered to the website. 

<br/><br/><br/><br/>


<h3 id="a-1">  ☑️ Step 1: Create <code>/pages/files/file-manager.html</code>  </h3>


<br/><br/><br/><br/>



<h3 id="a-2">  ☑️ Step 2: Edit <code>/server/server.js</code>  </h3>

First, we'll need to add the route to access our file manager page. 

<br/><br/><br/><br/>



<h3 id="a-3">  ☑️ Step 3: Add images to <code>/assets/icons/</code>  </h3>


<br/><br/><br/><br/>



<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>













<h3 id="a-1">  ☑️ Step 1: Create <code>/pages/files/file-manager.html</code>  </h3>

Create a new folder called `/pages/files`.  In it, add a new file, `file-manager.html`.  


```html
<div class="p-3 center-column">
  <h3>File manager</h3>
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



<h3 id="a-3">  ☑️ Step 3: Add <code>/api/create-page</code> to <code>/server/server.js</code>  </h3>

In `/server/server.js`, add `POST_routes['/api/create-page']` right after `POST_routes['/api/check-invite-code']`:  

```javascript
POST_routes['/api/create-page'] = function(new_page_data, res) {
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



<h3 id="a-8">  ☑️ Step 8: Creating <code>pages/cms/dynamic-page.html</code> </h3>

Create a new page,  `/pages/cms/dynamic-page.html`, and add this:. 

```javascript
<div class="p-3 center-column" id="dynamic-page">
  <i>Loading page...</i>
</div>

<script>
////  SECTION 1: Page memory
let page_route = _current_page.slice(1, _current_page.length);
let page_data = {};

////  SECTION 2: Render
function render_page() {
  document.getElementById('dynamic-page').innerHTML = page_data.content;
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


<h3 id="a-9">  ☑️ Step 9: Adding <code>/api/page</code> to <code>/server/server.js</code>  </h3>

This route will return a page's details and content, given a page's route.  

Add `GET_routes['/api/page']` right after `GET_routes['/api/user-by-session']`:

```javascript
GET_routes['/api/page'] = function(req_data, res) {
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

In `/server/server.js`, right under `GET_routes['/api/page']`, add a new function, `GET_routes['/api/all-pages']`:

```javascript
GET_routes['/api/all-pages'] = function(req_data, res) {
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

