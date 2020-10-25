$(".log-entry").each(function(index, element){
	$(element).find(".log-header").attr("data-toggle", "collapse");
	$(element).find(".log-header").attr("role", "button");
	$(element).find(".log-header").attr("href", "#collapseExample" + index);

	$(element).find(".log-detail").addClass("collapse");
	$(element).find(".log-detail").attr("id", "collapseExample" + index);
});