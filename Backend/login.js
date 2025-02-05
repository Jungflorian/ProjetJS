const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
  const login = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };
  const replogin = await fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(login),
  });
  const reploginData = await replogin.json();
  if(replogin.status === 200){
    sessionStorage.setItem("authToken", reploginData.token)
    window.location.href = "../FrontEnd/index.html"
  }
});
