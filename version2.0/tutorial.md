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
| [Part C - Recieving & displaying email](#part-c) | 0 min. | 0 |
| [Part D - Sending email](#part-d) | 0 min. | 0 |
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
    } else if (url == '/api/check-invite-code') {
      POST_check_invite_code(req_data, res);
    } else if (url == '/api/add-address') {
      POST_add_address(req_data, res);
    }
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



<h3 id="b-??">☑️ Step ??. ❖ Part B review. </h3>

The complete code for Part A is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_A).

<br/><br/><br/><br/>
<br/><br/><br/><br/>













