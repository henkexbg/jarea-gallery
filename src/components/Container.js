import React, { useContext, useEffect } from 'react';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import { useParams } from 'react-router';
import { Link, Redirect } from 'react-router-dom';
import LoginModal from 'react-login-modal';
import { GalleryContext } from '../context/GalleryContext';
import Gallery from './Gallery';
import Loader from './Loader';
import { IMAGE_FORMAT_THUMBNAIL, GALLERY_API_SERVICE_PATH } from '../api/config';

const Container = () => {
  const { searchTerm } = useParams();
  const { authenticate, authenticated, runSearch, images, loading, setShowFullSizeImageIndex, getImageUrl } = useContext(GalleryContext);

  let handleLogin = (username, password) => {
    authenticate(username, password);
  }

  useEffect(() => {
    runSearch(searchTerm);
  }, [searchTerm, authenticated]);

  if (!authenticated) {
    return (<LoginModal handleLogin={handleLogin}></LoginModal>)
}

if (!searchTerm) {
  return (<Redirect to={GALLERY_API_SERVICE_PATH}></Redirect>)
}

  const galleryDirectories = images.directories ? images.directories.map(oneDir => {
    let oneDirImage = oneDir.image ? getImageUrl(oneDir.image, IMAGE_FORMAT_THUMBNAIL) : null;
    return (
      <ImageListItem key={oneDir.name}>
        <Link to={oneDir.path}>
          {oneDirImage ? <img src={oneDirImage} alt={oneDirImage.name} /> : <CameraAltIcon style={{ fontSize: 160 }}></CameraAltIcon>}
        </Link>
        <ImageListItemBar
          title={oneDir.name}
        />
      </ImageListItem>
    )
  }) : []

  let imageIndex = -1;

  const galleryImages = images.media ? images.media.map(oneImage => {
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
  }) : []

  var allItems = galleryDirectories.concat(galleryImages);

  return (
    <div className='photo-container'>
      {loading ? <Loader /> : <Gallery data={allItems} />}
    </div>
  );
};

export default Container;
