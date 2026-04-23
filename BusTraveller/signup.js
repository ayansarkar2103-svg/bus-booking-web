async function signupUser() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const signupBtn = document.getElementById("signupBtn");

  if (!firstName || !lastName || !email || !password) {
    alert("Please fill all fields ❌");
    return;
  }

  signupBtn.disabled = true;
  signupBtn.innerText = "Signing up...";

  try {
    const response = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password
      })
    });

    const data = await response.json();
    console.log("Signup response 👉", data);

    if (response.ok && data.success) {
      alert("Signup Successful ✅");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Signup failed ❌");
    }
  } catch (error) {
    console.error("Signup error 👉", error);
    alert("Server error ❌");
  } finally {
    signupBtn.disabled = false;
    signupBtn.innerText = "Signup";
  }
}