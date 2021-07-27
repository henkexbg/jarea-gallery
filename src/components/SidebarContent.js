import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { useParams } from 'react-router';
import { Link, Redirect } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageListItemBar from '@material-ui/core/ImageListItemBar';
import { Box, Breadcrumbs, Divider, Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import NoDirectories from './NoDirectories';
import LoginModal from 'react-login-modal';
import { IMAGE_FORMAT_THUMBNAIL, GALLERY_API_SERVICE_PATH } from '../api/config';

const useStyles = makeStyles((theme) => ({
  root: {
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  imageList: {
    width: 500
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
}));

const SidebarContent = props => {
  const { searchTerm } = useParams();
  const { images, authenticate, runSearch, breadcrumbs, authenticated, getImageUrl } = useContext(GalleryContext);

  let handleLogin = (username, password) => {
    authenticate(username, password);
  }  

  var directoryImages = images.directories ? images.directories.map(directory => {
    let oneImage = {};
    if (directory.image) {
      oneImage.img = getImageUrl(directory.image, IMAGE_FORMAT_THUMBNAIL);
    }
    oneImage.link = directory.path;
    oneImage.title = directory.name;
    return oneImage;
  }) : [];

  useEffect(() => {
    runSearch(searchTerm);
  }, [searchTerm, authenticated]);

  let breadcrumbComponents = breadcrumbs.map((breadcrumb, i, array) => {
    if (i === array.length -1) {
      return (
        <Typography color='inherit'>
          {breadcrumb.displayName}
        </Typography>
      )
    }
    return (
      <Link color='inherit' to={breadcrumb.path}>
        {breadcrumb.displayName}
      </Link>
    )
  });

  const classes = useStyles();

  let imageList =
    (<ImageList rowHeight={180} className={classes.imageList}>
      {directoryImages.map((item) => (
        <ImageListItem key={item.img}>
          <Link to={item.link}>
            {item.img ? <img src={item.img} alt={item.title} /> : <CameraAltIcon style={{ fontSize: 160 }}></CameraAltIcon>}
          </Link>
          <ImageListItemBar
            title={item.title}
            actionIcon={
              <IconButton aria-label={`info about ${item.title}`} className={classes.icon}>
                <InfoIcon />
              </IconButton>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>)

if (!authenticated) {
    return (<LoginModal handleLogin={handleLogin}></LoginModal>)
}

if (!searchTerm) {
  return (<Redirect to={GALLERY_API_SERVICE_PATH}></Redirect>)
}

  return (
    <div className={classes.root}>
      <h2 className='directory-title'>Directories</h2>
      <Box>
        <Breadcrumbs aria-label='breadcrumb'>
          {breadcrumbComponents}
        </Breadcrumbs>
      </Box>
      <Divider style={{marginTop: '5px', marginBottom: '8px'}}></Divider>
      {directoryImages.length === 0 ? <NoDirectories></NoDirectories> : imageList}
    </div>
  );
};

SidebarContent.propTypes = {
  style: PropTypes.object
};

export default SidebarContent;