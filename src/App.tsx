import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Paperclip, X, Upload, CheckCircle2, AlertCircle, Lock, ShieldAlert } from "lucide-react"

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
    label: "검색 광고 데이터",
    icon: "🔍",
    code: "SEC-01",
    sections: ["ga4", "gsc", "googleAds"],
  },
  {
    id: "social",
    label: "소셜 미디어 데이터",
    icon: "📱",
    code: "SEC-02",
    sections: ["meta", "tiktok"],
  },
  {
    id: "web",
    label: "웹사이트 데이터",
    icon: "🌐",
    code: "SEC-03",
    sections: ["ga", "semrush"],
  },
  {
    id: "brand",
    label: "브랜드 기본 자료",
    icon: "📁",
    code: "SEC-04",
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
  const [isDragging, setIsDragging] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
        id={`file-input-${sectionId}`}
      />
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-lg border-2 border-dashed px-4 py-4 text-center transition-all duration-200"
        style={{
          borderColor: isDragging ? "#dc2626" : "rgba(185, 28, 28, 0.4)",
          backgroundColor: isDragging ? "rgba(220,38,38,0.06)" : "rgba(220,38,38,0.02)",
        }}
      >
        <div className="flex flex-col items-center gap-1.5">
          <Paperclip
            className="h-4 w-4"
            style={{ color: isDragging ? "#ef4444" : "#b91c1c" }}
          />
          <span
            className="text-xs font-mono"
            style={{ color: isDragging ? "#ef4444" : "#7f1d1d" }}
          >
            [ATTACH FILE] — 클릭 또는 드래그
          </span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm"
              style={{
                backgroundColor: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(185,28,28,0.3)",
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "#dc2626" }} />
              <span className="flex-1 truncate text-white font-mono text-xs">{f.file.name}</span>
              <span className="shrink-0 text-xs font-mono" style={{ color: "#6b7280" }}>
                {(f.file.size / 1024).toFixed(0)}KB
              </span>
              <button
                type="button"
                onClick={() => onRemove(sectionId, f.id)}
                className="ml-1 rounded transition-colors"
                style={{ color: "#6b7280" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6b7280" }}
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
        className="flex min-h-screen items-center justify-center p-6 relative"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <div
          className="w-full max-w-md rounded text-center p-12"
          style={{
            backgroundColor: "#111",
            border: "1px solid rgba(185,28,28,0.4)",
          }}
        >
          {/* Top classified strip */}
          <div
            className="mb-6 rounded px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-center"
            style={{
              backgroundColor: "#dc2626",
              color: "#fff",
            }}
          >
            ▌TRANSMISSION COMPLETE▐
          </div>
          <Lock className="mx-auto mb-6 h-12 w-12" style={{ color: "#dc2626" }} />
          <h2 className="mb-3 text-xl font-bold text-white font-mono tracking-wide">제출 완료</h2>
          <p className="text-sm font-mono" style={{ color: "#6b7280" }}>
            데이터가 안전하게 전송되었습니다.<br />
            담당자가 검토 후 연락드리겠습니다.
          </p>
          <div
            className="mt-6 text-xs font-mono"
            style={{ color: "rgba(185,28,28,0.5)" }}
          >
            REF-ID: {Date.now().toString(36).toUpperCase()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-6 md:p-10 relative"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <div className="mx-auto max-w-3xl relative z-10">

        {/* ═══ CONFIDENTIAL BANNER ═══ */}
        <div
          className="confidential-badge mb-8 rounded px-4 py-2.5 text-center"
          style={{
            border: "2px solid #dc2626",
            backgroundColor: "rgba(220,38,38,0.06)",
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: "rgba(220,38,38,0.4)" }} />
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" style={{ color: "#dc2626" }} />
              <span
                className="font-mono text-sm font-bold tracking-[0.3em]"
                style={{ color: "#dc2626" }}
              >
                CONFIDENTIAL
              </span>
              <ShieldAlert className="h-4 w-4" style={{ color: "#dc2626" }} />
            </div>
            <div className="h-px flex-1" style={{ backgroundColor: "rgba(220,38,38,0.4)" }} />
          </div>
          <p
            className="mt-1 text-center font-mono text-xs tracking-widest"
            style={{ color: "rgba(220,38,38,0.5)" }}
          >
            RESTRICTED ACCESS · AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        {/* ═══ HEADER ═══ */}
        <div className="mb-10">
          <div className="section-bar mb-2">
            <span className="font-mono text-xs tracking-widest" style={{ color: "rgba(220,38,38,0.6)" }}>
              BIM / DATA-REQUEST / v2.0
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="mt-1 h-6 w-6 shrink-0" style={{ color: "#dc2626" }} />
            <div>
              <h1
                className="text-2xl font-bold tracking-tight text-white font-mono"
              >
                BIM 데이터 요청 폼
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: "#6b7280" }}>
                마케팅 분석에 필요한 데이터를 안전하게 제출해주세요.
                본 문서는 기밀이며 허가된 인원만 접근 가능합니다.
              </p>
            </div>
          </div>

          {/* meta strip */}
          <div
            className="mt-5 flex flex-wrap gap-4 rounded px-4 py-2.5 text-xs font-mono"
            style={{
              backgroundColor: "#111",
              border: "1px solid rgba(185,28,28,0.2)",
              color: "rgba(220,38,38,0.5)",
            }}
          >
            <span>CLASS: CONFIDENTIAL</span>
            <span>│</span>
            <span>DEPT: BIM-ANALYTICS</span>
            <span>│</span>
            <span>FORM-ID: BDR-2024</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ══ SECTION 01: 기본 정보 ══ */}
          <div
            className="rounded p-6"
            style={{
              backgroundColor: "#111",
              border: "1px solid rgba(185,28,28,0.3)",
            }}
          >
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="classified-prefix">[CLASSIFIED]</span>
                <Lock className="h-3.5 w-3.5" style={{ color: "rgba(220,38,38,0.6)" }} />
                <h2 className="text-sm font-bold text-white font-mono tracking-wide">
                  SEC-00 · 기본 정보
                </h2>
              </div>
              <p className="text-xs pl-[calc(5.5rem)] -mt-0.5" style={{ color: "#4b5563" }}>
                회사명과 담당자 정보를 입력해주세요.
              </p>
            </div>

            <div
              className="mb-5 h-px"
              style={{ backgroundColor: "rgba(185,28,28,0.2)" }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-xs font-mono font-semibold" style={{ color: "#9ca3af" }}>
                  COMPANY NAME <span style={{ color: "#dc2626" }}>*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="(주) 브랜드명"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="font-mono text-sm text-white placeholder:text-[#374151] focus-visible:ring-1"
                  style={{
                    backgroundColor: "#0d0d0d",
                    border: "1px solid rgba(185,28,28,0.35)",
                    outline: "none",
                    boxShadow: "none",
                    "--tw-ring-color": "#dc2626",
                  } as React.CSSProperties}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager" className="text-xs font-mono font-semibold" style={{ color: "#9ca3af" }}>
                  CONTACT PERSON <span style={{ color: "#dc2626" }}>*</span>
                </Label>
                <Input
                  id="manager"
                  placeholder="홍길동"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="font-mono text-sm text-white placeholder:text-[#374151] focus-visible:ring-1"
                  style={{
                    backgroundColor: "#0d0d0d",
                    border: "1px solid rgba(185,28,28,0.35)",
                    outline: "none",
                    boxShadow: "none",
                    "--tw-ring-color": "#dc2626",
                  } as React.CSSProperties}
                  required
                />
              </div>
            </div>
          </div>

          {/* ══ SECTION 02: 파일 첨부 ══ */}
          <div
            className="rounded p-6"
            style={{
              backgroundColor: "#111",
              border: "1px solid rgba(185,28,28,0.3)",
            }}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="classified-prefix">[CLASSIFIED]</span>
                  <Lock className="h-3.5 w-3.5" style={{ color: "rgba(220,38,38,0.6)" }} />
                  <h2 className="text-sm font-bold text-white font-mono tracking-wide">
                    SEC-01 · 데이터 파일 첨부
                  </h2>
                </div>
                <p className="text-xs pl-[calc(5.5rem)] -mt-0.5" style={{ color: "#4b5563" }}>
                  보유하신 데이터를 카테고리별로 첨부해주세요.
                </p>
              </div>
              {totalFiles > 0 && (
                <span
                  className="shrink-0 rounded px-2.5 py-0.5 text-xs font-mono font-semibold"
                  style={{
                    backgroundColor: "rgba(220,38,38,0.12)",
                    border: "1px solid rgba(185,28,28,0.4)",
                    color: "#ef4444",
                  }}
                >
                  {totalFiles} FILES ATTACHED
                </span>
              )}
            </div>

            <div
              className="mb-5 h-px"
              style={{ backgroundColor: "rgba(185,28,28,0.2)" }}
            />

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
                    className="rounded overflow-hidden accordion-classified"
                    style={{
                      border: "1px solid rgba(185,28,28,0.25)",
                      backgroundColor: "#0d0d0d",
                    }}
                  >
                    <AccordionTrigger
                      className="px-4 py-3 text-left hover:no-underline transition-colors duration-150 hover:bg-[rgba(220,38,38,0.04)]"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="font-mono text-xs"
                          style={{ color: "rgba(220,38,38,0.55)" }}
                        >
                          ▌{cat.code}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {cat.icon} {cat.label}
                        </span>
                        {catFileCount > 0 && (
                          <span
                            className="rounded px-2 py-0.5 text-xs font-mono font-semibold"
                            style={{
                              backgroundColor: "rgba(220,38,38,0.12)",
                              border: "1px solid rgba(185,28,28,0.35)",
                              color: "#ef4444",
                            }}
                          >
                            {catFileCount}
                          </span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-1">
                      <div className="space-y-3">
                        {cat.sections.map((sid) => {
                          const sec = sections[sid]
                          return (
                            <div
                              key={sid}
                              className="rounded p-4"
                              style={{
                                backgroundColor: "#111",
                                border: "1px solid rgba(185,28,28,0.2)",
                              }}
                            >
                              <div className="mb-4 flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span
                                      className="font-mono text-xs"
                                      style={{ color: "rgba(220,38,38,0.5)" }}
                                    >
                                      ▸
                                    </span>
                                    <h4 className="text-sm font-semibold text-white font-mono">{sec.label}</h4>
                                  </div>
                                  <p className="text-xs ml-3.5" style={{ color: "#4b5563" }}>
                                    {sec.description}
                                  </p>
                                </div>
                                {sec.files.length > 0 && (
                                  <span
                                    className="rounded px-2 py-0.5 text-xs font-mono"
                                    style={{
                                      border: "1px solid rgba(185,28,28,0.35)",
                                      color: "#ef4444",
                                    }}
                                  >
                                    {sec.files.length}개
                                  </span>
                                )}
                              </div>

                              {sec.steps && sec.steps.length > 0 && (
                                <div
                                  className="mb-4 rounded p-3"
                                  style={{
                                    backgroundColor: "#0d0d0d",
                                    border: "1px solid rgba(185,28,28,0.15)",
                                  }}
                                >
                                  <p
                                    className="mb-2 text-xs font-mono font-semibold tracking-wider"
                                    style={{ color: "rgba(220,38,38,0.6)" }}
                                  >
                                    [EXTRACTION PROCEDURE]
                                  </p>
                                  <ol className="space-y-1.5">
                                    {sec.steps.map((step, i) => (
                                      <li key={i} className="flex gap-2 text-xs" style={{ color: "#6b7280" }}>
                                        <span
                                          className="shrink-0 font-mono"
                                          style={{ color: "rgba(220,38,38,0.5)" }}
                                        >
                                          {String(i + 1).padStart(2, "0")}.
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
            <div
              className="flex items-center gap-2 rounded px-4 py-3 text-sm font-mono"
              style={{
                backgroundColor: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(185,28,28,0.4)",
                color: "#ef4444",
              }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              [ERROR] {errorMsg}
            </div>
          )}

          {/* ══ SUBMIT ══ */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-2.5 rounded py-4 text-sm font-mono font-bold tracking-widest text-white transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: "#dc2626",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              letterSpacing: "0.15em",
            }}
            onMouseEnter={(e) => {
              if (status !== "loading") {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#b91c1c"
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#dc2626"
            }}
          >
            {status === "loading" ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                TRANSMITTING...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                SUBMIT · 데이터 전송
              </>
            )}
          </button>

          {/* Footer strip */}
          <div
            className="rounded px-4 py-3 text-center"
            style={{
              border: "1px solid rgba(185,28,28,0.15)",
              backgroundColor: "rgba(220,38,38,0.03)",
            }}
          >
            <p className="text-xs font-mono" style={{ color: "rgba(185,28,28,0.4)" }}>
              🔒 본 문서는 TLS 암호화로 안전하게 전송됩니다 · BIM ANALYTICS DIVISION
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}
