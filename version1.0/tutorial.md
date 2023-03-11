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
| [Part A - Serving Static Pages](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-a) | 15 min. | 18 |
| [Part B - /register, API & DB basics](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-b) | 15 min. | 8 |
| [Part C - User sessions, logout, and /login](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-c) | 20 min.  | 13 |
| [Part D - User settings](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-d) | 10 min. | 9 |
| [Part E - Mobile design](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-e) | 0 min. | 0 |
<!--| [Part F - Email confirmation](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-f) | 0 min. | 0 |
| [Part G - Phone confirmation](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-g) | 0 min. | 0 |
| [Part H - Unit testing](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-h) | 0 min. | 0 |-->
| [Version 2.0.](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#v2) | Todo | ? |
<!--
Proposals...  
 D. Unit testing - Mocha? DIY will take brain power, not just copying
 E. Email confirmation - Nodemailer? Diy will take brain power
 F. Phone confirmation - Twilio? "Courier" could do this and E. 
 G. Pass reset - Nodemailer again
 H. This part could be done diy-->
 
 

<br/><br/><br/><br/><br/><br/><br/><br/>





<h2 id="part-a" align="center">  Part A:  Serving static pages </h2>

The steps in Part A will culminate in us serving a website with static pages, including:
  - a landing page
  - a register page
  - a login page

Along the way, we’ll do several things.  
We'll create a webserver that can serve up assets. This NodeJS-only server set up is based on the [MDN docs](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework).
We'll also create a few pages, and set up a basic routing system, with some server-side rendering.
And, we'll make sure our web pages are handicap accessible<!-- and mobile friendly-->.  

*Estimated time: ?? minutes*

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

*Note that the strange parts of text in that console.log statement (\x1b\[36m, for example) are [ANSI codes](https://en.wikipedia.org/wiki/ANSI_escape_code#Colors), for coloring terminal text!*

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
 - [`/landing`](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_A/assets/landing)
   - `/comic.svg`
   - `/thumb1.svg`
   - `/thumb2.svg`
   - `/thumb3.svg`
 - [`/logo.png`](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/part_A/assets/logo.png)


I made the logo and images for the landing page in a vector image editor (Affinity Designer).  
I generated the favicons by uploading the logo to a [favicon generator](https://favicon.io/) website.  
I downloaded the font from [Google Fonts](https://fonts.google.com/specimen/Crimson+Text/about) -- after checking the license to make sure I could use it!

<br/><br/><br/><br/>



<h3 id="a-8">  ☑️ Step 8:  Add <code>index.js</code> and <code>index.css</code>to <code>/pages/</code> </h3>

Next, we'll add two files to our `/pages/` directory.

First, create `/pages/index.css`, and add this:
```css
@font-face {
  font-family: CrimsonText;
  src: url(/assets/fonts/CrimsonText-Regular.ttf),
       url('/assets/fonts/crimsontext-regular-webfont.woff2') format('woff2'), /* Super Modern Browsers */
       url('/assets/fonts/crimsontext-regular-webfont.woff') format('woff'), /* Pretty Modern Browsers */
       url('/assets/fonts/CrimsonText-Regular.ttf') format('truetype'),
       Times New Roman, serif; /* Safari, Android, iOS */
}

html, body {
    font-family: CrimsonText;
    margin: 0;
    min-height: 100vh;
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
.p-3 {
    padding: var(--spacer);
}

.center-column {
    max-width: 800px;
    margin: 0 auto;
}
```

Then, create `/pages/index.js`, and add this:
```javascript
console.log("Welcome to Rooftop Media Dot Org!");
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
Then, in our response function, we'll respond with index.html, an asset, or a 404 message.

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
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('404 -- asset not found', 'utf-8');
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

<br/>

We can also test what happens when we request a file that doesn't exist.  
In `/pages/index.html` change the img tag's source to: 
`<img id="logo" src="/assets/notlogo.png" alt="Rooftop Media's logo!">`  
Reload the website.  The logo should be missing, and in our networking tab, we should see the 404 message.  
Change the logo source back to the correct value before moving on. 

<br/><br/><br/><br/>




<h3 id="a-12"> ☑️ Step 12. Adding pages to <code>/pages</code>  </h3>

We're going to add four pages to our website.  

The landing page will feature a little comic, and some thumbnails to futuree articles.  
Create a new file, `/pages/misc/landing.html`, and add:

```html
<div class="px-3 center-column">
  <img src="/assets/landing_comic.svg"/>
  <hr/><br/>
  <h2 style="text-decoration: underline;">Articles</h2>
  <div class="thumb-container">
    <a href="/language">
      <img src="/assets/landing_thumb1.svg"/>
      <p>Language</p>
    </a>
    <a href="/mathematics">
      <img src="/assets/landing_thumb2.svg"/>
      <p>Mathematics</p>
    </a>
    <a href="/gravity">
      <img src="/assets/landing_thumb3.svg"/>
      <p>Gravity</p>
    </a>
  </div>
</div>

<style>
  .thumb-container {
    display: flex;
    justify-content: space-between;
  }
  .thumb-container a {
    display: block;
    width: 200px;
    text-align: center;
    cursor: pointer;
    color: black;
    text-decoration: none;
  }
  .thumb-container a img {
    transition: .3s;
  }
  .thumb-container a:hover img {
    box-shadow: 0px 2px 5px rgba(0,0,0,0.2);
  }
  .thumb-container a:hover p {
    text-decoration: underline;
  }
</style>
```

Create a new file, `/pages/misc/register.html`, and add:

```html
<div class="px-3 center-column">
  <h3>Register</h3>
  <div>Username: <input type="text" tabindex="1" id="username" placeholder="mickeymouse"/></div>
  <div>Display name: <input type="text" tabindex="2" id="display_name" placeholder="Mickey Mouse"/></div>
  <div>Email: <input type="text" tabindex="3" id="email" placeholder="mickey@mouse.org"/></div>
  <div>Phone #: <input type="text" tabindex="4" id="phone" placeholder="555-555-5555"/></div>
  <div>Password: <input type="password" tabindex="5" id="password"/></div>
  <div>Confirm password: <input type="password" tabindex="6" id="confirm_password"/></div>
  <p id="error"></p>
  <button onclick="register()">Register</button>
</div>
```

Create another new file, `/pages/misc/login.html`, and add:

```html
<div class="px-3 center-column">
  <h3>Login</h3>
  <div>Username: <input type="text" tabindex="1" id="username" placeholder="mickeymouse"/></div>
  <div>Password: <input type="password" tabindex="2" id="password"/></div>
  <p id="error"></p>
  <button onclick="login()">Login</button>
</div>
```

Finally, add one more new file, `/pages/misc/404.html`, and add:

```html
<div class="px-3 center-column">
  <h1>404 - page not found!</h1>
</div>
```


<br/><br/><br/><br/>



<h3 id="a-13"> ☑️ Step 13. Putting together pages in <code>server.js</code>  </h3>

We're going to reuse the header in `index.html` on every page.  

For example, when the `/register` page first loads, we want to respond with `/index.html`, but replace the 
content inside `<div id="content"></div>` with the HTML from `/register.html`. 

We'll do this in `server.js`.  This technique might be referred to as [server side scripting](https://en.wikipedia.org/wiki/Server-side_scripting).

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


<h3 id="a-15"> ☑️ Step 15. HTTP security  </h3>

Note that right now, if a user navigates to `http://localhost:8080/server/server.js`,  they can see the code that makes our server run.  
We don't want to send anything from our `/server` folder.  
We can fix that by editing `server.js`:  

```javascript
//  This function will fire upon every request to our server.
function server_request(req, res) {
  var url = req.url;
  console.log(`\x1b[36m >\x1b[0m New ${req.method} request: \x1b[34m${url}\x1b[0m`);
  var extname = String(path.extname(url)).toLowerCase();

  if (url.split('/')[1] == 'server') {  /*  Don't send anything from the /server/ folder.  */
    respond_with_a_page(res, '/404');
  } else if (extname.length == 0) {            /*  No extension? Respond with index.html.  */
    respond_with_a_page(res, url);
  } else {    /*  Extension, like .png, .css, .js, etc? If found, respond with the asset.  */
    respond_with_asset(res, url, extname);
  }

}
```

Refresh the server. Now, navigating to  `http://localhost:8080/server/server.js` shows the 404 page.

<br/><br/><br/><br/>




<h3 id="a-16"> ☑️ Step 16. Set up internal links  </h3>

We'll add some links to the website header.  

In `index.html`, we'll add three links in the header div: 
```html
<div id="header">
  <a href="/">
    <img id="logo" src="/assets/logo.png" alt="Rooftop Media's logo!">
  </a>
  <div id="user-buttons">
    <a href="/login">Log in</a>
    <a href="/register">Register</a>
  </div>
</div>
```

We'll also restyle our header a bit, in `index.css`.  
We'll edit `#header` and `#logo`, and add some styling for `#user-buttons`.

```css
@font-face {
  font-family: CrimsonText;
  src: url(/assets/fonts/CrimsonText-Regular.ttf),
       url('/assets/fonts/crimsontext-regular-webfont.woff2') format('woff2'), /* Super Modern Browsers */
       url('/assets/fonts/crimsontext-regular-webfont.woff') format('woff'), /* Pretty Modern Browsers */
       url('/assets/fonts/CrimsonText-Regular.ttf') format('truetype'),
       Times New Roman, serif; /* Safari, Android, iOS */
}

html, body {
    font-family: CrimsonText;
    margin: 0;
    min-height: 100vh;
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
#user-buttons a {
    display:         block;
    color:         black;
    text-decoration: none;
    border:          solid 1px #bbb;
    background:      #f6f6f6;
    margin-left:     10px;
    padding:         5px 20px;
    cursor:          pointer;
    border-radius:   4px;
}
#user-buttons a:hover {
  background:      #fafafa;
}
#user-buttons a:active {
  background:      #eaeaea;
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

.center-column {
    max-width: 800px;
    margin: 0 auto;
}
```

<br/><br/><br/><br/>




<h3 id="a-17"> ☑️ Step 17. ☞  Test the code!  </h3>

Restart the server and click the links in the header.  They should all work!  

<br/><br/><br/><br/>



<h3 id="a-18"> ☑️ Step 18. ❖ Part A review. </h3>

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

*Estimated time: 15 minutes*

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



<h3 id="b-3">  ☑️ Step 3:  Setting up the API in <code>server.js</code> </h3>

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

  if (url.split('/')[1] == 'server') {  /*  Don't send anything from the /server/ folder.  */
    respond_with_a_page(res, '/404');
  } else if (extname.length == 0 && url.split('/')[1] == 'api') {     /*  API routes.      */
    if (req.method == "GET") {
      api_GET_routes(url, res);
    } else if (req.method == "POST") {
      api_POST_routes(url, req, res);
    }
  } else if (extname.length == 0) {            /*  No extension? Respond with index.html.  */
    respond_with_a_page(res, url);
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



<h3 id="b-5">  ☑️ Step 5:  Calling the API in the browser, in <code>register.html</code> </h3>

Open `register.html` and add this:  

```html
<div class="px-3 center-column">
  <h3>Register</h3>
  <div>Username: <input type="text" tabindex="1" id="username" placeholder="mickeymouse"/></div>
  <div>Display name: <input type="text" tabindex="2" id="display_name" placeholder="Mickey Mouse"/></div>
  <div>Email: <input type="text" tabindex="3" id="email" placeholder="mickey@mouse.org"/></div>
  <div>Phone #: <input type="text" tabindex="4" id="phone" placeholder="555-555-5555"/></div>
  <div>Password: <input type="password" tabindex="5" id="password"/></div>
  <div>Confirm password: <input type="password" tabindex="6" id="confirm_password"/></div>
  <p id="error"></p>
  <button onclick="register()">Register</button>
</div>

<script>
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
  } else if (username.length < 2) {
    document.getElementById('error').innerHTML = 'Username must have at least 2 characters.';
    return;
  } else if (password.length < 8) {
    document.getElementById('error').innerHTML = 'Password must have at least 8 characters.';
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
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Logging you in.");
        window.location.href = '/';
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}
</script>
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



<h3 id="b-6">  ☑️ Step 6:  Validating user input in <code>register.html</code> </h3>

Next, we want to add event listeners to the inputs on `register.html` to validate user input.  
For example, a username should be only lowercase letters, numbers, and underscores.  

```html
<div class="px-3 center-column">
  <h3>Register</h3>
  <div>Username: <input type="text" tabindex="1" id="username" placeholder="mickeymouse"/></div>
  <div>Display name: <input type="text" tabindex="2" id="display_name" placeholder="Mickey Mouse"/></div>
  <div>Email: <input type="text" tabindex="3" id="email" placeholder="mickey@mouse.org"/></div>
  <div>Phone #: <input type="text" tabindex="4" id="phone" placeholder="555-555-5555"/></div>
  <div>Password: <input type="password" tabindex="5" id="password"/></div>
  <div>Confirm password: <input type="password" tabindex="6" id="confirm_password"/></div>
  <p id="error"></p>
  <button onclick="register()">Register</button>
</div>

<script>

const utility_keys = [8, 9, 39, 37, 224]; // backspace, tab, command, arrow keys

//  Username -- lowercase alphanumeric and _ only
const username_input = document.getElementById('username');
const username_regex = /^[a-z0-9_]*$/;
username_input.addEventListener("keydown", event => {
  if (!username_regex.test(event.key) && !utility_keys.includes(event.keyCode)) {
    event.preventDefault();
    document.getElementById('error').innerHTML = "Username can only contain lowercase letters, numbers, and underscores.";
  } else {
    document.getElementById('error').innerHTML = "";
  }
});

//  Email
const email_input = document.getElementById('email');
const email_regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
var email_val = email_input.value;
email_input.addEventListener("input", event => {
  email_val = email_input.value;
  if (!email_regex.test(email_val) && !utility_keys.includes(event.keyCode)) {
    document.getElementById('error').innerHTML = "Invalid email format";
  } else {
    document.getElementById('error').innerHTML = "";
  }
});

//  Phone
const phone_input = document.getElementById('phone');
const phone_regex = /^[0-9\-]{0,12}$/;
var phone_val = "";
phone_input.addEventListener("keydown", event => {
  phone_val = phone_input.value
  if (!phone_regex.test(phone_val + event.key) && !utility_keys.includes(event.keyCode) || event.keyCode == 173) {
    event.preventDefault();
  } else if (event.keyCode != 8) {
    if (phone_val.length == 3 || phone_val.length == 7) {
      phone_input.value = phone_input.value + "-";
    }
  } else {
    if (phone_val.length == 5 || phone_val.length == 9) {
      phone_input.value = phone_input.value.slice(0,-1);
    }
  }
});

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
  } else if (username.length < 2) {
    document.getElementById('error').innerHTML = 'Username must have at least 2 characters.';
    return;
  } else if (password.length < 8) {
    document.getElementById('error').innerHTML = 'Password must have at least 8 characters.';
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
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Logging you in.");
        window.location.href = '/';
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}
</script>
```

<br/><br/><br/><br/>



<h3 id="b-7"> ☑️ Step 7. ☞  Test the code!  </h3>

Run the server again and navigate to `/register`.  
Click on the `username` input field and try to type any capital letter - input should be prevented.  
The `email` and `phone` inputs should be nicely validated as well.  

<br/><br/><br/><br/>


<h3 id="b-8"> ☑️ Step 8. ❖ Part B review. </h3>

The complete code for Part B is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_B).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-c" align="center">  Part C :  User sessions, logout, and /login </h2>

In this part, we'll finish user authorization for the website, with features including:
 - Let existing users log in on the login page. 
 - Start a *session* to keep a user registered or logged in. 
 - Let users log out, deleting their session. 

*Estimated time: 20 minutes*

<br/><br/><br/><br/>



<h3 id="c-1">  ☑️ Step 1:  Adding a table to store session data </h3>

When a user logs in on a computer, a *session* will begin.  
The session will let the user stay signed in on their browser, until they log out, or the session expires.  

We'll start by adding the file `/server/database/table_columns/sessions.json`, to describe session data.

```json
{
  "name": "Sessions",
  "snakecase": "sessions",
  "max_id": 6,
  "columns": [
    {
      "name": "Id",
      "snakecase": "id",
      "unique": true
    },
    {
      "name": "User Id",
      "snakecase": "user_id"
    },
    {
      "name": "Expiration Date",
      "snakecase": "expiration"
    }
  ]
}
```

And we'll also make `/server/database/table_rows/sessions.json`, with an empty array:
```json
[]
```

<br/><br/><br/><br/>


<h3 id="c-2">  ☑️ Step 2:  Create a session when registering in <code>server.js</code> </h3>

We'll edit the function `function POST_register(new_user, res)` in `server.js`, to this:

```javascript
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
    //  Add a session to the db.
    let expire_date = new Date()
    expire_date.setDate(expire_date.getDate() + 30);
    response.session_id = DataBase.table('sessions').insert({
      user_id: user_id,
      expires: expire_date
    })
  }
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(JSON.stringify(response));
  res.end();
}
```

Note that we're finally using the `user_id` we get from the database.  
<!--  Also note that this function is now 40 lines long, which is longer than I'd like...  
TODO  -->

<br/><br/><br/><br/>



<h3 id="c-3">  ☑️ Step 3:  Starting a session in <code>register.html</code> </h3>

We'll edit the register function in `register.html`, to store our session id data in [localstorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem).  
This means the data will be saved with the browser accessing our website.  

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
  http.open('POST', '/api/register');
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
      response = JSON.parse(http.responseText);
      if (!response.error) {
        console.log("Response recieved! Logging you in.");
        localStorage.setItem('session_id', response.session_id);
        _session_id = response.session_id;
        window.location.href = '/';
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}
```

<!--  TODO: This function is also about 40 lines long.  I'll need to fix that later. -->

<br/><br/><br/><br/>



<h3 id="c-3">  ☑️ Step 3:  New API route: <code>user-by-session</code> </h3>

We'll edit `server/server.js` in two places.  
First, in `api_POST_routes`, add a call to `POST_user_by_session`:  

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
    } else if (url == '/api/user-by-session') {
      POST_user_by_session(req_data, res);
    }
  })
}
```

and, below `POST_register`, add:  

```javascript
function POST_user_by_session(session_id, res) {
  let session_data = DataBase.table('sessions').find({ id: session_id });
  if (session_data.length < 1) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write("No session found.");
    res.end();
    return;
  }
  let user_data = DataBase.table('users').find({ id: session_data[0].user_id });
  if (user_data.length < 1) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write(`No user found for session ${session_data[0].id}.`);
    res.end();
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(JSON.stringify(user_data[0]));
    res.end();
  }
}
```

<br/><br/><br/><br/>



<h3 id="c-4">  ☑️ Step 4:  Adding user & session memory in <code>index.js</code> </h3>

It's finally time to actually use `index.js`.  
When *any* page loads, we want to check the `_session_id`, and get a user's data by session id.  
If the user is logged in, we'll also display the user's name in place of the register or login buttons.  
```javascript
////  SECTION 1: Main website memory.
var _current_page  = window.location.pathname;
var _session_id = localStorage.getItem('session_id');
var _current_user = null;

////  SECTION 2: Functions.

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
        document.getElementById('user-buttons').innerHTML = `<a href="/profile">${_current_user.display_name}</a>`;
        document.getElementById('user-buttons').innerHTML += `<button onclick="logout()">Log out</button>`;
      } else if (http.readyState == 4 && http.status == 404) {
        console.log('No session found.');
        localStorage.removeItem('session_id');
      }
    }
  }
  
  //  Redirect away from register or login if we're logged in.
  if ((_current_page == '/register' || _current_page == '/login') && _session_id != null) {
    window.location.href = '/';
  }
  
}
window.addEventListener('load', (event) => {
  boot()
});
```

We'll also edit `index.css`.  
Change `#user-buttons a`, and that selector with `:hover` and `:active`, to:  

