// setup adjustment for standard recipes with simple servings unit
if($("#servings").length !== 0) {
	disableQuantityAdjustersIfNotAllValid();

	$('.quantity-adjuster').each(function() {
		$(this).attr('data-original-value', $(this).val());
	});

	storeOriginalIngredientAndQuantitiyValues();

	$('.quantity-adjuster').change(function(){
		let allQuantityAdjustersSet = true;
		$('.quantity-adjuster').each(function() {
			if ($(this).val() === ""){
				allQuantityAdjustersSet = false;
			}
		});

		if (allQuantityAdjustersSet){
			// adjust ingredient amounts
			let originalMultiplier = 1;
			let newMultiplier = 1;
			$('.quantity-adjuster').each(function() {
				let numberOfDimensionsAdjusterAppliesTo = 1;

				if (($(this).attr('data-number-of-dimensions')) !== "" && ($(this).attr('data-number-of-dimensions'))!== undefined){
					numberOfDimensionsAdjusterAppliesTo = $(this).attr('data-number-of-dimensions');
				}

				for (var i = 0; i < numberOfDimensionsAdjusterAppliesTo; i++) {
					originalMultiplier = originalMultiplier * ($(this).attr('data-original-value'));
					newMultiplier = newMultiplier * ($(this).val());
				}
			});

			let ratio = newMultiplier/originalMultiplier;

			updateIngredients(ratio);
			updateQuantities(ratio);
		}
		else{
			//restore original ingredient amounts
			updateIngredients(1);
			updateQuantities(1);
		}
		
	});
}

if($("#multiplier").length !== 0) {
	storeOriginalIngredientAndQuantitiyValues();

	$('#multiplier').change(function(){
		let allQuantityAdjustersSet = true;
		if ($('#multiplier').val() !== ""){
			// adjust ingredient amounts
			let ratio = 1 * $('#multiplier').val();

			updateIngredients(ratio);
			updateQuantities(ratio);
		}
		else{
			//restore original ingredient amounts
			updateIngredients(1);
			updateQuantities(1);
		}
		
	});
}

function disableQuantityAdjustersIfNotAllValid(){
	let allValid = true;
	$('.quantity-adjuster').each(function() {
		if ($(this).val() === ""){
			allValid = false;
		}
	});

	if (!allValid){
		$('.quantity-adjuster').each(function() {
			if ($(this).val() === ""){
				$(this).attr("disabled", true);
			}
		});
	}
}

function storeOriginalIngredientAndQuantitiyValues(){
	$( ".ingredient" ).each(function( i, element) {
		if ($(element).contents()[0].nodeType == 3){
			$(element).attr('data-original-value', $(element).contents()[0].textContent);
		}
	});	
	$( ".quantity" ).each(function( i, element) {
		if ($(element).contents()[0].nodeType == 3){
			$(element).attr('data-original-value', $(element).contents()[0].textContent);
		}
	});	
}

function updateIngredients(ratio){
	$(".ingredient").each(function( index, element) {
		var contents = $(element).contents();

		// standard "number then measure" order 
		var regexMatch = $(element).attr('data-original-value').match(/^([0-9\-/.]+)( ?)(bunch|can|cans|colander|colanders|cup|cups|dash|g|gram|gramm|gramms|grams|grind|grinds|gs|juice|kg|kgs|Kg|Kgs|kilo|kilogram|kilograms|kilos|liter|liters|litre|litres|ml|mls|pinch|pinches|shaving|shavings|slice|slices|sprig|sprigs|tablespoon|tablespoons|tbsp|tbsps|teaspoon|teaspoons|thumb|thumbs|tin|tins|tsp|tsps|zest of)?( ?)(.*)$/i);
		if (regexMatch !== null){
			//construct scaled ingredient text
			var newQuantity = applyRatioToQuantity(regexMatch[1],ratio);
			var newText = '' + newQuantity + regexMatch[2] + (regexMatch[3] === undefined ? '' : regexMatch[3]) + regexMatch[4] + regexMatch[5];
			
			$(element).text(newText);
			if (contents.length > 1){
				for (var i = 1; i < contents.length; i++) {
					$(element).append(contents[i]);
				}
			}
			toggleAdjustedClass(element, ratio);
		}
		else{
			//"measure then number" order 
			regexMatch = $(element).attr('data-original-value').match(/^(bunch|can|cans|colander|colanders|cup|cups|dash|g|gram|gramm|gramms|grams|grind|grinds|gs|juice|kg|kgs|Kg|Kgs|kilo|kilogram|kilograms|kilos|liter|liters|litre|litres|ml|mls|pinch|pinches|shaving|shavings|slice|slices|sprig|sprigs|tablespoon|tablespoons|tbsp|tbsps|teaspoon|teaspoons|thumb|thumbs|tin|tins|tsp|tsps|zest of)( ?)([0-9\-/.]+)( ?)(.*)$/i);
			if (regexMatch !== null){
				//construct scaled ingredient text
				var newQuantity = applyRatioToQuantity(regexMatch[3], ratio);
				var newText = regexMatch[1] + regexMatch[2] + newQuantity + regexMatch[4] + regexMatch[5];
				$(element).text(newText);
				if (contents.length > 1){
					for (var i = 1; i < contents.length; i++) {
						$(element).append(contents[i]);
					}
				}
				toggleAdjustedClass(element, ratio);
			}
		}

	});
}

function updateQuantities(ratio){
	$(".quantity").each(function( index, element) {
		var newQuantity = applyRatioToQuantity($(element).attr('data-original-value'), ratio);
		$(element).text(newQuantity);
		toggleAdjustedClass(element, ratio);
	});
}

function toggleAdjustedClass(element, ratio){
	if (ratio == 1){
		$(element).removeClass('adjusted');	
	}
	else{
		$(element).addClass('adjusted');
	}
}

function applyRatioToQuantity(input, ratio){
	// in case of fractions
	var fractionMatch = input.match(/^(\d+)\/(\d+)$/);

	if (fractionMatch !== null){
		var decimalValue = Number(fractionMatch[1])/Number(fractionMatch[2]);
		
		return formatQuantity(decimalValue * ratio);
	}

	// in case of range
	var rangeMatch = input.match(/^(\d+)( *)-( *)(\d+)$/);
	if (rangeMatch !== null){
		var startValue = Number(rangeMatch[1]);
		var endValue = Number(rangeMatch[4]);
		
		return formatQuantity(startValue * ratio) + rangeMatch[2] + '-' + rangeMatch[3] + formatQuantity(endValue * ratio);
	}

	// otherwise assuming a simple number
	return formatQuantity(Number(input) * ratio);
}

function formatQuantity(quantity){
  	return '' + +parseFloat(quantity).toFixed( 2 );
}

function getAsNumber(value){
	var fractionMatch = value.match(/^(\d+)\/(\d+)$/);

	if (fractionMatch !== null){
		var decimalValue = Number(fractionMatch[1])/Number(fractionMatch[2]);
		
		return decimalValue;
	}

	return Number(value);
}
