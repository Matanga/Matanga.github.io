// Use root-relative paths (work on both local server and GitHub Pages)
const PROJECTDB = "/db/project_db.json";
const PORTFOLIOITEMDB = "/db/portfolio_item_db.json";
const HOMECONFIG = "/db/home_config.json";

// Global singleton instance
let globalPortfolioManager = null;

// Helper to close dropdowns on mobile and after clicking (fixes hover state persistence)
function closeDropdowns() {
  // Remove focus from any dropdown buttons to close the menu
  document.querySelectorAll('.dropdown .dropbtn').forEach(btn => btn.blur());
  // Also blur the active element in case it's inside a dropdown
  if (document.activeElement) document.activeElement.blur();
  
  // Force-close all dropdowns by adding the dropdown-closed class
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    dropdown.classList.add('dropdown-closed');
  });
}

// Setup dropdown reset handlers (call once after DOM is ready)
function setupDropdownResetHandlers() {
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    // Remove the closed class when mouse leaves, allowing hover to work again
    dropdown.addEventListener('mouseleave', function() {
      this.classList.remove('dropdown-closed');
    });
  });
}

class Project {
  constructor(data) {
    // New flat schema
    this.name = data.name;
    this.client = data.client;
    this.company = data.company;
    this.media = data.media;
    this.platform = data.platform;
    this.involvement = data.involvement;
    this.portfolioitems = data.portfolioitems;
    this.impact = data.impact;
    this.responsibilities = data.responsibilities || [];
    this.context = data.context;
    this.challenges = data.challenges;
    this.solutions = data.solutions;
  }
}

class PortfolioItem {
  constructor(data) {
    // New flat schema
    this.date = data.date;
    this.name = data.name;
    this.projectname = data.projectname;
    this.company = data.company;
    this.dcc = data.dcc || [];
    this.engine = data.engine || [];
    this.languages = data.languages || [];
    this.tech = data.tech || [];  // Specific frameworks, APIs, tools
    this.skillsets = data.skillsets || [];
    this.oneLiner = data.oneLiner;
    this.bulletpoints = data.bulletpoints || [];
    this.tags = data.tags || [];
    this.priority = data.priority || 999;
    this.status = data.status || 'complete';
    this.images = data.media?.image || [];
    this.youtube = data.media?.youtube || [];
    this.captions = data.media?.captions || {};
    this.deepDive = data.deepDive || null;
  }
}

class PortfolioManager {
  constructor(callback) {
    this.projects = {};
    this.portfolioItems = {};

    Promise.all([
      fetch(PROJECTDB)
        .then(response => response.json())
        .then(data => {
          Object.keys(data).forEach(key => {
            this.projects[key] = new Project(data[key]);
          });
        })
        .catch(error => console.error(`Failed to load project data: ${error}`)),
      fetch(PORTFOLIOITEMDB)
        .then(response => response.json())
        .then(data => {
          Object.keys(data).forEach(key => {
            this.portfolioItems[key] = new PortfolioItem(data[key]);
          });
        })
        .catch(error => console.error(`Failed to load portfolio item data: ${error}`))
    ]).then(() => {
      callback();
    });
  }

  getPortfolioItemsForProject(projectName) {
    const project = this.projects[projectName];
    if (!project) {
      console.error(`Project ${projectName} not found`);
      return [];
    }
    const portfolioItemNames = project.portfolioitems;
    const portfolioItems = [];
    portfolioItemNames.forEach(name => {
      const portfolioItem = this.portfolioItems[name];
      if (portfolioItem) {
        portfolioItems.push(portfolioItem);
      } else {
        console.error(`Portfolio item ${name} not found`);
      }
    });
    return portfolioItems;
  }

  getUniqueSkillsets() {
    const uniqueSkillsets = new Set();
    Object.values(this.portfolioItems).forEach(portfolioItem => {
      portfolioItem.skillsets.forEach(skillset => uniqueSkillsets.add(skillset));
    });
    return Array.from(uniqueSkillsets);
  }
}

