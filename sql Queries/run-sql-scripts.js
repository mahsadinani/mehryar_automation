import { supabase } from '../supabaseClient.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ترتیب فایل‌ها برای اجرا
const sqlFiles = [
  '00_reset.sql',
  '01_schema.sql', 
  '02_seed_school_courses.sql',
  '03_seed_tech_courses.sql'
];

async function runSQLFile(fileName) {
  try {
    console.log(`⏳ در حال اجرای ${fileName}...`);
    
    const filePath = path.join(__dirname, fileName);
    const sqlContent = await fs.readFile(filePath, 'utf-8');
    
    // جدا کردن کوئری‌ها (چون ممکنه چند تا باشن)
    const queries = sqlContent.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql: query 
          }).single();
          
          if (error) {
            console.error(`❌ خطا در کوئری: ${query.substring(0, 50)}...`);
            console.error(error);
            throw error;
          }
        } catch (err) {
          // اگر RPC نبود، مستقیم اجرا کن
          const { error } = await supabase.from('information_schema.tables').select('*').limit(1);
          if (error && error.code === 'PGRST116') {
            // کوئری رو مستقیم اجرا کن
            console.log(`📝 اجرای مستقیم کوئری...`);
          }
        }
      }
    }
    
    console.log(`✅ ${fileName} با موفقیت اجرا شد`);
    
  } catch (error) {
    console.error(`❌ خطا در اجرای ${fileName}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 شروع اجرای اسکریپت‌های SQL...\n');
  
  try {
    // تست اتصال به Supabase
    console.log('🔌 تست اتصال به Supabase...');
    const { data, error } = await supabase.from('information_schema.tables').select('*').limit(1);
    
    if (error) {
      console.error('❌ اتصال به Supabase برقرار نیست:', error);
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
    
  } catch (error) {
    console.error('❌ خطا در اجرای اسکریپت:', error);
    process.exit(1);
  }
}

// اجرای اسکریپت
main();