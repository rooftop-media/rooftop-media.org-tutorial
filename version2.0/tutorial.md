# NodeJS Tutorial for rooftop-media.org, version 2.0

This is a tutorial for building rooftop-media.org version 2.0.  
This version creates a text editor, allowing users to:
 - Create new website pages
 - Display syntax highlighting and other editor features

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
| [Part C - Markup syntax](#part-c) | 15 min. | 11 |
| [Part D - User permissions](#part-d) | 0 min. | 11 |
| [Part E - Image & file upload](#part-e) | 0 min. | 0 |
| [Part F - Page tags](#part-f) | 0 min. | 0 |
| [Part G - Data download](#part-g) | 0 min. | 0 |
<!--
| [Part G - Edit history](#part-g) | 0 min. | 0 |
| [Part H - Data Download](#part-h) | 0 min. | 0 |-->
| [Version 3.0. - Rich page editor ???](#v3) | Todo | ? |



<br/><br/><br/><br/><br/><br/><br/><br/>





<h2 id="part-a" align="center">  Part A:  <code>/create-page</code>, <code>/all-pages</code> </h2>

In this part, we'll create two static pages to facilitate the basic creation of dynamic pages:
 - `/new-page`, where users can create a new page with a specific title and route, and
 - `/pages`, where users can see all created pages.

Dynamic pages will be saved to the database, and accessible at different URL routes.  
We'll make sure a user is logged in before they can create pages. 

<br/><br/><br/><br/>



<h3 id="a-1">  ☑️ Step 1: Create <code>/pages/cms/create-page.html</code>  </h3>

Create a new folder called `/pages/cms`.  In it, add a new file, `new-page.html`.  
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
  '/new-page': '/pages/cms/new-page.html',
  '/pages': '/pages/cms/pages.html',
}
var pageURLkeys = Object.keys(pageURLs);
```

<br/><br/><br/><br/>



<h3 id="a-5">  ☑️ Step 5: Use <code>/pages/index.js</code> to reroute and update the header </h3>

Open up `/pages/index.js`.  We'll make two changes.

First, we'll update the `render_user_buttons` function, to include links to `/create-page` and `/pages`.
```javascript
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
    menuHTML += `<a href="/new-page">New page</a>`;
    menuHTML += `<a href="/pages">All pages</a>`;
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
  var onALoggedInPage = (_current_page == '/new-page' || _current_page == '/pages' || _current_page.split('/')[1] == 'edit');
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
If you're *not* logged in and on `/new-page` or `/pages`, you should be rerouted to `/`.  

On `/new-page`, add a page name and page route.  
The page info should appear in the `/server/database/page_rows/pages.json` file.  
You should be rerouted to the page route, displaying the 404 page -- for now.  

Go back to `/new-page` to try creating the same page route.  You should get an error.  

<br/><br/><br/><br/>



<h3 id="a-7">  ☑️ Step 7: Creating dynamic pages in <code>server/server.js</code> </h3>

We're going to edit the function `respond_with_a_page` in `/server.js`. 
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
You should see a blank page (not the 404 page) with an "edit" button in the corner.  
The edit button should take you to a page called `/edit/[page-route]`, which will be a 404 for now.

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



<h3 id="a-12"> ☑️ Step 12:  Creating <code>pages/cms/pages.html</code> </h3>

This page will allow us to view all pages created in our database.  
Create a new page, `/pages/cms/pages.html`, and add this:

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
  <a href="/new-page"><button>+ Create new page</button></a>
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

Restart the server, and go to `/pages`.  
You should see a table of all the created pages! Wonderful.   

Pages that are not "public" should have a lock displayed by them.  
Pages created by the current user should have an "edit" icon, linking to an edit page -- which is a 404 for now.  

You should also be able to search for pages by title, and sort the page display by title, creator, or date created. 

<br/><br/><br/><br/>


<h3 id="a-14">☑️ Step 14. ❖ Part A review. </h3>

The complete code for Part A is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version3.0/part_A).

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
let page_route = _current_page.slice(6, _current_page.length);
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


<h3 id="b-4">  ☑️ Step 4: Adding <code>/api/update-page</code> to <code>/server/server.js</code>  </h3>

Another API route, here we go.  

Right after `POST_routes['/api/create-page']`, add a function called `POST_routes['/api/update-page']`:  

```javascript
POST_routes['/api/update-page'] = function(page_update, res) {  
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

Right after `POST_routes['/api/update-page']`, add `POST_routes['/api/delete-page']` to `/server/server.js`:

```js
POST_routes['/api/delete-page'] = function(request_info, res) {
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

The complete code for Part B is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version3.0/part_B).

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

This can be accomplished by layering a textarea over a `<pre>` tag, and then hiding the textarea, except the caret.  
The implementation is described nicely [here](https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/).  

To test out the custom textarea concept before we've analysed the markup syntax, we'll just replace every `b` that's typed with `<span style="color:cyan">b</span>`.  

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
let page_route = _current_page.slice(6, _current_page.length);
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

This method has two issues:
 - Getting the `pre` tag to stay in sync with the `textarea` is tricky, when we're adding `span`s into the pre tag.
 - HTML textareas can only have one caret for inputting text.
We *could* implement a totally custom "textarea" tag to solve these issues, but that would take too long.

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
  '/new-page': '/pages/cms/new-page.html',
  '/pages': '/pages/cms/pages.html',
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
    <li><a href="#valid-shorthand">Valid Shorthand</a> <i>Todo...</i></li>
    <li><a href="#other-details">Other details</a></li>
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
        <li>h1 - h6, p, div, span, b, i, code, pre, style</li>
        <li>ol, ul, li, table, tr, th, td, a, img, br, hr</li>
        <li>Comments, in the form &lt;!-- comment text --&gt;</li>
      </ul>
    </li>
    <li>Remove any attributes other than</li>
    <ul><li>style, img, src, href, target, class, id</li></ul>
  </ul>
  <p>This is done to sanitize the markup, ensuring no pages include extra javascript. </p>
  <p>It also ensures that no deprecated tags are used.  Note that other invalid HTML syntax, like badly nested tags or unclosed tags, are not detected nor handled.</p>
  <br/><br/><br/><br/><hr/><br/><br/><br/><br/>
  <h3 id="#valid-shorthand">Valid shorthand</h3>
  <p>Rooftop Markup recognizes a few types of shorthand syntax as well, similar to Markdown.  </p>
  <p>The following markup is allowed:</p>
  <ul>
    <li>h1 - h6 tags can be created by starting a new line with one to six #s.</li>
    <ul><li>Will markup or tags be ignored in such headings?</li></ul>
    <li>b tags can be created by surrounding text with *s.</li>
    <li>i tags can be created by surrounding text with _s.</li>
    <li>a tags can be created using this format: [Link text!](https://link.com)</li>
    <li>code tags can be created by surrounding text with `s.</li>
    <li>Text surrounded by ```s will create a pre tag surrounding a code tag.</li>
  </ul>
  <br/><br/><br/><br/><hr/><br/><br/><br/><br/>
  <h3 id="#other-details">Other details</h3>
  <p>Here are some details that apply to both shorthand and HTML:</p>
  <ul>
    <li>
      Inside a pre tag, a code tag, or the shorthand that creates those tags, characters like &lt; will be escaped.
      This allows text such as <code>&lt;b&gt;Hi!&lt;/b&gt;</code>.
    </li>
    <li>
      If you'd like to use the characters _, *, `, or # at the beginning of a line, or the format []() without creating shorthand, 
      such characters can be escaped by preceeding them with a backslash, like \*. 
    </li>
  </ul>
  
</div>
```

This page can be tested here, by opening up the page `/markup-rules`. 

<br/><br/><br/><br/>



<h3 id="c-5"> ☑️ Step 5:   Create <code>/cms/convert-markup.js</code>  </h3>

In this section, we'll be writing a Javascript file which will be reused in both `/edit-page.html` and `/dynamic-page.html`.  
The script will have the following functions: 
 - `markup_to_tokens`, which accepts a text file of markup, and returns an array of labelled "tokens"
   - Token examples: `{ type: "LESS-THAN", text: "<" }`, `{ type: "TEXT", text: "a" }`. `{ type: "SINGLE-QUOTE", text: "'" }`
 - `tokens_to_parse`, which accepts an array of tokens, and uses context to return a list of "parsed tokens".
   - Parsed token examples: `{ type: "LESS-THAN", text: "<" }`, `{ type: "OPEN-TAG", text: "a" }`, `{ type: "OPEN-QUOTE", text: "'" }`
   - These tokens are used for syntax highlighting!
 - `parse_code_tags`, which adds an extra token, 'CODE-TAG-TEXT', for any text between &lt;code&gt; tags.
   - In between code tags, special characters like &lt; are escaped. 
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
    '>': 'GREATER-THAN',
    '-': 'DASH',
    '!': 'EXCLAMATION'
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
  let current_value = '';

  function addCurrentValue(_type) {  
    if (current_value.length > 0) {
      parsed_tokens.push({ type: _type, value: current_value });
      current_value = '';
    }
  }

  for (let i = 0; i < tokens.length; i++) {

    if (context == 'text') {                  ////  If we're looking at text, outside a tag, check only for "<"
      if (tokens[i].type == 'LESS-THAN') {
        context = 'start-of-tag';
        addCurrentValue('TEXT');
        parsed_tokens.push(tokens[i]);
      } else {
        current_value += tokens[i].value;
      }

    } else if (context == 'start-of-tag') {   ////  If we just saw a "<", check for text, /, or !.  Anything else is invalid.
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
      } else if (tokens[i].type == 'EXCLAMATION') {
        context = 'start-of-comment';
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

    } else if (context == 'attribute-equals') {    ////  If we just saw an ATTR-NAME, expect = or /. (or a space, but that's handled in 'in-a-tag')
      if (tokens[i].type == 'EQUALS') {
        parsed_tokens.push(tokens[i]);
        context = 'start-of-attribute';
      } else if (tokens[i].type == 'FORWARD-SLASH') {
        parsed_tokens.push(tokens[i]);
        context = 'end-of-single-tag';
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

    } else if (context == 'single-quote-attr-value') {   ////  If we just saw a single quote, expect text, /, ", = or a closing '. 
      if (['TEXT', 'FORWARD-SLASH', 'DOUBLE-QUOTE', 'EQUALS', 'DASH', 'EXCLAMATION'].includes(tokens[i].type)) {
        current_value += tokens[i].value;
      } else if (tokens[i].type == 'SINGLE-QUOTE') {
        addCurrentValue('ATTR-VALUE');
        parsed_tokens.push(tokens[i]);
        context = 'in-a-tag';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }

    } else if (context == 'double-quote-attr-value') {   ////  If we just saw a double quote, expect text, /, ', = or a closing ". 
      if (['TEXT', 'FORWARD-SLASH', 'SINGLE-QUOTE', 'EQUALS', 'DASH', 'EXCLAMATION'].includes(tokens[i].type)) {
        current_value += tokens[i].value;
      } else if (tokens[i].type == 'DOUBLE-QUOTE') {
        addCurrentValue('ATTR-VALUE');
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
      
    } else if (context == 'start-of-comment') {    ////  If we just saw <!, expect two dashes.
      if (tokens[i].type == 'DASH' && i < tokens.length - 1 && tokens[i+1].type == 'DASH') {  
        parsed_tokens.push(tokens[i]);
        parsed_tokens.push(tokens[i]);
        i++;
        context = 'in-a-comment';
      } else {
        parsed_tokens.push({ type: 'INVALID', value: tokens[i].value });
        context = 'invalid';
      }
    } else if (context == 'in-a-comment') {    ////  If we just saw <!, expect two dashes.
      if (tokens[i].type == 'DASH' && i < tokens.length - 2 && tokens[i+1].type == 'DASH' && tokens[i+2].type == 'GREATER-THAN') {  
        addCurrentValue('COMMENT');
        parsed_tokens.push(tokens[i]);
        parsed_tokens.push(tokens[i]);
        i += 2;
        parsed_tokens.push(tokens[i]);
        context = 'text';
      } else {
        current_value += tokens[i].value;
      }
    } else if (context == 'invalid') {
      current_value += tokens[i].value;
    }
  }

  addCurrentValue('TEXT');
  return parsed_tokens;
}

//  Accepts an array of parsed tokens, returns an array of parsed tokens, with <pre> and <code> text escaped and labelled
function parse_code_tags(tokens) {
  let parsed_tokens = [];
  let context = 'non-code-tag';
  let current_value = '';

  function addCurrentValue(_type) {  
    if (current_value.length > 0) {
      parsed_tokens.push({ type: _type, value: current_value });
      current_value = '';
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    if (context == 'non-code-tag') {      //  If we haven't yet seen a 'pre' or 'code' tag, look for those tags. 
      if (tokens[i].type == 'OPEN-TAG' && tokens[i].value == 'code') {
        context = 'in-code-tag';
      }
      parsed_tokens.push(tokens[i]);
    
    } else if (context == 'in-code-tag') {         //  If in a code tag, look for a >
      if (tokens[i].type == 'GREATER-THAN') {
        context = 'in-code-tag-text';
      }
      parsed_tokens.push(tokens[i]);
    
    } else if (context == 'in-code-tag-text') {    //  If in the inner HTML of a code tag, look for <
      if (tokens[i].type == 'CLOSE-TAG' && tokens[i].value == 'code') {
        context = 'non-code-tag';
        current_value = current_value.slice(0, current_value.length - 2);
        addCurrentValue('CODE-TAG-TEXT');
        parsed_tokens.push({type: 'LESS-THAN', value: '<'});
        parsed_tokens.push({type: 'FORWARD-SLASH', value: '/'});
        parsed_tokens.push(tokens[i]);
      } else {
        current_value += tokens[i].value;
      }

    } 
  }
  return parsed_tokens;
}


//  Accepts an array of parsed tokens, returns a "simplified" list of tag tokens
function parse_to_tags(parsed_tokens) {
  let simple_tags = ['TEXT', 'OPEN-TAG', 'ATTR-NAME', 'ATTR-VALUE', 'CLOSE-TAG', 'CODE-TAG-TEXT', 'INVALID'];
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
    'h1','h2','h3','h4','h5','h6','p','div','span','b','i','pre','code','style',
    'ol','ul','li','table','tr','th','td','a','img','br','hr'
  ];
  let allowed_attributes = ['style','src','alt','href','target','class','id'];
  let delete_tag = false;   //  Flag to start skipping attributes, once invalid open tag is found
  let valid_tags = [];
  for (let i = 0; i < tag_tokens.length; i++) {
    if (tag_tokens[i].type == 'OPEN-TAG' && !allowed_tags.includes(tag_tokens[i].value)) {
      delete_tag = true;    //  Skip any tags, and any subsequentattr's belonging to tags, not included in the allowed tags. 
    } else if (['TEXT', 'CLOSE-TAG', 'OPEN-TAG', 'CODE-TAG-TEXT'].includes(tag_tokens[i].type)) {
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
    if (i != 0 && ['OPEN-TAG', 'CLOSE-TAG', 'TEXT', 'CODE-TAG-TEXT'].includes(tag_tokens[i].type) && ['OPEN-TAG', 'ATTR-NAME', 'ATTR-VALUE'].includes(tag_tokens[i-1].type)) {
      final_html += '>';
    }
    if (_type == 'OPEN-TAG') {
      final_html += `<` + _value;
    } else if (_type == 'ATTR-NAME') {
      final_html += _value + `='`;
    } else if (_type == 'ATTR-VALUE') {
      final_html += _value + `'`;
    } else if (_type == 'CLOSE-TAG') {
      final_html += '</' + _value + '>';
    } else if (_type == 'TEXT') {
      final_html += _value;
    } else if (_type == 'CODE-TAG-TEXT') {
      final_html += _value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");;
    }
  }
  return final_html;
}

//  Takes a string of HTML, converts it to tokens, validates, returns the final string
function validate_html(_html) {
  let _tokens = markup_to_tokens(_html)
  let _parsed = tokens_to_parse(_tokens);
  let _escaped_parse = parse_code_tags(_parsed)
  let _tags = parse_to_tags(_escaped_parse);
  let _valid_tags = tags_to_valid_tags(_tags);
  let final_html = tags_to_html(_valid_tags);
  return final_html;
}
```

<br/><br/><br/><br/>


<h3 id="c-6"> ☑️ Step 6:   ☞ Test the code!  </h3>

Here are the strings I used for testing: 

```js
//  For testing in syntax highlighting:
`<html>Hello! This is some html! <a href="link.com" target="_blank">Link!</a></html>Text at the end! This is valid!`
`<tag><"This whole string is now valid, because you can't have "<" followed by '"'.  No highlighting here </tag>`
`<div>This text has some quote's and "apostrophes", and http://slashes.com, and an equals=sign.</div>`
`<a href="http://link-with-two-slashes.com">Link with two slashes</a>`
`<span attrOne="A double quote with 'single quotes', /slashes, and =equals" attrTwo='A single quote with "double quotes", /slashes, and =equals'>Text!</span>`;
`<input type="checkbox" checked /> <input checked type="checkbox" />Just checking!`
`<!-- This is a comment! <tags>, //slashes, =equals, and '"quotes are all ignored. Single-dashes are also allowed. -->`

//  For testing markup conversion:
`<div style="color:pink;" alt="hi">This is valid, and will be kept!</div>
<button onclick="hack()" style="color: purple;">This whole tag is not valid, the text will be kept though!</button>`

//  Test with both syntax highlighting and markup conversion:
`<p>Here is an example of HTML:</p>
<pre><code>
  <h1>Hello world!</h1>
  <p>This is an HTML example!</p>
</code></pre>`
`<p>A great HTML tag that has been deprecated is the <code><marquee></code> tag.</p>`
`Here's another example using the pre tag: <pre><b>Hi!</b></pre>.  That should not be bold.`
```

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
let page_route = _current_page.slice(6, _current_page.length);
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
  document.getElementById('preview-content').innerHTML = validate_html(buffer_data.content);
}

function back_to_editor() {
  document.getElementById('dynamic-page').style.display = `block`;
  document.getElementById('preview-page').style.display = 'none';
  render_page();
}

function create_highlighting(markup_text) {
  let tokens = markup_to_tokens(markup_text);
  let pre_parsed = tokens_to_parse(tokens);
  let parsed = parse_code_tags(pre_parsed);
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
    'COMMENT': 'gray',
    'DASH': 'gray',
    'EXCLAMATION': 'gray',
    'CODE-TAG-TEXT': 'gray',
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
  if(buffer_data.content[buffer_data.content.length - 1] == "\n") {     // Fixing "last newline" error -- see css-tricks article
    highlighted += " ";  
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

Edit a page to have something like this:
```html
<div style="color:pink;" alt="hi">This is valid, and will be kept!</div>
<button onclick="hack()" style="color: purple;">This whole tag is not valid, the text will be kept though!</button>
```

Click "preview".  The page should appear, with pink text on the first line, but no button or styling on the second. 

<br/><br/><br/><br/>



<h3 id="c-9">  ☑️ Step 9: Display validated pages in <code>cms/dynamic-page.html</code>  </h3>

We now need to apply our validation to `/cms/dynamic-page.html`.  
We'll add one line, importing our new script, right before our inline script tag:
```html
<script src="/pages/cms/convert-markup.js"></script>
```

Then, we'll edit this function:
```js
////  SECTION 2: Render
function render_page() {
  document.getElementById('dynamic-page').innerHTML = validate_html(page_data.content);
  document.getElementById('dynamic-page').innerHTML += `<a href="/edit/${page_data.route}"><button id="edit-button"><img src="/assets/icons/edit.svg" />Edit</button></a>`;
}
```

<br/><br/><br/><br/>




<h3 id="c-12"> ☑️ Step 10:   ☞ Test the code!  </h3>

Save a page with something like the test markup from [step 10](#c-10), then go to the page.   
The valid markup should appear! 

<br/><br/><br/><br/>



<h3 id="c-13">☑️ Step 11. ❖ Part C review. </h3>

The complete code for Part C is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version3.0/part_C).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-d" align="center">  Part D:  User Permissions </h2>

In this section, we'll let users make pages public or private.  
Public pages will be available to anyone on the internet who visits the page route.  
Private pages will only be available on the edit page.  
We'll also make sure that only the user who creates a page can edit it. 

<br/><br/><br/><br/>



<h3 id="d-1">  ☑️ Step 1: Editing <code>/api/page</code> in <code>server.js</code>  </h3>

If a requested page is private, we won't send it to the browser at all, unless the user created the page

We _could_ do this by sending the user's id to the server, and comparing it to the page's "created_by" user.  
But then, users could gain access to pages by editing the request code -- they'd just need to know the "created_by" user's id. 
The user's id might be public, for example, in data sent for a user's page.  

We'll check for that in the `GET_routes['/api/page']` function in `server/server.js`, by adding an "or" to the first "if". 

```js
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

```

<br/><br/><br/><br/>



<h3 id="d-2">  ☑️ Step 2: Editing <code>load_page</code> in <code>dynamic-page.html</code>  </h3>

In `/dynamic-page.html`, we now need to pass the session id when requesting a page.

```js
////  SECTION 4: Boot
//  Load page from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/page?route=${page_route}&session_id=${_session_id}`);
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
current_user_loaded = function() {
  load_page();
}
```
<br/><br/><br/><br/>



<h3 id="d-3">  ☑️ Step 3: Editing <code>boot</code> in <code>index.js</code>  </h3>

Dynamic pages need to load even when the user isn't logged in.  
But they can't load until we've checked whether the user is logged in.  
To fix the case where users are logged out, we need to add a line to the `boot` function in `index.js`:

```js
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
      } else if (http.readyState == 4 && http.status == 404) {
        console.log('No session found.');
        localStorage.removeItem('session_id');
      }
      current_user_loaded();
      render_user_buttons();
    }
  } else {
    render_user_buttons();
    current_user_loaded();
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
```

<br/><br/><br/><br/>



<h3 id="d-4"> ☑️ Step 4:   ☞ Test the code!  </h3>

After refreshing the server, editing pages will be broken. We'll fix that next.  

Public pages should be viewable by anyone, logged in or logged out.  

Private pages should not be viewable by anyone, except for the creator of that page.

<br/><br/><br/><br/>



<h3 id="d-5">  ☑️ Step 5: Editing <code>/api/update-page</code> in <code>server.js</code>  </h3>

We now need to make sure that only the user that creates a page can edit that page.  

We _could_ do this by sending the user's id to the server, and comparing it to the page's "created_by" user.  
But then, users could gain access to pages by editing the request code -- they'd just need to know the "created_by" user's id. 
The user's id might be public, for example, in data sent for a user's page.  

Instead, we'll send a user's current session id.  On the server, we'll use that to get their user id, and compare that to the page's "created_by" user.  

Open `/server/server.js` and edit the function `POST_update_page`. 

```js
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
```

<br/><br/><br/><br/>


<h3 id="d-6">  ☑️ Step 6: Editing <code>load_page</code> and <code>save</code> in <code>edit-page.html</code>  </h3>

We now need to edit `cms/edit-page.html`, to prevent the user from editing the page if their user id doesn't match the page's creator.  

Open that file and edit the `load_page` function:

```js
////  SECTION 4: Boot
//  Load all page elements from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/page?route=${page_route}&session_id=${_session_id}`);
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
        if (page_data.created_by != _current_user.id) {
          document.getElementById('dynamic-page').innerHTML = "You don't have permission to edit this page.";
          return;
        }
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
current_user_loaded = function() {
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
    title: buffer_data.title,
    content: buffer_data.content,
    route: buffer_data.route,
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
```

<br/><br/><br/><br/>



<h3 id="d-7">  Step 7: ☑️  ☞ Test the code!  </h3>

Restart the server.

While logged in as one user, create a page.  Make sure you can still edit the page and save it with no problems.  Make sure the page is public, too.  

Then, log in as a different user, and try to edit that page.  
You should get an error telling you that you don't have permission!  

Now, right click, and paste this into the console:
```js
document.getElementById('dynamic-page').innerHTML = `<div class="flex-row"><div style="width:40%;">Route: / <input id="page-route" type="text" value="" oninput="update_pageRoute()" tabindex="1" /></div><div style="display: flex; align-items: center;">Public? <input id="is-public" type="checkbox" onclick="toggle_publicity()" tabindex="2"/></div></div><div class="flex-row"><input id="page-title" type="text" value="" oninput="update_pageTitle()" tabindex="3"><button onclick="cancel()">Cancel</button><button id="save" onclick="save()" tabindex="6">Save</button></div><div id="error"></div><textarea id="page-buffer" spellcheck="false" oninput="update_buffer(event.currentTarget.value)" onscroll="sync_scroll(this);" tabindex="5"></textarea><pre id="highlighting" aria-hidden="true"><code id="highlighting-content"></code></pre><br/><br/><button onclick="render_preview()">Preview</button><button style="margin-left:20px;" onclick="window.location.href =">Go to Page</button><br/><br/><br/><hr/><br/><br/><button style="background: var(--red);" onclick="delete_page()">Delete Page</button>`;
const http = new XMLHttpRequest();
  http.open('GET', `/api/page?route=${page_route}&session_id=${_session_id}`);
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
        if (0) {
          document.getElementById('dynamic-page').innerHTML = "You don't have permission to edit this page.";
          return;
        }
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
console.log('HACKED!!1!');
```
The edit page should load, even though you're not the correct user!!  (The page must be public)

Edit the page and click "save".  Our "update-page" api route should prevent the page from being updated, since it checks the user's session id. 

<br/><br/><br/><br/>


<h3 id="d-8">  ☑️ Step 8: Editing <code>api/delete-page</code> in <code>server.js</code>  </h3>

We're going to edit `api/delete-page` to require the user's session id, just like `api-update-page`.  

```js
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
```
<br/><br/><br/><br/>



<h3 id="d-9">  ☑️ Step 9: Editing <code>delete_page</code> in <code>edit-page.html</code>  </h3>

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



<h3 id="d-10">  ☑️  Step 10: ☞ Test the code!  </h3>

Restart the server.  Try to delete a page like before -- you should have no problem. 

Paste the code from [step 7](#d-7) into the console.  The edit page should load, even though you're not the correct user!!  

Try to delete the page.  Our "delete-page" api route should prevent the page from being updated, since it checks the user's session id. 

<br/><br/><br/><br/>


<h3 id="d-11">☑️ Step 11. ❖ Part D review. </h3>

The complete code for Part D is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version3.0/part_D).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-e" align="center">  Part E:  Image & file upload </h2>

In this section, we'll let users upload images and other files to the website.   
These images and files will be named, so they can be used in pages.  
We'll also create a page for browsing and managing uploaded files. 

<br/><br/><br/><br/>



<h3 id="e-1">  ☑️ Step 1: Adding <code>cms/upload-file.html</code>  </h3>

Create a new file, `pages/cms/upload-file.html`.  

Sending files to the server will requires a few differences, compared to other POST requests, including: 
 - Letting the website user upload file data (rather than just input text data)
 - Splitting the file into 5000 byte segments (aka chunks), to send
 - Sending multiple POST requests, with each chunk sent as a JS ArrayBuffer
 - Re-assembling the file on the server
I learned how to do this from [this article](https://blog.logrocket.com/how-to-build-file-upload-service-vanilla-javascript/).  

Here's the code: 


```html
<div class="p-3 center-column">
  <h3>Upload a File</h3>
  <div>Select file: <input type="file" tabindex="1" id="file" placeholder="frida_kahlo.png"/></div>
  <div>File description: <input type="text" tabindex="2" id="file_description" placeholder="A picture of Frida Kahlo."/></div>
  <div>File name: <input type="text" tabindex="3" id="file_name" placeholder="frida_kahlo."/></div>
  <div>Public? <input type="checkbox" tabindex="4" id="is_public"/></div>
  <p id="error"></p>
  <button onclick="upload_file()" tabindex="5">Upload</button>
  <br/><br/>
  <p id="upload-status"></p>
</div>

<script>

const utility_keys = [8, 9, 39, 37, 224]; // backspace, tab, command, arrow keys

//  Page route -- lowercase, alphanumeric, and these special characters: - / _ 
const file_name_input = document.getElementById('file_name');
const file_name_regex = /^[a-z0-9_\-\.]*$/;
file_name_input.addEventListener("keydown", event => {
  if (!file_name_regex.test(event.key) && !utility_keys.includes(event.keyCode)) {
    event.preventDefault();
    document.getElementById('error').innerHTML = "File name can only contain lowercase letters, numbers, underscores and dashes.";
  } else {
    document.getElementById('error').innerHTML = "";
  }
});

document.getElementById('file').addEventListener("change", (file) => {
  let file_name_path = file.target.value.split('/');
  if (file.target.value.indexOf('/') == -1) {
    file_name_path = file.target.value.split('\\');
  }
  document.getElementById('file_name').value = file_name_path[file_name_path.length-1];
});

function upload_file() {
  let description = document.getElementById('file_description').value;
  let name = document.getElementById('file_name').value;
  let is_public = document.getElementById('is_public').checked;
  let file = document.getElementById('file').files[0];
  
  if (!file) {
    document.getElementById('error').innerHTML = 'File required.';
    return;
  } else if (name.length < 2) {
    document.getElementById('error').innerHTML = 'File name must be at least 2 characters..';
    return;
  } else if (description.length < 2) {
    document.getElementById('error').innerHTML = 'File description must be at least 2 characters..';
    return;
  } else if (!file_name_regex.test(name)) {
    document.getElementById('error').innerHTML = "File name can only contain lowercase letters, numbers, underscores and dashes.";
    return;
  }

  //  Validating name extension
  let split_at_ext = name.split('.');
  if (split_at_ext.length != 2) {
    document.getElementById('error').innerHTML = "File name must include exactly 1 '.', for an extension (like .png, .jpg, or .txt)";
    return;
  } else if (['js', 'exe'].includes(split_at_ext[1])) {
    document.getElementById('error').innerHTML = "These extensions aren't allowed: .js, .exe";
    return;
  }
  const all_periods = /\./g;
  name = name.replace(all_periods, '%2E');

  document.getElementById('upload-status').innerHTML = 'Uploading...';

  let http = new XMLHttpRequest();
  http.open('POST', `/api/upload-file?name=${name}&description=${description}&is_public=${is_public}&created_by=${_current_user.id}`);
  http.setRequestHeader("Content-Type","application/octet-stream");
  http.send(file);
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! File uploaded.");
        document.getElementById('upload-status').innerHTML = `Uploading... `;
        window.location.href = '/all-files';
      } else {
        document.getElementById('upload-status').innerHTML = response.msg;
      }
    } else if (http.status == 400) {
      response = JSON.parse(http.responseText);
      document.getElementById('upload-status').innerHTML = response.msg;
    }
  }             
  
}
</script>
```

<br/><br/><br/><br/>



<h3 id="e-2">  ☑️ Step 2: Edit <code>server.js</code>  </h3>

Before we add our next API route, there's three edits we need to make to `/server/server.js`...
 1. We'll add two new static pages:

```
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
```
 2. We'll edit part of the function `api_routes`, to ensure the [https://www.w3schools.com/nodejs/ref_buffer.asp](Buffer) we send doesn't get converted to a string:  

```
//  This is called in server_request for any req starting with /api/.  It uses the functions above and calls the functions below.
function api_routes(url, req, res) {

  let req_data = '';
  let buffer_chunks = [];
  req.on('data', chunk => {
    if (Buffer.isBuffer(chunk)) {
      buffer_chunks.push(chunk);
    } else {
      req_data += chunk;
    }
  })
  req.on('end', function() {
    if (buffer_chunks.length > 0) {
      req_data = Buffer.concat(buffer_chunks);
    }
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

```
 3. We also need to edit `parse_req_data` to ensure the Buffer doesn't convert to a string _there_.

```js
//  Parses the data sent with a request
function parse_req_data(req_data, res) {
  if (Buffer.isBuffer(req_data)) {
    return { body: req_data };
  }
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
```

<br/><br/><br/><br/>


<h3 id="e-3">  ☑️ Step 3: Add <code>/api/upload-file</code> to <code>server.js</code>  </h3>

We're now ready to write the upload-file api route.  
Right after the function `api/delete-page`, add `api/upload-file`:

```js
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
    description: req_data._params.description,
    date_created: new Date().toString(),
    created_by: req_data._params.created_by,
    is_public: req_data._params.is_public
  })
  if (feedback.error) {
    return feedback;
  }
  return api_response(res, 200, JSON.stringify({error: false, msg: 'File uploaded successfully!'}));
}
```

<br/><br/><br/><br/>



<h3 id="e-4">  ☑️ Step 4: Add the folder <code>/assets/uploads/</code>  </h3>

Create a new folder, called `/assets/uploads`.  This folder will store all user uploaded files. 

<br/><br/><br/><br/>



<h3 id="e-5">  ☑️ Step 5: Create a new database table, <code>files</code>  </h3>

First, add a file `/server/database/table_columns/files.json`, with this: 

```js
{
  "name": "Files",
  "snakecase": "files",
  "max_id": 0,
  "columns": [
    {
      "name": "Id",
      "snakecase": "id",
      "unique": true
    },
    {
      "name": "File name",
      "snakecase": "name",
      "required": true
    },
    {
      "name": "Is Public?",
      "snakecase": "is_public"
    },
    {
      "name": "Description",
      "snakecase": "content"
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

Then, add `/server/database/table_rows/files.json` with an empty array: 

```js
[]
```

<br/><br/><br/><br/>



<h3 id="d-6">  ☑️  Step 6: ☞ Test the code!  </h3>

Try uploading a file, like an image.  You should be able to!  
Make sure the image is in the folder `/assets/uploads/`.  
You should be redirected to a page called `/all-files`, which is a 404, for now. 

Try uploading a file with the exact same file name.  You should get an error. 

<br/><br/><br/><br/>



<h3 id="e-7">  ☑️ Step 7: Create <code>/api/all-files</code>  </h3>

In `/server.js`, add this right below `GET_routes['/api/all-pages']`:

```js
GET_routes['/api/all-files'] = function(req_data, res) {
  let all_files = fs.readFileSync(__dirname + '/database/table_rows/files.json', 'utf8');
  all_files = JSON.parse(all_files);
  for (let i = 0; i < all_files.length; i++) {
    let creator_id = parseInt(all_files[i].created_by);
    all_files[i].created_by = DataBase.table('users').find({id: creator_id})[0].username;
  }
  api_response(res, 200, JSON.stringify(all_files));
}
```

<br/><br/><br/><br/>



<h3 id="e-8">  ☑️ Step 8: Create <code>/pages/cms/all-files.html</code>  </h3>

```html

```

<br/><br/><br/><br/>



<h3 id="e-?">  ☑️ Step ?: Edit <code>server.js</code> to serve uploaded assets </h3>


<br/><br/><br/><br/>



<h3 id="d-11">☑️ Step 11. ❖ Part D review. </h3>

The complete code for Part D is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version3.0/part_D).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



