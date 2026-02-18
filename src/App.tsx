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
  ga4: {
    id: "ga4",
    label: "GA4",
    labelEn: "Google Analytics 4",
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
    labelEn: "Google Search Console",
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
    labelEn: "Google Ads",
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
    labelEn: "Meta Ads Manager",
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
    labelEn: "TikTok Ads Manager",
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
    labelEn: "Universal Analytics",
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
    labelEn: "SEO Analytics",
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
    labelEn: "Company Profile / Media Kit",
    description: "회사 소개 및 브랜드 자료",
    files: [],
  },
  brandGuide: {
    id: "brandGuide",
    label: "브랜드 가이드라인",
    labelEn: "Brand Guidelines",
    description: "로고, 컬러, 타이포그래피 등 브랜드 아이덴티티 자료",
    files: [],
  },
}

const categories = [
  {
    id: "search",
    label: "검색 광고 데이터",
    labelEn: "Search Advertising Data",
    code: "SEC-01",
    sections: ["ga4", "gsc", "googleAds"],
  },
  {
    id: "social",
    label: "소셜 미디어 데이터",
    labelEn: "Social Media Data",
    code: "SEC-02",
    sections: ["meta", "tiktok"],
  },
  {
    id: "web",
    label: "웹사이트 데이터",
    labelEn: "Website Analytics Data",
    code: "SEC-03",
    sections: ["ga", "semrush"],
  },
  {
    id: "brand",
    label: "브랜드 기본 자료",
    labelEn: "Brand Assets",
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
    if (!uploader.trim()) {
      setErrorMsg("업로드 담당자명을 입력해주세요.")
      return
    }
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

          {/* SEC-00 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEC-00 · 기본 정보</CardTitle>
              <CardDescription>Client Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 미리디 팀 정보 (정적) */}
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

              {/* 업로드 담당자 */}
              <div className="space-y-2">
                <Label htmlFor="uploader">업로드 담당자명 <span className="text-muted-foreground text-xs">/ File Uploader</span></Label>
                <Input
                  id="uploader"
                  placeholder="파일을 업로드하는 담당자 이름"
                  value={uploader}
                  onChange={(e) => setUploader(e.target.value)}
                  required
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
                          <span className="text-xs text-muted-foreground font-mono">
                            {cat.code}
                          </span>
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
