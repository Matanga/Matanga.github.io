/**
 * Project Page - Layout Implementation
 * 
 * Renders the project page layout:
 * Impact → Responsibilities → Contributions → Evidence
 */

// ============================================
// STATE
// ============================================

let currentProject = null;
let selectedContributionId = null;

// ============================================
// RENDER FUNCTIONS
// ============================================

/**
 * Render the complete project page
 */
function renderProjectPage(viewModel) {
  currentProject = viewModel;
  
  // Render header section
  renderHeader(viewModel.header, viewModel.visibility);
  
  // Render responsibilities
  renderResponsibilities(viewModel.responsibilities);
  
  // Render contributions list
  renderContributionsList(viewModel.contributions);
  
  // Select first contribution by default
  if (viewModel.contributions.length > 0) {
    selectContribution(viewModel.contributions[0].id);
  }
  
  // Store details for "deep dive" toggle
  window._projectDetails = viewModel.details;
}

/**
 * Render the header block
 */
function renderHeader(header, visibility) {
  // Background image (from first portfolio item)
  const headerEl = document.querySelector('.proj-header');
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
  
  // Title
  const titleEl = document.getElementById('proj-project-title');
  if (titleEl) titleEl.textContent = header.title;
  
  // Impact statement (always visible)
  const impactEl = document.getElementById('proj-project-impact');
  if (impactEl) impactEl.textContent = header.impact;
  
  // Meta chips
  const metaEl = document.getElementById('proj-project-meta');
  if (metaEl) {
    const chips = [];
    
    if (header.role) {
      chips.push(`<span class="proj-chip proj-chip-role">${header.role}</span>`);
    }
    if (header.platform && header.platform.length > 0) {
      chips.push(`<span class="proj-chip proj-chip-platform">${header.platform.join(', ')}</span>`);
    }
    if (header.mediaType) {
      chips.push(`<span class="proj-chip proj-chip-media">${header.mediaType}</span>`);
    }
    
    metaEl.innerHTML = chips.join('');
  }
  
  // Tech line
  const techLineEl = document.getElementById('proj-tech-line');
  if (techLineEl && header.techLine) {
    techLineEl.textContent = header.techLine;
  }
  
  // Client/Company (if not undisclosed)
  const visibilityEl = document.getElementById('proj-visibility');
  if (visibilityEl) {
    const parts = [];
    if (visibility.client && visibility.client.toLowerCase() !== 'undisclosed') {
      parts.push(`Client: ${visibility.client}`);
    }
    if (visibility.company && visibility.company.toLowerCase() !== 'undisclosed') {
      parts.push(`Company: ${visibility.company}`);
    }
    visibilityEl.textContent = parts.join(' · ');
    visibilityEl.style.display = parts.length > 0 ? 'block' : 'none';
  }
}

/**
 * Render the responsibilities card
 */
function renderResponsibilities(responsibilities) {
  const container = document.getElementById('proj-responsibilities-list');
  if (!container) return;
  
  if (!responsibilities || responsibilities.length === 0) {
    container.innerHTML = '<li class="proj-responsibility-item">No responsibilities defined</li>';
    return;
  }
  
  container.innerHTML = responsibilities
    .map(r => `<li class="proj-responsibility-item">${r}</li>`)
    .join('');
}

/**
 * Render the contributions list (cards) in horizontal carousel with thumbnails
 */
