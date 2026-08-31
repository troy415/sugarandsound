/* ===========================================================================
   Sugar & Sound — mix player
   Reads window.SAS_MIXES (assets/data/mixes.js), renders the playlist,
   and drives a sticky bottom player with a live frequency visualiser.
   No dependencies.
   =========================================================================== */
(function () {
  "use strict";

  var listEl = document.getElementById("playlist");
  if (!listEl) return;

  var mixes = (window.SAS_MIXES || []).slice();
  var chipsEl = document.getElementById("chips");
  var emptyEl = document.getElementById("playlist-empty");

  var audio = new Audio();
  audio.preload = "metadata";
  audio.volume = 0.85;

  var current = -1;
  var ctx = null, analyser = null, dataArr = null, srcNode = null, rafId = null;

  /* ---------- helpers ---------- */
  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) return "--:--";
    sec = Math.floor(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var mm = h ? String(m).padStart(2, "0") : String(m);
    return (h ? h + ":" : "") + mm + ":" + String(s).padStart(2, "0");
  }

  function slug(str) {
    return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  /* Fallback cover: a little Crystal Groove record label, tinted per mix. */
  function fallbackCover(i) {
    var hues = ["#C98A76", "#B0705F", "#D89C87", "#9E6153"];
    var c = hues[i % hues.length];
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<rect width="100" height="100" fill="#1B1A22"/>' +
      '<g fill="none" stroke="' + c + '" stroke-width="1" opacity=".5">' +
      '<circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="35"/>' +
      '<circle cx="50" cy="50" r="28"/><circle cx="50" cy="50" r="21"/></g>' +
      '<path d="M42 42 L58 42 L65 50 L50 71 L35 50 Z" fill="' + c + '"/>' +
      '<circle cx="50" cy="53" r="2.4" fill="#1B1A22"/></svg>';
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  /* ---------- render ---------- */
  function render(filter) {
    listEl.innerHTML = "";
    var shown = 0;

    mixes.forEach(function (mix, i) {
      if (filter && filter !== "all" && (mix.tags || []).map(slug).indexOf(filter) === -1) return;
      shown++;

      var li = document.createElement("li");
      li.className = "track";
      li.dataset.index = i;
      li.id = "mix-" + (mix.id || i);

      var art = document.createElement("div");
      art.className = "track__art";
      var img = document.createElement("img");
      img.src = mix.cover || fallbackCover(i);
      img.alt = "";
      img.loading = "lazy";
      var pb = document.createElement("button");
      pb.className = "track__play";
      pb.type = "button";
      pb.setAttribute("aria-label", "Play " + mix.title);
      pb.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
      art.appendChild(img);
      art.appendChild(pb);

      var body = document.createElement("div");
      var tags = (mix.tags || []).map(function (t) { return "<span>" + t + "</span>"; }).join("");
      body.innerHTML =
        '<h3 class="track__title">' + mix.title + "</h3>" +
        '<p class="track__meta">' + (mix.subtitle || "") + (mix.notes ? " — " + mix.notes : "") + "</p>" +
        (tags ? '<div class="track__tags">' + tags + "</div>" : "");

      var meta = document.createElement("div");
      meta.className = "track__time";
      meta.innerHTML =
        '<span data-time>' + (mix.time || "--:--") + "</span>" +
        (mix.download ? '<a class="track__dl" href="' + mix.src + '" download>Download</a>' : "");

      li.appendChild(art);
      li.appendChild(body);
      li.appendChild(meta);
      listEl.appendChild(li);

      pb.addEventListener("click", function () {
        if (current === i) { toggle(); } else { play(i); }
      });
    });

    if (emptyEl) emptyEl.hidden = shown !== 0;
    mark();
  }

  function mark() {
    Array.prototype.forEach.call(listEl.children, function (li) {
      var on = Number(li.dataset.index) === current;
      li.classList.toggle("is-playing", on);
      var btn = li.querySelector(".track__play");
      if (btn) {
        btn.innerHTML = on && !audio.paused
          ? '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
      }
    });
  }

  /* ---------- filters ---------- */
  if (chipsEl) {
    var tags = [];
    mixes.forEach(function (m) {
      (m.tags || []).forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
    });
    var all = ["All mixes"].concat(tags);
    all.forEach(function (label, idx) {
      var b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.textContent = label;
      b.dataset.filter = idx === 0 ? "all" : slug(label);
      b.setAttribute("aria-pressed", idx === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(chipsEl.children, function (c) { c.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        render(b.dataset.filter);
      });
      chipsEl.appendChild(b);
    });
  }

  /* ---------- sticky bar ---------- */
  var bar = document.getElementById("bar");
  var barArt = document.getElementById("bar-art");
  var barTitle = document.getElementById("bar-title");
  var barSub = document.getElementById("bar-sub");
  var btnPlay = document.getElementById("bar-play");
  var btnPrev = document.getElementById("bar-prev");
  var btnNext = document.getElementById("bar-next");
  var seek = document.getElementById("bar-seek");
  var tNow = document.getElementById("bar-now");
  var tEnd = document.getElementById("bar-end");
  var vol = document.getElementById("bar-vol");
  var canvas = document.getElementById("viz");
  var seeking = false;

  function play(i) {
    var mix = mixes[i];
    if (!mix) return;
    current = i;
    audio.src = mix.src;
    audio.play().then(startViz).catch(function (err) {
      console.warn("Playback failed:", err);
      barSub.textContent = "Can’t find " + mix.src + " — upload it to the /audio folder.";
    });
    barArt.src = mix.cover || fallbackCover(i);
    barTitle.textContent = mix.title;
    barSub.textContent = mix.subtitle || "";
    bar.classList.add("is-up");
    document.body.classList.add("has-bar");
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: mix.title,
        artist: "Sugar & Sound",
        album: mix.subtitle || "Mixes",
        artwork: [{ src: mix.cover || fallbackCover(i), sizes: "512x512", type: "image/svg+xml" }]
      });
    }
    mark();
  }

  function toggle() {
    if (current === -1) return play(0);
    if (audio.paused) { audio.play().then(startViz).catch(function () {}); }
    else { audio.pause(); }
  }

  function step(dir) {
    if (!mixes.length) return;
    play((current + dir + mixes.length) % mixes.length);
  }

  btnPlay.addEventListener("click", toggle);
  btnPrev.addEventListener("click", function () { step(-1); });
  btnNext.addEventListener("click", function () { step(1); });

  audio.addEventListener("play", function () { setPlayIcon(true); mark(); });
  audio.addEventListener("pause", function () { setPlayIcon(false); mark(); });
  audio.addEventListener("ended", function () { step(1); });

  audio.addEventListener("loadedmetadata", function () {
    tEnd.textContent = fmt(audio.duration);
    var li = listEl.querySelector('.track[data-index="' + current + '"] [data-time]');
    if (li) li.textContent = fmt(audio.duration);
  });

  audio.addEventListener("timeupdate", function () {
    if (seeking) return;
    tNow.textContent = fmt(audio.currentTime);
    var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    seek.value = pct;
    seek.style.setProperty("--pct", pct + "%");
  });

  seek.addEventListener("input", function () {
    seeking = true;
    seek.style.setProperty("--pct", seek.value + "%");
    if (audio.duration) tNow.textContent = fmt((seek.value / 100) * audio.duration);
  });
  seek.addEventListener("change", function () {
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
    seeking = false;
  });

  vol.addEventListener("input", function () {
    audio.volume = vol.value / 100;
    vol.style.setProperty("--pct", vol.value + "%");
  });
  vol.style.setProperty("--pct", "85%");

  function setPlayIcon(playing) {
    btnPlay.innerHTML = playing
      ? '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
    btnPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
  }
  setPlayIcon(false);

  /* keyboard: space toggles unless you're typing */
  document.addEventListener("keydown", function (e) {
    var t = e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
    if (e.code === "Space" && current > -1) { e.preventDefault(); toggle(); }
    if (e.code === "ArrowRight" && e.shiftKey) step(1);
    if (e.code === "ArrowLeft" && e.shiftKey) step(-1);
  });

  /* ---------- visualiser ---------- */
  function startViz() {
    if (!canvas || ctx) return draw();
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      srcNode = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      srcNode.connect(analyser);
      analyser.connect(ctx.destination);
      dataArr = new Uint8Array(analyser.frequencyBinCount);
      draw();
    } catch (err) {
      canvas.style.display = "none";
    }
  }

  function draw() {
    if (!analyser || !canvas) return;
    var c = canvas.getContext("2d");
    var w = canvas.width = canvas.offsetWidth * 2;
    var h = canvas.height = canvas.offsetHeight * 2;

    function frame() {
      rafId = requestAnimationFrame(frame);
      analyser.getByteFrequencyData(dataArr);
      c.clearRect(0, 0, w, h);
      var bars = 9, bw = 5;
      for (var i = 0; i < bars; i++) {
        var v = dataArr[i * 2] / 255;
        var bh = Math.max(4, v * h * 0.9);
        c.fillStyle = "#C98A76";
        c.globalAlpha = 0.45 + v * 0.55;
        c.fillRect(i * (w / bars) + 2, (h - bh) / 2, bw, bh);
      }
      c.globalAlpha = 1;
    }
    if (!rafId) frame();
  }

  /* ---------- go ---------- */
  render("all");

  /* Deep link: mixes.html#mix-golden-hour starts that mix. */
  if (location.hash) {
    var idx = mixes.findIndex(function (m) { return "mix-" + m.id === location.hash.slice(1); });
    if (idx > -1) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ block: "center" });
    }
  }
})();
