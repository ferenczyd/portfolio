window.addEventListener('scroll', function () {
  var scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  var newSize = Math.max(100, 200 - scrollPosition);
  document.querySelector('.profile-pic').style.height = newSize + 'px';
});

window.addEventListener('DOMContentLoaded', function () {
  window.scrollTo(0, 0);
  var container = document.getElementById('knowledgeGraph');
  if (!container || typeof vis === 'undefined') return;

  // ===========================================================================
  // LESS-HAIRBALL OFFLINE GRAPH
  // Strategy:
  // 1) Start with a clean graph: Profile + 3 section hubs + Institutions/Creds + Skills + Roles
  // 2) DO NOT render achievement bullets at load
  // 3) When you click a role node, we "lazy-expand" its achievements (bullets)
  // 4) Clicking the same role again collapses its achievements
  //
  // Works offline (no Neo4j connection). Keeps your accordion click behavior.
  // ===========================================================================

  // ---------- Data dictionaries ----------
  var skillCatalog = [
    // Data Analytics
    { key: 'tableau', name: 'Tableau', category: 'Data Analytics', pct: 95 },
    { key: 'sql', name: 'SQL', category: 'Data Analytics', pct: 85 },
    { key: 'rmarkdown_jupyter_notebook', name: 'RMarkdown / Jupyter Notebook', category: 'Data Analytics', pct: 80 },
    { key: 'etl_pipelines', name: 'ETL Pipelines', category: 'Data Analytics', pct: 80 },

    // Programming
    { key: 'github_gitlab', name: 'GitHub / GitLab', category: 'Programming', pct: 95 },
    { key: 'rshiny', name: 'RShiny', category: 'Programming', pct: 85 },
    { key: 'python', name: 'Python', category: 'Programming', pct: 75 },
    { key: 'api_integration', name: 'API Integration', category: 'Programming', pct: 73 },
    { key: 'web_development', name: 'Web Development', category: 'Programming', pct: 70 },
    { key: 'linux', name: 'Linux', category: 'Programming', pct: 45 },
    { key: 'cloud_services', name: 'Cloud Services', category: 'Programming', pct: 30 },

    // Leadership
    { key: 'team_leadership', name: 'Team Leadership', category: 'Leadership', pct: 95 },
    { key: 'ai_strategy_and_deployment', name: 'AI Strategy and Deployment', category: 'Leadership', pct: 90 },
    { key: 'cross_functional_project_implementations', name: 'Cross Functional Project Implementations', category: 'Leadership', pct: 85 }
  ];

  var roles = [
    {
      key: 'role_2023_07_present_lead_bi_analyst',
      label: 'Boeing BCA (Jul 2023–Present)\nLead Business Intelligence Analyst',
      collapse: 'collapseOne',
      achievements: [
        'Spearheading AI Strategy and Deployment for BCA Supply Chain Functional Excellence, integrating AI into scalable solutions to free up human capital to make accelerated decisions and actions',
        'Developed batch OpenAI API Python script to augment system data, integrating AI into SQL tables for enhanced analysis in Tableau Dashboards',
        'Developed proof of concept RAG Chatbot using Flask in Python',
        'Supporting Multi-Cloud Hybrid Data Architecture Strategy and Governance team, driving transparent, cost effective and reliable production solutions',
        'Led Analytics development supporting BCA Inventory Optimization, balancing Purchase Order Spend with Supplier Stability resulting in $500M+ cost reduction in 2024',
        'Developed an R Shiny application to simulate supply, demand, and inventory projections, facilitating strategic rescheduling decisions',
        'Mentored team members in leveraging R for web development and data analytics, fostering skill development and knowledge sharing'
      ],
      usedSkills: [
        { key: 'ai_strategy_and_deployment', t: 'core' },
        { key: 'team_leadership', t: 'leadership' },
        { key: 'tableau', t: 'core' },
        { key: 'sql', t: 'core' },
        { key: 'python', t: 'core' },
        { key: 'rshiny', t: 'core' },
        { key: 'api_integration', t: 'applied' },
        { key: 'etl_pipelines', t: 'applied' },
        { key: 'cloud_services', t: 'enabling' }
      ]
    },
    {
      key: 'role_2022_03_2023_07_sr_bi_analyst',
      label: 'Boeing Enterprise (Mar 2022–Jul 2023)\nSr. Business Intelligence Analyst',
      collapse: 'collapseOnePointFive',
      achievements: [
        'Developed R Shiny application to search and ingest semiconductor component availability and lead time data using multiple distributor APIs',
        'Technical Lead for the development of the Enterprise Health & Visibility projects',
        'Developed data pipeline and Tableau dashboards for BCA/BGS Inventory Price Differential Project',
        'Identified and implemented new technologies and tools for team (GitLab, DataIku, RStudio Professional)',
        'Supported BCA ESRC Wire Bundle Recovery Project'
      ],
      usedSkills: [
        { key: 'rshiny', t: 'core' },
        { key: 'api_integration', t: 'core' },
        { key: 'tableau', t: 'core' },
        { key: 'sql', t: 'applied' },
        { key: 'etl_pipelines', t: 'applied' },
        { key: 'github_gitlab', t: 'enabling' },
        { key: 'cross_functional_project_implementations', t: 'leadership' }
      ]
    },
    {
      key: 'role_2020_01_2022_03_senior_bpa',
      label: 'Boeing BCA (Jan 2020–Mar 2022)\nSenior Business Process Analyst',
      collapse: 'collapseTwo',
      achievements: [
        'Developed React web applications for SQL data entry enabling program-level KPI dashboards; created CI/CD pipelines to deploy to Dev/Test/Prod CloudFoundry servers',
        'Developed dashboards integrating multiple data sources and systems to provide holistic program-level performance metrics'
      ],
      usedSkills: [
        { key: 'web_development', t: 'core' },
        { key: 'sql', t: 'core' },
        { key: 'github_gitlab', t: 'applied' },
        { key: 'tableau', t: 'applied' },
        { key: 'etl_pipelines', t: 'applied' }
      ]
    },
    {
      key: 'role_2018_06_2020_01_bpa',
      label: 'Boeing 777/777x (Jun 2018–Jan 2020)\nBusiness Process Analyst',
      collapse: 'collapseThree',
      achievements: [
        'Connected disparate databases across organizations to create BI solutions providing comprehensive value stream visibility for program management'
      ],
      usedSkills: [
        { key: 'tableau', t: 'core' },
        { key: 'sql', t: 'core' },
        { key: 'etl_pipelines', t: 'applied' },
        { key: 'cross_functional_project_implementations', t: 'applied' }
      ]
    },
    {
      key: 'role_2016_05_2018_06_integration_analyst',
      label: 'Boeing 777x (May 2016–Jun 2018)\nIntegration Analyst',
      collapse: 'collapseFour',
      achievements: [
        'Integrated unstructured Excel data with SQL connections to create an executive summary report identifying tool readiness risks to production schedule',
        'Worked with Tooling Engineering/Operations/Construction to create performance-to-plan metrics using Excel, Access, and Tableau',
        'Iteratively created/updated 777x Tooling Line of Balance dashboard; identified data gaps/inconsistencies and revised models based on stakeholder feedback',
        'Created and maintained automated ETAC Line of Balance reports',
        'Compiled supporting data to develop estimates and schedules',
        'Assembled tooling product data, presentations, and support materials for manufacturing, procurement, and shop-floor teams',
        'Gathered and prepared data for offload tooling business systems',
        'Identified, coordinated, and processed customer requirements for tooling products and information',
        'Assisted in creation of project schedules and updated status using Microsoft Project',
        'Collaborated in reviewing and creating tooling product documentation and procedures'
      ],
      usedSkills: [
        { key: 'sql', t: 'core' },
        { key: 'tableau', t: 'core' },
        { key: 'etl_pipelines', t: 'applied' },
        { key: 'web_development', t: 'enabling' }
      ]
    },
    {
      key: 'role_2011_04_2016_05_expeditor',
      label: 'Boeing 787 (Apr 2011–May 2016)\nExpeditor',
      collapse: 'collapseFive',
      achievements: [
        'Linked supply chain and quality data to identify recurring defects causing part shortages; drove root cause actions reducing defects/shortages and improving process adherence',
        'Led 787 cross-functional value stream mapping accelerated improvement workshop; reduced defects by over 50% in test area',
        'Requirements owner for 787 MMO C&D Zodiac Online Horse Blanket tool; translated stakeholder requirements into logic used by IT to deploy supplier shortage visibility for recovery efforts',
        'Helped define/build/test/certify 787 battery solution returning fleet to service; tracked and reported fabrication/shipping status for recovery parts',
        'Integrated and analyzed part shortage data using Access, Excel, and Cognos to create reports for manufacturing, procurement, and quality teams',
        'Supervised multiple teams as a Temporary Manager and Team Lead'
      ],
      usedSkills: [
        { key: 'sql', t: 'applied' },
        { key: 'etl_pipelines', t: 'applied' },
        { key: 'team_leadership', t: 'leadership' },
        { key: 'cross_functional_project_implementations', t: 'applied' }
      ]
    }
  ];

  // Education -> Skills (keep the strongest links only)
  var eduSkillEdges = [
    ['cred|uw_cert_python_2021_10_2022_06', 'skill|python', 'reinforces'],
    ['cred|uw_net_sys_admin_2022_10_12', 'skill|linux', 'reinforces'],
    ['cred|uw_foundations_statistics_2021', 'skill|rmarkdown_jupyter_notebook', 'reinforces'],

    ['cred|cwu_bs_2016_2019', 'skill|sql', 'reinforces'],
    ['cred|cwu_bs_2016_2019', 'skill|web_development', 'reinforces'],

    ['cred|udemy_webdev_bootcamp_2023', 'skill|web_development', 'reinforces'],
    ['cred|udemy_data_science_az', 'skill|python', 'reinforces'],
    ['cred|udemy_data_science_az', 'skill|etl_pipelines', 'reinforces'],
    ['cred|udemy_r_prog_az', 'skill|rshiny', 'reinforces'],
    ['cred|udemy_tableau_10_az', 'skill|tableau', 'reinforces']
  ];

  // ---------- Build initial (collapsed) graph ----------
  var nodesArr = [
    { id: 'profile', label: 'Dominic Ferenczy', shape: 'dot', size: 24, color: '#0033A0' },
    { id: 'education', label: 'Education', shape: 'dot', size: 18 },
    { id: 'skills', label: 'Skills', shape: 'dot', size: 18 },
    { id: 'experience', label: 'Experience', shape: 'dot', size: 18 }
  ];

  var edgesArr = [
    { from: 'profile', to: 'education' },
    { from: 'profile', to: 'skills' },
    { from: 'profile', to: 'experience' }
  ];

  // Education nodes
  var institutions = [
    { id: 'inst|University of Washington', label: 'University of Washington', group: 'institution' },
    { id: 'inst|Central Washington University', label: 'Central Washington University', group: 'institution' },
    { id: 'inst|Everett Community College', label: 'Everett Community College', group: 'institution' },
    { id: 'inst|Udemy', label: 'Udemy', group: 'institution' }
  ];
  nodesArr.push.apply(nodesArr, institutions);
  edgesArr.push(
    { from: 'education', to: 'inst|University of Washington' },
    { from: 'education', to: 'inst|Central Washington University' },
    { from: 'education', to: 'inst|Everett Community College' },
    { from: 'education', to: 'inst|Udemy' }
  );

  var creds = [
    { id: 'cred|uw_pce_2021_2022', label: 'Professional & Continuing Education (2021–2022)', group: 'credential' },
    { id: 'cred|cwu_bs_2016_2019', label: 'B.S. (2016–2019)\nIT & Admin Management', group: 'credential' },
    { id: 'cred|evcc_aa_2012_2016', label: 'A.A. (2012–2016)\nBusiness Admin & Mgmt', group: 'credential' },
    { id: 'cred|udemy_certs_2017_2023', label: 'Udemy Certificates (2017–2023)', group: 'credential' },

    // Keep sub-credentials, but fewer lines
    { id: 'cred|uw_cert_python_2021_10_2022_06', label: 'UW Python Certificate\n(Oct 2021–Jun 2022)', group: 'credential_detail' },
    { id: 'cred|uw_net_sys_admin_2022_10_12', label: 'UW Network & SysAdmin\n(Oct–Dec 2022)', group: 'credential_detail' },
    { id: 'cred|uw_foundations_statistics_2021', label: 'UW Foundations of Statistics (2021)', group: 'credential_detail' },

    { id: 'cred|udemy_webdev_bootcamp_2023', label: 'Udemy Web Dev Bootcamp (2023)', group: 'credential_detail' },
    { id: 'cred|udemy_data_science_az', label: 'Udemy Data Science A-Z', group: 'credential_detail' },
    { id: 'cred|udemy_r_prog_az', label: 'Udemy R Programming A-Z', group: 'credential_detail' },
    { id: 'cred|udemy_adv_r', label: 'Udemy Advanced Analytics in R', group: 'credential_detail' },
    { id: 'cred|udemy_tableau_10_az', label: 'Udemy Tableau 10 A-Z', group: 'credential_detail' }
  ];
  nodesArr.push.apply(nodesArr, creds);

  edgesArr.push(
    { from: 'inst|University of Washington', to: 'cred|uw_pce_2021_2022' },
    { from: 'inst|Central Washington University', to: 'cred|cwu_bs_2016_2019' },
    { from: 'inst|Everett Community College', to: 'cred|evcc_aa_2012_2016' },
    { from: 'inst|Udemy', to: 'cred|udemy_certs_2017_2023' },

    { from: 'cred|uw_pce_2021_2022', to: 'cred|uw_cert_python_2021_10_2022_06' },
    { from: 'cred|uw_pce_2021_2022', to: 'cred|uw_net_sys_admin_2022_10_12' },
    { from: 'cred|uw_pce_2021_2022', to: 'cred|uw_foundations_statistics_2021' },

    { from: 'cred|udemy_certs_2017_2023', to: 'cred|udemy_webdev_bootcamp_2023' },
    { from: 'cred|udemy_certs_2017_2023', to: 'cred|udemy_data_science_az' },
    { from: 'cred|udemy_certs_2017_2023', to: 'cred|udemy_r_prog_az' },
    { from: 'cred|udemy_certs_2017_2023', to: 'cred|udemy_adv_r' },
    { from: 'cred|udemy_certs_2017_2023', to: 'cred|udemy_tableau_10_az' }
  );

  // Skills nodes (still all, but grouped by category via colors)
  skillCatalog.forEach(function (s) {
    nodesArr.push({
      id: 'skill|' + s.key,
      label: s.name + ' (' + s.pct + '%)',
      group: 'skill_' + s.category.replace(/\s+/g, '_').toLowerCase()
    });
    edgesArr.push({ from: 'skills', to: 'skill|' + s.key });
  });

  // Roles (NO achievements yet)
  roles.forEach(function (r) {
    nodesArr.push({
      id: 'role|' + r.key,
      label: r.label,
      group: 'role'
    });
    edgesArr.push({ from: 'experience', to: 'role|' + r.key });

    // Keep role-skill edges (but fewer labels to reduce clutter)
    r.usedSkills.forEach(function (m) {
      edgesArr.push({
        from: 'skill|' + m.key,
        to: 'role|' + r.key,
        label: m.t === 'core' ? 'core' : '', // only label core; others unlabeled
        dashes: m.t !== 'core'
      });
    });
  });

  // Education -> Skills (strong links only)
  eduSkillEdges.forEach(function (t) {
    edgesArr.push({ from: t[0], to: t[1], label: t[2], dashes: true });
  });

  var nodes = new vis.DataSet(nodesArr);
  var edges = new vis.DataSet(edgesArr);

  // ---------- Styling (reduces hairball via grouping + softer physics) ----------
  var options = {
    autoResize: true,
    interaction: { hover: true },
    physics: {
      stabilization: { enabled: true, iterations: 120, updateInterval: 25 },
      barnesHut: {
        gravitationalConstant: -1200,
        springLength: 160,
        springConstant: 0.02,
        damping: 0.35
      }
    },
    layout: {
      improvedLayout: true
    },
    nodes: {
      shape: 'dot',
      size: 12,
      font: { size: 13, color: '#2d3748' },
      color: { border: '#0033A0', background: '#d9e2ef' }
    },
    groups: {
      root: { color: { background: '#0033A0', border: '#0033A0' }, font: { color: '#ffffff' } },
      section: { color: { background: '#e6eef9', border: '#0033A0' } },
      institution: { color: { background: '#eef2ff', border: '#4c51bf' } },
      credential: { color: { background: '#f0fff4', border: '#2f855a' } },
      credential_detail: { color: { background: '#f0fff4', border: '#68d391' } },
      role: { color: { background: '#fffaf0', border: '#b7791f' } },
      achievement: { color: { background: '#faf5ff', border: '#6b46c1' }, font: { size: 11 } },

      // Skill groups by category
      skill_data_analytics: { color: { background: '#ebf8ff', border: '#2b6cb0' } },
      skill_programming: { color: { background: '#e6fffa', border: '#2c7a7b' } },
      skill_leadership: { color: { background: '#fff5f5', border: '#c53030' } }
    },
    edges: {
      color: '#9fb3d1',
      width: 1.2,
      smooth: { type: 'continuous' },
      font: { size: 9, align: 'middle' }
    }
  };

  var network = new vis.Network(container, { nodes: nodes, edges: edges }, options);

  var yearSlider = document.getElementById('graphYear');
  var yearValue = document.getElementById('graphYearValue');
  var activeYear = null;
  var yearAllowed = null;
  var lastYear = null;
  var baseVisible = new Set(['profile', 'education', 'experience']);
  var revealToken = 0;

  var roleYearRanges = [
    { id: 'role|role_2023_07_present_lead_bi_analyst', start: 2023, end: new Date().getFullYear() },
    { id: 'role|role_2022_03_2023_07_sr_bi_analyst', start: 2022, end: 2023 },
    { id: 'role|role_2020_01_2022_03_senior_bpa', start: 2020, end: 2022 },
    { id: 'role|role_2018_06_2020_01_bpa', start: 2018, end: 2020 },
    { id: 'role|role_2016_05_2018_06_integration_analyst', start: 2016, end: 2018 },
    { id: 'role|role_2011_04_2016_05_expeditor', start: 2011, end: 2016 }
  ];

  var educationYearRanges = [
    { id: 'inst|University of Washington', start: 2021, end: 2022 },
    { id: 'inst|Central Washington University', start: 2016, end: 2019 },
    { id: 'inst|Everett Community College', start: 2012, end: 2016 },
    { id: 'inst|Udemy', start: 2017, end: 2023 },

    { id: 'cred|uw_pce_2021_2022', start: 2021, end: 2022 },
    { id: 'cred|uw_cert_python_2021_10_2022_06', start: 2021, end: 2022 },
    { id: 'cred|uw_net_sys_admin_2022_10_12', start: 2022, end: 2022 },
    { id: 'cred|uw_foundations_statistics_2021', start: 2021, end: 2021 },

    { id: 'cred|cwu_bs_2016_2019', start: 2016, end: 2019 },
    { id: 'cred|evcc_aa_2012_2016', start: 2012, end: 2016 },

    { id: 'cred|udemy_certs_2017_2023', start: 2017, end: 2023 },
    { id: 'cred|udemy_webdev_bootcamp_2023', start: 2023, end: 2023 },
    { id: 'cred|udemy_data_science_az', start: 2017, end: 2023 },
    { id: 'cred|udemy_r_prog_az', start: 2017, end: 2023 },
    { id: 'cred|udemy_adv_r', start: 2017, end: 2023 },
    { id: 'cred|udemy_tableau_10_az', start: 2017, end: 2023 }
  ];

  function matchesYear(range, year) {
    return year >= range.start && year <= range.end;
  }

  function computeYearAllowed(year) {
    var allowed = new Set(baseVisible);

    roleYearRanges.forEach(function (r) {
      if (matchesYear(r, year)) {
        allowed.add(r.id);
      }
    });

    educationYearRanges.forEach(function (r) {
      if (matchesYear(r, year)) {
        allowed.add(r.id);
      }
    });

    return allowed;
  }

  function resetYearVisibility() {
    revealToken += 1;
    nodes.get().forEach(function (n) {
      var shouldShow = baseVisible.has(n.id);
      if (n.id === 'skills') shouldShow = false;
      nodes.update({ id: n.id, hidden: !shouldShow });
    });

    edges.get().forEach(function (e) {
      var fromNode = nodes.get(e.from);
      var toNode = nodes.get(e.to);
      var keep = fromNode && toNode && !fromNode.hidden && !toNode.hidden;
      edges.update({ id: e.id, hidden: !keep });
    });

    yearAllowed = new Set(baseVisible);
  }

  function getRevealPriority(nodeId) {
    if (nodeId.indexOf('inst|') === 0) return 1;
    if (nodeId.indexOf('cred|') === 0) return 2;
    if (nodeId.indexOf('role|') === 0) return 3;
    return 4;
  }

  function revealNodesSequential(nodeIds) {
    if (!nodeIds.length) return;
    var token = revealToken;

    nodeIds
      .sort(function (a, b) {
        var pa = getRevealPriority(a);
        var pb = getRevealPriority(b);
        if (pa !== pb) return pa - pb;
        return a.localeCompare(b);
      })
      .forEach(function (id, idx) {
        window.setTimeout(function () {
          if (token !== revealToken) return;
          var node = nodes.get(id);
          if (node && node.hidden) nodes.update({ id: id, hidden: false });

          edges.get().forEach(function (e) {
            var fromNode = nodes.get(e.from);
            var toNode = nodes.get(e.to);
            var keep = fromNode && toNode && !fromNode.hidden && !toNode.hidden;
            edges.update({ id: e.id, hidden: !keep });
          });
        }, idx * 120);
      });
  }

  function revealYearNodes(year) {
    var allowed = computeYearAllowed(year);
    var toReveal = [];
    allowed.forEach(function (id) {
      if (!yearAllowed.has(id)) {
        yearAllowed.add(id);
        toReveal.push(id);
      }
    });

    revealNodesSequential(toReveal);
  }

  function applyYearFilter(year) {
    activeYear = year;
    if (yearValue) yearValue.textContent = year;

    if (lastYear !== null && year < lastYear) {
      resetYearVisibility();
    }

    revealYearNodes(year);
    lastYear = year;

    network.fit({ animation: { duration: 700, easingFunction: 'easeInOutQuad' } });
  }

  // ---------- Lazy expand / collapse achievements ----------
  var expandedRoles = new Set();

  function achievementNodeId(roleKey, idx) {
    return 'ach|' + roleKey + '_a' + (idx + 1);
  }

  function expandRoleAchievements(roleKey) {
    var role = roles.find(function (r) { return r.key === roleKey; });
    if (!role) return;

    var roleNodeId = 'role|' + roleKey;

    role.achievements.forEach(function (text, idx) {
      var aId = achievementNodeId(roleKey, idx);

      if (!nodes.get(aId)) {
        nodes.add({ id: aId, label: text, group: 'achievement' });
      }
      // edge id to make removal easy
      var eId = 'e|' + roleKey + '|a|' + (idx + 1);
      if (!edges.get(eId)) {
        edges.add({ id: eId, from: roleNodeId, to: aId });
      }
    });

    expandedRoles.add(roleKey);
  }

  function collapseRoleAchievements(roleKey) {
    var role = roles.find(function (r) { return r.key === roleKey; });
    if (!role) return;

    role.achievements.forEach(function (_text, idx) {
      var aId = achievementNodeId(roleKey, idx);
      var eId = 'e|' + roleKey + '|a|' + (idx + 1);

      if (edges.get(eId)) edges.remove(eId);
      // remove achievement node only if it's isolated (no other edges)
      if (nodes.get(aId)) {
        var connected = network.getConnectedEdges(aId);
        if (!connected || connected.length === 0) nodes.remove(aId);
      }
    });

    expandedRoles.delete(roleKey);
  }

  function ensureRoleAchievements(roleKey) {
    if (expandedRoles.has(roleKey)) return;
    expandRoleAchievements(roleKey);
  }

  function getNodeIdFromFilter(filter) {
    if (!filter) return null;

    if (filter.indexOf('skill:') === 0) {
      return 'skill|' + filter.substring('skill:'.length);
    }

    if (filter.indexOf('cred:') === 0) {
      return 'cred|' + filter.substring('cred:'.length);
    }

    if (filter.indexOf('inst:') === 0) {
      return 'inst|' + filter.substring('inst:'.length);
    }

    if (filter.indexOf('role:') === 0) {
      return 'role|' + filter.substring('role:'.length);
    }

    if (filter.indexOf('achievement:') === 0) {
      var parts = filter.split(':');
      var roleKey = parts[1];
      var idx = parseInt(parts[2], 10);
      if (!roleKey || !idx) return null;
      ensureRoleAchievements(roleKey);
      return achievementNodeId(roleKey, idx - 1);
    }

    return null;
  }

  function buildAdjacency() {
    var adj = {};
    edges.get().forEach(function (e) {
      if (!adj[e.from]) adj[e.from] = [];
      if (!adj[e.to]) adj[e.to] = [];
      adj[e.from].push(e.to);
      adj[e.to].push(e.from);
    });
    return adj;
  }

  function collectNeighborhood(startId, depth) {
    var adj = buildAdjacency();
    var visited = new Set([startId]);
    var frontier = [startId];
    var level = 0;

    while (frontier.length && level < depth) {
      var next = [];
      frontier.forEach(function (nodeId) {
        (adj[nodeId] || []).forEach(function (nbr) {
          if (!visited.has(nbr)) {
            visited.add(nbr);
            next.push(nbr);
          }
        });
      });
      frontier = next;
      level += 1;
    }

    return visited;
  }

  function applyGraphFilter(nodeId) {
    if (!nodeId) return;

    var allowed = collectNeighborhood(nodeId, 2);
    if (yearAllowed) {
      allowed = new Set(Array.from(allowed).filter(function (id) { return yearAllowed.has(id); }));
    }
    nodes.get().forEach(function (n) {
      nodes.update({ id: n.id, hidden: !allowed.has(n.id) });
    });
    edges.get().forEach(function (e) {
      var keep = allowed.has(e.from) && allowed.has(e.to);
      edges.update({ id: e.id, hidden: !keep });
    });
    network.fit({ animation: { duration: 700, easingFunction: 'easeInOutQuad' } });
  }

  function resetGraphFilter() {
    if (typeof activeYear === 'number') {
      applyYearFilter(activeYear);
      return;
    }

    nodes.get().forEach(function (n) {
      if (n.hidden) nodes.update({ id: n.id, hidden: false });
    });
    edges.get().forEach(function (e) {
      if (e.hidden) edges.update({ id: e.id, hidden: false });
    });
    network.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
  }

  var activeFilter = null;

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-kg-filter]');
    if (!trigger) return;

    var filter = trigger.getAttribute('data-kg-filter');
    var nodeId = getNodeIdFromFilter(filter);
    if (!nodeId) return;

    if (activeFilter === nodeId) {
      resetGraphFilter();
      activeFilter = null;
      return;
    }

    activeFilter = nodeId;
    applyGraphFilter(nodeId);
  });

  if (yearSlider) {
    var startYear = parseInt(yearSlider.min, 10);
    var endYear = parseInt(yearSlider.max, 10);
    var currentYear = new Date().getFullYear();
    var playPauseButton = document.getElementById('graphPlayPause');
    var autoplayTimer = null;
    var isPlaying = true;

    if (!isNaN(currentYear)) {
      yearSlider.value = String(Math.min(Math.max(currentYear, startYear), endYear));
    }

    resetYearVisibility();
    applyYearFilter(parseInt(yearSlider.value, 10));

    yearSlider.addEventListener('input', function () {
      applyYearFilter(parseInt(yearSlider.value, 10));
    });

    var autoplayYear = parseInt(yearSlider.value, 10);

    function startAutoplay() {
      if (autoplayTimer) return;
      autoplayTimer = window.setInterval(function () {
        autoplayYear += 1;
        if (autoplayYear > endYear) {
          autoplayYear = startYear;
        }
        if (autoplayYear === startYear) {
          resetYearVisibility();
        }
        yearSlider.value = String(autoplayYear);
        applyYearFilter(autoplayYear);
      }, 1000);
      isPlaying = true;
      if (playPauseButton) playPauseButton.textContent = 'Pause';
    }

    function stopAutoplay() {
      if (!autoplayTimer) return;
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
      isPlaying = false;
      if (playPauseButton) playPauseButton.textContent = 'Play';
    }

    if (playPauseButton) {
      playPauseButton.addEventListener('click', function () {
        if (isPlaying) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      });
    }

    startAutoplay();
  }

  // ---------- Click behavior ----------
  network.on('click', function (params) {
    if (!params.nodes || !params.nodes.length) return;

    var nodeId = params.nodes[0];

    // Lazy expand/collapse achievements when clicking a role node
    if (nodeId.startsWith('role|')) {
      var roleKey = nodeId.substring('role|'.length);
      if (expandedRoles.has(roleKey)) {
        collapseRoleAchievements(roleKey);
      } else {
        // Collapse other roles to keep it clean (optional, but helps)
        expandedRoles.forEach(function (rk) { collapseRoleAchievements(rk); });
        expandRoleAchievements(roleKey);
      }

      // Slight re-layout nudge
      network.stabilize(60);
    }
  });
});