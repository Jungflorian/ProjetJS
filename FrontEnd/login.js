const loginForm = document.getElementById("loginForm");
const errorMessage = document.createElement("p");
errorMessage.style.color = "red";
errorMessage.style.display = "none";
loginForm.appendChild(errorMessage);

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  
  const login = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  try {
    const replogin = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(login),
    });

    const reploginData = await replogin.json();

    if (replogin.status === 200) {
      sessionStorage.setItem("authToken", reploginData.token);
      window.location.href = "./index.html";
    } else {
      throw new Error(reploginData.message || "Email ou mot de passe incorrect");
    }
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.style.display = "block";
  }
});
if (replogin.status === 200) {
  sessionStorage.setItem("authToken", reploginData.token);
  window.location.href = "./index.html";
}
