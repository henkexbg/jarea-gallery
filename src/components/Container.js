import React, { useContext, useEffect } from 'react';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import { useParams } from 'react-router';
import { Link, Redirect } from 'react-router-dom';
import LazyLoad from 'react-lazy-load';
import { GalleryContext } from '../context/GalleryContext';
import Gallery from './Gallery';
import Loader from './Loader';
import SignIn from './SignIn';
import { IMAGE_FORMAT_THUMBNAIL, GALLERY_API_SERVICE_PATH } from '../api/config';

const Container = () => {
  const { searchTerm } = useParams();
  const { authenticate, authenticated, runSearch, media, directories, loading, setShowFullSizeImageIndex, getImageUrl } = useContext(GalleryContext);

  let handleLogin = (username, password, handleFailedLogin) => {
    authenticate(username, password, handleFailedLogin);
  }

  let showImageCarousel = (imageIndex) => {
    setShowFullSizeImageIndex(imageIndex)
  }

  useEffect(() => {
    runSearch(searchTerm);
  }, [searchTerm, authenticated]);

  if (!authenticated) {
    return (<SignIn handleLogin={handleLogin} />)
  }

  if (!searchTerm) {
    return (<Redirect to={GALLERY_API_SERVICE_PATH}></Redirect>)
  }

  const galleryDirectories = directories ? directories.map(oneDir => {
    let oneDirImage = oneDir.image ? getImageUrl(oneDir.image, IMAGE_FORMAT_THUMBNAIL) : null;
    return (
      <ImageListItem key={oneDir.name}>
        <Link to={oneDir.path}>
          {oneDirImage ?
            <LazyLoad height={300} offsetVertical={500} debounce={false} style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={oneDirImage} alt={oneDirImage.name} />
            </LazyLoad> : <CameraAltIcon style={{ fontSize: 160 }}></CameraAltIcon>}
        </Link>
        <ImageListItemBar
          title={oneDir.name}
        />
      </ImageListItem>
    )
  }) : []

  let imageIndex = -1;

  const galleryImages = media ? media.map(oneImage => {
    imageIndex++;
    let localImageIndex = imageIndex;
    let oneGalleryImageUrl = getImageUrl(oneImage, IMAGE_FORMAT_THUMBNAIL);
    return (
      <li key={oneImage.filename}>
        <LazyLoad height={70} offsetVertical={500} debounce={false} style={{ display: 'flex', justifyContent: 'center' }}>
          {/* <img src={oneGalleryImageUrl} alt={oneImage.filename} onClick={() => setShowFullSizeImageIndex(localImageIndex)} /> */}
          <img src={oneGalleryImageUrl} alt={oneImage.filename} onClick={() => showImageCarousel(localImageIndex)} />
        </LazyLoad>
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
