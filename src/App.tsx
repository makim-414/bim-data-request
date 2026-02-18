import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card"
import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import {
 IconPaperclip,
 IconX,
 IconUpload,
 IconCircleCheck,
 IconAlertCircle,
 IconDeviceFloppy,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"

const APPS_SCRIPT_URL = "APPS_SCRIPT_URL_PLACEHOLDER"

const CLIENT_INFO = {
 company: "주식회사 미리디",
 service: "미리캔버스",
 contacts: [
 { role: "총괄", name: "서민웅" },
 { role: "실무/운영", name: "조지은" },
 { role: "콘텐츠", name: "최현진" },
 { role: "콘텐츠", name: "전민정" },
 ],
}

interface FileItem {
 file: File
 id: string
}

interface DataSection {
  id: string
  label: string
  labelEn: string
  description: string
  uploadFiles?: string
  fileTypes?: string
  exportHow?: string[]
  includes?: string[]
  files: FileItem[]
}

type SectionMap = { [key: string]: DataSection }

const initialSections: SectionMap = {

  // ── P1: 내부 브랜드 ──
  brandMessaging: {
    id: "brandMessaging",
    label: "메시징 피라미드 / 포지셔닝 전략",
    labelEn: "Messaging Pyramid & Positioning",
    description: "BIM이 AI 콘텐츠 생성 시 브랜드 톤과 메시지 일관성 유지에 사용하는 핵심 자료입니다.",
    uploadFiles: "전략기획서 / 브랜딩 덱 / BX 문서 / GTM 전략서 — 있는 것 모두",
    fileTypes: "형식 무관 (PDF, PPT, Excel, Word 모두 가능)",
    includes: [
      "브랜드 에센스 / 태그라인",
      "핵심 가치 제안 (Value Proposition) — 경쟁사 대비 차별점",
      "메시징 필러 3~5개 및 각 필러별 서포팅 메시지",
      "증거 자료 (수치, 수상 이력, 사례 등)",
      "타겟 오디언스 정의 (직무, 산업, 니즈)",
    ],
    files: [],
  },
  brandGuide: {
    id: "brandGuide",
    label: "브랜드 가이드라인 + 톤앤매너",
    labelEn: "Brand Identity Guide & Tone of Voice",
    description: "BIM이 AI 크롤러용 콘텐츠 생성 시 브랜드 보이스와 시각 정체성 일관성 유지에 사용합니다.",
    uploadFiles: "브랜드 가이드라인 PDF / 로고 원본 파일 / 컬러·폰트 정의서",
    fileTypes: "PDF, AI, EPS, SVG, PNG — ZIP 묶음 가능",
    includes: [
      "로고 원본 (AI / EPS / SVG / PNG 투명배경)",
      "메인·서브 컬러 — HEX 또는 RGB 코드",
      "공식 폰트명 (Primary / Secondary 구분)",
      "사용 금지 사례 및 여백 규정",
      "톤앤매너 — 금지 표현(do_not_say), 필수 포함 문구(must_include)",
    ],
    files: [],
  },
  companyProfile: {
    id: "companyProfile",
    label: "회사 소개서 / 전략 문서",
    labelEn: "Company Profile / Strategy Docs",
    description: "BIM이 EAV-E 구조로 파싱하여 브랜드 지식 기반(RAG)을 구축합니다.",
    uploadFiles: "회사 소개서 / IR 덱 / 미디어킷 / 제품 로드맵",
    fileTypes: "형식 무관 (PDF, PPT, Excel, Word 모두 가능)",
    includes: [
      "최신 회사 소개서 (국문 / 영문)",
      "IR 덱 또는 투자자 발표자료",
      "미디어킷 (수치·로고·이미지 포함 버전)",
      "수상 이력 / 주요 언론 보도 / 인증서",
    ],
    files: [],
  },
  creativeAssets: {
    id: "creativeAssets",
    label: "광고 소재 / 크리에이티브",
    labelEn: "Ad Creatives & Content",
    description: "BIM이 콘텐츠 생성 시 기존 크리에이티브 방향성과 일관성 유지에 사용합니다.",
    uploadFiles: "광고 소재 이미지·영상 / 카피 목록 문서",
    fileTypes: "JPG, PNG, MP4, GIF, Excel — 영상은 유튜브 링크도 가능",
    includes: [
      "SNS 광고 소재 (최근 3~6개월 집행 소재)",
      "배너 소재 (사이즈별)",
      "주요 카피·헤드라인 목록",
      "영상 광고 파일 또는 유튜브·SNS 링크",
      "성과 좋았던 소재 / 안 됐던 소재를 구분해 주시면 분석에 큰 도움이 됩니다",
    ],
    files: [],
  },

  // ── P2: 시장·퍼포먼스 ──
  ga4: {
    id: "ga4",
    label: "GA4 (Google Analytics 4)",
    labelEn: "Google Analytics 4",
    description: "BIM 시장 관점 — 트래픽 기준선 설정, GEO 전략 성과 측정에 사용합니다.",
    uploadFiles: "GA4 보고서 내보내기 파일",
    fileTypes: "CSV 또는 Excel",
    exportHow: [
      "analytics.google.com 접속 → 좌측 '보고서'",
      "날짜 범위: 최근 6개월 설정",
      "보고서 우측 상단 다운로드 아이콘 → CSV",
    ],
    includes: [
      "트래픽 획득 (채널별 유입 현황)",
      "페이지 및 화면 (인기 페이지)",
      "전환 이벤트",
      "탐색 분석(Explore) 보고서 (있으면 함께)",
    ],
    files: [],
  },
  gsc: {
    id: "gsc",
    label: "Google Search Console",
    labelEn: "Google Search Console",
    description: "BIM 시장 관점 — AI 엔진 가시성과 오가닉 검색 가시성 비교 기준선에 사용합니다.",
    uploadFiles: "Search Console 성과 보고서",
    fileTypes: "CSV 또는 Google 스프레드시트",
    exportHow: [
      "search.google.com/search-console → '실적'",
      "날짜 범위: 최근 6개월 설정",
      "쿼리 / 페이지 / 국가 / 기기 탭 각각 '내보내기'",
    ],
    includes: [
      "검색어별 노출·클릭·CTR·순위",
      "URL별 성과",
      "국가·기기별 성과",
      "커버리지(색인 현황)",
    ],
    files: [],
  },
  googleAds: {
    id: "googleAds",
    label: "Google Ads",
    labelEn: "Google Ads",
    description: "BIM 시장 관점 — 퍼포먼스 기준선 설정, GEO 전략 이후 광고 의존도 변화 측정에 사용합니다.",
    uploadFiles: "Google Ads 보고서",
    fileTypes: "CSV",
    exportHow: [
      "ads.google.com → 상단 '보고서' 탭",
      "캠페인 / 광고그룹 / 키워드 단위 각각",
      "다운로드 아이콘 → CSV",
    ],
    includes: [
      "노출수, 클릭수, CTR, CPC",
      "전환수, 전환율, ROAS",
      "총 지출금액",
    ],
    files: [],
  },
  naver: {
    id: "naver",
    label: "네이버 검색광고",
    labelEn: "Naver Search Ads",
    description: "BIM 시장 관점 — 국내 검색 커버리지 분석, 네이버 AI 가시성 기준선에 사용합니다.",
    uploadFiles: "네이버 검색광고 보고서",
    fileTypes: "Excel 또는 CSV",
    exportHow: [
      "searchad.naver.com → '보고서' 탭",
      "검색광고 / 쇼핑검색 / 브랜드검색 각각",
      "'다운로드' → Excel 또는 CSV",
    ],
    includes: [
      "노출수, 클릭수, 클릭률, 평균CPC",
      "총비용, 전환수",
      "캠페인 / 광고그룹 / 키워드 단위",
    ],
    files: [],
  },
  meta: {
    id: "meta",
    label: "Meta (Facebook / Instagram)",
    labelEn: "Meta Ads Manager",
    description: "BIM 시장 관점 — 소셜 채널 퍼포먼스 기준선, 크리에이티브 효과 분석에 사용합니다.",
    uploadFiles: "Meta Ads 보고서",
    fileTypes: "CSV 또는 Excel",
    exportHow: [
      "business.facebook.com → Ads Manager",
      "보고서 탭 → 날짜 범위 3~6개월",
      "'내보내기' → CSV",
    ],
    includes: [
      "노출수, 도달수, 클릭수, CTR",
      "CPM, CPC, 전환수, ROAS, 지출금액",
      "캠페인 / 광고 세트 / 광고 단위 각각",
      "인스타그램 오가닉 인사이트 (있으면 함께)",
    ],
    files: [],
  },
  pinterest: {
    id: "pinterest",
    label: "Pinterest",
    labelEn: "Pinterest Analytics",
    description: "BIM 시장 관점 — 비주얼 콘텐츠 성과 분석에 사용합니다.",
    uploadFiles: "Pinterest 광고 / 오가닉 분석 보고서",
    fileTypes: "CSV",
    exportHow: [
      "광고: ads.pinterest.com → Analytics → 내보내기",
      "오가닉: analytics.pinterest.com → 개요 → 내보내기",
    ],
    includes: [
      "노출수, 클릭수, 저장수(Save)",
      "CTR, 지출금액",
    ],
    files: [],
  },
  naverAnalytics: {
    id: "naverAnalytics",
    label: "네이버 애널리틱스 / 서치어드바이저",
    labelEn: "Naver Analytics",
    description: "BIM 시장 관점 — 네이버 오가닉 기준선, 네이버 AI 가시성 비교에 사용합니다.",
    uploadFiles: "네이버 애널리틱스 / 서치어드바이저 보고서",
    fileTypes: "Excel",
    exportHow: [
      "analytics.naver.com → 보고서 → Excel 내보내기",
      "searchadvisor.naver.com → 검색 현황 → 내보내기",
    ],
    includes: [
      "채널별 유입, 페이지뷰, 평균 체류시간",
      "키워드 유입 현황",
    ],
    files: [],
  },

  // ── P3: 경쟁사 ──
  competitors: {
    id: "competitors",
    label: "경쟁사 목록 및 포지셔닝",
    labelEn: "Competitor List & Positioning",
    description: "BIM 경쟁사 관점 — AI 엔진에서 경쟁사 대비 Share of Voice 측정 기준 설정에 사용합니다.",
    uploadFiles: "경쟁사 목록 문서 / 내부 비교 분석 자료",
    fileTypes: "형식 무관 (Excel, Word, 슬라이드 모두 가능)",
    includes: [
      "직접 경쟁사 — 서비스명 + 웹사이트 URL (최소 3~5개)",
      "간접 경쟁사 / 대체 서비스 목록",
      "경쟁사 대비 우리 서비스 차별점 메모",
      "가격 구조 (알고 계신 경우)",
      "기능 비교표 / 포지셔닝 맵 (있으면 첨부)",
    ],
    files: [],
  },

  // ── P4: 고객 ──
  reviews: {
    id: "reviews",
    label: "고객 리뷰 / NPS / 인터뷰",
    labelEn: "Customer Voice & Feedback",
    description: "BIM 고객 관점 — 실제 고객 언어로 AI 답변을 최적화합니다. 가장 진짜 같은 콘텐츠의 원천입니다.",
    uploadFiles: "앱스토어 리뷰 / NPS 결과 / 고객 인터뷰 / CS 문의 유형 정리",
    fileTypes: "형식 무관 (Excel, CSV, PDF, 이미지 캡처 모두 가능)",
    includes: [
      "앱스토어 리뷰 CSV (구글플레이 / 앱스토어)",
      "NPS / CSAT 설문 결과 — 주관식 응답 포함 버전",
      "고객 인터뷰 전사본 또는 요약본",
      "자주 언급되는 커뮤니티 글 캡처",
      "CS 주요 문의 유형 Top 10",
    ],
    files: [],
  },

  // ── 기타 ──
  other: {
    id: "other",
    label: "기타 데이터",
    labelEn: "Other / Additional",
    description: "위 항목에 포함되지 않았지만 도움이 될 것 같은 자료는 자유롭게 첨부해 주세요.",
    uploadFiles: "기타 플랫폼 데이터 / CRM / 리서치 자료",
    fileTypes: "형식 무관",
    includes: [
      "카카오 광고, 유튜브 광고 등 기타 채널 데이터",
      "CRM 데이터 (세그먼트, LTV, 이탈율)",
      "앱 행동 데이터 (Mixpanel, Amplitude 등)",
      "외부 리서치 / 시장조사 보고서",
    ],
    files: [],
  },
}
const categories = [
  {
    id: "internal",
    label: "내부 브랜드",
    labelEn: "Internal Brand · P1",
    hint: "메시징 전략 문서, 브랜드 가이드라인, 회사 소개서, 광고 소재 파일",
    code: "P1",
    sections: ["brandMessaging", "brandGuide", "companyProfile", "creativeAssets"],
  },
  {
    id: "market",
    label: "시장 · 퍼포먼스",
    labelEn: "Market & Performance · P2",
    hint: "GA4, Google Search Console, Google Ads, 네이버 검색광고, Meta Ads, Pinterest, 네이버 애널리틱스",
    code: "P2",
    sections: ["ga4", "gsc", "googleAds", "naver", "meta", "pinterest", "naverAnalytics"],
  },
  {
    id: "competitor",
    label: "경쟁사",
    labelEn: "Competitor · P3",
    hint: "직접·간접 경쟁사 목록, 웹사이트 URL, 차별점 정리 문서",
    code: "P3",
    sections: ["competitors"],
  },
  {
    id: "customer",
    label: "고객",
    labelEn: "Customer · P4",
    hint: "앱스토어 리뷰, NPS/CSAT 설문 결과, 고객 인터뷰 자료, CS 주요 문의 유형",
    code: "P4",
    sections: ["reviews"],
  },
  {
    id: "other",
    label: "기타",
    labelEn: "Other",
    hint: "카카오 광고, CRM 데이터, 앱 행동 분석, 외부 리서치 자료 등",
    code: "ETC",
    sections: ["other"],
  },
]

function FileUploader({
 sectionId,
 files,
 onAdd,
 onRemove,
}: {
 sectionId: string
 files: FileItem[]
 onAdd: (sectionId: string, newFiles: File[]) => void
 onRemove: (sectionId: string, fileId: string) => void
}) {
 const inputRef = useRef<HTMLInputElement>(null)
 const [isDragging, setIsDragging] = useState(false)

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files) {
 onAdd(sectionId, Array.from(e.target.files))
 e.target.value = ""
 }
 }

 const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault()
 setIsDragging(false)
 if (e.dataTransfer.files) {
 onAdd(sectionId, Array.from(e.dataTransfer.files))
 }
 }

 return (
 <div className="space-y-2">
 <input
 ref={inputRef}
 type="file"
 multiple
 className="hidden"
 onChange={handleChange}
 />
 <div
 onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
 onDragLeave={() => setIsDragging(false)}
 onDrop={handleDrop}
 onClick={() => inputRef.current?.click()}
 className={`cursor-pointer rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors ${
 isDragging ? "border-primary bg-accent" : "border-input hover:border-primary/50"
 }`}
 >
 <div className="flex flex-col items-center gap-1">
 <IconPaperclip className="h-4 w-4 text-muted-foreground" />
 <p className="text-sm text-muted-foreground">
 클릭 또는 드래그하여 파일 첨부
 </p>
 </div>
 </div>

 {files.length > 0 && (
 <ul className="space-y-1">
 {files.map((f) => (
 <li
 key={f.id}
 className="flex items-center gap-2 rounded-md border px-3 py-2"
 >
 <IconCircleCheck className="h-4 w-4 shrink-0 text-green-500" />
 <span className="flex-1 truncate text-sm">{f.file.name}</span>
 <span className="shrink-0 text-xs text-muted-foreground">
 {(f.file.size / 1024).toFixed(0)} KB
 </span>
 <button
 type="button"
 onClick={() => onRemove(sectionId, f.id)}
 className="text-muted-foreground hover:text-foreground"
 >
 <IconX className="h-4 w-4" />
 </button>
 </li>
 ))}
 </ul>
 )}
 </div>
 )
}

