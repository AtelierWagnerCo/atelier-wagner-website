(() => {
  const data = window.BatPhoneData;
  const STORAGE_KEY = "aw-batphone-checkins";
  const MUTE_KEY = "aw-batphone-checkin-mute-day";
  const THEME_KEY = "aw-batphone-theme";
  const CHECKIN_COOLDOWN_MS = 40000;

  const money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const pct = (n) => `${Math.round(n * 100)}%`;

  const state = {
    listFilter: "all",
    stageFilter: null,
    selectedId: null,
    present: false,
    lastCheckinAt: 0,
    checkinOpen: false,
    popupOpen: false,
  };

  const els = {};

  function loadCheckins() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveCheckins(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function mutedToday() {
    const day = new Date().toISOString().slice(0, 10);
    return localStorage.getItem(MUTE_KEY) === day;
  }

  function muteToday() {
    localStorage.setItem(MUTE_KEY, new Date().toISOString().slice(0, 10));
  }

  function initTheme() {
    /* Brand default is midnight; honor an explicit saved choice only. */
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved === "light" || saved === "dark" ? saved : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    return theme;
  }

  function toggleTheme() {
    const next =
      document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    els.themeBtn.setAttribute("aria-pressed", String(next === "light"));
    els.themeBtn.textContent = next === "light" ? "Dark mode" : "Light mode";
    maybeCheckin("theme", "Did you find what you were looking for?");
  }

  function setPresent(on) {
    state.present = on;
    document.body.classList.toggle("is-present", on);
    els.presentBtn.setAttribute("aria-pressed", String(on));
    els.presentBtn.innerHTML = on
      ? `Exit present <span class="kbd">P</span>`
      : `Present <span class="kbd">P</span>`;
    if (on && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (!on && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function batNeedsAttention() {
    return data.summary.approvalsOverdue > 0 || data.projects.some((p) => p.attention);
  }

  function renderBatStatus() {
    const alert = batNeedsAttention();
    els.batStatus.classList.toggle("is-quiet", !alert);
    els.batStatus.classList.toggle("is-alert", alert);
    els.batStatus.setAttribute("aria-live", "polite");
    if (alert) {
      els.batLabel.textContent = "Bat Phone";
      els.batMessage.textContent = `${data.summary.approvalsOverdue} client approval${
        data.summary.approvalsOverdue === 1 ? "" : "s"
      } overdue — agents flagged the floor.`;
    } else {
      els.batLabel.textContent = "Bat Phone";
      els.batMessage.textContent = "✓ Bat Phone is quiet. The agents have the rest.";
    }
  }

  function renderSummary() {
    const s = data.summary;
    els.summary.innerHTML = `
      <article class="tile">
        <p class="tile-label">Work in progress</p>
        <p class="tile-value">${s.workInProgress}</p>
      </article>
      <article class="tile">
        <p class="tile-label">Active projects</p>
        <p class="tile-value">${s.activeProjects}</p>
      </article>
      <article class="tile is-ember" aria-label="Client approvals overdue">
        <p class="tile-label">Client approvals overdue</p>
        <p class="tile-value">${s.approvalsOverdue}</p>
        <p class="tile-note helper">Needs a human decision</p>
      </article>
      <article class="tile">
        <p class="tile-label">Avg brief → delivery</p>
        <p class="tile-value">${s.avgBriefToDeliveryDays}<span style="font-size:0.55em">d</span></p>
      </article>
      <article class="tile">
        <p class="tile-label">Hours saved by agents</p>
        <p class="tile-value">${s.hoursSavedByAgents}</p>
      </article>
    `;
  }

  function renderPipeline() {
    const max = Math.max(...data.pipeline.map((p) => p.count), 1);
    els.pipeline.innerHTML = data.pipeline
      .map((stage) => {
        const pressed = state.stageFilter === stage.id;
        const fill = `${Math.max(12, (stage.count / max) * 100)}%`;
        return `
          <button type="button" class="stage" data-stage="${stage.id}"
            aria-pressed="${pressed}" aria-label="${stage.label}: ${stage.count} projects, ${money(stage.value)}">
            <span class="stage-label">${stage.label}</span>
            <span class="stage-meta">
              <span class="stage-count">${stage.count}</span>
              <span class="stage-value">${money(stage.value)}</span>
            </span>
            <span class="stage-bar" aria-hidden="true"><span style="--fill:${fill}"></span></span>
          </button>
        `;
      })
      .join("");

    els.pipeline.querySelectorAll(".stage").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.stage;
        state.stageFilter = state.stageFilter === id ? null : id;
        renderPipeline();
        renderProjects();
        maybeCheckin("pipeline", "Did you find what you were looking for?");
      });
    });
  }

  function filteredProjects() {
    return data.projects.filter((p) => {
      if (state.stageFilter && p.stage !== state.stageFilter) return false;
      if (state.listFilter === "attention") return p.attention;
      if (state.listFilter === "brand") return p.category === "brand";
      if (state.listFilter === "digital") return p.category === "digital";
      return true;
    });
  }

  function ensureSelection(list) {
    if (!list.length) {
      state.selectedId = null;
      return;
    }
    if (!list.some((p) => p.id === state.selectedId)) {
      state.selectedId = list[0].id;
    }
  }

  function renderFilters() {
    const filters = [
      { id: "all", label: "All" },
      { id: "attention", label: "Needs attention" },
      { id: "brand", label: "Brand" },
      { id: "digital", label: "Digital" },
    ];
    els.filters.innerHTML = filters
      .map(
        (f) => `
        <button type="button" class="filter-btn" data-filter="${f.id}"
          aria-pressed="${state.listFilter === f.id}">${f.label}</button>
      `
      )
      .join("");

    els.filters.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.listFilter = btn.dataset.filter;
        renderFilters();
        renderProjects();
        maybeCheckin("filter", "Did you find what you were looking for?");
      });
    });
  }

  function renderProjects() {
    const list = filteredProjects();
    ensureSelection(list);

    if (!list.length) {
      els.projectList.innerHTML = `<li><p class="helper">No projects match this filter.</p></li>`;
      els.brief.innerHTML = `<p class="helper">Select a project to read the brief.</p>`;
      return;
    }

    els.projectList.innerHTML = list
      .map((p) => {
        const pressed = p.id === state.selectedId;
        return `
          <li>
            <button type="button" class="project-row" data-id="${p.id}" data-status="${p.status}"
              aria-pressed="${pressed}" aria-label="${p.name}, ${p.client}, status ${p.status}">
              <span class="status-dot" aria-hidden="true"></span>
              <span>
                <p class="project-name">${p.name}</p>
                <p class="project-meta">${p.client} · ${p.stage.replace("-", " ")}</p>
              </span>
              <span class="project-meta">${money(p.value)}</span>
            </button>
          </li>
        `;
      })
      .join("");

    els.projectList.querySelectorAll(".project-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedId = btn.dataset.id;
        renderProjects();
      });
    });

    const project = list.find((p) => p.id === state.selectedId);
    if (project) renderBrief(project);
  }

  function renderBrief(p) {
    const totalHours = p.hours.studio + p.hours.agents || 1;
    const studioPct = (p.hours.studio / totalHours) * 100;
    const agentsPct = (p.hours.agents / totalHours) * 100;

    els.brief.innerHTML = `
      <header>
        <p class="section-kicker">Project brief</p>
        <h3 class="brief-title">${p.name}</h3>
      </header>
      <dl class="brief-grid">
        <div class="stat"><dt>Value</dt><dd>${money(p.value)}</dd></div>
        <div class="stat"><dt>Budget used</dt><dd>${pct(p.budgetUsed)}</dd></div>
        <div class="stat"><dt>Lead designer</dt><dd style="font-family:var(--font-sans);font-size:1rem">${p.lead}</dd></div>
        <div class="stat"><dt>Category</dt><dd style="font-family:var(--font-sans);font-size:1rem;text-transform:capitalize">${p.category}</dd></div>
        <div class="stat wide"><dt>Scope</dt><dd>${p.scope}</dd></div>
      </dl>

      <div>
        <p class="section-kicker" style="margin-bottom:0.5rem">Deliverables</p>
        <ul class="checklist">
          ${p.deliverables
            .map(
              (d) => `
            <li data-done="${d.done}">
              <span class="check" aria-hidden="true"></span>
              <span>${d.label}${d.done ? "" : " — open"}</span>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>

      <div>
        <p class="section-kicker" style="margin-bottom:0.5rem">Hours by phase</p>
        <div class="hours-bars" aria-label="Studio versus agent hours">
          <div class="hours-row">
            <span>Studio</span>
            <div class="hours-track"><span class="studio" style="--studio:${studioPct}%"></span></div>
            <span class="project-meta">${p.hours.studio}h</span>
          </div>
          <div class="hours-row">
            <span>Agents</span>
            <div class="hours-track"><span class="agents" style="--agents:${agentsPct}%"></span></div>
            <span class="project-meta">${p.hours.agents}h</span>
          </div>
        </div>
      </div>

      <div class="draft">
        <p class="section-kicker">Agent draft</p>
        <p id="agent-draft-text">${p.agentDraft}</p>
        <div class="draft-actions">
          <button type="button" class="primary-btn" data-action="approve">Approve</button>
          <button type="button" class="ghost-btn" data-action="edit">Edit</button>
        </div>
      </div>
    `;

    els.brief.querySelector('[data-action="approve"]').addEventListener("click", () => {
      maybeCheckin("approve", "How easy was that approval?", true);
    });
    els.brief.querySelector('[data-action="edit"]').addEventListener("click", () => {
      const text = els.brief.querySelector("#agent-draft-text");
      const next = window.prompt("Edit agent draft", text.textContent);
      if (next != null && next.trim()) {
        text.textContent = next.trim();
        maybeCheckin("edit", "Was the draft ready to send as is?", true);
      }
    });
  }

  function renderAgentLog() {
    els.agentLog.innerHTML = data.agentLog
      .map(
        (row) => `
      <li>
        <time datetime="2026-10-30T${row.time}:00">${row.time}</time>
        <span>${row.text}</span>
      </li>
    `
      )
      .join("");
  }

  function renderChart() {
    const max = Math.max(...data.revisions.map((r) => r.count), 1);
    const liveIndex = data.agentsLiveWeekIndex;
    const markerPct = ((liveIndex + 0.5) / data.revisions.length) * 100;

    els.chart.innerHTML = `
      <div class="chart-marker" style="--marker:${markerPct}%" aria-hidden="true">
        <span>Agents live</span>
      </div>
      ${data.revisions
        .map((r, i) => {
          const h = `${Math.max(8, (r.count / max) * 100)}%`;
          const live = i >= liveIndex;
          return `
            <div class="chart-bar${live ? " is-live" : ""}" title="${r.week}: ${r.count} revisions">
              <div class="bar" style="--h:${h}"></div>
              <div class="wk">${r.week}</div>
            </div>
          `;
        })
        .join("")}
    `;
    els.chart.setAttribute(
      "aria-label",
      `Revisions shipped over eight weeks. Agents went live at ${data.revisions[liveIndex].week}.`
    );
  }

  function summarizeCheckins(list) {
    if (!list.length) {
      return {
        easyPct: null,
        topSlowdowns: [],
        notes: [],
        total: 0,
      };
    }
    const easy = list.filter((c) => c.answer === "Easy" || c.answer === "Yes").length;
    const slowMap = {};
    list.forEach((c) => {
      (c.slowdowns || []).forEach((s) => {
        slowMap[s] = (slowMap[s] || 0) + 1;
      });
    });
    const topSlowdowns = Object.entries(slowMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => ({ label, count }));
    const notes = list
      .filter((c) => c.note)
      .slice(-5)
      .reverse();
    return {
      easyPct: Math.round((easy / list.length) * 100),
      topSlowdowns,
      notes,
      total: list.length,
    };
  }

  function renderCheckinSummary() {
    const summary = summarizeCheckins(loadCheckins());
    const easyText = summary.total ? `${summary.easyPct}%` : "—";
    els.checkinSummary.innerHTML = `
      <div class="checkin-stats">
        <div>
          <p class="num">${easyText}</p>
          <p class="lbl">Felt easy</p>
        </div>
        <div>
          <p class="num">${summary.total}</p>
          <p class="lbl">Responses</p>
        </div>
        <div>
          <p class="num">${summary.topSlowdowns.length || "—"}</p>
          <p class="lbl">Top slowdowns</p>
        </div>
      </div>
      ${
        summary.topSlowdowns.length
          ? `<div>
              <p class="section-kicker" style="margin-bottom:0.4rem">Top slowdowns</p>
              <ul class="slowdowns">
                ${summary.topSlowdowns
                  .map((s) => `<li>${s.label} (${s.count})</li>`)
                  .join("")}
              </ul>
            </div>`
          : `<p class="helper">Slowdowns will appear after Okay or Clunky answers.</p>`
      }
      ${
        summary.notes.length
          ? `<div>
              <p class="section-kicker" style="margin-bottom:0.4rem">Recent notes</p>
              <ul class="notes-list">
                ${summary.notes.map((n) => `<li>${n.note}</li>`).join("")}
              </ul>
            </div>`
          : `<p class="helper">Notes from check-ins will collect here.</p>`
      }
    `;
  }

  /* ——— Quick check-ins ——— */
  const QUESTIONS = {
    approve: "How easy was that approval?",
    edit: "Was the draft ready to send as is?",
    filter: "Did you find what you were looking for?",
    pipeline: "Did you find what you were looking for?",
    theme: "Did you find what you were looking for?",
    slow: "What was your last move that slowed you down?",
  };

  const SLOWDOWN_OPTIONS = [
    "Waiting on a file",
    "Unclear next step",
    "Too many clicks",
    "Missing context",
    "Other",
  ];

  function canAskCheckin() {
    if (mutedToday()) return false;
    if (state.checkinOpen) return false;
    if (state.popupOpen) return false;
    if (Date.now() - state.lastCheckinAt < CHECKIN_COOLDOWN_MS) return false;
    return true;
  }

  function maybeCheckin(kind, question, forceKind) {
    if (!canAskCheckin()) return;
    const q = question || QUESTIONS[kind] || QUESTIONS.slow;
    openCheckin(forceKind || kind, q);
  }

  function openCheckin(kind, question) {
    state.checkinOpen = true;
    state.lastCheckinAt = Date.now();
    els.checkin.dataset.kind = kind;
    els.checkin.dataset.step = "answer";
    els.checkinQuestion.textContent = question;
    els.checkinAnswers.hidden = false;
    els.checkinFollowup.hidden = true;
    els.checkinAnswers.innerHTML = primaryAnswers(kind)
      .map((a) => `<button type="button" data-answer="${a}">${a}</button>`)
      .join("");
    els.checkin.classList.add("is-open");
    els.checkin.setAttribute("aria-hidden", "false");
    const first = els.checkinAnswers.querySelector("button");
    if (first) first.focus();

    els.checkinAnswers.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => onCheckinAnswer(btn.dataset.answer));
    });
  }

  function primaryAnswers(kind) {
    if (kind === "edit") return ["Yes", "Mostly", "Okay", "Clunky"];
    if (kind === "filter" || kind === "pipeline" || kind === "theme")
      return ["Yes", "Mostly", "Okay", "Clunky"];
    return ["Easy", "Okay", "Clunky"];
  }

  function onCheckinAnswer(answer) {
    const kind = els.checkin.dataset.kind;
    if (answer === "Okay" || answer === "Clunky") {
      els.checkin.dataset.step = "followup";
      els.checkin.dataset.answer = answer;
      els.checkinQuestion.textContent = "What slowed you down?";
      els.checkinAnswers.hidden = true;
      els.checkinFollowup.hidden = false;
      els.checkinFollowup.innerHTML = `
        <div class="checkin-answers" role="group" aria-label="Slowdown reasons">
          ${SLOWDOWN_OPTIONS.map((o) => `<button type="button" data-slow="${o}">${o}</button>`).join("")}
        </div>
        <label for="checkin-note">Optional note</label>
        <textarea id="checkin-note" maxlength="280" placeholder="A short note helps the agents"></textarea>
        <button type="button" class="primary-btn" data-save-followup>Save</button>
      `;
      const selected = new Set();
      els.checkinFollowup.querySelectorAll("[data-slow]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const on = !selected.has(btn.dataset.slow);
          if (on) selected.add(btn.dataset.slow);
          else selected.delete(btn.dataset.slow);
          btn.setAttribute("aria-pressed", String(on));
        });
      });
      els.checkinFollowup.querySelector("[data-save-followup]").addEventListener("click", () => {
        const note = els.checkinFollowup.querySelector("#checkin-note").value.trim();
        commitCheckin({
          kind,
          answer,
          slowdowns: [...selected],
          note,
        });
      });
      return;
    }
    commitCheckin({ kind, answer, slowdowns: [], note: "" });
  }

  function commitCheckin(entry) {
    const list = loadCheckins();
    list.push({
      ...entry,
      at: new Date().toISOString(),
    });
    saveCheckins(list);
    closeCheckin();
    renderCheckinSummary();
  }

  function closeCheckin() {
    state.checkinOpen = false;
    els.checkin.classList.remove("is-open");
    els.checkin.setAttribute("aria-hidden", "true");
  }

  function wireCheckinChrome() {
    els.checkinNotNow.addEventListener("click", () => {
      closeCheckin();
    });
    els.checkinMute.addEventListener("click", () => {
      muteToday();
      closeCheckin();
    });
  }

  /* Track native dialogs so check-ins never interrupt */
  const nativePrompt = window.prompt.bind(window);
  window.prompt = (...args) => {
    state.popupOpen = true;
    try {
      return nativePrompt(...args);
    } finally {
      state.popupOpen = false;
    }
  };

  function cacheEls() {
    els.app = document.getElementById("app");
    els.batStatus = document.getElementById("bat-status");
    els.batLabel = document.getElementById("bat-label");
    els.batMessage = document.getElementById("bat-message");
    els.summary = document.getElementById("summary-strip");
    els.pipeline = document.getElementById("pipeline");
    els.filters = document.getElementById("project-filters");
    els.projectList = document.getElementById("project-list");
    els.brief = document.getElementById("project-brief");
    els.agentLog = document.getElementById("agent-log");
    els.chart = document.getElementById("revisions-chart");
    els.checkinSummary = document.getElementById("checkin-summary");
    els.presentBtn = document.getElementById("present-btn");
    els.themeBtn = document.getElementById("theme-btn");
    els.checkin = document.getElementById("checkin-card");
    els.checkinQuestion = document.getElementById("checkin-question");
    els.checkinAnswers = document.getElementById("checkin-answers");
    els.checkinFollowup = document.getElementById("checkin-followup");
    els.checkinNotNow = document.getElementById("checkin-not-now");
    els.checkinMute = document.getElementById("checkin-mute");
  }

  function wireChrome() {
    els.presentBtn.addEventListener("click", () => setPresent(!state.present));
    els.themeBtn.addEventListener("click", toggleTheme);

    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea, select, [contenteditable='true']")) return;
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        setPresent(!state.present);
      }
      if (e.key === "Escape" && state.present) setPresent(false);
      if (e.key === "Escape" && state.checkinOpen) closeCheckin();
    });

    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && state.present) {
        state.present = false;
        document.body.classList.remove("is-present");
        els.presentBtn.setAttribute("aria-pressed", "false");
        els.presentBtn.innerHTML = `Present <span class="kbd">P</span>`;
      }
    });

    wireCheckinChrome();
  }

  function boot() {
    cacheEls();
    const theme = initTheme();
    els.themeBtn.setAttribute("aria-pressed", String(theme === "light"));
    els.themeBtn.textContent = theme === "light" ? "Dark mode" : "Light mode";

    renderBatStatus();
    renderSummary();
    renderPipeline();
    renderFilters();
    state.selectedId = data.projects.find((p) => p.attention)?.id || data.projects[0].id;
    renderProjects();
    renderAgentLog();
    renderChart();
    renderCheckinSummary();
    wireChrome();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
