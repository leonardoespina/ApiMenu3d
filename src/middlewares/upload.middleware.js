const multer = require("multer");
const path = require("path");
const fs = require("fs"); // 👈 Importar fs

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";

    // Verifica si la carpeta existe; si no, la crea
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowed = [".glb", ".png", ".jpeg", ".jpg"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else
    cb(
      new Error(
        "Formato de archivo no válido. Solo se permiten archivos .glb, .png, .jpeg, .jpg"
      ),
      false
    );
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
