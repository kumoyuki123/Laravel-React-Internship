@echo off
echo Setting up Laravel API Backend...
echo.

echo Installing Composer dependencies...
composer install
echo.

echo Generating application key...
php artisan key:generate
echo.

echo Running migrations and seeders...
php artisan migrate:fresh --seed
echo.

echo Setup complete! You can now start the server with:
echo php artisan serve
echo.
pause
