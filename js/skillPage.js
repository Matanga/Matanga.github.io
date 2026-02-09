/**
 * Skill Page - Renderer
 * 
 * Renders the Skill Page using the ViewModel from SkillPageAdapter
 */

// ============================================
// STATE
// ============================================

let currentSkillViewModel = null;
let currentSelectedSystemId = null;

// ============================================
// RENDER FUNCTIONS
// ============================================

/**
 * Render the skill header section
 */
function renderSkillHeader(header, skillId) {
  // Background image (from first portfolio item)
  const headerEl = document.querySelector('.skill-header-box');
  if (headerEl) {
    if (header.backgroundImage) {
      const imgSrc = header.backgroundImage.startsWith('http') 
        ? header.backgroundImage 
        : `/images/${header.backgroundImage}`;
      headerEl.style.backgroundImage = `url('${imgSrc}')`;
    } else {
      headerEl.style.backgroundImage = 'none';
    }
  }
  
  document.getElementById('skillTitle').textContent = header.title;
  document.getElementById('skillDescription').textContent = header.description;
  
  const statsText = `Used in ${header.stats.projectCount} project${header.stats.projectCount !== 1 ? 's' : ''} | ${header.stats.systemCount} system${header.stats.systemCount !== 1 ? 's' : ''} shipped`;
  document.getElementById('skillStats').textContent = statsText;

  // Render tech chips using the new TechStackChips component
  const chipsContainer = document.getElementById('skillTechChips');
  if (chipsContainer && header.techData && window.renderTechStackChips) {
    chipsContainer.innerHTML = ''; // Clear old content
    chipsContainer.classList.add('tech-stack-chips-wrapper');
    renderTechStackChips('skillTechChips', header.techData, skillId);
  } else {
    // Fallback to simple chips if component not loaded
    chipsContainer.innerHTML = header.techChips
      .map(chip => `<span class="skill-chip">${chip}</span>`)
      .join('');
  }
}

/**
 * Render a single system card for the carousel
 */
function renderSystemCard(system, isSelected = false) {
  const selectedClass = isSelected ? 'skill-card-selected' : '';
  const tagsHtml = system.tags
    .slice(0, 3)
    .map(tag => `<span class="skill-card-tag">${tag}</span>`)
    .join('');

  // Get thumbnail - prefer images over YouTube to avoid squashed video thumbnails
  let thumbnailHtml = '';
  const firstImage = system.evidence.find(e => e.type === 'image');
  const firstYoutube = system.evidence.find(e => e.type === 'youtube');
  
  if (firstImage) {
    // Prefer actual images for thumbnails
    const imgSrc = firstImage.src.startsWith('http') 
      ? firstImage.src 
      : `https://matanga.github.io/images/${firstImage.src}`;
    thumbnailHtml = `<div class="skill-card-thumbnail" style="background-image: url('${imgSrc}')"></div>`;
  } else if (firstYoutube) {
    // Fall back to YouTube thumbnail if no images available
    const videoId = extractYouTubeId(firstYoutube.src);
    if (videoId) {
      // Use maxresdefault for better quality, with sddefault fallback
      thumbnailHtml = `<div class="skill-card-thumbnail" style="background-image: url('https://img.youtube.com/vi/${videoId}/maxresdefault.jpg')"><span class="play-icon">&#9658;</span></div>`;
    }
  }

  return `
    <div class="skill-system-card ${selectedClass}" data-system-id="${system.id}" onclick="selectSystem('${system.id}', true)">
      <div class="skill-card-content">
        <h4 class="skill-card-title">${system.title}</h4>
        <p class="skill-card-description">${truncateText(system.oneLiner, 100)}</p>
        <button class="skill-card-cta">&#8594; View system</button>
      </div>
      ${thumbnailHtml}
      <div class="skill-card-tags">${tagsHtml}</div>
    </div>
  `;
}

/**
 * Render all systems in a horizontal carousel
 */
function renderSystemsCarousel(allSystems, selectedId) {
  const carousel = document.getElementById('skillCarousel');
  
  // Render all cards
  const cardsHtml = allSystems
    .map(system => renderSystemCard(system, system.id === selectedId))
    .join('');
  
  carousel.innerHTML = cardsHtml;

  // Setup drag-to-scroll for mouse users
  setupCarouselDrag(carousel);
}

