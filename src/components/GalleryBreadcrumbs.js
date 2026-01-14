import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Typography } from '@mui/material';
import { GALLERY_API_SERVICE_PATH } from '../api/config';

const GalleryBreadcrumbs = () => {
  const { '*': wildcardPath } = useParams();
  const path = wildcardPath ? `/${wildcardPath}` : GALLERY_API_SERVICE_PATH;
  const breadcrumbs = generateBreadcrumbs(GALLERY_API_SERVICE_PATH, path);

  const breadcrumbComponents = breadcrumbs.map((breadcrumb, i, array) => {
    if (i === array.length - 1) {
      return (
        <Typography color='inherit' key={i}
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
        >
          {breadcrumb.displayName}
        </Typography>
      );
    }
    return (
      <Link to={breadcrumb.path} key={i}>
        {breadcrumb.displayName}
      </Link>
    );
  });

  const searchParams = new URLSearchParams(useLocation().search);
  const searchTermQuery = searchParams.get('searchTerm');

  return (
    <Box className='breadcrumb-box'>
      {searchTermQuery ?
          <div className='search-result-text'>Search for '{searchTermQuery}' in:</div> : ''}
      <Breadcrumbs aria-label='breadcrumb' sx={{ mr: 2 }}>
        {breadcrumbComponents}
      </Breadcrumbs>
    </Box>
  );
};

function generateBreadcrumbs(basePath, path) {
  const breadcrumbs = [];
  if (path) {
    const pathParts = path.replace(basePath, '').split('/');
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
