<?php

declare(strict_types=1);

namespace App\Services\Security;

/**
 * Secretbox helper for sealing small secrets (SMTP passwords) at rest.
 *
 * The encryption key is derived from the WordPress AUTH_KEY deployment
 * secret and is NEVER stored in the database. A database dump alone is
 * therefore useless to an attacker: the key lives outside the data.
 *
 * No new key files, no vault, no stored key material are invented here by
 * design. See 02-spec/21-app/ui-ux-improvement-for-wp-exam/07-security-hardening-spec.md
 * ("For future AI") for the full rationale.
 */
class Secretbox
{
    private const KEY_CONTEXT = 'wp-exam-smtp-v1';

    /**
     * Seal a plaintext secret into a base64 blob (nonce + ciphertext).
     *
     * @param string $plaintext The secret to seal.
     * @return string Base64-encoded sealed blob.
     * @throws \RuntimeException When salts or libsodium are unavailable (fail closed).
     */
    public static function seal(string $plaintext): string
    {
        $key = self::deriveKey();
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $ciphertext = sodium_crypto_secretbox($plaintext, $nonce, $key);

        sodium_memzero($key);

        return base64_encode($nonce . $ciphertext);
    }

    /**
     * Open a sealed blob back into plaintext.
     *
     * @param string $sealed Base64 blob produced by seal().
     * @return string|false The plaintext, or false when the blob is invalid.
     * @throws \RuntimeException When salts or libsodium are unavailable (fail closed).
     */
    public static function open(string $sealed): string|false
    {
        $key = self::deriveKey();
        $raw = base64_decode($sealed, true);

        $isDecodable = ($raw !== false);

        if (!$isDecodable) {
            sodium_memzero($key);

            return false;
        }

        $nonceLength = SODIUM_CRYPTO_SECRETBOX_NONCEBYTES;
        $isLongEnough = (strlen($raw) > $nonceLength);

        if (!$isLongEnough) {
            sodium_memzero($key);

            return false;
        }

        $nonce = substr($raw, 0, $nonceLength);
        $ciphertext = substr($raw, $nonceLength);
        $plaintext = sodium_crypto_secretbox_open($ciphertext, $nonce, $key);

        sodium_memzero($key);

        return $plaintext;
    }

    /**
     * Detect whether a stored value is a sealed secretbox blob.
     *
     * Used for opportunistic migration: legacy plaintext values are sealed
     * in place on the next save instead of by a bulk migration script.
     *
     * @param string $stored The stored value.
     * @return bool True when the value parses as a sealed blob.
     */
    public static function isSealed(string $stored): bool
    {
        $raw = base64_decode($stored, true);

        $isDecodable = ($raw !== false);

        if (!$isDecodable) {
            return false;
        }

        $hasNonceAndCiphertext = (strlen($raw) > SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

        return $hasNonceAndCiphertext;
    }

    /**
     * Derive the secretbox key from the WordPress AUTH_KEY deployment secret.
     *
     * @return string 32-byte secretbox key.
     * @throws \RuntimeException When AUTH_KEY is missing/empty or libsodium is unavailable.
     */
    private static function deriveKey(): string
    {
        $hasSodium = function_exists('sodium_crypto_secretbox');

        if (!$hasSodium) {
            throw new \RuntimeException('libsodium is not available; cannot seal secrets.');
        }

        $hasSalt = (defined('AUTH_KEY') && !empty(AUTH_KEY));

        if (!$hasSalt) {
            throw new \RuntimeException('WordPress AUTH_KEY is not configured; refusing to seal secrets with no key.');
        }

        return sodium_crypto_generichash(self::KEY_CONTEXT, AUTH_KEY);
    }
}
