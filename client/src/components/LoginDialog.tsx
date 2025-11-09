import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Shield, CheckCircle2 } from "lucide-react";

interface LoginDialogProps {
  title?: string;
  logo?: string;
  open?: boolean;
  onLogin: () => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function LoginDialog({
  title = APP_TITLE,
  logo = APP_LOGO,
  open = false,
  onLogin,
  onOpenChange,
  onClose,
}: LoginDialogProps) {
  const [internalOpen, setInternalOpen] = useState(open);

  useEffect(() => {
    if (!onOpenChange) {
      setInternalOpen(open);
    }
  }, [open, onOpenChange]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }

    if (!nextOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog
      open={onOpenChange ? open : internalOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="py-5 bg-white rounded-[20px] w-[90vw] max-w-[440px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.12)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl p-0 gap-0 text-center">
        <div className="flex flex-col items-center gap-3 p-6 pt-10">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg flex items-center justify-center">
            <img src={logo} alt="App icon" className="w-10 h-10 rounded-md" />
          </div>

          {/* Title and subtitle */}
          <DialogTitle className="text-xl font-semibold text-gray-900 leading-[26px] tracking-[-0.44px] mt-2">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 leading-5 tracking-[-0.154px] max-w-[320px]">
            使用您的帳號登入,開始使用 AI 智能公文簽核系統
          </DialogDescription>

          {/* 支援的登入方式說明 */}
          <div className="w-full mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3 text-left mb-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">支援多種登入方式</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  您可以使用 Google、Microsoft、GitHub 或其他帳號登入
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-left">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">安全可靠</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  採用業界標準的 OAuth 2.0 認證機制,保護您的資料安全
                </p>
              </div>
            </div>
          </div>

          {/* 功能特色 */}
          <div className="w-full mt-2 space-y-2">
            <div className="flex items-center gap-2 text-left text-xs text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>AI 自動生成專業採購簽呈</span>
            </div>
            <div className="flex items-center gap-2 text-left text-xs text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>草稿自動儲存,隨時繼續編輯</span>
            </div>
            <div className="flex items-center gap-2 text-left text-xs text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>支援文件上傳與智能識別</span>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-5 bg-gray-50 rounded-b-[20px]">
          {/* Login button */}
          <Button
            onClick={onLogin}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-sm font-medium leading-5 tracking-[-0.154px] shadow-md"
          >
            立即登入
          </Button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            登入即表示您同意使用本系統的服務條款
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
