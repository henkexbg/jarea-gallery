export const GALLERY_API_SERVICE_PATH = '/gallery/service'

// States whether the React app is deployed together with the Gallery API (true), or whether the React app is deployed separately (false)
export const JOINT_DEPLOYMENT = true

// These attributes should be used when JOINT_DEPLOYMENT is true - no explicit base URLs required anymore
export const GALLERY_API_ROOT_URL = ''
export const GALLERY_API_SERVICE_URL = `${GALLERY_API_SERVICE_PATH}`
export const GALLERY_API_IMAGE_ROOT_URL = ''


// These attributes should be used when JOINT_DEPLOYMENT is false - explicit base URLs for Gallery API required
// Chrome quirks for basic auth require one different setting vs Firefox
//const GALLERY_API_SERVICE_PROTOCOL='http://'
//const GALLERY_API_SERVICE_HOST='localhost:8080'
//export const GALLERY_API_ROOT_URL=`${GALLERY_API_SERVICE_PROTOCOL}${GALLERY_API_SERVICE_HOST}`
//export const GALLERY_API_SERVICE_URL=`${GALLERY_API_SERVICE_PROTOCOL}${GALLERY_API_SERVICE_HOST}${GALLERY_API_SERVICE_PATH}`
// Firefox
//export const GALLERY_API_IMAGE_ROOT_URL=`${GALLERY_API_SERVICE_PROTOCOL}{username}:{password}@${GALLERY_API_SERVICE_HOST}`
// Chrome
//export const GALLERY_API_IMAGE_ROOT_URL=`${GALLERY_API_SERVICE_PROTOCOL}${GALLERY_API_SERVICE_HOST}`


export const IMAGE_FORMAT_THUMBNAIL = 'thumb'
