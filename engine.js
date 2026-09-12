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
    spot: 'Find the mistake', build: 'Build the sentence', order: 'Put them in order'
  };

  /* ------------------------------------------------------------- progress */
  var XP_CORRECT = 10, XP_FIRST_TRY = 4, XP_LESSON = 40, XP_CHALLENGE = 120;
  var PASS_LESSON = 0.6, PASS_CHALLENGE = 0.75;

  function blank(id, name) {
    return {
      studentId: id, displayName: name || id,
      xp: 0, streak: 0, longestStreak: 0, lastActiveDate: null,
      sessions: 0, runBest: 0, run: 0, reclaimed: 0,
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
  function recordAttempt(p, item, correct, ms, hinted) {
    p.stats.seen++;
    if (correct) { p.stats.correct++; p.run++; p.runBest = Math.max(p.runBest, p.run); }
    else { p.run = 0; }
    var t = p.stats.byTag[item.tag] || (p.stats.byTag[item.tag] = { a: 0, c: 0 });
    t.a++; if (correct) t.c++;
    p.xp += correct ? (hinted ? XP_CORRECT - XP_FIRST_TRY : XP_CORRECT) : 0;
    scheduleReview(p, item.id, correct);
    return {
      ts: new Date().toISOString(), studentId: p.studentId, itemId: item.id,
      stage: STAGE_OF[item.id], type: item.type, tag: item.tag, level: item.level,
      correct: correct ? 1 : 0, ms: ms || 0, hinted: hinted ? 1 : 0
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
    mount: mount, TYPE_LABEL: TYPE_LABEL, Bank: Bank,
    PASS_LESSON: PASS_LESSON, PASS_CHALLENGE: PASS_CHALLENGE,
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
