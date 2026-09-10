<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Konthaina\Khqr\BakongApiClient;
use Konthaina\Khqr\KHQRGenerator;

class BakongService
{
    protected string $baseUrl;

    protected string $token;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.bakong.url'), '/');
        $this->token = (string) config('services.bakong.token');
    }

    /**
     * Generate a dynamic KHQR payment code for the given amount and bill number.
     *
     * @return array{qr: string, md5: string, createdTimestamp: string, expirationTimestamp: string|null}
     *
     * @throws \InvalidArgumentException
     */
    public function generateKhrq(float $amount, string $billNumber): array
    {
        $accountId = (string) config('services.bakong.account_id');

        if (empty($accountId) || str_contains($accountId, 'your_bakong_account')) {
            throw new \RuntimeException('Bakong account ID is not configured. Set BAKONG_ACCOUNT_ID in your .env file.');
        }

        $currency = (string) config('services.bakong.currency');

        $generator = (new KHQRGenerator(KHQRGenerator::MERCHANT_TYPE_INDIVIDUAL))
            ->setBakongAccountId($accountId)
            ->setMerchantName((string) config('services.bakong.merchant_name'))
            ->setMerchantCity((string) config('services.bakong.merchant_city'))
            ->setCurrency($currency)
            ->setAmount($amount)
            ->setBillNumber($billNumber)
            ->setStoreLabel('Khmer Cinema')
            ->setExpirationDuration(600);

        return $generator->generate();
    }

    /**
     * Check the status of a Bakong transaction by md5 hash.
     *
     * Returns: responseCode, responseMessage, and optional data.
     */
    public function checkTransactionByMd5(string $md5): array
    {
        $client = new BakongApiClient($this->baseUrl, $this->token, 30);

        try {
            return $client->checkTransactionByMd5($md5);
        } catch (\Throwable $e) {
            Log::error('Bakong checkTransactionByMd5 failed', [
                'md5' => $md5,
                'error' => $e->getMessage(),
            ]);

            return [
                'responseCode' => -1,
                'responseMessage' => 'Payment check failed: '.$e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Determine if the response represents a successfully paid transaction.
     */
    public function isPaid(array $response): bool
    {
        return isset($response['responseCode']) && (int) $response['responseCode'] === 0;
    }
}
