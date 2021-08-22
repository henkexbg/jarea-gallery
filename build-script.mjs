import fs from 'fs'
import fse from 'fs-extra'
import { exit } from 'process';
import fetch from 'node-fetch';
import unzipper from 'unzipper';

const BUILD_DIR = './build';
const BUNDLE_DIR = './bundle';
const BUNDLE_DIR_PUBLIC = `${BUNDLE_DIR}/public`;
const BUNDLE_DIR_CONFIG = `${BUNDLE_DIR}/config`;
const GALLERY_API_VERSION = process.env.npm_package_gallery_api_version;
const GALLERY_API_JAR_URL = `https://search.maven.org/remotecontent?filepath=com/github/henkexbg/gallery-api/${GALLERY_API_VERSION}/gallery-api-${GALLERY_API_VERSION}.jar`
const GALLERY_API_JAR_FILE = `${BUNDLE_DIR}/gallery-api.jar`;
const TMP_UNZIPPED_JAR_DIR = `${BUNDLE_DIR}/temp`;
const TMP_UNZIPPED_SAMPLE_CONFIG_DIR = `${TMP_UNZIPPED_JAR_DIR}/BOOT-INF/classes/sample_config`;

console.log(`Building bundle. Using Gallery API version ${GALLERY_API_VERSION}`);

/////////////////////////////////////////////////////////////////////////////
// CREATE BUNDLE DIRECTORIES IF NOT EXISTING
/////////////////////////////////////////////////////////////////////////////
if (!fs.existsSync(BUNDLE_DIR)) {
  fs.mkdir(BUNDLE_DIR, function (err) {
    if (err) {
      console.log(err);
      exit(1);
    } else {
      console.log(`Created ${BUNDLE_DIR}`);
    }
  })
}
if (!fs.existsSync(BUNDLE_DIR_PUBLIC)) {
  fs.mkdir(BUNDLE_DIR_PUBLIC, function (err) {
    if (err) {
      console.log(err);
      exit(1);
    } else {
      console.log(`Created ${BUNDLE_DIR_PUBLIC}`);
    }
  })
}

///////////////////////////////////////////////////////////////////////////////
// COPY REACT BUILD INTO BUNDLE
///////////////////////////////////////////////////////////////////////////////
fse.copySync(BUILD_DIR, BUNDLE_DIR_PUBLIC);

///////////////////////////////////////////////////////////////////////////////
// DOWNLOAD GALLERY-API JAR IF NOT ALREADY EXISTING
///////////////////////////////////////////////////////////////////////////////
if (!fs.existsSync(GALLERY_API_JAR_FILE)) {
  await fetch(GALLERY_API_JAR_URL)
    .then(res => {
      if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
      } else {
        console.log(`Error when downloading Gallery API from ${GALLERY_API_JAR_URL}`);
        throw Error(res.statusText);
      }
    })
    .then(res => {
      const dest = fs.createWriteStream(GALLERY_API_JAR_FILE);
      res.body.pipe(dest);
    }).catch(err => console.error(err));
}

///////////////////////////////////////////////////////////////////////////////
// CREATE TEMPORARY DIRECTORY TO EXTRACT JAR TO
///////////////////////////////////////////////////////////////////////////////
if (!fs.existsSync(TMP_UNZIPPED_JAR_DIR)) {
  fs.mkdirSync(TMP_UNZIPPED_JAR_DIR, function (err) {
    if (err) {
      console.log(err);
      exit(1);
    } else {
      console.log(`Created ${TMP_UNZIPPED_JAR_DIR}`);
    }
  })
}

///////////////////////////////////////////////////////////////////////////////
// UNZIP JAR
///////////////////////////////////////////////////////////////////////////////
let unzipRes = () => new Promise((resolve, reject) => {
  fs.createReadStream(GALLERY_API_JAR_FILE)
    .pipe(unzipper.Extract({ path: TMP_UNZIPPED_JAR_DIR }))
    .on('entry', entry => entry.autodrain())
    .on('close', resolve)
    .on('error', reject)
})
await unzipRes()
  .catch(err => {
    console.error(err);
    exit(1);
  });

///////////////////////////////////////////////////////////////////////////////
// COPY SAMPLE CONFIGURATION FROM EXTRACTED JAR INTO CONFIG DIR
///////////////////////////////////////////////////////////////////////////////
fse.copySync(TMP_UNZIPPED_SAMPLE_CONFIG_DIR, BUNDLE_DIR_CONFIG);

///////////////////////////////////////////////////////////////////////////////
// REMOVE TEMPORARY DIRECTORY
///////////////////////////////////////////////////////////////////////////////
fs.rmSync(TMP_UNZIPPED_JAR_DIR, { recursive: true, force: true, maxRetries: 5 });

///////////////////////////////////////////////////////////////////////////////
// PRINT SUCCESS MESSAGE
///////////////////////////////////////////////////////////////////////////////
console.log('\nDone! Bundle can now be found under ./bundle\n\n\
The next step is to configure the app. Look under \
./bundle/config.There are a number of .properties.template files. Rename \
these to .properties, and configure accordingly. Each of the files contains \
instructions.\n\n\
For more details, see Gallery API Github: \
https://github.com/henkexbg/gallery-api\n\n\
The program can then be started by running "java -jar gallery-api.jar"');