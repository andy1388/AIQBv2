數學測驗網站 (Math Quiz Web Platform)
====================================

項目簡介
--------
這是一個面向中學生(F1-F5)的數學在線測驗平台。根據香港數學課程大綱設計,幫助學生進行針對性練習和測試。

功能特點
--------
1. 用戶系統
   - 學生賬戶
   - 教師賬戶
   - 個人學習進度追蹤
   - 成績分析報告

2. 題庫系統
   - 按年級分類 (F1-F5)
   - 按章節分類
   - 按難度分級
   - 多種題型支持

3. 練習模式
   - 隨機練習
   - 專項練習
   - 模擬測試
   - 實時批改
   - 詳細解析

4. 數據分析
   - 個人成績統計
   - 錯題分析
   - 學習進度追蹤
   - 班級/年級排名

技術架構
--------
前端:
- React.js
- Material UI
- MathJax (數學公式渲染)

後端:
- Node.js
- Express
- MongoDB

部署:
- Docker
- AWS/GCP

目錄結構
--------
/Contents          - 課程大綱文件
  ├── F1_Content.txt  - 中一課程
  ├── F2_Content.txt  - 中二課程
  ├── F3_Content.txt  - 中三課程
  ├── F4_Content.txt  - 中四課程
  └── F5_Content.txt  - 中五課程

/frontend         - 前端代碼
/backend          - 後端代碼
/database         - 數據庫設計
/docs             - 文檔

開始使用
--------
1. 克隆項目
2. 安裝依賴
3. 配置數據庫
4. 運行測試
5. 啟動服務

貢獻指南
--------
歡迎提交Pull Request或Issue來幫助改進項目。

許可證
-------
MIT License

聯繫方式
--------
電郵: your.email@example.com
GitHub: https://github.com/your-username/math-quiz-platform 

cd backend
npm run generateIndex

// local host
cd backend
npm install
npm run dev

// deploy
git add .
git commit -m "{commit message}"
git push origin main
