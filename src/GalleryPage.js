import React, {useContext, useEffect, useState} from 'react';
import {GalleryContext} from './context/GalleryContext';
import {Divider} from '@material-ui/core';
import Container from './components/Container';
import TopBar from './components/TopBar';
import {useParams} from 'react-router';
import {Redirect, useLocation} from 'react-router-dom';
import {GALLERY_API_SERVICE_PATH} from './api/config';

const GalleryPage = () => {
    let useQuery = () => {
        const { search } = useLocation();
        return React.useMemo(() => new URLSearchParams(search), [search]);
    }
    let query = useQuery();
    let searchTermQuery = query.get("searchTerm");

    const {publicPath} = useParams();
    let fullSearchQuery = '/' + publicPath;
    if (searchTermQuery) {
        fullSearchQuery = fullSearchQuery + '?searchTerm=' + searchTermQuery;
    }
    const [currentlyRenderedSearchTerm, setCurrentlyRenderedSearchTerm] = useState(null);
    const {authenticated, runSearch} = useContext(GalleryContext);
    if (fullSearchQuery !== currentlyRenderedSearchTerm) {
        setCurrentlyRenderedSearchTerm(fullSearchQuery);
    }

    useEffect(() => {
        if (currentlyRenderedSearchTerm) {
            runSearch(fullSearchQuery);
        }
    }, [currentlyRenderedSearchTerm, authenticated]);

    if (!fullSearchQuery || !fullSearchQuery.startsWith(GALLERY_API_SERVICE_PATH)) {
        return (
            <Redirect to={GALLERY_API_SERVICE_PATH} />
        )
    }

    return (
        <div>
            <TopBar/>
            <Divider/>
            <Container/>
        </div>
    );
}

export default GalleryPage;