```css
#user-buttons a, #user-buttons button {
    display:         block;
    color:         black;
    text-decoration: none;
    border:          solid 1px #bbb;
    background:      #f6f6f6;
    margin-left:     10px;
    padding:         5px 20px;
    cursor:          pointer;
    border-radius:   4px;
}
#user-buttons a:hover, #user-buttons button:hover {
  background:      #fafafa;
}
#user-buttons a:active, #user-buttons button:active {
  background:      #eaeaea;
}
```

<br/><br/><br/><br/>



<h3 id="c-5"> ☑️ Step 5. ☞  Test the code!  </h3>

Refresh the server.  Go to the register page and add a new user.  
You should be redirected to the landing page, with your display name replacing the register/login buttons.  
Refresh the page, and you should stay logged in.  

Check the file `/server/database/table_rows/sessions.json`.  There should be a new session!  

<br/><br/><br/><br/>



<h3 id="c-6"> ☑️ Step 6.  Adding a delete function to <code>database.js</code>  </h3>

Next up is the logout function.  
Logging out will delete a Session record in the database, so we'll need a `delete` function.  
The delete function takes an id for a table row, and deletes it if found.

In `/server/database/database.js`, add this after our `insert` function:

```javascript
  delete(id_to_delete) {
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].id == id_to_delete) {
        this.rows.splice(i, 1);
        return ``;
      }
    }
    return `No row found with id ${id_to_delete}`;
  }
```

