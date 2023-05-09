const PROJECTDB = "https://matanga.github.io/db/project_db.json";
const PORTFOLIOITEMDB = "https://matanga.github.io/db/portfolio_item_db.json";

class Project {
  constructor(data) {
    this.name = data.info.name;
    this.client=data.info.client;
    this.company=data.info.company;
    this.media=data.info.media;
    this.platform=data.info.platform;
    this.involvement=data.info.involvement;
    this.portfolioitems = data.info.portfolioitems;

    this.description = data.description.main;
    this.challenges = data.description.challenges;
    this.solution = data.description.solution;
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
    this.colors = ["#fe3385", "lime", "yellow", "#d90b09", "aqua", "orange"];
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
/*-------------  Dynamic HTML --------------------*/

// Function to apply text to an element
function ApplyElementText(id, text) {

  document.getElementById(id).innerHTML = text;
}

function addImagesToElement(images, elementId) {
  const container = document.getElementById(elementId);
  if (!container) {
    console.error(`Element with ID "${elementId}" not found`);
    return;
  }

  // Clear existing child elements
  container.innerHTML = "";

  // Loop through the images and create a new div with an image element child for each one
  images.forEach(imagePath => {
    const div = document.createElement("div");
    const img = document.createElement("img");
    img.setAttribute("src", ("images/"+imagePath));
    div.appendChild(img);
    container.appendChild(div);
  });
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

// Initialize Function to Create Buttons
function AddProjectButtons(pm,containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found`);
    return;
  }
  
  Object.keys(pm.projects).forEach(projectKey => {
    const project = pm.projects[projectKey];
    const button = document.createElement("button");
    button.setAttribute("id", "loadBtn");
    button.setAttribute("class", "topbar-linkbtn");

    button.setAttribute("data-project", projectKey);
    button.textContent = project.name;
    button.addEventListener("click", function() {
      LoadProject(pm,projectKey);
    });
    container.appendChild(button);
  });
}

function AddPortfolioItemButtons(portfolioItems, containerId) {
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
    button.setAttribute("id", "loadBtn");
    button.setAttribute("class", "topbar-linkbtn");


    const color = randomColorSelector.getRandomColor();
    button.style.borderTop = `3px solid ${color}`;
    button.style.borderColor  = `${color}`; 
    //button.style.backgroundColor = `transparent`;


    button.setAttribute("data-portfolio-item", portfolioItem);
    button.textContent = portfolioItem.name;
    button.addEventListener("click", function() {
      LoadPortfolioItem(portfolioItem);
    });
    container.appendChild(button);
    if (added == 0) {
      added = 1;
      btn = button;
    }
  }
  btn.click();
}

// Initialize Function to Create Buttons
function AddSkillsetButtons(list,containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found`);
    return;
  }
  
    list.forEach(function(element) {
        const button = document.createElement("button");
        button.setAttribute("id", "loadBtn");
        button.setAttribute("class", "topbar-linkbtn");

        button.setAttribute("data-skillset", element);
        button.textContent = get_skillset_label(element);
        button.addEventListener("click", function() {
          LoadSkillsetsTab(element);
        });
        container.appendChild(button);
      console.log(element);
    });
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

function LoadPortfolioItem(item){
  addImagesToElement(item.images,"carousel-img-parent");
  addVideosToElement("youtube-parent",item.youtube);
}

function LoadProjectByName(projectName) {

    const portfolioManager = new PortfolioManager(() => {
        // Your code that needs access to the `projects` and `portfolioItems` dictionaries goes here

      const project = portfolioManager.projects[projectName];
      if (!project) {
        console.error(`Project "${projectName}" not found`);
        return;
      }
      ApplyElementText("project-name-container", project.name);
      ApplyElementText("project-media-container", project.media);
      ApplyElementText("project-client-container", project.client);
      ApplyElementText("project-platform-container", project.platform);
      ApplyElementText("project-company-container", project.company);
      ApplyElementText("project-involvement-container", project.involvement);


      ApplyElementText("container_proj_description", project.description);
      ApplyElementText("container_proj_challenges", project.challenges);
      ApplyElementText("container_proj_solutions", project.solution);

      ForceReadLess();

      items = portfolioManager.getPortfolioItemsForProject(projectName);
      AddPortfolioItemButtons(items,'portfolioitemcontainer');

      OpenTab("projects");

    });
}

function LoadProject(pm,projectName) {
  const project = pm.projects[projectName];
  console.log(pm.projects)
  if (!project) {
    console.error(`Project "${projectName}" not found`);
    return;
  }
  console.log(project.name);
  ApplyElementText("project-name-container", project.name);
  ApplyElementText("project-media-container", project.media);
  ApplyElementText("project-client-container", project.client);
  ApplyElementText("project-platform-container", project.platform);
  ApplyElementText("project-company-container", project.company);
  ApplyElementText("project-involvement-container", project.involvement);


  ApplyElementText("container_proj_description", project.description);
  ApplyElementText("container_proj_challenges", project.challenges);
  ApplyElementText("container_proj_solutions", project.solution);

  ForceReadLess();

  items = pm.getPortfolioItemsForProject(projectName);
  AddPortfolioItemButtons(items,'portfolioitemcontainer');


  OpenTab("projects");
}

function LoadSkillsetsTab(skillset) {
    const portfolioManager = new PortfolioManager(() => {

        const portfolioItems = Object.values(portfolioManager.portfolioItems);
        const matchingItems = [];

        portfolioItems.forEach(item => {
        if (item.skillsets.includes(skillset)) {
          matchingItems.push(item);
        }
        });

        //return matchingItems;
        console.log(matchingItems)
        AddPortfolioItemButtons(matchingItems,'skillsetPortfolioItems');

        OpenTab("skillsets");
    });
}


/*--------------------------------------------------*/
/*--------------Toggle / Show more buttons----------*/

//Used to show and hide more project content on the project tab 
function toggleShowSkillsets(section,optionA, optionB) {
  var dots = document.getElementById("skillsetsdots");
  var moreText = document.getElementById("moreSkillItem");
  var btnText = document.getElementById("skillsetsmyBtn");

  if (dots.style.display === "none") {
    dots.style.display = "block";
    btnText.innerHTML = 'Show Info';
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = 'Hide Info';
    moreText.style.display = "block";
  }
}

//Used to show and hide more project content on the project tab 
function toggleShow() {
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("more");
  var btnText = document.getElementById("myBtn");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less";
    moreText.style.display = "inline";
  }
}


function ForceReadLess(){
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("more");
  var btnText = document.getElementById("myBtn");

  var dotsSkills = document.getElementById("skillsetsdots");
  var moreTextSkills = document.getElementById("moreSkillItem");
  var btnTextSkills = document.getElementById("skillsetsmyBtn");

  if (dotsSkills.style.display === "none") {
    dotsSkills.style.display = "inline";
    btnTextSkills.innerHTML = "Show Info";
    moreTextSkills.style.display = "none";
  } 

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more";
    moreText.style.display = "none";
  } 
}


/*--------------------------------------------------*/
/*--------------Utiltities---------------------------*/


function get_skillset_label(skillset) {
    const skillsetLabels = {
        "tooldev": "Tool Development",
        "unrealdev": "Unreal Development",
        "unitydev": "Unity Development",
        "vr": "VR",
        "pipelinedev": "Pipeline Development",
        "artinstallation": "Art installation",
        "proceduralgeneration": "Procedural Generation",
        "vfx": "VFX"
    };  
    return skillsetLabels[skillset] || skillset;
}



