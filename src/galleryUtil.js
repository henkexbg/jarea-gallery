import {HASH_SEPARATOR} from "./GalleryConstants";

export const getBasePathFromSearchTerm = (searchTerm) => {
    let splitSearchTerm = searchTerm.split(HASH_SEPARATOR);
    let basePath = splitSearchTerm[0];
    if (!basePath.startsWith('/')) {
        basePath = '/' + basePath;
    }
    return basePath;
}
