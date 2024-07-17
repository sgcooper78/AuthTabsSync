console.log('Content script loaded');

// Helper function to check for login or logout related keywords
function isAuthButton(element) {
  const loginKeywords = ['sign', 'login', 'log in', 'logon', 'signin', 'signon', 'sign in'];
  const logoutKeywords = ['logout', 'log out', 'signout', 'sign out'];

  // Convert element properties to lower case strings
  const properties = [
    element.id,
    element.className,
    element.innerText,
    element.getAttribute('name'),
    element.getAttribute('value'),
    element.getAttribute('placeholder'),
    element.getAttribute('aria-label'),
    element.getAttribute('title')
  ].filter(Boolean).map(prop => prop.toLowerCase());

  // Check data-* attributes
  const dataAttributes = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('data-'))
    .map(attr => attr.value.toLowerCase());

  const allProperties = properties.concat(dataAttributes);

  const isLogin = loginKeywords.some(keyword => allProperties.some(prop => prop.includes(keyword)));
  const isLogout = logoutKeywords.some(keyword => allProperties.some(prop => prop.includes(keyword)));

  return { isLogin, isLogout };
}

document.addEventListener("submit", (event) => {
  console.log("Form submit event detected");
  chrome.runtime.sendMessage({ type: "loginDetected" });
});

// Listener for all clicks
document.addEventListener("click", (event) => {
  const target = event.target;
  const authStatus = isAuthButton(target);
  console.log(authStatus);
  if (authStatus.isLogin) {
    console.log("Login button/link detected");
    chrome.runtime.sendMessage({ type: "loginDetected" });
  } else if (authStatus.isLogout) {
    console.log("Logout button/link detected");
    chrome.runtime.sendMessage({ type: "logoutDetected" });
  }
});