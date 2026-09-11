<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('bookings')->delete();

        $userIds = DB::table('users')->pluck('id')->toArray();

        if (count($userIds) === 0) {
            return;
        }

        $showtimes = DB::table('showtimes')->get(['id', 'room_id', 'price', 'start_time']);
        $now = Carbon::now();

        foreach ($showtimes as $showtime) {
            $seatRows = DB::table('seats')
                ->where('room_id', $showtime->room_id)
                ->get(['id', 'seat_number'])
                ->toArray();

            if (count($seatRows) === 0) {
                continue;
            }

            $seatIds = array_column($seatRows, 'id');
            $seatNumberMap = array_column($seatRows, 'seat_number', 'id');

            shuffle($seatIds);

            $fill = rand(40, 95);
            $sold = (int) round(count($seatIds) * $fill / 100);
            $picked = array_slice($seatIds, 0, $sold);

            $groups = [];
            $i = 0;
            while ($i < count($picked)) {
                $size = min(count($picked) - $i, rand(1, 4));
                $groups[] = array_slice($picked, $i, $size);
                $i += $size;
            }

            foreach ($groups as $groupSeats) {
                $roll = rand(1, 100);
                if ($roll <= 8) {
                    $status = 'cancelled';
                } elseif ($roll <= 16) {
                    $status = 'pending';
                } else {
                    $status = 'confirmed';
                }

                $totalAmount = $showtime->price * count($groupSeats);
                $createdAt = $this->randomCreatedAt(Carbon::parse($showtime->start_time));

                $bookingId = DB::table('bookings')->insertGetId([
                    'user_id' => $userIds[array_rand($userIds)],
                    'showtime_id' => $showtime->id,
                    'total_amount' => $totalAmount,
                    'status' => $status,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                $isCancelled = $status === 'cancelled';
                $isCheckedIn = $status === 'confirmed' && $now->gt(Carbon::parse($showtime->start_time)) && rand(1, 100) <= 75;

                foreach ($groupSeats as $seatId) {
                    $ticketStatus = $isCancelled ? 'cancelled' : ($isCheckedIn ? 'checked_in' : 'valid');
                    $ticketCode = strtoupper(Str::random(8));

                    DB::table('booking_seats')->insert([
                        'booking_id' => $bookingId,
                        'seat_id' => $seatId,
                        'ticket_code' => $ticketCode,
                        'status' => $ticketStatus,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ]);

                    DB::table('tickets')->insert([
                        'booking_id' => $bookingId,
                        'ticket_code' => $ticketCode,
                        'price' => $showtime->price,
                        'seat_number' => $seatNumberMap[$seatId],
                        'status' => $ticketStatus,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ]);
                }
            }
        }
    }

    private function randomCreatedAt(Carbon $showtimeStart): Carbon
    {
        $windowStart = $showtimeStart->copy()->subDays(2)->setTime(8, 0);
        $windowEnd = $showtimeStart->copy();

        $min = $windowStart->timestamp;
        $max = max($windowStart->timestamp, $windowEnd->timestamp - 30 * 60);

        return Carbon::createFromTimestamp(rand($min, $max));
    }
}