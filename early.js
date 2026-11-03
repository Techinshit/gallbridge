try {
  chrome.storage.local.get("gallbridge-settings", (items) => {
    const settings = items["gallbridge-settings"] || {};
    const root = document.documentElement;
    root.classList.add("gb-root");
    if (settings.darkMode) root.classList.add("gb-dark");
    if (settings.systemFont) root.classList.add("gb-font");
    if (settings.systemFont && settings.fontSize) {
      root.style.setProperty("--gb-font-size", `${settings.fontSize}px`);
    }
  });
} catch {
  /* storage unavailable */
}
