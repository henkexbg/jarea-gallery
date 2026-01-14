import React, { useContext, useEffect, useMemo, useRef } from 'react';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import Gallery from './Gallery';
import Loader from './Loader';
import { IMAGE_FORMAT_THUMBNAIL, GALLERY_API_SERVICE_PATH } from '../api/config';

const Container = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const lastClickedElementId = searchParams.get('prevElementId');

    const ref = useRef(null);
    const { loading, setShowFullSizeImageIndex, getImageUrl, state } = useContext(GalleryContext);

    const publicPath = location.pathname ? location.pathname.substring(1) : '';

    const linkClicked = (elementKey) => {
        const paramsCopy = new URLSearchParams(location.search);
        paramsCopy.set('prevElementId', elementKey);
        navigate({ pathname: location.pathname, search: paramsCopy.toString() }, { replace: true });
    };

    const showImageCarousel = (elementId, imageIndex) => {
        setShowFullSizeImageIndex(imageIndex);
    };

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    });

    if (!publicPath) {
        return (<Navigate to={GALLERY_API_SERVICE_PATH} replace/>);
    }

    const galleryDirectories = state.directories ? state.directories.map(oneDir => {
        const oneDirImage = oneDir.image ? getImageUrl(oneDir.image, IMAGE_FORMAT_THUMBNAIL) : null;
        return (
            <ImageListItem key={oneDir.path}>
                <Link to={{ pathname: oneDir.path }} onClick={() => linkClicked(oneDir.path)}
                      ref={oneDir.path === lastClickedElementId ? ref : null}>
                    {oneDirImage ?
                        <img
                            src={oneDirImage}
                            alt={oneDirImage.name}
                            loading='lazy'
                            style={{ display: 'flex', justifyContent: 'center', maxHeight: 250 }}
                        />
                        : <CameraAltIcon style={{ fontSize: 160 }}></CameraAltIcon>}
                </Link>
                <ImageListItemBar
                    title={oneDir.name}
                />
            </ImageListItem>
        );
    }) : [];

    let imageIndex = -1;

    const galleryImages = state.media ? state.media.map(oneImage => {
        imageIndex++;
        const localImageIndex = imageIndex;
        const oneGalleryImageUrl = getImageUrl(oneImage, IMAGE_FORMAT_THUMBNAIL);
        return (
            <Link to='/fullScreen' onClick={() => linkClicked(oneImage.formatPath)}
                  ref={oneImage.formatPath === lastClickedElementId ? ref : null} key={oneImage.formatPath}>
                <li>
                    <img
                        src={oneGalleryImageUrl}
                        alt={oneImage.filename}
                        loading='lazy'
                        style={{ display: 'flex', justifyContent: 'center', maxHeight: 250 }}
                        onClick={() => showImageCarousel(oneImage.filename, localImageIndex)}
                    />
                </li>
            </Link>

        );
    }) : [];

    const allItems = galleryDirectories.concat(galleryImages);

    return (
        <div className='photo-container'>
            {loading ? <Loader/> : <Gallery data={allItems}/>}
        </div>
    );
};

export default Container;
