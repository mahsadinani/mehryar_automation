import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { supabase, supabaseInfo } from "./supabaseClient.js";
import multer from "multer";
import XLSX from "xlsx";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "Courses infos")));
app.get("/download/tech-template", (req, res) => {
  const filePath = path.join(__dirname, "Courses infos", "tech_courses_template.csv");
  res.set("Content-Type", "text/csv; charset=utf-8");
  res.set("Content-Disposition", "attachment; filename=\"tech_courses_template.csv\"");
  res.sendFile(filePath);
});
app.get("/download/school-template", (req, res) => {
  const filePath = path.join(__dirname, "Courses infos", "school_courses_template.csv");
  res.set("Content-Type", "text/csv; charset=utf-8");
  res.set("Content-Disposition", "attachment; filename=\"school_courses_template.csv\"");
  res.sendFile(filePath);
});
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 3000;
const state = {
  dataLinks: {
    applicantsSheetUrl: "",
    studentsSheetUrl: "",
    financeSheetUrl: "",
    teachersSheetUrl: "",
    messagesSheetUrl: "",
    coursesSheetUrl: "",
    techCoursesSheetUrl: "",
    classesSheetUrl: ""
  },
  applicants: [],
  leads: [],
  classes: [],
  attendance: {},
  transactions: [],
  students: [],
  studentFinanceProfiles: []
};
app.get("/api/data-links", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("data_links").select("key,url");
    if (error) return res.status(500).json({ ok: false });
    const obj = {};
    (data || []).forEach(r => { obj[r.key] = r.url || ""; });
    return res.json(obj);
  }
  res.json(state.dataLinks);
});
app.post("/api/data-links", async (req, res) => {
  const payload = req.body || {};
  if (supabase) {
    const rows = Object.keys(payload).map(k => ({ key: k, url: payload[k] }));
    const { data, error } = await supabase.from("data_links").upsert(rows, { onConflict: "key" });
    if (error) return res.status(500).json({ ok: false });
    const obj = {};
    (data || rows).forEach(r => { obj[r.key] = r.url || ""; });
    return res.json(obj);
  }
  Object.keys(state.dataLinks).forEach(k => {
    if (payload[k] !== undefined) state.dataLinks[k] = payload[k];
  });
  res.json(state.dataLinks);
});
app.post("/api/applicants", async (req, res) => {
  const body = req.body || {};
  const item = {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    name: body.name || "",
    phone: body.phone || "",
    email: body.email || "",
    gender: body.gender || "",
    course: body.course || "",
    familiarity: body.familiarity || "",
    note: body.note || "",
    status: body.status || "new",
    complete: !!body.complete,
    pre_register: !!body.pre_register,
    waiting_applicant: !!body.waiting_applicant,
    next_courses_info: !!body.next_courses_info,
    cancelled: !!body.cancelled,
    send_course_info: !!body.send_course_info
  };
  if (supabase) {
    let { data, error } = await supabase.from("applicants").insert([{ ...item }]).select("*").single();
    if (error && /gender/.test(error.message||"")) {
      const fallback = { ...item };
      delete fallback.gender;
      fallback.note = `${item.note || ""}${item.gender ? ` [gender:${item.gender}]` : ""}`.trim();
      const r2 = await supabase.from("applicants").insert([fallback]).select("*").single();
      if (r2.error) return res.status(500).json({ ok: false, error: r2.error.message });
      return res.json({ ok: true, applicant: r2.data });
    }
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true, applicant: data });
  }
  state.applicants.push({ ...item, createdAt: item.created_at });
  res.json({ ok: true, applicant: item });
});
app.get("/api/applicants", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("applicants").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ ok: false });
    return res.json(data || []);
  }
  res.json(state.applicants);
});
app.put("/api/applicants/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body || {};
  const update = {
    name: body.name,
    phone: body.phone,
    email: body.email,
    gender: body.gender,
    course: body.course,
    familiarity: body.familiarity,
    note: body.note,
    status: body.status,
    complete: !!body.complete,
    pre_register: !!body.pre_register,
    waiting_applicant: !!body.waiting_applicant,
    next_courses_info: !!body.next_courses_info,
    cancelled: !!body.cancelled,
    send_course_info: !!body.send_course_info
  };
  if (supabase) {
    let { data, error } = await supabase.from("applicants").update(update).eq("id", id).select("*").single();
    if (error && /gender/.test(error.message||"")) {
      const fallback = { ...update };
      delete fallback.gender;
      if (update.gender) fallback.note = `${update.note || ""} [gender:${update.gender}]`.trim();
      const r2 = await supabase.from("applicants").update(fallback).eq("id", id).select("*").single();
      if (r2.error) return res.status(500).json({ ok: false, error: r2.error.message });
      return res.json({ ok: true, applicant: r2.data });
    }
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true, applicant: data });
  }
  const idx = state.applicants.findIndex(a => a.id === id);
  if (idx >= 0) {
    state.applicants[idx] = { ...state.applicants[idx], ...update };
    return res.json({ ok: true, applicant: state.applicants[idx] });
  }
  res.status(404).json({ ok: false });
});
app.delete("/api/applicants/:id", async (req, res) => {
  const id = req.params.id;
  if (supabase) {
    const { error } = await supabase.from("applicants").delete().eq("id", id);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true });
  }
  const idx = state.applicants.findIndex(a => a.id === id);
  if (idx >= 0) { state.applicants.splice(idx, 1); return res.json({ ok: true }); }
  res.status(404).json({ ok: false });
});
app.post("/api/pre-register", (req, res) => {
  const body = req.body || {};
  const amount = Number(body.amount || 0);
  const paymentUrl = `https://example.com/pay?ref=${Date.now()}&amount=${amount}`;
  res.json({ ok: true, paymentUrl, data: body });
});
app.get("/api/classes", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("classes").select("*").order("start", { ascending: true });
    if (error) return res.status(500).json({ ok: false });
    return res.json(data || []);
  }
  if (state.classes.length === 0) {
    state.classes = [
      { id: "c1", title: "دوره مقدماتی", teacher: "مدرس A", start: "2025-12-01T08:00:00Z" },
      { id: "c2", title: "دوره پیشرفته", teacher: "مدرس B", start: "2025-12-02T10:00:00Z" }
    ];
  }
  res.json(state.classes);
});
app.post("/api/classes", async (req, res) => {
  const b = req.body || {};
  const item = {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    course_id: b.course_id || null,
    title: b.title || "",
    teacher: b.teacher || "",
    start: b.start || null,
    room: b.room || "",
    code: b.code || "",
    time: b.time || "",
    days: Array.isArray(b.days) ? b.days.join(",") : (b.days || ""),
    sessions_count: Number(b.sessions_count || 0),
    sessions: b.sessions || [],
    end_date: b.end_date || null,
    certificate_issue_date: b.certificate_issue_date || null,
    tech_course_code: b.tech_course_code || ""
  };
  if (supabase) {
    const { data, error } = await supabase.from("classes").insert([item]).select("*").single();
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, cls: data });
  }
  state.classes.push(item);
  res.json({ ok: true, cls: item });
});
app.post("/api/classes/attendance", async (req, res) => {
  const { classId, studentId, present } = req.body || {};
  if (!classId || !studentId) return res.status(400).json({ ok: false });
  if (supabase) {
    const row = { class_id: classId, student_id: studentId, present: !!present, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from("attendance").upsert([row], { onConflict: "class_id,student_id" }).select("*").single();
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, attendance: data });
  }
  const key = `${classId}:${studentId}`;
  state.attendance[key] = { present: !!present, updatedAt: new Date().toISOString() };
  res.json({ ok: true, attendance: state.attendance[key] });
});
app.get("/api/finance/transactions", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ ok: false });
    return res.json(data || []);
  }
  res.json(state.transactions);
});
app.post("/api/finance/transactions", async (req, res) => {
  const body = req.body || {};
  if (supabase) {
    const tx = { id: Date.now().toString(), created_at: new Date().toISOString(), student_id: body.studentId || "", amount: Number(body.amount || 0), note: body.note || "" };
    const { data, error } = await supabase.from("transactions").insert([tx]).select("*").single();
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, transaction: data });
  }
  const tx = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...body };
  state.transactions.push(tx);
  res.json({ ok: true, transaction: tx });
});
app.get("/api/finance/student-profiles", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("student_finance_profiles").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ ok: false });
    return res.json(data || []);
  }
  res.json(state.studentFinanceProfiles);
});
app.post("/api/finance/student-profiles", async (req, res) => {
  const b = req.body || {};
  const item = {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    student_id: b.student_id || "",
    class_code: b.class_code || "",
    upfront_amount: Number(b.upfront_amount || 0),
    upfront_date: b.upfront_date || null,
    installments: Array.isArray(b.installments) ? b.installments : [],
    status: b.status || "در انتظار تسویه"
  };
  if (supabase) {
    const { data, error } = await supabase.from("student_finance_profiles").insert([item]).select("*").single();
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, profile: data });
  }
  state.studentFinanceProfiles.push(item);
  res.json({ ok: true, profile: item });
});
app.put("/api/finance/student-profiles/:id", async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  if (supabase) {
    const { data, error } = await supabase.from("student_finance_profiles").update({
      student_id: b.student_id,
      class_code: b.class_code,
      upfront_amount: Number(b.upfront_amount || 0),
      upfront_date: b.upfront_date || null,
      installments: Array.isArray(b.installments) ? b.installments : [],
      status: b.status
    }).eq("id", id).select("*").single();
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, profile: data });
  }
  const idx = state.studentFinanceProfiles.findIndex(p => p.id === id);
  if (idx >= 0) {
    state.studentFinanceProfiles[idx] = { ...state.studentFinanceProfiles[idx], ...b };
    return res.json({ ok: true, profile: state.studentFinanceProfiles[idx] });
  }
  res.status(404).json({ ok: false });
});
app.get("/api/leads", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ ok: false });
    return res.json(data || []);
  }
  res.json(state.leads);
});
app.post("/api/leads", async (req, res) => {
  const body = req.body || {};
  if (supabase) {
    const lead = { id: Date.now().toString(), created_at: new Date().toISOString(), name: body.name || "", contact: body.contact || "", source: body.source || "" };
    const { data, error } = await supabase.from("leads").insert([lead]).select("*").single();
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, lead: data });
  }
  const lead = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...body };
  state.leads.push(lead);
  res.json({ ok: true, lead });
});
app.get("/api/health/supabase", async (req, res) => {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
  if (!supabase) return res.json({ enabled: false, hasUrl, hasKey });
  const { error, count } = await supabase.from("applicants").select("id", { count: "exact" }).limit(1);
  return res.json({ enabled: true, ok: !error, count: count || 0 });
});
app.get("/api/health/details", async (req, res) => {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAnon = !!process.env.SUPABASE_ANON_KEY;
  if (!supabase) return res.json({ enabled: false, hasUrl, hasServiceRole, hasAnon });
  try {
    const [{ count: coursesCount }, { count: techCount }, { count: studentsCount }] = await Promise.all([
      supabase.from("courses").select("id", { count: "exact" }).limit(1),
      supabase.from("tech_courses").select("id", { count: "exact" }).limit(1),
      supabase.from("students").select("id", { count: "exact" }).limit(1)
    ]);
    return res.json({
      enabled: true,
      hasUrl,
      hasServiceRole,
      hasAnon,
      tables: { courses: coursesCount || 0, tech_courses: techCount || 0, students: studentsCount || 0 }
    });
  } catch (e) {
    return res.json({ enabled: true, hasUrl, hasServiceRole, hasAnon, error: true });
  }
});
app.get("/api/health/env", (req, res) => {
  res.json({
    enabled: supabaseInfo.enabled,
    urlPresent: supabaseInfo.urlPresent,
    keyPresent: supabaseInfo.keyPresent,
    urlKey: supabaseInfo.urlKey,
    keyKey: supabaseInfo.keyKey
  });
});
app.get("/api/calendar/events", (req, res) => {
  res.json([]);
});
app.post("/api/calendar/events", (req, res) => {
  res.json({ ok: true });
});
app.get("/api/students", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    if (error) return res.json([]);
    return res.json(data || []);
  }
  res.json(state.students);
});
app.post("/api/students", async (req, res) => {
  const b = req.body || {};
  const item = {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    name: b.name || "",
    phone: b.phone || "",
    status: b.status || "active"
  };
  ["last_name","gender","father_name","national_id","address","emergency_phone","english_name","student_id","issuer"].forEach(k => {
    if (b[k] !== undefined) item[k] = b[k] || "";
  });
  const nidRaw = (item.national_id || "").replace(/\D/g, "");
  if (nidRaw.length === 10) item.student_id = nidRaw.replace(/^0+/, "");
  if (supabase) {
    let payload = { ...item };
    for (let i = 0; i < 5; i++) {
      const { data, error } = await supabase.from("students").insert([payload]).select("*").single();
      if (!error) return res.json({ ok: true, student: data });
      const msg = String(error.message||"");
      const m = msg.match(/Could not find the '([^']+)' column/i);
      if (m && payload[m[1]] !== undefined) { delete payload[m[1]]; continue; }
      return res.status(500).json({ ok: false, error: error.message });
    }
    return res.status(500).json({ ok: false, error: "schema_mismatch" });
  }
  state.students.push(item);
  res.json({ ok: true, student: item });
});
app.put("/api/students/:id", async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  if (supabase) {
    const updateObj = {};
    ["name","last_name","gender","father_name","national_id","address","phone","emergency_phone","english_name","issuer","status"].forEach(k => { if (b[k] !== undefined) updateObj[k] = b[k]; });
    updateObj.student_id = (() => { const r = (b.national_id || "").replace(/\D/g, ""); return r.length === 10 ? r.replace(/^0+/, "") : (b.student_id || updateObj.student_id || ""); })();
    let payload = updateObj;
    for (let i = 0; i < 5; i++) {
      const { data, error } = await supabase.from("students").update(payload).eq("id", id).select("*").single();
      if (!error) return res.json({ ok: true, student: data });
      const msg = String(error.message||"");
      const m = msg.match(/Could not find the '([^']+)' column/i);
      if (m && payload[m[1]] !== undefined) { delete payload[m[1]]; continue; }
      return res.status(500).json({ ok: false, error: error.message });
    }
    return res.status(500).json({ ok: false, error: "schema_mismatch" });
  }
  const idx = state.students.findIndex(s => s.id === id);
  if (idx >= 0) {
    state.students[idx] = { ...state.students[idx], ...b };
    return res.json({ ok: true, student: state.students[idx] });
  }
  res.status(404).json({ ok: false });
});
app.get("/api/courses", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("courses").select("*").order("name", { ascending: true });
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json(data || []);
  }
  res.json([
    { id: "crs1", name: "مقدماتی", teacher: "مدرس A", tuition: 1000000, hour: "10-12", sessions_count: 8 },
    { id: "crs2", name: "پیشرفته", teacher: "مدرس B", tuition: 1500000, hour: "14-16", sessions_count: 10 }
  ]);
});
app.post("/api/courses", async (req, res) => {
  const b = req.body || {};
  const item = { id: Date.now().toString(), created_at: new Date().toISOString(), name: b.name || "", teacher: b.teacher || "", tuition: Number(b.tuition || 0), hour: b.hour || "", sessions_count: Number(b.sessions_count || 0) };
  if (b.banner) item.banner = b.banner;
  if (supabase) {
    const { data, error } = await supabase.from("courses").insert([item]).select("*").single();
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, course: data });
  }
  res.json({ ok: true, course: item });
});
app.put("/api/courses/:id", async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  if (supabase) {
    const updateObj = {};
    if (b.name !== undefined) updateObj.name = b.name;
    if (b.teacher !== undefined) updateObj.teacher = b.teacher;
    if (b.tuition !== undefined) updateObj.tuition = Number(b.tuition || 0);
    if (b.hour !== undefined) updateObj.hour = b.hour || "";
    if (b.sessions_count !== undefined) updateObj.sessions_count = Number(b.sessions_count || 0);
    if (b.banner !== undefined) updateObj.banner = b.banner;
    const { data, error } = await supabase.from("courses").update(updateObj).eq("id", id).select("*").single();
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true, course: data });
  }
  res.json({ ok: true });
});
app.delete("/api/courses/:id", async (req, res) => {
  const id = req.params.id;
  if (supabase) {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true });
  }
  const idx = state.courses?.findIndex?.(c => c.id === id) ?? -1;
  if (idx >= 0) { state.courses.splice(idx, 1); return res.json({ ok: true }); }
  res.status(404).json({ ok: false });
});
app.delete("/api/tech-courses/:id", async (req, res) => {
  const id = req.params.id;
  if (supabase) {
    const { error } = await supabase.from("tech_courses").delete().eq("id", id);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json({ ok: true });
  }
  res.json({ ok: true });
});
app.get("/api/tech-courses", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("tech_courses").select("*").order("created_at", { ascending: false });
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.json(data || []);
  }
  res.json([]);
});

