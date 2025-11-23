// includes.js
document.addEventListener("DOMContentLoaded", () => {
  const includes = document.querySelectorAll("[data-include]");
  includes.forEach(el => {
    const url = el.getAttribute("data-include");
    if (!url) return;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Include failed: " + url);
        return res.text();
      })
      .then(html => {
        el.innerHTML = html;
      })
      .catch(err => console.error(err));
  });
});
