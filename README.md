# MovieDB SPA

An AngularJS powered app, bundled with bootstrap CSS and the [TMDb](https://themoviedb.org) API to demonstrate rapid Web front-end development.

Getting Started
-

Download the .zip file [here](https://github.com/jcellak/themoviedb-spa/archive/master.zip).

Open index.html in a browser.

Local Dev Environment vs. Hosted Prod Environment
-

I opted to use public CDNs for serving up CSS and JS libraries for this project. (Specifically, AngularJS v1 and Bootstrap)

For a production environment I would use build tools that allow me to append or build specific versions, as well as minifying/combining all CSS and JS (non-library) files.

Given the scope of the project, I opted to use regular CSS, but for larger projects I would use LESS and the aforementioned build tools to keep things more organized.

There are also a few key areas that could be separated out into AngularJS Element directives, but since everything here is local; it wouldn't work due to local origin restrictions.

The hard-coded values (for the API) would also be better served if the config JSON were cached once every few days on a hosted server, and the API key kept private via server-side only requests.

License
-

This project is meant for educational purposes only!