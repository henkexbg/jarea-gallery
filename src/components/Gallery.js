import React from 'react';
import NoImages from './NoImages';

const Gallery = props => {
  const results = props.data;
  
  if (results.length === 0) {
    return (<NoImages></NoImages>)
  }
  return (
    <div>
      <ul>{results}</ul>
    </div>
  );
};

export default Gallery;
