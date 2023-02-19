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
| [Part A - Serving Static Pages](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-a) | 17 min. | 19 |
| [Part B - /register, API & DB basics](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-b) | 0 min. | 0 |
| [Part C - User sessions and /logout](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-c) | 0 min.  | 0 |
| [Part D - /login, unit testing](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-d) | 0 min. | 0 |
| [Part E - Email confirmation](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-e) | 0 min. | 0 |
| [Part F - Phone confirmation](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-f) | 0 min. | 0 |
| [Part G - Password reset](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-g) | 0 min. | 0 |
| [Part H - User settings](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-h) | 0 min. | 0 |
| [Version 2.0.](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#v2) | Todo | ? |

<br/><br/><br/><br/><br/><br/><br/><br/>





<h2 id="part-a" align="center">  Part A:  Serving static pages </h2>

The steps in Part A will culminate in us serving a website with static pages, including:
  - a landing page
  - a register page
  - a login page

Along the way, we’ll do several things.  
We'll create a webserver that can serve up assets. This NodeJS-only server set up is based on the [MDN docs](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework).
We'll make sure our web pages are handicap accessible and mobile friendly.  
And we'll implement both *server side rendering* and *single page app* design patterns. 

*Estimated time: ?? minutes*

<br/><br/><br/><br/>



<h3 id="a-1">  ☑️ Step 1:  Create a homepage at <code>/pages/index.html</code> </h3>

Create a new folder in the `/rooftop-media.org/` folder, called `/pages/`.  
This is where we'll put the code for our website's pages. 

Inside the new folder, make a file called `index.html`.  

```html
<!DOCTYPE html>
<html>
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
<html>
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
    respond_with_a_page(res, url);
  } else {    /*  Extension, like .png, .css, .js, etc? If found, respond with the asset.  */
    respond_with_asset(res, url, extname);
  }

}

function respond_with_a_page(res, url) {
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

Create a new file, `/pages/misc/landing.html`, and add:

```html
<h2>Rooftop Media landing page</h2>
<p>We'll highlight some content here.</p>
```

Create a new file, `/pages/misc/register.html`, and add:

```html
<h3>Register</h3>
<div>Username: <input type="text" placeholder="mickeymouse"/></div>
<div>Email: <input type="text" placeholder="mickey@mouse.org"/></div>
<div>Password: <input type="password"/></div>
<div>Confirm password: <input type="password"/></div>
```

Create another new file, `/pages/misc/login.html`, and add:

```html
<h3>Login</h3>
<div>Username: <input type="text" placeholder="mickeymouse"/></div>
<div>Password: <input type="password"/></div>
```


<br/><br/><br/><br/>



<h3 id="a-13"> ☑️ Step 13. Using SSR to load pages  </h3>

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
Along the way, we'll set up our API and our database, and hash user passwords. 

*Estimated time: ?? minutes*

<br/><br/><br/><br/>



<h3 id="b-1">  ☑️ Step 1:  Setting up <code>database.js</code> </h3>

We're going to need a database that can save, update, and retrieve user's profile data.  

<br/><br/><br/><br/>








