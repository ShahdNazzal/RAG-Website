// ---------------------------------------------------------------------------
// Mini-RAG data layer — متصل مباشرة بالـFastAPI Backend
// C:\Users\lenovo\Desktop\MINI-RAG-FRONTEND\lib\rag.ts
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || "1"

export type RagDocument = {
  id: string
  name: string
  chars: number // حجم الملف بالبايت
  chunks: number // 0 يعني لسا قيد المعالجة
  createdAt: number
}

export type Source = {
  id: string
  documentId: string
  documentName: string
  snippet: string
  score: number
}

export type Answer = {
  question: string
  text: string
  sources: Source[]
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getIndexRecordCount(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/api/v1/nlp/index/info/${PROJECT_ID}`)
  if (!res.ok) return 0
  const data = await res.json()
  return data?.collection_info?.record_count ?? 0
}

async function waitForIndexing(beforeCount: number, maxAttempts = 30, intervalMs = 2000): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    await delay(intervalMs)
    const after = await getIndexRecordCount()
    if (after > beforeCount) return after - beforeCount
  }
  return 0
}

export async function ingestDocument(file: File): Promise<RagDocument> {
  const formData = new FormData()
  formData.append("file", file)

  const uploadRes = await fetch(`${API_BASE_URL}/api/v1/data/upload/${PROJECT_ID}`, {
    method: "POST",
    body: formData,
  })
  if (!uploadRes.ok) {
    const errText = await uploadRes.text()
    throw new Error(`فشل رفع الملف: ${errText}`)
  }
  const { file_id: fileId } = await uploadRes.json()

  const before = await getIndexRecordCount()

  const processRes = await fetch(`${API_BASE_URL}/api/v1/data/process-and-push/${PROJECT_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_id: fileId,
      chunk_size: 500,
      overlap_size: 50,
      do_reset: 0,
    }),
  })
  if (!processRes.ok) {
    const errText = await processRes.text()
    throw new Error(`فشل بدء المعالجة: ${errText}`)
  }

  const chunks = await waitForIndexing(before)

  return {
    id: fileId,
    name: file.name,
    chars: file.size,
    chunks,
    createdAt: Date.now(),
  }
}

export async function removeDocument(documentId: string): Promise<void> {
  console.warn(`[rag] لا يوجد endpoint لحذف المستند ${documentId} فعليًا من الفهرس بعد.`)
  return Promise.resolve()
}

export async function listDocuments(): Promise<RagDocument[]> {
  return []
}

export async function askQuestion(question: string): Promise<Answer> {
  // نستخدم allSettled بدل all: لو طلب الـsearch فشل، ما بدنا نخسر جواب الـanswer
  // اللي ممكن يكون نجح فعليًا. كل طلب بمعالج فشله لحاله.
  const [answerResult, searchResult] = await Promise.allSettled([
    fetch(`${API_BASE_URL}/api/v1/nlp/index/answer/${PROJECT_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: question, limit: 5 }),
    }),
    fetch(`${API_BASE_URL}/api/v1/nlp/index/search/${PROJECT_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: question, limit: 4 }),
    }),
  ])

  // طلب الـanswer هو الأساسي — لو فشل هو، لازم نرمي error فعليًا
  if (answerResult.status === "rejected") {
    throw new Error(`فشل الاتصال بالباك اند: ${answerResult.reason}`)
  }
  const answerRes = answerResult.value
  if (!answerRes.ok) {
    const errText = await answerRes.text()
    throw new Error(`فشل الحصول على إجابة: ${errText}`)
  }
  const answerData = await answerRes.json()

  // طلب الـsearch ثانوي (بس للمصادر) — لو فشل، نكمل بدون مصادر بدل ما نكسر كل شي
  let sources: Source[] = []
  if (searchResult.status === "fulfilled" && searchResult.value.ok) {
    try {
      const searchData = await searchResult.value.json()
      sources = (searchData.results ?? []).map((r: { text: string; score: number }, i: number) => ({
        id: `${Date.now()}-${i}`,
        documentId: "",
        documentName: `مصدر ${i + 1}`,
        snippet: r.text,
        score: r.score,
      }))
    } catch (e) {
      console.warn("[rag] فشل تحليل نتائج البحث، رح نعرض الجواب بدون مصادر", e)
    }
  } else {
    console.warn("[rag] فشل طلب البحث عن المصادر، رح نعرض الجواب بدون مصادر")
  }

  return {
    question,
    text: answerData.answer ?? "لم يتم العثور على إجابة.",
    sources,
  }
}