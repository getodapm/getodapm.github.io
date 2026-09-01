(function () {
  var UNITS = { SF: 1, LF: 1, EA: 1, HR: 1, DAY: 1 };
  var GROUPS = {
    setup: 1, demolition: 1, cleaning: 1, equipment: 1, fixtures: 1, labor: 1, other: 1
  };
  var PRICE_KEYS = ["rem", "rep", "mat"];

  var fileInput = document.getElementById("file");
  var paste = document.getElementById("paste");
  var drop = document.getElementById("drop");
  var statusEl = document.getElementById("status");
  var tableWrap = document.getElementById("sheet");
  var exampleBtn = document.getElementById("example");

  function priceIsSet(p) {
    if (!p || typeof p !== "object") return false;
    if (PRICE_KEYS.some(function (k) { return k in p; })) {
      return PRICE_KEYS.some(function (k) {
        var n = p[k];
        return typeof n === "number" && n !== 0;
      });
    }
    return Object.keys(p).some(function (k) { return priceIsSet(p[k]); });
  }

  function itemPriceBlocks(it) {
    var blocks = [];
    if (it.price && typeof it.price === "object") blocks.push(it.price);
    var byCat = it.priceByCategory;
    if (byCat && typeof byCat === "object") {
      Object.keys(byCat).forEach(function (k) {
        if (byCat[k] && typeof byCat[k] === "object") blocks.push(byCat[k]);
      });
    }
    var pick = it.pick;
    if (pick && typeof pick === "object" && Array.isArray(pick.options)) {
      pick.options.forEach(function (o) {
        if (o && o.price && typeof o.price === "object") blocks.push(o.price);
      });
    }
    return blocks;
  }

  function money(n) {
    if (typeof n !== "number" || !isFinite(n)) return "—";
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function flatten(model) {
    var rows = [];
    (model.items || []).forEach(function (it) {
      if (!it || typeof it !== "object") return;
      var opts = it.pick && Array.isArray(it.pick.options) ? it.pick.options : null;
      if (opts && opts.length) {
        opts.forEach(function (o) {
          rows.push({
            id: it.id || "",
            option: (o && o.id) || "",
            name: it.name || "",
            label: (o && o.label) || "",
            group: it.group || "",
            unit: (o && o.unit) || it.unit || "",
            price: (o && o.price) || {},
            basis: (o && o.basis) || it.basis || ""
          });
        });
        return;
      }
      if (it.priceByCategory && typeof it.priceByCategory === "object") {
        Object.keys(it.priceByCategory).forEach(function (cat) {
          rows.push({
            id: it.id || "",
            option: cat,
            name: it.name || "",
            label: cat,
            group: it.group || "",
            unit: it.unit || "",
            price: it.priceByCategory[cat] || {},
            basis: it.basis || ""
          });
        });
        return;
      }
      rows.push({
        id: it.id || "",
        option: "",
        name: it.name || "",
        label: "",
        group: it.group || "",
        unit: it.unit || "",
        price: it.price || {},
        basis: it.basis || ""
      });
    });
    return rows;
  }

  function validate(model) {
    var errors = [];
    var warnings = [];
    if (!model || typeof model !== "object" || Array.isArray(model)) {
      return { ok: false, errors: ["Root must be an object with meta and items."], warnings: [], items: 0 };
    }
    var meta = model.meta || {};
    if (meta.schema !== "odapm/v1") {
      errors.push("meta.schema must be odapm/v1 (got " + JSON.stringify(meta.schema) + ").");
    }
    if (typeof meta.version !== "string" || !meta.version) {
      errors.push("meta.version is required.");
    }
    var items = model.items;
    if (!Array.isArray(items)) {
      errors.push("items must be an array.");
      items = [];
    }
    var unpriced = [];
    var noBasis = [];
    items.forEach(function (it, i) {
      var loc = "items/" + i + (it && it.id ? " (" + it.id + ")" : "");
      if (!it || typeof it !== "object") {
        errors.push(loc + " is not an object.");
        return;
      }
      if (!it.id) errors.push(loc + " missing id.");
      if (!it.name) errors.push(loc + " missing name.");
      if (!it.group) errors.push(loc + " missing group.");
      else if (!GROUPS[it.group]) {
        errors.push(loc + " group " + JSON.stringify(it.group) + " is not a Layer 1 group.");
      }
      if (!it.unit) errors.push(loc + " missing unit.");
      else if (!UNITS[it.unit]) {
        errors.push(loc + " unit " + JSON.stringify(it.unit) + " is not SF, LF, EA, HR, or DAY.");
      }
      var priced = itemPriceBlocks(it).some(priceIsSet);
      if (!priced) unpriced.push(it.id || String(i));
      if (priced && !it.basis) noBasis.push(it.id || String(i));
    });
    if (unpriced.length) {
      warnings.push(unpriced.length + " unpriced item(s). A template is allowed; it is not a fail.");
    }
    if (noBasis.length) {
      errors.push("Priced with no basis: " + noBasis.join(", ") + ". A number without a basis is not a price.");
    }
    return {
      ok: errors.length === 0,
      errors: errors,
      warnings: warnings,
      items: items.length,
      name: (meta.model_name || meta.version || "model.json")
    };
  }

  function renderStatus(v) {
    statusEl.hidden = false;
    statusEl.className = "status " + (v.ok ? "ok" : "bad");
    var title = v.ok
      ? "Conforms to odapm/v1"
      : "Not conformant";
    var bits = ["<p class=\"mark\">" + (v.ok ? "✓" : "✗") + "</p>", "<div>", "<p><strong>" + title + "</strong> — " + v.items + " item(s)" + (v.name ? " · " + escapeHtml(v.name) : "") + "</p>"];
    if (v.errors.length) {
      bits.push("<ul>" + v.errors.map(function (e) { return "<li>" + escapeHtml(e) + "</li>"; }).join("") + "</ul>");
    }
    if (v.warnings.length) {
      bits.push("<p class=\"warn\">" + v.warnings.map(escapeHtml).join(" ") + "</p>");
    }
    bits.push("</div>");
    statusEl.innerHTML = bits.join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderSheet(model) {
    var rows = flatten(model);
    if (!rows.length) {
      tableWrap.hidden = true;
      tableWrap.innerHTML = "";
      return;
    }
    var body = rows.map(function (r) {
      var p = r.price || {};
      var label = r.label ? escapeHtml(r.name) + " — " + escapeHtml(r.label) : escapeHtml(r.name);
      return "<tr>" +
        "<td><code>" + escapeHtml(r.id) + (r.option ? "." + escapeHtml(r.option) : "") + "</code></td>" +
        "<td>" + label + "</td>" +
        "<td>" + escapeHtml(r.unit) + "</td>" +
        "<td class=\"num\">" + money(p.rem) + "</td>" +
        "<td class=\"num\">" + money(p.rep) + "</td>" +
        "<td class=\"num\">" + money(p.mat) + "</td>" +
        "<td class=\"basis\">" + escapeHtml(r.basis || "") + "</td>" +
        "</tr>";
    }).join("");
    tableWrap.hidden = false;
    tableWrap.innerHTML =
      "<div class=\"table-scroll\"><table>" +
      "<thead><tr><th>SKU</th><th>Name</th><th>Unit</th><th>Rem</th><th>Rep</th><th>Mat</th><th>Basis</th></tr></thead>" +
      "<tbody>" + body + "</tbody></table></div>";
  }

  function loadText(text) {
    var model;
    try {
      model = JSON.parse(text);
    } catch (err) {
      renderStatus({ ok: false, errors: ["Not JSON: " + err.message], warnings: [], items: 0, name: "" });
      tableWrap.hidden = true;
      tableWrap.innerHTML = "";
      return;
    }
    var v = validate(model);
    renderStatus(v);
    renderSheet(model);
  }

  function readFile(file) {
    var reader = new FileReader();
    reader.onload = function () { loadText(String(reader.result || "")); };
    reader.readAsText(file);
  }

  fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) readFile(fileInput.files[0]);
  });
  document.getElementById("run-paste").addEventListener("click", function () {
    loadText(paste.value);
  });
  exampleBtn.addEventListener("click", function () {
    fetch("example.json").then(function (r) { return r.text(); }).then(loadText);
  });
  ;["dragenter", "dragover"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) {
      e.preventDefault();
      drop.classList.add("hot");
    });
  });
  ;["dragleave", "drop"].forEach(function (ev) {
    drop.addEventListener(ev, function (e) {
      e.preventDefault();
      drop.classList.remove("hot");
    });
  });
  drop.addEventListener("drop", function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) readFile(f);
  });
})();
