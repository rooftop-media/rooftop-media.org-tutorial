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

////  SECTION 3: Boot.
function boot() {
  console.log(`Welcome to Rooftop Media Dot Org!`);
  
  //  Log user in if they have a session id. 
  if (_session_id) {
    const http = new XMLHttpRequest();
    http.open(`GET`, `/api/user-by-session?session_id=${_session_id}`);
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