<br/><br/><br/><br/>



<h3 id="c-7"> ☑️ Step 7.  Add a logout API route to <code>server.js</code>  </h3>

We'll edit `server/server.js` in two places.  
First, in `api_POST_routes`, add a call to `POST_logout`:  

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
    } else if (url == '/api/logout') {
      POST_logout(req_data, res);
    } else if (url == '/api/user-by-session') {
      POST_user_by_session(req_data, res);
    }
  })
}
```

Then, between `POST_register` and `POST_user_by_session`, add this:  

```javascript
function POST_logout(session_id, res) {
  let success_msg = DataBase.table('sessions').delete(session_id);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(success_msg);
  res.end();
}
```

<br/><br/><br/><br/>



<h3 id="c-8"> ☑️ Step 8.  Add a logout function to <code>index.js</code>  </h3>

In `index.js`, add this:

```javascript
////  SECTION 2: Functions.

//  Log out
function logout() {
  const http = new XMLHttpRequest();
  http.open("POST", "/api/logout");
  http.send(_session_id);
  http.onreadystatechange = (e) => {
    if (http.readyState == 4 && http.status == 200) {
      localStorage.removeItem('session_id'); //  sets to null
      window.location.href = '/login';
    }
  }
}
```

<br/><br/><br/><br/>



<h3 id="c-9"> ☑️ Step 9. ☞  Test the code!  </h3>

Refresh the server, and make sure you're logged in -- if not, register a new user.  
Try the logout button.  You should be logged out and directed to `/login`. 

<br/><br/><br/><br/>



<h3 id="c-10"> ☑️ Step 10.  Add API route login to <code>server.js</code>  </h3>

We'll edit `server/server.js` in two places.  
First, in `api_POST_routes`, add a call to `POST_login`:  

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
    }
  })
}
```

