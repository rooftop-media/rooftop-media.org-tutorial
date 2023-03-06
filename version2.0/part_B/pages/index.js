////  SECTION 1: Main website memory.
var _current_page  = window.location.pathname;
var _session_id = localStorage.getItem('session_id');
var _current_user = null;

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

// Reroute the user if their log in status doesn't match the page
function reroute_if_needed() {
  if (_current_user == null) {
    if (_current_page == '/create-page' || _current_page == '/all-pages') {
      window.location.href = '/';
    }
  } else {
    if (_current_page == '/register' || _current_page == '/login') {
      window.location.href = '/';
    }
  }
}

// Update the "user buttons" in the header
function update_header() {
  if (_current_user != null) {
    document.getElementById('user-buttons').innerHTML = `<a href="/profile">${_current_user.display_name}</a>`;
    document.getElementById('user-buttons').innerHTML += `<a href="/create-page">New page</a>`;
    document.getElementById('user-buttons').innerHTML += `<a href="/all-pages">All pages</a>`;
    document.getElementById('user-buttons').innerHTML += `<button onclick="logout()">Log out</button>`;
  }
}

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
        current_user_loaded();
        reroute_if_needed()
        update_header()
      } else if (http.readyState == 4 && http.status == 404) {
        console.log('No session found.');
        localStorage.removeItem('session_id');
        reroute_if_needed();
      }
    }
  } else {
    reroute_if_needed();
  }
  
}
window.addEventListener('load', (event) => {
  boot()
});