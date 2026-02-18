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
  steps?: string[]
  files: FileItem[]
}

type SectionMap = { [key: string]: DataSection }

const initialSections: SectionMap = {

  // ══════════════════════════════════════════
  // P1 · 🏗️ 내부 브랜드 (Internal Brand)
  // BIM이 AI 콘텐츠 생성 시 가장 많이 참조하는 핵심 인풋
  // ══════════════════════════════════════════

  brandMessaging: {
    id: "brandMessaging",
    label: "메시징 피라미드 / 포지셔닝 전략",
    labelEn: "Messaging Pyramid & Positioning",
    description: "BIM이 AI 답변 생성 시 브랜드 톤·메시지 일관성 유지에 사용하는 핵심 자료입니다.",
    steps: [
      "📌 브랜드 에센스 / 태그라인 — 브랜드의 본질을 한 문장으로 정의한 문구",
      "📌 핵심 가치 제안 (Value Proposition) — '우리가 경쟁사와 다른 이유'를 정리한 문서",
      "📌 메시징 필러 3~5개 — 주요 커뮤니케이션 테마별 핵심 문구 목록",
      "📌 각 필러별 서포팅 메시지 + 증거 자료 (수치, 사례, 수상 이력 등)",
      "📌 타겟 오디언스 정의 — 주요 고객군 설명 (직무, 산업, 니즈 등)",
      "💡 전략기획서, 브랜딩 덱, BX 문서, GTM 전략서 등 PPT/PDF 형태라면 그대로 업로드해 주세요",
      "⚠️ 파일이 없다면 메시지 요소를 엑셀 또는 워드 문서로 정리해서 첨부해 주세요",
    ],
    files: [],
  },

  brandGuide: {
    id: "brandGuide",
    label: "브랜드 가이드라인 + 톤앤매너",
    labelEn: "Brand Identity Guide & Tone of Voice",
    description: "BIM이 AI 크롤러용 콘텐츠 생성 시 브랜드 보이스와 시각 정체성 일관성 유지에 사용합니다.",
    steps: [
      "🎨 로고 원본 파일 — AI / EPS / SVG / PNG(투명 배경) 모든 형식 제공 권장",
      "🎨 메인 컬러 + 서브 컬러 팔레트 — HEX 또는 RGB 코드가 명시된 파일",
      "✏️ 공식 폰트명 (Primary / Secondary 구분, 영문·국문 각각)",
      "📐 브랜드 가이드라인 PDF — 여백 규정, 사용 금지 사례, 적용 예시 포함 버전",
      "🗣️ 톤앤매너 가이드 — 커뮤니케이션 스타일, 절대 쓰지 말아야 할 표현(do_not_say), 반드시 포함해야 할 문구(must_include)",
      "📸 사진·이미지 스타일 가이드 (있는 경우) — 촬영 가이드, 무드보드 등",
      "💡 파일이 분리되어 있다면 각각 업로드하거나 ZIP으로 묶어서 첨부해 주세요",
    ],
    files: [],
  },

  companyProfile: {
    id: "companyProfile",
    label: "회사 소개서 / 전략 문서",
    labelEn: "Company Profile / Strategy Docs",
    description: "BIM이 EAV-E 구조(Entity·Attribute·Value·Evidence)로 파싱하여 브랜드 지식 기반을 구축합니다.",
    steps: [
      "📄 최신 회사 소개서 PDF — 국문·영문 모두 있다면 함께 첨부",
      "📊 IR 덱 또는 투자자 대상 발표자료 (있는 경우)",
      "🗂️ 미디어킷 — 언론·파트너 배포용 자료 (로고, 대표 이미지, 수치 포함 버전)",
      "📋 제품/서비스 로드맵 또는 전략 기획서 (분기·연간 계획 포함 버전)",
      "🏆 수상 이력, 주요 언론 보도, 인증서 사본 (신뢰도 증거 자료로 활용)",
      "⚠️ 내부 비공개 자료도 분석 목적으로만 사용되며 외부에 공유되지 않습니다",
    ],
    files: [],
  },

  creativeAssets: {
    id: "creativeAssets",
    label: "광고 소재 / 크리에이티브",
    labelEn: "Ad Creatives & Content",
    description: "BIM이 콘텐츠 생성 시 기존 크리에이티브 방향성과 일관성을 유지하는 데 사용합니다.",
    steps: [
      "📱 SNS 광고 소재 — 최근 3~6개월 집행 이미지·영상 파일",
      "🖼️ 배너 광고 소재 — 사이즈별 이미지 파일 (GDN, 네이버, Meta 등)",
      "📝 주요 카피·헤드라인 목록 — 실제 집행에 사용된 광고 문구 엑셀/워드 정리",
      "🎬 영상 광고 — 유튜브·SNS 링크 또는 파일 (15초·30초·60초 버전 각각)",
      "💡 '성과가 좋았던 소재'와 '성과가 저조했던 소재'를 구분해서 표시해 주시면 BIM 학습에 훨씬 도움이 됩니다",
      "🌐 랜딩 페이지 URL — 광고별 연결된 랜딩 페이지 주소 목록",
    ],
    files: [],
  },

  // ══════════════════════════════════════════
  // P2 · 📊 시장 관점 (Market & Performance)
  // 현재 검색·광고 성과 기준선 — GEO 전략 효과 측정의 기준점
  // ══════════════════════════════════════════

  ga4: {
    id: "ga4",
    label: "GA4 (Google Analytics 4)",
    labelEn: "Google Analytics 4",
    description: "웹사이트 유입·행동·전환 데이터. BIM 시장 관점 — 트래픽 기준선 설정 및 GEO 전략 성과 측정에 사용합니다.",
    steps: [
      "analytics.google.com 접속 → 좌측 '보고서' 클릭",
      "① 획득 > 트래픽 획득 보고서 내보내기 (채널별 유입 현황)",
      "② 참여도 > 페이지 및 화면 보고서 내보내기 (인기 페이지 분석)",
      "③ 수익 창출 > 전환 보고서 내보내기 (전환 이벤트 분석)",
      "날짜 범위: 최근 6개월 권장 (비교를 위해 전년 동기도 함께 내보내면 좋습니다)",
      "우측 상단 다운로드 아이콘 → CSV로 내보내기",
      "탐색 분석(Explore) 보고서가 있다면 함께 첨부해 주세요",
    ],
    files: [],
  },

  gsc: {
    id: "gsc",
    label: "Google Search Console",
    labelEn: "Google Search Console",
    description: "구글 검색 키워드·노출·클릭·순위 데이터. BIM 시장 관점 — AI 엔진 가시성과 오가닉 검색 가시성을 비교하는 기준선으로 사용합니다.",
    steps: [
      "search.google.com/search-console 접속 → 좌측 '실적' 클릭",
      "날짜 범위: 최근 6개월 설정",
      "① 쿼리 탭: 검색어별 노출·클릭·CTR·순위 → 내보내기 → CSV",
      "② 페이지 탭: URL별 성과 → 내보내기 → CSV",
      "③ 국가 탭: 국가별 성과 → 내보내기 → CSV",
      "④ 기기 탭: 기기별 성과 → 내보내기 → CSV",
      "커버리지(색인 현황) 데이터도 있다면 함께 내보내 주세요",
    ],
    files: [],
  },

  googleAds: {
    id: "googleAds",
    label: "Google Ads",
    labelEn: "Google Ads",
    description: "검색·디스플레이·유튜브 광고 성과. BIM 시장 관점 — 퍼포먼스 기준선 설정, GEO 전략 이후 광고 의존도 변화 측정에 사용합니다.",
    steps: [
      "ads.google.com 접속 → 상단 '보고서' 탭 클릭",
      "① 캠페인 단위 보고서 다운로드",
      "② 광고그룹 단위 보고서 다운로드",
      "③ 키워드 단위 보고서 다운로드",
      "포함 지표: 노출수, 클릭수, CTR, CPC, 전환수, 전환율, ROAS, 총비용",
      "기간: 최근 3~6개월",
      "우측 상단 다운로드 아이콘 → CSV 선택",
    ],
    files: [],
  },

  naver: {
    id: "naver",
    label: "네이버 검색광고",
    labelEn: "Naver Search Ads",
    description: "네이버 키워드·쇼핑·브랜드 광고 성과. BIM 시장 관점 — 국내 검색 커버리지 분석, 네이버 AI(클로바X 등) 가시성 기준선에 사용합니다.",
    steps: [
      "searchad.naver.com 접속 → '보고서' 탭 클릭",
      "① 검색광고 보고서 다운로드 (키워드/광고그룹/캠페인 단위)",
      "② 쇼핑검색 보고서 다운로드 (해당되는 경우)",
      "③ 브랜드검색 보고서 다운로드 (해당되는 경우)",
      "포함 지표: 노출수, 클릭수, 클릭률, 평균CPC, 총비용, 전환수",
      "기간: 최근 3~6개월 권장",
      "'다운로드' → Excel 또는 CSV 선택",
    ],
    files: [],
  },

  meta: {
    id: "meta",
    label: "Meta (Facebook / Instagram)",
    labelEn: "Meta Ads Manager",
    description: "페이스북·인스타그램 광고 성과 및 오디언스 데이터. BIM 시장 관점 — 소셜 채널 퍼포먼스 기준선, 크리에이티브 효과 분석에 사용합니다.",
    steps: [
      "business.facebook.com → 광고 관리자(Ads Manager) 접속",
      "'보고서' 탭 → '광고 보고서' 클릭",
      "날짜 범위: 최근 3~6개월 설정",
      "① 캠페인 단위 보고서",
      "② 광고 세트 단위 보고서 (오디언스별 성과)",
      "③ 광고 단위 보고서 (소재별 성과)",
      "포함 지표: 노출수, 도달수, 클릭수, CTR, CPM, CPC, 전환수, ROAS, 지출금액",
      "'내보내기' → CSV 또는 Excel 다운로드",
      "인스타그램 인사이트(오가닉)도 있다면 함께 제공해 주세요",
    ],
    files: [],
  },

  pinterest: {
    id: "pinterest",
    label: "Pinterest",
    labelEn: "Pinterest Analytics",
    description: "핀터레스트 광고 및 오가닉 핀 성과. BIM 시장 관점 — 비주얼 콘텐츠의 AI 인용 가능성 분석에 사용합니다.",
    steps: [
      "광고 성과: ads.pinterest.com 접속 → 'Analytics' 탭 → 캠페인 단위 → '내보내기'",
      "오가닉 성과: analytics.pinterest.com → 개요 → 상단 날짜 범위 설정 → 내보내기",
      "포함 지표: 노출수, 클릭수, 저장수(Save), CTR, 지출금액",
      "기간: 최근 3~6개월",
    ],
    files: [],
  },

  naverAnalytics: {
    id: "naverAnalytics",
    label: "네이버 애널리틱스 / 서치어드바이저",
    labelEn: "Naver Analytics",
    description: "네이버 오가닉 유입 및 검색 성과. BIM 시장 관점 — 네이버 오가닉 기준선, 네이버 AI 가시성 비교에 사용합니다.",
    steps: [
      "analytics.naver.com 접속 → '보고서' 탭",
      "채널별 유입, 페이지뷰, 평균 체류시간 확인 후 Excel 내보내기",
      "searchadvisor.naver.com 접속 → '검색 현황' → 키워드 유입 현황 내보내기",
      "기간: 최근 3~6개월",
    ],
    files: [],
  },

  // ══════════════════════════════════════════
  // P3 · 🏢 경쟁사 관점 (Competitor)
  // BIM이 SoV(Share of Voice) 측정 대상 설정 및 자동 크롤링 기준에 사용
  // ══════════════════════════════════════════

  competitors: {
    id: "competitors",
    label: "경쟁사 목록 및 포지셔닝",
    labelEn: "Competitor List & Positioning",
    description: "BIM 경쟁사 관점 — AI 엔진에서 경쟁사 대비 우리 브랜드의 Share of Voice를 측정하기 위한 기준 데이터입니다.",
    steps: [
      "📋 직접 경쟁사 목록 — 서비스명 + 공식 웹사이트 URL (최소 3~5개)",
      "📋 간접 경쟁사 / 대체재 목록 — 고객이 우리 대신 선택할 수 있는 서비스",
      "💬 경쟁사별 차별점 메모 — '우리 서비스 대비 저 경쟁사는 이런 점이 다르다'는 내부 시각",
      "💰 경쟁사 가격 구조 — 알고 계신 경우 기재 (요금제, 무료 플랜 여부 등)",
      "📊 내부 경쟁 분석 자료 — 기능 비교표, 포지셔닝 맵 등 (있는 경우 첨부)",
      "💡 문서 형식보다 간단한 표(엑셀)나 리스트 형태로 정리해 주셔도 됩니다",
    ],
    files: [],
  },

  // ══════════════════════════════════════════
  // P4 · 👤 고객 관점 (Customer)
  // BIM이 고객 여정 7단계 매핑, 페인포인트 추출, AI 답변 최적화에 사용
  // ══════════════════════════════════════════

  reviews: {
    id: "reviews",
    label: "고객 리뷰 / NPS / 인터뷰",
    labelEn: "Customer Voice & Feedback",
    description: "BIM 고객 관점 — 실제 고객의 언어와 맥락으로 AI 답변을 최적화합니다. 가장 진짜 같은 콘텐츠의 원천입니다.",
    steps: [
      "⭐ 앱 스토어 리뷰 — 구글플레이/앱스토어 리뷰 CSV (개발팀 또는 스토어 콘솔에서 추출 가능)",
      "📊 NPS / CSAT 설문 결과 — 최근 1년치, 주관식 응답 포함 버전으로 제공",
      "💬 고객 인터뷰 자료 — 인터뷰 전사본, 요약 문서, 녹취 등 (있는 경우)",
      "🔍 커뮤니티 언급 사례 — 블라인드, 크몽, 네이버 카페 등에서 미리캔버스 언급된 글 캡처",
      "📧 CS 문의 주요 유형 정리 — 가장 많이 들어오는 질문/불만 Top 10 (CS팀에 요청 가능)",
      "💡 많이 언급되는 키워드, 자주 비교되는 경쟁사 서비스명 등도 함께 메모해 주세요",
    ],
    files: [],
  },

  // ══════════════════════════════════════════
  // ETC · 기타
  // ══════════════════════════════════════════

  other: {
    id: "other",
    label: "기타 데이터",
    labelEn: "Other / Additional",
    description: "위 항목에 포함되지 않았지만 도움이 될 것 같은 자료는 자유롭게 첨부해 주세요.",
    steps: [
      "카카오 광고, 유튜브 광고 등 기타 채널 성과 데이터",
      "CRM/CDP 데이터 — 고객 세그먼트, LTV, 이탈율, 재방문율 등",
      "앱 내 행동 데이터 — Mixpanel, Amplitude, Firebase 등",
      "외부 리서치 자료 — 시장조사 보고서, 소비자 조사 결과 등",
      "기타 참고 자료 — 분석에 도움이 될 것 같다고 판단되는 자료 무엇이든",
    ],
    files: [],
  },
}

