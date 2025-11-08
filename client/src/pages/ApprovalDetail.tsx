import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, FileText, ArrowLeft, Copy, Check, Download } from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import { Streamdown } from "streamdown";

export default function ApprovalDetail() {
  const { id } = useParams();
  const approvalId = id ? parseInt(id) : 0;
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

  const { data: approval, isLoading, error } = trpc.procurement.getById.useQuery(
    { id: approvalId },
    { enabled: isAuthenticated && approvalId > 0 }
  );

  const handleCopy = async () => {
    if (!approval || !approval.generatedContent) return;
    
    try {
      await navigator.clipboard.writeText(approval.generatedContent);
      setIsCopied(true);
      toast.success("已複製到剪貼簿");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("複製失敗");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || isLoading) {
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
          <CardHeader className="text-center">
            <CardTitle>請先登入</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>登入</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !approval) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>簽呈不存在</CardTitle>
            <CardDescription>
              {error?.message || "找不到此簽呈記錄"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/history">
              <Button className="w-full">返回歷史記錄</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/history">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回列表
              </Button>
            </Link>
            <div className="text-sm text-gray-600">
              {user?.name || user?.email}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{approval.title}</CardTitle>
                  <CardDescription className="mt-2">
                    建立時間: {formatDate(approval.createdAt)}
                    {approval.updatedAt && approval.updatedAt !== approval.createdAt && (
                      <> · 更新時間: {formatDate(approval.updatedAt)}</>
                    )}
                  </CardDescription>
                </div>
                <Button
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
                      複製內容
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Original Input */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">原始需求</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{approval.userInput}</p>
            </CardContent>
          </Card>

          {/* Attachments */}
          {approval.documents && approval.documents.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">參考文件</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {approval.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                          {doc.mimeType && ` · ${doc.mimeType}`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2 flex-shrink-0"
                      >
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                          下載
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Content */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">生成的簽呈內容</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <Streamdown>{approval.generatedContent}</Streamdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
