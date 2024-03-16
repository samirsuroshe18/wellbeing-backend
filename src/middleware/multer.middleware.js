import multer from "multer";
import path from "path";

// Get the absolute path to the destination directory
const destinationPath = path.resolve(process.cwd(), 'src', 'public', 'temp');

// Ensure that the directory exists, create it if it doesn't
if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ storage });
