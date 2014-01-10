<?php echo '
<label for="shippingCost">Costo de envío</label>
<select id="shippingCost" name="shippingCost">
	<option value="-1">Seleccione</option>
	<option value="1">$ 10.00</option>
	<option value="2">$ 20.00</option>
	<option value="3">$ 30.00</option>
	<option value="add" selected="true">Agregar</option>
</select>

<script>
    var shippingCost = new ProgressiveDisclosure({
        element: document.getElementById("shippingCost"),
        content: "<input/>",
        event: "change"
    })
</script>
'

?>