class NonRepeatRandomColorSelector {
  constructor() {
    // V3.0 Semantic color palette
    this.colorsNames = ["structure", "success", "warning", "highlight"];
    this.colors = ["#4CC9F0", "#10B981", "#FFB703", "#fe3385"];

    this.lastTwoColors = [];
  }

  getRandomColor() {
    let newColor;
    do {
      newColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    } while (this.lastTwoColors.includes(newColor));
    this.lastTwoColors.push(newColor);
    if (this.lastTwoColors.length > 2) {
      this.lastTwoColors.shift();
    }
    return newColor;
  }
}

/*------------------------------------------------*/
/*-------------  Utilities --------------------*/

function get_skillset_label(skillset) {
    const skillsetLabels = {
        "tooldev": "Tool Development",
        "unrealdev": "Unreal Development",
        "unitydev": "Unity Development",
        "vr": "VR",
        "pipelinedev": "Pipeline Development",
        "artinstallation": "Art Installation",
        "proceduralgeneration": "Procedural Generation",
        "procgen": "Procedural Generation",
        "vfx": "VFX"
    };  
    return skillsetLabels[skillset] || skillset;
}

function getLoadReferences(key){

    const dictSkillsetsReferences =
    {
        'skillset': {
            "title":"skillsetItemTitle",
            "carousel":"skillsetCarousel",
            "description":"skillsetsMore",
            "youtube":"youtube-parentSkillset"
        },        
        'project': {
            "title":"projectsItemTitle",
            "carousel":"projectsCarousel",
            "description":"projectsItem",
            "youtube":"youtube-parent"
        }
    };
    return dictSkillsetsReferences[key];
}

function setSiteColor(color) {
  // V3.0: Update both legacy and new CSS variables for accent color
  
  // Update legacy variables (for backward compatibility)
  document.documentElement.style.setProperty('--main-color', color);
  document.documentElement.style.setProperty('--main-transparent', getTransparentColor(color));
  
  // Update V3.0 semantic variables
  document.documentElement.style.setProperty('--accent-structure', color);
  document.documentElement.style.setProperty('--accent-transparent', getTransparentColor(color));
  document.documentElement.style.setProperty('--accent-glow', getGlowColor(color));

  // Set the background color of the element with ID 'color_selector'
  const colorSelector = document.getElementById('color_selector');
  if (colorSelector) {
    colorSelector.style.backgroundColor = color;
  }
}

function getGlowColor(color) {
  // Parse the input color string into its RGB components
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Convert the RGB components into an RGBA string with opacity of 0.15 for glow
  return `rgba(${r}, ${g}, ${b}, 0.15)`;
}

function getTransparentColor(color) {
  // Parse the input color string into its RGB components
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Convert the RGB components into an RGBA string with opacity of 0.1
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}

/*------------------------------------------------*/
/*-------------  Dynamic HTML --------------------*/

function setCSSProperty(selector, property, value) {
  const elements = document.querySelectorAll(selector);
  for (let i = 0; i < elements.length; i++) {
    elements[i].style[property] = value;
  }
}

// Function to apply text to an element
function ApplyElementText(id, text) {

  document.getElementById(id).innerHTML = text;
}

function addVideosToElement(id, paths) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with id ${id} not found`);
    return;
  }
  element.innerHTML="";
  for (const path of paths) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('videoWrapper');
    const iframe = document.createElement('iframe');
    iframe.src = path;
    iframe.title = 'YouTube video player';
    iframe.allowFullscreen = true;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    wrapper.appendChild(iframe);
    element.appendChild(wrapper);
  }
}

/*------------------------------------------------*/
/*-------------  Dynamic Database Items --------------------*/

// Initialize Function to Create Project Links
function AddProjectButtons(pm,containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found`);
    return;
  }
  
  Object.keys(pm.projects).forEach(projectKey => {
    const project = pm.projects[projectKey];
    const link = document.createElement("a");
    link.setAttribute("class", "topbar-linkbtn loadBtn");
    link.setAttribute("href", "/projects/" + projectKey);
    link.setAttribute("data-project", projectKey);
    link.textContent = project.name;
    
    // Handle regular clicks with router, allow middle-click/ctrl+click for new tab
    link.addEventListener("click", function(e) {
      // Allow middle-click (button 1) and ctrl/cmd+click to open in new tab naturally
      if (e.button === 1 || e.ctrlKey || e.metaKey) {
        return; // Let the browser handle it
      }
      e.preventDefault();
      closeDropdowns();
      page.show('/projects/' + projectKey);
    });
    
    container.appendChild(link);
  });
}

