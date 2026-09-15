<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    public function uploadImage(UploadedFile $file, string $folder = 'cinema/images'): ?string
    {
        $result = Cloudinary::uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'transformation' => [
                'quality' => 'auto',
                'fetch_format' => 'auto',
            ],
        ]);

        return $result['secure_url'] ?? null;
    }

    public function uploadVideo(UploadedFile $file, string $folder = 'cinema/videos'): ?string
    {
        $result = Cloudinary::uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => 'video',
        ]);

        return $result['secure_url'] ?? null;
    }

    public function uploadFile(UploadedFile $file, string $folder = 'cinema/misc'): ?string
    {
        $mimeType = $file->getMimeType();

        if (str_starts_with($mimeType, 'image/')) {
            return $this->uploadImage($file, $folder);
        }

        if (str_starts_with($mimeType, 'video/')) {
            return $this->uploadVideo($file, $folder);
        }

        $result = Cloudinary::uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => 'auto',
        ]);

        return $result['secure_url'] ?? null;
    }

    public function destroyFromUrl(string $url, string $resourceType = 'image'): bool
    {
        $publicId = $this->extractPublicId($url);

        if (! $publicId) {
            return false;
        }

        Cloudinary::uploadApi()->destroy($publicId, [
            'resource_type' => $resourceType,
        ]);

        return true;
    }

    public function extractPublicId(string $url): ?string
    {
        $parts = parse_url($url);

        if (! isset($parts['path'])) {
            return null;
        }

        $path = ltrim($parts['path'], '/');

        $segments = explode('/', $path);

        $last = array_pop($segments);

        if (! $last) {
            return null;
        }

        $last = pathinfo($last, PATHINFO_FILENAME);

        return implode('/', $segments).'/'.$last;
    }
}
