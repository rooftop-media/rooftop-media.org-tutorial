# NodeJS Tutorial for rooftop-media.org, version 4.0

This is a tutorial for building rooftop-media.org version 4.0.  
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
| [Part A - /email, /email/:msgid, /email/settings](#part-a) | ? min. | ? |
| [Part B - Editing email settings](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-b) | 0 min. | 0 |
| [Part C - Recieving & displaying email](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-c) | 0 min. | 0 |
| [Part D - Sending email](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-d) | 0 min. | 0 |
| [Part E - Search emails](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-e) | 0 min. | 0 |
| [Part F - Folders and drafts](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-f) | 0 min. | 0 |
| [Part G - Spam](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-g) | 0 min. | 0 |
| [Part H - HTML Emails](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-h) | 0 min. | 0 |
| [Version 5.0.](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#v2) | Todo | ? |



<br/><br/><br/><br/><br/><br/><br/><br/>





<h2 id="part-a" align="center">  Part A:  <code>/email</code></h2>

In this part, we'll create two static pages to facilitate the basic creation of dynamic pages:
 - `/create-page`, where users can create a new page with a specific title and route, and
 - `/pages`, where users can see all created pages.

Dynamic pages will be saved to the database, and accessible at different URL routes.  
We'll make sure a user is logged in before they can create pages. 

<br/><br/><br/><br/>



<h3 id="a-1">  ☑️ Step 1: Create <code>/pages/email/email.html</code>  </h3>

Create a new folder called `/pages/email`.  In it, add a new file, `email.html`.  

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



<h3 id="a-2">  ☑️ Step 2: Adding <code>email</code> to the server </h3>

In `/server/server.js`, edit this:

```html
//  Mapping URLs to pages
var pageURLs = {
  '/': '/pages/misc/landing.html',
  '/landing': '/pages/misc/landing.html',
  '/register': '/pages/misc/register.html',
  '/login': '/pages/misc/login.html',
  '/profile': '/pages/misc/profile.html',
  '/email': '/pages/email/email.html'
}
var pageURLkeys = Object.keys(pageURLs);
```

<br/><br/><br/><br/>



<h3 id="a-3"> ☑️ Step 3. ☞  Test the code!  </h3>

Open up `localhost:8080/email` to make sure the email page loads correctly. 

<br/><br/><br/><br/>



<h3 id="a-4">  ☑️ Step 4: Recieving an email in <code>server.js</code> with SMTP  </h3>


```javascript

```

<br/><br/><br/><br/>



<h3 id="a-??">☑️ Step ??. ❖ Part A review. </h3>

The complete code for Part A is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_A).

<br/><br/><br/><br/>
<br/><br/><br/><br/>













