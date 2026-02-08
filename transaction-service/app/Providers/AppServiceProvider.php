<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Deteksi jika diakses via Gateway Nginx
        if (isset($_SERVER['HTTP_X_FORWARDED_PREFIX'])) {
            URL::forceRootUrl(config('app.url'));
        }
    }
}