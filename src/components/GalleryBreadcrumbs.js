import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Box, Breadcrumbs, Typography} from '@material-ui/core';
import {GALLERY_API_SERVICE_PATH} from "../api/config";
import {useParams} from 'react-router';

const GalleryBreadcrumbs = () => {

  const {publicPath} = useParams();
  let path = '/' + publicPath;
  console.log('path: ' + path);
  let breadcrumbs = generateBreadcrumbs(GALLERY_API_SERVICE_PATH, path);

  let breadcrumbComponents = breadcrumbs.map((breadcrumb, i, array) => {
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
      )
    }
    return (
      <Link color='inherit' to={breadcrumb.path} key={i}>
        {breadcrumb.displayName}
      </Link>
    )
  });

  let useQuery = () => {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
  }
  let query = useQuery();
  let searchTermQuery = query.get("searchTerm");

  return (
    <Box className='breadcrumb-box'>
      {searchTermQuery ?
          <div className='search-result-text'>Search for '{searchTermQuery}' in:</div> : ''}
      <Breadcrumbs aria-label='breadcrumb' sx={{ mr: 2 }}>
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
