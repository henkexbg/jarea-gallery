import React, { Component } from 'react';
import GalleryContextProvider from './context/GalleryContext';
import { HashRouter, Route } from 'react-router-dom';
import ImageCarousel from './components/ImageCarousel';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Sidebar from 'react-sidebar';
import SidebarContent from './components/SidebarContent';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Container from './components/Container';

import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sidebarDocked: true,
      sidebarOpen: true,
    };
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }
 
  onSetSidebarOpen(open) {
    this.setState({ sidebarOpen: open });
  }

  handleLogin = (username, password) => {
      this.setState({'credentials': {'username': username, 'password': password}});
  }  
   
  render() {
    const sidebar = <SidebarContent />;

    return (
      <GalleryContextProvider>
        <HashRouter>
        <Route path='/:searchTerm*' >

        <Sidebar
        sidebar={sidebar}
        open={this.state.sidebarOpen}
        onSetOpen={this.onSetSidebarOpen}
        styles={{ sidebar: { background: 'white'} }}
      >
        <Box style={{textAlign: 'left'}}>
        <Button variant='contained' color='primary' onClick={() => this.onSetSidebarOpen(true)}>
          Browse Directories
        </Button>
        </Box>
      </Sidebar>
        <Tabs>
          <TabList>
            <Tab>Gallery</Tab>
          </TabList>
          <TabPanel>
            {/* <Item searchTerm='/:searchInput' onThumbnailClick={this.toggleFullSizeImageClick}/> */}
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
