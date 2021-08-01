
import React, { useContext } from 'react';
import { GalleryContext } from '../context/GalleryContext';
import { Link } from 'react-router-dom';
import { Box, Breadcrumbs, Typography } from '@material-ui/core';

const GalleryBreadcrumbs = props => {

  const { breadcrumbs } = useContext(GalleryContext);

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
    <Box className='breadcrumb-box'>
      <Breadcrumbs aria-label='breadcrumb'>
        {breadcrumbComponents}
      </Breadcrumbs>
    </Box>
  )

}

export default GalleryBreadcrumbs;
