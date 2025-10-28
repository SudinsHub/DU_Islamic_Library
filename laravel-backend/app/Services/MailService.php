<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MailService
{
    public function sendMail($to, $subject, $view, $data = [])
    {
        try {
            Mail::send($view, $data, function ($message) use ($to, $subject) {
                $message->to($to)
                        ->subject($subject);
            });
            return true;
        } catch (\Exception $e) {
            Log::error('Mail sending failed: ' . $e->getMessage());
            return false;
        }
    }
}
