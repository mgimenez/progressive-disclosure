<?php

header('Content-type: application/json');

sleep($_REQUEST['delay'] || 0.5);

$rand = rand();



if ($_REQUEST['select']) {
    echo json_encode(array(
        "HTML" => '
<select data-js="payment-method3" name="case4c" disclosure disclosure-container="case4bcontainer">
    <option value="1" id="temp4ca" disclosure-url="server.php?text=FORM TC preloaded1" class="pm-preloaded-tc">TC Precargada1</option>
    <option value="2" id="temp4cb" disclosure-url="server.php?text=FORM TC preloaded2" class="pm-preloaded-tc">TC Precargada2</option>
    <option value="3" id="temp4cc" disclosure-url="server.php?text=FORM TC preloaded3" class="pm-preloaded-tc">TC Precargada3</option>
    <option value="4" id="temp4cd" disclosure-url="server.php?text=FORM TC nueva1" class="pm-new-tc">TC nueva1</option>
    <option value="5" id="temp4ce" disclosure-url="server.php?text=FORM TC nueva2" class="pm-new-tc">TC nueva2</option>
    <option value="6" id="temp4cf" disclosure-url="server.php?text=FORM TC nueva3" class="pm-new-tc">TC nueva3</option>
    <option value="7" id="temp4cg" disclosure-url="server.php?text=FORM Otros medios1" class="pm-other">Otros medios1</option>
    <option value="8" id="temp4ch" disclosure-url="server.php?text=FORM Otros medios2" class="pm-other">Otros medios2</option>
    <option value="9" id="temp4ci" disclosure-url="server.php?text=FORM Otros medios3" class="pm-other">Otros medios3</option>
</select>
        ',
        "JS" => "",
        "CSS" => ""
    ));
    return;
}



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
        // Remove the entire form
        mierda2.parentNode.removeChild(mierda2);
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