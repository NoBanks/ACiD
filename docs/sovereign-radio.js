// ============================================================
// Sovereign Radio — vanilla JS player for static sites
// Stream: https://radio.nohumannearby.com/stream
// Drop <script src="sovereign-radio.js"></script> into any HTML page.
// ============================================================

(function () {
  const DEFAULTS = {
    accentColor: '#39FF14',
    streamUrl: 'https://radio.nohumannearby.com/stream',
    nowPlayingUrl: 'https://radio.nohumannearby.com/now-playing',
    artworkUrl: 'https://radio.nohumannearby.com/artwork',
    title: 'Sovereign Radio',
    position: 'top-right',
  };

  // Read config from script tag data attributes
  const scriptTag = document.currentScript;
  const config = {
    accentColor: scriptTag?.getAttribute('data-accent') || DEFAULTS.accentColor,
    streamUrl: scriptTag?.getAttribute('data-stream-url') || DEFAULTS.streamUrl,
    nowPlayingUrl: scriptTag?.getAttribute('data-now-playing-url') || DEFAULTS.nowPlayingUrl,
    artworkUrl: scriptTag?.getAttribute('data-artwork-url') || DEFAULTS.artworkUrl,
    title: scriptTag?.getAttribute('data-title') || DEFAULTS.title,
    position: scriptTag?.getAttribute('data-position') || DEFAULTS.position,
  };

  let isPlaying = false;
  let isExpanded = false;
  let volume = 0.7;
  let nowPlaying = null;
  let audio = null;
  let pollInterval = null;
  let vizInterval = null;
  let bars = new Array(16).fill(3);

  // --- Utilities ---
  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    let r, g, b;
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else {
      r = parseInt(clean.slice(0, 2), 16);
      g = parseInt(clean.slice(2, 4), 16);
      b = parseInt(clean.slice(4, 6), 16);
    }
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function titleToSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // --- Now-playing polling ---
  function fetchNowPlaying() {
    fetch(config.nowPlayingUrl)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (data) {
          nowPlaying = { artist: data.artist, title: data.title, listeners: data.listeners, hasArt: !!data.hasArt };
          render();
        }
      })
      .catch(function () { /* silent */ });
  }

  function startPolling() {
    fetchNowPlaying();
    pollInterval = setInterval(fetchNowPlaying, 5000);
  }

  function stopPolling() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }

  // --- Visualizer ---
  function startViz() {
    vizInterval = setInterval(function () {
      bars = bars.map(function () { return Math.random() * 28 + 4; });
      updateBars();
    }, 120);
  }

  function stopViz() {
    if (vizInterval) { clearInterval(vizInterval); vizInterval = null; }
    bars = new Array(16).fill(3);
  }

  function updateBars() {
    var barEls = container.querySelectorAll('.sr-bar');
    barEls.forEach(function (el, i) {
      el.style.height = bars[i] + 'px';
      el.style.background = isPlaying
        ? hexToRgba(config.accentColor, 0.3 + (bars[i] / 32) * 0.7)
        : 'rgba(255,255,255,0.06)';
    });
  }

  // --- Audio ---
  function togglePlay() {
    if (!audio) {
      audio = new Audio(config.streamUrl);
      audio.volume = volume;
    }
    if (isPlaying) {
      audio.pause();
      audio.src = '';
      audio = null;
      isPlaying = false;
      stopPolling();
      stopViz();
    } else {
      audio.src = config.streamUrl;
      audio.play().then(function () {
        isPlaying = true;
        startPolling();
        startViz();
        render();
      }).catch(function () { });
      return; // render after play resolves
    }
    render();
  }

  // --- Inject keyframes ---
  var styleEl = document.createElement('style');
  styleEl.textContent = [
    '@keyframes srPulse {',
    '  0%, 100% { opacity: 1; box-shadow: 0 0 8px #22c55e; }',
    '  50% { opacity: 0.5; box-shadow: 0 0 16px #22c55e; }',
    '}',
    '@keyframes srSlideUp {',
    '  from { opacity: 0; transform: translateY(12px); }',
    '  to { opacity: 1; transform: translateY(0); }',
    '}',
    'div[data-sovereign-radio] input[type="range"]::-webkit-slider-thumb {',
    '  -webkit-appearance: none;',
    '  width: 14px; height: 14px; border-radius: 50%;',
    '  background: ' + config.accentColor + '; cursor: pointer;',
    '  box-shadow: 0 0 6px ' + hexToRgba(config.accentColor, 0.4) + ';',
    '}',
    'div[data-sovereign-radio] input[type="range"]::-moz-range-thumb {',
    '  width: 14px; height: 14px; border-radius: 50%;',
    '  background: ' + config.accentColor + '; cursor: pointer; border: none;',
    '}',
  ].join('\n');
  document.head.appendChild(styleEl);

  // --- Container ---
  var container = document.createElement('div');
  container.setAttribute('data-sovereign-radio', '');
  document.body.appendChild(container);

  var posMap = {
    'bottom-left': 'bottom:20px;left:20px;right:auto;',
    'bottom-right': 'bottom:20px;right:20px;',
    'top-right': 'top:20px;right:20px;',
    'top-left': 'top:20px;left:20px;right:auto;',
  };
  var posStyle = posMap[config.position] || posMap['top-right'];

  // --- Render ---
  function render() {
    var trackLabel = nowPlaying && nowPlaying.title
      ? (nowPlaying.artist ? nowPlaying.artist + ' \u2014 ' : '') + nowPlaying.title
      : null;

    var trackUrl = nowPlaying && nowPlaying.title
      ? 'https://nomusicnearby.com/track/' + titleToSlug(nowPlaying.title)
      : null;

    if (!isExpanded) {
      // --- COLLAPSED PILL ---
      container.innerHTML = '';
      container.style.cssText = 'position:fixed;z-index:9999;font-family:Inter,SF Pro,-apple-system,sans-serif;' + posStyle;

      var pill = document.createElement('div');
      pill.style.cssText = 'display:flex;align-items:center;gap:10px;background:rgba(10,10,10,0.92);backdrop-filter:blur(20px);border-radius:50px;padding:8px 16px 8px 12px;cursor:pointer;border:1px solid rgba(255,255,255,0.08);box-shadow:0 8px 32px rgba(0,0,0,0.4);transition:all 0.2s ease;user-select:none;';
      pill.setAttribute('role', 'button');
      pill.setAttribute('aria-label', 'Open ' + config.title + ' player');
      pill.onclick = function () { isExpanded = true; render(); };

      // Live dot
      var dot = document.createElement('div');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:' + (isPlaying ? '#22c55e' : 'rgba(255,255,255,0.25)') + ';box-shadow:' + (isPlaying ? '0 0 8px #22c55e' : 'none') + ';animation:' + (isPlaying ? 'srPulse 1.5s infinite' : 'none') + ';';
      pill.appendChild(dot);

      // Label
      var label = document.createElement('span');
      label.style.cssText = 'color:#fff;font-size:13px;font-weight:600;letter-spacing:0.5px;';
      label.textContent = isPlaying ? 'LIVE' : 'RADIO';
      pill.appendChild(label);

      // Pill artwork
      if (isPlaying && nowPlaying && nowPlaying.hasArt) {
        var img = document.createElement('img');
        img.src = config.artworkUrl + '?t=' + (nowPlaying.title || '');
        img.width = 24; img.height = 24;
        img.style.cssText = 'border-radius:4px;object-fit:cover;flex-shrink:0;';
        img.onerror = function () { this.style.display = 'none'; };
        pill.appendChild(img);
      }

      // Track name
      if (isPlaying && trackLabel) {
        var tn = document.createElement('span');
        tn.style.cssText = 'color:rgba(255,255,255,0.45);font-size:11px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        tn.textContent = trackLabel;
        pill.appendChild(tn);
      }

      container.appendChild(pill);
      return;
    }

    // --- EXPANDED PLAYER ---
    container.innerHTML = '';
    container.style.cssText = 'position:fixed;width:300px;z-index:9999;background:rgba(10,10,10,0.95);backdrop-filter:blur(24px);border-radius:16px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 16px 48px rgba(0,0,0,0.5);padding:20px;font-family:Inter,SF Pro,-apple-system,sans-serif;animation:srSlideUp 0.25s ease-out;' + posStyle;

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';

    var headerLeft = document.createElement('div');
    headerLeft.style.cssText = 'display:flex;align-items:center;gap:8px;';
    var hDot = document.createElement('div');
    hDot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:' + (isPlaying ? '#22c55e' : 'rgba(255,255,255,0.25)') + ';box-shadow:' + (isPlaying ? '0 0 8px #22c55e' : 'none') + ';animation:' + (isPlaying ? 'srPulse 1.5s infinite' : 'none') + ';';
    headerLeft.appendChild(hDot);
    var hTitle = document.createElement('span');
    hTitle.style.cssText = 'color:#fff;font-size:15px;font-weight:700;letter-spacing:0.3px;';
    hTitle.textContent = config.title;
    headerLeft.appendChild(hTitle);
    header.appendChild(headerLeft);

    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.4);font-size:18px;cursor:pointer;padding:4px;line-height:1;';
    closeBtn.textContent = '\u00d7';
    closeBtn.setAttribute('aria-label', 'Collapse player');
    closeBtn.onclick = function () { isExpanded = false; render(); };
    header.appendChild(closeBtn);
    container.appendChild(header);

    // Now playing track
    if (trackLabel) {
      var trackRow = document.createElement('div');
      trackRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';

      if (nowPlaying && nowPlaying.hasArt) {
        var art = document.createElement('img');
        art.src = config.artworkUrl + '?t=' + (nowPlaying.title || '');
        art.width = 48; art.height = 48;
        art.style.cssText = 'border-radius:6px;object-fit:cover;flex-shrink:0;';
        art.onerror = function () { this.style.display = 'none'; };
        trackRow.appendChild(art);
      }

      var trackName = document.createElement('div');
      trackName.style.cssText = 'color:' + config.accentColor + ';font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      trackName.textContent = trackLabel;
      trackRow.appendChild(trackName);
      container.appendChild(trackRow);
    }

    // Visualizer
    var vizWrap = document.createElement('div');
    vizWrap.style.cssText = 'display:flex;align-items:flex-end;gap:2px;height:32px;margin-bottom:16px;';
    for (var i = 0; i < 16; i++) {
      var bar = document.createElement('div');
      bar.className = 'sr-bar';
      bar.style.cssText = 'width:3px;height:' + bars[i] + 'px;border-radius:1.5px;background:' + (isPlaying ? hexToRgba(config.accentColor, 0.3 + (bars[i] / 32) * 0.7) : 'rgba(255,255,255,0.06)') + ';transition:height 0.1s ease;';
      vizWrap.appendChild(bar);
    }
    container.appendChild(vizWrap);

    // Controls row
    var controls = document.createElement('div');
    controls.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:16px;';

    // Play/pause button
    var playBtn = document.createElement('button');
    playBtn.style.cssText = 'width:40px;height:40px;border-radius:50%;background:' + config.accentColor + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.1s;';
    playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    playBtn.onmousedown = function () { this.style.transform = 'scale(0.93)'; };
    playBtn.onmouseup = function () { this.style.transform = 'scale(1)'; };
    playBtn.onclick = togglePlay;
    if (isPlaying) {
      playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="#000"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>';
    } else {
      playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="#000"><path d="M4 2.5v11l9-5.5z"/></svg>';
    }
    controls.appendChild(playBtn);

    // Volume slider wrapper
    var volWrap = document.createElement('div');
    volWrap.style.cssText = 'flex:1;position:relative;display:flex;align-items:center;';

    var volBg = document.createElement('div');
    volBg.style.cssText = 'position:absolute;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);';
    volWrap.appendChild(volBg);

    var volFill = document.createElement('div');
    volFill.style.cssText = 'position:absolute;width:' + (volume * 100) + '%;height:4px;border-radius:2px;background:' + config.accentColor + ';pointer-events:none;';
    volWrap.appendChild(volFill);

    var volInput = document.createElement('input');
    volInput.type = 'range'; volInput.min = '0'; volInput.max = '1'; volInput.step = '0.01';
    volInput.value = volume;
    volInput.setAttribute('aria-label', 'Volume');
    volInput.style.cssText = 'width:100%;height:4px;appearance:none;-webkit-appearance:none;background:transparent;outline:none;cursor:pointer;position:relative;z-index:1;';
    volInput.oninput = function () {
      volume = parseFloat(this.value);
      if (audio) audio.volume = volume;
      volFill.style.width = (volume * 100) + '%';
    };
    volWrap.appendChild(volInput);
    controls.appendChild(volWrap);

    // Mute button
    var muteBtn = document.createElement('button');
    muteBtn.style.cssText = 'background:none;border:none;cursor:pointer;padding:2px;color:' + (volume > 0 ? 'rgba(255,255,255,0.5)' : '#22c55e') + ';display:flex;align-items:center;';
    muteBtn.setAttribute('aria-label', volume > 0 ? 'Mute' : 'Unmute');
    muteBtn.onclick = function () {
      volume = volume > 0 ? 0 : 0.7;
      if (audio) audio.volume = volume;
      render();
    };
    if (volume > 0) {
      muteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    } else {
      muteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
    }
    controls.appendChild(muteBtn);
    container.appendChild(controls);

    // Listeners count
    if (nowPlaying && nowPlaying.listeners != null && nowPlaying.listeners > 0) {
      var listenersEl = document.createElement('div');
      listenersEl.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:12px;';
      listenersEl.textContent = nowPlaying.listeners + ' listener' + (nowPlaying.listeners !== 1 ? 's' : '');
      container.appendChild(listenersEl);
    }

    // Footer
    var footer = document.createElement('div');
    footer.style.cssText = 'border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;';

    if (isPlaying && trackUrl) {
      var cta = document.createElement('a');
      cta.href = trackUrl;
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
      cta.style.cssText = 'display:inline-flex;align-items:center;gap:6px;color:' + config.accentColor + ';font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.3px;transition:opacity 0.15s;';
      cta.onmouseenter = function () { this.style.opacity = '0.8'; };
      cta.onmouseleave = function () { this.style.opacity = '1'; };
      cta.innerHTML = 'Get This Track <span style="font-size:14px">\u2192</span>';
      footer.appendChild(cta);

      var sub = document.createElement('div');
      sub.style.cssText = 'color:rgba(255,255,255,0.25);font-size:10px;margin-top:4px;';
      sub.textContent = 'nomusicnearby.com';
      footer.appendChild(sub);
    } else {
      var credit = document.createElement('div');
      credit.style.cssText = 'color:rgba(255,255,255,0.35);font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;';
      credit.textContent = 'Music by NoBanks Nearby';
      footer.appendChild(credit);
    }

    container.appendChild(footer);
  }

  // Initial render
  render();
})();
