"use strict";
(() => {
  // src/lib/gallbridge/settings.ts
  var SETTINGS_KEY = "gallbridge-settings";
  var DEFAULT_SETTINGS = {
    openNewTab: false,
    hideBlocked: true,
    showIp: true,
    showUserId: true,
    systemFont: false,
    fontSize: 15,
    autoRefresh: false,
    refreshSec: 5,
    darkMode: false,
    showFullTime: true,
    blockMobile: false,
    blockSkt: true,
    blockKt: true,
    blockLgu: true,
    keywords: "",
    users: "",
    keyboard: true
  };
  function bool(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
  }
  function sanitize(raw) {
    const src = raw && typeof raw === "object" ? raw : {};
    const fontSize = Number(src.fontSize);
    const refreshSec = Number(src.refreshSec);
    return {
      openNewTab: bool(src.openNewTab, DEFAULT_SETTINGS.openNewTab),
      hideBlocked: bool(src.hideBlocked, DEFAULT_SETTINGS.hideBlocked),
      showIp: bool(src.showIp, DEFAULT_SETTINGS.showIp),
      showUserId: bool(src.showUserId, DEFAULT_SETTINGS.showUserId),
      systemFont: bool(src.systemFont, DEFAULT_SETTINGS.systemFont),
      fontSize: Number.isFinite(fontSize) ? Math.min(18, Math.max(13, Math.round(fontSize))) : DEFAULT_SETTINGS.fontSize,
      autoRefresh: bool(src.autoRefresh, DEFAULT_SETTINGS.autoRefresh),
      refreshSec: Number.isFinite(refreshSec) ? Math.min(60, Math.max(3, Math.round(refreshSec))) : DEFAULT_SETTINGS.refreshSec,
      darkMode: bool(src.darkMode, DEFAULT_SETTINGS.darkMode),
      showFullTime: bool(src.showFullTime, DEFAULT_SETTINGS.showFullTime),
      blockMobile: bool(src.blockMobile, DEFAULT_SETTINGS.blockMobile),
      blockSkt: bool(src.blockSkt, DEFAULT_SETTINGS.blockSkt),
      blockKt: bool(src.blockKt, DEFAULT_SETTINGS.blockKt),
      blockLgu: bool(src.blockLgu, DEFAULT_SETTINGS.blockLgu),
      keywords: typeof src.keywords === "string" ? src.keywords.slice(0, 4e3) : "",
      users: typeof src.users === "string" ? src.users.slice(0, 4e3) : "",
      keyboard: bool(src.keyboard, DEFAULT_SETTINGS.keyboard)
    };
  }

  // src/lib/gallbridge/popup-main.ts
  function chromeApi() {
    return globalThis.chrome;
  }
  var TOGGLES = [
    { key: "openNewTab", label: "\uAC8C\uC2DC\uBB3C \uC0C8 \uD0ED\uC5D0\uC11C \uC5F4\uAE30" },
    { key: "hideBlocked", label: "\uCC28\uB2E8 \uAC8C\uC2DC\uBB3C \uC228\uAE30\uAE30", hint: "\uB514\uC2DC\uAC00 \uD750\uB9AC\uAC8C \uB454 \uAE00\uAE4C\uC9C0 \uC811\uC2B5\uB2C8\uB2E4." },
    { key: "showIp", label: "IP \uC815\uBCF4 \uD45C\uC2DC", hint: "\uAD6D\uB0B4 \uCD08\uB85D \xB7 \uBAA8\uBC14\uC77C \uD30C\uB791 \xB7 \uD574\uC678\xB7\uD504\uB85D\uC2DC \uBE68\uAC15" },
    { key: "showUserId", label: "\uBE44\uACE0\uC815\uB2C9 ID \uD45C\uC2DC" },
    { key: "showFullTime", label: "\uC2DC\uAC04 \uC804\uCCB4 \uD45C\uC2DC" },
    { key: "systemFont", label: "\uAE30\uBCF8 \uAE00\uAF34" },
    { key: "darkMode", label: "\uB2E4\uD06C \uBAA8\uB4DC" },
    { key: "autoRefresh", label: "\uC790\uB3D9 \uAC31\uC2E0", hint: "\uBAA9\uB85D\uC5D0\uC11C\uB9CC, \uD0ED\uC774 \uBCF4\uC77C \uB54C\uB9CC. \uCD5C\uC18C 3\uCD08." },
    { key: "blockMobile", label: "\uD1B5\uC2E0\uC0AC IP \uC228\uAE30\uAE30", hint: "\uB514\uC2DC \uCC28\uB2E8\uBAA9\uB85D\uC774 \uC544\uB2C8\uB77C \uC774 \uD654\uBA74\uC5D0\uC11C\uB9CC \uC228\uAE41\uB2C8\uB2E4." },
    { key: "keyboard", label: "J / K \uC774\uB3D9" }
  ];
  function row(label, control, hint) {
    const wrap = document.createElement("label");
    wrap.className = "row";
    const text = document.createElement("span");
    text.className = "row-text";
    const name = document.createElement("span");
    name.textContent = label;
    text.appendChild(name);
    if (hint) {
      const sub = document.createElement("small");
      sub.textContent = hint;
      text.appendChild(sub);
    }
    wrap.append(text, control);
    return wrap;
  }
  function boot() {
    const api = chromeApi();
    const app = document.querySelector("#app");
    if (!app) return;
    api.storage.local.get(SETTINGS_KEY, (items) => {
      let settings = sanitize(items[SETTINGS_KEY] ?? DEFAULT_SETTINGS);
      const save = () => {
        api.storage.local.set({ [SETTINGS_KEY]: settings });
      };
      const head = document.createElement("header");
      head.innerHTML = `<strong>\uAC24\uBE0C\uB9BF\uC9C0</strong><span>2026.11.01</span>`;
      app.appendChild(head);
      for (const toggle of TOGGLES) {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = Boolean(settings[toggle.key]);
        input.addEventListener("change", () => {
          settings = { ...settings, [toggle.key]: input.checked };
          save();
        });
        app.appendChild(row(toggle.label, input, toggle.hint));
      }
      const refreshLabel = document.createElement("div");
      refreshLabel.className = "field";
      const refreshText = document.createElement("span");
      const refresh = document.createElement("input");
      refresh.type = "range";
      refresh.min = "3";
      refresh.max = "30";
      refresh.value = String(settings.refreshSec);
      const paintRefresh = () => {
        refreshText.textContent = `\uAC31\uC2E0 \uAC04\uACA9 ${settings.refreshSec}\uCD08`;
      };
      paintRefresh();
      refresh.addEventListener("input", () => {
        settings = { ...settings, refreshSec: Number(refresh.value) };
        paintRefresh();
        save();
      });
      refreshLabel.append(refreshText, refresh);
      app.appendChild(refreshLabel);
      const carriers = document.createElement("div");
      carriers.className = "carriers";
      ["blockSkt", "blockKt", "blockLgu"].forEach((key) => {
        const name = key === "blockSkt" ? "SKT" : key === "blockKt" ? "KT" : "LG U+";
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = settings[key];
        input.addEventListener("change", () => {
          settings = { ...settings, [key]: input.checked };
          save();
        });
        label.append(input, document.createTextNode(name));
        carriers.appendChild(label);
      });
      app.appendChild(carriers);
      const fontLabel = document.createElement("div");
      fontLabel.className = "field";
      const fontText = document.createElement("span");
      const font = document.createElement("input");
      font.type = "range";
      font.min = "13";
      font.max = "18";
      font.value = String(settings.fontSize);
      const paintFont = () => {
        fontText.textContent = `\uAE00\uC790 \uD06C\uAE30 ${settings.fontSize} \xB7 \uAE30\uBCF8 \uAE00\uAF34\uC744 \uCF30\uC744 \uB54C`;
      };
      paintFont();
      font.addEventListener("input", () => {
        settings = { ...settings, fontSize: Number(font.value) };
        paintFont();
        save();
      });
      fontLabel.append(fontText, font);
      app.appendChild(fontLabel);
      function area(title, key, placeholder) {
        const block = document.createElement("label");
        block.className = "field";
        const span = document.createElement("span");
        span.textContent = title;
        const input = document.createElement("textarea");
        input.placeholder = placeholder;
        input.value = settings[key];
        input.addEventListener("input", () => {
          settings = { ...settings, [key]: input.value };
          save();
        });
        block.append(span, input);
        app?.appendChild(block);
      }
      area("\uC228\uAE38 \uB2E8\uC5B4", "keywords", "\uD55C \uC904\uC5D0 \uD558\uB098");
      area("\uC228\uAE38 \uC544\uC774\uB514 \xB7 \uB2C9 \xB7 IP", "users", "\uD55C \uC904\uC5D0 \uD558\uB098. IP\uB294 \uC55E\uC790\uB9AC\uB9CC \uC801\uC5B4\uB3C4 \uB429\uB2C8\uB2E4.");
    });
  }
  boot();
})();
