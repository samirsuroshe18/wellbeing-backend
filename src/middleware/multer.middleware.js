import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(process.cwd(), './public/temp'));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ storage });
  // export const upload = multer({ storage : storage });
