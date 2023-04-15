# NodeJS Tutorial for rooftop-media.org, version 4.0

This is a tutorial for building rooftop-media.org version 4.0.  
This version creates an email client, for writing, sending, recieving, and reading emails!
Users will also be able to create email accounts on our website.  

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
| [Part A - /email](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-a) | 20 min. | 13 |
| [Part B - Editing email settings](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-b) | 0 min. | 0 |
| [Part C - Recieving & displaying email](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-c) | 0 min. | 0 |
| [Part D - Sending email](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-d) | 0 min. | 0 |
| [Part E - Search emails](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-e) | 0 min. | 0 |
| [Part F - Folders and drafts](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-f) | 0 min. | 0 |
| [Part G - Spam](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-g) | 0 min. | 0 |
| [Part H - HTML Emails](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#part-h) | 0 min. | 0 |
| [Version 3.0.](https://github.com/rooftop-media/rooftop-media.org-tutorial/blob/main/version2.0/tutorial.md#v2) | Todo | ? |



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

```

<br/><br/><br/><br/>



<h3 id="a-2">  ☑️ Step 2: Adding a Pages table to the database  </h3>

<br/><br/><br/><br/>



<h3 id="a-3">  ☑️ Step 3: Add <code>POST_create_page</code> to <code>/server/server.js</code>  </h3>


```javascript

```

<br/><br/><br/><br/>



<h3 id="a-??">☑️ Step ??. ❖ Part A review. </h3>

The complete code for Part A is available [here](https://github.com/rooftop-media/rooftop-media.org-tutorial/tree/main/version2.0/part_A).

<br/><br/><br/><br/>
<br/><br/><br/><br/>













