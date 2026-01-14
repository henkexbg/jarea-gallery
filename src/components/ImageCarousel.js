import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { GalleryContext } from '../context/GalleryContext';
import './carousel.css';

const ImageCarousel = () => {
    const { showFullSizeImageIndex, setShowFullSizeImageIndex, getImageUrl, getVideoUrl, state } = useContext(GalleryContext);
    const activeVideo = useRef(null);
    const [activeVideoState, setActiveVideoState] = useState(null);
    const location = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        if (navigationType === 'POP' && showFullSizeImageIndex >= 0) {
            setShowFullSizeImageIndex(-1);
        }
    }, [navigationType, location, showFullSizeImageIndex, setShowFullSizeImageIndex]);

    if (showFullSizeImageIndex < 0) {
        return false;
    } else {
        let i = 0;
        const carouselMedia = state.media ? state.media.map(oneImage => {
            const oneGalleryImage = {};
            oneGalleryImage.filename = oneImage.filename;
            oneGalleryImage.url = getImageUrl(oneImage, state.bestImageFormat);

            const indexDiff = Math.abs(showFullSizeImageIndex - i);
            if (indexDiff > 1) {
                oneGalleryImage.url = '';
            }
            i++;
            if (oneImage.videoPath) {
                const videoRef = i === showFullSizeImageIndex ? activeVideo : null;
                oneGalleryImage.videoUrl = getVideoUrl(oneImage);
                oneGalleryImage.contentType = oneImage.contentType;
                return (
                    <video key={oneGalleryImage.filename} ref={videoRef} style={{ maxWidth: '90%', maxHeight: '90vh', alignSelf: 'center' }} preload='none' controls poster={oneGalleryImage.url} onPlay={(v) => setPlayingVideo(v)} onClick={(e) => e.stopPropagation()}>
                        <source src={oneGalleryImage.videoUrl} type={oneGalleryImage.contentType} />
                    </video>
                );
            }
            return (
                <img key={oneGalleryImage.filename} className='gallery-image' src={oneGalleryImage.url} alt={oneGalleryImage.filename} />
            );
        }) : [];

        const onChange = (index) => {
            const video = activeVideoState;
            if (video && !video.paused) {
                video.pause();
            }
            setShowFullSizeImageIndex(index);
        };

        const setPlayingVideo = (item) => {
            setActiveVideoState(item.target);
        };

        return (
            <Carousel selectedItem={showFullSizeImageIndex} showThumbs={false} showStatus={false} showIndicators={false} swipeable={true} emulateTouch={true} autoPlay={false} interval={9999999} onChange={onChange}>
                {carouselMedia}
            </Carousel>
        );
    }
};

export default ImageCarousel;