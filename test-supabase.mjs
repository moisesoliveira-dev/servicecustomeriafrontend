// Script de teste para verificar conexão com Supabase
// Execute: node --env-file=.env.local test-supabase.mjs

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Testando conexão com Supabase...\n");

console.log("URL:", supabaseUrl);
console.log(
  "Anon Key:",
  supabaseAnonKey
    ? `${supabaseAnonKey.substring(0, 20)}...`
    : "(não configurado)"
);
console.log("");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Credenciais do Supabase não configuradas!");
  console.error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Teste 1: Verificar se consegue se conectar
console.log("📡 Teste 1: Verificando tabelas...");
try {
  const { data, error } = await supabase
    .from("companies")
    .select("count")
    .limit(0);

  if (error) {
    console.error("❌ Erro ao conectar:", error.message);
    console.error("   Code:", error.code);
    console.error("   Details:", error.details);
    console.error("   Hint:", error.hint);
    process.exit(1);
  }

  console.log("✅ Conexão estabelecida com sucesso!");
} catch (err) {
  console.error("❌ Erro inesperado:", err.message);
  process.exit(1);
}

// Teste 2: Listar empresas existentes
console.log("\n📋 Teste 2: Listando empresas...");
try {
  const { data, error } = await supabase.from("companies").select("*").limit(5);

  if (error) {
    console.error("❌ Erro:", error.message);
  } else {
    console.log(`✅ ${data.length} empresa(s) encontrada(s):`);
    data.forEach((c) => console.log(`   - ${c.name} (${c.id})`));
  }
} catch (err) {
  console.error("❌ Erro inesperado:", err.message);
}

// Teste 3: Verificar outras tabelas
console.log("\n🔍 Teste 3: Verificando outras tabelas...");
const tables = [
  "integrations",
  "credentials",
  "output_routes",
  "env_vars",
  "execution_logs",
  "user_permissions",
];

for (const table of tables) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
    } else {
      console.log(`   ✅ ${table}: ${count} registro(s)`);
    }
  } catch (err) {
    console.log(`   ❌ ${table}: ${err.message}`);
  }
}

console.log("\n✨ Teste concluído!");
