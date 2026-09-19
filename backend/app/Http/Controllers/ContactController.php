<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['nullable', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:5000'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $user = $request->user();

        $contact = Contact::create([
            'user_id' => $user->id,
            'name' => $user->name ?: ($validated['name'] ?? 'Customer'),
            'email' => $user->email ?: ($validated['email'] ?? ''),
            'subject' => $validated['subject'] ?? 'general',
            'message' => $validated['message'],
            'status' => 'new',
        ]);

        return response()->json($contact, 201);
    }

    public function myMessages(Request $request): JsonResponse
    {
        $contacts = Contact::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($contacts);
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'in:new,read,replied'],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        $query = Contact::with(['user'])->orderByDesc('created_at');

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['search'])) {
            $term = $validated['search'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('subject', 'like', "%{$term}%")
                    ->orWhere('message', 'like', "%{$term}%");
            });
        }

        return response()->json($query->get());
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $contact = Contact::find($id);

        if (! $contact) {
            return response()->json([
                'message' => 'Message not found',
            ], 404);
        }

        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:5000'],
        ]);

        $contact->update([
            'reply' => $validated['reply'],
            'status' => 'replied',
            'replied_at' => now(),
        ]);

        return response()->json($contact->load(['user']));
    }

    public function markRead(int $id): JsonResponse
    {
        $contact = Contact::find($id);

        if (! $contact) {
            return response()->json([
                'message' => 'Message not found',
            ], 404);
        }

        if ($contact->status === 'new') {
            $contact->update(['status' => 'read']);
        }

        return response()->json($contact->load(['user']));
    }
}
