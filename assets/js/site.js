/* Sugar & Sound — shared behaviour */
(function () {
  "use strict";

  /* mobile nav */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.textContent = open ? "Close" : "Menu";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        burger.textContent = "Menu";
      }
    });
  }

  /* current year in the footer */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* scroll reveals */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(items, function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* booking form: prefill the event type from ?type=weddings */
  var params = new URLSearchParams(location.search);
  var type = params.get("type");
  var select = document.getElementById("event-type");
  if (type && select) {
    Array.prototype.forEach.call(select.options, function (opt) {
      if (opt.value.toLowerCase() === type.toLowerCase()) select.value = opt.value;
    });
  }

  /* date field: no bookings in the past */
  var date = document.getElementById("event-date");
  if (date && !date.min) date.min = new Date().toISOString().split("T")[0];
})();
