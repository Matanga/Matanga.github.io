class Project {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.challenges = data.challenges;
    this.solutionhow = data.solutionhow;
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

const PROJECTDB = "https://matanga.github.io/db/project_db.json";
const PORTFOLIOITEMDB = "https://matanga.github.io/db/portfolio_item_db.json";


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





// Function to apply text to an element
function ApplyElementText(id, text) {
document.getElementById(id).innerHTML = text;
}

// Function to load the JSON object and display its values
function LoadJson(file_path) {
fetch(file_path)
  .then(response => response.json())
  .then(data => {
    var intelEvo = data["intel-evo"];
    ApplyElementText("container_proj_name", intelEvo.name);
    ApplyElementText("container_proj_description", intelEvo.description);
    ApplyElementText("container_proj_challenges", intelEvo.challenges);
    ApplyElementText("container_proj_solutions", intelEvo.solution);
  });
}