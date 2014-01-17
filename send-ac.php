<?php
header('Content-type: application/json');
$arr = array(
	"HTML" => "<h1>Heading</h1>", 
	"JS" => "console.log(document.getElementsByTagName('h1')[0].innerHTML)", 
	"CSS" => "h1{color:red}"
);

echo json_encode($arr);
?>