<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StandardizeCurrencyColumns extends Migration
{
    private array $columns = [
        ['table' => 'Banks', 'column' => 'currency', 'nullable' => true, 'previous' => 'varchar(50)'],
        ['table' => 'Budgets', 'column' => 'currency', 'nullable' => false, 'previous' => 'varchar(100)'],
        ['table' => 'Finances', 'column' => 'currency', 'nullable' => false, 'previous' => 'varchar(100)'],
        ['table' => 'HoursCost', 'column' => 'currencyClient', 'nullable' => false, 'previous' => 'varchar(100)'],
        ['table' => 'HoursCost', 'column' => 'currencyUser', 'nullable' => false, 'previous' => 'varchar(100)'],
        ['table' => 'PaymentRequest', 'column' => 'currency', 'nullable' => false, 'previous' => 'varchar(10)'],
        ['table' => 'Sales', 'column' => 'currency', 'nullable' => true, 'previous' => 'varchar(100)'],
        ['table' => 'Tracks', 'column' => 'currency', 'nullable' => true, 'previous' => 'varchar(10)'],
        ['table' => 'WeeklyHours', 'column' => 'currency', 'nullable' => true, 'previous' => 'varchar(200)'],
    ];

    public function up()
    {
        $sqlMode = $this->relaxSqlMode();

        try {
            foreach ($this->columns as $definition) {
                if (!Schema::hasColumn($definition['table'], $definition['column'])) {
                    continue;
                }

                $table = $definition['table'];
                $column = $definition['column'];
                $fallback = $definition['nullable'] ? 'NULL' : "'USD'";

                DB::statement("UPDATE `$table` SET `$column` = TRIM(REPLACE(REPLACE(`$column`, CHAR(13), ''), CHAR(10), '')) WHERE `$column` IS NOT NULL");
                DB::statement("UPDATE `$table` SET `$column` = CASE WHEN `$column` = '$' THEN 'UYU' WHEN `$column` = 'R$' THEN 'BRL' WHEN `$column` IN ('USD', 'UYU', 'BRL', 'USDT') THEN `$column` ELSE $fallback END");

                $null = $definition['nullable'] ? 'NULL' : 'NOT NULL';
                DB::statement("ALTER TABLE `$table` MODIFY `$column` ENUM('USD', 'UYU', 'BRL', 'USDT') $null");
            }
        } finally {
            $this->restoreSqlMode($sqlMode);
        }
    }

    public function down()
    {
        $sqlMode = $this->relaxSqlMode();

        try {
            foreach ($this->columns as $definition) {
                if (!Schema::hasColumn($definition['table'], $definition['column'])) {
                    continue;
                }

                $null = $definition['nullable'] ? 'NULL' : 'NOT NULL';
                DB::statement("ALTER TABLE `{$definition['table']}` MODIFY `{$definition['column']}` {$definition['previous']} $null");
            }
        } finally {
            $this->restoreSqlMode($sqlMode);
        }
    }

    private function relaxSqlMode(): string
    {
        $current = DB::selectOne('SELECT @@SESSION.sql_mode AS sql_mode')->sql_mode ?? '';
        $disabled = ['STRICT_TRANS_TABLES', 'NO_ZERO_DATE', 'NO_ZERO_IN_DATE'];
        $modes = array_filter(explode(',', $current), fn ($mode) => !in_array($mode, $disabled, true));
        DB::statement("SET SESSION sql_mode = '" . implode(',', $modes) . "'");

        return $current;
    }

    private function restoreSqlMode(string $sqlMode): void
    {
        DB::statement("SET SESSION sql_mode = '" . str_replace("'", "''", $sqlMode) . "'");
    }
}
