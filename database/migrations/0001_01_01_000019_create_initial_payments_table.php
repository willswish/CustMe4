    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    class CreateInitialPaymentsTable extends Migration
    {
        public function up(): void
        {
            Schema::create('initial_payments', function (Blueprint $table) {
                $table->id('initial_payment_id');
                $table->unsignedBigInteger('post_id')->nullable();
                $table->foreign('post_id')->references('post_id')->on('posts')->onDelete('cascade');
                $table->unsignedBigInteger('user_id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->decimal('amount', 10, 2); // Amount paid (20%)
                $table->enum('status', ['initiated', 'completed', 'failed'])->default('initiated'); // Payment status
                $table->string('transaction_id')->nullable(); // Transaction ID from payment provider
                $table->string('payment_method')->nullable(); // Payment method used
                $table->timestamps();
            });
        }

        public function down(): void
        {
            Schema::dropIfExists('initial_payments');
        }
    }