// Initialize Function to Create Skillset Links
function AddSkillsetButtons(list,containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found`);
    return;
  }
  
  list.forEach(function(element) {
    const link = document.createElement("a");
    link.setAttribute("class", "topbar-linkbtn loadBtn");
    link.setAttribute("href", "/skillsets/" + element);
    link.setAttribute("data-skillset", element);
    link.textContent = get_skillset_label(element);
    
    // Handle regular clicks with router, allow middle-click/ctrl+click for new tab
    link.addEventListener("click", function(e) {
      // Allow middle-click (button 1) and ctrl/cmd+click to open in new tab naturally
      if (e.button === 1 || e.ctrlKey || e.metaKey) {
        return; // Let the browser handle it
      }
      e.preventDefault();
      closeDropdowns();
      page.show('/skillsets/' + element);
    });
    
    container.appendChild(link);
  });
}

/**
 * Load and populate homepage featured projects and skillsets from config
 */
async function loadHomepageFeatured() {
  // Helper: resolve image path (supports full URLs or just filenames)
  const resolveImageUrl = (img) => {
    if (!img) return '';
    return img.startsWith('http') ? img : `https://matanga.github.io/images/${img}`;
  };

  try {
    const response = await fetch(HOMECONFIG);
    if (!response.ok) {
      console.warn('[Homepage] Could not load home config');
      return;
    }
    const config = await response.json();
    
    // Populate featured projects
    const projectsContainer = document.getElementById('homeFeaturedProjects');
    if (projectsContainer && config.featuredProjects) {
      projectsContainer.innerHTML = config.featuredProjects.map(project => `
        <li>
          <button onclick="page.show('/projects/${project.id}')" class="project-button">
            <div class="button-image" style="background-image: url('${resolveImageUrl(project.image)}')"></div>
            <span class="button-text">${project.label}</span>
          </button>
        </li>
      `).join('');
    }
    
    // Populate featured skillsets
    const skillsetsContainer = document.getElementById('homeFeaturedSkillsets');
    if (skillsetsContainer && config.featuredSkillsets) {
      skillsetsContainer.innerHTML = config.featuredSkillsets.map(skillset => `
        <li>
          <button onclick="page.show('/skillsets/${skillset.id}')" class="project-button">
            <div class="button-image" style="background-image: url('${resolveImageUrl(skillset.image)}')"></div>
            <span class="button-text">${skillset.label}</span>
          </button>
        </li>
      `).join('');
    }
    
    console.log('[Homepage] Featured items loaded from config');
  } catch (e) {
    console.warn('[Homepage] Error loading home config:', e.message);
  }
}

