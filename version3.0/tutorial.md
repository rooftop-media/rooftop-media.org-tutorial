# NodeJS Tutorial for rooftop-media.org, version 3.0

This is a tutorial for building rooftop-media.org version 3.0.  
This version implements [component](https://www.w3.org/TR/NOTE-HTMLComponents#overview) rendering, allowing users to:
 - Define HTML components
 - Reuse and customize those components in dynamic pages

*Total estimated time for this tutorial: ADD ESTIMATED TIME*

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Prerequisites

This tutorial requires that you've completed [version 2.0](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md).

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Table of Contents

Click a part title to jump down to it, in this file.

<table>
  <tr>
    <th>Tutorial Parts</th>
    <th>Est. Time</th>
    <th># of Steps</th>
  </tr>
  <tr>
    <td><a href="#part-a">Part A - /new-component, /components</a></td>
    <td>?? min.</td>
    <td>??</td>
  </tr>
  <tr>
    <td><a href="#part-b">Part B - Component server-side rendering</a></td>
    <td>?? min.</td>
    <td>??</td>
  </tr>
 <tr>
    <td><a href="#part-c">Part C - Component editing and preview</a></td>
    <td>?? min.</td>
    <td>??</td>
  </tr>
  <tr>
    <td><a href="#v3">Version 4.0. - ???</a></td>
    <td>Todo</td>
    <td>??</td>
  </tr>
</table>



<br/><br/><br/><br/><br/><br/><br/><br/>





<h2 id="part-a" align="center">  Part A:  <code>/new-component</code>, <code>/components</code> </h2>

In this part, we'll create two static pages to facilitate creation of components:
 - `/new-component`, where users can create a new component, and
 - `/components`, where users can see all created components.

Components will be saved to the database.  They can then be used in dynamic pages, which we will implement in part B. 
We'll make sure a user is logged in before they can create components. 

_You may notice this part is very similar to version 2 part A._

<br/><br/><br/><br/>



<h3 id="a-1">  ☑️ Step 1: Create <code>/pages/cms/components/new-component.html</code>  </h3>

Create a new folder called `/pages/cms/components/`.  In it, add a new file, `new-component.html`.  
This page will be a form to create new components.  

```html
<div class="p-3 center-column">
  <h3>Create a New Component</h3>
  <div>Component title: <input type="text" tabindex="1" id="component_title" placeholder="Click counter"/></div>
  <div>Component tag name: <input type="text" tabindex="2" id="component_route" placeholder="click-counter"/></div>
  <div>Tags: <span id="tags"></span><input type="text" tabindex="3" id="component_tags" placeholder="counter, demo" /></div>
  <div>Public? <input type="checkbox" tabindex="3" id="is_public"/></div>
  <div>Content:<textarea id="component_content" spellcheck="false" tabindex="4" placeholder="&lt;template> ..."></textarea></div>
  <p id="error"></p>
  <button onclick="create_component()" tabindex="5">Create Component</button>
</div>

<script>

const utility_keys = [8, 9, 39, 37, 224]; // backspace, tab, command, arrow keys

//  Component route -- lowercase, alphanumeric, and these special characters: - / _ 
const component_route_input = document.getElementById('component_route');
const component_route_regex = /^[a-z0-9_\-\/]*$/;
component_route_input.addEventListener("keydown", event => {
  if (!component_route_regex.test(event.key) && !utility_keys.includes(event.keyCode)) {
    event.preventDefault();
    document.getElementById('error').innerHTML = "Component route can only contain lowercase letters, numbers, underscores and dashes.";
  } else {
    document.getElementById('error').innerHTML = "";
  }
});

function create_component() {
  let title = document.getElementById('component_title').value;
  let route = document.getElementById('component_route').value;
  let tags = document.getElementById('component_tags').value.split(',');
  for (let i = 0; i < tags.length; i++) {
    tags[i] = tags[i].trim();
    if (!tags[i]) { tags.splice(i, 1); }
  }
  let is_public = document.getElementById('is_public').checked;
  let content = document.getElementById('component_content').value;
  
  if (route.length < 2) {
    document.getElementById('error').innerHTML = 'Component tag name must be at least 2 characters..';
    return;
  } else if (title.length < 2) {
    document.getElementById('error').innerHTML = 'Component title must be at least 2 characters..';
    return;
  } else if (!component_route_regex.test(route)) {
    document.getElementById('error').innerHTML = "Component tag name can only contain lowercase letters, numbers, underscores and dashes.";
    return;
  }

  const http = new XMLHttpRequest();
  http.open('POST', '/api/create-component');
  http.send(JSON.stringify({
    title,
    route,
    tags,
    is_public,
    content,
    created_by: _current_user.id,
    date_created: new Date().toString(),
    history: []
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Creating component.");
        window.location.href = '/edit-component/' + route;
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}

</script>
```

<br/><br/><br/><br/>



<h3 id="a-2">  ☑️ Step 2: Adding a Components table to the database  </h3>

To add a new table, we'll first add a set of table columns.  
Add the file `/server/database/table_columns/components.json`:  

```json
{
  "name": "Components",
  "snakecase": "components",
  "max_id": 0,
  "columns": [
    {
      "name": "Id",
      "snakecase": "id",
      "unique": true
    },
    {
      "name": "Component Title",
      "snakecase": "title"
    },
    {
      "name": "Component Route",
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
      "name": "Tags",
      "snakecase": "tags"
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

Then, add the file `/server/database/table_rows/components.json`.  Add an empty array:  

```json
[]
```

<br/><br/><br/><br/>



<h3 id="a-3">  ☑️ Step 3: Add <code>/api/create-component</code> to <code>/server/server.js</code>  </h3>

In `/server/server.js`, add `POST_routes['/api/create-component']` right after `POST_routes['/api/delete-file']`:  

```javascript
POST_routes['/api/create-component'] = function(new_component_data, res) {
  let response = DataBase.table('components').insert(new_component_data);
  api_response(res, 200, JSON.stringify(response));
}
```

<br/><br/><br/><br/>


<h3 id="a-4">  ☑️ Step 4: Add new URL routes to <code>/server/server.js</code>  </h3>

We're also going to add two new static page URL routes to `server.js`:  

```javascript
ar pageURLs = {
  '/':              '/pages/misc/landing.html',
  '/landing':       '/pages/misc/landing.html',
  '/register':      '/pages/misc/register.html',
  '/login':         '/pages/misc/login.html',
  '/profile':       '/pages/misc/profile.html',
  '/new-page':      '/pages/cms/new-page.html',
  '/pages':         '/pages/cms/pages.html',
  '/markup-rules':  '/pages/cms/markup-rules.html',
  '/upload-file':   '/pages/cms/upload-file.html',
  '/files':         '/pages/cms/files.html',
  '/new-component': '/pages/cms/components/new-component.html',
  '/components':    '/pages/cms/components/components.html'
}
```

<br/><br/><br/><br/>




<h3 id="a-5"> ☑️ Step 5:  ☞ Test the code! </h3>

Restart the server!  

On `/new-component`, add a component name and tag name.  
The page info should appear in the `/server/database/table_rows/components.json` file.  
You should be rerouted to `/edit-component/{component-tag-name}`, displaying the 404 page -- for now.  

Go back to `/new-component` to try creating the same component tag name.  You should get an error.  

<br/><br/><br/><br/>



<h3 id="a-6">  ☑️ Step 6: Use <code>/pages/index.js</code> to reroute and update the header </h3>

Open up `/pages/index.js`.  We'll make two changes.

First, we'll update the `render_user_buttons` function, to include links to `/new-component` and `/components`.
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
    menuHTML += `<a href="/files">All files</a>`;
    menuHTML += `<a href="/components">All tags</a>`;
    menuHTML += `<button onclick="logout()">Log out</button>`;
  }
  
  userButtonsEl.innerHTML = `<button onclick="_show_user_menu = !_show_user_menu;render_user_buttons();">${buttonText}</button>`;
  if (_show_user_menu) {
    userButtonsEl.innerHTML += menuHTML + `</div>`;
  }

}
```

Then, we'll edit the `boot` function.   
We'll  redirect to the home page if on `/new-component` or `/components` and not logged in, or on any route starting with `/edit-component/`.

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
  let onALoggedOutPage = (_current_page == '/register' || _current_page == '/login');
  let loggedIn = _session_id != null;
  let redirectToHome = (onALoggedOutPage && loggedIn);
  let authReqdPages = ['/new-page', '/pages', '/files', '/upload-file', '/components', '/new-component'];
  let authReqdDirectories = ['edit', 'edit-component'];
  let onALoggedInPage = (authReqdPages.includes(_current_page) || authReqdDirectories.includes(_current_page.split('/')[1]));
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



<h3 id="a-7"> ☑️ Step 7:  Making an API route for getting all components, in <code>server.js</code> </h3>

In `/server/server.js`, right under `GET_routes['/api/all-files']`, add a new function, `GET_routes['/api/all-components']`:

```javascript
GET_routes['/api/all-components'] = function(req_data, res) {
  let all_components = fs.readFileSync(__dirname + '/database/table_rows/components.json', 'utf8');
  all_components = JSON.parse(all_components);
  for (let i = 0; i < all_components.length; i++) {
    let creator_id = parseInt(all_components[i].created_by);
    all_components[i].created_by = DataBase.table('users').find({id: creator_id})[0].username;
  }
  api_response(res, 200, JSON.stringify(all_components));
}
```

<br/><br/><br/><br/>



<h3 id="a-8"> ☑️ Step 8:  Creating <code>pages/cms/components/components.html</code> </h3>

This page will allow us to view all components created in our database.  
Create a new page, `/pages/cms/components/components.html`, and add this:

```html
<div class="p-3 center-column">
  <h3>All components:</h3>
  <div id="search-bar-row">
    <input id="search" placeholder="Search components..." oninput="search_components()"/>
    <div id="search-settings-toggle" onclick="toggle_settings()">Settings  &#x25B8;</div>
  </div>
  <div id="search-settings" onclick="search_components()">
    <div>Sort by: </div>
    <div><input type="radio" name="sort_types" value="title" checked /> Title</div>
    <div><input type="radio" name="sort_types" value="date"/> Date created</div>
    <div><input type="radio" name="sort_types" value="creator"/> Creator</div>
    <div style="display: flex;align-items: center;"><input type="checkbox" id="invert-sort"/> Invert results</div>
  </div>
  <table id="component-table">
    <!--  Component data goes here-->
  </table>
  <br/><br/><br/><br/>
  <a href="/new-component"><button>+ Create new component</button></a>
</div>

<script>
  let componentTable = document.getElementById('component-table');
  let all_components = [];
  let show_settings = false;

  function render_table(components) {
    componentTable.innerHTML = `<tr>
      <th>Private?</th>
      <th>Title</th>
      <th>Tag</th>
      <th>Edit</th>
    </tr>`;
    for (var i = 0; i < components.length; i++) {
      let component = components[i];
      componentTable.insertRow().innerHTML += `<tr>
        <td class="is-public">${component.is_public ? '' : '<img src="/assets/icons/lock.svg"/>'}</td>
        <td>
          <div class="component-title"><a href="/${component.route}">${component.title}</a></div>
          <div class="created-by">Created by ${component.created_by}</div>
          <div class="tags">${get_tag_html(component.tags)}</div>
        </td>
        <td>&lt;${component.route}&gt;</td>
        <td>${_current_user.username == component.created_by ? `<a href="/edit-component/${component.route}"><img src="/assets/icons/edit.svg"/></a>` : ''}</td>
      </tr>`;
    }
    if (components.length < 1) {
      componentTable.insertRow().innerHTML += `<tr><td></td><td id="no-components-found">(No components found)</td><td></td><td></td></tr>`;
    }
  }

  function get_tag_html(tags) {
    let html = '';
    for (let i = 0; i < tags.length; i++) {
      html += `<span class="tag" onclick="search_tag('${tags[i]}')">${tags[i]}</span>`;
    }
    return html;
  }
  function search_tag(tag) {
    document.getElementById('search').value = `tag:${tag}`;
    search_components();
  }

  function search_components() {
    let search = document.getElementById('search').value;
    if (search.length < 1) {
      return sort_components(all_components);
    }
    let tags = [];
    while (search.includes('tag:')) {
      let tag_text_pos = search.indexOf('tag:');
      let end_of_tag_pos = search.indexOf(' ', tag_text_pos+4);
      if (end_of_tag_pos == -1) { end_of_tag_pos = search.length};
      let tag = search.slice(tag_text_pos + 4, end_of_tag_pos);
      tags.push(tag);
      search = search.slice(0,tag_text_pos) + search.slice(end_of_tag_pos,search.length);
    }
    
    let searched_components = all_components.filter(component => {
      let is_match = true;
      if (component.title.search(search.trim()) == -1) is_match = false;
      for (let i = 0; i < tags.length; i++) {
        if (!component.tags.includes(tags[i])) is_match = false;
      }
      return is_match
    })
    sort_components(searched_components);
  }

  function sort_components(components) {
    let sort_types = document.getElementsByName('sort_types');
    let sorted_components = [];
    if (sort_types[2].checked) {         // creator
      sorted_components = components.sort((a, b) => { return a.created_by > b.created_by; });
    } else if (sort_types[1].checked) {  // date
      sorted_components = components.sort((a, b) => { return new Date(a.date_created) > new Date(b.date_created); });
    } else {                             // title
      sorted_components = components.sort((a, b) => { return a.title > b.title; });
    }
    if (document.getElementById('invert-sort').checked) {
      sorted_components.reverse();
    }
    render_table(sorted_components);
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

  function get_all_components() {
    const http = new XMLHttpRequest();
    http.open('GET', '/api/all-components');
    http.send();
    http.onreadystatechange = (e) => {
      let response;      
      if (http.readyState == 4 && http.status == 200) {
        response = JSON.parse(http.responseText); 
        console.log("Components loaded!");
        all_components = response;
        sort_components(all_components);
      }
    }
  }

  current_user_loaded = function () {
    get_all_components();
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

  td.is-public {
    width: 50px;
  }

  div.component-title {
    color: var(--yellow);
    font-size: 1.3em;
  }
  div.created-by {
    opacity: 0.5;
    font-size: 1em;
  }
  span.tag {
    background: var(--lighter-brown);
    color: rgba(255,255,255,0.5);
    padding: 0px 4px;
    margin: 4px 5px;
    cursor: pointer;
  }

  td img {
    width: 25px;
    max-width: 25px;
    max-height: 25px;
    display: block;
    margin: auto;
    cursor: pointer;
  }

  #no-components-found {
    text-align: center;
    opacity: .5;
  }
</style>
```

<br/><br/><br/><br/>


<h3 id="a-9"> ☑️ Step 9:   ☞ Test the code!  </h3>

Restart the server.  

On `/new-component` and `/components`, if you're *not* logged in you should be rerouted to `/`.  

You should see a table of all the created components! Wonderful.   

Components that are not "public" should have a lock displayed by them.  
Components created by the current user should have an "edit" icon, linking to an edit page -- which is a 404 for now.  

You should also be able to search for components by title, and sort the page display by title, creator, or date created. 

<br/><br/><br/><br/>


<h3 id="a-10">☑️ Step 10. ❖ Part A review. </h3>

The complete code for Part A is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version3.0/part_A).

