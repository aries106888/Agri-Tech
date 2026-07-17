<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
http_response_code(410);
echo json_encode([
    "error" => "This legacy PHP API has been retired. Please use the Flask backend (/api)."
]);
?>
