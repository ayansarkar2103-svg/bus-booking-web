async function loginUser() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const loginBtn = document.getElementById("loginBtn");

  if (!email || !password) {
    alert("Please enter email and password ❌");
    return;
  }

  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerText = "Logging in...";
  }

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();
    console.log("Login response 👉", data);

    if (response.ok && data.success) {
      localStorage.setItem("user", data.email);
      localStorage.setItem("name", data.name);

      alert("Login successful ✅");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Login failed ❌");
    }
  } catch (error) {
    console.error("Login error 👉", error);
    alert("Server error ❌");
  } finally {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerText = "Login";
    }
  }
}