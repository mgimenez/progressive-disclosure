<?php

header('Content-type: application/json');

$rand = rand();

echo json_encode(array(
    "HTML" => "<p id=\"".$rand."\">Content ".$_REQUEST['text']."</p>",
    "JS" => "console.log(document.getElementById('".$rand."').innerHTML)",
    "CSS" => "#".$rand."{color:red}"
));

?>