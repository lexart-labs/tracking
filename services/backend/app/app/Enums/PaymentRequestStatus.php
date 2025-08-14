<?php

namespace App\Enums;

enum PaymentRequestStatus: string
{
    case Pending = 'Pending';
    case Approved = 'Approved';
    case Rejected = 'Rejected';
    case Canceled = 'Canceled';
}
