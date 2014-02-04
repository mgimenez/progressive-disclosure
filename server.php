<?php

header('Content-type: application/json');

if ($_REQUEST['delay']) {
    sleep($_REQUEST['delay']);
}

$rand = rand();

echo json_encode(array(
    "HTML" => "<p id=\"".$rand."\">Content ".$_REQUEST['text']."</p>",
    "JS" => "console.log('>>>>> ' + document.getElementById('".$rand."').innerHTML)",
    "CSS" => "#".$rand."{color:red}"
));

?>