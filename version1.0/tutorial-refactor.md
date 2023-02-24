# NodeJS Tutorial for rooftop-media.org, version 1.0

This is a tutorial for building rooftop-media.org version 1.0.  
This version creates a website with a few static pages, and user management.  

*Total estimated time for this tutorial: ADD ESTIMATED TIME*

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Prerequisites

This tutorial requires that you've completed the [initial set up steps](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/setup.md).

<br/><br/><br/><br/><br/><br/><br/><br/>



##  Table of Contents

Click a part title to jump down to it, in this file.

| Tutorial Parts              | Est. Time | # of Steps |
| --------------------------- | ------ | ---------- |
| [Part A - Bundle & serve pages](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-a) | 17 min. | 19 |
| [Part B - Database set up](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-b) | 0 min. | 0 |
| [Part C - API and user auth](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-c) | 0 min.  | 0 |
| [Part D - Unit testing](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-d) | 0 min. | 0 |
| [Part E - Email confirmation](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-e) | 0 min. | 0 |
| [Part F - Phone confirmation](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-f) | 0 min. | 0 |
| [Part G - Password reset](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-g) | 0 min. | 0 |
| [Part H - User settings](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-h) | 0 min. | 0 |
| [Version 2.0.](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#v2) | Todo | ? |
 

<br/><br/><br/><br/><br/><br/><br/><br/>





<h2 id="part-a" align="center">  Part A:  Bundle & serve pages </h2>

The steps in Part A will culminate in us serving a website with static pages, including:
  - a landing page
  - a register page
  - a login page

Along the way, we’ll do several things.  
We'll create a webserver that can serve up assets. This NodeJS-only server set up is based on the [MDN docs](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework).
We'll bundle the pages of our website into one convenient file,  
We'll have the bundled pages load in the *single page app* pattern, avoiding complete page reloads,  
And, we'll make sure our web pages are handicap accessible.  


*Estimated time: ~17 minutes*

<br/><br/><br/><br/>



<h3 id="a-1">  ☑️ Step 1:  Create a homepage at <code>/pages/index.html</code> </h3>

Create a new folder in the `/rooftop-media.org/` folder, called `/pages/`.  
This is where we'll put the code for our website's pages. 

Inside the new folder, make a file called `index.html`.  

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>&#x2756;  Rooftop Media &#x2756;</title>
    <meta charset="utf-8">
  </head>
  <body>
    <div id="header">
      
    </div>
    <div id="content">
      <h1>Welcome!</h1>
    </div>
  </body>
</html>

```

In the `<head>` tag, we describe the page's title, and the character encoding for the page.  
In the `<body>`, we've added a divider that will become our header, and some text as the page's content.  

Open the html file in a browser to make sure it shows the content correctly.

<br/><br/><br/><br/>



<h3 id="a-2">  ☑️ Step 2.  Outlining <code>server.js</code> </h3>

Let’s go into `server.js` and add some comments to plan our architecture.

Delete the line of code, which was `console.log('Starting the rooftop-media.org server!');`.
We’ll outline 4 sections. Here’s what we’ll write:

```javascript

////  SECTION 1: Imports.

////  SECTION 2: Request response.

////  SECTION 3: API.

////  SECTION 4: Boot.

```

We’ll reference these 4 sections throughout the rest of this version.

<br/><br/><br/><br/>



<h3 id="a-3">  ☑️ Step 3.  Imports in <code>server.js</code> </h3>

We’ll import three standard libraries from NodeJS. 

```javascript
////  SECTION 1: Imports.

//  Importing NodeJS libraries.
var http = require('http');  // listen to HTTP requests
var path = require('path');  // manage filepath names
var fs   = require('fs');    // access files on the server
```

<br/><br/><br/><br/>



<h3 id="a-4">  ☑️ Step 4.  Basic  request response in <code>server.js</code> </h3>

Now, we'll set up a function to respond to http requests.  

```javascript
////  SECTION 2: Request response.

//  This function will fire upon every request to our server.
function server_request(req, res) {
  var url = req.url;
  console.log(`\x1b[36m >\x1b[0m New ${req.method} request: \x1b[34m${url}\x1b[0m`);

  res.writeHead(200, {'Content-Type': 'text/html'});
  var main_page = fs.readFileSync(__dirname + '/../pages/index.html');
  res.write(main_page);
  res.end();

}
```

This will respond to all requests with the HTML of our page, `index.html`.  
This is a simple, temporary solution.

*Note that the strange parts of text in that console.log statement (\x1b[36m, for example) are ANSI codes, for coloring terminal text!*

<br/><br/><br/><br/>



<h3 id="a-5">  ☑️ Step 5.  Boot sequence for <code>server.js</code> </h3>

Here's a function that will run when the server is first started.  
It listens for HTTP requests, and calls our `server_request` function when they happen.  
It also logs a message when the program starts, and when it finishes.
```javascript
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
```

<br/><br/><br/><br/>



<h3 id="a-6"> ☑️ Step 6. ☞  Test the code!  </h3>

In the `/server/` folder, run `node server.js` to start the server.  
You should see the boot message appear in your terminal.  

Now, open a browser and go to `localhost:8080`.  
You should see `index.html` rendered on the page!  

Finally, back in the terminal, stop the server by pressing `ctrl-c`.  
You should see the exit message. 

<br/><br/><br/><br/>



<h3 id="a-7">  ☑️ Step 7:  Add image and font assets to <code>/assets/</code> </h3>

Up next, we're going to make sure our server properly loads non-HTML assets, like images, fonts, and other files. 

In `/rooftop-media.org/`, create a folder called `/assets/`, and add the following files:

`/assets`
 - [`/favicons`](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_A/assets/favicons)
   - `/apple-touch-icon.png`
   - `/favicon-16x16.png`
   - `/favicon-32x32.png`
   - `/site.webmanifest`
 - [`/fonts`](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_A/assets/fonts)
   - `/CrimsonText-Regular.ttf`
 - [`/logo.png`](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/part_A/assets/logo.png)

I made the logo in a vector image editor (Affinity Designer).  
I generated the favicons by uploading the logo to a [favicon generator](https://favicon.io/) website.  
I downloaded the font from [Google Fonts](https://fonts.google.com/specimen/Crimson+Text/about) -- after checking the license to make sure I could use it!

<br/><br/><br/><br/>



<h3 id="a-8">  ☑️ Step 8:  Add <code>index.js</code>, <code>index.css</code>, and <code>misc/404.html</code> to <code>/pages/</code> </h3>

Next, we'll add two files to our `/pages/` directory.

First, create `/pages/index.css`, and add this:
```css
@font-face {
  font-family: CrimsonText;
  src: url(/assets/fonts/CrimsonText-Regular.ttf);
}

html, body {
    font-family: CrimsonText;
    margin: 0;
}

/* The header, including the RTM logo and user profile button  */
#header {
    width:           100%;
    height:          105px;
    background:      #efefef;
    box-shadow:      0px 0px 10px rgba(0,0,0,.5);
    padding:         10px 25px;
    box-sizing:      border-box;
    z-index:         10;
    position:        relative;
}

