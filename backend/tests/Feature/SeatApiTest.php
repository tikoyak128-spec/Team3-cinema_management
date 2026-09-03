<?php

namespace Tests\Feature;

use App\Models\Cinema;
use App\Models\Room;
use App\Models\Seat;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeatApiTest extends TestCase
{
    use RefreshDatabase;

    private function createRoom(): Room
    {
        $cinema = Cinema::create(['name' => 'Cine 1', 'location' => 'Downtown']);

        return Room::create([
            'cinema_id' => $cinema->id,
            'name' => 'Room 1',
            'total_seats' => 2,
        ]);
    }

    public function test_index_lists_seats_with_room(): void
    {
        $room = $this->createRoom();
        Seat::create(['room_id' => $room->id, 'seat_number' => 'A1', 'seat_type' => 'regular']);

        $this->getJson('/api/seats')
            ->assertOk()
            ->assertJsonCount(1);
    }

    public function test_store_creates_seat(): void
    {
        $room = $this->createRoom();

        $this->postJson('/api/seats', [
            'room_id' => $room->id,
            'seat_number' => 'A1',
            'seat_type' => 'vip',
        ])->assertStatus(201)
            ->assertJsonPath('seat_number', 'A1');
    }

    public function test_store_rejects_invalid_seat_type(): void
    {
        $room = $this->createRoom();

        $this->postJson('/api/seats', [
            'room_id' => $room->id,
            'seat_number' => 'A1',
            'seat_type' => 'luxury',
        ])->assertStatus(422);
    }

    public function test_show_returns_single_seat(): void
    {
        $room = $this->createRoom();
        $seat = Seat::create(['room_id' => $room->id, 'seat_number' => 'A1', 'seat_type' => 'regular']);

        $this->getJson("/api/seats/{$seat->id}")
            ->assertOk()
            ->assertJsonPath('seat_number', 'A1')
            ->assertJsonPath('room.name', 'Room 1');
    }

    public function test_update_works(): void
    {
        $room = $this->createRoom();
        $seat = Seat::create(['room_id' => $room->id, 'seat_number' => 'A1', 'seat_type' => 'regular']);

        $this->putJson("/api/seats/{$seat->id}", ['seat_type' => 'couple'])
            ->assertOk()
            ->assertJsonPath('seat_type', 'couple');
    }

    public function test_destroy_deletes_seat(): void
    {
        $room = $this->createRoom();
        $seat = Seat::create(['room_id' => $room->id, 'seat_number' => 'A1', 'seat_type' => 'regular']);

        $this->deleteJson("/api/seats/{$seat->id}")
            ->assertOk();

        $this->assertNull(Seat::find($seat->id));
    }
}
