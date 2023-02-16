# NodeJS Tutorial for rooftop-media.org, version 1.0

This is a tutorial for building rooftop-media.org version 1.0.  
This version creates a website with a few static pages, and user management.

*Total estimated time for this tutorial: ADD EESTIMATED TIME*

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

Along the way, we’ll create a webserver that can serve up assets, do SSR, and more. 

*Estimated time: ?? minutes*

<br/><br/><br/><br/>



<h3 id="a-1">  ☑️ Step 1:  Edit <code>server.js</code> </h3>

We’ll add a text file to the directory too, called `sample.txt`. 
It just needs a couple lines of any text. Here’s what I wrote:

```
Hello there, world!  Nice to see you!
This is some sample text in sample.txt. :)
Lorem ipsum, foo bar baz.
The quick brown fox jumped over the lazy dog.


Unique New York.
The sixth sheik's sixth sheep's sick. 
She sells seashells by the seashore. 
Cellar door.  White rabbit, white rabbit, white rabbit. 
```

Our goal will be to open & edit this file with ktty. 

<br/><br/><br/><br/>




<h3 id="a-2">  ☑️ Step 2. Outlining <code>ktty.js</code>  </h3>

Let’s go into ktty.js and add some comments to plan our architecture.  

Delete the 2nd line, which was  `console.log('Starting ktty!');`.  
We’ll outline 6 sections. Here’s what we’ll write:

```javascript
#!/usr/bin/env node

////  SECTION 1:  Imports.

////  SECTION 2:  App memory. 

////  SECTION 3:  Boot stuff.

////  SECTION 4:  Events.

////  SECTION 5:  Draw functions.

////  SECTION 6:  Algorithms.
```

We’ll reference these 6 sections throughout the rest of this version.

<br/><br/><br/><br/>
