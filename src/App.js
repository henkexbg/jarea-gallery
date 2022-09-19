import React, {useContext} from 'react';
import {GalleryContext} from './context/GalleryContext';
import {HashRouter, Route, Switch} from 'react-router-dom';
import SignIn from './components/SignIn';
import CarouselPage from './CarouselPage';
import GalleryPage from './GalleryPage';

const App = () => {
    const {authenticate, authenticated} = useContext(GalleryContext);

    let handleLogin = (username, password, handleFailedLogin) => {
        authenticate(username, password, handleFailedLogin);
    }

    if (!authenticated) {
        return (
            <SignIn handleLogin={handleLogin}/>
        )
    }

    return (
        <HashRouter>
            <Switch>
                <Route path='/fullScreen' component={CarouselPage}>
                </Route>
                <Route path='/:searchTerm*' component={GalleryPage}>
                </Route>
            </Switch>
        </HashRouter>
    );
}

export default App;
