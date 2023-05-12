page('/home', function() {
  OpenTab('home')
});

page('/about', function() {
  // code to load the about page
});

page('/projects/:name', function(ctx) {
	LoadProjectByName(ctx.params.name)
});

page('/contact', function() {
  OpenTab('contact')
});