/**
 * Render the selected system detail panel
 */
function renderSystemDetail(system) {
  if (!system) {
    document.getElementById('skillSystemDetail').style.display = 'none';
    return;
  }

  document.getElementById('skillSystemDetail').style.display = 'block';
  document.getElementById('skillSystemTitle').textContent = system.title;

  // Project link (below title)
  const projectLinkEl = document.getElementById('skillProjectLink');
  if (projectLinkEl) {
    if (system.projectId && system.projectName) {
      projectLinkEl.innerHTML = `From: <a href="/projects/${system.projectId}" onclick="event.preventDefault(); page.show('/projects/${system.projectId}')">${system.projectName}</a> →`;
      projectLinkEl.style.display = 'block';
    } else {
      projectLinkEl.style.display = 'none';
    }
  }

  // Status badge (if applicable)
  const statusEl = document.getElementById('skillSystemStatus');
  if (system.status === 'wip') {
    statusEl.textContent = 'In Progress';
    statusEl.style.display = 'inline-block';
  } else {
    statusEl.style.display = 'none';
  }

  // Primary showcase (first video or image)
  renderPrimaryShowcase(system.evidence);

  // What I Built section
  renderWhatIBuilt(system.whatIBuilt);

  // Additional showcase
  renderAdditionalShowcase(system.evidence);
}

/**
 * Render primary showcase (first item)
 */
function renderPrimaryShowcase(showcase) {
  const container = document.getElementById('skillPrimaryShowcase');
  const captionEl = document.getElementById('skillShowcaseCaption');

  if (!showcase || showcase.length === 0) {
    container.innerHTML = '<p class="no-showcase">No showcase available</p>';
    captionEl.textContent = '';
    return;
  }

  const primary = showcase[0];

  if (primary.type === 'youtube') {
    container.innerHTML = `
      <div class="skill-video-wrapper">
        <iframe 
          src="${primary.src}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
  } else if (primary.type === 'image') {
    const imgSrc = primary.src.startsWith('http') 
      ? primary.src 
      : `https://matanga.github.io/images/${primary.src}`;
    container.innerHTML = `<img class="skill-primary-image" src="${imgSrc}" alt="${primary.caption || 'Showcase'}" onclick="openImageModal('${imgSrc}')" style="cursor: pointer;">`;
  }

  captionEl.textContent = primary.caption || '';
}

/**
 * Render What I Built bullets
 */
