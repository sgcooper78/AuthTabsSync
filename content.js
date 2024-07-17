console.log('Content script loaded');

// You can add any additional functionality you need here, if required

// Example of a simple event listener
document.addEventListener("click", (event) => {
  console.log('Element clicked:', event.target);
});