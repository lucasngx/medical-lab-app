// Debug authentication state
console.log("=== Authentication Debug Info ===");

// Check localStorage
const token = localStorage.getItem("auth_token");
const user = localStorage.getItem("user");

console.log(
  "Token in localStorage:",
  token ? `${token.substring(0, 20)}...` : "No token found"
);
console.log("User in localStorage:", user);

// Check cookies
const cookies = document.cookie.split(";").map((c) => c.trim());
const authCookie = cookies.find((c) => c.startsWith("auth_token="));
console.log("Auth cookie:", authCookie ? "Found" : "Not found");

// Check Redux store if available
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log("Redux store available for inspection");
}

// Test API call with current token
if (token) {
  fetch("http://localhost:8080/api/examinations", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      console.log("Test API call status:", response.status);
      if (response.status === 403) {
        console.error("❌ Token is invalid or expired");
      } else if (response.status === 401) {
        console.error("❌ Token is missing or malformed");
      } else if (response.ok) {
        console.log("✅ Token is valid");
      }
    })
    .catch((err) => console.error("Test API call failed:", err));
} else {
  console.error("❌ No token found - user needs to login");
}
