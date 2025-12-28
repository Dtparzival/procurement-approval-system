# Codex Skill 教學簡報敘事規劃

作者：Darren Tsai

## Audience
- 國泰金控內部導入 Codex 的技術主管、系統分析師、軟體工程師、技術 PM
- 已具備基本 Codex 使用經驗，但尚未系統化理解 Skill 的設計、觸發與治理方式

## Objective
- 讓受眾理解 Skill 是什麼、何時該用、如何寫、如何維運
- 建立「可重用能力」而非單次 Prompt 的平台化思維
- 提供可直接落地的建立流程、治理框架與團隊導入方式

## Narrative Arc
1. 定義問題：為什麼需要 Skill，而不只是一次性 Prompt
2. 建立共識：Skill 的本質、觸發方式與執行流程
3. 教學落地：Skill 檔案結構、撰寫方式、實務範例
4. 組織治理：版本、權限、品質與推廣 SOP
5. 行動收斂：帶走可執行的 checklist 與下一步

## Slide List
1. 封面：Codex Skill 使用與開發教學手冊
2. 為何 Skill 是 AI 平台化的關鍵能力
3. Skill 的定義、邊界與適用情境
4. Skill 觸發與執行流程
5. Skill 檔案結構與核心元資料
6. SKILL.md 應包含的核心章節
7. 何時該建立 Skill、何時只用 Prompt、何時升級成 Plugin
8. 常見內建 Skill 版圖與分工方式
9. PowerPoint Skill 實戰示例
10. Skill 設計最佳實踐與常見反模式
11. Skill 建立、驗證、發布與維運 SOP
12. 團隊導入建議與行動清單

## Source Plan
- 主要設計範本：`/Users/cfh00007215/Downloads/Codex_使用與額度管理手冊.pptx`
- 內容來源：
  - 使用者提供的 AGENTS 指令原則
  - `/Users/cfh00007215/.codex/skills/codex-primary-runtime/slides/SKILL.md`
  - Codex Skills 與 Plugins 的當前使用規則（依本對話上下文整理）
- 不依賴外部網路資料

## Visual System
- 延續範本的企業簡報語言：
  - 淺暖灰底色與大面積留白
  - 深藍、青藍作為主色
  - 橘色作為關鍵 강조色
  - 幾何卡片、細線框、流程箭頭、淡化光暈
- 封面與章節頁偏視覺化；教學頁偏圖解、表格與流程卡片
- 標題風格採高階管理簡報語氣，內容頁維持技術導向與可落地感

## Imagegen Plan
- 每頁準備一張 text-free art direction plate
- 第 1 頁作為整份簡報的視覺系統設定頁
- 其餘頁面依內容選擇：
  - 平台模組化抽象視覺
  - AI 工作流程/節點/路徑隱喻
  - 企業知識資產、模板、治理、維運場景
- 盡量保留大面積 calm zone 以承接可編輯文字與卡片

## Asset Needs
- 12 張 reference plates
- 不需外部照片或品牌 logo
- 以抽象資訊設計、流程節點、企業級 AI 場景為主

## Editability Plan
- 所有標題、副標、重點條列、表格與流程文字皆以可編輯文字物件建立
- 比較表、流程圖、SOP、分工矩陣皆用 shape/table/chart 物件重建
- 不將任何可讀內容烘進背景圖
