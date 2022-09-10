import React, { useContext } from 'react';
import {GalleryContext} from './context/GalleryContext';
import { HashRouter, Route } from 'react-router-dom';
import ImageCarousel from './components/ImageCarousel';
import { Divider } from '@material-ui/core';
import Container from './components/Container';
import GalleryBreadcrumbs from './components/GalleryBreadcrumbs';
import TopBar from './components/TopBar';
import SignIn from "./components/SignIn";

const App = props => {
    const { authenticate, authenticated } = useContext(GalleryContext);

    let handleLogin = (username, password, handleFailedLogin) => {
        authenticate(username, password, handleFailedLogin);
    }

    if (!authenticated) {
      return (
        <SignIn handleLogin={handleLogin} />
      )
    }

    return (
        <HashRouter>
          <Route path='/:searchTerm*' >
            <TopBar />
            <GalleryBreadcrumbs />
            <Divider />
            <Container />
            <ImageCarousel />
          </Route>
        </HashRouter>
    );
}

export default App;
