(function () {
  var HASHES = {
    key: "/docs/keys/",
    cursor: "/docs/cursor/",
    claude: "/docs/claude/",
    developers: "/docs/api/",
    agent: "/docs/agent/",
    connect: "/docs/"
  };

  function isHubPath(p) {
    return p === "/docs" || p === "/docs/" || p === "/docs/index.html";
  }

  var hash = location.hash.replace(/^#/, "");
  if (isHubPath(location.pathname) && hash && HASHES[hash]) {
    var dest = HASHES[hash];
    if (dest !== "/docs/") {
      location.replace(dest);
      return;
    }
    history.replaceState(null, "", "/docs/" + location.search);
  }

  var index = null;
  var form, input, list;
  var hits = [];
  var selected = -1;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    form = document.querySelector(".docs-search");
    if (!form) return;
    input = form.querySelector("input[type='search'], input[name='q']");
    list = document.getElementById("docs-results");
    if (!input || !list) return;

    var q = new URLSearchParams(location.search).get("q");
    if (q) input.value = q;

    fetch("/docs/search.json")
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        index = Array.isArray(data) ? data : [];
        if (input.value.trim()) render(input.value);
      })
      .catch(function () { index = []; });

    input.addEventListener("input", function () {
      render(input.value);
      syncQuery(input.value);
    });
    input.addEventListener("keydown", onKeys);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      go(selected >= 0 ? selected : 0);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      var tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
      e.preventDefault();
      input.focus();
    });
    document.addEventListener("click", function (e) {
      if (!form.contains(e.target)) hide();
    });
  }

  function syncQuery(q) {
    if (!isHubPath(location.pathname) || !history.replaceState) return;
    var url = q.trim() ? "/docs/?q=" + encodeURIComponent(q.trim()) : "/docs/";
    history.replaceState(null, "", url);
  }

  function score(doc, terms) {
    var title = (doc.title || "").toLowerCase();
    var headings = (doc.headings || []).join(" ").toLowerCase();
    var text = (doc.text || "").toLowerCase();
    var s = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var hit = false;
      if (title.indexOf(t) !== -1) { s += 10; hit = true; }
      if (headings.indexOf(t) !== -1) { s += 5; hit = true; }
      if (text.indexOf(t) !== -1) { s += 1; hit = true; }
      if (!hit) return 0;
    }
    return s;
  }

  function render(q) {
    q = (q || "").trim();
    selected = -1;
    if (!q) {
      hide();
      return;
    }
    if (!index) return;
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    hits = index.map(function (doc) {
      return { doc: doc, s: score(doc, terms) };
    }).filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });

    list.innerHTML = "";
    if (!hits.length) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.setAttribute("role", "presentation");
      empty.textContent = "No results";
      list.appendChild(empty);
    } else {
      hits.forEach(function (hit, i) {
        var li = document.createElement("li");
        li.setAttribute("role", "presentation");
        var a = document.createElement("a");
        a.href = hit.doc.url;
        a.id = "docs-opt-" + i;
        a.setAttribute("role", "option");
        a.setAttribute("aria-selected", "false");
        a.appendChild(document.createTextNode(hit.doc.title));
        if (hit.doc.description) {
          var span = document.createElement("span");
          span.className = "desc";
          span.textContent = hit.doc.description;
          a.appendChild(span);
        }
        a.addEventListener("mousemove", function () { select(i); });
        li.appendChild(a);
        list.appendChild(li);
      });
      select(0);
    }
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function select(i) {
    var opts = list.querySelectorAll('[role="option"]');
    if (!opts.length) {
      selected = -1;
      input.removeAttribute("aria-activedescendant");
      return;
    }
    if (i < 0) i = opts.length - 1;
    if (i >= opts.length) i = 0;
    selected = i;
    for (var n = 0; n < opts.length; n++) {
      opts[n].setAttribute("aria-selected", n === i ? "true" : "false");
    }
    input.setAttribute("aria-activedescendant", "docs-opt-" + i);
    opts[i].scrollIntoView({ block: "nearest" });
  }

  function hide() {
    hits = [];
    selected = -1;
    list.innerHTML = "";
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function go(i) {
    if (!hits.length || i < 0 || i >= hits.length) return;
    location.href = hits[i].doc.url;
  }

  function onKeys(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      hide();
      input.blur();
      return;
    }
    if (list.hidden) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      select(selected + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      select(selected - 1);
    } else if (e.key === "Enter" && hits.length) {
      e.preventDefault();
      go(selected >= 0 ? selected : 0);
    }
  }
})();
