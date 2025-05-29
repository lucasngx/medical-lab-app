// Debug script to check authentication state
// Run this in the browser console

function debugAuth() {
  console.log("=== AUTH DEBUG ===");
  
  // Check localStorage
  const token = localStorage.getItem("auth_token");
  const user = localStorage.getItem("user");
  
  console.log("LocalStorage:");
  console.log("- auth_token:", token ? `${token.substring(0, 20)}...` : "NOT FOUND");
  console.log("- user:", user || "NOT FOUND");
  
  // Check cookies
  const cookies = document.cookie;
  console.log("Cookies:", cookies);
  
  // Check if token is JWT and decode it
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        console.log("JWT Payload:", payload);
        console.log("Is Expired:", payload.exp ? payload.exp < currentTime : "No expiration");
        console.log("Expires At:", payload.exp ? new Date(payload.exp * 1000) : "No expiration");
      } else {
        console.log("Token is not a valid JWT format");
      }
    } catch (error) {
      console.log("Error parsing token:", error);
    }
  }
  
  // Test a simple API call
  console.log("Testing API call...");
  fetch('/api/examinations/status/PENDING?page=0&limit=1', {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log("API Test Response:", response.status, response.statusText);
    return response.text();
  })
  .then(data => {
    console.log("API Test Data:", data);
  })
  .catch(error => {
    console.log("API Test Error:", error);
  });
}

// Auto-run the debug
debugAuth();
