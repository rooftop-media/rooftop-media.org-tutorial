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