Then, between `POST_register` and `POST_logout`, add this:  

```javascript
function POST_login(login_info, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  let user_data = DataBase.table('users').find({ username: login_info.username });
  let response = {
    error: false,
    msg: '',
    user_data: '',
    session_id: ''
  }
  if (user_data.length < 1) {
    response.error = true;
    response.msg = 'No user found.';
    res.write(JSON.stringify(response));
    res.end();
    return;
  }
  let password = crypto.pbkdf2Sync(login_info.password, user_data[0].salt, 1000, 64, `sha512`).toString(`hex`);
  if (password != user_data[0].password) {
    response.error = true;
    response.msg = 'Incorrect password.';
  } else {
    response.user_data = user_data[0];
    let expire_date = new Date()
    expire_date.setDate(expire_date.getDate() + 30);
    response.session_id = DataBase.table('sessions').insert({
      user_id: user_data[0].id,
      expires: expire_date
    })
  }
  res.write(JSON.stringify(response));
  res.end();
}
```

<!-- Another 40 line function! :/ TODO -->

<br/><br/><br/><br/>



<h3 id="c-11"> ☑️ Step 11.  Edit <code>login.html</code>  </h3>

Now that we have our API route, we can call it in `login.html`.  
We'll also add validation for the form fields.  

```html
<div class="px-3 center-column">
  <h3>Login</h3>
  <div>Username: <input type="text" tabindex="1" id="username" placeholder="mickeymouse"/></div>
  <div>Password: <input type="password" tabindex="2" id="password"/></div>
  <p id="error"></p>
  <button onclick="login()">Login</button>
</div>

<script>
  const utility_keys = [8, 9, 39, 37, 224]; // backspace, tab, command, arrow keys

  //  Username -- lowercase alphanumeric and _ only
  const username_input = document.getElementById('username');
  const username_regex = /^[a-z0-9_]*$/;
  username_input.addEventListener("keydown", event => {
    if (!username_regex.test(event.key) && !utility_keys.includes(event.keyCode)) {
      event.preventDefault();
      document.getElementById('error').innerHTML = "Username can only contain lowercase letters, numbers, and underscores.";
    } else {
      document.getElementById('error').innerHTML = "";
    }
  });

  function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (username.length < 2) {
      document.getElementById('error').innerHTML = 'Valid username required.';
      return;
    }

    const http = new XMLHttpRequest();
    http.open("POST", "/api/login");
    http.send(JSON.stringify({
      username: username,
      password
    }));
    http.onreadystatechange = (e) => {
      let response;      
      if (http.readyState == 4 && http.status == 200) {
        response = JSON.parse(http.responseText);
        if (!response.error) {
          console.log("Response recieved! Logging you in.");
          localStorage.setItem('session_id', response.session_id);
          _session_id = response.session_id;
          window.location.href = '/';
        } else {
          document.getElementById('error').innerHTML = response.msg;
        }
      }
    }
  }
</script>
```

