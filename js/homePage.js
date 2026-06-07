const workState = {
  projects: [],
  filters: {
    skills: new Set(),
    technologies: new Set(),
    types: new Set(),
  },
  sort: 'featured',
  view: 'list',
};

const WORK_TECHNOLOGY_ORDER = [
  'Unreal',
  'Unity',
  'Houdini',
  'Python',
  'C++',
  'C#',
  'Maya',
  'Blender',
  '3ds Max',
];

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function getProjectTechnology(items) {
  return uniqueSorted(items.flatMap(item => [
    ...item.engine,
    ...item.dcc,
    ...item.languages,
  ]));
}

function getProjectSkillsets(items) {
  return uniqueSorted(items.flatMap(item => item.skillsets));
}

function buildWorkProjects(portfolioManager) {
  return Object.entries(portfolioManager.projects)
    .filter(([, project]) => project.visibility === 'public')
    .map(([id, project]) => {
      const items = project.portfolioitems
        .map(itemId => portfolioManager.portfolioItems[itemId])
        .filter(Boolean);

      return {
        ...project,
        id,
        items,
        skills: getProjectSkillsets(items),
        technologies: getProjectTechnology(items),
      };
    });
}

function getWorkTypeLabel(type) {
  const labels = {
    'production': 'Production',
    'internal-tool': 'Internal Tool',
    'commercial-game': 'Commercial Game',
    'broadcast': 'Broadcast',
    'interactive-installation': 'Interactive Installation',
    'research-and-development': 'R&D',
    'platform-validation': 'Platform Validation',
    'personal-project': 'Personal Project',
  };
  return labels[type] || type;
}

function getWorkTechnologyLabel(value) {
  return value === 'Unreal' ? 'Unreal Engine' : value;
}

function createWorkChip(label, category, value) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'work-filter-chip';
  button.textContent = label;
  button.dataset.category = category;
  button.dataset.value = value;
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => toggleWorkFilter(category, value));
  return button;
}

