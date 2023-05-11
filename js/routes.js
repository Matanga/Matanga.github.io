function loadProject(projectName) {
  // code to load the project with the given name
}

page('/home', function() {
  // code to load the home page
});

page('/about', function() {
  // code to load the about page
});

page('/projects/:name', function(ctx) {
	LoadProjectByName(ctx.params.name)
});

page('/contact', function() {
  // code to load the contact page
});