<br/><br/><br/><br/>



<h3 id="c-12"> ☑️ Step 12. ☞  Test the code!  </h3>

Restart the server!  
Go to `/login`!  
Login as an existing user -- or if you forget a username/password pair, register a new user, log out, and log in.  
Log in should start a new session.  Refresh to make sure you stay logged in. 

<br/><br/><br/><br/>



<h3 id="c-13"> ☑️ Step 13. ❖ Part C review. </h3>

The complete code for Part C is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_C).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-d" align="center">  Part D :  User settings </h2>

In this part, we'll create a new page called `/profile`, where the user can edit their profile data.

<br/><br/><br/><br/>



<h3 id="d-1"> ☑️ Step 1.  Add an update function to <code>database.js</code>  </h3>

In `/server/database/database.js`, add this after our `insert` function:
```javascript
  update(id, update) {
    //  Look for row to update...
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].id == id) {
        let update_keys = Object.keys(update);
        for (let j = 0; j < update_keys.length; j++) {
          if (update_keys[j] != 'id') {
            this.rows[i][update_keys[j]] = update[update_keys[j]];
          }
        }
        fs.writeFileSync(`${__dirname}/table_rows/${this.name}.json`, JSON.stringify(this.rows, null, 2));
        return this.rows[i];
      }
    }
    return null;
  }
```

