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
     *
     * A transaction is only considered paid once Bakong returns a successful
     * responseCode AND actually includes transaction data. Unpaid lookups may
     * return responseCode 0 with an empty data payload, so we must not treat
     * those as paid.
     */
    public function isPaid(array $response): bool
    {
        if (! isset($response['responseCode']) || (int) $response['responseCode'] !== 0) {
            return false;
        }

        $data = $response['data'] ?? null;

        if (empty($data)) {
            return false;
        }

        if (isset($data['paymentStatus'])) {
            return in_array(
                strtoupper((string) $data['paymentStatus']),
                ['SUCCESSFUL', 'SUCCESS', 'PAID', 'COMPLETED'],
                true
            );
        }

        return true;
    }

    /**
     * Determine if the response is a business "transaction not found" state.
     *
     * Bakong returns responseCode 1 / errorCode 1 when no transaction matches
     * the given md5 yet. This is a normal transient state (payment not indexed
     * yet, not paid, or paid against a different QR) — the caller should keep
     * checking rather than treating it as a fatal error.
     */
    public function isNotFound(array $response): bool
    {
        return (int) ($response['responseCode'] ?? -1) === 1;
    }

    /**
     * Determine if the response indicates an API-level error (e.g. rate limit,
     * invalid token, network failure) rather than a business "not paid yet" or
     * "transaction not found" result.
     */
    public function hasError(array $response): bool
    {
        return (int) ($response['responseCode'] ?? -1) === -1;
    }

    /**
     * Whether the paid amount returned by Bakong matches the expected total.
     */
    public function amountMatches(array $response, float $expected): bool
    {
        $amount = $response['data']['amount'] ?? null;

        if ($amount === null) {
            return false;
        }

        return abs((float) $amount - $expected) < 0.01;
    }
}
