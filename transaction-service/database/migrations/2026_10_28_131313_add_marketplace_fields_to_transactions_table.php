<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('seller_id')
                ->nullable()
                ->index();

            $table->string('fulfillment_method')
                ->nullable();

            $table->string('payment_method')
                ->nullable();

            $table->string('payment_status')
                ->default('unpaid');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['seller_id']);
            $table->dropColumn([
                'seller_id',
                'fulfillment_method',
                'payment_method',
                'payment_status',
            ]);
        });
    }
};