(function () {
  var UNITS = { SF: 1, LF: 1, EA: 1, HR: 1, DAY: 1 };
  var GROUPS = {
    setup: 1, demolition: 1, cleaning: 1, equipment: 1, fixtures: 1, labor: 1, other: 1
  };
  var PRICE_KEYS = ["rem", "rep", "mat"];
  var ZIP_KEY = /^[0-9]{5}$/;

  var fileModel = document.getElementById("file-model");
  var fileTax = document.getElementById("file-tax");
  var pasteModel = document.getElementById("paste-model");
  var pasteTax = document.getElementById("paste-tax");
  var drop = document.getElementById("drop");
  var statusModel = document.getElementById("status-model");
  var statusTax = document.getElementById("status-tax");
  var tableWrap = document.getElementById("sheet");
  var taxWrap = document.getElementById("tax-sheet");
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

  function validateTax(tax) {
    var errors = [];
    var warnings = [];
    if (!tax || typeof tax !== "object" || Array.isArray(tax)) {
      return { ok: false, errors: ["Root must be an object with meta and jurisdictions."], warnings: [], count: 0, rates: [] };
    }
    var meta = tax.meta || {};
    if (meta.schema !== "odapm-tax/v1") {
      errors.push("meta.schema must be odapm-tax/v1 (got " + JSON.stringify(meta.schema) + ").");
    }
    if (meta.tax_applies_to !== "material") {
      errors.push("meta.tax_applies_to must be material.");
    }
    var list = tax.jurisdictions;
    if (!Array.isArray(list)) {
      errors.push("jurisdictions must be an array.");
      list = [];
    }
    var rates = [];
    list.forEach(function (j, i) {
      var loc = "jurisdictions/" + i + (j && j.id ? " (" + j.id + ")" : "");
      if (!j || typeof j !== "object") {
        errors.push(loc + " is not an object.");
        return;
      }
      if (!j.id) errors.push(loc + " missing id.");
      if (!j.name) errors.push(loc + " missing name.");
      if (typeof j.rate !== "number" || !isFinite(j.rate) || j.rate < 0) {
        errors.push(loc + " rate must be a number ≥ 0.");
      } else {
        rates.push({ id: j.id || "", name: j.name || "", rate: j.rate });
      }
    });
    var zips = tax.zip_candidates;
    if (zips != null) {
      if (typeof zips !== "object" || Array.isArray(zips)) {
        errors.push("zip_candidates must be an object.");
      } else {
        Object.keys(zips).forEach(function (k) {
          if (k.charAt(0) === "_") return;
          if (!ZIP_KEY.test(k)) {
            errors.push("zip_candidates key " + JSON.stringify(k) + " is not a 5-digit ZIP.");
          }
        });
      }
    }
    return {
      ok: errors.length === 0,
      errors: errors,
      warnings: warnings,
      count: list.length,
      rates: rates,
      name: meta.state ? String(meta.state) : "tax.json"
    };
  }

  function classify(obj) {
    var schema = obj && obj.meta && obj.meta.schema;
    if (schema === "odapm-tax/v1") return "tax";
    if (schema === "odapm/v1") return "model";
    if (obj && Array.isArray(obj.jurisdictions) && !Array.isArray(obj.items)) return "tax";
    if (obj && Array.isArray(obj.items)) return "model";
    return null;
  }

  function renderStatus(el, v, okTitle, badTitle, countLine) {
    el.hidden = false;
    el.className = "status " + (v.ok ? "ok" : "bad");
    var title = v.ok ? okTitle : badTitle;
    var bits = ["<p class=\"mark\">" + (v.ok ? "✓" : "✗") + "</p>", "<div>", "<p><strong>" + title + "</strong> — " + countLine + "</p>"];
    if (v.errors && v.errors.length) {
      bits.push("<ul>" + v.errors.map(function (e) { return "<li>" + escapeHtml(e) + "</li>"; }).join("") + "</ul>");
    }
    if (v.warnings && v.warnings.length) {
      bits.push("<p class=\"warn\">" + v.warnings.map(escapeHtml).join(" ") + "</p>");
    }
    bits.push("</div>");
    el.innerHTML = bits.join("");
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

  function renderTaxSheet(v) {
    if (!v.rates || !v.rates.length) {
      taxWrap.hidden = true;
      taxWrap.innerHTML = "";
      return;
    }
    var body = v.rates.map(function (r) {
      return "<tr>" +
        "<td><code>" + escapeHtml(r.id) + "</code></td>" +
        "<td>" + escapeHtml(r.name) + "</td>" +
        "<td class=\"num\">" + money(r.rate) + "%</td>" +
        "</tr>";
    }).join("");
    taxWrap.hidden = false;
    taxWrap.innerHTML =
      "<div class=\"table-scroll\"><table>" +
      "<thead><tr><th>Id</th><th>Jurisdiction</th><th>Rate</th></tr></thead>" +
      "<tbody>" + body + "</tbody></table></div>";
  }

  function failParse(el, table, message) {
    renderStatus(el, { ok: false, errors: [message], warnings: [] }, "", "Not JSON", "0");
    table.hidden = true;
    table.innerHTML = "";
  }

  function applyModel(model) {
    var v = validate(model);
    var count = v.items + " item(s)" + (v.name ? " · " + escapeHtml(v.name) : "");
    renderStatus(statusModel, v, "Conforms to odapm/v1", "Not conformant", count);
    renderSheet(model);
  }

  function applyTax(tax) {
    var v = validateTax(tax);
    var rateBits = v.rates.map(function (r) {
      return (r.name || r.id) + " " + money(r.rate) + "%";
    }).join("; ");
    var count = v.count + " jurisdiction(s)" + (v.name ? " · " + escapeHtml(v.name) : "") +
      (v.ok && rateBits ? " · " + escapeHtml(rateBits) : "");
    renderStatus(statusTax, v, "Conforms to odapm-tax/v1", "Not conformant", count);
    renderTaxSheet(v);
  }

  function parseText(text, el, table) {
    try {
      return JSON.parse(text);
    } catch (err) {
      failParse(el, table, "Not JSON: " + err.message);
      return null;
    }
  }

  function loadModelText(text) {
    var model = parseText(text, statusModel, tableWrap);
    if (!model) return;
    applyModel(model);
  }

  function loadTaxText(text) {
    var tax = parseText(text, statusTax, taxWrap);
    if (!tax) return;
    applyTax(tax);
  }

  function loadUnknownText(text) {
    var obj;
    try {
      obj = JSON.parse(text);
    } catch (err) {
      failParse(statusModel, tableWrap, "Not JSON: " + err.message);
      return;
    }
    var kind = classify(obj);
    if (kind === "tax") loadTaxText(text);
    else if (kind === "model") loadModelText(text);
    else failParse(statusModel, tableWrap, "Not odapm/v1 or odapm-tax/v1.");
  }

  function readFile(file, kind) {
    var reader = new FileReader();
    reader.onload = function () {
      var text = String(reader.result || "");
      if (kind === "model") loadModelText(text);
      else if (kind === "tax") loadTaxText(text);
      else loadUnknownText(text);
    };
    reader.readAsText(file);
  }

  fileModel.addEventListener("change", function () {
    if (fileModel.files && fileModel.files[0]) readFile(fileModel.files[0], "model");
  });
  fileTax.addEventListener("change", function () {
    if (fileTax.files && fileTax.files[0]) readFile(fileTax.files[0], "tax");
  });
  document.getElementById("run-model").addEventListener("click", function () {
    loadModelText(pasteModel.value);
  });
  document.getElementById("run-tax").addEventListener("click", function () {
    loadTaxText(pasteTax.value);
  });
  exampleBtn.addEventListener("click", function () {
    Promise.all([
      fetch("example.json").then(function (r) { return r.text(); }),
      fetch("example-tax.json").then(function (r) { return r.text(); })
    ]).then(function (pair) {
      if (pasteModel) pasteModel.value = pair[0];
      if (pasteTax) pasteTax.value = pair[1];
      loadModelText(pair[0]);
      loadTaxText(pair[1]);
    });
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
    var files = e.dataTransfer && e.dataTransfer.files;
    if (!files || !files.length) return;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var name = (f && f.name ? f.name : "").toLowerCase();
      var kind = name.indexOf("tax") !== -1 ? "tax" : name.indexOf("model") !== -1 ? "model" : null;
      readFile(f, kind);
    }
  });
})();
