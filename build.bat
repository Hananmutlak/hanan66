@echo off
echo [بدء تثبيت الحزم...]
npm install
if %errorlevel% neq 0 (
    echo فشل تثبيت الحزم!
    exit /b %errorlevel%
)

echo [بدء بناء المشروع...]
npm run build
if %errorlevel% neq 0 (
    echo فشل بناء المشروع!
    exit /b %errorlevel%
)

echo اكتملت العملية بنجاح!
pause