<br/><br/><br/><br/>



<h3 id="d-2"> ☑️ Step 2.  Add POST_update_user and a URL route to <code>server.js</code>  </h3>


First, update this:  

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
    }
  })
}
```

Then, add this beneath `POST_user_by_session`:  

```javascript
function POST_update_user(user_update, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});

  //  Make sure the username, email, and phone are unique. 
  let user_data = fs.readFileSync(__dirname + '/database/table_rows/users.json', 'utf8');
  user_data = JSON.parse(user_data);
  let response = {
    error: false,
    msg: '',
    updated_user: ''
  }
  for (let i = 0; i < user_data.length; i++) {
    if (user_data[i].id != user_update.id) {
      if (user_data[i].username == user_update.username) {
        response.error = true;
        response.msg = 'Username already taken.';
        break;
      } else if (user_data[i].email == user_update.email) {
        response.error = true;
        response.msg = 'Email already taken.';
        break;
      } else if (user_data[i].phone == user_update.phone) {
        response.error = true;
        response.msg = 'Phone number already taken.';
        break;
      }
    }
  }

  //  If the update is valid, save it.
  if (!response.error) {
    response.updated_user = DataBase.table('users').update(user_update.id, user_update);
    if (response.updated_user == null) {
      response.error = true;
      response.msg = `No user found for ${user_update.id}.`
    }
  }

  res.write(JSON.stringify(response));
  res.end();
}
```

While we're in `server.js`, let's add a URL route to our `pageURLs` dictionary.  

```javascript
//  Mapping URLs to pages
var pageURLs = {
  '/': '/pages/misc/landing.html',
  '/landing': '/pages/misc/landing.html',
  '/register': '/pages/misc/register.html',
  '/login': '/pages/misc/login.html',
  '/profile': '/pages/misc/profile.html'
}
var pageURLkeys = Object.keys(pageURLs);
```

<br/><br/><br/><br/>



<h3 id="d-3"> ☑️ Step 3.  Edit <code>/index.js</code>  </h3>

We're going to add a new mechanism in `index.js`, which we'll use in `/profile.html`.  
We'll need an empty function called `current_user_loaded`:  

```javascript
////  SECTION 2: Functions.

//  Log out
function logout() {
  const http = new XMLHttpRequest();
  http.open("POST", "/api/logout");
  http.send(_session_id);
  http.onreadystatechange = (e) => {
    if (http.readyState == 4 && http.status == 200) {
      localStorage.removeItem('session_id'); //  sets to null
      window.location.href = '/login';
    }
  }
}

