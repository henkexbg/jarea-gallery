import React, { useContext } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import Gallery from './Gallery';
import Loader from './Loader';
import { IMAGE_FORMAT_THUMBNAIL } from '../api/config';

const Container = () => {
  const { images, loading, setShowFullSizeImageIndex, getImageUrl } = useContext(GalleryContext);

  let imageIndex = -1;
  let imagesAndVideos = images.images ? images.images : [];
  if (images.videos) {
    imagesAndVideos = imagesAndVideos.concat(images.videos);
  }

  const galleryImages = imagesAndVideos.map(oneImage => {
    imageIndex++;
    let localImageIndex = imageIndex;
    let oneGalleryImage = {};
    oneGalleryImage.filename = oneImage.filename;
    oneGalleryImage.url = getImageUrl(oneImage, IMAGE_FORMAT_THUMBNAIL);

    return (
      <li key={oneGalleryImage.filename}>
        <img src={oneGalleryImage.url} alt={oneGalleryImage.filename} onClick={() => setShowFullSizeImageIndex(localImageIndex)} />
      </li>
    )
  })

  return (
    <div className='photo-container'>
      {loading ? <Loader /> : <Gallery data={galleryImages} />}
    </div>
  );
};

export default Container;