type SubmitStatus = "idle" | "loading" | "success" | "error"

export default function App() {
  interface UploaderContact {
    id: string
    name: string
    contact: string
  }
  const [uploaders, setUploaders] = useState<UploaderContact[]>([
    { id: "1", name: "", contact: "" }
  ])
  const addUploaderRow = () => setUploaders(prev => [...prev, { id: Date.now().toString(), name: "", contact: "" }])
  const removeUploaderRow = (id: string) => setUploaders(prev => prev.filter(u => u.id !== id))
  const updateUploader = (id: string, field: "name" | "contact", value: string) =>
    setUploaders(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u))
 const [sections, setSections] = useState<SectionMap>(initialSections)
 const [status, setStatus] = useState<SubmitStatus>("idle")
 const [errorMsg, setErrorMsg] = useState("")
 const [savedMsg, setSavedMsg] = useState("")

 // localStorage에서 이전 임시저장 복원
 useEffect(() => {
 try {
 const raw = localStorage.getItem("bim-draft")
 if (!raw) return
 const draft = JSON.parse(raw)
 if (draft.uploaders) setUploaders(draft.uploaders)
 } catch {
 // 파싱 실패 시 무시
 }
 }, [])

 const addFiles = (sectionId: string, newFiles: File[]) => {
 setSections((prev) => ({
 ...prev,
 [sectionId]: {
 ...prev[sectionId],
 files: [
 ...prev[sectionId].files,
 ...newFiles.map((f) => ({
 file: f,
 id: `${sectionId}-${Date.now()}-${Math.random()}`,
 })),
 ],
 },
 }))
 }

 const removeFile = (sectionId: string, fileId: string) => {
 setSections((prev) => ({
 ...prev,
 [sectionId]: {
 ...prev[sectionId],
 files: prev[sectionId].files.filter((f) => f.id !== fileId),
 },
 }))
 }

 const totalFiles = Object.values(sections).reduce(
 (acc, s) => acc + s.files.length,
 0
 )

 const handleSaveDraft = () => {
 const now = new Date()
 const timeStr = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
 const draft = {
 uploaders,
 savedAt: now.toISOString(),
 fileNames: Object.fromEntries(
 Object.entries(sections).map(([k, v]) => [k, v.files.map(f => f.file.name)])
 ),
 }
 localStorage.setItem("bim-draft", JSON.stringify(draft))
 setSavedMsg(`저장됨 ${timeStr}`)
 setTimeout(() => setSavedMsg(""), 3000)
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setStatus("loading")
 setErrorMsg("")
 try {
 const formData = new FormData()
 formData.append("company", CLIENT_INFO.company)
 formData.append("uploaders", JSON.stringify(uploaders))
 Object.values(sections).forEach((section) => {
 section.files.forEach((f) => {
 formData.append(`${section.id}[]`, f.file, f.file.name)
 })
 })
 const response = await fetch(APPS_SCRIPT_URL, {
 method: "POST",
 body: formData,
 })
 if (!response.ok) throw new Error(`서버 오류: ${response.status}`)
 setStatus("success")
 } catch (err) {
 setStatus("error")
 setErrorMsg(
 err instanceof Error ? err.message : "제출 중 오류가 발생했습니다."
 )
 }
 }

 if (status === "success") {
 return (
 <div className="flex min-h-screen items-center justify-center p-6">
 <Card className="w-full max-w-sm text-center">
 <CardContent className="pt-8 pb-8 space-y-3">
 <IconCircleCheck className="mx-auto h-10 w-10 text-green-500" />
 <CardTitle>제출 완료</CardTitle>
 <CardDescription>
 데이터가 안전하게 전송되었습니다.
 <br />
 담당자가 검토 후 연락드리겠습니다.
 </CardDescription>
 </CardContent>
 </Card>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-background">
 <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">

         {/* Header */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <img src="/miricanvas-logo.png" alt="miri canvas" className="h-8 w-auto" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">BIM 하우스 데이터 수집 시스템</CardTitle>
                    <CardDescription>마케팅 분석에 필요한 데이터를 카테고리별로 제출해주세요.</CardDescription>
                  </div>
                  <Badge variant="secondary">미리캔버스 서비스 전용</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* BIM 소개 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">BIM이란?</CardTitle>
              <CardDescription>Brand Intelligence Matrix — AI 검색 시대의 브랜드 가시성 전략</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                BIM은 ChatGPT, Perplexity, Gemini 등 AI 검색 엔진에서 브랜드가 어떻게 인식되고 언급되는지를 분석하고,
                브랜드의 AI 가시성(GEO · Generative Engine Optimization)을 높이기 위한 데이터 기반 전략 시스템입니다.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { code: "P1", label: "내부 브랜드", desc: "메시징, 가이드라인, 전략 문서" },
                  { code: "P2", label: "시장 · 퍼포먼스", desc: "GA4, 검색광고, 소셜 성과 데이터" },
                  { code: "P3", label: "경쟁사", desc: "경쟁사 목록, 포지셔닝, 차별점" },
                  { code: "P4", label: "고객", desc: "리뷰, NPS, 인터뷰, CS 데이터" },
                ].map((p) => (
                  <div key={p.code} className="flex gap-3 rounded-md border px-3 py-2.5">
                    <span className="shrink-0 font-mono text-xs text-muted-foreground pt-0.5">{p.code}</span>
                    <div>
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground border-t pt-3">
                제출된 데이터는 BIM 분석에만 사용되며 외부에 공유되지 않습니다.
                파일은 암호화된 채널을 통해 Ironact 전용 드라이브로 안전하게 전송됩니다.
              </p>
            </CardContent>
          </Card>

 <form onSubmit={handleSubmit} className="space-y-4">

 {/* 기본 정보 */}
 <Card>
 <CardHeader>
 <CardTitle className="text-base">기본 정보</CardTitle>
 <CardDescription>Client Information</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="rounded-md border p-4 space-y-3">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium">{CLIENT_INFO.company}</p>
 <p className="text-xs text-muted-foreground">{CLIENT_INFO.service}</p>
 </div>
 <Badge variant="outline">클라이언트</Badge>
 </div>
 <Separator />
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
 {CLIENT_INFO.contacts.map((c) => (
 <div key={c.name} className="space-y-0.5">
 <p className="text-xs text-muted-foreground">{c.role}</p>
 <p className="text-sm font-medium">{c.name}</p>
 </div>
 ))}
 </div>
 </div>
 </CardContent>
 </Card>

         {/* 업로드 담당자 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">업로드 담당자</CardTitle>
              <CardDescription>파일을 제출하는 담당자 정보를 입력해 주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {uploaders.map((u, idx) => (
                <div key={u.id} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      {idx === 0 && <Label className="text-xs text-muted-foreground">담당자명</Label>}
                      <Input
                        placeholder="이름"
                        value={u.name}
                        onChange={(e) => updateUploader(u.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {idx === 0 && <Label className="text-xs text-muted-foreground">이메일 또는 전화번호</Label>}
                      <Input
                        placeholder="email@company.com 또는 010-0000-0000"
                        value={u.contact}
                        onChange={(e) => updateUploader(u.id, "contact", e.target.value)}
                      />
                    </div>
                  </div>
                  {uploaders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUploaderRow(u.id)}
                      className="mt-6 text-muted-foreground hover:text-foreground"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addUploaderRow} className="w-full">
                <IconPlus className="mr-2 h-4 w-4" />
                담당자 추가
              </Button>
            </CardContent>
          </Card>

 {/* SEC-01~04 파일 첨부 */}
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <CardTitle className="text-base">데이터 파일 첨부</CardTitle>
 <CardDescription>Data File Upload</CardDescription>
 </div>
 {totalFiles > 0 && (
 <Badge variant="secondary">{totalFiles}개 파일</Badge>
 )}
 </div>
 </CardHeader>
 <CardContent>
 <Accordion type="multiple" className="w-full">
 {categories.map((cat) => {
 const catFileCount = cat.sections.reduce(
 (acc, sid) => acc + sections[sid].files.length,
 0
 )
 return (
 <AccordionItem key={cat.id} value={cat.id}>
 <AccordionTrigger>
 <span className="flex items-center gap-3 text-left">
 <span className="flex flex-col items-start gap-0.5">
 <span className="flex items-center gap-2">
 <span className="text-sm font-medium">{cat.label}</span>
 <span className="text-xs text-muted-foreground">{cat.labelEn}</span>
 {catFileCount > 0 && (
 <Badge variant="secondary">{catFileCount}</Badge>
 )}
 </span>
 <span className="text-xs text-muted-foreground font-normal">{cat.hint}</span>
 </span>
 </span>
 </AccordionTrigger>
 <AccordionContent>
 <div className="space-y-4 pt-2">
 {cat.sections.map((sid, idx) => {
 const sec = sections[sid]
 return (
                  <div key={sid} className="space-y-3">
                    {/* 섹션 헤더 */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{sec.label}</p>
                        <p className="text-xs text-muted-foreground">{sec.labelEn}</p>
                      </div>
                      {sec.files.length > 0 && (
                        <Badge variant="outline">{sec.files.length}개</Badge>
                      )}
                    </div>

                    {/* 설명 */}
                    <p className="text-xs text-muted-foreground">{sec.description}</p>

                    {/* 업로드 파일 + 형식 */}
                    {(sec.uploadFiles || sec.fileTypes) && (
                      <div className="rounded-md border px-3 py-2.5 space-y-1.5 text-xs">
                        {sec.uploadFiles && (
                          <div className="flex gap-2">
                            <span className="shrink-0 text-muted-foreground w-14">파일</span>
                            <span>{sec.uploadFiles}</span>
                          </div>
                        )}
                        {sec.fileTypes && (
                          <div className="flex gap-2">
                            <span className="shrink-0 text-muted-foreground w-14">형식</span>
                            <span className="text-muted-foreground">{sec.fileTypes}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 내보내기 방법 (분석 툴) */}
                    {sec.exportHow && sec.exportHow.length > 0 && (
                      <div className="rounded-md bg-muted/50 px-3 py-2.5 space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">내보내기 방법</p>
                        <ol className="space-y-1">
                          {sec.exportHow.map((step, i) => (
                            <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                              <span className="shrink-0 font-mono">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* 포함할 내용 */}
                    {sec.includes && sec.includes.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">포함할 내용</p>
                        <ul className="space-y-1">
                          {sec.includes.map((item, i) => (
                            <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                              <span className="shrink-0">·</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 파일 업로드 */}
                    <FileUploader
                      sectionId={sid}
                      files={sec.files}
                      onAdd={addFiles}
                      onRemove={removeFile}
                    />

                    {idx < cat.sections.length - 1 && <Separator />}
                  </div>
 )
 })}
 </div>
 </AccordionContent>
 </AccordionItem>
 )
 })}
 </Accordion>
 </CardContent>
 </Card>

 {/* 에러 */}
 {errorMsg && (
 <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 <IconAlertCircle className="h-4 w-4 shrink-0" />
 {errorMsg}
 </div>
 )}

 {/* 버튼 영역 */}
 <div className="flex gap-3">
 <Button
 type="button"
 variant="outline"
 className="flex-1"
 onClick={handleSaveDraft}
 >
 <IconDeviceFloppy className="mr-2 h-4 w-4" />
 {savedMsg || "임시저장"}
 </Button>
 <Button
 type="submit"
 className="flex-1"
 disabled={status === "loading"}
 >
 {status === "loading" ? (
 <>
 <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
 전송 중...
 </>
 ) : (
 <>
 <IconUpload className="mr-2 h-4 w-4" />
 데이터 전송
 </>
 )}
 </Button>
 </div>

 </form>
 </div>
 </div>
 )
}
