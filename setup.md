# Set up for the rooftop-media.org tutorial

The website's functionality is mostly built with Javascript, HTML, and CSS. 
A basic understanding of those languages is probably required for this tutorial.

You'll also need a basic understanding of some terms involved in computer programming, and command line use.

To follow this tutorial, you'll also need to have [NodeJS](https://nodejs.org/en/) installed on a computer.  
NodeJS lets you use Javascript outside of the web browser, to interact with our computer's files and text terminal, instead of browser pages.

NodeJS has some [nice documentation](https://nodejs.org/en/docs/).  
This code follows a NodeJS [style guide](https://github.com/felixge/node-style-guide) created by Felix Geisendörfer.  
 - Rules include:
   - Always use single quotes for strings.
   - Limit functions to 15-20 lines of code. 

<br/><br/><br/><br/>


##  Initial Steps

☑️ **Step 1**: Find a text terminal app.  

The webserver will run in a text terminal.  Some text editors, like VSCode, have built in terminals.  Alternately, you can use any text terminal emulator that supports NodeJS. For Mac, I recommend Terminal.app.  For Windows, I recommend Powershell.exe.  

Open your text terminal app.

<br/><br/><br/><br/>



☑️ **Step 2**: Set up a directory.  

With your text terminal app open, create a new folder, and navigate into it. 

```shell
$ mkdir rooftop-media.org    # Make the rooftop-media.org folder.
$ cd rooftop-media.org       # Go into the rooftop-media.org folder.
```

We can check that we’re in our new directory 
by running the print working directory command. 

```shell
$ pwd           # Print Working Directory – expected output below.
/user/rooftop-media.org/     
```

<br/><br/><br/><br/>


☑️ **Step 3**: Set up a directory for our server.

Inside our new rooftop-media.org directory, make a new directory called `/server/`, and navigate into it.
```shell
$ mkdir server    
$ cd server       
$ pwd           
/user/rooftop-media.org/server
```

<br/><br/><br/><br/>


☑️ **Step 4**: Create & edit server.js with a code editor of choice.

With some code editor, like [emacs](https://www.gnu.org/software/emacs/) or [Visual Studio Code](https://code.visualstudio.com/), create a new file in your `/server/` folder called `server.js`.

We'll add one line to our file:

```js
console.log('Starting the rooftop-media.org server!");
```

<br/><br/><br/><br/>



☑️ **Step 5**: ☞ Test the code!

Back in our text terminal, we can test run our `server.js` file with NodeJS like so:

```shell
$ node ./server.js   #  If you’re in the right folder, this should run it!
Starting the rooftop-media.org server!
```

If you get an error on this step, make sure have [NodeJS](https://nodejs.org/en/) installed.  
Also, make sure you're in the /server/ folder.


<br/><br/><br/><br/>






