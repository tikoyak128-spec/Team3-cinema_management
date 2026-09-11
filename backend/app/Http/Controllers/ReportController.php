<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', '7');
        $now = Carbon::now();

        [$currentStart, $currentEnd, $previousStart, $previousEnd, $trendDays] = $this->getPeriodBounds($period, $now);

        $summary = $this->getSummary($currentStart, $currentEnd, $previousStart, $previousEnd);
        $revenueTrend = $this->getRevenueTrend($currentStart, $currentEnd, $trendDays);
        $occupancyByMonth = $this->getOccupancyByMonth($now);
        $salesSummary = $this->getSalesSummary($currentStart, $currentEnd);
        $notes = $this->getNotes($currentStart, $currentEnd);

        return response()->json([
            'summary' => $summary,
            'revenue_trend' => $revenueTrend,
            'occupancy_by_month' => $occupancyByMonth,
            'sales_summary' => $salesSummary,
            'notes' => $notes,
        ]);
    }

    private function getPeriodBounds(string $period, Carbon $now): array
    {
        $currentEnd = $now->copy()->endOfDay();

        switch ($period) {
            case '30':
                $currentStart = $now->copy()->subDays(30)->startOfDay();
                $previousStart = $now->copy()->subDays(60)->startOfDay();
                $previousEnd = $now->copy()->subDays(31)->endOfDay();
                $trendDays = 30;
                break;
            case 'quarter':
                $currentStart = $now->copy()->subMonths(3)->startOfDay();
                $previousStart = $now->copy()->subMonths(6)->startOfDay();
                $previousEnd = $now->copy()->subMonths(3)->subDay()->endOfDay();
                $trendDays = 30;
                break;
            case 'year':
                $currentStart = $now->copy()->startOfYear()->startOfDay();
                $previousStart = $now->copy()->subYear()->startOfYear()->startOfDay();
                $previousEnd = $now->copy()->subYear()->endOfYear()->endOfDay();
                $trendDays = 12;
                break;
            default:
                $currentStart = $now->copy()->subDays(6)->startOfDay();
                $previousStart = $now->copy()->subDays(13)->startOfDay();
                $previousEnd = $now->copy()->subDays(7)->endOfDay();
                $trendDays = 7;
                break;
        }

        return [$currentStart, $currentEnd, $previousStart, $previousEnd, $trendDays];
    }

    private function getSummary(Carbon $currentStart, Carbon $currentEnd, Carbon $previousStart, Carbon $previousEnd): array
    {
        $curRevenue = Booking::where('status', 'confirmed')
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->sum('total_amount');
        $prevRevenue = Booking::where('status', 'confirmed')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->sum('total_amount');

        $curBookings = Booking::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();
        $prevBookings = Booking::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $curTickets = Ticket::where('status', '!=', 'cancelled')
            ->whereHas('booking', function ($q) use ($currentStart, $currentEnd) {
                $q->whereBetween('created_at', [$currentStart, $currentEnd]);
            })
            ->count();
        $prevTickets = Ticket::where('status', '!=', 'cancelled')
            ->whereHas('booking', function ($q) use ($previousStart, $previousEnd) {
                $q->whereBetween('created_at', [$previousStart, $previousEnd]);
            })
            ->count();

        $curRefunds = Booking::where('status', 'cancelled')
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->sum('total_amount');
        $prevRefunds = Booking::where('status', 'cancelled')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->sum('total_amount');

        return [
            'revenue' => [
                'current' => (float) $curRevenue,
                'previous' => (float) $prevRevenue,
                'pct' => $this->calcPct($curRevenue, $prevRevenue),
            ],
            'bookings' => [
                'current' => $curBookings,
                'previous' => $prevBookings,
                'pct' => $this->calcPct($curBookings, $prevBookings),
            ],
            'tickets' => [
                'current' => $curTickets,
                'previous' => $prevTickets,
                'pct' => $this->calcPct($curTickets, $prevTickets),
            ],
            'refunds' => [
                'current' => (float) $curRefunds,
                'previous' => (float) $prevRefunds,
                'pct' => $this->calcPct($curRefunds, $prevRefunds),
            ],
        ];
    }

    private function getRevenueTrend(Carbon $start, Carbon $end, int $days): array
    {
        if ($days <= 7) {
            $rows = Booking::where('status', 'confirmed')
                ->whereBetween('created_at', [$start, $end])
                ->select(DB::raw("TO_CHAR(created_at, 'Dy') as label"), DB::raw('SUM(total_amount) as value'))
                ->groupBy(DB::raw("TO_CHAR(created_at, 'Dy')"), DB::raw("EXTRACT(DOW FROM created_at)"))
                ->orderBy(DB::raw("EXTRACT(DOW FROM created_at)"))
                ->pluck('value', 'label')
                ->toArray();

            $dayMap = ['Sun' => 'Sun', 'Mon' => 'Mon', 'Tue' => 'Tue', 'Wed' => 'Wed', 'Thu' => 'Thu', 'Fri' => 'Fri', 'Sat' => 'Sat'];
            $labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            $values = [];
            foreach ($labels as $l) {
                $values[] = (float) ($rows[$l] ?? 0);
            }

            return ['labels' => $labels, 'values' => $values];
        }

        if ($days <= 30) {
            $rows = Booking::where('status', 'confirmed')
                ->whereBetween('created_at', [$start, $end])
                ->select(DB::raw("TO_CHAR(created_at, 'Mon DD') as label"), DB::raw('SUM(total_amount) as value'), DB::raw('DATE(created_at) as date'))
                ->groupBy(DB::raw("TO_CHAR(created_at, 'Mon DD')"), DB::raw('DATE(created_at)'))
                ->orderBy(DB::raw('DATE(created_at)'))
                ->pluck('value', 'label')
                ->toArray();

            return ['labels' => array_keys($rows), 'values' => array_values(array_map('floatval', $rows))];
        }

        $rows = Booking::where('status', 'confirmed')
            ->whereBetween('created_at', [$start, $end])
            ->select(DB::raw("TO_CHAR(created_at, 'Mon') as label"), DB::raw('SUM(total_amount) as value'), DB::raw("EXTRACT(MONTH FROM created_at) as month_num"))
            ->groupBy(DB::raw("TO_CHAR(created_at, 'Mon')"), DB::raw("EXTRACT(MONTH FROM created_at)"))
            ->orderBy(DB::raw("EXTRACT(MONTH FROM created_at)"))
            ->pluck('value', 'label')
            ->toArray();

        return ['labels' => array_keys($rows), 'values' => array_values(array_map('floatval', $rows))];
    }

    private function getOccupancyByMonth(Carbon $now): array
    {
        $start = $now->copy()->startOfYear();
        $end = $now->copy()->endOfYear();

        $monthlyCapacity = DB::table('showtimes')
            ->join('rooms', 'rooms.id', '=', 'showtimes.room_id')
            ->whereBetween('showtimes.start_time', [$start, $end])
            ->select(
                DB::raw("TO_CHAR(showtimes.start_time, 'Mon') as month_label"),
                DB::raw("EXTRACT(MONTH FROM showtimes.start_time) as month_num"),
                DB::raw('SUM(rooms.total_seats) as capacity')
            )
            ->groupBy(
                DB::raw("TO_CHAR(showtimes.start_time, 'Mon')"),
                DB::raw("EXTRACT(MONTH FROM showtimes.start_time)")
            )
            ->orderBy(DB::raw("EXTRACT(MONTH FROM showtimes.start_time)"))
            ->get()
            ->keyBy('month_label')
            ->map(fn ($row) => [
                'capacity' => (int) $row->capacity,
                'month_num' => (int) $row->month_num,
                'first_char' => substr((string) $row->month_label, 0, 1),
            ])
            ->toArray();

        $monthlyTicketCounts = DB::table('tickets')
            ->where('tickets.status', '!=', 'cancelled')
            ->join('bookings', 'bookings.id', '=', 'tickets.booking_id')
            ->where('bookings.status', '!=', 'cancelled')
            ->join('showtimes', 'showtimes.id', '=', 'bookings.showtime_id')
            ->whereBetween('showtimes.start_time', [$start, $end])
            ->select(
                DB::raw("TO_CHAR(showtimes.start_time, 'Mon') as month_label"),
                DB::raw("EXTRACT(MONTH FROM showtimes.start_time) as month_num"),
                DB::raw('COUNT(*) as ticket_count')
            )
            ->groupBy(
                DB::raw("TO_CHAR(showtimes.start_time, 'Mon')"),
                DB::raw("EXTRACT(MONTH FROM showtimes.start_time)")
            )
            ->orderBy(DB::raw("EXTRACT(MONTH FROM showtimes.start_time)"))
            ->pluck('ticket_count', 'month_label')
            ->toArray();

        $labels = [];
        $values = [];
        $currentMonth = (int) $now->format('m');
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        foreach ($monthNames as $i => $monthName) {
            $monthNum = $i + 1;
            if ($monthNum > $currentMonth) {
                break;
            }
            $capacity = $monthlyCapacity[$monthName]['capacity'] ?? 0;
            if ($monthNum < $currentMonth && $capacity === 0) {
                continue;
            }
            $ticketCount = (int) ($monthlyTicketCounts[$monthName] ?? 0);
            $pct = $capacity > 0 ? round(($ticketCount / $capacity) * 100) : 0;
            $labels[] = substr($monthName, 0, 1);
            $values[] = $pct;
        }

        return ['labels' => $labels, 'values' => $values];
    }

    private function getSalesSummary(Carbon $start, Carbon $end): array
    {
        $rows = Booking::whereBetween('created_at', [$start, $end])
            ->select(
                DB::raw("DATE(created_at) as date"),
                DB::raw("COUNT(CASE WHEN bookings.status != 'cancelled' THEN 1 END) as bookings_count"),
                DB::raw("SUM(CASE WHEN bookings.status = 'cancelled' THEN total_amount ELSE 0 END) as refunds"),
                DB::raw("SUM(CASE WHEN bookings.status = 'confirmed' THEN total_amount ELSE 0 END) as revenue"),
                DB::raw("MAX(CASE WHEN bookings.status = 'pending' AND DATE(created_at) < CURRENT_DATE THEN 'Open' ELSE NULL END) as has_open")
            )
            ->groupBy(DB::raw("DATE(created_at)"))
            ->orderBy(DB::raw("DATE(created_at)"), 'desc')
            ->get();

        $result = [];

        $ticketCounts = DB::table('tickets')
            ->join('bookings', 'bookings.id', '=', 'tickets.booking_id')
            ->where('tickets.status', '!=', 'cancelled')
            ->whereBetween('bookings.created_at', [$start, $end])
            ->select(DB::raw("DATE(bookings.created_at) as date"), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw("DATE(bookings.created_at)"))
            ->pluck('count', 'date')
            ->toArray();

        foreach ($rows as $row) {
            $date = $row->date instanceof \DateTimeInterface ? $row->date->format('Y-m-d') : $row->date;
            $dateStr = (string) $date;
            $isOpen = Booking::where('status', 'pending')
                ->whereDate('created_at', $dateStr)
                ->exists();
            $status = $isOpen ? 'Open' : 'Closed';

            $result[] = [
                'date' => $dateStr,
                'bookings' => (int) $row->bookings_count,
                'tickets' => (int) ($ticketCounts[$dateStr] ?? 0),
                'revenue' => (float) $row->revenue,
                'refunds' => (float) $row->refunds,
                'status' => $status,
            ];
        }

        return $result;
    }

    private function getNotes(Carbon $start, Carbon $end): array
    {
        $peakBooking = DB::table('bookings')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('bookings.created_at', [$start, $end])
            ->join('showtimes', 'showtimes.id', '=', 'bookings.showtime_id')
            ->select(
                DB::raw("EXTRACT(DOW FROM showtimes.start_time) as dow"),
                DB::raw('SUM(bookings.total_amount) as revenue')
            )
            ->groupBy(DB::raw("EXTRACT(DOW FROM showtimes.start_time)"))
            ->orderByDesc('revenue')
            ->first();

        $totalRevenue = DB::table('bookings')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('bookings.created_at', [$start, $end])
            ->sum('total_amount');

        $peakPct = 0;
        $peakDays = 'Weekend';
        if ($peakBooking && $totalRevenue > 0) {
            $peakPct = round(($peakBooking->revenue / $totalRevenue) * 100);
            $dow = (int) $peakBooking->dow;
            $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            if (in_array($dow, [5, 6, 0])) {
                $peakDays = 'Friday–Sunday';
            } elseif (in_array($dow, [3, 4])) {
                $peakDays = 'Wednesday–Thursday';
            } else {
                $peakDays = $dayNames[$dow] . 's';
            }
        }

        $bestCinema = Booking::where('bookings.status', '!=', 'cancelled')
            ->whereBetween('bookings.created_at', [$start, $end])
            ->join('showtimes', 'showtimes.id', '=', 'bookings.showtime_id')
            ->join('rooms', 'rooms.id', '=', 'showtimes.room_id')
            ->join('cinemas', 'cinemas.id', '=', 'rooms.cinema_id')
            ->join('tickets', 'tickets.booking_id', '=', 'bookings.id')
            ->where('tickets.status', '!=', 'cancelled')
            ->select('cinemas.name', DB::raw('COUNT(tickets.id) as ticket_count'))
            ->groupBy('cinemas.name')
            ->orderByDesc('ticket_count')
            ->first();

        $topMovie = Booking::where('bookings.status', '!=', 'cancelled')
            ->whereBetween('bookings.created_at', [$start, $end])
            ->join('showtimes', 'showtimes.id', '=', 'bookings.showtime_id')
            ->join('movies', 'movies.id', '=', 'showtimes.movie_id')
            ->select('movies.title', DB::raw('SUM(bookings.total_amount) as revenue'))
            ->groupBy('movies.title')
            ->orderByDesc('revenue')
            ->first();

        return [
            'peak_hours' => "{$peakDays} evening shows account for {$peakPct}% of period revenue.",
            'best_performer' => $bestCinema
                ? "{$bestCinema->name} leads ticket sales with {$bestCinema->ticket_count} tickets."
                : "No ticket data available.",
            'top_movie' => $topMovie
                ? "{$topMovie->title} remains the highest grossing title this period."
                : "No booking data available.",
            'refunds_note' => "Refunds are calculated from cancelled bookings.",
        ];
    }

    private function calcPct($current, $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
