<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeatSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = DB::table('rooms')->select('id', 'name', 'total_seats')->get();

        foreach ($rooms as $room) {
            $totalSeats = $room->total_seats;
            $colsPerRow = $totalSeats <= 50 ? 8 : 10;
            $totalRows = (int) ceil($totalSeats / $colsPerRow);

            $rowLabels = range('A', chr(ord('A') + $totalRows - 1));

            $vipStart = max(1, $totalRows - 2);
            $coupleStart = max(1, $totalRows - 1);

            $seatCount = 0;

            foreach ($rowLabels as $rowIndex => $rowLabel) {
                for ($col = 1; $col <= $colsPerRow; $col++) {
                    if ($seatCount >= $totalSeats) {
                        break 2;
                    }

                    $seatNumber = $rowLabel . $col;
                    $seatType = 'regular';

                    if ($rowIndex >= $vipStart && $rowIndex < $coupleStart) {
                        $seatType = 'vip';
                    }

                    if ($rowIndex >= $coupleStart) {
                        if ($col % 2 === 0 && $col > 1) {
                            $seatType = 'couple';
                        } else {
                            $seatType = 'vip';
                        }
                    }

                    DB::table('seats')->updateOrInsert(
                        ['room_id' => $room->id, 'seat_number' => $seatNumber],
                        ['seat_type' => $seatType, 'created_at' => now(), 'updated_at' => now()]
                    );

                    $seatCount++;
                }
            }
        }
    }
}
