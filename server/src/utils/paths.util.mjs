import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename  = fileURLToPath(import.meta.url);
const server_path = join(dirname(__filename), '/../../');


// SERVER level path --------------------------
const src_path = join(server_path, '/src');
  // SRC level path
  const controllers_path = join(src_path, '/controllers');
  const importers_path   = join(src_path, '/importers');
  const middlewares_path = join(src_path, '/middlewares');
  const routes_path      = join(src_path, '/routes');
  const utils_path       = join(src_path, '/utils');
  
const static_path = join(server_path, '/static');
  // STATIC level path
  const css_path  = join(static_path, '/css');
  const ico_path  = join(static_path, '/ico');
  const jpeg_path = join(static_path, '/jpeg');
  const js_path   = join(static_path, '/js');
  const pdf_path  = join(static_path, '/pdf');
  const wav_path  = join(static_path, '/wav');
  const png_path  = join(static_path, '/png');
  const webp_path = join(static_path, '/webp');

const views_path = join(server_path, '/views');
  // VIEWS level path
  const errors_path  = join(views_path, '/errors');
  const mails_path   = join(views_path, '/mails');
  const private_path = join(views_path, '/private');
  const public_path  = join(views_path, '/public');
// ____________________________________________


const paths = {
  srcPath: src_path,
    controllersPath: controllers_path,
    importersPath  : importers_path,
    middlewaresPath: middlewares_path,
    routesPath     : routes_path,
    utilsPath      : utils_path,

  staticPath: static_path,
    cssPath : css_path,
    icoPath : ico_path,
    jpegPath: jpeg_path,
    jsPath  : js_path,
    pdfPath : pdf_path,
    pngPath : png_path,
    wavPath : wav_path,
    webpPath: webp_path,

  viewsPath: views_path,
    errorsPath : errors_path,
    mailsPath  : mails_path,
    privatePath: private_path,
    publicPath : public_path,
};

export default paths;