#logo {
    width:           100px;
    margin-top:      15px;
    margin-bottom:   25px;
}
```

Then, create `/pages/index.js`, and add this:
```javascript
console.log("Welcome to Rooftop Media Dot Org!");
```

Finally, create a new folder in `/pages` called `/misc`, create a file `/pages/misc/404.html` and add this:
```html
<h1>404 - page not found!</h1>
```

<br/><br/><br/><br/>



<h3 id="a-9">  ☑️ Step 9:  Add external files to <code>/pages/index.html</code> </h3>

Now, we'll edit `index.html` again, to use those other files.  
We'll add an image, a favicon, a CSS file, and a JS file. 

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>&#x2756;  Rooftop Media &#x2756;</title>
    <meta charset="utf-8">

    <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/favicon-16x16.png">
    <link rel="manifest" href="/assets/favicons/site.webmanifest">
    
    <link rel="stylesheet" href="/pages/index.css">
    <script src="/pages/index.js"></script>
  </head>
  <body>
    <div id="header">
      <img id="logo" src="/assets/logo.png" alt="Rooftop Media's logo!">
    </div>
    <div id="content">
      <h1>Welcome!</h1>
    </div>
  </body>
</html>
```

Opening the file won't load our new assets properly, becauuse we didn't use relative file paths.  
Running the server also won't load our new assets properly *yet*.  We'll set that up next. 


