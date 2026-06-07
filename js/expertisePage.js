const EXPERTISE_ORDER = [
  'pipelinedev',
  'tooldev',
  'procgen',
  'unrealdev',
  'unitydev',
  'vfx',
  'artinstallation',
];

const EXPERTISE_REPRESENTATIVE_SYSTEMS = {
  pipelinedev: '2kdam-batch',
  tooldev: 'atlasplugin-unreal',
  procgen: 'facade-editor',
  unrealdev: 'chaosbuildings-pcg',
  unitydev: 'element-vfxcomps',
  vfx: 'element-vfx',
  artinstallation: 'intelevo-showcase',
};

async function loadExpertiseMetadata() {
  try {
    const response = await fetch('/db/skills.json');
    return response.ok ? response.json() : {};
  } catch (error) {
    console.warn('[Expertise] Could not load skill metadata:', error.message);
    return {};
  }
}

function findExpertiseProjectId(portfolioManager, itemId) {
  return Object.keys(portfolioManager.projects).find(projectId => {
    const project = portfolioManager.projects[projectId];
    return project.visibility === 'public' && project.portfolioitems.includes(itemId);
  });
}

function buildExpertiseModel(portfolioManager, skillId, metadata) {
  const systems = Object.entries(portfolioManager.portfolioItems)
    .filter(([, item]) => item.skillsets.includes(skillId))
    .map(([id, item]) => ({ id, item, projectId: findExpertiseProjectId(portfolioManager, id) }))
    .filter(entry => entry.projectId);

  const projectIds = [...new Set(systems.map(entry => entry.projectId))];
  const technologies = [...new Set(systems.flatMap(({ item }) => [
    ...item.engine,
    ...item.dcc,
    ...item.languages,
  ]))];

  const preferredSystem = systems.find(entry => (
    entry.id === EXPERTISE_REPRESENTATIVE_SYSTEMS[skillId]
  ));
  const image = preferredSystem?.item.images.find(Boolean) || systems
    .flatMap(({ item }) => item.images)
    .find(Boolean);

  return {
    id: skillId,
    title: metadata.title || get_skillset_label(skillId),
    description: metadata.description || '',
    systemCount: systems.length,
    projectCount: projectIds.length,
    technologies,
    image,
  };
}

function createExpertiseCard(expertise) {
  const article = document.createElement('article');
  article.className = 'expertise-card';

  const link = document.createElement('a');
  link.className = 'expertise-card-link';
  link.href = `/skillsets/${expertise.id}`;
  link.addEventListener('click', event => {
    if (event.button === 1 || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    page.show(`/skillsets/${expertise.id}`);
  });

  const media = document.createElement('div');
  media.className = 'expertise-card-media';
  if (expertise.image) {
    const image = document.createElement('img');
    image.src = `/images/${expertise.image}`;
    image.alt = '';
    image.loading = 'lazy';
    media.appendChild(image);
  }

  const content = document.createElement('div');
  content.className = 'expertise-card-content';

  const title = document.createElement('h2');
  title.textContent = expertise.title;

  const description = document.createElement('p');
  description.className = 'expertise-card-description';
  description.textContent = expertise.description;

  const technologies = document.createElement('div');
  technologies.className = 'expertise-card-technologies';
  expertise.technologies.slice(0, 5).forEach(value => {
    const tag = document.createElement('span');
    tag.textContent = value === 'Unreal' ? 'Unreal Engine' : value;
    technologies.appendChild(tag);
  });

  const footer = document.createElement('div');
  footer.className = 'expertise-card-footer';
  footer.innerHTML = `
    <span>${expertise.projectCount} project${expertise.projectCount === 1 ? '' : 's'} · ${expertise.systemCount} system${expertise.systemCount === 1 ? '' : 's'}</span>
    <strong>Explore expertise &rarr;</strong>
  `;

  content.append(title, description, technologies, footer);
  link.append(media, content);
  article.appendChild(link);
  return article;
}

async function initializeExpertisePage(portfolioManager) {
  const container = document.getElementById('expertiseGrid');
  if (!container) return;

  const metadata = await loadExpertiseMetadata();
  const availableSkills = new Set(portfolioManager.getUniqueSkillsets());
  const models = EXPERTISE_ORDER
    .filter(skillId => availableSkills.has(skillId))
    .map(skillId => buildExpertiseModel(portfolioManager, skillId, metadata[skillId] || {}));

  container.innerHTML = '';
  models.forEach(model => container.appendChild(createExpertiseCard(model)));
}
