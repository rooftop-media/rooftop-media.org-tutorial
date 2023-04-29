# NodeJS Tutorial for rooftop-media.org, version 2.0

This is a tutorial for building rooftop-media.org version 2.0.  
This version creates an email client, for writing, sending, recieving, and reading emails!  

Users will also be able to create email accounts on our website.
This can be done when registering an account, or by adding an email to an existing account.  
Accounts may also have a non-rooftop backup email address.  

*Total estimated time for this tutorial: ADD ESTIMATED TIME*

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Prerequisites

This tutorial requires that you've completed [version 1.0](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md).  
In the future, it will require later version.  (This is a bit out of order). 

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Table of Contents

Click a part title to jump down to it, in this file.

| Tutorial Parts              | Est. Time | # of Steps |
| --------------------------- | ------ | ---------- |
| [Part A - Email address set up](#part-a) | ? min. | ? |
| [Part B - /email](#part-b) | 0 min. | 0 |
| [Part C - Sending email](#part-c) | 0 min. | 0 |
| [Part D - Recieving email](#part-d) | 0 min. | 0 |
| [Part E - Search emails](#part-e) | 0 min. | 0 |
| [Part F - Folders and drafts](#part-f) | 0 min. | 0 |
| [Part G - Spam](#part-g) | 0 min. | 0 |
| [Part H - HTML Emails](#part-h) | 0 min. | 0 |
| [Version 5.0.](#v5) | Todo | ? |



<br/><br/><br/><br/><br/><br/><br/><br/>





<h2 id="part-a" align="center">  Part A:  Email address set up</h2>



<br/><br/><br/><br/>



<h3 id="a-1">  ☑️ Step 1: Add <code>/pages/email/add-address.html</code>  </h3>

First, we'll let the user create an email account on rooftop-media.org.  
We'll store this email in a new database table, called "email-addresses".  

Create a new folder called `/pages/email`, and add the file `/pages/email/add-address.html`. 

```html
<div class="p-3 center-column" id="email">
  <h2>Create a new email address</h2>
  <p>Looks like you don't have a <b>rooftop-media.org</b> email address yet. </p>
  <div><input type="text" tabindex="6" id="new_address"/>@rooftop-media.org</div>
  <p>Your email address cannot be changed once created!</p>
  <p id="error"></p>

  <br/>
  <button onclick="create_address()">Create email address</button>

</div>

<script>

const utility_keys = [8, 9, 39, 37, 224]; // backspace, tab, command, arrow keys

//  Validate address
const new_address_input = document.getElementById('new_address');
const new_address_regex = /^[a-z0-9_]*$/;
var new_address_val = new_address_input.value;
new_address_input.addEventListener("keydown", event => {
  new_address_val = new_address_input.value;
  if (!new_address_regex.test(event.key) && !utility_keys.includes(event.keyCode)) {
    document.getElementById('error').innerHTML = "Email must contain only letters, numbers, and _.";
    event.preventDefault();
  } else {
    document.getElementById('error').innerHTML = "";
  }
});


function create_address() {
  const new_address = document.getElementById('new_address').value;

  if (new_address.length < 2) {
    document.getElementById('error').innerHTML = "Email address must be at least 2 characters.";
  }

  const http = new XMLHttpRequest();
  http.open('POST', '/api/add-address');
  http.send(JSON.stringify({
    username: _current_user.username,
    address: new_address
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Address created!");
        _current_user.rooftop_email = response.address;
        window.location.href = '/email';
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  } // end http callback
}
</script>

<style>
  #error {
    color: red;
  }
</style>
```

<br/><br/><br/><br/>



<h3 id="a-2">  ☑️ Step 2: Adding <code>/add-address.html</code> to the server </h3>

In `/server/server.js`, edit this:

```html
//  Mapping URLs to pages
var pageURLs = {
  '/': '/pages/misc/landing.html',
  '/landing': '/pages/misc/landing.html',
  '/register': '/pages/misc/register.html',
  '/login': '/pages/misc/login.html',
  '/profile': '/pages/misc/profile.html',
  '/add-address': '/pages/email/add-address.html'
}
var pageURLkeys = Object.keys(pageURLs);
```

<br/><br/><br/><br/>



<h3 id="a-3">  ☑️ Step 3: Add api POST route, <code>/api/add-address</code> </h3>

In `server.js`, update this:  

```js
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
      '/api/check-invite-code': POST_check_invite_code,
      '/api/add-address': POST_add_address
    }
    
    //  Calling the API route's function
    api_map[url](req_data, res);
  })
}
```

And then in the same file, _below_ `POST_update_password`, add this function: 

```
function POST_add_address(new_address, res) {
  let addresses = fs.readFileSync(__dirname + '/database/table_rows/email_addresses.json', 'utf8');
  addresses = JSON.parse(addresses);
  let response = {
    error: false,
    msg: '',
    rooftop_email: new_address.address
  }
  for (let i = 0; i < addresses.length; i++) {
    if (addresses[i].address == new_address.address) {
      response.error = true;
      response.msg = 'Email address already taken.';
      break;
    } else if (addresses[i].user_id == new_address.user_id) {
      response.error = true;
      response.msg = 'User already has an address.';
      break;
    } 
  }

  if (!response.error) {
    let address_id = DataBase.table('email_addresses').insert(new_address);
  }
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(JSON.stringify(response));
  res.end();
}
```

<br/><br/><br/><br/>



<h3 id="a-4">  ☑️ Step 4: Add a new table to the database</h3>

Create a file called `/server/database/table_columns/email-addresses.json`.  Add the following:

```json
{
  "name": "Email addresses",
  "snakecase": "email_addresses",
  "max_id": 0,
  "columns": [
    {
      "name": "Id",
      "snakecase": "id",
      "unique": true
    },
    {
      "name": "User id",
      "snakecase": "user_id",
      "unique": true
    },
    {
      "name": "Address",
      "snakecase": "display_name",
      "unique": true
    }
  ]
}
```

Create a file called `/server/database/table_rowss/email-addresses.json`.  Add an empty array:

```json
[]
```

<br/><br/><br/><br/>





<h3 id="a-5"> ☑️ Step 5. ☞  Test the code!  </h3>

Restart the server, and open up `localhost:8080/add-address`. Make sure you're logged in.  
Try adding a new address.  It should create a new email address record in the database, and redirect you to `/email`.  

Now try adding another email address with the same user -- you should get an error.  
Try adding the same address name for another error.  

<br/><br/><br/><br/>



<h3 id="a-6">☑️ Step 6. ❖ Part A review. </h3>

The complete code for Part A is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version4.0/part_A).

<br/><br/><br/><br/>
<br/><br/><br/><br/>




<h2 id="part-b" align="center">  Part B:  <code>/email</code></h2>

In this part, we'll build a webapp page for browsing, reading, and writing emails. 

<br/><br/><br/><br/>



<h3 id="b-1">☑️ Step 1. Create <code>email.html</code> </h3>

First, we'll set up a page that can browse a list of emails, read individual emails, and compose new emails.  
This page will have sample data for now, not connected to any email server.  
I wrote this page one feature at a time (list, then compose, then read).

<!--  TODO:  Email read -->
<!--  TODO:  Mobile version -->
Here's the entire code for `/pages/email/email.html`:

```html
<div class="p-3 center-column display-flex position-relative" id="email">
  <div id="mail-sidebar">
    <h1>Mail</h1>
    <button id="compose" onclick="composing=true;render_composer()">Compose</button>
    <br/>
    <ul>
      <li>Inbox</li>
      <li>Sent</li>
      <li>Starred</li>
      <li>Spam</li>
      <li>Drafts</li>
      <li>Archive</li>
      <br/><hr /><br/>
      <li>Settings</li>
    </ul>
  </div>
  <div id="mail-display">
    <input type="text" placeholder="Search" id="searchbar" />
    <br/>
    <hr/>
    <div id="top-row">
      <input type="checkbox" />
    </div>
    <hr/>
    <!--  Email rows go here -->
  </div>
  <div id="composer">
    <div id="composer-title">New email<span onclick="close_composer();">x</span></div>
    <div id="composer-to"><input placeholder="To" /></div>
    <div id="composer-subject"><input placeholder="Subject" /></div>
    <div id="composer-body"><textarea></textarea></div>
    <div><button id="send" onclick="send()">Send</button></div>
  </div>
</div>

<script>

let composing = false;
let emails = [{
  subject: "Hello world!",
  text: "This is a test email...",
  date: "April 10th"
}, {
  subject: "Welcome",
  text: "Welcome to rooftop!",
  date: "April 13th"
}, {
  subject: "Third email",
  text: "Testing, testing",
  date: "April 13th"
}]


function render() {
  let emailDisplay = document.getElementById('mail-display');
  emailDisplay.innerHTML = `<input type="text" placeholder="Search" id="searchbar" /><br/><hr/>`;
  emailDisplay.innerHTML += `<div id="top-row"><input type="checkbox" /></div><hr/>`;
  for (let i = 0; i < emails.length; i++) {
    emailDisplay.innerHTML += `<div class="row">
      <input type="checkbox" />
      <!-- <img src="star.png" /> -->
      <div class="email-subject">${emails[i].subject}</div>
      <div class="email-peek">${emails[i].text}</div>
      <div class="email-date">${emails[i].date}</div>
    </div>
    <hr/>`;
  }
  render_composer();
}
function render_composer() {
  if (!composing) {
    document.getElementById('composer').style.display = 'none';
  } else {
    document.getElementById('composer').style.display = 'block';
  }
}

render();

function close_composer() {
  composing = false;
  render_composer();
}

function send() {
  let email = {
    to: document.getElementById('composer-to').children[0].value,
    subject: document.getElementById('composer-subject').children[0].value,
    body: document.getElementById('composer-body').children[0].value
  }
  console.log(email);
}

</script>

<style>
  #email {
    min-height: calc(100vh - 100px);
  }
  .display-flex {
    display: flex;
  }
  .position-relative {
    position: relative;
  }

  /** sidebar  **/
  #mail-sidebar {
    flex-grow: .3;
  }
  #compose {
    background: #BFDAFF;
    color: #666;
    padding: 10px 20px;
    border-radius: 25px;
    border: none;
    font-size: 1em;
    cursor: pointer;
  }
  #mail-sidebar ul {
    padding-left: 10px;
  }
  #mail-sidebar li {
    list-style-type: none;
    cursor: pointer;
    margin-bottom: 10px;
    color: #aaa;
  }
  #mail-sidebar hr {
    color: #eee;
    margin: 0px;
    border-width: .5px;
  }

  /**  Mail display  */
  #mail-display {
    margin-top: 1.3em;
    flex-grow: .7;
    font-family: sans-serif;
  }
  #mail-display hr {
    color: #eee;
    margin: 0px;
    border-width: .5px;
  }
  #searchbar {
    width: 100%;
    display: block;
    padding: 10px;
    box-sizing: border-box;
  }
  input[type=checkbox] {
    width: 25px;
    height: 25px;
    cursor: pointer;
  }

  #top-row {
    padding: .5em 0px;
    display: flex;
  }

  .row {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: .5em 0px;
  }
  .row:hover {
    box-shadow: 0px 0px 2px rgba(0,0,0,.5);
  }
  .row input[type=checkbox] {
    opacity: .7;
  }
  .row:hover input[type=checkbox] {
    opacity: 1;
  }
  .email-subject {
    padding-left: 10px;
    box-sizing: border-box;
    width: 30%;
  }
  .email-peek {
    width: 50%;
    color: #aaa;
  }
  .email-date {
    width: 20%;
    font-size: .75em;
    color: #aaa;
  }


  /* Mail composer  */
  #composer {
    position: absolute;
    bottom: 0px;
    right: 20px;
    min-width: 300px;
    min-height: 300px;
    width: 400px;
    height: 400px;
    background: white;
    box-shadow: 0px 0px 5px rgba(0,0,0,.5);
  }
  #composer div {
    padding: 5px 10px;
    box-sizing: border-box;
  }
  #composer-title {
    background: #eee;
    display: flex;
    justify-content: space-between;
  }
  #composer-title span {
    cursor: pointer;
  }
  #composer div input, #composer div textarea {
    width: calc(100% - 5px);
    border: none;
  }
  #send {
    background: #BFDAFF;
    padding: 5px 10px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }

</style>
```

<br/><br/><br/><br/>



<h3 id="b-2">☑️ Step 2. Add the page to <code>server.js</code></h3>

In `/server/server.js`: 

```js
//  Mapping URLs to pages
var pageURLs = {
  '/': '/pages/misc/landing.html',
  '/landing': '/pages/misc/landing.html',
  '/register': '/pages/misc/register.html',
  '/login': '/pages/misc/login.html',
  '/profile': '/pages/misc/profile.html',
  '/add-address': '/pages/email/add-address.html',
  '/email': '/pages/email/email.html'
}
var pageURLkeys = Object.keys(pageURLs);
```

<br/><br/><br/><br/>



<h3 id="b-3">☑️ Step 3. Add a link to the email page</h3>

Open `/pages/index.js` and add one line to the `update_header` function:

```js
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
    menuHTML += `<a href="/email">Email</a>`;
    menuHTML += `<button onclick="toggle_darkmode()"> &#x1F317; </button>`;
    menuHTML += `<button onclick="logout()">Log out</button>`;
  }

  userButtonsEl.innerHTML = `<button onclick="_show_user_menu = !_show_user_menu;update_header();">${buttonText}</button>`;
  if (_show_user_menu) {
    userButtonsEl.innerHTML += menuHTML + `</div>`;
  }

}
```

<br/><br/><br/><br/>



<h3 id="b-4"> ☑️ Step 5. ☞  Test the code!  </h3>

The website should now have a link to the email page.  
Click it tocheck out the email webapp interface.

<br/><br/><br/><br/>



<h3 id="b-6">☑️ Step 6. ❖ Part B review. </h3>

The complete code for Part B is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_B).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-c" align="center">  Part C:  Sending email</h2>

In this part, we'll let the user send emails from their email address. 

<br/><br/><br/><br/>



<h3 id="c-1">☑️ Step 1. Edit <code>email.html</code></h3>

In `email.html`, edit the `send()` function: 

```js
function send() {
  let email = {
    to: document.getElementById('composer-to').children[0].value,
    subject: document.getElementById('composer-subject').children[0].value,
    body: document.getElementById('composer-body').children[0].value
  }
  const http = new XMLHttpRequest();
  http.open('POST', '/api/send-email');
  http.send(JSON.stringify(email));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Email address sent!");
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  } // end http callback
}
```

<br/><br/><br/><br/>



<h3 id="c-2">☑️ Step 2. Add <code>/api/send-email</code></h3>

In `server.js`, we're going to edit three things.  
First edit the imports.  
We'll use the `net` library to implement the SMTP protocol, to send emails.  

```js
//  Importing NodeJS libraries.
var http   = require('http');     // listen to HTTP requests
var path   = require('path');     // manage filepath names
var fs     = require('fs');       // access files on the server
var crypto = require('crypto');   // encrypt user passwords
var net    = require('net');      // create TCP servers (for email)
```

Next, add `'/api/send-email'` to `api_POST_routes`:

```js
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
      '/api/check-invite-code': POST_check_invite_code,
      '/api/add-address': POST_add_address,
      '/api/send-email': POST_send_email
    }
    
    //  Calling the API route's function
    api_map[url](req_data, res);
  })
}
```

Finally, create the `POST_send_email` function:

```js

```

<br/><br/><br/><br/>



<h3 id="c-??">☑️ Step ?. ❖ Part C review. </h3>

The complete code for Part C is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_C).

<br/><br/><br/><br/>
<br/><br/><br/><br/>










