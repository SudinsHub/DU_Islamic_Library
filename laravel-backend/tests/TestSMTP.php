<?php

function testSMTPConnection($host, $port, $timeout = 10) {
    echo "Testing connection to {$host}:{$port}...\n";
    
    $startTime = microtime(true);
    $errno = 0;
    $errstr = '';
    
    // Try to connect
    $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
    
    $endTime = microtime(true);
    $duration = round($endTime - $startTime, 2);
    
    if ($socket) {
        echo "✓ SUCCESS! Connected to {$host}:{$port} in {$duration} seconds\n";
        
        // Try to read server response
        $response = fgets($socket, 512);
        echo "Server response: " . trim($response) . "\n";
        
        fclose($socket);
        return true;
    } else {
        echo "✗ FAILED! Could not connect to {$host}:{$port}\n";
        echo "Error #{$errno}: {$errstr}\n";
        echo "Time elapsed: {$duration} seconds (timeout: {$timeout}s)\n";
        return false;
    }
    
    echo "\n";
}

// Test different configurations
echo "=== SMTP Connection Tests ===\n\n";

testSMTPConnection('mail.dudc.org', 587);
echo "\n";

testSMTPConnection('mail.dudc.org', 465);
echo "\n";

testSMTPConnection('mail.dudc.org', 25);
echo "\n";

// Also test if DNS resolves
echo "=== DNS Resolution Test ===\n";
$ip = gethostbyname('mail.dudc.org');
if ($ip === 'mail.dudc.org') {
    echo "✗ FAILED! Could not resolve mail.dudc.org\n";
} else {
    echo "✓ SUCCESS! mail.dudc.org resolves to: {$ip}\n";
    
    // Test direct IP connection
    echo "\n=== Testing Direct IP Connection ===\n";
    testSMTPConnection($ip, 587);
}

echo "\n=== Additional Info ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "OpenSSL: " . (extension_loaded('openssl') ? 'Enabled' : 'Disabled') . "\n";
echo "Socket support: " . (function_exists('fsockopen') ? 'Enabled' : 'Disabled') . "\n";