function renderContributionsList(contributions) {
  const container = document.getElementById('proj-contributions-list');
  if (!container) return;
  
  if (!contributions || contributions.length === 0) {
    container.innerHTML = '<div class="proj-no-contributions">No contributions defined</div>';
    return;
  }
  
  const colorSelector = new NonRepeatRandomColorSelector();
  
  container.innerHTML = contributions.map(contrib => {
    const color = colorSelector.getRandomColor();
    const statusBadge = contrib.status === 'wip' 
      ? '<span class="proj-status-badge proj-status-wip">WIP</span>' 
      : '';
    
    const tags = contrib.tags.slice(0, 3).map(tag => 
      `<span class="proj-tag">${tag}</span>`
    ).join('');
    
    // Get thumbnail - prefer images over YouTube
    let thumbnailHtml = '';
    const firstImage = contrib.evidence.find(e => e.type === 'image');
    const firstYoutube = contrib.evidence.find(e => e.type === 'youtube');
    
    if (firstImage) {
      const imgSrc = firstImage.src.startsWith('http') 
        ? firstImage.src 
        : `https://matanga.github.io/images/${firstImage.src}`;
      thumbnailHtml = `<div class="proj-card-thumbnail" style="background-image: url('${imgSrc}')"></div>`;
    } else if (firstYoutube) {
      const videoId = extractYouTubeIdProj(firstYoutube.src);
      if (videoId) {
        thumbnailHtml = `<div class="proj-card-thumbnail" style="background-image: url('https://img.youtube.com/vi/${videoId}/maxresdefault.jpg')"><span class="proj-play-icon">&#9658;</span></div>`;
      }
    }
    
    return `
      <button class="proj-contribution-card" 
              data-contribution-id="${contrib.id}"
              style="--card-accent: ${color};"
              onclick="selectContribution('${contrib.id}', true)">
        <div class="proj-card-content">
          <div class="proj-contribution-header">
            <span class="proj-contribution-title">${contrib.title}</span>
            <span class="proj-selected-dot"></span>
            ${statusBadge}
          </div>
          <p class="proj-contribution-oneliner">${truncateTextProj(contrib.oneLiner, 100)}</p>
          <div class="proj-card-cta">&#8594; View system</div>
        </div>
        ${thumbnailHtml}
        <div class="proj-contribution-tags">${tags}</div>
      </button>
    `;
  }).join('');
  
  // Setup drag-to-scroll for mouse users
  setupProjectCarouselDrag(container);
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeIdProj(url) {
  if (!url) return null;
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

/**
 * Truncate text with ellipsis
 */
function truncateTextProj(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Setup drag-to-scroll for the project carousel
 */
function setupProjectCarouselDrag(carousel) {
  let isDown = false;
  let startX;
  let scrollLeft;
  let hasMoved = false;
  const dragThreshold = 5;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    hasMoved = false;
    startX = e.pageX;
    scrollLeft = carousel.scrollLeft;
    carousel.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', (e) => {
    if (!isDown) return;
    
    const wasDown = isDown;
    const didMove = hasMoved;
    isDown = false;
    carousel.classList.remove('proj-carousel-dragging');
    carousel.style.cursor = 'grab';
    
    if (wasDown && didMove) {
      e.preventDefault();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    
    const x = e.pageX;
    const distance = Math.abs(x - startX);
    
    if (distance > dragThreshold) {
      if (!hasMoved) {
        hasMoved = true;
        carousel.classList.add('proj-carousel-dragging');
      }
      e.preventDefault();
      const walk = (x - startX) * 1.5;
      carousel.scrollLeft = scrollLeft - walk;
    }
  });

  carousel.addEventListener('click', (e) => {
    if (hasMoved) {
      e.stopPropagation();
      hasMoved = false;
    }
  }, true);
}

/**
 * Select a contribution and show its details
 * @param {string} contributionId - The contribution ID to select
 * @param {boolean} isUserClick - Whether this was triggered by a user click (enables scroll + animation)
 */
function selectContribution(contributionId, isUserClick) {
  if (!currentProject) return;
  
  selectedContributionId = contributionId;
  
  // Update card selection state and find the clicked card
  let clickedCard = null;
  document.querySelectorAll('.proj-contribution-card').forEach(card => {
    const isSelected = card.dataset.contributionId === contributionId;
    card.classList.toggle('selected', isSelected);
    if (isSelected) clickedCard = card;
  });
  
  // Find the contribution
  const contribution = currentProject.contributions.find(c => c.id === contributionId);
  if (!contribution) return;
  
  renderContributionDetail(contribution);
  
  // Only scroll and animate on user clicks, not on initial page load
  if (isUserClick === true && clickedCard) {
    // Scroll the clicked card to near the top of the viewport
    const cardRect = clickedCard.getBoundingClientRect();
    const scrollOffset = window.scrollY + cardRect.top - 60; // 60px padding from top (accounts for topbar)
    window.scrollTo({ top: scrollOffset, behavior: 'smooth' });
    
    // Trigger border pulse animation on the detail section
    const detailSection = document.querySelector('.proj-detail');
    if (detailSection) {
      detailSection.classList.remove('content-loaded');
      // Force reflow to restart animation
      void detailSection.offsetWidth;
      detailSection.classList.add('content-loaded');
    }
  }
}

/**
 * Render the selected contribution's detail panel
 */
function renderContributionDetail(contribution) {
  // Title
  const titleEl = document.getElementById('proj-detail-title');
  if (titleEl) titleEl.textContent = contribution.title;
  
  // One-liner
  const onelinerEl = document.getElementById('proj-detail-oneliner');
  if (onelinerEl) onelinerEl.textContent = contribution.oneLiner;
  
  // What I Built (bullet points)
  const builtEl = document.getElementById('proj-detail-built');
  if (builtEl) {
    if (contribution.whatIBuilt && contribution.whatIBuilt.length > 0) {
      builtEl.innerHTML = `
        <h5 class="proj-detail-subheading">What I Built</h5>
        <ul class="proj-built-list">
          ${contribution.whatIBuilt.map(item => `<li>${item}</li>`).join('')}
        </ul>
      `;
      builtEl.style.display = 'block';
    } else {
      builtEl.style.display = 'none';
    }
  }
  
  // Deep dive (if available)
  const deepDiveEl = document.getElementById('proj-detail-deepdive');
  const deepDiveBtn = document.getElementById('proj-deepdive-btn');
  if (deepDiveEl && deepDiveBtn) {
    if (contribution.deepDive) {
      deepDiveBtn.style.display = 'inline-block';
      deepDiveBtn.onclick = () => toggleDeepDive(contribution.deepDive);
      deepDiveEl.innerHTML = ''; // Clear until toggled
      deepDiveEl.style.display = 'none';
    } else {
      deepDiveBtn.style.display = 'none';
      deepDiveEl.style.display = 'none';
    }
  }
  
  // Evidence gallery
  renderEvidence(contribution.evidence);
}

/**
 * Toggle the deep dive section
 */
function toggleDeepDive(deepDive) {
  const el = document.getElementById('proj-detail-deepdive');
  const btn = document.getElementById('proj-deepdive-btn');
  if (!el || !deepDive) return;
  
  if (el.style.display === 'none' || el.style.display === '') {
    el.innerHTML = `
      <div class="proj-deepdive-content">
        <div class="proj-deepdive-problem">
          <h5>Problem</h5>
          <p>${deepDive.problem || 'Not specified'}</p>
        </div>
        <div class="proj-deepdive-approach">
          <h5>Approach</h5>
          ${Array.isArray(deepDive.approach) 
            ? `<ul>${deepDive.approach.map(a => `<li>${a}</li>`).join('')}</ul>`
            : `<p>${deepDive.approach || 'Not specified'}</p>`
          }
        </div>
      </div>
    `;
    el.style.display = 'block';
    btn.textContent = 'Hide Technical Details';
  } else {
    el.style.display = 'none';
    btn.textContent = 'View Technical Details';
  }
}

/**
 * Toggle project-level challenges & solutions
 */
function toggleProjectDetails() {
  const el = document.getElementById('proj-project-details');
  const btn = document.getElementById('proj-project-details-btn');
  if (!el || !window._projectDetails) return;
  
  const details = window._projectDetails;
  
  if (el.style.display === 'none' || el.style.display === '') {
    el.innerHTML = `
      <div class="proj-project-details-content">
        ${details.context ? `
          <div class="proj-detail-section">
            <h5>Context</h5>
            <p>${details.context}</p>
          </div>
        ` : ''}
        ${details.challenges && details.challenges.length > 0 ? `
          <div class="proj-detail-section">
            <h5>Challenges</h5>
            <ul>${details.challenges.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>
        ` : ''}
        ${details.solutions && details.solutions.length > 0 ? `
          <div class="proj-detail-section">
            <h5>Solutions</h5>
            <ul>${details.solutions.map(s => `<li>${s}</li>`).join('')}</ul>
          </div>
        ` : ''}
      </div>
    `;
    el.style.display = 'block';
    btn.textContent = 'Hide Project Details';
  } else {
    el.style.display = 'none';
    btn.textContent = 'View Challenges & Solutions';
  }
}

/**
 * Render the evidence gallery
 */
function renderEvidence(evidence) {
  const container = document.getElementById('proj-evidence-gallery');
  if (!container) return;
  
  if (!evidence || evidence.length === 0) {
    container.innerHTML = '<div class="proj-no-evidence">No media available</div>';
    return;
  }
  
  // Separate by type - videos first, then images
  const videos = evidence.filter(e => e.type === 'youtube');
  const images = evidence.filter(e => e.type === 'image');
  
  let html = '';
  
  // Videos
  if (videos.length > 0) {
    html += '<div class="proj-evidence-videos">';
    videos.forEach(video => {
      html += `
        <div class="proj-evidence-item proj-evidence-video">
          <div class="proj-video-wrapper">
            <iframe src="${video.src}" 
                    title="Video" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
            </iframe>
          </div>
          ${video.caption ? `<p class="proj-evidence-caption">${video.caption}</p>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }
  
  // Images
  if (images.length > 0) {
    html += '<div class="proj-evidence-images">';
    images.forEach(image => {
      // Handle both relative and absolute paths
      const src = image.src.startsWith('http') 
        ? image.src 
        : `/images/${image.src}`;
      
      html += `
        <div class="proj-evidence-item proj-evidence-image">
          <img src="${src}" alt="${image.caption || 'Project image'}" loading="lazy" onclick="openImageModal('${src}')">
          ${image.caption ? `<p class="proj-evidence-caption">${image.caption}</p>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }
  
  container.innerHTML = html;
}

/**
 * Simple image modal
 */
function openImageModal(src) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('proj-image-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'proj-image-modal';
    modal.className = 'proj-modal';
    modal.innerHTML = `
      <div class="proj-modal-content">
        <span class="proj-modal-close" onclick="closeImageModal()">&times;</span>
        <img id="proj-modal-image" src="" alt="Full size image">
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeImageModal();
    });
  }
  
  document.getElementById('proj-modal-image').src = src;
  modal.style.display = 'flex';
}

function closeImageModal() {
  const modal = document.getElementById('proj-image-modal');
  if (modal) modal.style.display = 'none';
}

// ============================================
// MAIN LOADER
// ============================================

/**
 * Build tech line string from portfolio items
 */
function buildTechLine(items) {
  const engines = new Set();
  const dccs = new Set();
  const languages = new Set();
  
  items.forEach(item => {
    (item.engine || []).forEach(e => engines.add(e));
    (item.dcc || []).forEach(d => dccs.add(d));
    (item.languages || []).forEach(l => languages.add(l));
  });
  
  const parts = [];
  if (engines.size > 0) parts.push(Array.from(engines).join(', '));
  if (dccs.size > 0) parts.push(Array.from(dccs).join(', '));
  if (languages.size > 0) parts.push(Array.from(languages).join(', '));
  return parts.join(' · ');
}

/**
 * Build evidence array from portfolio item media
 */
function buildEvidence(item) {
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

/**
 * Load and render a project
 * 
 * @param {string} projectId - The project ID to load
 */
async function LoadProject(projectId) {
  // Scroll to top when loading a new project
  window.scrollTo(0, 0);
  
  if (!globalPortfolioManager) {
    console.error('[ProjectPage] PortfolioManager not initialized');
    return;
  }
  
  const project = globalPortfolioManager.projects[projectId];
  if (!project) {
    console.error(`[ProjectPage] Project "${projectId}" not found`);
    return;
  }
  
  // Get portfolio items for this project
  const items = [];
  (project.portfolioitems || []).forEach(itemId => {
    const item = globalPortfolioManager.portfolioItems[itemId];
    if (item) items.push({ id: itemId, ...item });
  });
  
  // Sort by priority
  items.sort((a, b) => (a.priority || 999) - (b.priority || 999));
  
  // Get first image from first portfolio item for header background
  let headerBackgroundImage = null;
  if (items.length > 0 && items[0].images && items[0].images.length > 0) {
    headerBackgroundImage = items[0].images[0];
  }
  
  // Build view model directly from data
  const viewModel = {
    id: projectId,
    header: {
      title: project.name,
      impact: project.impact || '',
      role: project.involvement,
      platform: Array.isArray(project.platform) ? project.platform : [project.platform],
      mediaType: project.media,
      techLine: buildTechLine(items),
      backgroundImage: headerBackgroundImage
    },
    visibility: {
      client: project.client,
      company: project.company
    },
    responsibilities: project.responsibilities || [],
    details: {
      context: project.context,
      challenges: project.challenges ? [project.challenges] : [],
      solutions: project.solutions ? [project.solutions] : []
    },
    contributions: items.map(item => ({
      id: item.id,
      title: item.name,
      oneLiner: item.oneLiner || '',
      status: item.status || 'complete',
      tags: item.tags || item.skillsets || [],
      whatIBuilt: item.bulletpoints || [],
      evidence: buildEvidence(item),
      deepDive: item.deepDive || null
    }))
  };
  
  console.log('[ProjectPage] Loaded:', viewModel);
  
  // Render
  renderProjectPage(viewModel);
  
  // Show the projects tab
  OpenTab('projects');
}

// ============================================
// EXPORTS
// ============================================

window.ProjectPage = {
  load: LoadProject,
  render: renderProjectPage,
  selectContribution,
  toggleDeepDive,
  toggleProjectDetails,
  openImageModal,
  closeImageModal
};

// Also expose directly for onclick handlers
window.selectContribution = selectContribution;
window.toggleProjectDetails = toggleProjectDetails;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