function renderWhatIBuilt(bullets) {
  const container = document.getElementById('skillWhatIBuilt');
  const listEl = document.getElementById('skillBulletList');

  if (!bullets || bullets.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  listEl.innerHTML = bullets
    .map(bullet => `<li>${bullet}</li>`)
    .join('');

  // Reset collapsed state
  document.getElementById('skillDetailsContent').style.display = 'none';
  updateToggleArrow('skillDetailsToggle', false);
}

/**
 * Render additional showcase gallery
 */
function renderAdditionalShowcase(showcase) {
  const container = document.getElementById('skillAdditionalShowcase');
  const gallery = document.getElementById('skillShowcaseGallery');

  // Skip first item (primary) and get rest
  const additional = showcase.slice(1);

  if (additional.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  gallery.innerHTML = additional.map(item => {
    if (item.type === 'youtube') {
      return `
        <div class="skill-gallery-item skill-gallery-video">
          <iframe src="${item.src}" frameborder="0" allowfullscreen></iframe>
          ${item.caption ? `<p class="skill-gallery-caption">${item.caption}</p>` : ''}
        </div>
      `;
    } else if (item.type === 'image') {
      const imgSrc = item.src.startsWith('http') 
        ? item.src 
        : `https://matanga.github.io/images/${item.src}`;
      return `
        <div class="skill-gallery-item">
          <img src="${imgSrc}" alt="${item.caption || 'Showcase'}" onclick="openImageModal('${imgSrc}')" style="cursor: pointer;">
          ${item.caption ? `<p class="skill-gallery-caption">${item.caption}</p>` : ''}
        </div>
      `;
    }
    return '';
  }).join('');
}

// ============================================
// INTERACTION HANDLERS
// ============================================

/**
 * Select a system and update the detail view
 * @param {string} systemId - The system ID to select
 * @param {boolean} isUserClick - Whether this was triggered by a user click (enables scroll + animation)
 */
function selectSystem(systemId, isUserClick = false) {
  if (!currentSkillViewModel) return;

  currentSelectedSystemId = systemId;

  // Find the system
  const system = currentSkillViewModel.systems.find(s => s.id === systemId);

  if (!system) {
    console.warn('[SkillPage] System not found:', systemId);
    return;
  }

  // Update selected state in all cards and find clicked card
  let clickedCard = null;
  let cardIndex = -1;
  const allCards = document.querySelectorAll('.skill-system-card');
  allCards.forEach((card, index) => {
    const isSelected = card.dataset.systemId === systemId;
    card.classList.toggle('skill-card-selected', isSelected);
    if (isSelected && !clickedCard) {
      clickedCard = card;
      cardIndex = index;
    }
  });

  // Render the detail
  renderSystemDetail(system);

  // Scroll and animate (both for user clicks and initial load for horizontal centering)
  if (clickedCard) {
    // Scroll the card horizontally to center it in the carousel (unless it's the first card)
    scrollSkillCardToCenter(clickedCard, cardIndex, isUserClick);
    
    // Only do vertical scroll and animations on user clicks
    if (isUserClick) {
      // Scroll the clicked card to near the top of the viewport
      const cardRect = clickedCard.getBoundingClientRect();
      const scrollOffset = window.scrollY + cardRect.top - 60; // 60px padding from top (accounts for topbar)
      window.scrollTo({ top: scrollOffset, behavior: 'smooth' });
      
      // Trigger highlight animation on the clicked card
      triggerSkillCardHighlight(clickedCard);

      // Trigger border pulse animation on the detail section
      const detailSection = document.getElementById('skillSystemDetail');
      if (detailSection) {
        detailSection.classList.remove('content-loaded');
        // Force reflow to restart animation
        void detailSection.offsetWidth;
        detailSection.classList.add('content-loaded');
      }
    }
  }
}

/**
 * Scroll a skill card to the center of its carousel container
 * @param {HTMLElement} card - The card element to center
 * @param {number} cardIndex - The index of the card (0 = first)
 * @param {boolean} animate - Whether to animate the scroll
 */
function scrollSkillCardToCenter(card, cardIndex, animate = true) {
  const carousel = document.getElementById('skillCarousel');
  if (!carousel || !card) return;
  
  // Skip centering for the first card - it's locked at the start
  if (cardIndex === 0) return;
  
  // Calculate the scroll position to center the card
  const carouselRect = carousel.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  
  // Calculate where the card should be (center of carousel)
  const carouselCenter = carouselRect.width / 2;
  const cardCenter = cardRect.width / 2;
  
  // Current position of card relative to carousel
  const cardLeftInCarousel = card.offsetLeft;
  
  // Target scroll position: card's left position minus the offset needed to center it
  const targetScroll = cardLeftInCarousel - carouselCenter + cardCenter;
  
  // Clamp to valid scroll range
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));
  
  if (animate) {
    carousel.scrollTo({ left: clampedScroll, behavior: 'smooth' });
  } else {
    carousel.scrollLeft = clampedScroll;
  }
}

/**
 * Trigger highlight animation on a skill card
 * @param {HTMLElement} card - The card element
 */
function triggerSkillCardHighlight(card) {
  if (!card) return;
  
  // Remove from all cards first
  document.querySelectorAll('.skill-system-card').forEach(c => {
    c.classList.remove('card-highlight-pulse');
  });
  
  // Force reflow to restart animation
  void card.offsetWidth;
  
  // Add animation class
  card.classList.add('card-highlight-pulse');
}

/**
 * Setup drag-to-scroll for the carousel (mouse support)
 * Uses document-level events so dragging continues even when mouse leaves the carousel
 */