function current_user_loaded() {}
```

Then, we'll call `current_user_loaded` in `boot()`, right after we get the session and load the user.  

```javascript
function boot() {
  console.log("Welcome to Rooftop Media Dot Org!!");

  //  Log user in if they have a session id. 
  if (_session_id) {
    const http = new XMLHttpRequest();
    http.open("POST", "/api/user-by-session");
    http.send(_session_id);
    http.onreadystatechange = (e) => {
      if (http.readyState == 4 && http.status == 200) {
        _current_user = JSON.parse(http.responseText);
        current_user_loaded();
        document.getElementById('user-buttons').innerHTML = `<a href="/profile">${_current_user.display_name}</a>`;
        document.getElementById('user-buttons').innerHTML += `<button onclick="logout()">Log out</button>`;
      } else if (http.readyState == 4 && http.status == 404) {
        console.log('No session found.');
        localStorage.removeItem('session_id');
      }
    }
  }
  
  //  Redirect away from register or login if we're logged in.
  if ((_current_page == '/register' || _current_page == '/login') && _session_id != null) {
    window.location.href = '/';
  }
  
}
```

<br/><br/><br/><br/>



<h3 id="d-4"> ☑️ Step 4.  Add the file <code>/pages/misc/profile.html</code>  </h3>

Add a file, `/pages/misc/profile.html`.  
This page provides a form to update the user's information.  
We'll write the function to update the user's password in the next few steps.  

```html
<div class="px-3 center-column">
  <h3><span id="user_display_name"></span> - Profile</h3>
  <div>Username: <input type="text" tabindex="1" id="username" placeholder="mickeymouse"/></div>
  <div>Display name: <input type="text" tabindex="2" id="display_name" placeholder="Mickey Mouse"/></div>
  <div>Email: <input type="text" tabindex="3" id="email" placeholder="mickey@mouse.org"/></div>
  <div>Phone #: <input type="text" tabindex="4" id="phone" placeholder="555-555-5555"/></div>
  <p id="error"></p>
  <button onclick="update_profile()">Update profile</button>

  <br/>
  <h4>Change your password:</h4>
  <div>Old password: <input type="password" tabindex="5" id="old_password"/></div>
  <div>New password: <input type="password" tabindex="6" id="new_password"/></div>
  <div>Confirm new password: <input type="password" tabindex="7" id="confirm_new_password"/></div>
  <p id="pass_error"></p>
  <button onclick="update_password()">Update password</button>
</div>

<script>
//  Fire this when the user's data loads 
function update_form() {
  document.getElementById('username').value = _current_user.username;
  document.getElementById('display_name').value = _current_user.display_name;
  document.getElementById('email').value = _current_user.email;
  document.getElementById('phone').value = _current_user.phone;
}
current_user_loaded = function() {
  update_form();
}


const utility_keys = [8, 9, 39, 37, 224]; // backspace, tab, command, arrow keys

//  Username -- lowercase alphanumeric and _ only
const username_input = document.getElementById('username');
const username_regex = /^[a-z0-9_]*$/;
username_input.addEventListener("keydown", event => {
  if (!username_regex.test(event.key) && !utility_keys.includes(event.keyCode)) {
    event.preventDefault();
    document.getElementById('error').innerHTML = "Username can only contain lowercase letters, numbers, and underscores.";
  } else {
    document.getElementById('error').innerHTML = "";
  }
});

//  Email
const email_input = document.getElementById('email');
const email_regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
var email_val = email_input.value;
email_input.addEventListener("input", event => {
  email_val = email_input.value;
  if (!email_regex.test(email_val) && !utility_keys.includes(event.keyCode)) {
    document.getElementById('error').innerHTML = "Invalid email format";
  } else {
    document.getElementById('error').innerHTML = "";
  }
});

//  Phone
const phone_input = document.getElementById('phone');
const phone_regex = /^[0-9\-]{0,12}$/;
var phone_val = "";
phone_input.addEventListener("keydown", event => {
  phone_val = phone_input.value
  if (!phone_regex.test(phone_val + event.key) && !utility_keys.includes(event.keyCode) || event.keyCode == 173) {
    event.preventDefault();
  } else if (event.keyCode != 8) {
    if (phone_val.length == 3 || phone_val.length == 7) {
      phone_input.value = phone_input.value + "-";
    }
  } else {
    if (phone_val.length == 5 || phone_val.length == 9) {
      phone_input.value = phone_input.value.slice(0,-1);
    }
  }
});

