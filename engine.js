/* ===========================================================================
   DEPARTURE BOARD — engine.js
   Item rendering + checking, the progress model, mastery/unlock rules,
   Leitner spaced review, XP, streaks and badge logic.
   Depends on: content.js (window.CONTENT)
   =========================================================================== */
(function (global) {
  'use strict';
  var C = global.CONTENT;

  /* ---------------------------------------------------------------- utils */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function shuffle(a) {
    var r = a.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[’']/g, "'")
      .replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function today() { return new Date().toISOString().slice(0, 10); }
  function daysBetween(a, b) {
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  }

  /* ----------------------------------------------------------------- bank */
  var BANK = {};
  var LESSONS = {};
  var STAGE_OF = {};
  C.STAGES.forEach(function (st) {
    st.lessons.forEach(function (ls) {
      LESSONS[ls.id] = ls;
      ls.items.forEach(function (it) { BANK[it.id] = it; STAGE_OF[it.id] = st.n; });
    });
    st.challenge.items.forEach(function (it) { BANK[it.id] = it; STAGE_OF[it.id] = st.n; });
  });
  Object.keys(C.VERIFY).forEach(function (k) {
    C.VERIFY[k].forEach(function (it) { BANK[it.id] = it; STAGE_OF[it.id] = +k; });
  });

  var Bank = {
    item: function (id) { return BANK[id]; },
    lesson: function (id) { return LESSONS[id]; },
    stage: function (n) { return C.STAGES[n - 1]; },
    stageOf: function (id) { return STAGE_OF[id]; },
    all: function () { return BANK; },
    /* build a level-check paper: mostly the recorded level, with one rung
       below and one above so the result can disconfirm as well as confirm */
    verifyPaper: function (level, n) {
      n = n || 10;
      var lo = Math.max(1, level - 1), hi = Math.min(8, level + 1);
      var pools = [
        { lv: level, want: Math.ceil(n * 0.6) },
        { lv: lo, want: Math.floor(n * 0.2) },
        { lv: hi, want: n }
      ];
      var out = [], used = {};
      pools.forEach(function (p) {
        var pool = shuffle((C.VERIFY[p.lv] || []).filter(function (i) { return !used[i.id]; }));
        pool.slice(0, Math.max(0, p.want)).forEach(function (i) { used[i.id] = 1; out.push(i); });
      });
      return out.slice(0, n);
    }
  };


  /* ------------------------------------------------------------------ art
     Hand-drawn scene banners. Inline SVG so they need no network, scale
     cleanly, and pick up the theme tokens in both light and dark. */
  var ART = {
    lounge:
      '<rect x="186" y="10" width="122" height="62" rx="6" fill="var(--surface)" stroke="var(--accent-line)" stroke-width="1.5"/>' +
      '<circle cx="270" cy="28" r="9" fill="var(--gold)" opacity=".55"/>' +
      '<path d="M196 58 L232 44 L240 47 L214 62 Z" fill="var(--accent)"/>' +
      '<path d="M222 50 L228 38 L233 39 L230 52 Z" fill="var(--accent)"/>' +
      '<rect x="186" y="66" width="122" height="6" fill="var(--accent-line)" opacity=".5"/>' +
      '<g fill="var(--accent)">' +
      '<rect x="16" y="46" width="34" height="10" rx="4"/><rect x="56" y="46" width="34" height="10" rx="4"/><rect x="96" y="46" width="34" height="10" rx="4"/>' +
      '<rect x="18" y="30" width="30" height="18" rx="5" opacity=".55"/><rect x="58" y="30" width="30" height="18" rx="5" opacity=".55"/><rect x="98" y="30" width="30" height="18" rx="5" opacity=".55"/>' +
      '<rect x="20" y="56" width="5" height="16" rx="2"/><rect x="120" y="56" width="5" height="16" rx="2"/>' +
      '<rect x="14" y="54" width="118" height="4" rx="2"/></g>',
    desk:
      '<rect x="24" y="52" width="272" height="30" rx="5" fill="var(--accent)"/>' +
      '<rect x="24" y="52" width="272" height="7" rx="3" fill="var(--gold)" opacity=".8"/>' +
      '<rect x="40" y="16" width="74" height="34" rx="4" fill="var(--surface)" stroke="var(--accent-line)" stroke-width="1.5"/>' +
      '<g fill="var(--accent)" opacity=".6"><rect x="48" y="24" width="42" height="4" rx="2"/><rect x="48" y="32" width="56" height="4" rx="2"/><rect x="48" y="40" width="30" height="4" rx="2"/></g>' +
      '<path d="M146 50 a14 14 0 0 1 28 0 z" fill="var(--gold)"/><rect x="142" y="48" width="36" height="4" rx="2" fill="var(--gold)"/>' +
      '<g fill="var(--accent)" opacity=".55"><rect x="206" y="18" width="8" height="26" rx="4"/><rect x="226" y="18" width="8" height="26" rx="4"/><rect x="246" y="18" width="8" height="26" rx="4"/><rect x="266" y="18" width="8" height="26" rx="4"/></g>' +
      '<rect x="200" y="12" width="80" height="4" rx="2" fill="var(--accent)"/>',
    tags:
      '<line x1="0" y1="14" x2="320" y2="14" stroke="var(--accent-line)" stroke-width="2"/>' +
      '<g stroke="var(--accent)" stroke-width="1.5"><line x1="70" y1="14" x2="70" y2="28"/><line x1="160" y1="14" x2="160" y2="22"/><line x1="250" y1="14" x2="250" y2="34"/></g>' +
      '<path d="M44 28 h52 a6 6 0 0 1 6 6 v30 a6 6 0 0 1 -6 6 h-52 l-16 -21 z" fill="var(--accent)"/>' +
      '<circle cx="52" cy="48" r="4" fill="var(--accent-soft)"/>' +
      '<path d="M134 22 h52 a6 6 0 0 1 6 6 v26 a6 6 0 0 1 -6 6 h-52 l-14 -19 z" fill="var(--gold)"/>' +
      '<circle cx="141" cy="41" r="3.5" fill="var(--accent-soft)"/>' +
      '<path d="M224 34 h52 a6 6 0 0 1 6 6 v34 a6 6 0 0 1 -6 6 h-52 l-16 -23 z" fill="var(--accent)" opacity=".55"/>' +
      '<circle cx="232" cy="57" r="4" fill="var(--accent-soft)"/>',
    timetable:
      '<circle cx="52" cy="48" r="28" fill="var(--surface)" stroke="var(--accent)" stroke-width="3"/>' +
      '<line x1="52" y1="48" x2="52" y2="30" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="52" y1="48" x2="67" y2="55" stroke="var(--gold)" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="52" cy="48" r="3" fill="var(--accent)"/>' +
      '<g fill="var(--accent)">' +
      '<rect x="100" y="20" width="46" height="9" rx="2"/><rect x="154" y="20" width="86" height="9" rx="2" opacity=".45"/><rect x="248" y="20" width="44" height="9" rx="2" opacity=".7"/>' +
      '<rect x="100" y="38" width="46" height="9" rx="2" opacity=".7"/><rect x="154" y="38" width="64" height="9" rx="2" opacity=".45"/><rect x="248" y="38" width="44" height="9" rx="2"/>' +
      '<rect x="100" y="56" width="46" height="9" rx="2"/><rect x="154" y="56" width="96" height="9" rx="2" opacity=".45"/><rect x="258" y="56" width="34" height="9" rx="2" opacity=".7"/></g>' +
      '<rect x="100" y="74" width="192" height="3" rx="1.5" fill="var(--gold)"/>',
    contract:
      '<rect x="96" y="8" width="112" height="82" rx="5" fill="var(--surface)" stroke="var(--accent-line)" stroke-width="1.5"/>' +
      '<g fill="var(--accent)"><rect x="108" y="20" width="56" height="6" rx="3"/>' +
      '<g opacity=".4"><rect x="108" y="34" width="88" height="4" rx="2"/><rect x="108" y="43" width="76" height="4" rx="2"/><rect x="108" y="52" width="88" height="4" rx="2"/><rect x="108" y="61" width="48" height="4" rx="2"/></g></g>' +
      '<rect x="108" y="70" width="60" height="4" rx="2" fill="var(--gold)"/>' +
      '<circle cx="214" cy="58" r="22" fill="none" stroke="var(--accent)" stroke-width="3.5"/>' +
      '<line x1="230" y1="74" x2="248" y2="88" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="214" cy="58" r="22" fill="var(--gold)" opacity=".13"/>',
    board:
      '<g fill="var(--gold)">' +
      '<rect x="18" y="16" width="52" height="13" rx="2"/><rect x="80" y="16" width="96" height="13" rx="2" opacity=".55"/><rect x="186" y="16" width="40" height="13" rx="2" opacity=".8"/><rect x="238" y="16" width="64" height="13" rx="2" opacity=".35"/>' +
      '<rect x="18" y="36" width="52" height="13" rx="2" opacity=".8"/><rect x="80" y="36" width="72" height="13" rx="2" opacity=".45"/><rect x="186" y="36" width="40" height="13" rx="2"/><rect x="238" y="36" width="48" height="13" rx="2" opacity=".55"/>' +
      '<rect x="18" y="56" width="52" height="13" rx="2" opacity=".6"/><rect x="80" y="56" width="110" height="13" rx="2" opacity=".45"/><rect x="200" y="56" width="26" height="13" rx="2" opacity=".9"/><rect x="238" y="56" width="64" height="13" rx="2" opacity=".3"/>' +
      '<rect x="18" y="76" width="52" height="13" rx="2" opacity=".4"/><rect x="80" y="76" width="84" height="13" rx="2" opacity=".3"/><rect x="186" y="76" width="40" height="13" rx="2" opacity=".5"/></g>' +
      '<g stroke="var(--ink)" stroke-width="1.5" opacity=".85"><line x1="0" y1="22" x2="320" y2="22"/><line x1="0" y1="42" x2="320" y2="42"/><line x1="0" y1="62" x2="320" y2="62"/><line x1="0" y1="82" x2="320" y2="82"/></g>',
    nightflight:
      '<circle cx="268" cy="26" r="13" fill="var(--gold)" opacity=".85"/>' +
      '<g fill="var(--gold)" opacity=".6"><circle cx="40" cy="20" r="1.8"/><circle cx="88" cy="34" r="1.4"/><circle cx="130" cy="16" r="1.8"/><circle cx="176" cy="30" r="1.3"/><circle cx="222" cy="14" r="1.6"/><circle cx="66" cy="52" r="1.3"/><circle cx="292" cy="52" r="1.5"/></g>' +
      '<path d="M60 66 L168 40 L192 44 L118 76 Z" fill="var(--accent)"/>' +
      '<path d="M140 52 L154 30 L164 32 L158 56 Z" fill="var(--accent)" opacity=".75"/>' +
      '<path d="M180 44 L200 40 L206 44 L186 50 Z" fill="var(--accent)" opacity=".6"/>' +
      '<g stroke="var(--accent)" stroke-width="2.5" opacity=".35" stroke-linecap="round"><line x1="14" y1="74" x2="54" y2="70"/><line x1="6" y1="84" x2="40" y2="81"/></g>',
    arrivals:
      '<path d="M12 62 h296 a10 10 0 0 1 0 20 h-296 a10 10 0 0 1 0 -20 z" fill="var(--accent)" opacity=".35"/>' +
      '<g stroke="var(--accent)" stroke-width="2" opacity=".6"><line x1="40" y1="62" x2="34" y2="82"/><line x1="90" y1="62" x2="84" y2="82"/><line x1="140" y1="62" x2="134" y2="82"/><line x1="190" y1="62" x2="184" y2="82"/><line x1="240" y1="62" x2="234" y2="82"/><line x1="290" y1="62" x2="284" y2="82"/></g>' +
      '<rect x="44" y="28" width="54" height="36" rx="5" fill="var(--accent)"/><rect x="62" y="21" width="18" height="9" rx="4" fill="var(--accent)"/>' +
      '<rect x="44" y="42" width="54" height="4" fill="var(--gold)" opacity=".8"/>' +
      '<rect x="124" y="34" width="46" height="30" rx="5" fill="var(--gold)"/><rect x="139" y="28" width="16" height="8" rx="4" fill="var(--gold)"/>' +
      '<rect x="196" y="24" width="58" height="40" rx="5" fill="var(--accent)" opacity=".6"/><rect x="216" y="17" width="18" height="9" rx="4" fill="var(--accent)" opacity=".6"/>' +
      '<rect x="196" y="40" width="58" height="4" fill="var(--surface)" opacity=".7"/>',
    hotel:
      '<rect x="86" y="14" width="148" height="70" rx="4" fill="var(--accent)"/>' +
      '<g fill="var(--surface)" opacity=".85"><rect x="100" y="26" width="20" height="16" rx="2"/><rect x="130" y="26" width="20" height="16" rx="2"/><rect x="160" y="26" width="20" height="16" rx="2"/><rect x="190" y="26" width="20" height="16" rx="2"/>' +
      '<rect x="100" y="50" width="20" height="16" rx="2"/><rect x="130" y="50" width="20" height="16" rx="2" opacity=".45"/><rect x="160" y="50" width="20" height="16" rx="2"/><rect x="190" y="50" width="20" height="16" rx="2" opacity=".45"/></g>' +
      '<rect x="142" y="68" width="26" height="16" rx="2" fill="var(--gold)"/>' +
      '<rect x="86" y="6" width="148" height="9" rx="3" fill="var(--gold)"/>' +
      '<g fill="var(--gold)" opacity=".9"><circle cx="250" cy="22" r="3"/><circle cx="262" cy="22" r="3"/><circle cx="274" cy="22" r="3"/></g>',
    shop:
      '<g fill="var(--accent)"><rect x="24" y="40" width="126" height="4" rx="2"/><rect x="24" y="76" width="126" height="4" rx="2"/></g>' +
      '<g fill="var(--accent)" opacity=".75"><rect x="32" y="20" width="16" height="20" rx="3"/><rect x="56" y="14" width="14" height="26" rx="3"/><rect x="78" y="24" width="20" height="16" rx="3"/><rect x="106" y="18" width="16" height="22" rx="3"/><rect x="130" y="26" width="14" height="14" rx="3"/>' +
      '<rect x="34" y="58" width="22" height="18" rx="3"/><rect x="64" y="52" width="16" height="24" rx="3"/><rect x="88" y="60" width="24" height="16" rx="3"/><rect x="120" y="54" width="18" height="22" rx="3"/></g>' +
      '<path d="M190 22 h74 a8 8 0 0 1 8 8 v30 a8 8 0 0 1 -8 8 h-74 l-20 -23 z" fill="var(--gold)"/>' +
      '<circle cx="198" cy="45" r="5" fill="var(--accent-soft)"/>' +
      '<g fill="var(--ink)" opacity=".25"><rect x="212" y="36" width="44" height="6" rx="3"/><rect x="212" y="48" width="30" height="6" rx="3"/></g>',
    suitcase:
      '<rect x="62" y="22" width="90" height="60" rx="7" fill="var(--accent)"/>' +
      '<rect x="94" y="14" width="26" height="10" rx="5" fill="var(--accent)"/>' +
      '<rect x="62" y="44" width="90" height="6" fill="var(--gold)"/>' +
      '<rect x="99" y="40" width="16" height="14" rx="3" fill="var(--surface)" opacity=".9"/>' +
      '<rect x="168" y="30" width="90" height="52" rx="7" fill="var(--surface)" stroke="var(--accent-line)" stroke-width="1.5"/>' +
      '<g fill="var(--accent)" opacity=".6"><rect x="178" y="40" width="70" height="8" rx="4"/><rect x="178" y="54" width="52" height="8" rx="4"/><rect x="178" y="68" width="64" height="8" rx="4"/></g>' +
      '<circle cx="270" cy="26" r="10" fill="var(--gold)" opacity=".65"/>'
  };
  /* Two scenes are drawn on a dark ground; their band has to match or you
     get a hard edge where the artwork stops. */
  var ART_DARK = { board: 1, nightflight: 1 };
  function artSvg(name) {
    var d = ART[name];
    if (!d) return '';
    return '<svg class="art" viewBox="0 0 320 96" preserveAspectRatio="xMidYMid meet" ' +
      'role="presentation" aria-hidden="true">' + d + '</svg>';
  }
  function artBand(name, cls) {
    if (!ART[name]) return '';
    return '<div class="artband' + (ART_DARK[name] ? ' dark' : '') + (cls ? ' ' + cls : '') + '">' +
      artSvg(name) + '</div>';
  }

  /* ------------------------------------------------------------ rendering */
  /* Every renderer returns { response, hasResponse, check, lock } */

  function mcqView(host, options, answerIdx, correctTextFn) {
    var chosen = -1, btns = [];
    var wrap = el('div', 'opts');
    options.forEach(function (opt, i) {
      var b = el('button', 'opt');
      b.type = 'button';
      b.innerHTML = '<span class="opt-k">' + 'ABCD'[i] + '</span><span class="opt-t">' + opt + '</span>';
      b.addEventListener('click', function () {
        if (wrap.dataset.locked) return;
        chosen = i;
        btns.forEach(function (x, j) { x.classList.toggle('sel', j === i); });
        host.dispatchEvent(new CustomEvent('respond', { bubbles: true }));
      });
      btns.push(b); wrap.appendChild(b);
    });
    host.appendChild(wrap);
    return {
      response: function () { return chosen; },
      hasResponse: function () { return chosen >= 0; },
      check: function () {
        return {
          correct: chosen === answerIdx,
          givenText: chosen >= 0 ? options[chosen] : '(no answer)',
          expectedText: correctTextFn ? correctTextFn() : options[answerIdx]
        };
      },
      lock: function () {
        wrap.dataset.locked = '1';
        btns.forEach(function (b, i) {
          b.disabled = true;
          if (i === answerIdx) b.classList.add('right');
          else if (i === chosen) b.classList.add('wrong');
        });
      }
    };
  }

  function renderStem(host, item) {
    if (item.art && ART[item.art]) {
      var band = el('div', null, artBand(item.art));
      host.appendChild(band.firstChild);
    }
    if (item.given) {
      var g = el('div', 'given');
      g.innerHTML = '<span class="given-k">Given</span><span class="given-t">' + item.given + '</span>';
      host.appendChild(g);
    }
    if (item.table) {
      var sc = el('div', 'tbl-scroll');
      var t = el('table', 'tbl');
      var thead = el('thead');
      var hr = el('tr');
      item.table.cols.forEach(function (c) { hr.appendChild(el('th', null, esc(c))); });
      thead.appendChild(hr); t.appendChild(thead);
      var tb = el('tbody');
      item.table.rows.forEach(function (row) {
        var tr = el('tr');
        row.forEach(function (cell, i) { tr.appendChild(el('td', i ? 'num' : null, esc(cell))); });
        tb.appendChild(tr);
      });
      t.appendChild(tb); sc.appendChild(t); host.appendChild(sc);
    }
    if (item.lines) {
      var d = el('div', 'dialogue');
      item.lines.forEach(function (l) {
        var row = el('div', 'dline');
        row.appendChild(el('span', 'who', esc(l.who)));
        row.appendChild(el('span', 'said', String(l.text).replace(/___/g, '<span class="blank">?</span>')));
        d.appendChild(row);
      });
      host.appendChild(d);
    }
    if (item.shop) {
      host.appendChild(el('div', 'shop-head', esc(item.shop)));
    }
    if (item.stem) host.appendChild(el('p', 'stem', item.stem));
  }

  var RENDER = {
    choose: function (host, item) { renderStem(host, item); return mcqView(host, item.options, item.answer); },
    equiv: function (host, item) { renderStem(host, item); return mcqView(host, item.options, item.answer); },
    table: function (host, item) { renderStem(host, item); return mcqView(host, item.options, item.answer); },

    judge: function (host, item) {
      renderStem(host, item);
      return mcqView(host, ['True', 'False', "Can't tell"], item.answer);
    },

    gap: function (host, item) {
      renderStem(host, item);
      if (item.options) return mcqView(host, item.options, item.answer);
      var inp = el('input', 'typed');
      inp.type = 'text'; inp.autocomplete = 'off'; inp.placeholder = 'Type your answer';
      inp.id = 'gap-' + item.id;
      host.appendChild(inp);
      inp.addEventListener('input', function () { host.dispatchEvent(new CustomEvent('respond', { bubbles: true })); });
      return {
        response: function () { return inp.value; },
        hasResponse: function () { return inp.value.trim().length > 0; },
        check: function () {
          var ok = (item.accept || []).some(function (a) { return norm(a) === norm(inp.value); });
          return { correct: ok, givenText: inp.value || '(no answer)', expectedText: (item.accept || [])[0] };
        },
        lock: function () { inp.disabled = true; }
      };
    },

    pick: function (host, item) {
      renderStem(host, item);
      var chosen = -1, cards = [];
      var grid = el('div', 'shelf');
      item.items.forEach(function (p, i) {
        var c = el('button', 'goods');
        c.type = 'button';
        c.innerHTML = '<span class="goods-n">' + esc(p.name) + '</span>' +
          '<span class="goods-p">' + esc(p.price) + '</span>' +
          '<span class="goods-x">' + esc(p.note || '') + '</span>';
        c.addEventListener('click', function () {
          if (grid.dataset.locked) return;
          chosen = i;
          cards.forEach(function (x, j) { x.classList.toggle('sel', j === i); });
          host.dispatchEvent(new CustomEvent('respond', { bubbles: true }));
        });
        cards.push(c); grid.appendChild(c);
      });
      host.appendChild(grid);
      return {
        response: function () { return chosen; },
        hasResponse: function () { return chosen >= 0; },
        check: function () {
          return {
            correct: chosen === item.answer,
            givenText: chosen >= 0 ? item.items[chosen].name : '(no answer)',
            expectedText: item.items[item.answer].name
          };
        },
        lock: function () {
          grid.dataset.locked = '1';
          cards.forEach(function (c, i) {
            c.disabled = true;
            if (i === item.answer) c.classList.add('right');
            else if (i === chosen) c.classList.add('wrong');
          });
        }
      };
    },

    sort: function (host, item) {
      renderStem(host, item);
      var placed = {};                       /* item index -> bin key */
      var pool = el('div', 'sort-pool');
      var bins = el('div', 'sort-bins');
      bins.style.setProperty('--cols', String(item.bins.length));
      var chips = [], binEls = {};
      var locked = false;

      function paint() {
        item.bins.forEach(function (b) {
          var drop = binEls[b.key].querySelector('.sort-drop');
          drop.innerHTML = '';
          var any = false;
          item.items.forEach(function (it, i) {
            if (placed[i] !== b.key) return;
            any = true;
            var c = el('button', 'chip-i in');
            c.type = 'button';
            c.innerHTML = it.text;
            if (locked) c.classList.add(it.bin === b.key ? 'right' : 'wrong');
            c.disabled = locked;
            c.addEventListener('click', function () {
              if (locked) return;
              delete placed[i]; paint();
              host.dispatchEvent(new CustomEvent('respond', { bubbles: true }));
            });
            drop.appendChild(c);
          });
          if (!any) drop.appendChild(el('span', 'sort-empty', 'tap a word, then this box'));
        });
        chips.forEach(function (c, i) {
          c.classList.toggle('gone', placed[i] != null);
          c.disabled = placed[i] != null || locked;
        });
        var all = Object.keys(placed).length === item.items.length;
        pool.classList.toggle('spent', all);
        var done = pool.querySelector('.sort-done');
        if (all && !done) pool.appendChild(el('span', 'sort-done', 'All placed — press Check'));
        if (!all && done) pool.removeChild(done);
      }

      var picked = -1;
      function selectChip(i) {
        picked = picked === i ? -1 : i;
        chips.forEach(function (c, j) { c.classList.toggle('armed', j === picked); });
        Object.keys(binEls).forEach(function (k) { binEls[k].classList.toggle('ready', picked >= 0); });
      }

      item.items.forEach(function (it, i) {
        var c = el('button', 'chip-i');
        c.type = 'button';
        c.innerHTML = it.text;
        c.addEventListener('click', function () { if (!locked) selectChip(i); });
        chips.push(c); pool.appendChild(c);
      });

      item.bins.forEach(function (b) {
        var box = el('div', 'sort-bin');
        box.innerHTML = '<div class="sort-h"><b>' + b.label + '</b>' +
          (b.hint ? '<span>' + esc(b.hint) + '</span>' : '') + '</div><div class="sort-drop"></div>';
        box.addEventListener('click', function () {
          if (locked || picked < 0) return;
          placed[picked] = b.key;
          selectChip(picked);
          paint();
          host.dispatchEvent(new CustomEvent('respond', { bubbles: true }));
        });
        binEls[b.key] = box; bins.appendChild(box);
      });

      host.appendChild(pool);
      host.appendChild(bins);
      paint();

      return {
        response: function () { return JSON.stringify(placed); },
        hasResponse: function () { return Object.keys(placed).length === item.items.length; },
        check: function () {
          var wrong = item.items.filter(function (it, i) { return placed[i] !== it.bin; });
          var label = {};
          item.bins.forEach(function (b) { label[b.key] = b.label; });
          return {
            correct: wrong.length === 0,
            givenText: item.items.map(function (it, i) { return it.text + '→' + (label[placed[i]] || '?'); }).join('; '),
            expectedText: item.bins.map(function (b) {
              return b.label + ': ' + item.items.filter(function (x) { return x.bin === b.key; })
                .map(function (x) { return x.text; }).join(', ');
            }).join(' | ')
          };
        },
        lock: function () { locked = true; selectChip(-1); paint(); }
      };
    },

    spot: function (host, item) {
      renderStem(host, item);
      var chosen = -1, toks = [];
      var line = el('div', 'tokens');
      item.words.forEach(function (w, i) {
        var b = el('button', 'tok');
        b.type = 'button'; b.textContent = w;
        b.addEventListener('click', function () {
          if (line.dataset.locked) return;
          chosen = i;
          toks.forEach(function (x, j) { x.classList.toggle('sel', j === i); });
          host.dispatchEvent(new CustomEvent('respond', { bubbles: true }));
        });
        toks.push(b); line.appendChild(b);
      });
      host.appendChild(line);
      return {
        response: function () { return chosen; },
        hasResponse: function () { return chosen >= 0; },
        check: function () {
          return {
            correct: chosen === item.answer,
            givenText: chosen >= 0 ? item.words[chosen] : '(no answer)',
            expectedText: item.words[item.answer] + ' → ' + item.fix
          };
        },
        lock: function () {
          line.dataset.locked = '1';
          toks.forEach(function (b, i) {
            b.disabled = true;
            if (i === item.answer) b.classList.add('right');
            else if (i === chosen) b.classList.add('wrong');
          });
          var f = el('div', 'fixnote', '<strong>' + esc(item.words[item.answer]) + '</strong> → ' + esc(item.fix));
          host.appendChild(f);
        }
      };
    },

    build: function (host, item) {
      renderStem(host, item);
      var picked = [];
      var slot = el('div', 'slot');
      var pool = el('div', 'tiles');
      var order = shuffle(item.tiles.map(function (t, i) { return i; }));

      function paint() {
        slot.innerHTML = '';
        if (!picked.length) { slot.appendChild(el('span', 'slot-hint', 'Tap the words in order')); }
        picked.forEach(function (idx, pos) {
          var b = el('button', 'tile in');
          b.type = 'button'; b.textContent = item.tiles[idx];
          b.addEventListener('click', function () {
            if (slot.dataset.locked) return;
            picked.splice(pos, 1); paint();
            host.dispatchEvent(new CustomEvent('respond', { bubbles: true }));
          });
          slot.appendChild(b);
        });
        Array.prototype.forEach.call(pool.children, function (b, i) {
          b.disabled = picked.indexOf(order[i]) >= 0 || !!slot.dataset.locked;
          b.classList.toggle('used', picked.indexOf(order[i]) >= 0);
        });
      }
      order.forEach(function (idx) {
        var b = el('button', 'tile');
        b.type = 'button'; b.textContent = item.tiles[idx];
        b.addEventListener('click', function () {
          if (slot.dataset.locked || picked.indexOf(idx) >= 0) return;
          picked.push(idx); paint();
          host.dispatchEvent(new CustomEvent('respond', { bubbles: true }));
        });
        pool.appendChild(b);
      });
      host.appendChild(slot); host.appendChild(pool); paint();

      return {
        response: function () { return picked.map(function (i) { return item.tiles[i]; }).join(' '); },
        hasResponse: function () { return picked.length === item.tiles.length; },
        check: function () {
          var got = picked.map(function (i) { return item.tiles[i]; }).join(' ');
          var oks = [item.solution].concat(item.alt || []);
          return {
            correct: oks.some(function (s) { return norm(s) === norm(got); }),
            givenText: got || '(no answer)',
            expectedText: item.solution
          };
        },
        lock: function () {
          slot.dataset.locked = '1'; paint();
          Array.prototype.forEach.call(slot.children, function (b) { b.disabled = true; });
        }
      };
    },

    order: function (host, item) {
      renderStem(host, item);
      var picked = [];
      var display = shuffle(item.items.map(function (t, i) { return i; }));
      var slot = el('div', 'rank-slot');
      var pool = el('div', 'rank-pool');

      function paint() {
        slot.innerHTML = '';
        if (!picked.length) slot.appendChild(el('span', 'slot-hint', 'Tap them in the right order'));
        picked.forEach(function (idx, pos) {
          var b = el('button', 'rank in');
          b.type = 'button';
          b.innerHTML = '<span class="rank-n">' + (pos + 1) + '</span>' + esc(item.items[idx]);
          b.addEventListener('click', function () {
            if (slot.dataset.locked) return;
            picked.splice(pos, 1); paint();
            host.dispatchEvent(new CustomEvent('respond', { bubbles: true }));
          });
          slot.appendChild(b);
        });
        Array.prototype.forEach.call(pool.children, function (b, i) {
          b.disabled = picked.indexOf(display[i]) >= 0 || !!slot.dataset.locked;
          b.classList.toggle('used', picked.indexOf(display[i]) >= 0);
        });
      }
      display.forEach(function (idx) {
        var b = el('button', 'rank');
        b.type = 'button'; b.textContent = item.items[idx];
        b.addEventListener('click', function () {
          if (slot.dataset.locked || picked.indexOf(idx) >= 0) return;
          picked.push(idx); paint();
          host.dispatchEvent(new CustomEvent('respond', { bubbles: true }));
        });
        pool.appendChild(b);
      });
      host.appendChild(slot); host.appendChild(pool); paint();

      return {
        response: function () { return picked.join(','); },
        hasResponse: function () { return picked.length === item.items.length; },
        check: function () {
          var ok = picked.every(function (v, i) { return v === i; }) && picked.length === item.items.length;
          return {
            correct: ok,
            givenText: picked.map(function (i) { return item.items[i]; }).join(' → ') || '(no answer)',
            expectedText: item.items.join(' → ')
          };
        },
        lock: function () {
          slot.dataset.locked = '1'; paint();
          Array.prototype.forEach.call(slot.children, function (b, i) {
            b.disabled = true;
            b.classList.add(picked[i] === i ? 'right' : 'wrong');
          });
        }
      };
    }
  };

  function mount(item, host) {
    host.innerHTML = '';
    host.dataset.type = item.type;
    var fn = RENDER[item.type] || RENDER.choose;
    return fn(host, item);
  }

  var TYPE_LABEL = {
    choose: 'Choose', equiv: 'Same meaning', judge: 'True / False / Can\'t tell',
    gap: 'Complete the dialogue', table: 'Read the table', pick: 'Follow the instruction',
    sort: 'Put each one in the right box',
    spot: 'Find the mistake', build: 'Build the sentence', order: 'Put them in order'
  };

  /* ------------------------------------------------------------- progress */
  var XP_CORRECT = 10, XP_FIRST_TRY = 4, XP_LESSON = 40, XP_CHALLENGE = 120;
  var XP_SPEED = 6, SPEED_MS = 7000;   /* answer inside 7s for the time bonus */
  var PASS_LESSON = 0.6, PASS_CHALLENGE = 0.75;

  function blank(id, name) {
    return {
      studentId: id, displayName: name || id,
      xp: 0, streak: 0, longestStreak: 0, lastActiveDate: null,
      sessions: 0, runBest: 0, run: 0, reclaimed: 0, speedBonuses: 0,
      lessons: {}, challenges: {}, badges: [], review: {},
      stats: { seen: 0, correct: 0, byTag: {} },
      assignment: null, created: new Date().toISOString()
    };
  }

  function stageClearedCount(p) {
    var n = 0;
    for (var i = 0; i < C.STAGES.length; i++) {
      var ch = p.challenges[C.STAGES[i].challenge.id];
      if (ch && ch.best >= PASS_CHALLENGE) n++; else break;
    }
    return n;
  }
  function rank(p) { return C.RANKS[stageClearedCount(p)]; }

  function lessonsDone(p, st) {
    return st.lessons.filter(function (l) {
      var r = p.lessons[l.id]; return r && r.best >= PASS_LESSON;
    }).length;
  }
  function challengeUnlocked(p, st) { return lessonsDone(p, st) === st.lessons.length; }
  function stageUnlocked(p, st) {
    if (st.n === 1) return true;
    var prev = C.STAGES[st.n - 2];
    var ch = p.challenges[prev.challenge.id];
    return !!(ch && ch.best >= PASS_CHALLENGE);
  }

  /* trip readiness: each stage is worth 12.5 — lessons 60%, challenge 40% */
  function readiness(p) {
    var total = 0;
    C.STAGES.forEach(function (st) {
      var lm = 0;
      st.lessons.forEach(function (l) { lm += Math.min(1, (p.lessons[l.id] || {}).best || 0); });
      lm = lm / st.lessons.length;
      var cm = Math.min(1, (p.challenges[st.challenge.id] || {}).best || 0);
      total += (lm * 0.6 + cm * 0.4) * (100 / C.STAGES.length);
    });
    return Math.round(total);
  }

  function accuracy(p) {
    return p.stats.seen ? Math.round(100 * p.stats.correct / p.stats.seen) : 0;
  }

  /* ------------------------------------------------- Leitner spaced review */
  function scheduleReview(p, itemId, correct) {
    var r = p.review[itemId];
    if (!correct) {
      p.review[itemId] = { box: 1, due: p.sessions + 1, misses: ((r && r.misses) || 0) + 1 };
    } else if (r) {
      var box = Math.min(3, (r.box || 1) + 1);
      if (box >= 3) { delete p.review[itemId]; p.reclaimed++; }
      else { r.box = box; r.due = p.sessions + (box === 2 ? 2 : 4); }
    }
  }
  function dueReview(p) {
    return Object.keys(p.review).filter(function (id) {
      return BANK[id] && p.review[id].due <= p.sessions;
    });
  }

  /* ------------------------------------------------------------- recording */
  function recordAttempt(p, item, correct, ms, hinted, fast) {
    p.stats.seen++;
    if (correct) { p.stats.correct++; p.run++; p.runBest = Math.max(p.runBest, p.run); }
    else { p.run = 0; }
    var t = p.stats.byTag[item.tag] || (p.stats.byTag[item.tag] = { a: 0, c: 0 });
    t.a++; if (correct) t.c++;
    var gain = 0;
    if (correct) {
      gain = hinted ? XP_CORRECT - XP_FIRST_TRY : XP_CORRECT;
      if (fast) { gain += XP_SPEED; p.speedBonuses = (p.speedBonuses || 0) + 1; }
    }
    p.xp += gain;
    p.lastGain = gain;
    scheduleReview(p, item.id, correct);
    return {
      ts: new Date().toISOString(), studentId: p.studentId, itemId: item.id,
      stage: STAGE_OF[item.id], type: item.type, tag: item.tag, level: item.level,
      correct: correct ? 1 : 0, ms: ms || 0, hinted: hinted ? 1 : 0, fast: fast ? 1 : 0
    };
  }

  function finishLesson(p, lessonId, score) {
    var r = p.lessons[lessonId] || (p.lessons[lessonId] = { best: 0, attempts: 0 });
    r.attempts++;
    if (score > r.best) r.best = score;
    r.last = score; r.at = new Date().toISOString();
    if (score >= PASS_LESSON) p.xp += XP_LESSON;
  }

  function finishChallenge(p, chId, score, usedHint) {
    var r = p.challenges[chId] || (p.challenges[chId] = { best: 0, attempts: 0, failedOnce: false });
    r.attempts++;
    if (score < PASS_CHALLENGE && r.best < PASS_CHALLENGE) r.failedOnce = true;
    if (score >= PASS_CHALLENGE && r.failedOnce) r.comeback = true;
    if (score >= 1) { r.perfect = true; if (!usedHint) r.cleanPerfect = true; }
    if (!usedHint && score >= PASS_CHALLENGE) r.noHint = true;
    if (score > r.best) r.best = score;
    r.last = score; r.at = new Date().toISOString();
    if (score >= PASS_CHALLENGE) p.xp += XP_CHALLENGE;
  }

  function touchDay(p) {
    var d = today();
    if (p.lastActiveDate === d) return false;
    if (p.lastActiveDate && daysBetween(p.lastActiveDate, d) === 1) p.streak++;
    else p.streak = 1;
    p.longestStreak = Math.max(p.longestStreak || 0, p.streak);
    p.lastActiveDate = d;
    p.sessions++;
    return true;
  }

  /* ---------------------------------------------------------------- badges */
  var BADGE_TESTS = {
    passport: function (p) { return Object.keys(p.lessons).length >= 1; },
    streak3: function (p) { return p.streak >= 3 || p.longestStreak >= 3; },
    streak7: function (p) { return p.streak >= 7 || p.longestStreak >= 7; },
    streak14: function (p) { return p.streak >= 14 || p.longestStreak >= 14; },
    upgrade: function (p) { return Object.keys(p.challenges).some(function (k) { return p.challenges[k].perfect; }); },
    firstclass: function (p) {
      return Object.keys(p.challenges).filter(function (k) { return p.challenges[k].perfect; }).length >= 3;
    },
    solo: function (p) { return Object.keys(p.challenges).some(function (k) { return p.challenges[k].noHint; }); },
    reclaim: function (p) { return p.reclaimed >= 5; },
    tailwind: function (p) { return p.runBest >= 10; },
    rebooked: function (p) { return Object.keys(p.challenges).some(function (k) { return p.challenges[k].comeback; }); },
    nonstop: function (p) { return !!p._nonstop; },
    quickdraw: function (p) { return (p.speedBonuses || 0) >= 25; },
    frequent: function (p) { return stageClearedCount(p) >= 8; }
  };
  function checkBadges(p) {
    var earned = [];
    C.BADGES.forEach(function (b) {
      if (p.badges.indexOf(b.id) >= 0) return;
      var t = BADGE_TESTS[b.id];
      if (t && t(p)) { p.badges.push(b.id); earned.push(b); }
    });
    return earned;
  }

  /* ------------------------------------------------- teacher-side analysis */
  /* Rank error tags by how much trouble they are actually causing:
     weight = error rate x log(attempts), so one unlucky miss does not
     outrank a pattern of six. */
  function weakTags(p, limit) {
    var rows = Object.keys(p.stats.byTag).map(function (tag) {
      var t = p.stats.byTag[tag];
      var rate = t.a ? 1 - t.c / t.a : 0;
      return {
        tag: tag, attempts: t.a, correct: t.c, wrong: t.a - t.c,
        rate: rate, weight: rate * Math.log(1 + t.a),
        info: C.REMEDIATION[tag] || { name: tag }
      };
    }).filter(function (r) { return r.wrong > 0; });
    rows.sort(function (a, b) { return b.weight - a.weight; });
    return limit ? rows.slice(0, limit) : rows;
  }

  function strongTags(p, limit) {
    var rows = Object.keys(p.stats.byTag).map(function (tag) {
      var t = p.stats.byTag[tag];
      return { tag: tag, attempts: t.a, rate: t.a ? t.c / t.a : 0, info: C.REMEDIATION[tag] || { name: tag } };
    }).filter(function (r) { return r.attempts >= 3 && r.rate >= 0.85; });
    rows.sort(function (a, b) { return b.rate - a.rate || b.attempts - a.attempts; });
    return limit ? rows.slice(0, limit) : rows;
  }

  global.Engine = {
    el: el, esc: esc, shuffle: shuffle, norm: norm, today: today, daysBetween: daysBetween,
    mount: mount, TYPE_LABEL: TYPE_LABEL, Bank: Bank, art: artSvg, artBand: artBand, ART: ART,
    PASS_LESSON: PASS_LESSON, PASS_CHALLENGE: PASS_CHALLENGE, SPEED_MS: SPEED_MS, XP_SPEED: XP_SPEED,
    Progress: {
      blank: blank, rank: rank, stageClearedCount: stageClearedCount,
      lessonsDone: lessonsDone, challengeUnlocked: challengeUnlocked, stageUnlocked: stageUnlocked,
      readiness: readiness, accuracy: accuracy,
      recordAttempt: recordAttempt, finishLesson: finishLesson, finishChallenge: finishChallenge,
      touchDay: touchDay, checkBadges: checkBadges,
      dueReview: dueReview, weakTags: weakTags, strongTags: strongTags
    }
  };
})(window);
