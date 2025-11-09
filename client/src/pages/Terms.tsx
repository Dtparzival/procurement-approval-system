import { APP_TITLE } from "@/const";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">服務條款</h1>
          <p className="text-sm text-gray-500 mb-8">最後更新日期:2024 年 11 月</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. 服務說明</h2>
              <p className="text-gray-700 leading-relaxed">
                {APP_TITLE} 是一個基於人工智慧技術的採購簽呈生成系統,旨在協助使用者快速生成專業的採購簽呈文件。本服務由系統管理員提供,使用者在使用本服務前,請詳細閱讀並同意本服務條款的所有內容。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 使用者責任</h2>
              <p className="text-gray-700 leading-relaxed mb-3">使用者在使用本服務時,需遵守以下規範:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>不得使用本服務從事任何違法或不當行為</li>
                <li>不得上傳包含惡意程式碼、病毒或其他有害內容的檔案</li>
                <li>不得濫用系統資源或嘗試破壞系統安全</li>
                <li>對於使用本服務生成的內容,使用者需自行負責其準確性與合法性</li>
                <li>使用者應妥善保管帳號資訊,不得與他人共用</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. 智慧財產權</h2>
              <p className="text-gray-700 leading-relaxed">
                本服務的所有內容,包括但不限於軟體、介面設計、文字、圖片、商標等,均受智慧財產權法律保護。使用者透過本服務生成的簽呈內容,其智慧財產權歸使用者所有,但使用者授予本服務為提供服務之必要目的而使用該內容的權利。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 免責聲明</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                本服務按「現狀」提供,我們不對以下事項提供任何明示或暗示的保證:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>服務的準確性、完整性或可靠性</li>
                <li>AI 生成內容的正確性或適用性</li>
                <li>服務不會中斷或無錯誤</li>
                <li>使用本服務所獲得的結果符合使用者的期望</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                使用者理解並同意,使用本服務所產生的任何風險由使用者自行承擔。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 服務變更與終止</h2>
              <p className="text-gray-700 leading-relaxed">
                我們保留隨時修改、暫停或終止本服務的權利,恕不另行通知。我們也保留隨時修改本服務條款的權利,修改後的條款將在本頁面公布。使用者繼續使用本服務即表示同意修改後的服務條款。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. 資料保存與刪除</h2>
              <p className="text-gray-700 leading-relaxed">
                我們會盡力保護使用者的資料安全,但不保證資料不會遺失或損毀。使用者應自行備份重要資料。當使用者終止使用本服務時,我們可能會刪除使用者的帳號及相關資料。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 適用法律與管轄權</h2>
              <p className="text-gray-700 leading-relaxed">
                本服務條款的解釋與適用,以及與本服務條款相關的爭議,均應依照中華民國法律處理。如發生爭議,雙方同意以台灣台北地方法院為第一審管轄法院。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. 聯絡方式</h2>
              <p className="text-gray-700 leading-relaxed">
                如您對本服務條款有任何疑問或建議,請透過系統內的聯絡功能與我們聯繫。
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
