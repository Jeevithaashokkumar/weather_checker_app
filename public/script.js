function validateForm() {
  const email = document.forms["userForm"]["email"].value;
  if (!email.includes("@")) {
    alert("Invalid Email!");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const pwd = document.getElementById("password");
  const strength = document.getElementById("strength");
  pwd.addEventListener("input", () => {
    if (pwd.value.length < 6) strength.textContent = "Weak";
    else if (/[A-Z]/.test(pwd.value) && /\d/.test(pwd.value)) strength.textContent = "Strong";
    else strength.textContent = "Medium";
  });
});
