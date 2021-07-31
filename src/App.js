import React, { Component } from 'react';
import GalleryContextProvider from './context/GalleryContext';
import { HashRouter, Route } from 'react-router-dom';
import ImageCarousel from './components/ImageCarousel';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Container from './components/Container';
import GalleryBreadcrumbs from './components/GalleryBreadcrumbs';

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <GalleryContextProvider>
        <HashRouter>
        <Route path='/:searchTerm*' >
        <GalleryBreadcrumbs />
        <Tabs>
          <TabList>
            <Tab>Gallery</Tab>
          </TabList>
          <TabPanel>
            <Container></Container>
          </TabPanel>
          <ImageCarousel></ImageCarousel>
        </Tabs>
        </Route>
        </HashRouter>
      </GalleryContextProvider>
    );
  }
}


export default App;
