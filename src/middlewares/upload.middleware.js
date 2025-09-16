const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

// Filtro de archivos - ACTUALIZADO
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".glb", ".png", ".jpg", ".jpeg", ".bmp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Formato de archivo no válido. Solo se permiten: ${allowedExtensions.join(
          ", "
        )}`
      ),
      false
    );
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB (ajustable según necesidades)
  },
});

module.exports = upload;
