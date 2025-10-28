<!DOCTYPE html>
<html>
<body>
    <h3>Hello {{ $name }},</h3>
    <p>You requested a password reset.</p>
    <p>Click the link below to set a new password:</p>
    <a href="{{ $resetLink }}">Reset Password</a>
    <p>If you didn’t request this, please ignore the message.</p>
    <br>
    <p>– The {{ config('app.name') }} Team</p>
</body>
</html>