function renderWorkFilters() {
  const skillValues = uniqueSorted(workState.projects.flatMap(project => project.skills));
  const technologyValues = uniqueSorted(workState.projects.flatMap(project => project.technologies))
    .sort((a, b) => {
      const aIndex = WORK_TECHNOLOGY_ORDER.indexOf(a);
      const bIndex = WORK_TECHNOLOGY_ORDER.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  const typeValues = uniqueSorted(workState.projects.flatMap(project => project.projectTypes));

  const groups = [
    ['workSkillFilters', 'skills', skillValues, get_skillset_label],
    ['workTechnologyFilters', 'technologies', technologyValues, getWorkTechnologyLabel],
    ['workTypeFilters', 'types', typeValues, getWorkTypeLabel],
  ];

  groups.forEach(([containerId, category, values, labelFunction]) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    values.forEach(value => container.appendChild(
      createWorkChip(labelFunction(value), category, value)
    ));
  });
}

function createWorkProjectCard(project, selected = false) {
  const article = document.createElement('article');
  article.className = selected ? 'work-project-card work-project-card-selected' : 'work-project-card';

  const link = document.createElement('a');
  link.className = 'work-project-card-link';
  link.href = `/projects/${project.id}`;
  link.addEventListener('click', event => {
    if (event.button === 1 || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    page.show(`/projects/${project.id}`);
  });

  const image = document.createElement('img');
  image.className = 'work-project-image';
  image.src = `/images/${project.thumbnail}`;
  image.alt = '';
  image.loading = selected ? 'eager' : 'lazy';

  const content = document.createElement('div');
  content.className = 'work-project-content';

  const meta = document.createElement('p');
  meta.className = 'work-project-meta';
  meta.textContent = `${project.year} · ${project.involvement}`;

  const title = document.createElement('h3');
  title.textContent = project.name;

  const impact = document.createElement('p');
  impact.className = 'work-project-impact';
  impact.textContent = project.impact;

  const tags = document.createElement('div');
  tags.className = 'work-project-tags';
  const tagValues = [
    ...project.projectTypes.slice(0, 1).map(getWorkTypeLabel),
    ...project.technologies.slice(0, selected ? 3 : 2).map(getWorkTechnologyLabel),
  ];
  tagValues.forEach(value => {
    const tag = document.createElement('span');
    tag.textContent = value;
    tags.appendChild(tag);
  });

  const footer = document.createElement('div');
  footer.className = 'work-project-footer';

  const relationship = document.createElement('span');
  relationship.className = 'work-project-relationship';
  relationship.textContent = project.relationship;

  const cta = document.createElement('span');
  cta.className = 'work-project-cta';
  cta.textContent = 'View case study →';

  footer.append(relationship, cta);
  content.append(meta, title, impact, tags, footer);
  link.append(image, content);
  article.appendChild(link);
  return article;
}

function getSelectedWork() {
  const featured = workState.projects
    .filter(project => project.featured)
    .sort((a, b) => b.year - a.year);
  const fallback = [...workState.projects].sort((a, b) => b.year - a.year);
  return (featured.length ? featured : fallback).slice(0, 3);
}

function renderSelectedWork() {
  const container = document.getElementById('workSelectedGrid');
  container.innerHTML = '';
  getSelectedWork().forEach(project => {
    container.appendChild(createWorkProjectCard(project, true));
  });
}

function projectMatchesWorkFilters(project) {
  const categories = [
    ['skills', project.skills],
    ['technologies', project.technologies],
    ['types', project.projectTypes],
  ];

  return categories.every(([category, values]) => {
    const active = workState.filters[category];
    return active.size === 0 || [...active].every(value => values.includes(value));
  });
}

function sortWorkProjects(projects) {
  return [...projects].sort((a, b) => {
    if (workState.sort === 'title') return a.name.localeCompare(b.name);
    if (workState.sort === 'newest') return b.year - a.year || a.name.localeCompare(b.name);
    return Number(b.featured) - Number(a.featured)
      || b.year - a.year
      || a.name.localeCompare(b.name);
  });
}

function updateWorkQuery() {
  const params = new URLSearchParams();
  Object.entries(workState.filters).forEach(([category, values]) => {
    if (values.size) params.set(category, [...values].join(','));
  });
  if (workState.sort !== 'featured') params.set('sort', workState.sort);

  const query = params.toString();
  history.replaceState({}, '', query ? `/?${query}` : '/');
}

function renderWorkProjects() {
  const projects = sortWorkProjects(workState.projects.filter(projectMatchesWorkFilters));
  const container = document.getElementById('workProjectGrid');
  const emptyState = document.getElementById('workEmptyState');
  const activeFilterCount = Object.values(workState.filters)
    .reduce((total, values) => total + values.size, 0);

  container.innerHTML = '';
  container.className = `work-project-grid view-${workState.view}`;
  projects.forEach(project => container.appendChild(createWorkProjectCard(project)));
  document.getElementById('workResultCount').textContent = projects.length;
  document.getElementById('workClearFilters').hidden = activeFilterCount === 0;
  emptyState.hidden = projects.length !== 0;

  document.querySelectorAll('.work-filter-chip').forEach(chip => {
    const isActive = workState.filters[chip.dataset.category].has(chip.dataset.value);
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-pressed', String(isActive));
  });

  updateWorkQuery();
}

function toggleWorkFilter(category, value) {
  const values = workState.filters[category];
  if (values.has(value)) {
    clearWorkFilterState();
  } else {
    clearWorkFilterState();
    values.add(value);
  }
  renderWorkProjects();
}

function clearWorkFilterState() {
  Object.values(workState.filters).forEach(values => values.clear());
}

function clearWorkFilters() {
  clearWorkFilterState();
  renderWorkProjects();
}

function setWorkSort(value) {
  workState.sort = value;
  renderWorkProjects();
}

function setWorkView(value) {
  if (!['large', 'small', 'list'].includes(value)) return;
  workState.view = value;
  localStorage.setItem('portfolioWorkViewV2', value);

  document.querySelectorAll('.work-view-button').forEach(button => {
    const isActive = button.dataset.view === value;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  renderWorkProjects();
}

function loadWorkQuery() {
  const params = new URLSearchParams(window.location.search);
  Object.keys(workState.filters).some(category => {
    const values = params.get(category);
    if (values) {
      const value = values.split(',').find(Boolean);
      if (value) {
        workState.filters[category].add(value);
        return true;
      }
    }
    return false;
  });

  const sort = params.get('sort');
  if (['featured', 'newest', 'title'].includes(sort)) {
    workState.sort = sort;
  }
  document.getElementById('workSort').value = workState.sort;
}

function initializeWorkPage(portfolioManager) {
  workState.projects = buildWorkProjects(portfolioManager);
  const savedView = localStorage.getItem('portfolioWorkViewV2');
  if (['large', 'small', 'list'].includes(savedView)) {
    workState.view = savedView;
  }
  loadWorkQuery();
  renderWorkFilters();
  renderSelectedWork();
  document.querySelectorAll('.work-view-button').forEach(button => {
    const isActive = button.dataset.view === workState.view;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  renderWorkProjects();
}
