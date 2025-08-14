<?php

/*
 * This file is part of jwt-auth.
 *
 * (c) Sean Tymon <tymon148@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

return [
    'ttl' => env('JWT_TTL', null),
    'refresh_ttl' => env('JWT_REFRESH_TTL', null),
    'required_claims' => [
        'iss',
        'iat',
        'nbf',
        'sub',
        'jti',
    ],
];