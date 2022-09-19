import React, {useContext, useEffect, useState} from 'react';
import {GalleryContext} from './context/GalleryContext';
import {Divider} from '@material-ui/core';
import Container from './components/Container';
import GalleryBreadcrumbs from './components/GalleryBreadcrumbs';
import TopBar from './components/TopBar';
import {useParams} from 'react-router';
import {Redirect} from 'react-router-dom';
import {GALLERY_API_SERVICE_PATH} from './api/config';
import {getBasePathFromSearchTerm} from "./galleryUtil";

const GalleryPage = () => {
    const {searchTerm} = useParams();
    const [currentlyRenderedSearchTerm, setCurrentlyRenderedSearchTerm] = useState(null);
    const {authenticated, runSearch} = useContext(GalleryContext);
    if (searchTerm !== currentlyRenderedSearchTerm) {
        setCurrentlyRenderedSearchTerm(searchTerm);
    }

    useEffect(() => {
        if (currentlyRenderedSearchTerm) {
            let basePath = getBasePathFromSearchTerm(currentlyRenderedSearchTerm);
            runSearch(basePath);
        }
    }, [currentlyRenderedSearchTerm, authenticated]);

    if (!searchTerm || !getBasePathFromSearchTerm(searchTerm).startsWith(GALLERY_API_SERVICE_PATH)) {
        return (
            <Redirect to={GALLERY_API_SERVICE_PATH} />
        )
    }

    return (
        <div>
            <TopBar/>
            <GalleryBreadcrumbs/>
            <Divider/>
            <Container/>
        </div>
    );
}

export default GalleryPage;
