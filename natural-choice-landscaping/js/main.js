/* Natural Choice Landscaping: site scripts. No dependencies. */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Before and after sliders ---------- */
  document.querySelectorAll(".ba__frame").forEach(function (frame) {
    var range = frame.querySelector(".ba__range");
    if (!range) return;
    var update = function () {
      frame.style.setProperty("--pos", range.value + "%");
      range.setAttribute("aria-valuetext", range.value + " percent after photo shown");
    };
    range.addEventListener("input", update);
    update();
  });

  /* ---------- Contact form ---------- */
  var PHONE_DISPLAY = "860-872-2610";
  var EMAIL = "paverslaver@yahoo.com";

  document.querySelectorAll("form.consult-form").forEach(function (form) {
    var status = form.querySelector(".form-status");

    var rules = {
      name: function (v) { return v.trim().length < 2 ? "Please enter your name." : ""; },
      phone: function (v) {
        var digits = v.replace(/\D/g, "");
        if (!digits) return "Please enter a phone number so Jim can call you.";
        if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
        return digits.length === 10 ? "" : "Please enter a 10 digit phone number, like 860-555-0123.";
      },
      email: function (v) {
        if (!v.trim()) return "Please enter your email address.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "That email address does not look right. Please check it.";
      },
      town: function (v) { return v.trim() ? "" : "Please enter your town."; }
    };

    function setError(input, msg) {
      var field = input.closest(".field");
      var err = field.querySelector(".field__error");
      field.classList.toggle("has-error", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
    }

    function validateField(input) {
      var rule = rules[input.name];
      if (!rule) return "";
      var msg = rule(input.value);
      setError(input, msg);
      return msg;
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener("blur", function () { if (input.value) validateField(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("has-error")) validateField(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.company && form.elements.company.value) return; // honeypot

      var firstBad = null;
      var count = 0;
      Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        if (input && validateField(input)) {
          count++;
          if (!firstBad) firstBad = input;
        }
      });

      if (firstBad) {
        status.innerHTML = '<p class="form-error-summary" role="alert">' +
          (count === 1 ? "One field needs attention." : count + " fields need attention.") + "</p>";
        firstBad.focus();
        return;
      }

      var data = {};
      ["name", "phone", "email", "address", "town", "message"].forEach(function (k) {
        data[k] = form.elements[k] ? form.elements[k].value.trim() : "";
      });

      var endpoint = form.getAttribute("action") || "";
      var configured = endpoint.indexOf("http") === 0 && endpoint.indexOf("YOUR_FORM_ID") === -1;
      var btn = form.querySelector('button[type="submit"]');

      if (!configured) {
        // No form service connected yet: hand the request to the visitor's email app so no lead is lost.
        var body = "Name: " + data.name + "\nPhone: " + data.phone + "\nEmail: " + data.email +
          "\nAddress: " + data.address + "\nTown: " + data.town + "\n\n" + data.message;
        window.location.href = "mailto:" + EMAIL + "?subject=" +
          encodeURIComponent("Design consultation request from " + data.name) +
          "&body=" + encodeURIComponent(body);
        showSuccess(data.name, true);
        return;
      }

      btn.disabled = true;
      btn.textContent = "Sending...";
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        showSuccess(data.name);
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = "Request my free consultation";
        status.innerHTML = '<p class="form-error-summary" role="alert">Your request did not go through. ' +
          'Please call <a href="tel:+18608722610">' + PHONE_DISPLAY + '</a> or email <a href="mailto:' + EMAIL + '">' + EMAIL + "</a>.</p>";
      });
    });

    function showSuccess(name, viaEmailApp) {
      var first = name.split(" ")[0];
      var safe = first.replace(/[&<>"']/g, "");
      var emailNote = viaEmailApp ? "<p><strong>Your email app should open with your request filled in. Press send to finish.</strong></p>" : "";
      form.querySelectorAll(".form-grid, .form-actions, .form-fineprint").forEach(function (el) { el.hidden = true; });
      status.innerHTML =
        '<div class="form-success" role="status" tabindex="-1">' +
        "<h3>Thanks, " + safe + ". Your request is in.</h3>" + emailNote +
        "<p>Jim will get back to you within 48 to 72 hours to set up your free on-site consultation. " +
        'If you need to reach him sooner, call <a href="tel:+18608722610">' + PHONE_DISPLAY + "</a>.</p></div>";
      status.querySelector(".form-success").focus();
    }
  });

  /* ---------- Gallery ---------- */
  var grid = document.getElementById("gallery-grid");
  if (grid && window.NCL_GALLERY) {
    var G = window.NCL_GALLERY;
    var filterWrap = document.getElementById("gallery-filters");
    var countEl = document.getElementById("gallery-count");
    var catName = {};
    G.categories.forEach(function (c) { catName[c.slug] = c.name; });

    // Filters
    var allCats = [{ slug: "all", name: "All projects" }].concat(G.categories);
    allCats.forEach(function (c) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-btn";
      b.dataset.filter = c.slug;
      b.textContent = c.name;
      b.setAttribute("aria-pressed", "false");
      li.appendChild(b);
      filterWrap.appendChild(li);
    });

    // Items
    G.items.forEach(function (item, i) {
      var fig = document.createElement("figure");
      fig.className = "masonry-item";
      fig.dataset.cats = item.cats.join(" ");
      fig.innerHTML =
        '<button type="button" class="gallery-btn" data-index="' + i + '">' +
        '<span class="ph" style="display:block;aspect-ratio:' + item.ratio + '">' +
        '<img src="' + (item.src || "img/placeholder.svg") + '" alt="' + esc(item.alt) + '" loading="lazy" decoding="async" width="1200" height="900">' +
        (item.src ? "" : '<span class="ph__label" aria-hidden="true">' + esc(item.label) + "</span>") +
        "</span>" +
        '<span class="gallery-caption">' + esc(item.caption) + "</span>" +
        '<span class="visually-hidden">, open larger view</span>' +
        "</button>";
      grid.appendChild(fig);
    });

    var items = Array.prototype.slice.call(grid.querySelectorAll(".masonry-item"));
    var visible = [];

    function applyFilter(slug, push) {
      if (slug !== "all" && !catName[slug]) slug = "all";
      filterWrap.querySelectorAll(".filter-btn").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.filter === slug));
      });
      visible = [];
      items.forEach(function (el, i) {
        var show = slug === "all" || el.dataset.cats.split(" ").indexOf(slug) > -1;
        el.hidden = !show;
        if (show) visible.push(i);
      });
      countEl.textContent = "Showing " + visible.length + (visible.length === 1 ? " photo" : " photos") +
        (slug === "all" ? "" : " in " + catName[slug]) + ".";
      if (push) {
        var url = new URL(window.location.href);
        if (slug === "all") url.searchParams.delete("cat"); else url.searchParams.set("cat", slug);
        history.replaceState(null, "", url.toString());
      }
    }

    filterWrap.addEventListener("click", function (e) {
      var b = e.target.closest(".filter-btn");
      if (b) applyFilter(b.dataset.filter, true);
    });

    var params = new URLSearchParams(window.location.search);
    applyFilter(params.get("cat") || "all", false);

    // Lightbox
    var dlg = document.getElementById("lightbox");
    var lbImg = dlg.querySelector("img");
    var lbLabel = dlg.querySelector(".ph__label");
    var lbCap = dlg.querySelector(".lightbox__caption-text");
    var lbCount = dlg.querySelector(".lightbox__count");
    var current = 0;
    var opener = null;

    function show(pos) {
      current = (pos + visible.length) % visible.length;
      var item = G.items[visible[current]];
      lbImg.src = item.src || "img/placeholder.svg";
      lbImg.alt = item.alt;
      lbLabel.textContent = item.src ? "" : item.label;
      lbLabel.hidden = !!item.src;
      lbCap.textContent = item.caption;
      lbCount.textContent = (current + 1) + " of " + visible.length;
    }

    grid.addEventListener("click", function (e) {
      var b = e.target.closest(".gallery-btn");
      if (!b) return;
      opener = b;
      show(visible.indexOf(Number(b.dataset.index)));
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      dlg.querySelector(".lb-close").focus();
    });

    dlg.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    dlg.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    dlg.querySelector(".lb-close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.classList.contains("lightbox__inner")) dlg.close(); });
    dlg.addEventListener("close", function () { if (opener) opener.focus(); });

    // Swipe on touch screens
    var startX = null;
    dlg.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
