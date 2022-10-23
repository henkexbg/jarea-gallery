import React, {useContext, useEffect, useRef} from 'react';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import {useParams} from 'react-router';
import {Link, Redirect, useLocation} from 'react-router-dom';
import LazyLoad from 'react-lazy-load';
import {GalleryContext} from '../context/GalleryContext';
import Gallery from './Gallery';
import Loader from './Loader';
import {IMAGE_FORMAT_THUMBNAIL, GALLERY_API_SERVICE_PATH} from '../api/config';

const Container = () => {
    const location = useLocation();
    let params = new URLSearchParams(location.search);
    let lastClickedElementId = params.get('prevElementId');

    const ref = useRef(null);
    const {publicPath} = useParams();
    const {loading, setShowFullSizeImageIndex, getImageUrl, state} = useContext(GalleryContext);

    let linkClicked = (elementKey) => {
        params.set('prevElementId', elementKey);
        let newUrl = '#' + location.pathname + '?' + params.toString();
        window.location.replace(newUrl);
    }

    let showImageCarousel = (elementId, imageIndex) => {
        setShowFullSizeImageIndex(imageIndex);
    }

    useEffect(() => {
        ref.current?.scrollIntoView({behavior: 'smooth'});
    });

    if (!publicPath) {
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
            <Link to={'/fullScreen'} onClick={event => linkClicked(oneImage.formatPath)}
                  ref={oneImage.formatPath === lastClickedElementId ? ref : null}>
                <li key={oneImage.formatPath}>
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
