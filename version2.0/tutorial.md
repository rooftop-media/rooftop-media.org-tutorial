# NodeJS Tutorial for rooftop-media.org, version 3.0

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
| [Part A - /create-page, /all-pages](#part-a) | 20 min. | 13 |
| [Part B - Page editing](#part-b) | 0 min. | 0 |
| [Part C - Page formatting](#part-c) | 0 min. | 0 |
| [Part D - Image & file upload](#part-d) | 0 min. | 0 |
| [Part E - User permissions](#part-e) | 0 min. | 0 |
| [Part F - Drafting & previewing](#part-f) | 0 min. | 0 |
| [Part G - Edit history](#part-g) | 0 min. | 0 |
| [Part H - Page styling](#part-h) | 0 min. | 0 |
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
  var is_public = document.getElementById('is_public').checked;
  
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

In this step, we'll redirect the user based on these rules:
 - If the user is logged in on `/login` or `/register`, redirect them to the home page. 
 - If the user _isn't_ logged in on a dynamic page management page, redirect them to the home page. 
   - This will include any route that starts with `/edit/...`, which we'll code in part B. 

Open up `/pages/index.js`.  First, we'll add a new function, `reroute_if_needed`, right below `current_user_loaded`:  

```javascript
// Reroute the user if their log in status doesn't match the page
function reroute_if_needed() {
  if (_current_user == null) {
    if (_current_page == '/create-page' || _current_page == '/all-pages' || _current_page.split('/')[1] == 'edit') {
      window.location.href = '/';
    }
  } else {
    if (_current_page == '/register' || _current_page == '/login') {
      window.location.href = '/';
    }
  }
}
```


We'll also update the header, to include links to `/create-page` and `/all-pages`.
```
// Update the "user buttons" in the header
function update_header() {
  let userButtonsEl = document.getElementById('user-buttons');
  let buttonText = `Menu`;
  let menuHTML = `<div id="user-menu">`;

  if (_current_user == null) {
    menuHTML += `<a href="/register">Register</a>`;
    menuHTML += `<a href="/login">Login</a>`;
    menuHTML += `<button onclick="toggle_darkmode()"> &#x1F317; </button>`;
  } else {
    buttonText = _current_user.display_name;
    menuHTML += `<a href="/profile">Your profile</a>`;
    menuHTML += `<a href="/create-page">New page</a>`;
    menuHTML += `<a href="/all-pages">All pages</a>`;
    menuHTML += `<button onclick="toggle_darkmode()"> &#x1F317; </button>`;
    menuHTML += `<button onclick="logout()">Log out</button>`;
  }
  
  userButtonsEl.innerHTML = `<button onclick="_show_user_menu = !_show_user_menu;update_header();">${buttonText}</button>`;
  if (_show_user_menu) {
    userButtonsEl.innerHTML += menuHTML + `</div>`;
  }

}
```

Then, we'll edit the `boot` function, to call `reroute_if_needed`, and remove the old reroute "if" statement:  

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
        reroute_if_needed();
        update_header();
      } else if (http.readyState == 4 && http.status == 404) {
        console.log('No session found.');
        localStorage.removeItem('session_id');
        reroute_if_needed();
        update_header();
      }
    }
  } else {
    update_header();
    reroute_if_needed();
  }

  if (_dark_mode === 'true') {
    _dark_mode = 'false';
    toggle_darkmode();
  }
  
}
window.addEventListener('load', (event) => {
  boot()
});
```

<br/><br/><br/><br/>

Note that most would suggest I put the AJAX call set up in a [separate reusable function](https://stackoverflow.com/questions/2818648/using-two-xmlhttprequest-calls-on-a-page).  I'm not doing that for now. 



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

Finally, we'll add an API route using the GET protocol!  
First, edit `api_GET_routes`:

```javascript
function api_GET_routes(url, res) {
  if (url == '/api/all-pages') {
    GET_all_pages(res);
  }
}
```

Then, right under `api_POST_routes`, add a new function, `GET_all_pages`:
```javascript
function GET_all_pages(res) {
  let all_pages = fs.readFileSync(__dirname + '/database/table_rows/pages.json', 'utf8');
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(JSON.stringify(all_pages));
  res.end();
}
```

<br/><br/><br/><br/>



<h3 id="a-10"> ☑️ Step 10:  Creating <code>pages/cms/all-pages.html</code> </h3>

This page will allow us to view all pages created in our database.  
Create a new page, `/pages/cms/all-pages.html`, and add this:

```html
<div class="p-3">
  <h3>All dynamic pages:</h3>
  <table id="page-table">
    <tr>
      <th>Page title</th>
      <th>Page route</th>
      <th>Edit link</th>
    </tr>
  </table>
</div>

<script>
  let pageTable = document.getElementById('page-table');
  get_all_pages();

  function get_all_pages() {
    pageTable.innerHTML = `<tr>
      <th>Page title</th>
      <th>Page route</th>
    </tr>`;
    const http = new XMLHttpRequest();
    http.open('GET', '/api/all-pages');
    http.send();
    http.onreadystatechange = (e) => {
      let response;      
      if (http.readyState == 4 && http.status == 200) {
        response = JSON.parse(JSON.parse(http.responseText)); // gotta run it twice 
        console.log("Pages loaded!");
        for (var i = 0; i < response.length; i++) {
          pageTable.innerHTML += `<tr>
            <td>${response[i].page_title}</td>
            <td><a href="/${response[i].page_route}">/${response[i].page_route}</a></td>
            <td><a href="/edit/${response[i].page_route}">Edit</a></td>
          </tr>`;
        }
      }
    }
  }
  
</script>

<style>
  table, th, td {
    border: solid 1px gray;
    border-collapse: collapse;
  }
  th, td {
    min-width: 100px;
    padding: 5px;
  }
  #content.dark td a {
    color: pink;
  }
  #content.dark td a:visited {
    color: lavender;
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



<h3 id="b-2">  ☑️ Step 2: Adding <code>POST_get_page</code> to <code>/server/server.js</code>  </h3>

This route will return a page's details and content, given a page's route.  

First, we'll add the API route:

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
    } else if (url == '/api/get-page') {
      POST_get_page(req_data, res)
    }
  })
}
```

Then, below `POST_create_page`, we'll write the function, `POST_get_page`:  

```javascript
function POST_get_page(route_data, res) {
  let page_data = DataBase.table('pages').find({ page_route: route_data.page_route });
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
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(JSON.stringify(response));
  res.end();
}
```

<br/><br/><br/><br/>



<h3 id="b-3">  ☑️ Step 3: Create <code>/pages/cms/edit-page.html</code>  </h3>

This is another dynamic page. It will get a page's details via an API call to `POST_get_page`.  
Then, it will load the page's content into editable input boxes.  

A "buffer" (a draft) of the page's elements and their contents can then be edited, added or deleted.  
Finally, pages can be "saved", updating the published page.  

Create the file `/pages/cms/edit-page.html`, with the following code:  

```html
<div class="p-3" id="dynamic-page">
  <i>Loading page...</i>
</div>

<script>

////  SECTION 1: Page memory
let page_route = _current_page.split('/edit/')[1];
let page_buffer = [];
let page_data = {};
let edit_el_index = -1;
let show_settings = false;
load_page_elements();

////  SECTION 2: Boot
//  Load all page elements from API, then render buffer
function load_page_elements() {
  const http = new XMLHttpRequest();
  http.open('POST', '/api/get-page');
  http.send(JSON.stringify({ page_route: page_route }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Creating page.");
        console.log(response);
        page_data = response.data;
        page_buffer = page_data.content;
        render_buffer();
      } else {
        document.getElementById('dynamic-page').innerHTML = response.msg;
      }
    }
  }
}

////  SECTION 3: Render

//  Render the buffer as editable elements
function render_buffer() {
  document.getElementById('dynamic-page').innerHTML = "";
  for (var i = 0; i < page_buffer.length; i++) {
    if (i == edit_el_index) {
      document.getElementById('dynamic-page').innerHTML += `
      <div id="element-type-select">
        Element type: 
        <select id="new-el-type" onchange="update_el(${i})">
          <option value="p">p</option>
          <option value="h1">h1</option>
          <option value="img">img</option>
          <option value="div">div</option>
          <option value="a">a</option>
          <option value="i">i</option>
        </select>
      </div>`;
    } else {
      document.getElementById('dynamic-page').innerHTML += `<div>
        <input 
        type="text" 
        value="${page_buffer[i].text}" 
        id="el-${i}" 
        class="${page_buffer[i].type}"
        oninput="update_text(${i})"
        oncontextmenu="context_menu(${i})"
      />
      </div>`
    }
  }

  document.getElementById('dynamic-page').innerHTML += `<div id="new-el">
    <button onclick="add_new_element()">+ add new element</button>
  </div>`;
  document.getElementById('dynamic-page').innerHTML += `<br/>`;
  document.getElementById('dynamic-page').innerHTML += `<div id="save">
    <button onclick="save_buffer()">Save page changes</button>
  </div>`;
  document.getElementById('dynamic-page').innerHTML += `<div id="error"></div>`;
  document.getElementById('dynamic-page').innerHTML += `<div id="settings"></div>`;
  render_settings();
}

function render_settings() {
  let settingsEl = document.getElementById('settings');
  if (show_settings) {
    settingsEl.innerHTML = `<div class="icon" onclick="show_settings=false;render_settings();">&#9881;&#65039;</div>`;
    settingsEl.innerHTML += `<div>Page title: <input value="${page_data.page_title}"></div>`;
    settingsEl.innerHTML += `<div>Page route: <input value="${page_data.page_route}"></div>`;
    settingsEl.innerHTML += `<div><a href="/${page_data.page_route}">View page</a></div>`;
  } else {
    settingsEl.innerHTML = `<div class="icon" onclick="show_settings=true;render_settings()">&#9881;&#65039;</div>`;
  }
}

////  SECTION 4: Event reactions

//  Fires when "New Element" button is clicked
function add_new_element() {
  page_buffer.push({ 
    type: 'p', 
    text: ""
  })
  render_buffer();
}

//  Fires when text of a given input is changed.
function update_text(index) {
  page_buffer[index].text = document.getElementById(`el-${index}`).value;
}

//  Fires when "type" of a given input is selected
function update_el(index) {
  page_buffer[index].type = document.getElementById('new-el-type').value;
  edit_el_index = -1;
  render_buffer();
}

//  Fires when "edit type" is clicked in the context menu
function edit_el(index) {
  edit_el_index = index;
  render_buffer();
  let ctx_menu = document.getElementById("ctx_menu");
  ctx_menu.remove();
}

//  Fires when the user right clicks on an input
function context_menu(index) {
  document.getElementById("ctx_menu") != null ? document.getElementById("ctx_menu").remove() : null;
  let e = window.event;
  e.preventDefault();
  
  document.body.innerHTML += `<div id="ctx_menu" style="left: ${e.clientX}px; top: ${e.clientY}px">
    <div class="ctx_choice" onclick="edit_el(${index})">Edit type</div>
    <div class="ctx_choice" onclick="document.getElementById('ctx_menu').remove()">Close</div>
  </div>`;
}

//  Fires whenever the user clicks on the page, to remove the custom context menu
document.body.addEventListener('mousedown', function(ev) {
  //  Don't remove context menu on right click
  if (ev.which == 3) { return; }
  //  Don't remove context menu when clicking the ctx menu (let the ctx menu handle that)
  if (ev.target.id == 'ctx_menu' || ev.target.className == 'ctx_choice' ) {
    return;
  }
  let ctx_menu = document.getElementById("ctx_menu");
  if (ctx_menu != null) {
    ctx_menu.remove();
  }
}, true);

//  Fires when "Save page changes" is clicked.
function save_buffer() {
  console.log("saving...")
  const http = new XMLHttpRequest();
  http.open('POST', '/api/update-page');
  http.send(JSON.stringify({ 
    id: page_data.id,
    content: page_buffer
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Page updated.");
        console.log(response);
        render_buffer();
      } else {
        console.warn("Err")
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}

</script>

<style> 
  #dynamic-page {
    position: relative;
  }
  input {
    font-family: CrimsonText;
  }
    /* https://www.w3schools.com/cssref/css_default_values.php */
  input.h1 {
    margin: 0.67em 0px;
    padding: 0px;
    font-size: 2em;
  }
  input.p {
    margin: 0px;
    padding: 0px;
    font-size: 1em;
  }

  /*  Context menu  */
  #ctx_menu {
    position: absolute;
    background: #efefef;
    border: solid 1px #bfbfbf;
    border-radius: 2px;
    width: 100px;
    min-height: 20px;
  }
  .ctx_choice {
    padding: 5px;
    cursor: pointer;
  }
  .ctx_choice:hover {
    background: #dfdfdf;
  }
  #element-type-select {
    border: solid 1px gray;
    padding: 5px;
    display: inline-block;
  }

  /*  Page settings menu */
  #settings {
    position: absolute;
    top: 10px;
    right: 20px;
    text-align: right;
  }
  #settings .icon {
    cursor: pointer;
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
    } else if (url == '/api/get-page') {
      POST_get_page(req_data, res);
    } else if (url == '/api/update-page') {
      POST_update_page(req_data, res);
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
If it's a saved page rouute, you should see two buttons: One to add new elements, another to save the page.  

Add a few elements to the page, with some text.  Right click on the elements to change their "type".  

Then, save the page, and ensure the content saves in the database.  
Refresh the page -- the saved changes should reload.

<br/>

Finally, go to `localhost:8080/edit/not-a-route` to display an error message.

<br/><br/><br/><br/>



<h3 id="b-6">  ☑️ Step 6: Updating <code>respond_with_a_dynamic_page</code> in <code>/server/server.js</code>  </h3>

Now that we can add elements to pages, we need to make sure those pages get rendered correctly. 

In `server.js`, change `respond_with_a_dynamic_page` to this:

```javascript
function respond_with_a_dynamic_page(res, url) {
  let page_data = DataBase.table('pages').find({ page_route: url.slice(1) });
  let content_page = "";
  if (page_data.length < 1) {
    content_page = fs.readFileSync(__dirname + '/../pages/misc/404.html');
  } else if (Array.isArray(page_data[0].content) && page_data[0].content.length > 0) {
    for (let i = 0; i < page_data[0].content.length; i++) {
      let el = page_data[0].content[i];
      content_page += `<${el.type}>${el.text}</${el.type}>`
    }
    content_page = `<div class="p-3">${content_page}</div>`;
  } else {
    content_page = `<div class="p-3"><h2>${page_data[0].page_title}</h2>`
    content_page += `<p>This page is still empty.</p></div>`;
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



<h3 id="b-7"> ☑️ Step 7:   ☞ Test the code!  </h3>

Refresh the server.  
Open a dynamic page route that has content added.  The page should display!  

Open a dynamic page route that doesn't have content added -- the page title, and a message about no content should display.  

Open a URL that doesn't have a dynamic page.  You should get the 404 page.  

<br/><br/><br/><br/>



<h3 id="b-8">☑️ Step 8. ❖ Part B review. </h3>

The complete code for Part B is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_B).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-c" align="center">  Part C:  Page Formatting </h2>

In this section, we'll add page formatting abilities to our page editor.
This includes:
 - Nested elements, like `a` tags in `p` tags in `div` tags in `div` tags.
 - Element css property editing, like text color, backgrounds, etc.


<br/><br/><br/><br/>










