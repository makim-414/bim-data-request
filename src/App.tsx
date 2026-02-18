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
  // ── SEC-01: 검색 광고 데이터 ──
  ga4: {
    id: "ga4",
    label: "GA4",
    labelEn: "Google Analytics 4",
    description: "웹사이트 유입·행동·전환 데이터 (현재 표준 분석 도구)",
    steps: [
      "analytics.google.com 접속 → 좌측 '보고서' 클릭",
      "분석하고 싶은 항목 선택 (획득 > 트래픽 획득, 참여도 > 페이지 등)",
      "우측 상단 날짜 범위 설정 (최근 3~6개월 권장)",
      "우측 상단 다운로드 아이콘 → 'CSV로 내보내기' 클릭",
      "탐색 분석 (Explore) 데이터가 있다면 함께 내보내 주세요",
    ],
    files: [],
  },
  gsc: {
    id: "gsc",
    label: "Google Search Console",
    labelEn: "Google Search Console",
    description: "구글 검색에서 노출된 키워드·클릭·순위 데이터",
    steps: [
      "search.google.com/search-console 접속",
      "좌측 '실적' 클릭 → 날짜 범위 최근 6개월 설정",
      "쿼리, 페이지, 국가, 기기 탭 각각 '내보내기' → Google 스프레드시트 또는 CSV",
      "커버리지(색인 현황) 데이터도 있다면 함께 내보내 주세요",
    ],
    files: [],
  },
  googleAds: {
    id: "googleAds",
    label: "Google Ads",
    labelEn: "Google Ads",
    description: "검색·디스플레이·유튜브 광고 성과 데이터",
    steps: [
      "ads.google.com 접속 → 상단 '보고서' 탭 클릭",
      "'사전 정의된 보고서' 또는 '맞춤 보고서' 선택",
      "캠페인 / 광고그룹 / 키워드 단위 각각 다운로드",
      "지표 포함: 노출수, 클릭수, CTR, CPC, 전환수, 전환율, 비용",
      "우측 상단 다운로드 아이콘 → CSV 선택",
    ],
    files: [],
  },
  naver: {
    id: "naver",
    label: "네이버 검색광고",
    labelEn: "Naver Search Ads",
    description: "네이버 키워드 광고 및 쇼핑 광고 성과 데이터",
    steps: [
      "searchad.naver.com 접속 → '보고서' 탭 클릭",
      "광고 유형 선택: 검색광고 / 쇼핑검색 / 브랜드검색",
      "기간 설정 (최근 3~6개월 권장) 후 '조회' 클릭",
      "캠페인 / 광고그룹 / 키워드 단위 각각 다운로드",
      "지표 포함: 노출수, 클릭수, 클릭률, 평균CPC, 총비용, 전환수",
      "우측 상단 '다운로드' → Excel 또는 CSV 선택",
    ],
    files: [],
  },
  // ── SEC-02: 소셜 미디어 데이터 ──
  meta: {
    id: "meta",
    label: "Meta (Facebook/Instagram)",
    labelEn: "Meta Ads Manager",
    description: "페이스북·인스타그램 광고 성과 및 오디언스 데이터",
    steps: [
      "business.facebook.com → 광고 관리자(Ads Manager) 접속",
      "상단 '보고서' 탭 → '광고 보고서' 클릭",
      "날짜 범위 설정 (최근 3~6개월) 후 분류 기준: 캠페인 / 광고 세트 / 광고 선택",
      "지표 포함: 노출수, 도달수, 클릭수, CTR, CPM, CPC, 전환수, ROAS, 지출금액",
      "우측 상단 '내보내기' → CSV 또는 Excel 다운로드",
      "인스타그램 인사이트(오가닉)도 있다면 함께 제공해 주세요",
    ],
    files: [],
  },
  pinterest: {
    id: "pinterest",
    label: "Pinterest",
    labelEn: "Pinterest Ads",
    description: "핀터레스트 광고 및 오가닉 성과 데이터",
    steps: [
      "ads.pinterest.com 접속 → 'Analytics' 탭 클릭",
      "캠페인 단위 광고 성과 확인 후 '내보내기' 클릭",
      "오가닉 Pinterest 분석도 analytics.pinterest.com에서 내보내기 가능",
      "지표 포함: 노출수, 클릭수, 저장수, CTR, 지출금액",
    ],
    files: [],
  },
  // ── SEC-03: 웹사이트 분석 ──
  naverAnalytics: {
    id: "naverAnalytics",
    label: "네이버 애널리틱스 / 서치어드바이저",
    labelEn: "Naver Analytics",
    description: "네이버를 통한 유입 및 검색 성과 데이터",
    steps: [
      "analytics.naver.com 접속 → 보고서 탭",
      "기간 설정 후 채널별 유입, 페이지뷰, 체류시간 확인",
      "우측 상단 다운로드 → Excel 내보내기",
      "searchadvisor.naver.com에서 키워드 유입 현황도 함께 내보내 주세요",
    ],
    files: [],
  },
  // ── SEC-04: 브랜드 자료 ──
  companyProfile: {
    id: "companyProfile",
    label: "회사 소개서 / IR 자료",
    labelEn: "Company Profile / IR Deck",
    description: "최신 회사 소개서, IR 덱, 미디어킷",
    steps: [
      "📄 최신 회사 소개서 PDF (국문/영문 모두 있다면 함께)",
      "📊 IR 덱 또는 투자자 대상 발표자료 (있는 경우)",
      "🗂️ 미디어킷 (언론/파트너 배포용 자료)",
      "※ 내부 비공개 자료라도 분석 목적으로만 활용되며 외부에 공유되지 않습니다",
    ],
    files: [],
  },
  brandGuide: {
    id: "brandGuide",
    label: "브랜드 가이드라인",
    labelEn: "Brand Identity Guide",
    description: "로고, 컬러, 폰트 등 브랜드 아이덴티티 정의 자료",
    steps: [
      "🎨 로고 원본 파일 — AI / EPS / SVG / PNG(투명배경) 형식으로 제공",
      "🎨 메인 컬러 + 서브 컬러 — HEX 또는 RGB 코드 포함된 파일",
      "✏️ 공식 폰트명 및 사용 가이드 (Primary/Secondary 폰트 구분)",
      "📐 레이아웃·여백·사용 금지 사례 등 상세 브랜드 가이드라인 PDF",
      "📸 공식 사진·이미지 톤앤매너 가이드 (있는 경우)",
      "※ 파일이 분리되어 있다면 각각 업로드해 주세요 (ZIP 압축도 가능)",
    ],
    files: [],
  },
  creativeAssets: {
    id: "creativeAssets",
    label: "광고 소재 / 크리에이티브",
    labelEn: "Ad Creatives",
    description: "현재 집행 중이거나 최근 집행한 광고 소재",
    steps: [
      "📱 SNS 광고 소재 — 이미지/영상 파일 (최근 3~6개월 집행 소재)",
      "🖼️ 배너 광고 소재 — 사이즈별 이미지 파일",
      "📝 카피/헤드라인 — 광고에 사용된 주요 문구 목록 (엑셀/문서)",
      "🎬 영상 광고 소재 — 유튜브/SNS 영상 링크 또는 파일",
      "※ '잘 됐던' 소재와 '안 됐던' 소재를 구분해서 제공하시면 더욱 도움이 됩니다",
    ],
    files: [],
  },
  // ── SEC-05: 기타 ──
  other: {
    id: "other",
    label: "기타 데이터",
    labelEn: "Other / Additional Data",
    description: "위 항목 외 추가로 제공하고 싶은 데이터나 자료",
    steps: [
      "위 섹션에 포함되지 않은 광고 플랫폼 데이터 (카카오, 앱스토어 등)",
      "CRM/CDP 데이터 (고객 세그먼트, 이탈율, LTV 등)",
      "리뷰/NPS 데이터 (앱 스토어 리뷰, 설문 결과 등)",
      "기타 분석에 도움이 될 것 같은 자료 자유롭게 첨부",
    ],
    files: [],
  },
}

const categories = [
  {
    id: "search",
    label: "검색 광고 데이터",
    labelEn: "Search Advertising Data",
    code: "SEC-01",
    sections: ["ga4", "gsc", "googleAds", "naver"],
  },
  {
    id: "social",
    label: "소셜 미디어 데이터",
    labelEn: "Social Media Data",
    code: "SEC-02",
    sections: ["meta", "pinterest"],
  },
  {
    id: "web",
    label: "웹사이트 분석",
    labelEn: "Website Analytics",
    code: "SEC-03",
    sections: ["naverAnalytics"],
  },
  {
    id: "brand",
    label: "브랜드 기본 자료",
    labelEn: "Brand & Creative Assets",
    code: "SEC-04",
    sections: ["companyProfile", "brandGuide", "creativeAssets"],
  },
  {
    id: "other",
    label: "기타",
    labelEn: "Other",
    code: "SEC-05",
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
