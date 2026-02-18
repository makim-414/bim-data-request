import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Paperclip, X, Upload, CheckCircle2, AlertCircle } from "lucide-react"

const APPS_SCRIPT_URL = "APPS_SCRIPT_URL_PLACEHOLDER"

interface FileItem {
  file: File
  id: string
}

interface DataSection {
  id: string
  label: string
  description: string
  steps?: string[]
  files: FileItem[]
}

type SectionMap = { [key: string]: DataSection }

const initialSections: SectionMap = {
  ga4: {
    id: "ga4",
    label: "GA4",
    description: "Google Analytics 4 데이터",
    steps: [
      "GA4 접속 → 왼쪽 메뉴 '보고서' 클릭",
      "'탐색 분석' 탭 선택",
      "원하는 분석 유형 선택 (자유 형식 등)",
      "우측 상단 '공유' → 'CSV 내보내기' 클릭",
    ],
    files: [],
  },
  gsc: {
    id: "gsc",
    label: "Google Search Console",
    description: "검색 성과 데이터",
    steps: [
      "Search Console 접속 → '실적' 메뉴 클릭",
      "날짜 범위 설정 (최근 3~6개월 권장)",
      "페이지, 쿼리, 국가, 기기 탭 각각 확인",
      "우측 상단 '내보내기' → 'Google 스프레드시트' 또는 'CSV' 선택",
    ],
    files: [],
  },
  googleAds: {
    id: "googleAds",
    label: "Google Ads",
    description: "검색 광고 성과 데이터",
    steps: [
      "Google Ads 접속 → 상단 '보고서' 클릭",
      "'보고서' → '사전 정의된 보고서' 또는 '맞춤 보고서' 선택",
      "캠페인/광고그룹/키워드 수준 데이터 선택",
      "'다운로드' 버튼 → CSV 형식으로 내보내기",
    ],
    files: [],
  },
  meta: {
    id: "meta",
    label: "Meta (Facebook/Instagram)",
    description: "Meta 광고 성과 데이터",
    steps: [
      "Meta Business Suite 또는 Ads Manager 접속",
      "상단 '보고서' 또는 '인사이트' 탭 클릭",
      "날짜 범위 및 세분화 항목 설정",
      "'내보내기' → CSV 또는 Excel 다운로드",
    ],
    files: [],
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok Ads",
    description: "TikTok 광고 성과 데이터",
    steps: [
      "TikTok Ads Manager 접속 → '보고서' 탭 클릭",
      "'맞춤 보고서' 생성 또는 기존 보고서 선택",
      "캠페인/광고 그룹/광고 수준 데이터 포함",
      "'내보내기' → CSV 다운로드",
    ],
    files: [],
  },
  ga: {
    id: "ga",
    label: "Google Analytics (UA)",
    description: "웹사이트 트래픽 데이터",
    steps: [
      "Google Analytics 접속 → '행동' → '개요' 메뉴",
      "날짜 범위 설정 후 세션, 사용자, 페이지뷰 확인",
      "상단 '내보내기' → CSV 또는 Excel 다운로드",
      "채널별, 기기별 데이터도 함께 내보내기",
    ],
    files: [],
  },
  semrush: {
    id: "semrush",
    label: "Semrush / Ahrefs",
    description: "SEO 및 키워드 분석 데이터",
    steps: [
      "Semrush 또는 Ahrefs 접속 후 도메인 분석",
      "오가닉 키워드, 백링크, 경쟁사 분석 보고서 생성",
      "각 보고서 페이지에서 'Export' 또는 '내보내기' 클릭",
      "CSV 또는 Excel 형식으로 다운로드",
    ],
    files: [],
  },
  mediaKit: {
    id: "mediaKit",
    label: "회사 소개서 / 미디어킷",
    description: "회사 소개 및 브랜드 자료",
    steps: [],
    files: [],
  },
  brandGuide: {
    id: "brandGuide",
    label: "브랜드 가이드라인",
    description: "로고, 컬러, 타이포그래피 등 브랜드 아이덴티티 자료",
    steps: [],
    files: [],
  },
}

