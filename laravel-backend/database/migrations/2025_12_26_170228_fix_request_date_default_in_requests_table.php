<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // Change default to CURRENT_DATE
        DB::statement("
            ALTER TABLE requests
            ALTER COLUMN request_date SET DEFAULT CURRENT_DATE
        ");
    }

    public function down()
    {
        // Optional rollback (restore old fixed date if needed)
        DB::statement("
            ALTER TABLE requests
            ALTER COLUMN request_date DROP DEFAULT
        ");
    }
};

