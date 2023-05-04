/*jshint esversion: 6 */
class Project {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.challenges = data.challenges;
    this.solution = data.solution;
    this.portfolioitems = data.portfolioitems;
  }
}

class PortfolioItem {
  constructor(data) {
    this.date = data.backend.date;
    this.name = data.backend.name;
    this.projectname = data.backend.projectname;
    this.company = data.backend.company;
    this.dcc = data.backend.dcc;
    this.engine = data.backend.engine;
    this.languages = data.backend.languages;
    this.skillsets = data.backend.skillsets;
    this.mainDescription = data.description.main;
    this.bulletpoints = data.description.bulletpoints;
    this.images = data.media.image;
    this.youtube = data.media.youtube;
    this.urls = data.media.url;
  }
}

class PortfolioManager {
  constructor() {
    this.projects = {};
    this.portfolioItems = {};
    
    // Load project data
    fetch(PROJECTDB)
      .then(response => response.json())
      .then(data => {
        Object.keys(data).forEach(key => {
          this.projects[key] = new Project(data[key]);
        });
      })
      .catch(error => console.error(`Failed to load project data: ${error}`));
    
    // Load portfolio item data
    fetch(PORTFOLIOITEMDB)
      .then(response => response.json())
      .then(data => {
        Object.keys(data).forEach(key => {
          this.portfolioItems[key] = new PortfolioItem(data[key]);
        });
      })
      .catch(error => console.error(`Failed to load portfolio item data: ${error}`));
  }
}


const PROJECTDB = "https://matanga.github.io/db/project_db.json";
const PORTFOLIOITEMDB = "https://matanga.github.io/db/portfolio_item_db.json";
const PORTFOLIOMANAGER = new PortfolioManager();






// Function to apply text to an element
function ApplyElementText(id, text) {
document.getElementById(id).innerHTML = text;
}

function LoadProject(projectName) {
  const project = PORTFOLIOMANAGER.projects[projectName];
  if (!project) {
    console.error(`Project "${projectName}" not found`);
    return;
  }
  
  ApplyElementText("container_proj_name", project.name);
  ApplyElementText("container_proj_description", project.description);
  ApplyElementText("container_proj_challenges", project.challenges);
  ApplyElementText("container_proj_solutions", project.solution);
}

function AddProjectButtons(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found`);
    return;
  }
  
  Object.keys(PORTFOLIOMANAGER.projects).forEach(projectKey => {
    const project = PORTFOLIOMANAGER.projects[projectKey];
    const button = document.createElement("button");
    button.setAttribute("id", "loadBtn");
    button.setAttribute("data-project", projectKey);
    button.textContent = project.name;
    button.addEventListener("click", function() {
      LoadProject(projectKey);
    });
    container.appendChild(button);
  });
}