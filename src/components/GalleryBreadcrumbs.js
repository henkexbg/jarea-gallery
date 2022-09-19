import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Breadcrumbs, Typography } from '@material-ui/core';
import {GALLERY_API_SERVICE_PATH} from "../api/config";
import {useParams} from 'react-router';
import {getBasePathFromSearchTerm} from "../galleryUtil";

const GalleryBreadcrumbs = () => {

  const {searchTerm} = useParams();
  let path = getBasePathFromSearchTerm(searchTerm);
  let breadcrumbs = generateBreadcrumbs(GALLERY_API_SERVICE_PATH, path);

  let breadcrumbComponents = breadcrumbs.map((breadcrumb, i, array) => {
    if (i === array.length - 1) {
      return (
        <Typography color='inherit' key={i}>
          {breadcrumb.displayName}
        </Typography>
      )
    }
    return (
      <Link color='inherit' to={breadcrumb.path} key={i}>
        {breadcrumb.displayName}
      </Link>
    )
  });

  return (
    <Box className='breadcrumb-box' style={{marginBottom: 30}}>
      <Breadcrumbs aria-label='breadcrumb'>
        {breadcrumbComponents}
      </Breadcrumbs>
    </Box>
  )
}

function generateBreadcrumbs(basePath, path) {
  let breadcrumbs = [];
  if (path) {
    let pathParts = path.replace(basePath, '').split('/');
    let currentPath = basePath;
    breadcrumbs.push({ displayName: 'Root', path: currentPath });
    pathParts.forEach(function (item) {
      if (item && item.length > 0) {
        currentPath += '/' + item;
        breadcrumbs.push({ displayName: item, path: currentPath });
      }
    });
  }
  return breadcrumbs;
}

export default GalleryBreadcrumbs;
