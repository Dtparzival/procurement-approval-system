import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, FileText, Upload, Sparkles, History as HistoryIcon, Copy, Check, LogOut, Brain, Save, Clock, FileEdit, ArrowRight, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Streamdown } from "streamdown";
import { Link } from "wouter";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [userInput, setUserInput] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    fileName: string;
    fileKey: string;
    fileUrl: string;
    mimeType?: string;
    fileSize?: number;
  }>>([]);
  const [generatedApproval, setGeneratedApproval] = useState<{
    id: number;
    title: string;
    content: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 獲取最近草稿
  const { data: recentDrafts } = trpc.procurement.getRecentDrafts.useQuery();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("已登出");
      // 登出後重新載入首頁
      window.location.href = "/";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const saveDraftMutation = trpc.procurement.saveDraft.useMutation({
    onSuccess: (data) => {
      setLastSaved(new Date());
      setCurrentDraftId(data.id);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "儲存失敗");
    },
  });

  const handleSaveDraft = () => {
    if (!userInput.trim()) {
      toast.error("請輸入需求描述");
      return;
    }

    saveDraftMutation.mutate({
      userInput,
      title: draftTitle || "採購簽呈草稿",
      id: currentDraftId || undefined,
    });
  };

  // 自動儲存功能
  useEffect(() => {
    if (!autoSaveEnabled || !userInput.trim()) return;

    const timer = setTimeout(() => {
      saveDraftMutation.mutate({
        userInput,
        title: draftTitle || "採購簽呈草稿",
        id: currentDraftId || undefined,
      });
    }, 30000); // 30 秒

    return () => clearTimeout(timer);
  }, [userInput, draftTitle, autoSaveEnabled, currentDraftId]);

  // 載入草稿
  const handleLoadDraft = (draft: any) => {
    setUserInput(draft.userInput);
    setDraftTitle(draft.title || "");
    setCurrentDraftId(draft.id);
    toast.success("已載入草稿");
  };

  const uploadFileMutation = trpc.procurement.uploadFile.useMutation({
    onSuccess: (data) => {
      setUploadedFiles((prev) => [...prev, data]);
      toast.success(`檔案 ${data.fileName} 上傳成功`);
    },
    onError: (error) => {
      toast.error(error.message || "上傳失敗");
    },
  });

  const extractDocumentMutation = trpc.procurement.extractDocumentInfo.useMutation({
    onSuccess: (data: any) => {
      toast.success("已自動識別文件內容");
      setUserInput((prev) => {
        const newContent = prev.trim() ? `${prev}\n\n${data.extractedInfo}` : data.extractedInfo;
        return newContent;
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "文件識別失敗");
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast.error("檔案大小不能超過 10MB");
      return;
    }

    toast.info("正在上傳檔案...");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64Content = base64Data.split(",")[1];

        const uploadResult = await uploadFileMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Content,
          mimeType: file.type,
        });

        // 自動識別文件內容
        toast.info("正在識別文件內容...");
        extractDocumentMutation.mutate({
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          mimeType: uploadResult.mimeType || file.type,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateMutation = trpc.procurement.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedApproval({
        id: data.id,
        title: data.title,
        content: data.content,
      });
      setGeneratingStatus("");
      toast.success("簽呈生成成功!");
      // 清空草稿 ID,因為已經生成正式簽呈
      setCurrentDraftId(null);
    },
    onError: (error) => {
      setGeneratingStatus("");
      toast.error(error.message || "生成失敗");
    },
  });

  const handleGenerate = () => {
    if (!userInput.trim()) {
      toast.error("請輸入採購需求描述");
      return;
    }

    setGeneratingStatus("正在分析您的需求...");
    setTimeout(() => setGeneratingStatus("正在組織簽呈內容..."), 2000);
    setTimeout(() => setGeneratingStatus("正在優化公文格式..."), 4000);

    generateMutation.mutate({
      userInput,
      attachments: uploadedFiles.map((f) => ({
        fileName: f.fileName,
        fileUrl: f.fileUrl,
        fileKey: f.fileKey,
        mimeType: f.mimeType,
        fileSize: f.fileSize,
      })),
    });
  };

  const handleCopy = async () => {
    if (!generatedApproval) return;

    try {
      await navigator.clipboard.writeText(generatedApproval.content);
      setIsCopied(true);
      toast.success("已複製到剪貼簿");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("複製失敗");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          {/* 導航欄 */}
          <header className="bg-white border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowLoginDialog(true)}
                >
                  登入
                </Button>
              </div>
            </div>
          </header>

          {/* 主要內容 */}
          <main>
            {/* Hero 區塊 */}
            <section className="py-20 px-4">
              <div className="container mx-auto max-w-4xl text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mb-8 shadow-xl">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                  AI 智能公文簽核系統
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  用自然語言描述需求，AI 自動生成專業採購簽呈。節省 99% 的時間，提升行政效率。
                </p>
                <Button 
                  size="lg"
                  onClick={() => setShowLoginDialog(true)}
                  className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg"
                >
                  開始使用
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </section>

            {/* 功能介紹 */}
            <section className="py-16 px-4 bg-white">
              <div className="container mx-auto max-w-6xl">
                <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                  核心功能
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">自然語言輸入</h4>
                      <p className="text-gray-600">
                        用日常語言描述採購需求，AI 自動生成符合格式的專業簽呈。
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">智能文件識別</h4>
                      <p className="text-gray-600">
                        上傳 PDF、Word 或圖片，系統自動提取關鍵資訊並填入簽呈。
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                        <Save className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">草稿自動儲存</h4>
                      <p className="text-gray-600">
                        每 30 秒自動保存草稿，防止意外關閉導致資料遺失。
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* 優勢介紹 */}
            <section className="py-16 px-4">
              <div className="container mx-auto max-w-4xl">
                <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                  為什麼選擇 {APP_TITLE}
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">節省 99% 的時間</h4>
                      <p className="text-gray-600">從傳統 18 分鐘縮短至 12 秒，大幅提升行政效率。</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">專業格式保證</h4>
                      <p className="text-gray-600">AI 生成的簽呈符合公文格式，可直接使用。</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">完整歷史記錄</h4>
                      <p className="text-gray-600">所有簽呈自動儲存，隨時查詢與管理。</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA 區塊 */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
              <div className="container mx-auto max-w-4xl text-center">
                <h3 className="text-4xl font-bold text-white mb-6">
                  立即開始使用
                </h3>
                <p className="text-xl text-blue-100 mb-8">
                  加入數百位使用者，體驗 AI 智能公文系統帶來的效率提升。
                </p>
                <Button 
                  size="lg"
                  onClick={() => setShowLoginDialog(true)}
                  className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                >
                  免費開始使用
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </section>
          </main>

          {/* 頁尾 */}
          <footer className="bg-white border-t py-8 px-4">
            <div className="container mx-auto text-center text-gray-600">
              <p>© 2025 {APP_TITLE}. All rights reserved.</p>
            </div>
          </footer>
        </div>

        {/* 登入對話框 */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>歡迎使用 {APP_TITLE}</DialogTitle>
              <DialogDescription>
                請登入以開始使用 AI 智能公文簽核系統。
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Button 
                onClick={() => (window.location.href = getLoginUrl())} 
                className="w-full h-12 text-lg"
              >
                登入
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                登入即表示您同意我們的服務條款與隱私政策
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-x-hidden">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden md:block text-sm text-gray-600 truncate max-w-[150px]">
                歡迎, {user?.name || user?.email}
              </div>
              <Link href="/history">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <HistoryIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">歷史記錄</span>
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">登出</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl w-full">
        {/* 最近草稿快速恢復 */}
        {recentDrafts && recentDrafts.length > 0 && !currentDraftId && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-amber-600" />
                繼續編輯最近的草稿
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {recentDrafts.map((draft) => (
                  <Button
                    key={draft.id}
                    variant="outline"
                    className="justify-start text-left h-auto py-2"
                    onClick={() => handleLoadDraft(draft)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{draft.title}</div>
                      <div className="text-sm text-gray-500 truncate">{draft.userInput.substring(0, 60)}...</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(draft.updatedAt).toLocaleString("zh-TW")}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 w-full">
          {/* Left: Input Section */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  採購需求描述
                </CardTitle>
                <CardDescription>
                  請詳細描述您的採購需求,包括物品名稱、數量、用途等資訊
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 草稿標題 */}
                <div className="space-y-2">
                  <Label htmlFor="draftTitle">草稿標題 (選填)</Label>
                  <Input
                    id="draftTitle"
                    placeholder="例如:辦公設備採購、軟體授權採購..."
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                  />
                </div>

                {/* 需求描述 */}
                <div className="space-y-2">
                  <Label htmlFor="userInput">需求描述</Label>
                  <Textarea
                    id="userInput"
                    placeholder="例如:需要採購 10 台筆記型電腦,規格為 Intel i7 處理器, 16GB RAM, 512GB SSD,用於研發部門進行軟體開發工作,預算約 30 萬元..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{userInput.length} / 最少 10 個字元</span>
                    {lastSaved && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Clock className="w-3 h-3" />
                        上次儲存: {lastSaved.toLocaleTimeString("zh-TW")}
                      </span>
                    )}
                  </div>
                </div>

                {/* 參考文件 */}
                <div className="space-y-2">
                  <Label>參考文件 (選填)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadFileMutation.isPending || extractDocumentMutation.isPending}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      選擇檔案
                    </Button>
                    <span className="text-sm text-gray-500">支援 PDF, Word, 圖片 (最大 10MB)</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {file.fileName}
                        </div>
                      ))}
                    </div>
                  )}
                  {extractDocumentMutation.isPending && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在識別文件內容...
                    </div>
                  )}
                </div>

                {/* 操作按鈕 */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveDraft}
                    variant="outline"
                    disabled={!userInput.trim() || saveDraftMutation.isPending}
                    className="gap-2 flex-1"
                  >
                    <Save className="w-4 h-4" />
                    儲存草稿
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!userInput.trim() || generateMutation.isPending}
                    className="gap-2 flex-1"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        生成簽呈
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview Section */}
          <div className="space-y-6">
            <Card className="shadow-lg min-h-[500px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  簽呈預覽
                </CardTitle>
                <CardDescription>
                  填寫採購需求後,點擊「生成簽呈」按鈕
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generateMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <Brain className="w-16 h-16 text-blue-600 animate-pulse" />
                    <div className="text-center space-y-2">
                      <p className="text-lg font-medium text-gray-700">{generatingStatus}</p>
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                ) : generatedApproval ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{generatedApproval.title}</h3>
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            已複製
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            複製
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none border rounded-lg p-4 bg-gray-50">
                      <Streamdown>{generatedApproval.content}</Streamdown>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <FileText className="w-16 h-16 mb-4" />
                    <p>AI 將自動為您生成專業的採購簽呈公文</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