function setupCarouselDrag(carousel) {
  let isDown = false;
  let startX;
  let scrollLeft;
  let hasMoved = false;
  const dragThreshold = 5; // pixels - movement below this is considered a click

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    hasMoved = false;
    startX = e.pageX;
    scrollLeft = carousel.scrollLeft;
    carousel.style.cursor = 'grabbing';
  });

  // Use document-level events so drag continues outside carousel bounds
  document.addEventListener('mouseup', (e) => {
    if (!isDown) return;
    
    const wasDown = isDown;
    const didMove = hasMoved;
    isDown = false;
    carousel.classList.remove('skill-carousel-dragging');
    carousel.style.cursor = 'grab';
    
    // If it was a drag (not a click), prevent the click from firing
    if (wasDown && didMove) {
      e.preventDefault();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    
    const x = e.pageX;
    const distance = Math.abs(x - startX);
    
    // Only start dragging after threshold
    if (distance > dragThreshold) {
      if (!hasMoved) {
        hasMoved = true;
        carousel.classList.add('skill-carousel-dragging');
      }
      e.preventDefault();
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    }
  });

  // Prevent click if we were dragging
  carousel.addEventListener('click', (e) => {
    if (hasMoved) {
      e.stopPropagation();
      hasMoved = false;
    }
  }, true);
}

/**
 * Toggle the "What I Built" collapsed section
 */
function toggleWhatIBuilt() {
  const content = document.getElementById('skillDetailsContent');
  const isHidden = content.style.display === 'none';
  content.style.display = isHidden ? 'block' : 'none';
  updateToggleArrow('skillDetailsToggle', isHidden);
}

/**
 * Update toggle arrow direction
 */
function updateToggleArrow(buttonId, isExpanded) {
  const button = document.getElementById(buttonId);
  const arrow = button.querySelector('.toggle-arrow');
  if (arrow) {
    arrow.innerHTML = isExpanded ? '&#8744;' : '&#8250;';
  }
}

