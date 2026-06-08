<?php
try {
    $redis = new Redis();
    $redis->connect('127.0.0.1', 6379, 2.0); // 2 second timeout
    echo "Success: Redis connected";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
