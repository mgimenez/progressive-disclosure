<?php

header('Content-type: application/json');

if ($_REQUEST['delay']) {
    sleep($_REQUEST['delay']);
} else {
    sleep(1);
}

$rand = rand();

if (!$_REQUEST['cep']) {
    echo json_encode(array(
        "HTML" => "<p id=\"".$rand."\">Content ".$_REQUEST['text']."</p>",
        "JS" => "/*console.log('>>>>> ' + document.getElementById('".$rand."').innerHTML);*/document.getElementById('".$rand."').addEventListener('click',function(){alert('pepe')})",
        "CSS" => "#".$rand."{color:red}"
    ));
} else {
    echo json_encode(array(
        "HTML" => "<div data-js='mierda2'><a href='#' data-js='back'>Back</a> <p>djsajdjsa</p></div>",
        "JS" => "
(function (cho, doc) {
    'use strict';

    var mierda2 = doc.querySelector('[data-js=mierda2]');

    // cho.bind(doc.querySelector('[data-js=back]'), 'click', function (event) {
    doc.querySelector('[data-js=back]').addEventListener('click', function (event) {
        event.preventDefault();
        // Hide the entire form
        mierda2.setAttribute('aria-hidden', 'true');
        // Show the Zip Code input again
        // cho.mierda.setAttribute('aria-hidden', 'false');
        mierda.setAttribute('aria-hidden', 'false');
    });

}(this.cho, this.document));
",
        "CSS" => ""
    ));
}

?>