function update_profile() {
  var username = document.getElementById('username').value;
  var display_name = document.getElementById('display_name').value;
  var email = document.getElementById('email').value;
  var phone = document.getElementById('phone').value;
  if (username.length < 2) {
    document.getElementById('error').innerHTML = 'Valid username required.';
    return;
  }

  const http = new XMLHttpRequest();
  http.open("POST", "/api/update-user");
  http.send(JSON.stringify({
    id: _current_user.id,
    username: username,
    display_name,
    email,
    phone
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        document.getElementById('error').innerHTML = 'Profile updated!';
        _current_user = response.updated_user;
        update_form();
        document.getElementById('user-buttons').innerHTML = `<a href="/profile">${_current_user.display_name}</a>`;
        document.getElementById('user-buttons').innerHTML += `<button onclick="logout()">Log out</button>`;
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}

function update_password() {
  
}
</script>
```

<br/><br/><br/><br/>



<h3 id="d-5"> ☑️ Step 5. ☞  Test the code!  </h3>

Restart the server, and go to `/profile`.  Try updating your user profile info.  It should work!  
Try providing a username, email, and phone that are already taken.  An error should display!  

<br/><br/><br/><br/>



<h3 id="d-6"> ☑️ Step 6. Adding POST_update_passsword to <code>server.js</code>  </h3>

Let's add a new api route to `server.js`

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
    }
  })
}
```

And we'll add `POST_update_password` as well, below `POST_update_user`:  

```javascript
function POST_update_password(password_update, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});

  let user_data = DataBase.table('users').find({ id: password_update.id });
  let response = {
    error: false,
    msg: '',
  }
  if (user_data.length < 1) {
    response.error = true;
    response.msg = 'No user found.';
    res.write(JSON.stringify(response));
    res.end();
    return;
  }
  let password = crypto.pbkdf2Sync(password_update.old_password, user_data[0].salt, 1000, 64, `sha512`).toString(`hex`);
  let new_pass = '';
  if (password != user_data[0].password) {
    response.error = true;
    response.msg = 'Incorrect password.';
  } else {
    new_pass = crypto.pbkdf2Sync(password_update.new_password, user_data[0].salt, 1000, 64, `sha512`).toString(`hex`);
  }

  if (!response.error) {
    response.updated_user = DataBase.table('users').update(password_update.id, {password: new_pass});
    if (response.updated_user == null) {
      response.error = true;
      response.msg = `No user found for session ${password_update.id}.`
    }
  }

  res.write(JSON.stringify(response));
  res.end();
}
```

<br/><br/><br/><br/>


<h3 id="d-7"> ☑️ Step 7. Adding <code>update_password</code> to <code>profile.html</code>  </h3>

In `profile.html`, add this to our `update_password()` function:  

```javascript
function update_password() {
  var old_password = document.getElementById('old_password').value;
  var new_password = document.getElementById('new_password').value;
  var confirm_new_password = document.getElementById('confirm_new_password').value;
  if (new_password != confirm_new_password) {
    document.getElementById('error').innerHTML = 'New passwords must match.';
    return;
  }
  const http = new XMLHttpRequest();
  http.open("POST", "/api/update-password");
  http.send(JSON.stringify({
    id: _current_user.id,
    old_password,
    new_password
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText);
      if (!response.error) {
        document.getElementById('pass_error').innerHTML = 'Password updated!';
        _current_user = response.updated_user;
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    }
  }
}
```

<br/><br/><br/><br/>



<h3 id="d-8"> ☑️ Step 8. ☞  Test the code!  </h3>

While logged in, try changing the password of a user.  
Log out and log back in again to make sure the password is changed.

<br/><br/><br/><br/>




<h3 id="d-9"> ☑️ Step 9. ❖ Part D review. </h3>

The complete code for Part D is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_D).

<br/><br/><br/><br/>
<br/><br/><br/><br/>



<h2 id="part-e" align="center">  Part E :  Mobile Design </h2>

In this part, we'll edit our website to make sure it looks good on phone browsers.  

We'll do this by [testing the website on a phone](https://prowe214.medium.com/tip-how-to-view-localhost-web-apps-on-your-phone-ad6b2c883a7c).  
We'll also add a dark mode in this part. 

We want our website to be compliant with standard accessibility requirements, including [ADA](https://www.ada.gov/resources/web-guidance/) and [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/). 

<br/><br/><br/><br/>



<h3 id="e-1"> ☑️ Step 1.  ☞  Test the code -- on your phone!! 📲 </h3>

For this step, you'll need a phone that's connected to the same network as your computer, and your computer's local (internal) IP address.  
Start the server on your computer, and then, on your phone, go to `http://<computer's local IP address>:<port number>`.  

You should see the website's landing page!  

Let's make note of some things we'll need to fix:
 - The page's content is much too small on a mobile browser. 
 - The menu bar is also too small. 
 - Some content, like the landing page's "articles", should collapse into a single column, suitable for the vertical screen.

<br/><br/><br/><br/>



<h3 id="e-2"> ☑️ Step 2.  Adding the <code>viewport</code> meta tag in <code>/pages/index.html</code> </h3>

The [viewport meta tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag) will make our website's fonts and images appear in the correct pixel size for a mobile browser's screen.  

Add one line in the `<head>` tag of `index.html`:

```html
  <head>
    <title>&#x2756;  Rooftop Media &#x2756;</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/favicon-16x16.png">
    <link rel="manifest" href="/assets/favicons/site.webmanifest">
    
    <link rel="stylesheet" href="/pages/index.css">
    <script src="/pages/index.js"></script>
  </head>
```

<br/><br/><br/><br/>



<h3 id="e-3"> ☑️ Step 3.  Setting up device breakpoints in <code>/pages/misc/landing.html</code> </h3>

We'll set up a CSS "breakpoint" for mobile devices, to change the landing page's image, and the layout of the thumbnail links.  

Add this to the bottom of the css in `/pages/misc/landing.html`:

```css
  @media only screen and (max-width: 650px) {
    .thumb-container {
      flex-flow: column;
      align-items: center;
    }
    #comic {
      width: 180vw;
      margin: auto;
      object-fit: contain;
      margin-left: -50vw;
    }
  } 
```

<br/><br/><br/><br/>



<h3 id="e-4"> ☑️ Step 4.  ☞  Test the code -- on your phone!! 📲 </h3>

Load the landing page on your phone.  It should look the correct size, with all the changes we made. 

<br/><br/><br/><br/>



<h3 id="e-5"> ☑️ Step 5.  Add a dark mode button in <code>/pages/index.html</code> </h3>


<br/><br/><br/><br/>


<h3 id="e-6"> ☑️ Step 5.  Add dark mode to <code>/pages/index.js</code> </h3>

Adding 

<br/><br/><br/><br/>



<h3 id="e-?"> ☑️ Step ?. ❖ Part E review. </h3>

The complete code for Part E is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version1.0/part_E).

<br/><br/><br/><br/>
<br/><br/><br/><br/>






<h2 id="v2" align="center">  Version 2: The CMS </h2>

With this section complete, you're ready to move on to the tutorial for [version 2.0](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md)!

<br/><br/><br/><br/><br/><br/><br/><br/>



