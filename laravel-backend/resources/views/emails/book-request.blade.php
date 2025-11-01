<!DOCTYPE html>
<html>
<body>
    <h3>Assalamu Alaikum, </h3>
    <h4>Dear Volunteer,</h4>
    <p>A new request has arrived at {{$hall}} Islamic Library</p>
    <p>Book Info:</p>
    <ul>
        <li>Title: {{ $book_name }}</li>
        <li>Author: {{ $book_author }}</li>
    </ul>
    <p>Requester Info:</p>
    <ul>
        <li>Name: {{ $name }}</li>
        <li>Contact: {{ $contact }}</li>
        <li>Email: {{ $email }}</li>
    </ul>
    <p>Please reach out to the requester to coordinate the book collection and update the <a href="{{ config('app.url') }}/user/volunteer">website</a> accordingly.</p>
    <br>
    <p>If it's already on the 'fulfilled' state, please ignore this message.</p>
    <br>
    <p>– Team {{ config('app.name') }}</p>
</body>
</html>
