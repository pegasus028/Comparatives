/* ===========================================================================
   DEPARTURE BOARD — teacher.js  (Control Tower)
   =========================================================================== */
(function () {
  'use strict';
  var C = window.CONTENT, E = window.Engine, P = E.Progress, api = window.API;
  var $ = function (s) { return document.querySelector(s); };
  var esc = E.esc;
  var T = { roster: [], sel: null, detail: null };

  function toast(m) {
    $('#toast-slot').innerHTML = '<div style="position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:60;background:var(--ink);color:var(--ground);padding:11px 18px;border-radius:99px;font-size:.9rem;font-weight:600;box-shadow:var(--shadow-l)">' + esc(m) + '</div>';
    clearTimeout(toast._t); toast._t = setTimeout(function () { $('#toast-slot').innerHTML = ''; }, 2600);
  }
  function pct(x) { return Math.round((x || 0) * 100); }
  function ago(iso) {
    if (!iso) return '—';
    var d = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (d <= 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 30) return d + 'd ago';
    return new Date(iso).toLocaleDateString();
  }
  function hhmm(sec) {
    if (!sec) return '—';
    var m = Math.floor(sec / 60), s = sec % 60;
    return m ? m + 'm ' + s + 's' : s + 's';
  }

  /* ------------------------------------------------------------- sign in */
  try { $('#url').value = api.url || ''; } catch (e) {}
  function enter() {
    var pin = $('#pin').value.trim();
    var url = $('#url').value.trim();
    if (url !== (api.url || '')) api.setUrl(url);
    api.teacherLogin(pin).then(function (r) {
      if (!r || !r.ok) {
        var m = $('#gate-msg'); m.classList.remove('hidden');
        m.textContent = (r && r.error) || 'Wrong PIN.';
        return;
      }
      $('#gate').classList.add('hidden');
      $('#app').classList.remove('hidden');
      paintMode();
      load();
      checkLink();
    });
  }
  $('#gate-go').addEventListener('click', enter);
  $('#pin').addEventListener('keydown', function (e) { if (e.key === 'Enter') enter(); });
  $('#t-out').addEventListener('click', function () { location.reload(); });
  $('#t-refresh').addEventListener('click', function () { load(); toast('Refreshed.'); });

  /* Confirm the class server is really answering, and say which Sheet it is.
     A silent fall-back to demo data is the one failure a teacher must not miss. */
  function checkLink() {
    if (!api.url) return;
    api.ping().then(function (r) {
      if (r.ok) {
        $('#top-sub').textContent = 'Connected · ' + (r.sheet || 'class sheet');
        toast('Connected to ' + (r.sheet || 'the class sheet') + '.');
      } else {
        $('#top-sub').textContent = 'Server not answering — showing local data';
        $('#modebar-slot').innerHTML = '<div class="wrap"><div class="modebar">' +
          '<span><b>Not connected</b> &nbsp;The class server did not answer, so this is local data only. ' +
          'Check the Apps Script deployment is set to <em>Execute as: Me</em> and <em>Access: Anyone</em>, ' +
          'and that you deployed a new version after your last edit.' +
          (r.error ? ' &nbsp;(' + esc(r.error) + ')' : '') + '</span></div></div>';
      }
    });
  }

  function paintMode() {
    $('#top-sub').textContent = api.mode === 'cloud' ? 'Connected to the class sheet' : 'Demo data, this browser only';
    $('#modebar-slot').innerHTML = api.mode === 'cloud' ? '' :
      '<div class="wrap"><div class="modebar"><span><b>Demo mode</b> &nbsp;Showing data saved in this browser. ' +
      'Add your Apps Script URL on the sign-in screen to read the real class sheet.</span></div></div>';
  }

  /* ---------------------------------------------------------------- load */
  function load() {
    api.roster().then(function (r) {
      T.roster = (r && r.students) || [];
      paintStats(); paintRoster(); paintHeat();
      if (T.sel) openStudent(T.sel);
    });
  }

  function paintStats() {
    var n = T.roster.length;
    var active = T.roster.filter(function (s) {
      return s.progress && s.progress.lastActiveDate && E.daysBetween(s.progress.lastActiveDate, E.today()) <= 7;
    }).length;
    var ready = n ? Math.round(T.roster.reduce(function (a, s) { return a + P.readiness(s.progress || P.blank(s.id)); }, 0) / n) : 0;
    var acc = (function () {
      var seen = 0, cor = 0;
      T.roster.forEach(function (s) { var st = (s.progress || {}).stats; if (st) { seen += st.seen; cor += st.correct; } });
      return seen ? Math.round(100 * cor / seen) : 0;
    })();
    $('#stats').innerHTML =
      '<div class="stat"><b>' + n + '</b><span>Students</span></div>' +
      '<div class="stat"><b>' + active + '</b><span>Active this week</span></div>' +
      '<div class="stat"><b>' + ready + '%</b><span>Mean readiness</span></div>' +
      '<div class="stat"><b>' + acc + '%</b><span>Class accuracy</span></div>';
  }

  function paintRoster() {
    $('#roster-n').textContent = T.roster.length + ' enrolled';
    if (!T.roster.length) {
      $('#roster').innerHTML = '<tbody><tr><td><div class="empty">No students yet. They appear here as soon as they create an account.</div></td></tr></tbody>';
      return;
    }
    var rows = T.roster.map(function (s) {
      var p = s.progress || P.blank(s.id, s.name);
      var ready = P.readiness(p), lvl = P.stageClearedCount(p), acc = P.accuracy(p);
      var stale = p.lastActiveDate ? E.daysBetween(p.lastActiveDate, E.today()) : 999;
      var flag = '';
      if (!p.stats || p.stats.seen < 5) flag = '<span class="flag new">new</span>';
      else if (stale > 7) flag = '<span class="flag stall">stalled</span>';
      else if (lvl >= 6) flag = '<span class="flag fly">flying</span>';
      return { s: s, p: p, ready: ready, lvl: lvl, acc: acc, flag: flag, stale: stale };
    });
    rows.sort(function (a, b) { return b.ready - a.ready; });
    var html = '<thead><tr><th>Student</th><th>Level</th><th>Readiness</th><th>Accuracy</th><th>Items</th><th>Streak</th><th>Last seen</th><th></th></tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr class="r' + (T.sel === r.s.id ? ' sel' : '') + '" data-id="' + esc(r.s.id) + '">' +
        '<td><div class="who2"><b>' + esc(r.p.displayName || r.s.name) + '</b><span>' + esc(r.s.id) + '</span></div></td>' +
        '<td>' + r.lvl + ' · ' + esc(C.RANKS[r.lvl].name) + '</td>' +
        '<td><span class="mini"><i style="width:' + r.ready + '%"></i></span> <span class="num" style="font-family:var(--f-mono);font-size:.78rem">' + r.ready + '%</span></td>' +
        '<td class="num">' + r.acc + '%</td>' +
        '<td class="num">' + ((r.p.stats || {}).seen || 0) + '</td>' +
        '<td class="num">' + (r.p.streak || 0) + '</td>' +
        '<td>' + esc(ago(r.p.lastActiveDate ? r.p.lastActiveDate + 'T12:00:00' : null)) + '</td>' +
        '<td>' + r.flag + '</td></tr>';
    });
    $('#roster').innerHTML = html + '</tbody>';
    $('#roster').querySelectorAll('tr.r').forEach(function (tr) {
      tr.addEventListener('click', function () { T.sel = tr.dataset.id; paintRoster(); openStudent(tr.dataset.id); });
    });
  }

  /* Class-wide error heat: which tags are costing the most marks overall */
  function paintHeat() {
    var agg = {};
    T.roster.forEach(function (s) {
      var by = ((s.progress || {}).stats || {}).byTag || {};
      Object.keys(by).forEach(function (t) {
        var a = agg[t] || (agg[t] = { a: 0, c: 0 });
        a.a += by[t].a; a.c += by[t].c;
      });
    });
    var rows = Object.keys(agg).map(function (t) {
      var x = agg[t];
      return { tag: t, attempts: x.a, rate: x.a ? 1 - x.c / x.a : 0, name: (C.REMEDIATION[t] || {}).name || t };
    }).filter(function (r) { return r.attempts >= 3; });
    rows.sort(function (a, b) { return b.rate - a.rate; });
    rows = rows.slice(0, 8);
    if (!rows.length) { $('#heat').innerHTML = '<p class="tiny">Not enough answers yet to show a pattern.</p>'; return; }
    $('#heat').innerHTML = rows.map(function (r) {
      return '<div class="heat-row"><span>' + esc(r.name.split(' — ')[0]) + '</span>' +
        '<span class="heat-bar"><i style="width:' + Math.round(r.rate * 100) + '%"></i></span>' +
        '<span class="heat-n">' + Math.round(r.rate * 100) + '%</span></div>';
    }).join('') + '<p class="tiny" style="margin-top:8px">Error rate across the whole class, tags with at least three attempts. The top row is the best candidate for a whole-class lesson.</p>';
  }

  /* ------------------------------------------------------------- student */
  function openStudent(id) {
    api.detail(id).then(function (d) {
      if (!d || !d.ok) { $('#detail').innerHTML = '<div class="empty">Could not load that student.</div>'; return; }
      T.detail = d;
      var p = d.progress || P.blank(id);
      var lvl = P.stageClearedCount(p);
      var weak = P.weakTags(p, 4), strong = P.strongTags(p, 3);
      var attempts = (d.attempts || []).slice().reverse();
      var wrong = attempts.filter(function (a) { return !a.correct; });
      var sessions = (d.sessions || []).slice().reverse();

      var h = '<div class="panel-h"><div><h2>' + esc(p.displayName || id) + '</h2>' +
        '<span class="kicker">' + esc(id) + ' · level ' + lvl + ' · ' + esc(C.RANKS[lvl].name) + ' · readiness ' + P.readiness(p) + '%</span></div>' +
        '<span class="pill' + (P.accuracy(p) >= 80 ? ' good' : P.accuracy(p) >= 60 ? '' : ' bad') + '">' + P.accuracy(p) + '% accurate</span></div>';

      /* ---- progress strip ---- */
      h += '<div style="display:flex;gap:5px;margin-bottom:14px;flex-wrap:wrap">';
      C.STAGES.forEach(function (st) {
        var ch = p.challenges[st.challenge.id];
        var done = ch && ch.best >= E.PASS_CHALLENGE;
        var started = st.lessons.some(function (l) { return p.lessons[l.id]; });
        var col = done ? 'var(--ok)' : started ? 'var(--accent)' : 'var(--surface-3)';
        h += '<span title="' + esc(st.name) + '" style="flex:1;min-width:26px;height:26px;border-radius:var(--r-s);background:' + col +
          ';display:grid;place-items:center;font-family:var(--f-mono);font-size:10px;font-weight:600;color:' +
          (done || started ? 'var(--accent-ink)' : 'var(--ink-3)') + '">' + st.n + '</span>';
      });
      h += '</div>';

      /* ---- teaching report ---- */
      h += '<details class="disc" open><summary>Teaching focus for this student<span class="count">' + weak.length + ' areas</span></summary><div class="disc-body">';
      if (!weak.length) {
        h += '<p class="tiny" style="padding-top:10px">No error pattern yet. Once this student has answered twenty or so questions, the weak areas appear here with reteach notes and activities.</p>';
      } else {
        h += '<p class="tiny" style="padding:10px 0 14px">Ranked by how much trouble each is actually causing — error rate weighted by how often it has come up, so one unlucky miss does not outrank a pattern of six.</p>';
        weak.forEach(function (w, i) {
          var info = w.info;
          h += '<div class="rep-block">' +
            '<div class="rep-h"><h4>' + (i + 1) + '. ' + esc(info.name || w.tag) + '</h4>' +
            '<span class="rep-rate">' + w.wrong + ' wrong of ' + w.attempts + ' · ' + Math.round(w.rate * 100) + '% error</span></div>' +
            '<p class="rep-p">' + esc(info.principle || '') + '</p>' +
            (info.reteach ? '<div class="rep-teach"><b>Say this at the board</b>' + esc(info.reteach) + '</div>' : '') +
            (info.activities ? '<ul class="rep-acts">' + info.activities.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' : '') +
            '</div>';
        });
      }
      if (strong.length) {
        h += '<div class="rep-block good"><div class="rep-h"><h4>Secure</h4></div>' +
          '<p class="rep-p">' + strong.map(function (s) { return esc((s.info.name || s.tag).split(' — ')[0]) + ' (' + Math.round(s.rate * 100) + '%)'; }).join(' · ') +
          '</p><p class="tiny">Safe to build on. Use these as the known half of a contrast when introducing something new.</p></div>';
      }
      h += '</div></details>';

      /* ---- level check ---- */
      var a = p.assignment;
      h += '<details class="disc"><summary>Level check<span class="count">' +
        (a ? (a.done ? pct(a.score) + '% submitted' : 'assigned, not taken') : 'none set') + '</span></summary><div class="disc-body">' +
        '<p class="tiny" style="padding:10px 0 12px">Builds a paper from the held-out bank — questions that never appear in the roadmap — so the result is independent of what this student has practised. Weighted to their recorded level, with one rung below and one above so it can disconfirm as well as confirm.</p>' +
        '<div style="display:flex;gap:9px;align-items:flex-end;flex-wrap:wrap">' +
        '<div class="field" style="max-width:130px"><label for="lv">Level</label>' +
        '<select id="lv">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) {
          return '<option value="' + n + '"' + (n === Math.max(1, lvl) ? ' selected' : '') + '>' + n + ' · ' + esc(C.RANKS[n].name) + '</option>';
        }).join('') + '</select></div>' +
        '<div class="field" style="max-width:110px"><label for="nq">Questions</label>' +
        '<select id="nq"><option>8</option><option selected>10</option><option>12</option><option>14</option></select></div>' +
        '<button class="btn primary" id="assign">Assign to student</button>' +
        '<button class="btn" id="printtest">Printable + answer key</button></div>';
      if (a && a.done) {
        h += '<div style="margin-top:14px" class="rep-teach"><b>Result</b>Scored <strong>' + pct(a.score) + '%</strong> on a level-' + a.level +
          ' paper of ' + a.itemIds.length + ' questions, submitted ' + esc(new Date(a.completedAt).toLocaleString()) + '. ' +
          (a.score >= 0.7 ? 'This confirms the roadmap level.' : 'This is below the roadmap level — the roadmap score may be inflated by retries. Reteach the areas above before moving on.') + '</div>';
      }
      h += '</div></details>';

      /* ---- sessions ---- */
      h += '<details class="disc"><summary>Sessions<span class="count">' + sessions.length + '</span></summary><div class="disc-body"><div class="logscroll"><table class="logtable">' +
        '<thead><tr><th>In</th><th>Out</th><th>Duration</th><th>Items</th><th>Correct</th></tr></thead><tbody>';
      if (!sessions.length) h += '<tr><td colspan="5" class="g">No sessions recorded yet.</td></tr>';
      sessions.slice(0, 60).forEach(function (s) {
        h += '<tr><td>' + esc(new Date(s.loginTs).toLocaleString()) + '</td>' +
          '<td class="g">' + (s.logoutTs ? esc(new Date(s.logoutTs).toLocaleTimeString()) : 'open') + '</td>' +
          '<td>' + esc(hhmm(s.durationSec)) + '</td><td>' + (s.items || 0) + '</td><td>' + (s.correct || 0) + '</td></tr>';
      });
      h += '</tbody></table></div></div></details>';

      /* ---- wrong answers ---- */
      h += '<details class="disc"><summary>Incorrect answers<span class="count">' + wrong.length + '</span></summary><div class="disc-body"><div class="logscroll"><table class="logtable">' +
        '<thead><tr><th>When</th><th>Item</th><th>Their answer</th><th>Correct answer</th></tr></thead><tbody>';
      if (!wrong.length) h += '<tr><td colspan="4" class="g">Nothing wrong on record.</td></tr>';
      wrong.slice(0, 200).forEach(function (x) {
        h += '<tr class="bad"><td class="g">' + esc(new Date(x.ts).toLocaleDateString()) + '</td>' +
          '<td>' + esc(x.itemId) + '<br><span class="g">' + esc(((C.REMEDIATION[x.tag] || {}).name || x.tag).split(' — ')[0]) + '</span></td>' +
          '<td>' + esc(String(x.given || '').slice(0, 70)) + '</td>' +
          '<td class="g">' + esc(String(x.expected || '').slice(0, 70)) + '</td></tr>';
      });
      h += '</tbody></table></div></div></details>';

      /* ---- full log ---- */
      h += '<details class="disc"><summary>Full answer log<span class="count">' + attempts.length + '</span></summary><div class="disc-body"><div class="logscroll"><table class="logtable">' +
        '<thead><tr><th>When</th><th>Item</th><th>Type</th><th>Mode</th><th>Time</th><th>Hint</th><th>✓</th></tr></thead><tbody>';
      attempts.slice(0, 400).forEach(function (x) {
        h += '<tr' + (x.correct ? '' : ' class="bad"') + '><td class="g">' + esc(new Date(x.ts).toLocaleString()) + '</td>' +
          '<td>' + esc(x.itemId) + '</td><td class="g">' + esc(x.type) + '</td><td class="g">' + esc(x.mode || '') + '</td>' +
          '<td>' + (x.ms ? Math.round(x.ms / 1000) + 's' : '—') + '</td><td>' + (x.hinted ? 'yes' : '') + '</td>' +
          '<td>' + (x.correct ? '✓' : '✕') + '</td></tr>';
      });
      if (!attempts.length) h += '<tr><td colspan="7" class="g">No answers recorded yet.</td></tr>';
      h += '</tbody></table></div></div></details>';

      $('#detail').innerHTML = h;

      $('#assign').addEventListener('click', function () {
        var level = +$('#lv').value, n = +$('#nq').value;
        var paper = E.Bank.verifyPaper(level, n);
        var payload = {
          assignmentId: 'A' + Date.now().toString(36), level: level,
          itemIds: paper.map(function (i) { return i.id; }),
          createdAt: new Date().toISOString(), done: false, score: 0, completedAt: ''
        };
        api.assign(id, payload).then(function (r) {
          if (r && r.ok) { toast('Level check assigned — ' + n + ' questions at level ' + level + '.'); load(); }
          else toast('Could not assign.');
        });
      });
      $('#printtest').addEventListener('click', function () {
        printPaper(p.displayName || id, +$('#lv').value, +$('#nq').value);
      });
    });
  }

  /* ------------------------------------------------------- printed paper */
  function printPaper(name, level, n) {
    var paper = E.Bank.verifyPaper(level, n);
    var h = '<h2>Comparatives &amp; Superlatives — Level Check</h2>' +
      '<p class="meta">' + esc(name) + ' &nbsp;·&nbsp; Level ' + level + ' (' + esc(C.RANKS[level].name) + ') &nbsp;·&nbsp; ' +
      paper.length + ' questions &nbsp;·&nbsp; ' + new Date().toLocaleDateString() + ' &nbsp;·&nbsp; Name: ________________</p>';

    paper.forEach(function (it, i) {
      h += '<div class="pq"><b>' + (i + 1) + '. ' + esc(stripTags(it.stem || '')) + '</b>';
      if (it.given) h += '<div class="ctx">Given: ' + esc(stripTags(it.given)) + '</div>';
      if (it.lines) h += '<div class="ctx">' + it.lines.map(function (l) { return esc(l.who) + ': ' + esc(String(l.text).replace(/___/g, '__________')); }).join('<br>') + '</div>';
      if (it.table) {
        h += '<table><tr>' + it.table.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>' +
          it.table.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
      }
      if (it.type === 'spot') h += '<div class="ctx">' + it.words.map(function (w, j) { return esc(w) + '<sub>' + (j + 1) + '</sub>'; }).join(' ') + '</div><div class="ctx">Write the number of the wrong word, and correct it.</div>';
      if (it.type === 'build') h += '<div class="ctx">Words: ' + it.tiles.map(esc).join(' / ') + '</div><div class="ctx">_______________________________________________</div>';
      if (it.type === 'order') h += '<ol>' + it.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol><div class="ctx">Write the letters in the correct order: ______</div>';
      if (it.type === 'pick') h += '<ol>' + it.items.map(function (x) { return '<li>' + esc(x.name) + ' — ' + esc(x.price) + (x.note ? ' (' + esc(x.note) + ')' : '') + '</li>'; }).join('') + '</ol>';
      if (it.options) h += '<ol type="a">' + it.options.map(function (o) { return '<li>' + esc(stripTags(o)) + '</li>'; }).join('') + '</ol>';
      if (it.type === 'judge') h += '<ol type="a"><li>True</li><li>False</li><li>Can\'t tell</li></ol>';
      h += '</div>';
    });

    h += '<div class="key"><h2>Answer key &amp; diagnosis</h2><p class="meta">' + esc(name) + ' · level ' + level + '</p>';
    paper.forEach(function (it, i) {
      var ans;
      if (it.type === 'spot') ans = 'word ' + (it.answer + 1) + ' (' + it.words[it.answer] + ') → ' + it.fix;
      else if (it.type === 'build') ans = it.solution;
      else if (it.type === 'order') ans = it.items.join(' → ');
      else if (it.type === 'pick') ans = it.items[it.answer].name;
      else if (it.type === 'judge') ans = ['True', 'False', "Can't tell"][it.answer];
      else ans = 'abcd'[it.answer] + ') ' + stripTags(it.options[it.answer]);
      h += '<div class="pq"><b>' + (i + 1) + '. ' + esc(ans) + '</b>' +
        '<div class="ctx">' + esc(stripTags(it.why)) + '</div>' +
        '<div class="ctx">Tag: ' + esc((C.REMEDIATION[it.tag] || {}).name || it.tag) + ' · ' + esc(it.level) + '</div></div>';
    });
    h += '</div>';
    $('#printable').innerHTML = h;
    window.print();
  }
  function stripTags(s) { return String(s || '').replace(/<[^>]+>/g, ''); }

  /* ------------------------------------------------------------ CSV out */
  $('#t-csv').addEventListener('click', function () {
    var rows = [['student_id', 'name', 'level', 'rank', 'readiness_pct', 'accuracy_pct', 'items_seen', 'items_correct', 'streak', 'longest_streak', 'xp', 'badges', 'last_active', 'lessons_cleared', 'gates_cleared', 'standby_items', 'top_weakness']];
    T.roster.forEach(function (s) {
      var p = s.progress || P.blank(s.id, s.name);
      var lvl = P.stageClearedCount(p);
      var w = P.weakTags(p, 1)[0];
      rows.push([
        s.id, p.displayName || s.name, lvl, C.RANKS[lvl].name, P.readiness(p), P.accuracy(p),
        (p.stats || {}).seen || 0, (p.stats || {}).correct || 0, p.streak || 0, p.longestStreak || 0, p.xp || 0,
        (p.badges || []).length, p.lastActiveDate || '',
        Object.keys(p.lessons || {}).filter(function (k) { return p.lessons[k].best >= E.PASS_LESSON; }).length,
        lvl, Object.keys(p.review || {}).length,
        w ? (w.info.name || w.tag) : ''
      ]);
    });
    var csv = rows.map(function (r) {
      return r.map(function (c) {
        var v = String(c == null ? '' : c);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(',');
    }).join('\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'departure-board-' + E.today() + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    toast('CSV downloaded.');
  });
})();
