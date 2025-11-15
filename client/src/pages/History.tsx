import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, FileText, ArrowLeft, Trash2, Eye, FileEdit, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function History() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: drafts, isLoading: draftsLoading } = trpc.procurement.listDrafts.useQuery(
    { search: searchQuery },
    {
      enabled: isAuthenticated,
    }
  );

  const { data: completed, isLoading: completedLoading } = trpc.procurement.listCompleted.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isLoading = draftsLoading || completedLoading;

  const deleteMutation = trpc.procurement.delete.useMutation({
    onSuccess: () => {
      toast.success("刪除成功");
      utils.procurement.listDrafts.invalidate();
      utils.procurement.listCompleted.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "刪除失敗");
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">返回首頁</span>
                </Button>
              </Link>
              <div className="hidden md:block text-sm text-gray-600 truncate max-w-[120px]">
                {user?.name || user?.email}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl w-full">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>簽呈歷史記錄</CardTitle>
            <CardDescription>
              查看您過去生成的所有採購簽呈
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="completed" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="completed">已完成簽呈</TabsTrigger>
                <TabsTrigger value="drafts">草稿</TabsTrigger>
              </TabsList>

              <TabsContent value="completed">
                {!completed || completed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">尚無已完成的簽呈</p>
                    <Link href="/">
                      <Button className="mt-4">立即生成</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completed.map((approval) => (
                  <Card key={approval.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {approval.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {approval.userInput}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            建立時間: {formatDate(approval.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Link href={`/${approval.id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Eye className="w-4 h-4" />
                              查看
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                                刪除
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>確認刪除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  確定要刪除「{approval.title}」嗎?此操作無法復原。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(approval.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  確認刪除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                     ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="drafts">
                {/* 草稿搜尋 */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="搜尋草稿標題或內容..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {!drafts || drafts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileEdit className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">尚無草稿</p>
                    <Link href="/">
                      <Button className="mt-4">立即生成</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {drafts.map((draft) => (
                      <Card key={draft.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                  草稿
                                </span>
                                <h3 className="font-semibold text-lg text-gray-900 truncate">
                                  {draft.title || "採購簽呈草稿"}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {draft.userInput}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                最後編輯: {formatDate(draft.updatedAt)}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => {
                                  setLocation(`/?draft=${draft.id}`);
                                }}
                              >
                                <FileEdit className="w-4 h-4" />
                                繼續編輯
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>確認刪除</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      確定要刪除此草稿嗎?此操作無法復原。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(draft.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      確認刪除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
