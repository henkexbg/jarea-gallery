import React, { Component } from 'react';
import GalleryContextProvider from './context/GalleryContext';
import { HashRouter, Route } from 'react-router-dom';
import ImageCarousel from './components/ImageCarousel';
import { Divider } from '@material-ui/core';
import Container from './components/Container';
import GalleryBreadcrumbs from './components/GalleryBreadcrumbs';

class App extends Component {

  render() {
    return (
      <GalleryContextProvider>
        <HashRouter>
          <Route path='/:searchTerm*' >
            <GalleryBreadcrumbs />
            <Divider />
            <Container />
            <ImageCarousel />
          </Route>
        </HashRouter>
      </GalleryContextProvider>
    );
  }
}


export default App;