<br/><br/><br/><br/>



<h3 id="a-10">  ☑️ Step 10:  Editing the request response in <code>/server/server.js</code> </h3>

In our request response section, we'll add a dictionary of [mime types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_Types).  
Then, in our response function, we'll respond with index.html, an asset, or the 404 page.

```javascript
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

//  This function will fire upon every request to our server.
function server_request(req, res) {
  var url = req.url;
  console.log(`\x1b[36m >\x1b[0m New ${req.method} request: \x1b[34m${url}\x1b[0m`);
  var extname = String(path.extname(url)).toLowerCase();

  if (extname.length == 0) {                   /*  No extension? Respond with index.html.  */
    respond_with_website(res, url);
  } else {    /*  Extension, like .png, .css, .js, etc? If found, respond with the asset.  */
    respond_with_asset(res, url, extname);
  }

}

function respond_with_website(res, url) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var main_page = fs.readFileSync(__dirname + '/../pages/index.html');
  res.write(main_page);
  res.end();
}

function respond_with_asset(res, url, extname) {
  fs.readFile( __dirname + '/..' + url, function(error, content) {
    if (error) {
        if(error.code == 'ENOENT') {
          fs.readFile('./404.html', function(error, content) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          });
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

```

<br/><br/><br/><br/>



<h3 id="a-11"> ☑️ Step 11. ☞  Test the code!  </h3>

In the `/server/` folder, run `node server.js` to start the server, and then open `localhost:8080`.  

Our page should now be loaded with the logo .png, a favicon, and css styling!  
Open the developer console -- the javascript script should have logged our welcome message there.  

In the developer tools side bar, the "networking" section should have info about all the files we recieved. 

We can also test what happens when we request a file that doesn't exist.  
In `/pages/index.html` change the img tag's source to: 
`<img id="logo" src="/assets/notlogo.png" alt="Rooftop Media's logo!">`  
Reload the website.  The logo should be missing, and in our networking tab, we should see the 404.html file loaded.  
Change the logo source back to the correct value before moving on. 

<br/><br/><br/><br/>



<h3 id="a-12"> ☑️ Step 12. Adding pages to <code>/pages</code>  </h3>

We're going to add three pages to our website.  

Create a new file, `/pages/misc/landing.html`.  
This page will load an image.  

```html
<div class="px-3">
  <img id="logo" src="/assets/logo.png" alt="Rooftop Media's logo!">
  <h2>Rooftop Media landing page</h2>
  <p>We'll highlight some content here.</p>
</div>
```

Create a new file, `/pages/misc/register.html`.  
This page will load a JS script. 

```html
<div class="px-3">
  <h3>Register</h3>
  <div>Username: <input type="text" id="username" placeholder="mickeymouse"/></div>
  <div>Display name: <input type="text" id="display_name" placeholder="mickeymouse"/></div>
  <div>Email: <input type="text" id="email" placeholder="mickey@mouse.org"/></div>
  <div>Phone #: <input type="text" id="phone" placeholder="555-555-5555"/></div>
  <div>Password: <input type="password" id="password"/></div>
  <div>Confirm password: <input type="password" id="confirm_password"/></div>
  <p id="error"></p>
  <button onclick="register()">Register</button>
</div>
<script>
 console.log("Welcome to /register!");
 const username_input = document.getElementById('username');
 username_input.addEventListener("keydown", event => {
   console.log("Typing new key to the register username input, with keycode: " + event.keyCode);
 });
 function register() {
   console.log("Registering user!");
 }
</script>
```

Create another new file, `/pages/misc/login.html`.  
This file will have a different script.  
Note that this script also references an element with the id "username".  

```html
<div class="px-3">
  <h3>Login</h3>
  <div>Username: <input type="text" id="username" placeholder="mickeymouse"/></div>
  <div>Password: <input type="password" id="password"/></div>
  <p id="error"></p>
  <button onclick="login()">Login</button>
</div>
<script>
 console.log("Welcome to /login!");
 const username_input = document.getElementById('username');
 username_input.addEventListener("keydown", event => {
   console.log("Typing new key to the login username input, with keycode: " + event.keyCode);
 });
 function login() {
   console.log("Logging in user!");
 }
</script>
```


<br/><br/><br/><br/>



<h3 id="a-13"> warning⚠️ not done ☑️ Step 13. Creating <code>/server/bundle.js</code>  </h3>

When the user loads the website for the first time, we want to send them the entire website's HTML, CSS, and JS.  
We'll bundle these files into one large-ish file, which still won't be that big.  
Loading all files right away will let us avoid reloading the site on page changes.  
(This approach is inspired by [Webpack](https://en.wikipedia.org/wiki/Webpack), and component-based JS frameworks.)

Once the browser has the large, bundled file loaded, the user's browser will display pages when requested.  
This will be done with a JS script, which we'll write next.  

But first, let's write `/server/bundle.js`:  

```javascript

```

Now, create a new folder in your project's folder, called `/dist/`.  

<br/><br/><br/><br/>


<h3 id="a-13"> warning⚠️ not done ☑️ Step 13. Using SSR to load pages  </h3>


We're going to use "single page app" architecture, allowing us to reuse the header in `index.html` on every page.  
When pages are loaded initially, they should be rendered with the SSR (server side rendering) pattern.  

For example, when the `/register` page first loads, we want to respond with `/index.html`, but replace the 
content inside `<div id="content"></div>` with the HTML from `/register.html`. 

First, edit `/pages/index.html`, to prepare the content tag:
```html
<div id="content">
  <!--  Insert page content here!  -->
</div>
```

Now, on the server, we'll insert the page content.  
In `server.js`, add this right below the mimeTypes:  
```javascript
//  Mapping URLs to pages
var pageURLs = {
  '/': '/pages/misc/landing.html',
  '/landing': '/pages/misc/landing.html',
  '/register': '/pages/misc/register.html',
  '/login': '/pages/misc/login.html'
}
var pageURLkeys = Object.keys(pageURLs);
```

Then in the same file, edit `respond_with_a_page`:  
```javascript
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
```

<br/><br/><br/><br/>



<h3 id="a-14"> ☑️ Step 14. ☞  Test the code!  </h3>

Restart the server to see if you can load the different pages!  
`localhost:8080` should load the landing page.  
`localhost:8080/login` should load the login page.  
`localhost:8080/register` should load the register page.  
Any other URL should load the 404 page.

<br/><br/><br/><br/>



<h3 id="a-15"> ☑️ Step 15. Set up internal links to load pages  </h3>

When the user clicks on "internal links" in the website, pages should load inside `index.html` 
*without* reloading `index.html` itself. 

In `index.html`, we'll add three links in the header div: 
```html
<div id="header">
  <img id="logo" src="/assets/logo.png" alt="Rooftop Media's logo!" onclick="goto('/landing')">
  <div id="user-buttons">
    <button onclick="goto('/login')">Log in</button>
    <button onclick="goto('/register')">Register</button>
  </div>
</div>
```

We'll implement the `goto(page_route)` function in the next step.  

We'll also restyle our header a bit, in `index.css`.  
We'll edit `#header` and `#logo`, and add some styling for `#user-buttons`.

```css
@font-face {
  font-family: CrimsonText;
  src: url(/assets/fonts/CrimsonText-Regular.ttf);
}

html, body {
    font-family: CrimsonText;
    margin: 0;
}

:root {
    --spacer: 20px;
}

/* The header, including the RTM logo and user profile buttons  */
#header {
    width:           100%;
    height:          105px;
    align-items:     center;
    justify-content: space-between;
    display:         flex;
    background:      #efefef;
    box-shadow:      0px 0px 10px rgba(0,0,0,.5);
    padding:         10px 25px;
    box-sizing:      border-box;
    z-index:         10;
    position:        relative;
}

#logo {
    width:           100px;
    margin-top:      15px;
    margin-bottom:   25px;
    cursor:          pointer;
}

#user-buttons {
    display: flex;
}
#user-buttons button {
    margin-left: 10px;
    padding: 5px 20px;
    cursor: pointer;
}

/*  Global styles  */
.px-1 {
    padding-left: calc(var(--spacer) * 0.25);
    padding-right: calc(var(--spacer) * 0.25);
}
.px-2 {
    padding-left: calc(var(--spacer) * 0.5);
    padding-right: calc(var(--spacer) * 0.5);
}
.px-3 {
    padding-left: var(--spacer);
    padding-right: var(--spacer);
}
```

<br/><br/><br/><br/>



<h3 id="a-16"> ☑️ Step 16. Editing <code>index.js</code>  </h3>

The `index.js` file will be our main frontend javascript file.  
Let's outline it as well, and add our `goto(page_route)` function.

```javascript

////  SECTION 1: Main website memory.
var _current_page  = window.location.pathname;

////  SECTION 2: Page navigation.

function goto(page_route) {
  console.log('Navigating to ' + page_route);

  //  Changing the page's URL without triggering HTTP call...
  window.history.pushState({page: "/"}, "Rooftop Media", page_route);
  _current_page = page_route;
  
  //  Now we'll do the HTTP call here, to keep the SPA frame...
  const http = new XMLHttpRequest();
  http.open("GET", page_route + ".html");
  http.send();
  http.onreadystatechange = (e) => {
    if (http.readyState == 4 && http.status == 200) {
      var page_content = http.responseText;
      document.getElementById('content').innerHTML = page_content;
    }
  }
}

////  SECTION 3: User auth.

////  SECTION 4: Boot.

console.log("Welcome to Rooftop Media Dot Org!");


```

Note that, when loading pages from an internal link, we're making an http call ending in `.html`. 

<br/><br/><br/><br/>



<h3 id="a-17"> ☑️ Step 17. Serving SPA pages in <code>server.js</code>  </h3>

First, we'll update `server.js` to add a new option to the server_request function:  files ending in .html. 

```javascript
//  This function will fire upon every request to our server.
function server_request(req, res) {
  var url = req.url;
  console.log(`\x1b[36m >\x1b[0m New ${req.method} request: \x1b[34m${url}\x1b[0m`);
  var extname = String(path.extname(url)).toLowerCase();

  if (extname.length == 0) {                   /*  No extension? Respond with index.html.  */
    respond_with_a_page(res, url);
  } else if (extname == '.html') {       /*  Getting page content ffor inside index.html.  */
    respond_with_page_content(res, url);
  } else {    /*  Extension, like .png, .css, .js, etc? If found, respond with the asset.  */
    respond_with_asset(res, url, extname);
  }

}
```

Then, we'll add `respond_with_page_content(res, url);`

```javascript
function respond_with_page_content(res, url) {
  url = url.split(path.extname(url))[0]; // removing the extension
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
    res.write(content_page);
    res.end();
  });
}
```

<br/><br/><br/><br/>



<h3 id="a-18"> ☑️ Step 18. ☞  Test the code!  </h3>

Restart the server and click the links in the header.  They should all work!  
Check the console to see if the page changes are being logged, without refreshing the page.

<br/><br/><br/><br/>



<h3 id="a-19"> ☑️ Step 19. ❖ Part A review. </h3>

The complete code for Part A is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_A).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-b" align="center">  Part B:  /register, API & DB basics </h2>

In Part B, we'll register new users, and securely store their data in a database.  
Along the way, we'll:
 - Set up our API
 - Set up our database
 - Hash user passwords
 - Validate input from new users who want to register

*Estimated time: ?? minutes*

<br/><br/><br/><br/>



<h3 id="b-1">  ☑️ Step 1:  Setting up database columns and rows </h3>

We're going to need a database that can save, update, and retrieve user's profile data.  
We'll do this by reading and writing from JSON files.  

First, in `/rooftop-media.org/server`, add a folder called `/database`.  
Then, add two more folders inside that one:  
 - `/server/database/table_columns` - a folder for JSON files *describing* data tables.
 - `/server/database/table_rows` - a folder for JSON files containing the data for those tables.

Our first database **table** will store *users* who register.  
Add the file `/server/database/table_rows/users.json`.  
For now, we have no users, so write an empty array:

```json
[]
```

Now, we want to describe the **columns** in our user table.  
Most data in this file will remain constant, unless we want to edit the data structure that stores our user.   
An exception is the `max_id` field, which we'll increment every time we add a new user, so everyone gets a unique id.   

Add the file `/server/database/table_columns/users.json`, and add all this:
```json
{
  "name": "Users",
  "snakecase": "users",
  "max_id": 0,
  "columns": [
    {
      "name": "Id",
      "snakecase": "id",
      "unique": true
    },
    {
      "name": "Username",
      "snakecase": "username",
      "unique": true
    },
    {
      "name": "Display Name",
      "snakecase": "display_name",
      "unique": true
    },
    {
      "name": "Email",
      "snakecase": "email",
      "unique": true
    },
    {
      "name": "Phone",
      "snakecase": "phone",
      "unique": true
    },
    {
      "name": "Password hash",
      "snakecase": "password"
    },
    {
      "name": "Password salt",
      "snakecase": "salt"
    }
  ]
}
```

<br/><br/><br/><br/>



<h3 id="b-2">  ☑️ Step 2:  Setting up <code>database.js</code> </h3>

Now, create a new JS file, `/server/database/database.js`.  
This file will be a [NodeJS module](https://nodejs.org/api/modules.html#modules-commonjs-modules).
It provides a Javascript class describing a `Table` data object, with these properties:
 - `name` (string) - The table's name
 - `columns` (array of objects) - Descriptions of the table's columns
 - `rows` (array of objects) - Description of the table's data

A `Table` object also has two methods:
 - `find(query)` - Returns a set of rows from the table
 - `insert(row_data)` - Inserts a new row into the table

Here's the code:  
```javascript
//  Database.js -- providing the Table class, for adding, editing and reading table data. 

var path = require('path');
var fs   = require('fs');

class Table {

  constructor(name) {
    this.name = name;
    this.columns = JSON.parse(fs.readFileSync(`${__dirname}/table_columns/${name}.json`, 'utf8'));
    this.rows = JSON.parse(fs.readFileSync(`${__dirname}/table_rows/${name}.json`, 'utf8'));
  }

  //  "query" is an object
  find(query) {
    let query_keys = Object.keys(query);
    let results = [];
    for (let i = 0; i < this.rows.length; i++) {
      let is_result = true;
      for (let j = 0; j < query_keys.length; j++) {
        let key = query_keys[j];
        if (this.rows[i][key] != query[key]) {
          is_result = false;
        }
      }
      if (is_result) {
        results.push(this.rows[i]);
      }
    }
    return results;
  }

  insert(row_data) {
    row_data.id = this.columns.max_id;
    this.columns.max_id++;
    this.rows.push(row_data);
    fs.writeFileSync(`${__dirname}/table_rows/${this.name}.json`, JSON.stringify(this.rows, null, 2));
    fs.writeFileSync(`${__dirname}/table_columns/${this.name}.json`, JSON.stringify(this.columns, null, 2));
    return row_data.id;
  }
  
}

module.exports = {

  table: function(table_name) {
    return new Table(table_name);
  },
}
```

<br/><br/><br/><br/>



<h3 id="b-3">  ☑️ Step 3:  Testing <code>database.js</code> </h3>

Create a new file, `/server/database/test.js`.  


<br/><br/><br/><br/>



<h3 id="b-4">  ☑️ Step 4:  Setting up the API in <code>server.js</code> </h3>

First, we'll import our Database module into `server.js`, and a module to let us encrypt user passwords:

```javascript
//  Importing NodeJS libraries.
var http = require('http');     // listen to HTTP requests
var path = require('path');     // manage filepath names
var fs   = require('fs');       // access files on the server
var crypto = require('crypto'); // encrypt user passwords

//  Importing our custom libraries
const DataBase = require('./database/database.js');
```

In `server.js`, we'll set up another conditional, to catch calls with no extension that begin with **/api/**.
```javascript
//  This function will fire upon every request to our server.
function server_request(req, res) {
  var url = req.url;
  console.log(`\x1b[36m >\x1b[0m New ${req.method} request: \x1b[34m${url}\x1b[0m`);
  var extname = String(path.extname(url)).toLowerCase();

  if (extname.length == 0 && url.split('/')[1] == 'api') {
    if (req.method == "GET") {
      api_GET_routes(url, res);
    } else if (req.method == "POST") {
      api_POST_routes(url, req, res);
    }
  } else if (extname.length == 0) {                   /*  No extension? Respond with index.html.  */
    respond_with_a_page(res, url);
  } else if (extname == '.html') {       /*  Getting page content ffor inside index.html.  */
    respond_with_page_content(res, url);
  } else {    /*  Extension, like .png, .css, .js, etc? If found, respond with the asset.  */
    respond_with_asset(res, url, extname);
  }

}
```

Then, we'll add some functions to the API section: 
 - `api_GET_routes(url, res)` will route API calls that use the GET method. We'll leave it empty for now. 
 - `api_POST_routes(url, req, res)` will route API calls that use the POST method. 
 - `POST_register(new_user, res)` will be our first API route.  It registers a user in the database, IF the user's email, phone number and username are unique. 

```javascript
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

    if (url == "/api/register") {
      POST_register(req_data, res);
    } 
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
  //  If it's not a duplicate, encrypt the pass, and save it. 
  if (!response.error) {
    new_user.salt = crypto.randomBytes(16).toString('hex');
    new_user.password = crypto.pbkdf2Sync(new_user.password, new_user.salt, 1000, 64, `sha512`).toString(`hex`);
    //  Add the user to the db.
    let user_id = DataBase.table('users').insert(new_user);
  }
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(JSON.stringify(response));
  res.end();
}
```

<br/><br/><br/><br/>



<h3 id="b-5">  ☑️ Step 5:  Calling the API with client-side script <code>auth.js</code> </h3>

First, in `/pages/misc`, we'll add a Javascript file called `auth.js`.  It will handle registration, login, etc.  
Here's what our `auth.js` will contain for now:  

```javascript
function register() {
  var username = document.getElementById('username').value;
  var display_name = document.getElementById('display_name').value;
  var email = document.getElementById('email').value;
  var phone = document.getElementById('phone').value;
  var password = document.getElementById('password').value;
  var confirm_password = document.getElementById('confirm_password').value;
  if (password != confirm_password) {
    document.getElementById('error').innerHTML = 'Passwords must match.';
    return;
  }
  if (username.length < 2) {
    document.getElementById('error').innerHTML = 'Valid username required.';
    return;
  }

  const http = new XMLHttpRequest();
  http.open("POST", "/api/register");
  http.send(JSON.stringify({
    username: username,
    display_name,
    email,
    phone,
    password
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText)
      if (!response.error) {
        console.log("Response recieved! Logging you in.")
        goto('/landing')
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    } else {
      document.getElementById('error').innerHTML = "Error registering this user.";
    }
  }
}
```

Then, in `pages/index.html`, we'll need to import our `auth.js` script.  

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!--  meta tags, favicon link, css, etc -->
    <script src="/pages/index.js"></script>
    <script src="/pages/misc/auth.js"></script>
  </head>
  <body>
    <!-- all the body HTML content -->
  </body>
</html>
```

<br/><br/><br/><br/>



<h3 id="b-5"> ☑️ Step 5. ☞  Test the code!  </h3>

Now, we can run the server, and navigate to the `/register` page.  
We'll want to test for a few different things: 
 - First, fill out the form correctly - a proper username, display name, email, and phone number, and two matching passwords. Then click "register".
   - The browser console should log a success message.  
   - In the server's files, check `server/database/table_rows/users.json`.  Your submitted data should be added to the file!
 - Next, fill out the form, but with two different passwords. 
   - An error should display on the page.  Nothing should be logged in the database.
 - Now fill out the form, but with a username already saved to the database.  
   - An error should display in browser.
 - Now use an email that's already been saved to the database. 
   - An error should display in browser. 
 - Now use a phone number that's already been saved to the database. 
   - An error should display in browser. 

<br/><br/><br/><br/>



<h3 id="b-6">  ☑️ Step 6:  Loading page-specific scripts </h3>

We'll want to run some JS as soon as `register.html` loads, to validate user input.  
Let's test what happens if we add a script in `register.html` now...  

Open `register.html` and add this:  

```html
<div class="px-3">
  <h3>Register</h3>
  <div>Username: <input type="text" id="username" placeholder="mickeymouse"/></div>
  <div>Display name: <input type="text" id="display_name" placeholder="mickeymouse"/></div>
  <div>Email: <input type="text" id="email" placeholder="mickey@mouse.org"/></div>
  <div>Phone #: <input type="text" id="phone" placeholder="555-555-5555"/></div>
  <div>Password: <input type="password" id="password"/></div>
  <div>Confirm password: <input type="password" id="confirm_password"/></div>
  <p id="error"></p>
  <button onclick="register()">Register</button>
</div>
<script>
  console.log("Hello from register.html!");
</script>
```

Now, go to `/register` and refresh the page.  The message should log to the console!  
That's because, when refreshed, the entire page is rendered server side.  

Now, go to `/` or `/landing`, and refresh.  Then, click the register button.  
Notice that our message is *not* logged here.  

<!-- We can fix this by editing the `goto(page_route)` function in `index.js`:   -->

This is actually a pretty complex problem, I'm not sure how to fix yet.  
Here are some possible options: 

 1. It's [possible](https://www.tutorialspoint.com/can-scripts-be-inserted-with-innerhtml) to insert 
scripts with JS, but doing that would make the script load twice if the page was navigated to again.  

 2. Alternately, I could put the scripts in `auth.js` or something, and call them manually when `/register` is loaded?  

 3. Or, I could give up on the SPA thing, and just have each page load separately when a link is clicked. 

 4. Ideally, I would do what other frameworks do -- have JS bundled with pages, "component" style,  & loaded/unloaded appropriately on th frontend.

<br/><br/><br/><br/>



<h3 id="b-6">  ☑️ Step 6:  Validating user input in <code>register.html</code> </h3>

Next, we want to add event listeners to the inputs on `register.html` to validate user input.  
For example, a username should be only lowercase letters, numbers, and underscores.  

```html
<div class="px-3">
  <h3>Register</h3>
  <div>Username: <input type="text" id="username" placeholder="mickeymouse"/></div>
  <div>Display name: <input type="text" id="display_name" placeholder="mickeymouse"/></div>
  <div>Email: <input type="text" id="email" placeholder="mickey@mouse.org"/></div>
  <div>Phone #: <input type="text" id="phone" placeholder="555-555-5555"/></div>
  <div>Password: <input type="password" id="password"/></div>
  <div>Confirm password: <input type="password" id="confirm_password"/></div>
  <p id="error"></p>
  <button onclick="register()">Register</button>
</div>
<script>
  //  Username -- lowercase alphanumeric and _ only
  const username_input = document.getElementById('username');
  const username_regex = /^[a-z0-9_]*$/;
  username_input.addEventListener("keydown", event => {
    if (!username_regex.test(event.key) && event.keyCode != 8) {
      event.preventDefault();
    }
  });
</script>
```

<br/><br/><br/><br/>



<h3 id="b-7"> ☑️ Step 7. ☞  Test the code!  </h3>

Run the server again and navigate to `/register`.  
Click on the `username` input field and try to type any capital letter - input should be prevented.  

<br/><br/><br/><br/>


<h3 id="a-8"> ☑️ Step 8. ❖ Part B review. </h3>

The complete code for Part B is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_B).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-c" align="center">  Part-C :  User sessions, /login, /logout </h2>

In this part, we'll finish user authorization for the website, with features including:
 - Let existing users log in on the login page. 
 - Start a *session* to keep a user registered or logged in. 
 - Let users log out, deleting their session. 

<br/><br/><br/><br/>



<h3 id="c-1">  ☑️ Step 1:  Adding user & session memory in <code>index.js</code> </h3>

```javascript
////  SECTION 1: Main website memory.
var _current_page  = window.location.pathname;
var _session_id = localStorage.getItem('session_id');
var _current_user = null;
```

```javascript
////  SECTION 4: Boot.
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
        update_app_frame()
      }
    }
  }
  
  //  Redirect away from register or login if we're logged in.
  if ((_current_page == '/register' || _current_page == '/login') && _session_id != '') {
    _current_page = '/landing';
  }

  //  Go to the page. 
  goto(_current_page);
}
window.addEventListener('load', (event) => {
  boot()
});
```

<br/><br/><br/><br/>



<h3 id="c-?"> ☑️ Step ?. ❖ Part C review. </h3>

The complete code for Part C is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_C).

<br/><br/><br/><br/>
<br/><br/><br/><br/>







