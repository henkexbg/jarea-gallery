import React, { useContext, useEffect } from 'react';
import { GalleryContext } from './context/GalleryContext';
import { HashRouter, Route, Routes } from 'react-router-dom';
import SignIn from './components/SignIn';
import CarouselPage from './CarouselPage';
import GalleryPage from './GalleryPage';
import Loader from './components/Loader';
import { GALLERY_API_USER_URL } from './api/config';

const App = () => {
    const {
        authenticate,
        authenticated,
        setAuthenticated,
        authLoading,
        setAuthLoading
    } = useContext(GalleryContext);

    const handleLogin = (username, password, handleFailedLogin) => {
        authenticate(username, password, handleFailedLogin);
    };

    useEffect(() => {
        const checkIfAuthenticated = async () => {
            try {
                const response = await fetch(GALLERY_API_USER_URL, {
                    method: 'HEAD',
                    credentials: 'include'
                });
                return response.ok;
            } catch (error) {
                console.log('Error when checking if authenticated: ' + error);
                return false;
            }
        };
        checkIfAuthenticated().then((authCheckOk) => {
            setAuthenticated(authCheckOk);
            setAuthLoading(false);
        });
    }, [setAuthenticated, setAuthLoading]);

    if (authLoading) {
        return <Loader/>;
    }
    if (!authenticated) {
        return (
            <SignIn handleLogin={handleLogin}/>
        );
    }

    return (
        <HashRouter>
            <Routes>
                <Route path='/fullScreen' element={<CarouselPage/>}/>
                <Route path='/*' element={<GalleryPage/>}/>
            </Routes>
        </HashRouter>
    );
};

export default App;
