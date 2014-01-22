<?php

if ($_REQUEST['type'] === 'foo') {
	header('Content-type: application/json');
	echo json_encode(array(
		"HTML" => "<select name=\"case3\" disclosure><option value=\"1\">One</option><option value=\"2\">Two</option><option value=\"other\" disclosure-container=\"case3container\">Other</option></select><div id=\"case3container\" aria-hidden=\"true\">Add cost</div>",
		"CSS" => "h1{color:red}"
	));

} else {
	header('Content-type: application/json');
	echo json_encode(array(
		"HTML" => "<h1>Heading</h1>", 
		"JS" => "console.log(document.getElementsByTagName('h1')[0].innerHTML)", 
		"CSS" => "h1{color:red}"
	));
}

?>