<br/><br/><br/><br/>
<br/><br/><br/><br/>




<h2 id="part-b" align="center">  Part B:  Component server-side rendering </h2>

In this section, we'll create a test component, and ensure it can be rendered properly in a dynamic page. 

On the server side, this will happen:
 - Find component tag names in dynamic page HTML.
   - Also get the attributes and innerHTML associated with that tag.
 - Replace the component tag with the component's template HTML.
 - Fill in custom "props" in the compontent template HTML, using attributes.

We're implementing components before making the component editor, which will happen in [part c](#part-c).

<br/><br/><br/><br/>



<h3 id="b-1">  ☑️ Step 1: Create <code>/server/utils/ssr.js</code>  </h3>

Create a new folder `/server/utils/` and add a new file, `ssr.js`. SSR stands for Server Side Rendering. 

```js
//  This script has functions to do server side rendering. 

//  Importing our custom libraries
const DataBase = require('../database/database.js');
const ConvertMarkup = require('../../pages/cms/convert-markup.js');


//  Take an HTML string w/ components, returns an html string
function render_components(html) {
  let _tokens = ConvertMarkup.markup_to_tokens(html);
  let _parsed = tokens_to_parse(_tokens);
  let _escaped_parse = parse_code_tags(_parsed);
  let _tags = parse_to_tags(_escaped_parse);
  //  Find + replace components
  let allowed_tags = [
    'h1','h2','h3','h4','h5','h6','p','div','span','b','i','pre','code','style',
    'ol','ul','li','table','tr','th','td','a','img','br','hr'
  ];
  let _component = {
    tag_name: '',
    attrs: {},
    text: ''
  }
  let _attr_name = '';
  let _replace_start_pt;
  for (let i = 0; i < _tags.length; i++) {
    if ( !_component.tag_name && _tags[i].type == 'OPEN-TAG' && !allowed_tags.includes(_tags[i].value)) {
      _component.tag_name = _tags[i].value;
      _replace_start_pt = i;
    } else if (_component.tag_name && tags[i].type == 'ATTR-NAME') {
      _attr_name = tags[i].value;
    } else if (_component.tag_name && tags[i].type == 'ATTR-VALUE') {
      _component[_attr_name] = tags[i].value;
    } else if (_component.tag_name && tags[i].type == 'TEXT') {
      _component.text = tags[i].value;
    } else if (_component.tag_name && tags[i].type == 'CLOSE-TAG') {
      // now we have the component info... time to replace it.
      let found_components = DataBase.table('components').find(_component.tag_name);
      if (found_components.length != 0) {
        let c_html = found_components[0].content;
        let c_tokens = ConvertMarkup.markup_to_tokens(c_html);
        let c_parsed = tokens_to_parse(c_tokens);
        let c_escaped_parse = parse_code_tags(c_parsed);
        let c_tags = parse_to_tags(c_escaped_parse);  
        _tags.splice(_replace_start_pt, i-_replace_start_pt,c_tags);
        i = _replace_start_pt;
        //
        
      } else {
        //  Error? Component not found
      }
      _component = {
        tag_name: '',
        attrs: {},
        text: ''
      }
    }
  }
  //  let _valid_tags = tags_to_valid_tags(_tags);
  let final_html = tags_to_html(_valid_tags);
  return final_html;
}

module.exports = {
  render_components
}
```

