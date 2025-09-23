// storageService.js - Versión mejorada
const supabase = require("../config/supabase");

class StorageService {
  constructor(bucketName = "uploads") {
    this.bucketName = bucketName;
  }

  async uploadFile(file, fileName) {
    try {
      console.log("📤 Intentando subir archivo a Supabase...");
      console.log("Nombre del archivo:", fileName);
      console.log("Tipo MIME:", file.mimetype);
      console.log("Tamaño del buffer:", file.buffer?.length || "No disponible");

      // Validar que el buffer exista
      if (!file.buffer) {
        throw new Error("El archivo no contiene buffer de datos");
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false, // Cambiar a false para evitar sobrescribir
          cacheControl: "3600",
        });

      if (error) {
        console.error("❌ Error de Supabase:", error);
        throw new Error(`Error subiendo archivo: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      console.log("✅ Archivo subido exitosamente:", data.path);
      console.log("🔗 URL pública:", urlData.publicUrl);

      return {
        fileName: data.path,
        publicUrl: urlData.publicUrl,
      };
    } catch (error) {
      console.error("💥 Storage Service Error:", error);
      throw error;
    }
  }

  async deleteFile(fileName) {
    try {
      console.log("🗑️ Intentando eliminar archivo:", fileName);

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([fileName]);

      if (error) {
        console.error("❌ Error eliminando archivo:", error.message);
        return { success: false, error: error.message };
      }

      console.log("✅ Archivo eliminado exitosamente");
      return { success: true };
    } catch (error) {
      console.error("💥 Error eliminando archivo:", error);
      return { success: false, error: error.message };
    }
  }

  generateUniqueFileName(originalName) {
    const ext = originalName.split(".").pop();
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    return `platos/${timestamp}-${random}.${ext}`;
  }

  // Método adicional para verificar si el bucket existe
  async checkBucket() {
    try {
      const { data, error } = await supabase.storage.getBucket(this.bucketName);
      if (error) throw error;
      return { exists: true, data };
    } catch (error) {
      console.error("Bucket check error:", error);
      return { exists: false, error };
    }
  }
}

module.exports = new StorageService();
