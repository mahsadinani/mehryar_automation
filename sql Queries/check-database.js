import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// لود کردن ENV variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ENV variables تنظیم نشدن');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 بررسی وضعیت دیتابیس Supabase...\n');
  
  try {
    // چک کردن موجود بودن جدول‌ها
    const tables = ['courses', 'tech_courses', 'classes', 'students'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ جدول ${table}: وجود ندارد یا خطا دارد`);
        } else {
          console.log(`✅ جدول ${table}: ${count} رکورد`);
        }
      } catch (err) {
        console.log(`❌ جدول ${table}: خطا - ${err.message}`);
      }
    }
    
    console.log('\n📊 بررسی محتوای جدول courses:');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .limit(5);
    
    if (coursesError) {
      console.log('❌ خطا در خواندن دوره‌ها:', coursesError.message);
    } else if (courses && courses.length > 0) {
      console.log('✅ نمونه دوره‌ها:');
      courses.forEach(course => {
        console.log(`  - ${course.id}: ${course.name} (مدرس: ${course.teacher})`);
      });
    } else {
      console.log('⚠️ جدول courses خالی است');
    }
    
    console.log('\n📊 بررسی محتوای جدول tech_courses:');
    const { data: techCourses, error: techError } = await supabase
      .from('tech_courses')
      .select('*')
      .limit(3);
    
    if (techError) {
      console.log('❌ خطا در خواندن دوره‌های فنی:', techError.message);
    } else if (techCourses && techCourses.length > 0) {
      console.log('✅ نمونه دوره‌های فنی:');
      techCourses.forEach(course => {
        console.log(`  - ${course.id}: ${course.name_fa} (${course.name_en}) - کد: ${course.code}`);
      });
    } else {
      console.log('⚠️ جدول tech_courses خالی است');
    }
    
    console.log('\n🔍 بررسی اتصال به API محلی:');
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API محلی: ${data.length} دوره پیدا شد`);
      } else {
        console.log('❌ API محلی در دسترس نیست');
      }
    } catch (err) {
      console.log('❌ خطا در اتصال به API محلی:', err.message);
    }
    
  } catch (error) {
    console.error('❌ خطا در بررسی دیتابیس:', error.message);
  }
}

checkDatabase();