<br/><br/><br/><br/>



<h3 id="b-2">  ☑️ Step 2: Add <code>GET_routes['/api/SSR-page']</code> in <code>/server/server.js</code>  </h3>

First, at the top of `/server/server.js`, we need to import the SSR functions we just wrote:

```js
//  Importing our custom libraries
const DataBase = require('./database/database.js');
const SSR = require('./utils/ssr.js');
```

Now, add the function `GET_routes['/api/SSR-page']` right below `GET_routes['/api/page']`. This will replace component tags with component templates before sending the page's HTML.

```js
GET_routes['/api/SSR-page'] = function(req_data, res) {
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
  //  Now we have our page, we SSR components
  response.data.content = SSR.render_components(response.data.content);
  
  console.log(response.data.content)
  console.log(ConvertMarkup.markup_to_tokens(response.data.content))
  api_response(res, 200, JSON.stringify(response));
}
```

<br/><br/><br/><br/>


<h3 id="b-3">  ☑️ Step 3: Edit `/pages/cms/dynamic-page.html` to use SSR.  </h3>

We're just changing one line in `/pages/cms/dynamic-page.html`: in `load_page`, call our new `/api/SSR-page` route.
Here's the full function anyway though. 

```js
////  SECTION 4: Boot
//  Load page from API, then render buffer
function load_page() {
  const http = new XMLHttpRequest();
  http.open('GET', `/api/SSR-page?route=${page_route}&session_id=${_session_id}`);
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



<h3 id="b-4"> ☑️ Step 4:   ☞ Test the code!  </h3>

Restart the server.  

Save a component with the name `profile-card` following HTML content:

```html
<div class="profile-card">
  {{ name }}
