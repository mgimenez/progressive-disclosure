<?php

if ($_REQUEST['type'] === 'html') {
	header('Content-type: text/html');
	echo '<p>Response in text/html ' . $_REQUEST['text'] . '</p>';
} else if ($_REQUEST['type'] === 'json') {
	header('Content-type: application/json');
	echo array(
		"HTML" => "<h1>Heading</h1>", 
		"JS" => "console.log(document.getElementsByTagName('h1')[0].innerHTML)", 
		"CSS" => "h1{color:red}"
	);
} else if ($_REQUEST['type'] === 'error') {
	echo array(
		"foo" => "Error message"
	);
}

?>