async function ensureBucket(name){
  if (!supabase) return { ok:false };
  try { await supabase.storage.createBucket(name, { public: true }); } catch {}
  return { ok:true };
}
function slugify(str){
  return String(str||"")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
app.post("/api/courses/upload-banner", upload.single("file"), async (req, res) => {
  if (!supabase) return res.status(500).json({ ok:false });
  const file = req.file;
  const courseId = req.body.course_id || "";
  const courseName = req.body.name || "";
  if (!file) return res.status(400).json({ ok:false, error:"no_file" });
  await ensureBucket("course-banners");
  const ext = (file.originalname.split(".").pop()||"jpg").toLowerCase();
  const base = courseId ? courseId : slugify(courseName) || Date.now().toString();
  const key = `${base}_${Date.now()}.${ext}`;
  const { data: up, error: upErr } = await supabase.storage.from("course-banners").upload(key, file.buffer, { contentType: file.mimetype, upsert: true });
  if (upErr) return res.status(500).json({ ok:false, error: upErr.message });
  const { data: pub } = await supabase.storage.from("course-banners").getPublicUrl(key);
  const url = (pub && (pub.publicUrl || pub.public_url)) || "";
  if (courseId) {
    await supabase.from("courses").update({ banner: url }).eq("id", courseId);
  }
  return res.json({ ok:true, url, path: up?.path || key });
});
app.post("/api/tech-courses", async (req, res) => {
  const b = req.body || {};
  const item = { id: Date.now().toString(), created_at: new Date().toISOString(), name_fa: b.name_fa || "", name_en: b.name_en || "", tuition: Number(b.tuition || 0), code: b.code || "", hours: Number(b.hours || 0) };
  if (supabase) {
    const { data, error } = await supabase.from("tech_courses").insert([item]).select("*").single();
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, course: data });
  }
  res.json({ ok: true, course: item });
});
app.put("/api/tech-courses/:id", async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  if (supabase) {
    const { data, error } = await supabase.from("tech_courses").update({ name_fa: b.name_fa, name_en: b.name_en, tuition: Number(b.tuition || 0), code: b.code, hours: Number(b.hours || 0) }).eq("id", id).select("*").single();
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, course: data });
  }
  res.json({ ok: true });
});
function parseMarkdownTable(buf) {
  const text = buf.toString("utf-8");
  const lines = text.split(/\r?\n/).filter(l => /\|/.test(l));
  if (lines.length < 2) return [];
  const header = lines[0].split("|").map(s => s.trim()).filter(Boolean);
  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const cols = lines[i].split("|").map(s => s.trim());
    if (!cols.length) continue;
    const obj = {};
    header.forEach((h, idx) => { obj[h] = cols[idx] || ""; });
    rows.push(obj);
  }
  return rows;
}
function parseXlsx(buf) {
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}
function parseCsv(buf) {
  const text = buf.toString("utf-8");
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const parseLine = (line) => {
    const out = [];
    let cur = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { out.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  const header = parseLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (!cols.length) continue;
    const obj = {};
    header.forEach((h, idx) => { obj[h] = (cols[idx] ?? '').trim(); });
    rows.push(obj);
  }
  return rows;
}
app.post("/api/import/tech-courses", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ ok: false });
  const rows = /md$/i.test(file.originalname) ? parseMarkdownTable(file.buffer) : /csv$/i.test(file.originalname) ? parseCsv(file.buffer) : parseXlsx(file.buffer);
  const mapped = rows.map(r => ({
    id: Date.now().toString() + Math.random().toString().slice(2,8),
    created_at: new Date().toISOString(),
    name_fa: r["نام دوره به فارسی"] || r.name_fa || "",
    name_en: r["نام دوره به انگلیسی"] || r.name_en || "",
    tuition: Number(r["شهریه دوره"] || r.tuition || 0),
    code: r["کد دوره"] || r.code || "",
    hours: Number(r["تعداد ساعت کلاس"] || r.hours || 0)
  }));
  if (supabase) {
    const { data, error } = await supabase.from("tech_courses").upsert(mapped, { onConflict: "code" });
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, count: (data || mapped).length });
  }
  return res.json({ ok: true, count: mapped.length });
});
app.post("/api/import/courses", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ ok: false });
  const rows = /md$/i.test(file.originalname) ? parseMarkdownTable(file.buffer) : /csv$/i.test(file.originalname) ? parseCsv(file.buffer) : parseXlsx(file.buffer);
  const normalizeMoney = v => {
    const s = String(v || "").replace(/[,\s٬]/g, "");
    const n = Number(s.replace(/[^0-9.-]/g, ""));
    return isNaN(n) ? 0 : n;
  };
  const normalizeInt = v => {
    const s = String(v || "").replace(/[^0-9]/g, "");
    return s ? Number(s) : 0;
  };
  const mapped = rows.map(r => ({
    id: Date.now().toString() + Math.random().toString().slice(2,8),
    created_at: new Date().toISOString(),
    name: r["نام دوره"] || r["دوره"] || r.name || "",
    teacher: r["مدرس"] || r.teacher || "",
    tuition: normalizeMoney(r["شهریه دوره"] || r["قیمت (تومان)"] || r.tuition),
    hour: String(r["تعداد ساعت کلاس"] || r["ساعت"] || r.hour || ""),
    sessions_count: normalizeInt(r["تعداد جلسات"] || r.sessions_count)
  }));
  if (supabase) {
    const { data, error } = await supabase.from("courses").upsert(mapped, { onConflict: "id" });
    if (error) return res.status(500).json({ ok: false });
    return res.json({ ok: true, count: (data || mapped).length });
  }
  return res.json({ ok: true, count: mapped.length });
});
app.listen(port, () => {
  process.stdout.write(`http://localhost:${port}/\n`);
});