const categories = [
  {
    id: "internal",
    label: "🏗️ 내부 브랜드",
    labelEn: "Internal Brand",
    code: "P1",
    sections: ["brandMessaging", "brandGuide", "companyProfile", "creativeAssets"],
  },
  {
    id: "market",
    label: "📊 시장 · 퍼포먼스",
    labelEn: "Market & Performance",
    code: "P2",
    sections: ["ga4", "gsc", "googleAds", "naver", "meta", "pinterest", "naverAnalytics"],
  },
  {
    id: "competitor",
    label: "🏢 경쟁사",
    labelEn: "Competitor",
    code: "P3",
    sections: ["competitors"],
  },
  {
    id: "customer",
    label: "👤 고객",
    labelEn: "Customer",
    code: "P4",
    sections: ["reviews"],
  },
  {
    id: "other",
    label: "기타",
    labelEn: "Other",
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
  const [uploader, setUploader] = useState("")
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
      if (draft.uploader) setUploader(draft.uploader)
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
      uploader,
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
      formData.append("uploader", uploader)
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
              <img
                src="/miricanvas-logo.png"
                alt="miri canvas"
                className="h-8 w-auto"
              />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    BIM 하우스 데이터 수집 시스템
                  </CardTitle>
                  <CardDescription>
                    마케팅 분석에 필요한 데이터를 카테고리별로 제출해주세요.
                  </CardDescription>
                </div>
                <Badge variant="secondary">미리캔버스 서비스 전용</Badge>
              </div>
            </div>
          </CardHeader>
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
              <CardDescription>File Uploader</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="uploader">담당자명</Label>
                <Input
                  id="uploader"
                  placeholder="파일을 업로드하는 담당자 이름"
                  value={uploader}
                  onChange={(e) => setUploader(e.target.value)}
                />
              </div>
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
                        <span className="flex items-center gap-2">
                          <span className="flex flex-col items-start">
                            <span className="text-sm">{cat.label}</span>
                            <span className="text-xs text-muted-foreground">{cat.labelEn}</span>
                          </span>
                          {catFileCount > 0 && (
                            <Badge variant="secondary">{catFileCount}</Badge>
                          )}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {cat.sections.map((sid, idx) => {
                            const sec = sections[sid]
                            return (
                              <div key={sid} className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm font-medium">{sec.label}</p>
                                    <p className="text-xs text-muted-foreground">{sec.labelEn}</p>
                                  </div>
                                  {sec.files.length > 0 && (
                                    <Badge variant="outline">{sec.files.length}개</Badge>
                                  )}
                                </div>

                                {sec.steps && sec.steps.length > 0 && (
                                  <div className="rounded-md bg-muted p-3 space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      내보내기 방법
                                    </p>
                                    <ol className="space-y-1">
                                      {sec.steps.map((step, i) => (
                                        <li
                                          key={i}
                                          className="flex gap-2 text-xs text-muted-foreground"
                                        >
                                          <span className="shrink-0 font-mono">{i + 1}.</span>
                                          {step}
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                )}

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
