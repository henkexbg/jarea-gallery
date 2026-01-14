import React, {useContext, useEffect} from 'react';
import Divider from '@mui/material/Divider';
import {useLocation, Navigate} from 'react-router-dom';
import {GalleryContext} from './context/GalleryContext';
import Container from './components/Container';
import TopBar from './components/TopBar';
import {GALLERY_API_SERVICE_PATH} from './api/config';

const GalleryPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchTermQuery = searchParams.get('searchTerm');

    const {runSearch} = useContext(GalleryContext);
    let fullSearchQuery = null;
    if (location.pathname && location.pathname.startsWith(GALLERY_API_SERVICE_PATH)) {
        fullSearchQuery = `${location.pathname}${searchTermQuery ? `?searchTerm=${searchTermQuery}` : ''}`;
    }
    useEffect(() => {
        if (!fullSearchQuery) {
            return;
        }
        runSearch(fullSearchQuery);
    }, [fullSearchQuery]);

    if (!fullSearchQuery || !fullSearchQuery.startsWith(GALLERY_API_SERVICE_PATH)) {
        return (
            <Navigate to={GALLERY_API_SERVICE_PATH} replace/>
        );
    }

    return (
        <div>
            <TopBar/>
            <Divider/>
            <Container/>
        </div>
    );
};

export default GalleryPage;
