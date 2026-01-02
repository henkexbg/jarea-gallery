import React, {createContext, useState, useReducer} from 'react';
import {
    GALLERY_API_ROOT_URL, GALLERY_API_IMAGE_ROOT_URL, GALLERY_API_LOGIN_URL
} from '../api/config';

export const GalleryContext = createContext();

const GalleryContextProvider = props => {
    const [loading, setLoading] = useState(false);
    const [showFullSizeImageIndex, setShowFullSizeImageIndex] = useState(-1);
    const [authLoading, setAuthLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [chosenVideoFormat, setChosenVideoFormat] = useState();
    const [searchHistory] = useState(new Map());

    const initialState = {media: [], directories: [], bestImageFormat: null, videoFormats: []}

    const reducer = (state = initialState, action) => {
        if (!chosenVideoFormat) {
            let tempFormat = action.payload.videoFormats[0];
            setChosenVideoFormat(tempFormat);
        }
        return Object.assign({}, state, {
            media: action.payload.media,
            directories: action.payload.directories,
            bestImageFormat: determineBestImageFormatCode(action.payload.imageFormats),
            videoFormats: action.payload.videoFormats
        })
    }

    const [state, dispatch] = useReducer(reducer, initialState);

    const authenticate = async (givenUsername, givenPassword, failureCallback) => {
        setLoading(true);
        const authUrl = GALLERY_API_LOGIN_URL;
        const params = new URLSearchParams();
        params.append('username', givenUsername);
        params.append('password', givenPassword);
        fetch(authUrl, {
            method: 'POST',
            credentials: 'include',
            body: params
        })
            .then(response => {
                setLoading(false);
                if (response.ok) {
                    setUsername(givenUsername);
                    setPassword(givenPassword);
                    setAuthenticated(true);
                } else {
                    console.log('Failed authentication')
                    setAuthenticated(false);
                    if (failureCallback) {
                        failureCallback();
                    }
                }
            })
    }

    const runSearch = query => {
        if (!authenticated) {
            return;
        }
        setLoading(true);
        const fullUrl = GALLERY_API_ROOT_URL + query;
        let previousJsonResponse = searchHistory.get(query);
        if (previousJsonResponse) {
            dispatch({payload: previousJsonResponse});
            setLoading(false);
        } else {
            fetch(fullUrl, {
                method: 'GET',
                credentials: 'include'
            })
                .then(response => {
                    setLoading(false);
                    response.json().then(jsonResponse => {
                        searchHistory.set(query, jsonResponse);
                        dispatch({payload: jsonResponse});
                    })
                        .catch(error => {
                            console.log(
                                'Encountered an error with fetching and parsing data',
                                error);
                            setLoading(false);
                        });
                });
        }
    }

    const getImageUrl = (media, imageFormat) => {
        let formattedBaseUrl = GALLERY_API_IMAGE_ROOT_URL.replace('{username}', username).replace('{password}', password);
        let formattedPath = media.formatPath.replace('{imageFormat}', imageFormat);
        return formattedBaseUrl + formattedPath;
    }

    const getVideoUrl = (media) => {
        let formattedBaseUrl = GALLERY_API_IMAGE_ROOT_URL.replace('{username}', username).replace('{password}', password);
        let formattedPath = media.videoPath.replace('{conversionFormat}', chosenVideoFormat);
        return formattedBaseUrl + formattedPath;
    }

    return (
        <GalleryContext.Provider value={{
            loading,
            authenticate,
            runSearch,
            showFullSizeImageIndex,
            setShowFullSizeImageIndex,
            authenticated,
            setAuthenticated,
            getImageUrl,
            getVideoUrl,
            state,
            chosenVideoFormat,
            setChosenVideoFormat,
            searchHistory,
            authLoading,
            setAuthLoading
        }}>
            {props.children}
        </GalleryContext.Provider>
    );
};

function determineBestImageFormatCode(imageFormats) {
    let ratio = window.devicePixelRatio || 1;
    let width = Math.round(window.innerWidth * ratio);
    let height = Math.round(window.innerHeight * ratio);
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

export default GalleryContextProvider;