const categories = [
  {
    id: "search",
    label: "🔍 검색 광고 데이터",
    sections: ["ga4", "gsc", "googleAds"],
  },
  {
    id: "social",
    label: "📱 소셜 미디어 데이터",
    sections: ["meta", "tiktok"],
  },
  {
    id: "web",
    label: "🌐 웹사이트 데이터",
    sections: ["ga", "semrush"],
  },
  {
    id: "brand",
    label: "📁 브랜드 기본 자료",
    sections: ["mediaKit", "brandGuide"],
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      onAdd(sectionId, Array.from(e.target.files))
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
        id={`file-input-${sectionId}`}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 border-dashed border-[#22c55e]/40 bg-transparent text-[#22c55e] hover:bg-[#22c55e]/10 hover:text-[#22c55e] hover:border-[#22c55e]/70 transition-all duration-200"
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip className="h-4 w-4" />
        파일 첨부
      </Button>
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: "#252628" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#22c55e]" />
              <span className="flex-1 truncate text-white">{f.file.name}</span>
              <span className="shrink-0 text-xs text-[#9a9b9e]">
                {(f.file.size / 1024).toFixed(0)}KB
              </span>
              <button
                type="button"
                onClick={() => onRemove(sectionId, f.id)}
                className="ml-1 rounded text-[#9a9b9e] hover:text-red-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type SubmitStatus = "idle" | "loading" | "success" | "error"

export default function App() {
  const [company, setCompany] = useState("")
  const [manager, setManager] = useState("")
  const [sections, setSections] = useState<SectionMap>(initialSections)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const addFiles = (sectionId: string, newFiles: File[]) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        files: [
          ...prev[sectionId].files,
          ...newFiles.map((f) => ({ file: f, id: `${sectionId}-${Date.now()}-${Math.random()}` })),
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

  const totalFiles = Object.values(sections).reduce((acc, s) => acc + s.files.length, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !manager.trim()) {
      setErrorMsg("회사명과 담당자명을 입력해주세요.")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    try {
      const formData = new FormData()
      formData.append("company", company)
      formData.append("manager", manager)

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
      setErrorMsg(err instanceof Error ? err.message : "제출 중 오류가 발생했습니다.")
    }
  }

  if (status === "success") {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{ backgroundColor: "#18191b" }}
      >
        <div
          className="w-full max-w-md rounded-2xl text-center p-12"
          style={{ backgroundColor: "#1e1f22", border: "1px solid #2f3033" }}
        >
          <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-[#22c55e]" />
          <h2 className="mb-3 text-2xl font-bold text-white">제출 완료!</h2>
          <p style={{ color: "#9a9b9e" }}>
            데이터가 성공적으로 전송되었습니다.
            <br />담당자가 검토 후 연락드리겠습니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-6 md:p-10"
      style={{ backgroundColor: "#18191b" }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <span
            className="inline-block mb-4 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: "rgba(34,197,94,0.12)",
              color: "#22c55e",
              border: "1px solid rgba(34,197,94,0.25)",
            }}
          >
            BIM Data Collection
          </span>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-white">
            BIM 데이터 요청 폼
          </h1>
          <p style={{ color: "#9a9b9e" }}>
            마케팅 분석에 필요한 데이터를 안전하게 제출해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 기본 정보 */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#1e1f22", border: "1px solid #2f3033" }}
          >
            <div className="mb-5">
              <h2 className="text-base font-semibold text-white">기본 정보</h2>
              <p className="mt-1 text-sm" style={{ color: "#9a9b9e" }}>
                회사명과 담당자 정보를 입력해주세요.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-white">
                  회사명 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="(주) 브랜드명"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="text-white placeholder:text-[#9a9b9e] focus-visible:ring-[#22c55e] focus-visible:ring-1"
                  style={{
                    backgroundColor: "#1e1f22",
                    border: "1px solid #2f3033",
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager" className="text-sm font-medium text-white">
                  담당자명 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="manager"
                  placeholder="홍길동"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="text-white placeholder:text-[#9a9b9e] focus-visible:ring-[#22c55e] focus-visible:ring-1"
                  style={{
                    backgroundColor: "#1e1f22",
                    border: "1px solid #2f3033",
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* 데이터 카테고리별 Accordion */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#1e1f22", border: "1px solid #2f3033" }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">데이터 파일 첨부</h2>
                <p className="mt-1 text-sm" style={{ color: "#9a9b9e" }}>
                  보유하신 데이터를 카테고리별로 첨부해주세요.
                </p>
              </div>
              {totalFiles > 0 && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.15)",
                    color: "#22c55e",
                  }}
                >
                  {totalFiles}개 파일
                </span>
              )}
            </div>

            <Accordion type="multiple" className="space-y-2">
              {categories.map((cat) => {
                const catFileCount = cat.sections.reduce(
                  (acc, sid) => acc + sections[sid].files.length,
                  0
                )
                return (
                  <AccordionItem
                    key={cat.id}
                    value={cat.id}
                    className="rounded-xl border-0 overflow-hidden"
                    style={{ border: "1px solid #2f3033", backgroundColor: "#18191b" }}
                  >
                    <AccordionTrigger
                      className="px-4 py-3.5 text-left text-sm font-semibold text-white hover:no-underline transition-colors duration-150"
                      style={{ color: "#ffffff" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "#252628"
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
                      }}
                    >
                      <span className="flex items-center gap-2.5">
                        {cat.label}
                        {catFileCount > 0 && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor: "rgba(34,197,94,0.15)",
                              color: "#22c55e",
                            }}
                          >
                            {catFileCount}
                          </span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-1">
                      <div className="space-y-4">
                        {cat.sections.map((sid) => {
                          const sec = sections[sid]
                          return (
                            <div
                              key={sid}
                              className="rounded-xl p-4"
                              style={{
                                backgroundColor: "#1e1f22",
                                border: "1px solid #2f3033",
                              }}
                            >
                              <div className="mb-4 flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-white">{sec.label}</h4>
                                  <p className="mt-0.5 text-xs" style={{ color: "#9a9b9e" }}>
                                    {sec.description}
                                  </p>
                                </div>
                                {sec.files.length > 0 && (
                                  <span
                                    className="rounded-full border px-2 py-0.5 text-xs font-medium"
                                    style={{
                                      borderColor: "rgba(34,197,94,0.3)",
                                      color: "#22c55e",
                                    }}
                                  >
                                    {sec.files.length}개
                                  </span>
                                )}
                              </div>

                              {sec.steps && sec.steps.length > 0 && (
                                <div
                                  className="mb-4 rounded-lg p-3.5"
                                  style={{ backgroundColor: "#252628" }}
                                >
                                  <p
                                    className="mb-2 text-xs font-semibold"
                                    style={{ color: "#22c55e" }}
                                  >
                                    📋 추출 방법
                                  </p>
                                  <ol className="space-y-1.5">
                                    {sec.steps.map((step, i) => (
                                      <li key={i} className="flex gap-2 text-xs" style={{ color: "#9a9b9e" }}>
                                        <span className="shrink-0 font-mono" style={{ color: "#22c55e", opacity: 0.7 }}>
                                          {i + 1}.
                                        </span>
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
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>

          {/* 에러 메시지 */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3.5 text-sm text-red-400"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl py-4 text-base font-semibold text-white transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: "#22c55e",
              cursor: status === "loading" ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (status !== "loading") {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#16a34a"
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#22c55e"
            }}
          >
            {status === "loading" ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                제출 중...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                데이터 제출 완료
              </>
            )}
          </button>

          <p className="pb-6 text-center text-xs" style={{ color: "#9a9b9e" }}>
            🔒 제출된 파일은 암호화되어 안전하게 전송됩니다.
          </p>
        </form>
      </div>
    </div>
  )
}
