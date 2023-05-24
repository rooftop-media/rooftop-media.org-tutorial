////  SECTION 1: Main website memory.
var _current_page  = window.location.pathname;
var _session_id = localStorage.getItem('session_id');
var _current_user = null;
var _show_user_menu = false;

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

// Update the "user buttons" in the header
function update_header() {
  let userButtonsEl = document.getElementById('user-buttons');
  let buttonText = `Menu`;
  let menuHTML = `<div id="user-menu">`;

  if (_current_user == null) {
    menuHTML += `<a href="/register">Register</a>`;
    menuHTML += `<a href="/login">Login</a>`;
  } else {
    buttonText = _current_user.display_name;
    menuHTML += `<a href="/profile">Your profile</a>`;
    menuHTML += `<button onclick="logout()">Log out</button>`;
  }

  userButtonsEl.innerHTML = `<button onclick="_show_user_menu = !_show_user_menu;update_header();">${buttonText}</button>`;
  if (_show_user_menu) {
    userButtonsEl.innerHTML += menuHTML + `</div>`;
  }

}


////  SECTION 3: Boot.
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
    }
  } else {
    update_header();
  }
  
  //  Redirect away from register or login if we're logged in.
  if ((_current_page == '/register' || _current_page == '/login') && _session_id != null) {
    window.location.href = '/';
  }
  
}
window.addEventListener('load', (event) => {
  boot()
});