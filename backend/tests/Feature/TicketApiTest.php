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
            'category_id' => $category->id,
            'title' => 'Avengers',
            'description' => 'desc',
            'duration' => 120,
            'release_date' => '2026-01-01',
            'poster_url' => 'https://example.com/p.jpg',
            'trailer_url' => 'https://example.com/t.mp4',
        ]);
        $room = Room::create([
            'cinema_id' => $cinema->id,
            'name' => 'Room 1',
            'total_seats' => 3,
        ]);
        $seat = Seat::create([
            'room_id' => $room->id,
            'seat_number' => 'A1',
            'seat_type' => 'regular',
        ]);
        $showtime = Showtime::create([
            'movie_id' => $movie->id,
            'room_id' => $room->id,
            'start_time' => '2026-09-05 19:00:00',
            'end_time' => '2026-09-05 21:00:00',
            'price' => 5,
        ]);
        $booking = Booking::create([
            'user_id' => $user->id,
            'showtime_id' => $showtime->id,
            'total_amount' => 5,
            'status' => 'confirmed',
        ]);
        BookingSeat::create([
            'booking_id' => $booking->id,
            'seat_id' => $seat->id,
            'ticket_code' => 'TKT-ABC123',
            'status' => 'valid',
        ]);
        $ticket = Ticket::create([
            'booking_id' => $booking->id,
            'ticket_code' => 'TKT-ABC123',
            'price' => 5,
            'seat_number' => 'A1',
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
}
