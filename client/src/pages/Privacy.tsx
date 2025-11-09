import { APP_TITLE } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首頁
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">隱私政策</h1>
          <p className="text-sm text-gray-500 mb-8">最後更新日期:2024 年 11 月</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 政策概述</h2>
              <p className="text-gray-700 leading-relaxed">
                {APP_TITLE} 重視您的隱私權保護。本隱私政策說明我們如何收集、使用、儲存及保護您的個人資料。使用本服務即表示您同意本隱私政策的內容。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 收集的資料類型</h2>
              <p className="text-gray-700 leading-relaxed mb-3">我們可能收集以下類型的資料:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>帳號資訊:</strong> 包括您的姓名、電子郵件地址及登入方式</li>
                <li><strong>使用資料:</strong> 包括您使用本服務的記錄,如生成的簽呈內容、上傳的文件、使用時間等</li>
                <li><strong>技術資料:</strong> 包括 IP 位址、瀏覽器類型、裝置資訊、作業系統等</li>
                <li><strong>Cookie 與類似技術:</strong> 用於維持登入狀態及改善使用體驗</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 資料使用目的</h2>
              <p className="text-gray-700 leading-relaxed mb-3">我們收集的資料將用於以下目的:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>提供、維護及改善本服務的功能</li>
                <li>處理您的請求並回應您的查詢</li>
                <li>進行資料分析以改善使用者體驗</li>
                <li>偵測、預防及處理技術問題或安全威脅</li>
                <li>遵守法律義務及保護我們的合法權益</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. AI 處理與資料安全</h2>
              <p className="text-gray-700 leading-relaxed">
                本服務使用人工智慧技術處理您提供的資訊以生成採購簽呈。您上傳的文件和輸入的內容將被傳送至 AI 服務進行處理。我們採取適當的技術和組織措施來保護您的資料安全,包括加密傳輸、存取控制等,但無法保證絕對安全。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 資料分享與揭露</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                我們不會出售您的個人資料。在以下情況下,我們可能會分享您的資料:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>服務提供商:</strong> 與協助我們提供服務的第三方服務商(如雲端儲存、AI 服務提供商)分享必要資料</li>
                <li><strong>法律要求:</strong> 當法律要求或為保護我們的權利時,可能需要揭露您的資料</li>
                <li><strong>企業交易:</strong> 在合併、收購或資產出售的情況下,您的資料可能會被轉移</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 資料保存期限</h2>
              <p className="text-gray-700 leading-relaxed">
                我們會在達成收集目的所需的期間內保存您的個人資料。當您刪除帳號或要求刪除資料時,我們會在合理期限內刪除您的個人資料,但可能因法律或技術原因需要保留部分資料。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 您的權利</h2>
              <p className="text-gray-700 leading-relaxed mb-3">根據適用的資料保護法律,您擁有以下權利:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>存取權:</strong> 要求查看我們持有的您的個人資料</li>
                <li><strong>更正權:</strong> 要求更正不正確或不完整的個人資料</li>
                <li><strong>刪除權:</strong> 要求刪除您的個人資料</li>
                <li><strong>限制處理權:</strong> 要求限制對您個人資料的處理</li>
                <li><strong>資料可攜權:</strong> 要求以結構化、常用且機器可讀的格式接收您的個人資料</li>
                <li><strong>反對權:</strong> 反對我們處理您的個人資料</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                如需行使上述權利,請透過系統內的聯絡功能與我們聯繫。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookie 政策</h2>
              <p className="text-gray-700 leading-relaxed">
                本服務使用 Cookie 和類似技術來維持您的登入狀態、記住您的偏好設定,並改善使用體驗。您可以透過瀏覽器設定管理 Cookie,但這可能會影響某些功能的正常運作。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. 兒童隱私</h2>
              <p className="text-gray-700 leading-relaxed">
                本服務不針對 13 歲以下的兒童。我們不會故意收集 13 歲以下兒童的個人資料。如果您發現我們收集了兒童的個人資料,請立即與我們聯繫。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. 隱私政策變更</h2>
              <p className="text-gray-700 leading-relaxed">
                我們可能會不定期更新本隱私政策。更新後的隱私政策將在本頁面公布,並註明最後更新日期。重大變更時,我們會透過適當方式通知您。繼續使用本服務即表示您同意更新後的隱私政策。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. 聯絡我們</h2>
              <p className="text-gray-700 leading-relaxed">
                如您對本隱私政策有任何疑問、意見或需要行使您的權利,請透過系統內的聯絡功能與我們聯繫。我們會在合理期限內回覆您的請求。
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