</div>
<style>
  .profile-card {
    border-radius: 5px;
    padding: 5px;
    background: #432D21;
    width: 100px;
    text-align: center;
  }
</style>
```

(We haven't made the editor yet, so either create a new one or edit `table_rows/components.json`.)

Now create a new page, using this component twice:

```html
<h1>Component test!</h1>
<div>Below should be two components:</div>
<profile-card></profile-card/>
<div>Here's the second:</div>
<profile-card/>
<div>Did that work?</div>
```

Open up that page. It should render. 

<br/><br/><br/><br/>



<h3 id="b-5">☑️ Step 5. ❖ Part B review. </h3>

The complete code for Part B is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version3.0/part_B).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-c" align="center">  Part C:  Component editing and preview </h2>

In this section, we'll create an editor for components.

<br/><br/><br/><br/>


<h3 id="c-1">  ☑️ Step 1: Add a file <code>cms/components/edit-component.html</code>  </h3>

Add a file <code>cms/components/edit-component.html</code>. It will be pretty similar to the page editor.

```html
<div class="p-3 center-column" id="loading-component">
  Loading component...
</div>

<div class="p-3 center-column" id="dynamic-component">
  <div class="flex-row">
    <div style="width:40%;">Route: / <input id="component-route" type="text" value="" oninput="update_componentRoute()" tabindex="1" /></div>
    <div style="display: flex; align-items: center;">Public? <input id="is-public" type="checkbox" onclick="toggle_publicity()" tabindex="2"/></div>
  </div>
  <div class="flex-row">
    <input id="component-title" type="text" value="" oninput="update_componentTitle()" tabindex="3">
    <button onclick="cancel()">Cancel</button>
    <button id="save" onclick="save()" tabindex="6">Save</button>
  </div>
  <div id="error"></div>

  <textarea id="component-buffer" spellcheck="false" oninput="update_buffer(event.currentTarget.value)" onscroll="sync_scroll(this);" tabindex="5"></textarea>
  <pre id="highlighting" aria-hidden="true"><code id="highlighting-content"></code></pre>
    
  <br/><br/>
  <button onclick="render_preview()">Preview</button>
  <button style="margin-left:20px;" onclick="window.location.href = `/${component_route}`">Go to Component</button>
  <br/><br/><br/><hr/><br/><br/>
  <button style="background: var(--red);" onclick="delete_component()">Delete Component</button>
