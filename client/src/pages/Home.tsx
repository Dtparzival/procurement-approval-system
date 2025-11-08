import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, FileText, Upload, Sparkles, History as HistoryIcon, Copy, Check, LogOut, Brain, Save } from "lucide-react";
import { Streamdown } from "streamdown";
import { Link } from "wouter";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [userInput, setUserInput] = useState("");
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

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("已登出");
      window.location.href = getLoginUrl();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const saveDraftMutation = trpc.procurement.saveDraft.useMutation({
    onSuccess: () => {
      toast.success("草稿已儲存");
    },
    onError: (error) => {
      toast.error(error.message || "儲存失敗");
    },
  });

  const handleSaveDraft = () => {
    if (!userInput.trim()) {
      toast.error("請先輸入內容");
      return;
    }
    saveDraftMutation.mutate({
      userInput,
      title: "採購簽呈草稿",
    });
  };

  const generateMutation = trpc.procurement.generate.useMutation({
    onMutate: () => {
      setGeneratingStatus("正在分析您的需求...");
      setTimeout(() => setGeneratingStatus("正在組織簽呈內容..."), 2000);
      setTimeout(() => setGeneratingStatus("正在優化公文格式..."), 4000);
    },
    onSuccess: (data) => {
      setGeneratedApproval(data);
      setGeneratingStatus("");
      toast.success("簽呈生成成功!");
    },
    onError: (error) => {
      setGeneratingStatus("");
      toast.error(error.message || "生成失敗,請稍後再試");
    },
  });

  const uploadMutation = trpc.procurement.uploadFile.useMutation({
    onSuccess: (data) => {
      setUploadedFiles(prev => [...prev, data]);
      toast.success(`${data.fileName} 上傳成功`);
      // 自動識別文件內容
      extractMutation.mutate({
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        mimeType: data.mimeType,
      });
    },
    onError: (error) => {
      toast.error(error.message || "上傳失敗");
    },
  });

  const extractMutation = trpc.procurement.extractDocumentInfo.useMutation({
    onSuccess: (data) => {
      if (data.extractedInfo) {
        // 將識別的資訊附加到現有輸入
        setUserInput((prev: string) => {
          if (prev.trim()) {
            return `${prev}\n\n${data.extractedInfo}`;
          }
          return data.extractedInfo as string;
        });
        toast.success("已自動識別文件內容");
      }
    },
    onError: (error) => {
      toast.error("文件識別失敗，請手動輸入資訊");
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      // 檢查檔案大小 (限制 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} 超過 10MB 限制`);
        continue;
      }

      // 讀取檔案為 base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(",")[1]; // 移除 data:xxx;base64, 前綴

        uploadMutation.mutate({
          fileName: file.name,
          fileData: base64Data,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }

    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = () => {
    if (!userInput.trim()) {
      toast.error("請輸入採購需求描述");
      return;
    }

    generateMutation.mutate({
      userInput,
      attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
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

  const handleReset = () => {
    setUserInput("");
    setUploadedFiles([]);
    setGeneratedApproval(null);
    setIsCopied(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <FileText className="w-16 h-16 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">{APP_TITLE}</CardTitle>
            <CardDescription className="text-base">
              使用 AI 技術一鍵生成專業採購簽呈公文
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <a href={getLoginUrl()}>登入開始使用</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>歡迎, {user?.name || "使用者"}</span>
              </div>
            )}
            <Link href="/history">
              <Button variant="outline" className="gap-2">
                <HistoryIcon className="w-4 h-4" />
                歷史記錄
              </Button>
            </Link>
            {isAuthenticated && (
              <Button 
                variant="outline" 
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4" />
                登出
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8">
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
                <div className="space-y-2">
                  <Label htmlFor="userInput">需求描述</Label>
              <Textarea
                id="userInput"
                placeholder="例如:需要採購 10 台筆記型電腦,規格為 Intel i7 處理器, 16GB RAM, 512GB SSD,用於研發部門進行軟體開發工作,預算約 30 萬元..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={generateMutation.isPending || extractMutation.isPending}
              />
              {extractMutation.isPending && (
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在識別文件內容...
                </p>
              )}
                  <div className="text-xs text-gray-500">
                    {userInput.length} / 最少 10 個字元
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>參考文件 (選填)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadMutation.isPending ? "上傳中..." : "選擇檔案"}
                    </Button>
                    <span className="text-xs text-gray-500">
                      支援 PDF, Word, 圖片 (最大 10MB)
                    </span>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                        >
                          <span className="text-sm truncate flex-1">{file.fileName}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                          >
                            移除
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveDraft}
                    disabled={saveDraftMutation.isPending || !userInput.trim()}
                    variant="outline"
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    {saveDraftMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        儲存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        儲存草稿
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || !userInput.trim()}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI 生成中...
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
            <Card className="shadow-lg min-h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    簽呈預覽
                  </CardTitle>
                  {generatedApproval && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-2"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            已複製
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            複製
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                      >
                        重新生成
                      </Button>
                    </div>
                  )}
                </div>
                {generatedApproval && (
                  <CardDescription>{generatedApproval.title}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {generateMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="relative">
                      <Brain className="w-16 h-16 text-blue-500 mb-4 animate-pulse" />
                      <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full animate-ping" />
                    </div>
                    <p className="text-lg font-semibold text-blue-600 mb-2">
                      AI 正在思考中...
                    </p>
                    {generatingStatus && (
                      <p className="text-sm text-gray-600 animate-pulse">
                        {generatingStatus}
                      </p>
                    )}
                    <div className="mt-6 flex gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                ) : !generatedApproval ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      填寫採購需求後,點擊「生成簽呈」按鈕
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      AI 將自動為您生成專業的採購簽呈公文
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <Streamdown>{generatedApproval.content}</Streamdown>
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
