/**
 * Tech Stack Chips Component
 * 
 * Renders a draggable, categorized tech stack visualization
 * with color-coded chips for different tech categories.
 * 
 * Usage:
 *   renderTechStackChips(containerId, techData, skillsetName)
 * 
 * techData format:
 *   {
 *     editor_tools: ['Qt', 'PySide6', ...],
 *     procedural: ['Houdini HDAs', ...],
 *     graphics_vfx: ['Niagara', ...],
 *     runtime_simulation: ['Chaos Physics', ...],
 *     pipeline_integration: ['REST API', ...],
 *     engines: ['Unreal', 'Unity'],
 *     dccs: ['Houdini', 'Maya'],
 *     languages: ['Python', 'C++']
 *   }
 */

// ============================================
// CATEGORY CONFIGURATION
// ============================================

const TECH_CATEGORIES = {
  editor_tools: {
    label: 'Editor',
    color: '#06b6d4'  // Cyan
  },
  procedural: {
    label: 'Procedural',
    color: '#22c55e'  // Green
  },
  graphics_vfx: {
    label: 'Graphics',
    color: '#a855f7'  // Purple
  },
  runtime_simulation: {
    label: 'Runtime',
    color: '#ec4899'  // Pink
  },
  pipeline_integration: {
    label: 'Pipeline',
    color: '#f59e0b'  // Amber
  },
  engines: {
    label: 'Engines',
    color: '#ff6b6b'  // Red
  },
  dccs: {
    label: 'DCCs',
    color: '#f97316'  // Orange
  },
  languages: {
    label: 'Languages',
    color: '#ffd93d'  // Yellow
  }
};

// ============================================
// MAIN RENDER FUNCTION
// ============================================

/**
 * Render the tech stack chips component
 * @param {string} containerId - ID of the container element
 * @param {Object} techData - Object with category keys and arrays of tech items
 * @param {string} skillsetName - Name of the skillset (for the title)
 */
function renderTechStackChips(containerId, techData, skillsetName) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('[TechStackChips] Container not found:', containerId);
    return;
  }

  // Build flat array with category info
  const allChips = [];
  
  Object.entries(techData).forEach(([category, items]) => {
    if (!items || !Array.isArray(items) || items.length === 0) return;
    
    items.forEach(item => {
      allChips.push({
        name: item,
        category: category,
        color: TECH_CATEGORIES[category]?.color || '#888'
      });
    });
  });

  // Shuffle for visual variety
  allChips.sort(() => Math.random() - 0.5);

  // Build legend items (only categories that have items)
  const legendHtml = Object.entries(techData)
    .filter(([_, items]) => items && items.length > 0)
    .map(([category, _]) => {
      const config = TECH_CATEGORIES[category];
      if (!config) return '';
      return `<span class="tsc-legend-item">
        <span class="tsc-legend-dot" style="background: ${config.color};"></span>${config.label}
      </span>`;
    })
    .join('');

  // Build chips HTML
  const chipsHtml = allChips.map((chip, i) => {
    const delay = (Math.random() * 2).toFixed(2);
    const duration = (2 + Math.random() * 2).toFixed(2);
    return `<span class="tsc-chip tsc-category-${chip.category}" 
                  style="--delay: ${delay}s; --duration: ${duration}s;">
      ${chip.name}
    </span>`;
  }).join('');

  console.log(`[TechStackChips] Building component with ${allChips.length} chips`);
  console.log(`[TechStackChips] techData:`, techData);
  console.log(`[TechStackChips] allChips:`, allChips);

  // Render complete component
  container.innerHTML = `
    <div class="tsc-header">
      <div class="tsc-title">TECH STACK: ${skillsetName.toUpperCase()}</div>
      <div class="tsc-legend">${legendHtml}</div>
    </div>
    <div class="tsc-container">
      <div class="tsc-content" id="${containerId}-content">
        ${chipsHtml}
      </div>
      <div class="tsc-scroll-indicator">
        <div class="tsc-scroll-icon">
          <span class="tsc-scroll-arrow up">‹</span>
          <span class="tsc-scroll-dots">•••</span>
          <span class="tsc-scroll-arrow down">›</span>
        </div>
      </div>
    </div>
  `;

  // Setup drag-to-scroll
  setupTechStackDrag(container);

  console.log(`[TechStackChips] Rendered ${allChips.length} chips for "${skillsetName}"`);
}

// ============================================
// DRAG TO SCROLL
// ============================================

function setupTechStackDrag(wrapper) {
  const container = wrapper.querySelector('.tsc-container');
  const content = wrapper.querySelector('.tsc-content');
  
  if (!container || !content) return;

  let isDragging = false;
  let startY = 0;
  let scrollY = 0;
  let currentY = 0;

  container.addEventListener('mousedown', (e) => {
    if (e.target.closest('.tsc-legend')) return;
    isDragging = true;
    startY = e.clientY;
    container.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startY;
    currentY = scrollY + deltaY;

    // Clamp to bounds
    const contentHeight = content.scrollHeight;
    const containerHeight = container.clientHeight;
    const maxScroll = 0;
    const minScroll = Math.min(0, containerHeight - contentHeight - 20);
    currentY = Math.max(minScroll, Math.min(maxScroll, currentY));

    content.style.transform = `translateY(${currentY}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      scrollY = currentY;
      container.style.cursor = 'grab';
    }
  });

  // Touch support
  container.addEventListener('touchstart', (e) => {
    if (e.target.closest('.tsc-legend')) return;
    isDragging = true;
    startY = e.touches[0].clientY;
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    currentY = scrollY + deltaY;

    const contentHeight = content.scrollHeight;
    const containerHeight = container.clientHeight;
    const maxScroll = 0;
    const minScroll = Math.min(0, containerHeight - contentHeight - 20);
    currentY = Math.max(minScroll, Math.min(maxScroll, currentY));

    content.style.transform = `translateY(${currentY}px)`;
  });

  document.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
      scrollY = currentY;
    }
  });
}

// ============================================
// HELPER: Aggregate tech from portfolio items
// ============================================

/**
 * Aggregate tech data from portfolio items into categorized structure
 * @param {Array} portfolioItems - Array of portfolio item objects
 * @returns {Object} Aggregated tech by category
 */
function aggregateTechFromItems(portfolioItems) {
  const techData = {
    editor_tools: new Set(),
    procedural: new Set(),
    graphics_vfx: new Set(),
    runtime_simulation: new Set(),
    pipeline_integration: new Set(),
    engines: new Set(),
    dccs: new Set(),
    languages: new Set()
  };

  portfolioItems.forEach(item => {
    // Handle new categorized tech structure (object)
    if (item.tech && typeof item.tech === 'object' && !Array.isArray(item.tech)) {
      Object.entries(item.tech).forEach(([category, items]) => {
        if (techData[category] && Array.isArray(items)) {
          items.forEach(t => techData[category].add(t));
        }
      });
    }
    // Handle legacy flat array structure
    else if (Array.isArray(item.tech)) {
      item.tech.forEach(t => techData.pipeline_integration.add(t));
    }

    // Standard fields
    (item.engine || []).forEach(e => techData.engines.add(e));
    (item.dcc || []).forEach(d => techData.dccs.add(d));
    (item.languages || []).forEach(l => techData.languages.add(l));
  });

  // Convert Sets to Arrays
  return Object.fromEntries(
    Object.entries(techData).map(([key, set]) => [key, [...set]])
  );
}

// Make functions globally available
window.renderTechStackChips = renderTechStackChips;
window.aggregateTechFromItems = aggregateTechFromItems;
window.TECH_CATEGORIES = TECH_CATEGORIES;
