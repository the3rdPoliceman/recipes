if($("#servings").length != 0) {
	// Store original values
	$('#servings').attr('data-original-value', $('#servings').val());
	$( ".ingredient" ).each(function( i, element) {
		$(element).attr('data-original-value', $(element).text());
	});	
	$( ".quantity" ).each(function( i, element) {
		$(element).attr('data-original-value', $(element).text());
	});	



	$('#servings').change(function(){
		var originalServings = $('#servings').attr('data-original-value');
		
		if ($('#servings').val() == ""){
			// set original values
			$('#servings').val(originalServings);
		}
		
		var newServings = getAsNumber($('#servings').val());
		var ratio = newServings/originalServings;

		$(".ingredient").each(function( index, element) {
			$(element).addClass('servings-not-adjusted');

			// standard "number then measure" order 
			var regexMatch = $(element).attr('data-original-value').match(/^([0-9\-/.]+)( ?)(bunch|can|cans|colander|colanders|cup|cups|dash|g|gram|gramm|gramms|grams|grind|grinds|gs|juice|kg|kgs|Kg|Kgs|kilo|kilogram|kilograms|kilos|liter|liters|litre|litres|ml|mls|pinch|pinches|shaving|shavings|slice|slices|sprig|sprigs|tablespoon|tablespoons|tbsp|tbsps|teaspoon|teaspoons|thumb|thumbs|tin|tins|tsp|tsps|zest of)?( ?)(.*)$/i);
			if (regexMatch != null){
				//construct scaled ingredient text
				var newQuantity = applyRatioToQuantity(regexMatch[1],ratio);
				var newText = '' + newQuantity + regexMatch[2] + (regexMatch[3] == undefined ? '' : regexMatch[3]) + regexMatch[4] + regexMatch[5];
				$(element).text(newText);
				$(element).removeClass('servings-not-adjusted');
				toggleAdjustedClass(element, ratio);
			}
			else{
				//"measure then number" order 
				var regexMatch = $(element).attr('data-original-value').match(/^(bunch|can|cans|colander|colanders|cup|cups|dash|g|gram|gramm|gramms|grams|grind|grinds|gs|juice|kg|kgs|Kg|Kgs|kilo|kilogram|kilograms|kilos|liter|liters|litre|litres|ml|mls|pinch|pinches|shaving|shavings|slice|slices|sprig|sprigs|tablespoon|tablespoons|tbsp|tbsps|teaspoon|teaspoons|thumb|thumbs|tin|tins|tsp|tsps|zest of)( ?)([0-9\-/.]+)( ?)(.*)$/i);
				if (regexMatch != null){
					//construct scaled ingredient text
					var newQuantity = applyRatioToQuantity(regexMatch[3], ratio);
					var newText = regexMatch[1] + regexMatch[2] + newQuantity + regexMatch[4] + regexMatch[5];
					$(element).text(newText);
					$(element).removeClass('servings-not-adjusted');
					toggleAdjustedClass(element, ratio);
				}
			}

		});

		$(".quantity").each(function( index, element) {
			var newQuantity = applyRatioToQuantity($(element).attr('data-original-value'), ratio);
			$(element).text(newQuantity);
			toggleAdjustedClass(element, ratio);
		});
		
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

	if (fractionMatch != null){
		var decimalValue = Number(fractionMatch[1])/Number(fractionMatch[2]);
		
		return formatQuantity(decimalValue * ratio);
	}

	// in case of range
	var rangeMatch = input.match(/^(\d+)( *)-( *)(\d+)$/);
	if (rangeMatch != null){
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

	if (fractionMatch != null){
		var decimalValue = Number(fractionMatch[1])/Number(fractionMatch[2]);
		
		return decimalValue;
	}

	return Number(value);
}
