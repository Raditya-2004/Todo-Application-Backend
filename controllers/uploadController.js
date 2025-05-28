import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../files");

if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filePath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

const uploadController = {
  uploadMiddleware: upload.single("image"), // ✅ field name must be "image"

  uploadImage: (req, res, User) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: "No userId provided" });

    User.findByPk(userId).then((user) => {
      if (!user) return res.status(404).json({ error: "User not found" });

      user.image = `files/${req.file.filename}`;
      user
        .save()
        .then(() =>
          res.json({
            message: "File uploaded",
            filename: req.file.filename,
            imageUrl: `files/${req.file.filename}`,
          })
        )
        .catch((err) => res.status(500).json({ error: err.message }));
    });
  },
};

export default uploadController;
