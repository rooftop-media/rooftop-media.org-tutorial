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
| [Part A - Serving Static Pages](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version1.0/tutorial.md#part-a) | 0 min. | 0 |
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
We'll create a webserver that can serve up assets.  
We'll make sure our web pages are handicap accessible and mobile friendly.  
And we'll implement both *server side rendering* and *single page app* design patterns. 

*Estimated time: ?? minutes*

<br/><br/><br/><br/>



<h3 id="a-1">  ☑️ Step 1:  Create a homepage at <code>/pages/index.html</code> </h3>

Create a new folder in the `/rooftop-media.org/` folder, called `/pages/`.  
This is where we'll put the code for our website's pages. 

Inside the new folder, make a file called `index.html`.  

```html

<html>
  <head>
    <title>Rooftop Media</title>
    <meta charset="utf-8">
  </head>
  <body>
    <div id="header">
      Rooftop Media
    </div>
    <div id="content">
      <h1>Welcome!</h1>
    </div>
  </body>
</html>

```

In the `<head>` tag, we describe the page's title, and the character encoding for the page.  
In the `<body>`, we've added some text that will become our header, and some text as the page's content.  

Open the html file in a browser to make sure it shows the content correctly.


<br/><br/><br/><br/>



<h3 id="a-2">  ☑️ Step 2.  Outlining <code>server.js</code> </h3>

Let’s go into `server.js` and add some comments to plan our architecture.

Delete the line of code, which was `console.log('Starting the rooftop-media.org server!");`;.
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
var http = require('http');
var path = require('path');
var fs   = require('fs');
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

<br/><br/><br/><br/>



<h3 id="a-5">  ☑️ Step 5.  Boot sequence for <code>server.js</code> </h3>

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



<h3 id="a-7">  ☑️ Step 7:  Add external files to <code>/pages/index.html</code> </h3>

Now, we'll edit `index.html` again, to add content.  
We'll add an image, a favicon, a CSS file, and a JS file. 

~todo

<br/><br/><br/><br/>


