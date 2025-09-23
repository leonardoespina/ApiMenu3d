// supabase.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL and Service Key are required in environment variables"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Verificar conexión (opcional)
supabase.storage
  .getBucket("uploads")
  .then(() => console.log("✅ Conexión a Supabase Storage verificada"))
  .catch((err) => console.error("❌ Error conectando a Supabase:", err));

module.exports = supabase;
