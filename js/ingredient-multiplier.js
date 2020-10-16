// setup adjustment for standard recipes with simple servings unit
if($("#servings").length != 0) {
	// Store original values
	$('#servings').attr('data-original-value', $('#servings').val());
	storeOriginalIngredientAndQuantitiyValues();

	$('#servings').change(function(){
		var originalServings = $('#servings').attr('data-original-value');
		
		if ($('#servings').val() == ""){
			// set original values
			$('#servings').val(originalServings);
		}
		
		var newServings = getAsNumber($('#servings').val());
		var ratio = newServings/originalServings;

		updateIngredients(ratio);
		updateQuantities(ratio);
	});
}

// setup adjustment for cake recipes with number of cakes and cake size
if($("#cake-round-number").length != 0 && $("#cake-round-diameter").length != 0) {
	// Store original values
	$('#cake-round-number').attr('data-original-value', $('#cake-round-number').val());
	$('#cake-round-diameter').attr('data-original-value', $('#cake-round-diameter').val());
	storeOriginalIngredientAndQuantitiyValues();

	$('#cake-round-number').change(function(){
		updateRoundCake();
	});

	$('#cake-round-diameter').change(function(){
		updateRoundCake();
	});
}

// setup adjustment for cake recipes with number of cakes and cake size
if($("#cake-rectangle-number").length != 0 && $("#cake-rectangle-length").length != 0 && $("#cake-rectangle-width").length != 0) {
	// Store original values
	$('#cake-rectangle-number').attr('data-original-value', $('#cake-rectangle-number').val());
	$('#cake-rectangle-length').attr('data-original-value', $('#cake-rectangle-length').val());
	$('#cake-rectangle-width').attr('data-original-value', $('#cake-rectangle-width').val());
	storeOriginalIngredientAndQuantitiyValues();

	$('#cake-rectangle-number').change(function(){
		updateRectangleCake();
	});

	$('#cake-rectangle-length').change(function(){
		updateRectangleCake();
	});

	$('#cake-rectangle-width').change(function(){
		updateRectangleCake();
	});
}

function storeOriginalIngredientAndQuantitiyValues(){
	$( ".ingredient" ).each(function( i, element) {
		if ($(element).contents()[0].nodeType == 3){
			text = $(element).contents()[0].textContent;
			$(element).attr('data-original-value', text);
		}
	});	
	$( ".quantity" ).each(function( i, element) {
		if ($(element).contents()[0].nodeType == 3){
			text = $(element).contents()[0].textContent;
			$(element).attr('data-original-value', text);
		}
	});	
}

function updateRoundCake(){
	var ratio = 0;
	if ($('#cake-round-number').val() == "" || $('#cake-round-diameter').val() == ""){
		// set original values
		ratio = 0;
	}
	else{
		var originalNumberOfCakes = $('#cake-round-number').attr('data-original-value');
		var originalDiameterOfCakes = $('#cake-round-diameter').attr('data-original-value');
		
		var newNumberOfCakes = getAsNumber($('#cake-round-number').val());
		var newDiameterOfCakes = getAsNumber($('#cake-round-diameter').val());

		var cakeNumberRatio = newNumberOfCakes/originalNumberOfCakes;
		var cakeAreaRatio = (newDiameterOfCakes**2)/(originalDiameterOfCakes**2);

		ratio = cakeNumberRatio * cakeAreaRatio;
	}
	
	updateIngredients(ratio);
	updateQuantities(ratio);
}

function updateRectangleCake(){
	var ratio = 0;
	if ($('#cake-rectangle-number').val() == "" || $('#cake-rectangle-length').val() == "" || $('#cake-rectangle-width').val() == ""){
		// set original values
		ratio = 0;
	}
	else{
		var originalNumberOfCakes = $('#cake-rectangle-number').attr('data-original-value');
		var originalLengthOfCakes = $('#cake-rectangle-length').attr('data-original-value');
		var originalWidthOfCakes = $('#cake-rectangle-width').attr('data-original-value');
		
		var newNumberOfCakes = getAsNumber($('#cake-rectangle-number').val());
		var newLengthOfCakes = getAsNumber($('#cake-rectangle-length').val());
		var newWidthOfCakes = getAsNumber($('#cake-rectangle-width').val());

		var cakeNumberRatio = newNumberOfCakes/originalNumberOfCakes;
		var cakeAreaRatio = (newLengthOfCakes*newWidthOfCakes)/(originalLengthOfCakes*originalWidthOfCakes);

		ratio = cakeNumberRatio * cakeAreaRatio;
	}
	
	updateIngredients(ratio);
	updateQuantities(ratio);
}

function updateIngredients(ratio){
	$(".ingredient").each(function( index, element) {
		$(element).addClass('servings-not-adjusted');
		var contents = $(element).contents();

		// standard "number then measure" order 
		var regexMatch = $(element).attr('data-original-value').match(/^([0-9\-/.]+)( ?)(bunch|can|cans|colander|colanders|cup|cups|dash|g|gram|gramm|gramms|grams|grind|grinds|gs|juice|kg|kgs|Kg|Kgs|kilo|kilogram|kilograms|kilos|liter|liters|litre|litres|ml|mls|pinch|pinches|shaving|shavings|slice|slices|sprig|sprigs|tablespoon|tablespoons|tbsp|tbsps|teaspoon|teaspoons|thumb|thumbs|tin|tins|tsp|tsps|zest of)?( ?)(.*)$/i);
		if (regexMatch != null){
			//construct scaled ingredient text
			var newQuantity = applyRatioToQuantity(regexMatch[1],ratio);
			var newText = '' + newQuantity + regexMatch[2] + (regexMatch[3] == undefined ? '' : regexMatch[3]) + regexMatch[4] + regexMatch[5];
			
			$(element).text(newText);
			if (contents.length > 1){
				for (i = 1; i < contents.length; i++) {
					$(element).append(contents[i]);
				}
			}
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
				if (contents.length > 1){
					for (i = 1; i < contents.length; i++) {
						$(element).append(contents[i]);
					}
				}
				$(element).removeClass('servings-not-adjusted');
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