// ============================================
// UTILITIES
// ============================================

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function extractYouTubeId(url) {
  if (!url) return null;
  // Handle embed URLs
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  // Handle watch URLs
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  // Handle short URLs
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

// ============================================
// SKILLS DATA LOADER
// ============================================

const SKILLS_DB_PATH = "/db/skills.json";
let cachedSkillsData = null;

async function loadSkillsData() {
  if (cachedSkillsData !== null) return cachedSkillsData;
  
  try {
    const response = await fetch(SKILLS_DB_PATH);
    if (response.ok) {
      cachedSkillsData = await response.json();
    } else {
      cachedSkillsData = {};
    }
  } catch (e) {
    console.warn('[SkillPage] Could not load skills data:', e.message);
    cachedSkillsData = {};
  }
  return cachedSkillsData;
}

/**
 * Build evidence array from portfolio item
 */
function buildItemEvidence(item) {
  const evidence = [];
  const captions = item.captions || {};
  
  (item.youtube || []).forEach(src => {
    if (src && src.trim()) {
      evidence.push({ type: 'youtube', src, caption: captions[src] || null });
    }
  });
  
  (item.images || []).forEach(src => {
    if (src && src.trim()) {
      evidence.push({ type: 'image', src, caption: captions[src] || null });
    }
  });
  
  return evidence;
}

// ============================================
// MAIN ENTRY POINT
// ============================================

/**
 * Load and render a skill page
 */
async function LoadSkillPage(skillId) {
  // Scroll to top when loading a new skill page
  window.scrollTo(0, 0);
  
  console.log('[SkillPage] Loading skill:', skillId);

  // Load skills metadata
  const skillsData = await loadSkillsData();
  const skillMeta = skillsData[skillId] || {};

  // Check if we have globalPortfolioManager
  if (!globalPortfolioManager) {
    console.error('[SkillPage] PortfolioManager not initialized');
    return;
  }

  // Find all portfolio items that have this skill
  const portfolioItems = globalPortfolioManager.portfolioItems;
  const matchingItems = [];
  
  Object.keys(portfolioItems).forEach(itemId => {
    const item = portfolioItems[itemId];
    if (item.skillsets && item.skillsets.includes(skillId)) {
      matchingItems.push({ id: itemId, ...item });
    }
  });

  // Sort by priority first, then by date (newest first) as tiebreaker
  // Lower priority number = appears first. No priority defaults to 999.
  matchingItems.sort((a, b) => {
    const priorityA = a.priority || 999;
    const priorityB = b.priority || 999;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // Same priority: sort by date descending (newest first)
    return (b.date || '').localeCompare(a.date || '');
  });

  // Helper to find project ID for a portfolio item
  const findProjectId = (itemId) => {
    for (const [projectId, project] of Object.entries(globalPortfolioManager.projects)) {
      if (project.portfolioitems && project.portfolioitems.includes(itemId)) {
        return projectId;
      }
    }
    return null;
  };

  // Build system cards
  const buildSystemCard = (item) => {
    const projectId = findProjectId(item.id);
    const projectData = projectId ? globalPortfolioManager.projects[projectId] : null;
    return {
      id: item.id,
      title: item.name,
      projectId: projectId,
      projectName: projectData ? projectData.name : (item.projectname || ''),
      oneLiner: item.oneLiner || '',
      whatIBuilt: item.bulletpoints || [],
      tags: (item.tags || item.skillsets || []).slice(0, 4),
      evidence: buildItemEvidence(item),
      status: item.status || 'complete'
    };
  };

  const allSystems = matchingItems.map(buildSystemCard);

  // Aggregate tech - using new categorized structure
  const projects = new Set();
  
  // Use the TechStackChips helper if available, otherwise do it manually
  let techData;
  if (window.aggregateTechFromItems) {
    techData = aggregateTechFromItems(matchingItems);
  } else {
    // Fallback aggregation
    techData = {
      editor_tools: [],
      procedural: [],
      graphics_vfx: [],
      runtime_simulation: [],
      pipeline_integration: [],
      engines: [],
      dccs: [],
      languages: []
    };
    
    const sets = {
      editor_tools: new Set(),
      procedural: new Set(),
      graphics_vfx: new Set(),
      runtime_simulation: new Set(),
      pipeline_integration: new Set(),
      engines: new Set(),
      dccs: new Set(),
      languages: new Set()
    };
    
    matchingItems.forEach(item => {
      // Handle new categorized tech structure
      if (item.tech && typeof item.tech === 'object' && !Array.isArray(item.tech)) {
        Object.entries(item.tech).forEach(([category, items]) => {
          if (sets[category] && Array.isArray(items)) {
            items.forEach(t => sets[category].add(t));
          }
        });
      }
      (item.engine || []).forEach(e => sets.engines.add(e));
      (item.dcc || []).forEach(d => sets.dccs.add(d));
      (item.languages || []).forEach(l => sets.languages.add(l));
    });
    
    Object.keys(techData).forEach(key => {
      techData[key] = [...sets[key]];
    });
  }
  
  matchingItems.forEach(item => {
    if (item.projectname) projects.add(item.projectname);
  });

  // Flatten for fallback display
  const techChips = [
    ...techData.editor_tools,
    ...techData.procedural,
    ...techData.graphics_vfx,
    ...techData.runtime_simulation,
    ...techData.pipeline_integration,
    ...techData.engines,
    ...techData.dccs,
    ...techData.languages
  ];

  // Get first image from first system for header background
  let headerBackgroundImage = null;
  if (allSystems.length > 0) {
    const firstSystem = allSystems[0];
    const firstImage = firstSystem.evidence.find(e => e.type === 'image');
    if (firstImage) {
      headerBackgroundImage = firstImage.src;
    }
  }

  // Build view model
  const viewModel = {
    id: skillId,
    header: {
      title: skillMeta.title || skillId,
      description: skillMeta.description || '',
      stats: {
        projectCount: projects.size,
        systemCount: matchingItems.length
      },
      techChips: techChips,
      techData: techData,  // New categorized tech data
      backgroundImage: headerBackgroundImage
    },
    systems: allSystems,
    selectedSystemId: allSystems.length > 0 ? allSystems[0].id : null
  };

  currentSkillViewModel = viewModel;

  console.log('[SkillPage] ViewModel:', viewModel);

  // Render sections
  renderSkillHeader(viewModel.header, skillId);
  renderSystemsCarousel(viewModel.systems, viewModel.selectedSystemId);

  // Select initial system (use selectSystem to apply centering logic)
  if (viewModel.selectedSystemId) {
    // Use selectSystem with isUserClick=false to center without animations
    selectSystem(viewModel.selectedSystemId, false);
  }

  // Show the skillsets tab
  OpenTab("skillsets");
}

// Make globally available
window.LoadSkillPage = LoadSkillPage;
window.selectSystem = selectSystem;
window.toggleWhatIBuilt = toggleWhatIBuilt;
