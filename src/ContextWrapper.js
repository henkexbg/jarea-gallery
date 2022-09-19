import React, {Component} from 'react';
import GalleryContextProvider from './context/GalleryContext';
import App from './App'

class ContextWrapper extends Component {

    render() {
        return (
            <GalleryContextProvider>
                <App/>
            </GalleryContextProvider>
        );
    }
}

export default ContextWrapper;
