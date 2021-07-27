import React, { useContext } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import './carousel.css';

const ImageCarousel = () => {

    const { images, showFullSizeImageIndex, setShowFullSizeImageIndex, bestImageFormat, getImageUrl, getVideoUrl } = useContext(GalleryContext);

    if (showFullSizeImageIndex < 0) {
        return (false);
    }
    else {
        var i = 0;
        const carouselImages = images.images ? images.images.map(oneImage => {
            let oneGalleryImage = {};
            oneGalleryImage.filename = oneImage.filename;
            oneGalleryImage.url = getImageUrl(oneImage, bestImageFormat);

            var indexDiff = Math.abs(showFullSizeImageIndex - i);
            if (indexDiff > 1) {
                oneGalleryImage.url = '';
            }
            i++;
            return (
                <img key={oneGalleryImage.filename} className='gallery-image' src={oneGalleryImage.url} alt={oneGalleryImage.filename} />
            )
        }) : [];


        const carouselVideos = images.videos ? images.videos.map(oneImage => {
            let oneGalleryImage = {};
            oneGalleryImage.filename = oneImage.filename;
            oneGalleryImage.url = getImageUrl(oneImage, bestImageFormat);

            var indexDiff = Math.abs(showFullSizeImageIndex - i);
            if (indexDiff > 1) {
                oneGalleryImage.url = '';
            }
            i++;

            oneGalleryImage.videoUrl = getVideoUrl(oneImage, 'COMPACT');
            oneGalleryImage.contentType = oneImage.contentType;
            return (
                <video key={oneGalleryImage.filename} style={{ maxWidth: '90%', maxHeight: '90vh', alignSelf: 'center' }} preload='none' controls poster={oneGalleryImage.url}>
                    <source src={oneGalleryImage.videoUrl} type={oneGalleryImage.contentType} />
                </video>
            )
        }) : [];


        var onChange = (index, item) => {
            setShowFullSizeImageIndex(index);
        };

        return (
            <Carousel selectedItem={showFullSizeImageIndex} showThumbs={false} showStatus={false} showIndicators={false} swipeable={true} emulateTouch={true} autoPlay={false} onClickItem={() => setShowFullSizeImageIndex(-1)} onChange={onChange}>
                {carouselImages}
                {carouselVideos}
            </Carousel>
        );
    }

}

export default ImageCarousel;