</div>

<div class="p-3 center-column" id="preview-component">
  <button onclick="back_to_editor()">Edit</button><br/><hr/><br/>
  <div id="preview-content"></div>
</div>

<script src="/pages/cms/convert-markup.js"></script>
<script>

////  SECTION 1: Component memory
let component_route = _current_page.slice(16, _current_page.length);
let buffer_data = {};
let component_data = {};
let is_saved = true;

////  SECTION 2: Render

//  Renders the text editor, final component, or "component does not exist" message.
function render_component() {
  document.getElementById('component-route').value = buffer_data.route;
  document.getElementById('is-public').checked = buffer_data.is_public;
  document.getElementById('component-title').value = buffer_data.title;
  document.getElementById('component-buffer').value = buffer_data.content;

  document.getElementById('highlighting-content').innerHTML = create_highlighting(buffer_data.content);
  check_if_saved();
}

function render_preview() {
  document.getElementById('dynamic-component').style.display = `none`;
  document.getElementById('preview-component').style.display = 'block';
  document.getElementById('preview-content').innerHTML = validate_html(buffer_data.content);
}

function back_to_editor() {
  document.getElementById('dynamic-component').style.display = `block`;
  document.getElementById('preview-component').style.display = 'none';
  render_component();
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

//  Fired in render_component() and in any buffer editing function
function check_if_saved() {
  is_saved = (buffer_data.content == component_data.content) && (buffer_data.title == component_data.title) 
    && (buffer_data.is_public == component_data.is_public) && (buffer_data.route == component_data.route);
  if (!is_saved) {
    addEventListener("beforeunload", beforeUnloadListener, { capture: true });
    document.getElementById('save').classList.remove('inactive');
  } else {
    removeEventListener("beforeunload", beforeUnloadListener, { capture: true, });
    document.getElementById('save').classList.add('inactive');
  }
}

//  Fires when new component content is typed.
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

//  Fires when the component title is changed. 
function update_componentTitle() {
  buffer_data.title = document.getElementById('component-title').value;
  check_if_saved();
}

function update_componentRoute() {
  buffer_data.route = document.getElementById('component-route').value;
  check_if_saved();
}

function toggle_publicity() {
  buffer_data.is_public = !buffer_data.is_public;
  render_component();
}

//  Fires when "Save component changes" is clicked.
function save() {
  console.log("saving...")
  const http = new XMLHttpRequest();
  http.open('POST', '/api/update-component');
  http.send(JSON.stringify({ 
    id: component_data.id,
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
        console.log("Response recieved! Component updated.");
        component_data.content = buffer_data.content;
        component_data.title = buffer_data.title;
        component_data.route = buffer_data.route;
        component_data.is_public = buffer_data.is_public;
        render_component();
        if (_current_page.split('/edit-component/')[1] != buffer_data.route) {
          window.location.href = '/edit-component/' + buffer_data.route;
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
    window.location.href = '/edit-component/' + component_route;
  }
}

//  Fired when the delete component button is clicked
function delete_component() {
  if (!confirm(`Are you sure you want to permanently delete /${component_route}?`)) {
    return;
  }
  const http = new XMLHttpRequest();
  http.open('POST', '/api/delete-component');
  http.send(JSON.stringify({ 
    id: component_data.id,
    session_id: _session_id
  }));
  http.onreadystatechange = (e) => {
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        document.getElementById('error').innerHTML = "Component deleted.  Redirecting you...";
        window.location.href = '/';
      } else {
        console.warn(response.msg);
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}

////  SECTION 4: Boot
//  Load all component elements from API, then render buffer
function load_component() {

  const http = new XMLHttpRequest();
  http.open('GET', `/api/component?route=${component_route}&session_id=${_session_id}`);
  http.send();
  console.log('Requesting component')
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      document.getElementById('loading-component').style.display = 'none';
      document.getElementById('dynamic-component').style.display = 'block';
      if (!response.error) {
        console.log("Response recieved! Loading component.");
        component_data = response.data;
        if (component_data.created_by != _current_user.id) {
          document.getElementById('dynamic-component').innerHTML = "You don't have permission to edit this component.";
          return;
        }
        buffer_data.content = component_data.content || "";
        buffer_data.title = component_data.title || "";
        buffer_data.route = component_data.route;
        buffer_data.is_public = component_data.is_public;
        render_component();
      } else {
        document.getElementById('dynamic-component').innerHTML = response.msg;
      }
    }
  }
}
current_user_loaded = function() {
  load_component();
}

</script>

<style> 
  #dynamic-component {
    position: relative;
    padding: 40px 0px;
    display: none;
  }

  #preview-component {
    display: none;
  }

  #dynamic-component input:not([type='checkbox']) {
    font-family: CrimsonText;
    width: 60%;
  }

  input#component-route {
    font-size: 1em;
  }

  input#component-title {
    margin: 0.67em 0px;
    padding: 0px;
    font-size: 2em;
  }
  
  /*  Component buffer + highlighter */
  #component-buffer, #highlighting {
    height: 60vh;
    width: 100%;
    margin: 0px;
    padding: 5px;
    box-sizing: border-box;
    overflow-y: scroll;
    
  }
  #component-buffer {
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

  #dynamic-component button {
    width: 15%;
  }

  #dynamic-component button#save {
    background: #3A7B64;
  }
  .inactive {
    opacity: 0.5;
  }

