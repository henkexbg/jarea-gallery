# Jarea Gallery
Responsive gallery for viewing images and videos in a secure and simple manner. Images are resized for the screen size in question, and videos are transcoded to configurable formats. All access is behind authentication, and different users and roles can be set up.

The name is derived from the underlying technologies: Java and React:
* The back end is REST application written in Java using Spring Boot framework. It's completely independent and can be deployed without any front end. Repository can be found here: https://github.com/henkexbg/gallery-api
* The front end (this repository) is a React application

This repository contains scripts to build a full bundled application containing both parts, simplifying the deployment process. This bundle runs Spring Boot as a server with the React application bundled as static files, i.e. no Node instance is required during runtime.

# Purpose
To be able to securely and easily make your images and videos available to yourself and share with friends and family without having to upload them to a 3rd-party. This webapp is up and running in a few minutes and can easily be deployed either to a home server or a virtual machine somewhere in some cloud. This application is protected by default with basic authentication. Different users can be set up who can access different media. Root directories are configured, and new content can dynamically be added to these directories and be made available without any re-configuration. There is no registration process; the main use case is to share media with friends and family, and hence users and roles are explicitly curated by the owner.

# Features
- Browsing directories containing sub-directories and media as thumbnails
- View full-size carousel of media
- Serve scaled images and transcoded videos
- Lazy loading, both for gallery and carousel
- Requires authentication and validates that every single request is authenticated and authorized to view the requested content
- Packaged as a simple Spring boot application that requires only Java - no database required
- Automatically serves newly added content
- Images are scaled ad-hoc
- Transcoded videos are generated via a job or ad-hoc
- Scaled and transcoded content is stored in a separate location for fast subsequent access
- A video blacklist exists to ensure videos that fail to transcode keep hogging resources forever
- Users are configured server-side. There is no registration

# Prerequisites
- Java 14
- Node (tested with 14.15). Not required during runtime, only during build

# Installation
This installation describes the process how to generate the full bundle with back end **and** front end.

## Generate Bundle
Run
````shell
npm run bundle
````
This script will:
 - Build the React app by running `npm run build`
 - Create a directory called `bundle`
 - Copy the React build into `bundle/public`
 - Download the Spring Boot Maven artefact to `bundle/gallery-api.jar`
 - Extract the sample configuration to `bundle/config`

## Configure Application
There should now be three sample configuration files under `bundle/config`. Each of these files contains detailed instructions. The mandatory configuration is also summarised under Gallery-API: https://github.com/henkexbg/gallery-api#configuration.

**Note**: It is **strongly** recommended to configure a web server in front that enforces HTTPS. Except for being general best practice, HTTPS is essential for securing basic authentication. How to achieve this is outside the scope of this application.

# Run Application

The program can then be run by calling
````shell
java -jar gallery-api.jar
````
There are multiple ways to run this as a background process, all of which depend on the operating system used. Google is your friend :) .

The application is by default accessible on http://localhost:8080/gallery.

# Developing with the App
During development it's useful to run the front end project on a Node server rather than as bundles files on the Spring Boot application. To achieve this a few steps are required, see sub-sections below.

Note: the authentication process looks slightly different during development - there's a React component that requests username and password, that is never seen if running the bundle since the browsers will be handling the basic authentication before any part of the site is loaded.

## Back End Setup For Development
Configure an instance of Gallery-API to allow cross-origin requests. Ensure that the application.properties has the configuration `gallery.web.allowedOrigins=*` (this is the default).
This is required because Gallery-API and the React app will be running on different servers (at least different ports).

Run Gallery-API.

## Front End Setup For Development

In `src/api/config.js`, change as per the comments. Basically `JOINT_DEPLOYMENT` should be set to false, and a few other attributes should be altered. Unfortunately there's also a twist that requires different configuration for Firefox vs Chrome due to different handling of basic authentication for cross-origin requests. Again, this is documented in the configuration file.

# Other Configuration

## Change Base Path From /gallery
To use another base path, one configuration change is required in the front end and back end respectively.

 - Front end: Edit the `homepage` attribute in `package.json` before building the app
 - Back end: Change `server.servlet.context-path` in `bundle/config/application.properties`

## Gallery-API Version
Gallery-API version is controlled by `gallery-api-version` in `package.json`. Only released versions can be packaged automatically with the bundle script. Of course it's always possible to build your own JAR from source and use that instead.

## Additional Scripts

Being a stock standard React app, the normal operations work as per below.

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# Acknowledgements
Inspiration for the React front end was taken from https://github.com/Yog9/SnapShot, although there is no common code.
