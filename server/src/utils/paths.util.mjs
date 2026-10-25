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
  src: src_path,
    controllers: controllers_path,
    importers  : importers_path,
    middlewares: middlewares_path,
    routes     : routes_path,
    utils      : utils_path,

  static: static_path,
    css : css_path,
    ico : ico_path,
    jpeg: jpeg_path,
    js  : js_path,
    pdf : pdf_path,
    png : png_path,
    wav : wav_path,
    webp: webp_path,

  views: views_path,
    errors : errors_path,
    mails  : mails_path,
    private: private_path,
    public : public_path,
};

export default paths;
