# Jarea Gallery
Responsive gallery for viewing images and videos in a secure and simple manner. Images are resized for the screen size in question, and videos are transcoded to configurable formats. All access is behind authentication, and different users and roles can be set up.

The name is derived from the underlying technologies: Java and React:
* The back end is REST application written in Java using Spring Boot framework. It's completely independent and can be deployed without any front end. Repository can be found here: https://github.com/henkexbg/gallery-api
* The front end (this repository) is a React application

This repository contains scripts to build a full bundled application containing both parts, simplifying the deployment process. This bundle runs Spring Boot as a server with the React application bundled as static files, i.e. no Node instance is required during runtime.

# Purpose
To be able to safely and easily make your images and videos available to yourself and share with friends and family without having to upload them to a 3rd-party. This webapp is up and running in a few minutes and can easily be deployed either to a home server or a virtual machine somewhere in some cloud. This application is protected by default with basic authentication. Different users can be set up who can access different media. There is no registration process; the main use case is for somebody to share media with friends and family, and hence users and roles are explicitly curated by the owner.

# Features
- Allows fast navigation, searching and viewing of images and videos
- View full-size carousel of media
- Lazy loading, both for gallery and carousel
- Automatically indexes and serves new content
- Images are automatically resized, and videos are automatically transcoded
- Searchable data is extracted from:
- - Image location, which uses an internal database derived from https://download.geonames.org/, completely within app
- - Filenames, which are tokenized and made searchable. Media inherit the searchability of their directories
- - Image metadata
- Completely private. Requires authentication and validates that every single request is authenticated and authorized to view the requested content
- No external dependencies - every request is made only to the app
- Packaged as a simple Spring boot application that also hosts the front end
- A video blacklist exists to ensure videos that fail to transcode keep hogging resources forever
- Users are configured server-side. There is no registration

# Prerequisites
- Java 24
- ffmpeg - for video transpilation
- exiftool - for extracting metadata from images
- ImageMagick is required if the ImageMagick resizing method is chosen
- Node (tested with 18.19). Not required during runtime, only during build

# Installation
This installation describes the process how to generate the full bundle with back end **and** front end.
Configure the environment variable `GALLERY_API_BASE_URL` in the `.env` file. This is needed for the React app to know
the URL of the backend. This needs to be configured even if the backend is bundled together with the React app, which is
not a requirement. The default value is `http://localhost:8080`, which is appropriate for development.

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
During development it's useful to run the front end project on a Node server rather than as bundles files on the Spring Boot application. To achieve this a few steps are required, see subsections below.

## Back End Setup For Development
Configure an instance of Gallery-API to allow cross-origin requests. Ensure that the application.properties has the
configuration `gallery.web.crossOrigin.allowedHosts=example.com,localhost`. The default is empty value which means
that cross-origin requests are not allowed. As long as the host is declared, all ports for that host will be allowed.

You can now start Gallery-API.

## Front End Setup For Development

The `.env` file needs to be configured with the correct base URL. Then run
````shell
npm run dev
````

This starts the app in the development mode. Open [http://localhost:5173](http://localhost:5173) to view it in the
browser.

# Other Configuration

## Gallery-API Version
Gallery-API version is controlled by `gallery_api_version` in `package.json`. Only released versions can be packaged automatically with the bundle script. Of course it's always possible to build your own JAR from source and use that instead.

# Acknowledgements

GeoNames (https://download.geonames.org/) is implicitly used. While not distributed with this software, it does download and use data from GeoNames. The license is Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/.