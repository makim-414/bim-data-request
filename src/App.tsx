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
    <div className="space-y-2">
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
        className="gap-2 border-dashed border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
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
              className="flex items-center gap-2 rounded-md bg-slate-800/60 px-3 py-1.5 text-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span className="flex-1 truncate text-slate-200">{f.file.name}</span>
              <span className="shrink-0 text-xs text-slate-500">
                {(f.file.size / 1024).toFixed(0)}KB
              </span>
              <button
                type="button"
                onClick={() => onRemove(sectionId, f.id)}
                className="ml-1 rounded text-slate-500 hover:text-red-400"
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-center">
          <CardContent className="pt-12 pb-10">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-400" />
            <h2 className="mb-2 text-2xl font-bold text-white">제출 완료!</h2>
            <p className="text-slate-400">
              데이터가 성공적으로 전송되었습니다.
              <br />담당자가 검토 후 연락드리겠습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge variant="outline" className="mb-4 border-blue-500/40 bg-blue-500/10 text-blue-400">
            BIM Data Collection
          </Badge>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            BIM 데이터 요청 폼
          </h1>
          <p className="text-slate-400">
            마케팅 분석에 필요한 데이터를 안전하게 제출해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-white">기본 정보</CardTitle>
              <CardDescription className="text-slate-500">
                회사명과 담당자 정보를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-300">
                  회사명 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="(주) 브랜드명"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager" className="text-slate-300">
                  담당자명 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="manager"
                  placeholder="홍길동"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 데이터 카테고리별 Accordion */}
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">데이터 파일 첨부</CardTitle>
                  <CardDescription className="mt-1 text-slate-500">
                    보유하신 데이터를 카테고리별로 첨부해주세요.
                  </CardDescription>
                </div>
                {totalFiles > 0 && (
                  <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                    {totalFiles}개 파일
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-2">
                {categories.map((cat) => (
                  <AccordionItem
                    key={cat.id}
                    value={cat.id}
                    className="rounded-lg border border-slate-800 bg-slate-800/30 px-0"
                  >
                    <AccordionTrigger className="px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:no-underline [&[data-state=open]]:text-white">
                      <span className="flex items-center gap-2">
                        {cat.label}
                        {cat.sections.reduce((acc, sid) => acc + sections[sid].files.length, 0) > 0 && (
                          <Badge className="ml-1 bg-emerald-500/20 text-emerald-400 text-xs">
                            {cat.sections.reduce((acc, sid) => acc + sections[sid].files.length, 0)}
                          </Badge>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-5">
                        {cat.sections.map((sid) => {
                          const sec = sections[sid]
                          return (
                            <div
                              key={sid}
                              className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4"
                            >
                              <div className="mb-3 flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-slate-100">{sec.label}</h4>
                                  <p className="text-xs text-slate-500">{sec.description}</p>
                                </div>
                                {sec.files.length > 0 && (
                                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs">
                                    {sec.files.length}개
                                  </Badge>
                                )}
                              </div>

                              {sec.steps && sec.steps.length > 0 && (
                                <div className="mb-3 rounded-md bg-slate-800/80 p-3">
                                  <p className="mb-1.5 text-xs font-medium text-slate-400">
                                    📋 추출 방법
                                  </p>
                                  <ol className="space-y-1">
                                    {sec.steps.map((step, i) => (
                                      <li key={i} className="flex gap-2 text-xs text-slate-400">
                                        <span className="shrink-0 font-mono text-slate-600">
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
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* 에러 메시지 */}
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* 제출 버튼 */}
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full gap-2 bg-blue-600 py-6 text-base font-semibold hover:bg-blue-500 disabled:opacity-50"
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
          </Button>

          <p className="pb-4 text-center text-xs text-slate-600">
            🔒 제출된 파일은 암호화되어 안전하게 전송됩니다.
          </p>
        </form>
      </div>
    </div>
  )
}
