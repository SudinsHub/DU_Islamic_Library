<?php
echo "Testing localhost:25...\n";
$socket = @fsockopen('localhost', 25, $errno, $errstr, 5);
if ($socket) {
    echo "✓ localhost:25 is open!\n";
    echo fgets($socket, 512);
    fclose($socket);
} else {
    echo "✗ localhost:25 blocked: $errno - $errstr\n";
}

echo "\nTesting localhost:587...\n";
$socket = @fsockopen('localhost', 587, $errno, $errstr, 5);
if ($socket) {
    echo "✓ localhost:587 is open!\n";
    echo fgets($socket, 512);
    fclose($socket);
} else {
    echo "✗ localhost:587 blocked: $errno - $errstr\n";
}