// ===== CONEXIÓN CON SUPABASE =====
// La URL y la clave publicable son públicas: se pueden usar en el navegador.
const SUPABASE_URL = "https://tovezadotneadvjvxfpa.supabase.co";
const SUPABASE_KEY = "sb_publishable_LrB8ACpYUN05yX-w7pa-qA_9c1TIkfy";

// "supabase" lo crea la librería cargada desde el CDN
const clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
