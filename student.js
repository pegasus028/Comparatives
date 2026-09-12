/* ===========================================================================
   DEPARTURE BOARD — student.js
   =========================================================================== */
(function () {
  'use strict';
  var C = window.CONTENT, E = window.Engine, P = E.Progress, api = window.API;
  var $ = function (s) { return document.querySelector(s); };
  var esc = E.esc;

  var S = {
    p: null,               // progress object
    pending: [],           // attempt rows waiting to sync
    sessItems: 0, sessCorrect: 0,
    run: null,             // active run: {kind, items, i, results, lessonId, chId, hinted}
    simple: false,
    stageOpen: null,
    nonstopStage: null, nonstopSeen: {}
  };

  /* ------------------------------------------------------------- helpers */
  function toast(msg, ms) {
    var slot = $('#toast-slot');
    slot.innerHTML = '<div class="toast">' + esc(msg) + '</div>';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { slot.innerHTML = ''; }, ms || 2600);
  }
  function modal(html) {
    var slot = $('#modal-slot');
    slot.innerHTML = '<div class="modal"><div class="modal-card">' + html + '</div></div>';
    slot.querySelector('.modal').addEventListener('click', function (ev) {
      if (ev.target === this) slot.innerHTML = '';
    });
    var b = slot.querySelector('[data-close]');
    if (b) b.addEventListener('click', function () { slot.innerHTML = ''; });
  }
  function pct(x) { return Math.round((x || 0) * 100); }

  /* --------------------------------------------------------------- sync */
  function sync(force) {
    if (!S.p) return Promise.resolve();
    S.p._readiness = P.readiness(S.p);      // derived column for the sheet
    var batch = S.pending; S.pending = [];
    return api.save(S.p, batch).then(function (r) {
      if (!r || !r.ok) { S.pending = batch.concat(S.pending); }
      return r;
    }).catch(function () { S.pending = batch.concat(S.pending); });
  }
  var syncSoon = (function () {
    var t;
    return function () { clearTimeout(t); t = setTimeout(sync, 1500); };
  })();

  /* --------------------------------------------------------- mode banner */
  function paintMode() {
    var slot = $('#modebar-slot');
    if (api.mode === 'cloud') { slot.innerHTML = ''; return; }
    slot.innerHTML = '<div class="wrap"><div class="modebar">' +
      '<span><b>Demo mode</b> &nbsp;Your progress is saved in this browser only. ' +
      'Your teacher will not see it until the class server is connected.</span>' +
      '<button class="btn sm" id="mb-connect">Connect</button></div></div>';
    var b = $('#mb-connect');
    if (b) b.addEventListener('click', function () { show('settings'); });
  }
  api.onModeChange = function () { paintMode(); toast('Lost the class server — saving locally for now.'); };

  /* =====================================================================
     LOGIN
     ===================================================================== */
  var mode = 'in';
  function setMode(m) {
    mode = m;
    $('#tab-in').classList.toggle('on', m === 'in');
    $('#tab-new').classList.toggle('on', m === 'new');
    $('#wrap-name').classList.toggle('hidden', m !== 'new');
    $('#btn-go').textContent = m === 'in' ? 'Log in' : 'Create my account';
    $('#f-pw').setAttribute('autocomplete', m === 'in' ? 'current-password' : 'new-password');
    say('');
  }
  function say(text, bad) {
    var m = $('#login-msg');
    m.className = 'msg ' + (bad ? 'bad' : 'info') + (text ? '' : ' hidden');
    m.textContent = text;
  }
  $('#tab-in').addEventListener('click', function () { setMode('in'); });
  $('#tab-new').addEventListener('click', function () { setMode('new'); });

  function go() {
    var id = $('#f-id').value.trim().toLowerCase();
    var pw = $('#f-pw').value;
    var name = $('#f-name').value.trim();
    if (!id) return say('Enter a student ID.', true);
    if (!/^[a-z0-9._-]{3,24}$/.test(id)) return say('Use 3–24 letters, numbers, dots or dashes — no spaces.', true);
    if (pw.length < 4) return say('Your password needs at least 4 characters.', true);
    if (mode === 'new' && !name) return say('Enter the name your teacher will see.', true);
    $('#btn-go').disabled = true;
    say(mode === 'new' ? 'Creating your account…' : 'Checking…');
    var req = mode === 'new' ? api.register(id, pw, name) : api.login(id, pw);
    req.then(function (r) {
      $('#btn-go').disabled = false;
      if (!r || !r.ok) return say((r && r.error) || 'Something went wrong. Try again.', true);
      start(r.progress || P.blank(id, name || id));
    }).catch(function (e) {
      $('#btn-go').disabled = false;
      say('Could not reach the server: ' + e.message, true);
    });
  }
  $('#btn-go').addEventListener('click', go);
  ['f-id', 'f-pw', 'f-name'].forEach(function (k) {
    $('#' + k).addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  });

  $('#btn-demo').addEventListener('click', function () {
    var id = 'demo-traveller';
    if (!api.demoHas(id)) api.demoSeed([seedDemo(id)]);
    api.login(id, 'demo').then(function (r) { start(r.progress || P.blank(id, 'Demo Traveller')); });
  });

  /* A demo account opens partway through the map, so the first look shows a
     working app rather than an empty shell. Clearly an example, not real data. */
  function seedDemo(id) {
    var p = P.blank(id, 'Demo Traveller');
    p.xp = 940; p.streak = 4; p.longestStreak = 4; p.sessions = 5;
    p.lastActiveDate = E.today();
    p.lessons = {
      s1l1: { best: 1, attempts: 1 }, s1l2: { best: 0.83, attempts: 2 }, s1l3: { best: 1, attempts: 1 },
      s2l1: { best: 0.83, attempts: 1 }, s2l2: { best: 0.71, attempts: 2 }, s2l3: { best: 0.8, attempts: 1 },
      s3l1: { best: 0.8, attempts: 1 }, s3l2: { best: 0.6, attempts: 2 }
    };
    p.challenges = { s1ch: { best: 1, attempts: 1, perfect: true, noHint: true }, s2ch: { best: 0.875, attempts: 2, failedOnce: true, comeback: true } };
    p.badges = ['passport', 'streak3', 'upgrade', 'solo', 'rebooked'];
    p.stats = {
      seen: 74, correct: 58,
      byTag: {
        gradability: { a: 8, c: 7 }, 'form-er-more': { a: 12, c: 9 }, 'than-basic': { a: 8, c: 7 },
        'superlative-the': { a: 9, c: 8 }, 'superlative-set': { a: 11, c: 6 }, irregular: { a: 7, c: 6 },
        equative: { a: 9, c: 8 }, ratio: { a: 6, c: 4 }, 'less-fewer': { a: 4, c: 3 }
      }
    };
    p.review = { 's2l2-01': { box: 1, due: 5, misses: 2 }, 's3l2-01': { box: 1, due: 5, misses: 1 }, 's2l2-03': { box: 2, due: 7, misses: 1 } };
    return p;
  }

  /* =====================================================================
     START
     ===================================================================== */
  function start(progress) {
    S.p = progress;
    if (!S.p.stats) S.p.stats = { seen: 0, correct: 0, byTag: {} };
    if (!S.p.review) S.p.review = {};
    if (!S.p.badges) S.p.badges = [];
    var isNewDay = P.touchDay(S.p);
    $('#screen-login').classList.add('hidden');
    $('#screen-app').classList.remove('hidden');
    paintMode();
    paintHeader();
    show('map');
    api.startSession(S.p.studentId);
    var earned = P.checkBadges(S.p);
    sync();
    if (isNewDay && S.p.streak > 1) toast('Day ' + S.p.streak + ' in a row. Keep the streak alive.');
    if (earned.length) setTimeout(function () { celebrate(earned[0]); }, 900);
  }

  function logout() {
    api.endSession(S.p.studentId, S.sessItems, S.sessCorrect);
    sync().then(function () { location.reload(); });
  }
  $('#btn-out').addEventListener('click', logout);
  window.addEventListener('beforeunload', function () {
    if (S.p) { api.endSession(S.p.studentId, S.sessItems, S.sessCorrect); sync(); }
  });

  /* ----------------------------------------------------------- header UI */
  function paintHeader() {
    var p = S.p, r = P.rank(p), ready = P.readiness(p);
    $('#hdr-name').textContent = p.displayName;
    $('#hdr-rank').textContent = 'Level ' + r.n + ' · ' + r.name;
    $('#hdr-ready').textContent = ready + '%';
    $('#hdr-bar').style.width = ready + '%';
    $('#hdr-streak').textContent = p.streak || 0;
    $('#hdr-xp').textContent = p.xp || 0;
    var due = P.dueReview(p).length;
    $('#nav-review').textContent = due ? ' (' + due + ')' : '';
    $('#nav-test').textContent = p.assignment && !p.assignment.done ? ' •' : '';
  }

  /* --------------------------------------------------------------- views */
  var VIEWS = ['map', 'play', 'review', 'pass', 'test', 'settings'];
  function show(v) {
    VIEWS.forEach(function (x) { $('#view-' + x).classList.toggle('hidden', x !== v); });
    document.querySelectorAll('.nav button[data-view]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.view === v);
    });
    if (v === 'map') paintMap();
    if (v === 'review') paintReview();
    if (v === 'pass') paintPassport();
    if (v === 'test') paintTest();
    if (v === 'settings') paintSettings();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }
  document.querySelectorAll('.nav button[data-view]').forEach(function (b) {
    b.addEventListener('click', function () { show(b.dataset.view); });
  });

  /* =====================================================================
     ROADMAP
     ===================================================================== */
  function stagePct(st) {
    var lm = 0;
    st.lessons.forEach(function (l) { lm += Math.min(1, (S.p.lessons[l.id] || {}).best || 0); });
    lm /= st.lessons.length;
    var cm = Math.min(1, (S.p.challenges[st.challenge.id] || {}).best || 0);
    return Math.round((lm * 0.6 + cm * 0.4) * 100);
  }

  function paintMap() {
    var p = S.p, r = P.rank(p);
    var html = '<div class="sect-h"><div>' +
      '<h2>Your trip</h2>' +
      '<p style="color:var(--ink-2);font-size:.92rem;margin-top:4px">' + esc(r.note) + '</p>' +
      '</div><span class="pill on">' + P.stageClearedCount(p) + ' of 8 gates cleared</span></div>';

    html += '<div class="gates">';
    C.STAGES.forEach(function (st) {
      var unlocked = P.stageUnlocked(p, st);
      var chal = p.challenges[st.challenge.id];
      var cleared = chal && chal.best >= E.PASS_CHALLENGE;
      var pc = stagePct(st);
      var open = S.stageOpen === st.id;
      var cls = 'gate' + (cleared ? ' done' : unlocked ? ' open' : ' locked') + (open ? ' exp' : '');

      html += '<div class="' + cls + '" data-stage="' + st.id + '"><div class="dot"></div><div class="gate-card">';
      html += '<button class="gate-head" data-toggle="' + st.id + '"' + (unlocked ? '' : ' disabled') + '>' +
        '<div class="gate-meta">' +
          '<div class="gate-line1">' +
            '<span class="gate-n">' + esc(st.gate) + '</span>' +
            '<span class="gate-name">' + esc(st.name) + '</span>' +
            '<span class="pill">' + esc(st.cefr) + '</span>' +
            (cleared ? '<span class="pill good">Cleared</span>' : unlocked ? '' : '<span class="pill">Locked</span>') +
          '</div>' +
          '<p class="gate-blurb">' + esc(st.blurb) + '</p>' +
          '<div class="gate-prog"><div class="bar"><span style="width:' + pc + '%"></span></div>' +
          '<span class="gate-pct">' + pc + '%</span></div>' +
        '</div><span class="caret">›</span></button>';

      if (open && unlocked) {
        html += '<div class="gate-body">';
        st.lessons.forEach(function (ls) {
          var rec = p.lessons[ls.id];
          var done = rec && rec.best >= E.PASS_LESSON;
          html += '<button class="lrow' + (done ? ' done' : '') + '" data-lesson="' + ls.id + '">' +
            '<span class="lrow-tick"></span>' +
            '<span class="lrow-txt"><span class="lrow-name">' + esc(ls.name) + '</span>' +
            '<span class="lrow-sub">' + esc(ls.cefr) + ' · ' + ls.items.length + ' questions</span></span>' +
            '<span class="lrow-score">' + (rec ? pct(rec.best) + '%' : '') + '</span></button>';
        });
        var cu = P.challengeUnlocked(p, st);
        var crec = p.challenges[st.challenge.id];
        html += '<button class="lrow chal' + (cleared ? ' done' : '') + '" data-challenge="' + st.id + '"' + (cu ? '' : ' disabled') + '>' +
          '<span class="lrow-tick"></span>' +
          '<span class="lrow-txt"><span class="lrow-name">' + esc(st.challenge.name) + '</span>' +
          '<span class="lrow-sub">' + (cu ? st.challenge.items.length + ' questions · pass at 75%' : 'Finish all three lessons to unlock') + '</span></span>' +
          '<span class="lrow-score">' + (crec ? pct(crec.best) + '%' : '') + '</span></button>';
        html += '</div>';
      }
      html += '</div></div>';
    });
    html += '</div>';
    $('#view-map').innerHTML = html;

    $('#view-map').querySelectorAll('[data-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        S.stageOpen = S.stageOpen === b.dataset.toggle ? null : b.dataset.toggle;
        paintMap();
      });
    });
    $('#view-map').querySelectorAll('[data-lesson]').forEach(function (b) {
      b.addEventListener('click', function () { openLesson(b.dataset.lesson); });
    });
    $('#view-map').querySelectorAll('[data-challenge]').forEach(function (b) {
      b.addEventListener('click', function () { startChallenge(b.dataset.challenge); });
    });
  }

  /* =====================================================================
     THEORY
     ===================================================================== */
  function openLesson(lessonId) {
    var ls = E.Bank.lesson(lessonId);
    var paras = (S.simple && ls.theory.simple) ? ls.theory.simple : ls.theory.body;
    var html = '<div class="play">' +
      '<div class="play-top"><button class="btn ghost sm" id="p-back">← Roadmap</button>' +
      '<span class="grow"></span><span class="qcount">Theory</span></div>' +
      '<div class="card theory">' +
      '<p class="kicker">' + esc(ls.cefr) + ' · Lesson</p>' +
      '<h3>' + esc(ls.name) + '</h3>' +
      '<p class="key">' + ls.theory.key + '</p>' +
      '<button class="btn sm simple-btn" id="p-simple">' + (S.simple ? 'Show the full explanation' : 'Explain this more simply') + '</button>' +
      '<div class="prose">' + paras.map(function (t) { return '<p>' + t + '</p>'; }).join('') + '</div>';
    if (ls.theory.examples) {
      html += '<div class="exlist">' + ls.theory.examples.map(function (e) {
        return '<div><div class="s">' + e.s + '</div><div class="g">' + esc(e.g) + '</div></div>';
      }).join('') + '</div>';
    }
    html += '<button class="btn primary wide" id="p-start">Start the ' + ls.items.length + ' questions →</button>' +
      '</div></div>';
    $('#view-play').innerHTML = html;
    show('play');
    $('#p-back').addEventListener('click', function () { show('map'); });
    $('#p-simple').addEventListener('click', function () { S.simple = !S.simple; openLesson(lessonId); });
    $('#p-start').addEventListener('click', function () { startRun('lesson', ls.items, { lessonId: lessonId, title: ls.name }); });
  }

  /* =====================================================================
     RUNNER
     ===================================================================== */
  function startRun(kind, items, meta) {
    S.run = {
      kind: kind, items: items.slice(), i: 0, results: [],
      lessonId: meta.lessonId, chId: meta.chId, title: meta.title,
      hintedAny: false, t0: 0
    };
    if (kind === 'challenge' || kind === 'test') S.run.items = E.shuffle(S.run.items);
    show('play');
    renderQ();
  }

  function startChallenge(stageId) {
    var st = C.STAGES.filter(function (s) { return s.id === stageId; })[0];
    S.nonstopStage = stageId;
    startRun('challenge', st.challenge.items, { chId: st.challenge.id, title: st.challenge.name });
  }

  function renderQ() {
    var r = S.run, item = r.items[r.i];
    var prog = Math.round(100 * r.i / r.items.length);
    var canHint = r.kind === 'lesson' || r.kind === 'review';

    $('#view-play').innerHTML = '<div class="play">' +
      '<div class="play-top">' +
        '<button class="btn ghost sm" id="p-quit">✕</button>' +
        '<div class="bar thin"><span style="width:' + prog + '%"></span></div>' +
        '<span class="qcount">' + (r.i + 1) + ' / ' + r.items.length + '</span>' +
      '</div>' +
      '<div class="card qcard">' +
        '<div class="qtype"><span>' + esc(E.TYPE_LABEL[item.type] || 'Question') + '</span><span class="lv">' + esc(item.level) + '</span></div>' +
        '<div id="qhost"></div>' +
        '<div id="feedback"></div>' +
        '<div class="qfoot">' +
          (canHint ? '<button class="btn sm" id="p-hint">Hint</button>' : '') +
          '<span class="grow"></span>' +
          '<button class="btn primary" id="p-check" disabled>Check</button>' +
        '</div>' +
      '</div></div>';

    var host = $('#qhost');
    var view = E.mount(item, host);
    r.t0 = Date.now();
    var answered = false;

    host.addEventListener('respond', function () {
      if (!answered) $('#p-check').disabled = !view.hasResponse();
    });

    $('#p-quit').addEventListener('click', function () {
      if (r.results.length && !confirm('Leave now? This attempt will not be saved.')) return;
      S.run = null; show('map');
    });

    var hintBtn = $('#p-hint');
    if (hintBtn) hintBtn.addEventListener('click', function () {
      var rem = C.REMEDIATION[item.tag];
      hintBtn.disabled = true;
      r.hintedAny = true; r.thisHinted = true;
      $('#feedback').innerHTML = '<div class="verdict" style="background:var(--gold-soft);border:1px solid var(--gold)">' +
        '<div class="verdict-h" style="color:var(--gold)">The principle behind this one</div>' +
        '<div class="verdict-w">' + rem.principle + '</div></div>';
    });

    $('#p-check').addEventListener('click', function () {
      if (answered) return next();
      answered = true;
      var out = view.check();
      view.lock();
      var ms = Date.now() - r.t0;
      var hinted = !!r.thisHinted; r.thisHinted = false;

      var row = P.recordAttempt(S.p, item, out.correct, ms, hinted);
      row.given = String(out.givenText).slice(0, 160);
      row.expected = String(out.expectedText).slice(0, 160);
      row.mode = r.kind;
      S.pending.push(row);
      S.sessItems++; if (out.correct) S.sessCorrect++;
      r.results.push({ item: item, correct: out.correct, given: out.givenText, expected: out.expectedText });

      $('#feedback').innerHTML =
        '<div class="verdict ' + (out.correct ? 'ok' : 'no') + '">' +
          '<div class="verdict-h">' + (out.correct ? '✓ Correct' : '✕ Not quite') + '</div>' +
          (out.correct ? '' : '<div class="verdict-exp">You chose: ' + esc(out.givenText) + '<br>Answer: ' + esc(out.expectedText) + '</div>') +
          '<div class="verdict-w">' + item.why + '</div>' +
        '</div>';

      var btn = $('#p-check');
      btn.textContent = r.i + 1 >= r.items.length ? 'See your result' : 'Next →';
      btn.disabled = false;
      paintHeader();
      syncSoon();
      $('#feedback').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    function next() {
      r.i++;
      if (r.i >= r.items.length) finishRun(); else renderQ();
    }
  }

  /* =====================================================================
     RESULT
     ===================================================================== */
  function finishRun() {
    var r = S.run;
    var correct = r.results.filter(function (x) { return x.correct; }).length;
    var score = correct / r.results.length;
    var passed, head, note;

    if (r.kind === 'lesson') {
      P.finishLesson(S.p, r.lessonId, score);
      passed = score >= E.PASS_LESSON;
      head = passed ? 'Lesson cleared' : 'Not yet — go again';
      note = passed ? 'You need 60% to clear a lesson, and you have it. Anything you missed is now in Standby and will come back.'
                    : 'You need 60% to clear this one. Read the theory again and retry — the questions stay the same, so the misses are worth studying.';
    } else if (r.kind === 'challenge') {
      P.finishChallenge(S.p, r.chId, score, r.hintedAny);
      passed = score >= E.PASS_CHALLENGE;
      head = score >= 1 ? 'Perfect. Class upgrade.' : passed ? 'Gate cleared' : 'Gate held';
      note = passed ? 'The next gate is open.' : 'You need 75% to pass the gate. Go back to the lessons you lost marks on — they are listed below.';
      if (passed && S.nonstopStage) {
        var st = C.STAGES.filter(function (s) { return s.id === S.nonstopStage; })[0];
        var allHere = st.lessons.every(function (l) { return S.nonstopSeen[l.id]; });
        if (allHere) S.p._nonstop = true;
      }
    } else if (r.kind === 'test') {
      S.p.assignment.done = true;
      S.p.assignment.score = score;
      S.p.assignment.completedAt = new Date().toISOString();
      passed = score >= 0.7;
      head = 'Level check submitted';
      note = 'Your teacher can see this result. ' + (passed ? 'It confirms the level on your roadmap.' : 'It came out below your roadmap level, so expect some review work.');
    } else {
      passed = true;
      head = 'Standby cleared';
      note = 'Items you get right twice in a row leave Standby for good.';
    }
    if (r.lessonId) S.nonstopSeen[r.lessonId] = true;

    var misses = r.results.filter(function (x) { return !x.correct; });
    var html = '<div class="play"><div class="card result">' +
      '<div class="score-ring" style="--p:' + pct(score) + '"><i>' + pct(score) + '%</i></div>' +
      '<h3>' + esc(head) + '</h3>' +
      '<p>' + esc(note) + '</p>';

    if (misses.length) {
      html += '<div class="misslist">' + misses.map(function (m) {
        var rem = C.REMEDIATION[m.item.tag];
        return '<div class="miss"><b>' + esc(rem ? rem.name : m.item.tag) + '</b>' + m.item.why + '</div>';
      }).join('') + '</div>';
    }
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' +
      '<button class="btn primary" id="r-map">Back to the roadmap</button>' +
      (r.kind === 'lesson' || r.kind === 'challenge' ? '<button class="btn" id="r-again">Try again</button>' : '') +
      '</div></div></div>';

    $('#view-play').innerHTML = html;
    var earned = P.checkBadges(S.p);
    paintHeader();
    sync();

    $('#r-map').addEventListener('click', function () { S.run = null; show('map'); });
    var again = $('#r-again');
    if (again) again.addEventListener('click', function () {
      if (r.kind === 'lesson') startRun('lesson', E.Bank.lesson(r.lessonId).items, { lessonId: r.lessonId, title: r.title });
      else startChallenge(S.nonstopStage);
    });
    if (earned.length) setTimeout(function () { celebrate(earned[0], earned.slice(1)); }, 600);
  }

  function celebrate(badge, rest) {
    modal('<div class="seal">★</div>' +
      '<p class="kicker">Award unlocked</p>' +
      '<h3 style="font-size:1.4rem">' + esc(badge.name) + '</h3>' +
      '<p style="color:var(--ink-2);font-size:.95rem">' + esc(badge.perk) + '</p>' +
      '<p class="tiny" style="color:var(--ink-3)">' + esc(badge.how) + '</p>' +
      '<button class="btn primary wide" data-close>Collect</button>');
    if (rest && rest.length) {
      var b = document.querySelector('[data-close]');
      b.addEventListener('click', function () { setTimeout(function () { celebrate(rest[0], rest.slice(1)); }, 260); });
    }
  }

  /* =====================================================================
     STANDBY (spaced review)
     ===================================================================== */
  function paintReview() {
    var due = P.dueReview(S.p);
    var all = Object.keys(S.p.review).filter(function (id) { return E.Bank.item(id); });
    var html = '<div class="sect-h"><div><h2>Standby list</h2>' +
      '<p style="color:var(--ink-2);font-size:.92rem;margin-top:4px">Questions you got wrong come back here. Get one right twice in a row and it leaves for good.</p></div></div>';

    if (!all.length) {
      html += '<div class="card empty">Nothing on standby. Every question you have answered wrong has been cleared.</div>';
    } else {
      html += '<div class="card" style="padding:var(--pad);display:flex;flex-direction:column;gap:12px">' +
        '<div style="display:flex;gap:14px;flex-wrap:wrap">' +
        '<span class="pill' + (due.length ? ' bad' : ' good') + '">' + due.length + ' due now</span>' +
        '<span class="pill">' + all.length + ' on the list</span>' +
        '<span class="pill gold">' + (S.p.reclaimed || 0) + ' reclaimed</span></div>';
      var tagCount = {};
      all.forEach(function (id) { var t = E.Bank.item(id).tag; tagCount[t] = (tagCount[t] || 0) + 1; });
      html += '<div style="display:flex;flex-direction:column;gap:7px">' + Object.keys(tagCount).sort(function (a, b) { return tagCount[b] - tagCount[a]; })
        .map(function (t) {
          return '<div style="display:flex;justify-content:space-between;gap:12px;font-size:.9rem">' +
            '<span>' + esc((C.REMEDIATION[t] || {}).name || t) + '</span>' +
            '<span class="num" style="color:var(--ink-3);font-family:var(--f-mono);font-size:.82rem">' + tagCount[t] + '</span></div>';
        }).join('') + '</div>';
      html += due.length
        ? '<button class="btn primary wide" id="rv-go">Clear ' + Math.min(due.length, 12) + ' now</button>'
        : '<p class="tiny">Nothing is due yet. Items come back after a session or two — that gap is what makes them stick.</p>';
      html += '</div>';
    }
    $('#view-review').innerHTML = html;
    var g = $('#rv-go');
    if (g) g.addEventListener('click', function () {
      startRun('review', E.shuffle(due).slice(0, 12).map(E.Bank.item), { title: 'Standby' });
    });
  }

  /* =====================================================================
     PASSPORT
     ===================================================================== */
  function paintPassport() {
    var p = S.p, cleared = P.stageClearedCount(p);
    var html = '<div class="sect-h"><div><h2>Passport</h2>' +
      '<p style="color:var(--ink-2);font-size:.92rem;margin-top:4px">One stamp for every gate cleared, and the perks you have earned along the way.</p></div>' +
      '<span class="pill gold">' + p.badges.length + ' of ' + C.BADGES.length + ' awards</span></div>';

    html += '<div class="card" style="padding:var(--pad);margin-bottom:16px"><p class="kicker" style="margin-bottom:12px">Gate stamps</p><div class="stamps">';
    C.STAGES.forEach(function (st) {
      var got = (p.challenges[st.challenge.id] || {}).best >= E.PASS_CHALLENGE;
      html += '<div class="stamp' + (got ? ' got' : '') + '"><b>' + esc(st.name) + '</b><span>' + esc(st.gate) + '</span>' +
        (got ? '<span>✓ cleared</span>' : '') + '</div>';
    });
    html += '</div></div>';

    html += '<div class="card" style="padding:var(--pad);margin-bottom:16px">' +
      '<p class="kicker" style="margin-bottom:6px">Rank</p>' +
      '<h3 style="font-size:1.3rem">Level ' + cleared + ' · ' + esc(P.rank(p).name) + '</h3>' +
      '<p style="color:var(--ink-2);font-size:.93rem;margin-top:4px">' + esc(P.rank(p).note) + '</p>' +
      '<div style="margin-top:12px"><div class="bar gold"><span style="width:' + (cleared / 8 * 100) + '%"></span></div></div></div>';

    html += '<p class="kicker" style="margin-bottom:10px">Awards</p><div class="badges">';
    C.BADGES.forEach(function (b) {
      var got = p.badges.indexOf(b.id) >= 0;
      html += '<div class="badge ' + (got ? 'got' : 'locked') + '">' +
        '<span class="badge-i">' + (got ? '★' : '·') + '</span>' +
        '<span><span class="badge-n">' + esc(b.name) + '</span>' +
        '<span class="badge-p">' + esc(b.perk) + '</span>' +
        '<span class="badge-h">' + esc(b.how) + '</span></span></div>';
    });
    html += '</div>';
    $('#view-pass').innerHTML = html;
  }

  /* =====================================================================
     LEVEL CHECK
     ===================================================================== */
  function paintTest() {
    var a = S.p.assignment;
    var html = '<div class="sect-h"><div><h2>Level check</h2>' +
      '<p style="color:var(--ink-2);font-size:.92rem;margin-top:4px">A short paper your teacher sets, using questions that are not in the roadmap. It confirms the level you have reached.</p></div></div>';
    if (!a) {
      html += '<div class="card empty">No level check has been set for you yet. Your teacher will assign one when you have cleared a few gates.</div>';
    } else if (a.done) {
      html += '<div class="card" style="padding:var(--pad);display:flex;flex-direction:column;gap:10px">' +
        '<span class="pill good">Submitted</span>' +
        '<h3 style="font-size:1.25rem">You scored ' + pct(a.score) + '%</h3>' +
        '<p style="color:var(--ink-2);font-size:.93rem">Set at level ' + a.level + ' · ' + a.itemIds.length + ' questions · ' +
        esc(new Date(a.completedAt).toLocaleDateString()) + '</p>' +
        '<p class="tiny">Your teacher can see the full breakdown.</p></div>';
    } else {
      html += '<div class="card" style="padding:var(--pad);display:flex;flex-direction:column;gap:12px">' +
        '<span class="pill on">Ready to take</span>' +
        '<h3 style="font-size:1.25rem">' + a.itemIds.length + ' questions, set at level ' + a.level + '</h3>' +
        '<p style="color:var(--ink-2);font-size:.93rem">No hints on this one, and you only get one attempt. Take it when you have twenty quiet minutes.</p>' +
        '<button class="btn primary wide" id="t-go">Start the level check</button></div>';
    }
    $('#view-test').innerHTML = html;
    var g = $('#t-go');
    if (g) g.addEventListener('click', function () {
      var items = a.itemIds.map(E.Bank.item).filter(Boolean);
      startRun('test', items, { title: 'Level check' });
    });
  }

  /* =====================================================================
     SETTINGS
     ===================================================================== */
  function paintSettings() {
    $('#view-settings').innerHTML = '<div class="sect-h"><h2>Settings</h2></div>' +
      '<div class="card settings">' +
        '<div class="field"><label>Signed in as</label>' +
        '<p style="font-weight:600">' + esc(S.p.displayName) + ' <span style="color:var(--ink-3);font-weight:400">(' + esc(S.p.studentId) + ')</span></p></div>' +
        '<div class="row"><div class="field"><label for="s-url">Class server address</label>' +
        '<input type="text" id="s-url" placeholder="https://script.google.com/macros/s/…/exec" value="' + esc(api.url || '') + '" spellcheck="false"></div>' +
        '<button class="btn" id="s-save">Save</button></div>' +
        '<p class="tiny">Your teacher will give you this address. Without it the app still works, but your progress stays on this device. ' +
        'Current mode: <strong>' + (api.mode === 'cloud' ? 'connected to the class server' : 'demo, saved in this browser') + '</strong>.' +
        (api.lastError ? '<br>Last error: ' + esc(api.lastError) : '') + '</p>' +
        '<div class="field"><label>Reading level</label>' +
        '<button class="btn sm" id="s-simple" style="align-self:flex-start">' +
        (S.simple ? 'Theory is in simple English — switch back' : 'Use simpler English in the theory') + '</button></div>' +
      '</div>';
    $('#s-save').addEventListener('click', function () {
      api.setUrl($('#s-url').value);
      api.ping().then(function (r) {
        paintMode();
        toast(r.ok ? 'Connected to the class server.' : 'Could not reach that address — still in demo mode.');
        paintSettings();
      });
    });
    $('#s-simple').addEventListener('click', function () { S.simple = !S.simple; paintSettings(); });
  }

  setMode('in');
})();
