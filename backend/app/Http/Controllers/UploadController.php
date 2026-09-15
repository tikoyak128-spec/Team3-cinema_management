<?php

namespace App\Http\Controllers;

use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinary
    ) {}

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,gif,webp,svg'],
        ]);

        $url = $this->cloudinary->uploadImage($request->file('file'));

        return response()->json([
            'url' => $url,
        ]);
    }

    public function uploadVideo(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400', 'mimes:mp4,mov,avi,wmv,flv,mkv,webm'],
        ]);

        $url = $this->cloudinary->uploadVideo($request->file('file'));

        return response()->json([
            'url' => $url,
        ]);
    }

    public function uploadFile(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400'],
        ]);

        $url = $this->cloudinary->uploadFile($request->file('file'));

        return response()->json([
            'url' => $url,
        ]);
    }
}
