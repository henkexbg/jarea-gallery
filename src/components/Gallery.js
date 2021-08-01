import React from 'react';
import NoImages from './NoImages';

const Gallery = props => {
  const results = props.data;
  
  if (results.length === 0) {
    return (<NoImages></NoImages>)
  }
  return (
    <ul>{results}</ul>
  );
};

export default Gallery;
