<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AddUsdtToCurrencyColumns extends Migration
{
    private array $columns = [
        ['table' => 'Banks', 'column' => 'currency', 'nullable' => true],
        ['table' => 'Budgets', 'column' => 'currency', 'nullable' => false],
        ['table' => 'Finances', 'column' => 'currency', 'nullable' => false],
        ['table' => 'HoursCost', 'column' => 'currencyClient', 'nullable' => false],
        ['table' => 'HoursCost', 'column' => 'currencyUser', 'nullable' => false],
        ['table' => 'PaymentRequest', 'column' => 'currency', 'nullable' => false],
        ['table' => 'Sales', 'column' => 'currency', 'nullable' => true],
        ['table' => 'Tracks', 'column' => 'currency', 'nullable' => true],
        ['table' => 'WeeklyHours', 'column' => 'currency', 'nullable' => true],
    ];

    public function up()
    {
        $this->alterCurrencyColumns("ENUM('USD', 'UYU', 'BRL', 'USDT')");
    }

    public function down()
    {
        foreach ($this->columns as $definition) {
            if (!Schema::hasColumn($definition['table'], $definition['column'])) {
                continue;
            }

            DB::statement("UPDATE `{$definition['table']}` SET `{$definition['column']}` = 'USD' WHERE `{$definition['column']}` = 'USDT'");
        }

        $this->alterCurrencyColumns("ENUM('USD', 'UYU', 'BRL')");
    }

    private function alterCurrencyColumns(string $type): void
    {
        $sqlMode = $this->relaxSqlMode();

        try {
            foreach ($this->columns as $definition) {
                if (!Schema::hasColumn($definition['table'], $definition['column'])) {
                    continue;
                }

                $null = $definition['nullable'] ? 'NULL' : 'NOT NULL';
                DB::statement("ALTER TABLE `{$definition['table']}` MODIFY `{$definition['column']}` $type $null");
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