function AddPortfolioItemButtons(portfolioItems, containerId, loadRefs) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found`);
    return;
  }
  let added = 0;
  let btn;
  container.innerHTML = "";
   const randomColorSelector = new NonRepeatRandomColorSelector();

  for (let i = portfolioItems.length - 1; i >= 0; i--) {
    const portfolioItem = portfolioItems[i];
    const button = document.createElement("button");
    button.setAttribute("class", "portfolioItemBtn loadBtn");




    const color = randomColorSelector.getRandomColor();
    button.style.borderTop = `3px solid ${color}`;
    button.style.borderColor  = `${color}`; 
    //button.style.backgroundColor = `transparent`;
    button.style.color  = `${color}`; 



    //Set On Hover background
    const trans = getTransparentColor(color);

    button.setAttribute('onmouseenter', `this.style.backgroundColor='${trans}'`);
    button.setAttribute('onmouseleave', "this.style.backgroundColor='transparent'");



    button.setAttribute("data-portfolio-item", portfolioItem);
    button.textContent = portfolioItem.name;
    button.addEventListener("click", function() {
      LoadPortfolioItem(portfolioItem,loadRefs);
    });
    container.appendChild(button);
    if (added == 0) {
      added = 1;
      btn = button;
    }
  }
  btn.click();
}



function AddPortfolioItemDescription(containerId,  item) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found`);
    return;
  }
  const bulletPoints = item.bulletpoints.map(bulletPoint => `<li>${bulletPoint}</li>`).join('');
  const html = `
    <div class="itemDescription">
      <p>${item.mainDescription}</p>
      <ul class="itemBulletPts">${bulletPoints}</ul>
    </div>
  `;
  container.innerHTML = html;
  toggleHide('projectInfo');
}



/*------------------------------------------------*/
/*-------------  Navigation ----------------------*/



// Changes the tab
function OpenTab(tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="dropbtn" and remove the class "active"
  tablinks = document.getElementsByClassName("dropbtn");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";

  let element = document.getElementById(('btn'+tabName));

  element.className += " active";
}

function LoadPortfolioItem(item,loadRefs){
    /*
        'project': {
            "title":"projectsItemTitle",
            "carousel":"projectsCarousel",
            "description":"projectsItem",
            "youtube":"youtube-parent"
        }
    */
    const id = getLoadReferences(loadRefs);

    ApplyElementText(id.title,item.name)
    AddPortfolioItemDescription(id.description,item)
    const newCarousel = new Carousel(id.carousel,item.images)
    addVideosToElement(id.youtube,item.youtube);
}

function LoadProjectByName(projectName) {
    // Navigate to the project page using the router
    page.show('/projects/' + projectName);
}

function LoadSkillsetsTab(skillset) {
    // Use the global singleton instead of creating new instance
    if (!globalPortfolioManager) {
        console.error("PortfolioManager not initialized yet");
        return;
    }

    const portfolioItems = Object.values(globalPortfolioManager.portfolioItems);
    const matchingItems = [];

    portfolioItems.forEach(item => {
        if (item.skillsets.includes(skillset)) {
            matchingItems.push(item);
        }
    });

    AddPortfolioItemButtons(matchingItems,'skillsetPortfolioItems','skillset');

    LoadPortfolioItem(matchingItems[matchingItems.length-1],'skillset');

    ApplyElementText("selectedSkillset",get_skillset_label(skillset));

    OpenTab("skillsets");
}

/*--------------------------------------------------*/
/*--------------Toggle / Show more buttons----------*/

function GetToggleID(toggleType){
    const dict = {
        "projectInfo":{
            'more':"projectInfoMore",
            'btn':"projectInfoBtn"
        },
        "projectItem":{
            'more':"projectsItem",
            'btn':"projectItemBtn"
        },
        "skillsetItem":{
            'more':"skillsetsMore",
            'btn':"skillsetsBtn"
        }
    };
    return dict[toggleType];
}


//Used to show and hide more project content on the project tab 
function toggleShow(toggleID) {
    const id = GetToggleID(toggleID);
    var moreText = document.getElementById(id.more);
    var btnText = document.getElementById(id.btn);

    console.log(moreText.style.display);

    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        btnText.innerHTML = "Read less";
    } else {
        moreText.style.display = "none";
        btnText.innerHTML = "Read more";
    }
}

function toggleHide(toggleID){
    const id = GetToggleID(toggleID);
    var moreText = document.getElementById(id.more);
    var btnText = document.getElementById(id.btn);


    if (moreText.style.display === "inline") {
        moreText.style.display = "none";
        btnText.innerHTML = "Read more";
    }
}


/*--------------------------------------------------*/
/*--------------Utiltities---------------------------*/