</style>
```

<br/><br/><br/><br/>



<h3 id="c-2"> ☑️ Step 2:   Edit `server/server.js`  </h3>

We'll make 4 edits to `server.server.js`: 
 1. Add the page route `/edit-component/{component-name}`
 2. Add the GET api route `/api/component`
 3. Add the POST api route `/api/update-component`
 4. Add the POST api route `/api/delete-component`

So, first, edit the function `respond_with_a_page()`:
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
  } else if (url.substring(0, 16) == '/edit-component/') {
    page_content = fs.readFileSync(__dirname + '/../pages/cms/components/edit-component.html');
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

Second, right after `GET_routes['/api/all-files']` but before `GET_routes['/api/all-components']`, add `GET_routes['/api/component']`:

```js
GET_routes['/api/component'] = function(req_data, res) {
  let response = { error: false };
  let comp_data = DataBase.table('components').find({ route: req_data.route });
  let session_data = DataBase.table('sessions').find({ id: req_data.session_id });
  if (comp_data.length < 1) {
    response.error = true;
    response.msg = `The component ${req_data.route} was not found.`;
  } else if (comp_data[0].is_public || (session_data.length > 0 && comp_data[0].created_by == session_data[0].user_id)) {
    response.data =  comp_data[0];
  } else {
    response.error = true;
    response.msg = `You don't have permission to view this component.`;
  }
  api_response(res, 200, JSON.stringify(response));
```

Third, right after `POST_routes['/api/create-component']`, add `POST_routes['/api/update-component']`:
```js
POST_routes['/api/update-component'] = function(component_update, res) {
  let response = { error: false };
  let component_data = DataBase.table('components').find({ id: component_update.id });
  let session_data = DataBase.table('sessions').find({ id: component_update.session_id });
  if (component_data[0].created_by != session_data[0].user_id) {
    response.error = true;
    response.msg = `You don't have permission to update this component.`;
  }
  if (!response.error) {
    response = DataBase.table('components').update(component_update.id, component_update);
  }
  api_response(res, 200, JSON.stringify(response));
}
```

Fourth and finally, right after `POST_routes['/api/update-component']`, add `POST_routes['/api/delete-component']`:
```js
POST_routes['/api/delete-component'] = function(request_info, res) {
  let component_data = DataBase.table('components').find({ id: request_info.id });
  let session_data = DataBase.table('sessions').find({ id: request_info.session_id });
  let response = {
    error: false,
    msg: '',
  }
  if (component_data.length < 1) {
    response.error = true;
    response.msg = 'No component found.';
  } else if  (component_data[0].created_by != session_data[0].user_id) {
    response.error = true;
    response.msg = `You don't have permission to delete this component.`;
  } else {
    response.msg = DataBase.table('components').delete(request_info.id);
  }
  return api_response(res, 200, JSON.stringify(response));
}
```

Phew! 

<br/><br/><br/><br/>


<h3 id="c-3">  ☑️ Step 3: ☞ Test the code!  </h3>

Restart the server! Go to `/components`, and try to edit a component. 

Editing the route should redirect you. 

<br/><br/><br/><br/>



<h3 id="c-4">☑️ Step 4. ❖ Part C review. </h3>

The complete code for Part C is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version3.0/part_C).

<br/><br/><br/><br/>
<br/><br/><br/><br/>


<h2 id="part-d" align="center">  Part D:  Live testing </h2>

At this point, there are enough features on the website to test with real users.  
Testing the features we've made so far will point out issues that need fixed, and motivate further dev.

<br/><br/><br/><br/>



<h3 id="d-1">  ☑️ Step 1: ☞ Test the code!  </h3>

Host the website at a url, using the steps described in [V1.0. part G](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-g).

Every day, create a journal entry, tagged `journal`. Try to create other types of pages, and components too. 

When you encounter a bug, or want an extra feature, feel free to add it. If you're worried about your edits messing up your journal entries, make sure you back up your code, as described in [V2.0 part F](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-f).

<br/><br/><br/><br/>



<h3 id="d-2">☑️ Step 2. ❖ Part D review. </h3>

Hopefully you feel that the tutorial has been worth it so far! :) 🌺

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="v3" align="center">  Version 4: ??? </h2>

With this section complete, you're ready to move on to the tutorial for [version 4.0](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version4.0/tutorial.md)!

<br/><br/><br/><br/><br/><br/><br/><br/>



