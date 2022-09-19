import React, {useContext, useEffect, useRef} from 'react';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import {useParams} from 'react-router';
import {Link, Redirect} from 'react-router-dom';
import LazyLoad from 'react-lazy-load';
import {GalleryContext} from '../context/GalleryContext';
import Gallery from './Gallery';
import Loader from './Loader';
import {IMAGE_FORMAT_THUMBNAIL, GALLERY_API_SERVICE_PATH} from '../api/config';
import {HASH_SEPARATOR} from '../GalleryConstants';

const Container = () => {
    const ref = useRef(null);
    const {searchTerm} = useParams();
    const {loading, setShowFullSizeImageIndex, getImageUrl, state} = useContext(GalleryContext);
    let splitSearchTerm = searchTerm.split(HASH_SEPARATOR);
    let lastClickedElementId = null;
    if (splitSearchTerm.length > 1) {
        lastClickedElementId = splitSearchTerm[1];
    }

    let linkClicked = (elementKey) => {
        let splitHash = window.location.hash.split(HASH_SEPARATOR);
        let baseHash = splitHash[0];
        window.location.replace(baseHash + HASH_SEPARATOR + elementKey);
    }

    let showImageCarousel = (elementId, imageIndex) => {
        setShowFullSizeImageIndex(imageIndex);
    }

    useEffect(() => {
        ref.current?.scrollIntoView({behavior: 'smooth'});
    });

    if (!searchTerm) {
        return (<Redirect to={GALLERY_API_SERVICE_PATH}></Redirect>)
    }

    const galleryDirectories = state.directories ? state.directories.map(oneDir => {
        let oneDirImage = oneDir.image ? getImageUrl(oneDir.image, IMAGE_FORMAT_THUMBNAIL) : null;
        return (
            <ImageListItem key={oneDir.path}>
                <Link to={{pathname: oneDir.path}} onClick={event => linkClicked(oneDir.path)}
                      ref={oneDir.path === lastClickedElementId ? ref : null}>
                    {oneDirImage ?
                        <LazyLoad height={300} offset={500} style={{display: 'flex', justifyContent: 'center'}}>
                            <img src={oneDirImage} alt={oneDirImage.name}/>
                        </LazyLoad> : <CameraAltIcon style={{fontSize: 160}}></CameraAltIcon>}
                </Link>
                <ImageListItemBar
                    title={oneDir.name}
                />
            </ImageListItem>
        )
    }) : []

    let imageIndex = -1;

    const galleryImages = state.media ? state.media.map(oneImage => {
        imageIndex++;
        let localImageIndex = imageIndex;
        let oneGalleryImageUrl = getImageUrl(oneImage, IMAGE_FORMAT_THUMBNAIL);
        return (
            <Link to={'/fullScreen'} key={oneImage.filename} onClick={event => linkClicked(oneImage.filename)}
                  ref={oneImage.filename === lastClickedElementId ? ref : null}>
                <li key={oneImage.filename}>
                    <LazyLoad height={300} offset={500} style={{display: 'flex', justifyContent: 'center'}}>
                        <img src={oneGalleryImageUrl} alt={oneImage.filename}
                             onClick={() => showImageCarousel(oneImage.filename, localImageIndex)}/>
                    </LazyLoad>
                </li>
            </Link>

        )
    }) : []

    let allItems = galleryDirectories.concat(galleryImages);

    return (
        <div className='photo-container'>
            {loading ? <Loader/> : <Gallery data={allItems}/>}
        </div>
    );
};

export default Container;
