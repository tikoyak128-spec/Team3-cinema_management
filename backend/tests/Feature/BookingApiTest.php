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

class BookingApiTest extends TestCase
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
        $seats = collect(range(1, 3))->map(fn ($n) => Seat::create([
            'cinema_room_id' => $room->id,
            'seat_number' => "A$n",
            'seat_type' => 'regular',
        ]));
        $showtime = Showtime::create([
            'movie_id' => $movie->id,
            'cinema_room_id' => $room->id,
            'start_time' => '2026-09-05 19:00:00',
            'end_time' => '2026-09-05 21:00:00',
            'price' => 5,
        ]);

        return compact('user', 'showtime', 'seats');
    }

    public function test_store_creates_booking_booking_seats_and_tickets(): void
    {
        $world = $this->seedWorld();

        $response = $this->postJson('/api/bookings', [
            'user_id' => $world['user']->id,
            'showtime_id' => $world['showtime']->id,
            'seat_ids' => $world['seats']->pluck('id')->all(),
        ]);

        $response->assertStatus(201);

        $booking = Booking::first();
        $this->assertNotNull($booking);
        $this->assertEquals(15.0, (float) $booking->total_amount);

        $this->assertCount(3, BookingSeat::all());
        $this->assertCount(3, Ticket::all());

        $this->assertEquals('Cine 1', $response->json('showtime.room.cinema.name'));
    }

    public function test_store_rejects_already_booked_seats(): void
    {
        $world = $this->seedWorld();
        $taken = $world['seats']->first();

        $this->postJson('/api/bookings', [
            'user_id' => $world['user']->id,
            'showtime_id' => $world['showtime']->id,
            'seat_ids' => $world['seats']->pluck('id')->all(),
        ])->assertStatus(201);

        $response = $this->postJson('/api/bookings', [
            'user_id' => $world['user']->id,
            'showtime_id' => $world['showtime']->id,
            'seat_ids' => [$taken->id],
        ]);

        $response->assertStatus(422);
        $this->assertCount(1, Booking::all());
    }

    public function test_store_rejects_seats_from_another_room(): void
    {
        $world = $this->seedWorld();
        $cinema2 = Cinema::create(['name' => 'Cine 2', 'location' => 'Mall']);
        $room2 = Room::create(['cinema_id' => $cinema2->id, 'name' => 'Room X', 'capacity' => 1]);
        $foreignSeat = Seat::create(['cinema_room_id' => $room2->id, 'seat_number' => 'Z1', 'seat_type' => 'regular']);

        $response = $this->postJson('/api/bookings', [
            'user_id' => $world['user']->id,
            'showtime_id' => $world['showtime']->id,
            'seat_ids' => [$world['seats']->first()->id, $foreignSeat->id],
        ]);

        $response->assertStatus(422);
        $this->assertCount(0, Booking::all());
    }

    public function test_index_and_show_return_related_data(): void
    {
        $world = $this->seedWorld();
        $this->postJson('/api/bookings', [
            'user_id' => $world['user']->id,
            'showtime_id' => $world['showtime']->id,
            'seat_ids' => $world['seats']->pluck('id')->all(),
        ])->assertStatus(201);

        $bookingId = Booking::first()->id;

        $this->getJson('/api/bookings')->assertOk()->assertJsonCount(1);
        $this->getJson("/api/bookings/$bookingId")
            ->assertOk()
            ->assertJsonPath('id', $bookingId)
            ->assertJsonCount(3, 'booking_seats');
    }
}
