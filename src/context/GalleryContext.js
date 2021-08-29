import React, { createContext, useState, useReducer } from 'react';
import { GALLERY_API_ROOT_URL, GALLERY_API_SERVICE_URL, GALLERY_API_SERVICE_PATH, GALLERY_API_IMAGE_ROOT_URL, JOINT_DEPLOYMENT } from '../api/config';

export const GalleryContext = createContext();

const GalleryContextProvider = props => {
  const [loading, setLoading] = useState(false);
  const [showFullSizeImageIndex, setShowFullSizeImageIndex] = useState(-1);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [authenticated, setAuthenticated] = useState(JOINT_DEPLOYMENT);
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();


  const initialState = { media: [], directories: [], breadcrumbs: [], bestImageFormat: null }

  const reducer = (state = initialState, action) => {
    return Object.assign({}, state, {
      media: action.payload.media,
      directories: action.payload.directories,
      bestImageFormat: determineBestImageFormatCode(action.payload.imageFormats),
    })
 }

 const [state, dispatch] = useReducer(reducer, initialState);

  const authenticate = async (givenUsername, givenPassword, failureCallback) => {
    if (JOINT_DEPLOYMENT) {
      return;
    }
    setLoading(true);
    const authUrl = GALLERY_API_SERVICE_URL;
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(givenUsername + ':' + givenPassword));
    fetch(authUrl, {
      method: 'HEAD',
      headers: headers
    })
      .then(response => {
        setLoading(false);
        if (response.status === 200) {
          setUsername(givenUsername);
          setPassword(givenPassword);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          if (failureCallback) {
            failureCallback();
          }
        }
      })
  }

  const runSearch = query => {
    if (!JOINT_DEPLOYMENT && !username) {
      return;
    }
    setLoading(true);
    let headers = new Headers();
    if (!JOINT_DEPLOYMENT) {
      headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));
    }
    const baseUrl = GALLERY_API_ROOT_URL;
    query = '/' + query;
    const fullUrl = baseUrl + query;
    fetch(fullUrl, {
      method: 'GET',
      headers: headers
    })
      .then(response => {
        setLoading(false);
        response.json().then(jsonResponse => {
          let crumbs = generateBreadcrumbs(GALLERY_API_SERVICE_PATH, query);
          setBreadcrumbs(crumbs);
          dispatch({ payload: jsonResponse });
        })
          .catch(error => {
            console.log(
              'Encountered an error with fetching and parsing data',
              error);
            setLoading(false);
          });
      });

  }

  const getImageUrl = (media, imageFormat) => {
    let formattedBaseUrl = GALLERY_API_IMAGE_ROOT_URL.replace('{username}', username).replace('{password}', password);
    let formattedPath = media.formatPath.replace('{imageFormat}', imageFormat);
    return formattedBaseUrl + formattedPath;
  }

  const getVideoUrl = (media, conversionFormat) => {
    let formattedBaseUrl = GALLERY_API_IMAGE_ROOT_URL.replace('{username}', username).replace('{password}', password);
    let formattedPath = media.videoPath.replace('{conversionFormat}', conversionFormat);
    return formattedBaseUrl + formattedPath;
  }

  return (
    <GalleryContext.Provider value={{ loading, authenticate, runSearch, showFullSizeImageIndex, setShowFullSizeImageIndex, breadcrumbs, authenticated, getImageUrl, getVideoUrl, state }}>
      {props.children}
    </GalleryContext.Provider>
  );
};

function determineBestImageFormatCode(imageFormats) {
  let ratio = window.devicePixelRatio || 1;
  let width = Math.round(window.screen.width * ratio);
  let height = Math.round(window.screen.height * ratio);
  let nrPixels = width * height;
  let bestMatchPixelsDiff = Number.MAX_SAFE_INTEGER;
  let bestMatchImageFormat = null;
  for (let i = 0; i < imageFormats.length; i++) {
    let oneImageFormat = imageFormats[i];
    let nrPixelDiff = Math.abs(oneImageFormat.width * oneImageFormat.height - nrPixels);
    if (nrPixelDiff < bestMatchPixelsDiff) {
      bestMatchPixelsDiff = nrPixelDiff;
      bestMatchImageFormat = oneImageFormat;
    }
  }
  return bestMatchImageFormat.code;
}

function generateBreadcrumbs(basePath, path) {
  let breadcrumbs = [];
  if (path) {
    let pathParts = path.replace(basePath, '').split('/');
    let currentPath = basePath;
    breadcrumbs.push({ displayName: 'Root', path: currentPath });
    pathParts.forEach(function (item) {
      if (item && item.length > 0) {
        currentPath += '/' + item;
        breadcrumbs.push({ displayName: item, path: currentPath });
      }
    });
  }
  return breadcrumbs;
}

export default GalleryContextProvider;
