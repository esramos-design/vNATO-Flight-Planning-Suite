/**
 * Virtual NATO Flight Planning Suite - Footer Component
 * Isolate and manage footer metadata, versions, and links here.
 */
document.addEventListener("DOMContentLoaded", function() {
  const footerContainer = document.getElementById("widgetFooterContainer");
  if (footerContainer) {
    footerContainer.innerHTML = `
      <div class="widget-meta">
        <b>Virtual NATO Flight Planning Suite</b><br>
        Property of Virtual NATO &copy; 2017–2026. All rights reserved.<br>
        Version 5.0.7 - ALPHA BUILD
      </div>
    `;
  }
});
