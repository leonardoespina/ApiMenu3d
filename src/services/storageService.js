const supabase = require("../config/supabase");

class StorageService {
  constructor(bucketName = "uploads") {
    this.bucketName = bucketName;
  }

  // Subir archivo a Supabase Storage
  async uploadFile(file, fileName) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      return {
        fileName: data.path,
        publicUrl: urlData.publicUrl,
      };
    } catch (error) {
      console.error("Storage Service Error:", error);
      throw error;
    }
  }

  // Eliminar archivo de Supabase Storage
  async deleteFile(fileName) {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([fileName]);

      if (error) {
        console.error("Error deleting file:", error.message);
        // No lanzamos error para no interrumpir el flujo principal
      }

      return { success: true };
    } catch (error) {
      console.error("Storage Service Delete Error:", error);
      // No lanzamos error para no interrumpir el flujo principal
      return { success: false };
    }
  }

  // Generar nombre único para el archivo
  generateUniqueFileName(originalName) {
    const ext = originalName.split(".").pop();
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    return `${timestamp}-${random}.${ext}`;
  }
}

module.exports = new StorageService();
