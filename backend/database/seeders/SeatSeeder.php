<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeatSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = DB::table('cinema_rooms')->get();

        foreach ($rooms as $room) {
            $totalSeats = (int) $room->total_seats;

            if ($totalSeats <= 0) {
                continue;
            }

            $existingSeatIds = DB::table('seats')->where('cinema_room_id', $room->id)->pluck('id');

            // Never destroy historical booking/ticket data: if any seat in this
            // room is referenced by a booking, leave the room untouched.
            $inUse = DB::table('booking_seats')
                ->whereIn('seat_id', $existingSeatIds)
                ->whereHas('booking', function ($q) {
                    $q->whereIn('status', ['pending', 'confirmed']);
                })
                ->exists();

            if ($inUse) {
                continue;
            }

            DB::table('booking_seats')->whereIn('seat_id', $existingSeatIds)->delete();

            DB::table('seats')->where('cinema_room_id', $room->id)->delete();

            $cols = $totalSeats >= 90 ? 10 : 8;
            $fullRows = intdiv($totalSeats, $cols);
            $lastRowCols = $totalSeats % $cols;
            $rows = $lastRowCols > 0 ? $fullRows + 1 : $fullRows;

            $seatNumber = 0;

            for ($i = 0; $i < $rows; $i++) {
                $rowLetter = $this->rowLetter($i);
                $rowCols = $i === $rows - 1 && $lastRowCols > 0 ? $lastRowCols : $cols;
                $isLastRow = $i === $rows - 1;

                for ($col = 1; $col <= $rowCols; $col++) {
                    $seatNumber++;
                    $seatType = 'regular';

                    if ($isLastRow && $col <= 2) {
                        $seatType = 'couple';
                    } elseif ($isLastRow || ($rows > 3 && $i >= $rows - 2)) {
                        $seatType = 'vip';
                    }

                    DB::table('seats')->updateOrInsert(
                        ['cinema_room_id' => $room->id, 'seat_number' => $rowLetter . $col],
                        ['row' => $rowLetter, 'seat_type' => $seatType, 'created_at' => now(), 'updated_at' => now()]
                    );
                }
            }
        }
    }

    private function rowLetter(int $index): string
    {
        return chr(65 + $index);
    }
}