////  SECTION 1: Main website memory.
var _current_page  = window.location.pathname;
var _session_id = localStorage.getItem('session_id');
var _current_user = null;
var _show_user_menu = false;
var _dark_mode = localStorage.getItem('dark_mode');

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
    if (_current_page == '/create-page' || _current_page == '/all-pages' || _current_page.split('/')[1] == 'edit') {
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
  let userButtonsEl = document.getElementById('user-buttons');
  let buttonText = `Menu`;
  let menuHTML = `<div id="user-menu">`;

  if (_current_user == null) {
    menuHTML += `<a href="/register">Register</a>`;
    menuHTML += `<a href="/login">Login</a>`;
    menuHTML += `<button onclick="toggle_darkmode()"> &#x1F317; </button>`;
  } else {
    buttonText = _current_user.display_name;
    menuHTML += `<a href="/profile">Your profile</a>`;
    userMenuHTML += `<a href="/create-page">New page</a>`;
    userMenuHTML += `<a href="/all-pages">All pages</a>`;
    menuHTML += `<button onclick="toggle_darkmode()"> &#x1F317; </button>`;
    menuHTML += `<button onclick="logout()">Log out</button>`;
  }

  userButtonsEl.innerHTML = `<button onclick="_show_user_menu = !_show_user_menu;update_header();">${buttonText}</button>`;
  if (_show_user_menu) {
    userButtonsEl.innerHTML += menuHTML + `</div>`;
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
      } else if (http.readyState == 4 && http.status == 404) {
        console.log('No session found.');
        localStorage.removeItem('session_id');
      }
      update_header();
      reroute_if_needed();
    }
  } else {
    update_header();
    reroute_if_needed();
  }
  
}
window.addEventListener('load', (event) => {
  boot()
});