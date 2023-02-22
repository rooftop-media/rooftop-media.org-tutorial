function register() {
  var username = document.getElementById('username').value;
  var display_name = document.getElementById('display_name').value;
  var email = document.getElementById('email').value;
  var phone = document.getElementById('phone').value;
  var password = document.getElementById('password').value;
  var confirm_password = document.getElementById('confirm_password').value;
  if (password != confirm_password) {
    document.getElementById('error').innerHTML = 'Passwords must match.';
    return;
  }
  if (username.length < 2) {
    document.getElementById('error').innerHTML = 'Valid username required.';
    return;
  }

  const http = new XMLHttpRequest();
  http.open("POST", "/api/register");
  http.send(JSON.stringify({
    username: username,
    display_name,
    email,
    phone,
    password
  }));
  http.onreadystatechange = (e) => {
    let response;      
    if (http.readyState == 4 && http.status == 200) {
      response = JSON.parse(http.responseText)
      if (!response.error) {
        console.log("Response recieved! Logging you in.")
        goto('/landing')
      } else {
        document.getElementById('error').innerHTML = response.msg;
      }
    } else {
      document.getElementById('error').innerHTML = "Error registering this user.";
    }
  }
}