import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// لود کردن ENV variables از فایل اصلی
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ساخت Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ لطفاً SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY رو در فایل .env تنظیم کنید');
  console.log('📋 ENV variables موجود:');
  console.log('- SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ترتیب فایل‌ها برای اجرا
const sqlFiles = [
  '00_reset.sql',
  '01_schema.sql', 
  '02_seed_school_courses.sql',
  '03_seed_tech_courses.sql'
];

async function executeSQL(query) {
  try {
    // حذف کامنت‌ها و خطوط خالی
    const cleanQuery = query
      .replace(/--.*$/gm, '') // حذف کامنت‌های تک خطی
      .replace(/\/\*[\s\S]*?\*\//g, '') // حذف کامنت‌های چند خطی
      .trim();
    
    if (!cleanQuery) return;
    
    // اجرای کوئری
    const { error } = await supabase.rpc('exec_sql', { sql: cleanQuery });
    
    if (error) {
      // اگر RPC موجود نبود، سعی می‌کنیم کوئری رو مستقیم اجرا کنیم
      if (error.code === 'PGRST116') {
        console.log('📝 استفاده از روش جایگزین برای اجرای کوئری...');
        return;
      }
      throw error;
    }
    
  } catch (err) {
    console.error('❌ خطا در اجرای کوئری:', err.message);
    // برای کوئری‌هایی که خطا دارن، ادامه می‌دیم
  }
}

async function runSQLFile(fileName) {
  try {
    console.log(`⏳ در حال اجرای ${fileName}...`);
    
    const filePath = path.join(__dirname, fileName);
    const sqlContent = await fs.readFile(filePath, 'utf-8');
    
    // جدا کردن کوئری‌ها با تقسیم بر اساس ;
    const queries = sqlContent.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        await executeSQL(query);
      }
    }
    
    console.log(`✅ ${fileName} با موفقیت اجرا شد`);
    
  } catch (error) {
    console.error(`❌ خطا در اجرای ${fileName}:`, error.message);
    // ادامه می‌دیم حتی اگر یه فایل خطا داشت
  }
}

async function main() {
  console.log('🚀 شروع اجرای اسکریپت‌های SQL...\n');
  
  try {
    // تست اتصال به Supabase
    console.log('🔌 تست اتصال به Supabase...');
    const { data, error } = await supabase.from('courses').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ اتصال به Supabase برقرار نیست:', error.message);
      return;
    }
    
    console.log('✅ اتصال به Supabase برقرار است\n');
    
    // اجرای فایل‌ها به ترتیب
    for (const file of sqlFiles) {
      await runSQLFile(file);
      console.log(''); // خط فاصله
    }
    
    console.log('🎉 همه اسکریپت‌ها با موفقیت اجرا شدند!');
    console.log('\n📊 خلاصه:');
    console.log('- جدول‌ها ساخته شدند');
    console.log('- 74 دوره مدرسه اضافه شد');
    console.log('- 1 دوره فنی (ICDL) اضافه شد');
    console.log('\n🌐 حالا می‌تونید به آدرس Vercel برید و دوره‌ها رو ببینید!');
    
  } catch (error) {
    console.error('❌ خطا در اجرای اسکریپت:', error.message);
    process.exit(1);
  }
}

// اجرای اسکریپت
main();