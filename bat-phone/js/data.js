/* Atelier Wagner — Bat Phone demo data (studio floor) */
window.BatPhoneData = (() => {
  const pipeline = [
    { id: "brief", label: "Brief & intake", count: 4, value: 86000 },
    { id: "concept", label: "Concept", count: 3, value: 124000 },
    { id: "design", label: "Design", count: 5, value: 218000 },
    { id: "review", label: "Client review", count: 3, value: 142000 },
    { id: "production", label: "Production", count: 2, value: 96000 },
    { id: "delivered", label: "Delivered", count: 7, value: 312000 },
  ];

  const projects = [
    {
      id: "p-meridian",
      name: "Meridian Hospitality",
      client: "Meridian Group",
      category: "brand",
      status: "red",
      attention: true,
      stage: "review",
      value: 84000,
      budgetUsed: 0.78,
      scope: "Identity system, signage kit, guest app icons",
      lead: "Elena Voss",
      deliverables: [
        { label: "Primary mark lockups", done: true },
        { label: "Color & type board", done: true },
        { label: "Signage set (lobby)", done: false },
        { label: "App icon family", done: false },
      ],
      hours: { studio: 86, agents: 41 },
      agentDraft:
        "Meridian — client review pack is ready. Signage set still open; app icons drafted at 2 sizes. Recommend sending the lobby board today and holding icons until Tuesday’s walkthrough.",
    },
    {
      id: "p-northline",
      name: "Northline Transit",
      client: "City of Harrisburg",
      category: "digital",
      status: "amber",
      attention: true,
      stage: "design",
      value: 126000,
      budgetUsed: 0.54,
      scope: "Wayfinding UI, station screens, rider microsite",
      lead: "Jonah Park",
      deliverables: [
        { label: "Screen wireframes", done: true },
        { label: "Motion specs", done: true },
        { label: "Microsite pages", done: false },
        { label: "Accessibility pass", done: false },
      ],
      hours: { studio: 112, agents: 67 },
      agentDraft:
        "Northline microsite IA is drafted. Agents mapped 14 station states into the component set. Flag: contrast on amber alerts needs a human pass before client review.",
    },
    {
      id: "p-atelier-site",
      name: "Atelier Wagner Site",
      client: "Internal",
      category: "digital",
      status: "green",
      attention: false,
      stage: "production",
      value: 32000,
      budgetUsed: 0.61,
      scope: "Official web presence, Bat Phone ops surface",
      lead: "Kurt Wagner",
      deliverables: [
        { label: "Coming-soon compositions", done: true },
        { label: "Bat Phone shell", done: false },
        { label: "Present mode", done: false },
        { label: "Check-in logging", done: false },
      ],
      hours: { studio: 28, agents: 52 },
      agentDraft:
        "Bat Phone dashboard scaffold is in progress. Present mode, pipeline filters, and quick check-ins are next. Coming-soon art stays at the public root.",
    },
    {
      id: "p-lumen",
      name: "Lumen & Oak",
      client: "Lumen & Oak Retail",
      category: "brand",
      status: "blue",
      attention: false,
      stage: "concept",
      value: 58000,
      budgetUsed: 0.22,
      scope: "Rebrand exploration, packaging pilots",
      lead: "Maya Chen",
      deliverables: [
        { label: "Mood frames", done: true },
        { label: "Wordmark studies", done: true },
        { label: "Packaging pilots", done: false },
        { label: "Guidelines outline", done: false },
      ],
      hours: { studio: 34, agents: 19 },
      agentDraft:
        "Three wordmark directions synthesized from last week’s intake. Agents prepared side-by-side boards; recommend presenting Direction B as the lead.",
    },
    {
      id: "p-cove",
      name: "Cove Financial",
      client: "Cove Advisors",
      category: "digital",
      status: "amber",
      attention: true,
      stage: "review",
      value: 91000,
      budgetUsed: 0.69,
      scope: "Advisor portal refresh, report templates",
      lead: "Elena Voss",
      deliverables: [
        { label: "Portal UI kit", done: true },
        { label: "Report templates", done: true },
        { label: "Client approval pack", done: false },
        { label: "Handoff notes", done: false },
      ],
      hours: { studio: 74, agents: 38 },
      agentDraft:
        "Cove approval pack overdue by 3 days. Draft email prepared with annotated screens. One blocker: legal footer copy still pending from client.",
    },
    {
      id: "p-hearth",
      name: "Hearth Kitchen",
      client: "Hearth Co.",
      category: "brand",
      status: "green",
      attention: false,
      stage: "design",
      value: 44000,
      budgetUsed: 0.41,
      scope: "Menu system, seasonal campaign",
      lead: "Jonah Park",
      deliverables: [
        { label: "Menu grid", done: true },
        { label: "Seasonal photography art direction", done: true },
        { label: "Campaign key visual", done: false },
        { label: "Printer proofs", done: false },
      ],
      hours: { studio: 48, agents: 21 },
      agentDraft:
        "Menu grid locked. Agents laid out three seasonal KV options from the shoot brief. Studio should pick one before Thursday.",
    },
    {
      id: "p-ridge",
      name: "Ridge Civic Center",
      client: "Ridge Arts",
      category: "brand",
      status: "blue",
      attention: false,
      stage: "brief",
      value: 38000,
      budgetUsed: 0.08,
      scope: "Season identity, donor materials",
      lead: "Maya Chen",
      deliverables: [
        { label: "Intake notes", done: true },
        { label: "Stakeholder map", done: false },
        { label: "Season themes", done: false },
        { label: "Donor suite outline", done: false },
      ],
      hours: { studio: 9, agents: 6 },
      agentDraft:
        "Intake transcribed and tagged. Agents drafted a stakeholder map from the kickoff transcript — ready for Maya to confirm.",
    },
    {
      id: "p-sable",
      name: "Sable Optics",
      client: "Sable",
      category: "digital",
      status: "green",
      attention: false,
      stage: "delivered",
      value: 72000,
      budgetUsed: 0.97,
      scope: "Launch site, product story pages",
      lead: "Kurt Wagner",
      deliverables: [
        { label: "Launch site", done: true },
        { label: "Product stories", done: true },
        { label: "Analytics setup", done: true },
        { label: "Warranty microsite", done: true },
      ],
      hours: { studio: 96, agents: 58 },
      agentDraft:
        "Sable Optics delivered last Friday. Warranty microsite live. Archive brief and move residual hours to support retainer.",
    },
  ];

  const agentLog = [
    { time: "07:42", text: "Drafted Meridian lobby board annotations for client review." },
    { time: "07:55", text: "Flagged Cove Financial approval as overdue (+3 days)." },
    { time: "08:10", text: "Mapped Northline station states into the component inventory." },
    { time: "08:28", text: "Prepared Lumen & Oak wordmark comparison board." },
    { time: "08:41", text: "Summarized Ridge Civic kickoff transcript into intake notes." },
    { time: "09:02", text: "Queued Hearth Kitchen seasonal KV options for studio pick." },
    { time: "09:18", text: "Updated pipeline values after Sable Optics delivery archive." },
    { time: "09:33", text: "Wrote Bat Phone present-mode helper copy for the room." },
  ];

  /* Eight weeks of revision volume; agents went live at week index 5 */
  const revisions = [
    { week: "W1", count: 11 },
    { week: "W2", count: 14 },
    { week: "W3", count: 12 },
    { week: "W4", count: 16 },
    { week: "W5", count: 15 },
    { week: "W6", count: 22 },
    { week: "W7", count: 28 },
    { week: "W8", count: 31 },
  ];
  const agentsLiveWeekIndex = 5;

  const summary = {
    workInProgress: projects.filter((p) => p.stage !== "delivered").length,
    activeProjects: projects.length,
    approvalsOverdue: 2,
    avgBriefToDeliveryDays: 18,
    hoursSavedByAgents: 302,
  };

  return {
    pipeline,
    projects,
    agentLog,
    revisions,
    agentsLiveWeekIndex,
    summary,
  };
})();
