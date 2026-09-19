<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Category;
use App\Models\Cinema;
use App\Models\Movie;
use App\Models\Room;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketApiTest extends TestCase
{
    use RefreshDatabase;

    private function seedWorld(): array
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);
        $category = Category::create(['name' => 'Action']);
        $cinema = Cinema::create(['name' => 'Cine 1', 'location' => 'Downtown']);
        $movie = Movie::create([
            'movie_category_id' => $category->id,
            'title' => 'Avengers',
            'description' => 'desc',
            'duration' => 120,
            'release_date' => '2026-01-01',
            'poster' => 'https://example.com/p.jpg',
            'trailer_url' => 'https://example.com/t.mp4',
        ]);
        $room = Room::create([
            'cinema_id' => $cinema->id,
            'name' => 'Room 1',
            'capacity' => 3,
        ]);
        $seat = Seat::create([
            'cinema_room_id' => $room->id,
            'seat_number' => 'A1',
            'seat_type' => 'regular',
        ]);
        $showtime = Showtime::create([
            'movie_id' => $movie->id,
            'cinema_room_id' => $room->id,
            'start_time' => '2026-09-05 19:00:00',
            'end_time' => '2026-09-05 21:00:00',
            'price' => 5,
        ]);
        $booking = Booking::create([
            'user_id' => $user->id,
            'showtime_id' => $showtime->id,
            'booking_code' => 'BK-TEST123',
            'total_amount' => 5,
            'status' => 'confirmed',
        ]);
        $bookingSeat = BookingSeat::create([
            'booking_id' => $booking->id,
            'seat_id' => $seat->id,
            'price' => 5,
        ]);
        $ticket = Ticket::create([
            'booking_id' => $booking->id,
            'booking_seat_id' => $bookingSeat->id,
            'ticket_code' => 'TKT-ABC123',
            'status' => 'valid',
        ]);

        return compact('ticket', 'booking');
    }

    public function test_show_returns_ticket_with_booking(): void
    {
        $ticket = $this->seedWorld()['ticket'];

        $this->getJson("/api/tickets/{$ticket->id}")
            ->assertOk()
            ->assertJsonPath('id', $ticket->id)
            ->assertJsonPath('ticket_code', 'TKT-ABC123')
            ->assertJsonPath('booking.showtime.movie.title', 'Avengers');
    }

    public function test_show_returns_404_when_not_found(): void
    {
        $this->getJson('/api/tickets/99999')->assertNotFound();
    }

    public function test_check_in_sets_status_to_checked_in(): void
    {
        $ticket = $this->seedWorld()['ticket'];

        $this->postJson("/api/tickets/{$ticket->id}/check-in")
            ->assertOk()
            ->assertJsonPath('status', 'checked_in');

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'checked_in',
        ]);
    }

    public function test_check_in_twice_rejected(): void
    {
        $ticket = $this->seedWorld()['ticket'];

        $this->postJson("/api/tickets/{$ticket->id}/check-in")->assertOk();
        $this->postJson("/api/tickets/{$ticket->id}/check-in")
            ->assertStatus(422);
    }

    public function test_check_in_returns_404_when_not_found(): void
    {
        $this->postJson('/api/tickets/99999/check-in')->assertNotFound();
    }

    public function test_staff_search_finds_booking_by_ticket_code(): void
    {
        $world = $this->seedWorld();
        $staff = User::create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
        ]);

        Sanctum::actingAs($staff);

        $this->getJson('/api/staff/bookings/search?code=TKT-ABC123')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $world['booking']->id)
            ->assertJsonPath('0.tickets.0.ticket_code', 'TKT-ABC123');
    }

    public function test_staff_search_finds_booking_by_booking_code(): void
    {
        $world = $this->seedWorld();
        $staff = User::create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
        ]);

        Sanctum::actingAs($staff);

        $this->getJson('/api/staff/bookings/search?code=BK-TEST123')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $world['booking']->id);
    }
}
