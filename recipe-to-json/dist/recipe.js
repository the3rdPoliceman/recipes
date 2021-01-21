"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeThing = void 0;
var RecipeThing;
(function (RecipeThing) {
    var PluginError = require('plugin-error');
    var PLUGIN_NAME = 'recipe-to-json';
    // constants used for parsing recipes
    var TITLE_PREFIX = "TITLE:";
    var CATEGORY_PREFIX = "CAT:";
    var SERVING_PREFIX = "SERVE:";
    var INGREDIENT_SUB_LIST_PREFIX = "**";
    var INGREDIENT_PREFIX = "*";
    var OPTIONAL_INGREDIENT_PREFIX = "O*";
    var METHOD_SUB_LIST_PREFIX = "--";
    var METHOD_STEP_PREFIX = "-";
    var SERVING_SUGGESTION_PREFIX = "SS:";
    var VARIATION_PREFIX = "VAR:";
    var DIMENSION_PREFIX = "D:";
    var SOURCE_PREFIX = "SRC:";
    var NOTE_PREFIX = "N:";
    var IngredientListItemType;
    (function (IngredientListItemType) {
        IngredientListItemType["INGREDIENT"] = "INGREDIENT";
        IngredientListItemType["INGREDIENT_SUB_LIST"] = "INGREDIENT_SUB_LIST";
        IngredientListItemType["NOTE"] = "NOTE";
    })(IngredientListItemType = RecipeThing.IngredientListItemType || (RecipeThing.IngredientListItemType = {}));
    var MethodSubListItemType;
    (function (MethodSubListItemType) {
        MethodSubListItemType["METHOD_SUB_LIST"] = "METHOD_SUB_LIST";
        MethodSubListItemType["METHOD_STEP"] = "METHOD_STEP";
    })(MethodSubListItemType = RecipeThing.MethodSubListItemType || (RecipeThing.MethodSubListItemType = {}));
    var IngredientSubList = /** @class */ (function () {
        function IngredientSubList() {
            this.name = '';
            this.ingredient_list = [];
            this.type = IngredientListItemType.INGREDIENT_SUB_LIST;
        }
        return IngredientSubList;
    }());
    RecipeThing.IngredientSubList = IngredientSubList;
    var Ingredient = /** @class */ (function () {
        function Ingredient(text) {
            this.optional = false;
            this.type = IngredientListItemType.INGREDIENT;
            this.text = text;
        }
        return Ingredient;
    }());
    RecipeThing.Ingredient = Ingredient;
    var AlternativeIngredient = /** @class */ (function () {
        function AlternativeIngredient(text) {
            this.text = text;
        }
        return AlternativeIngredient;
    }());
    RecipeThing.AlternativeIngredient = AlternativeIngredient;
    var RecipeLink = /** @class */ (function () {
        function RecipeLink() {
        }
        return RecipeLink;
    }());
    RecipeThing.RecipeLink = RecipeLink;
    var Quantity = /** @class */ (function () {
        function Quantity() {
        }
        return Quantity;
    }());
    RecipeThing.Quantity = Quantity;
    var Dimension = /** @class */ (function () {
        function Dimension() {
        }
        return Dimension;
    }());
    RecipeThing.Dimension = Dimension;
    var Source = /** @class */ (function () {
        function Source() {
        }
        return Source;
    }());
    RecipeThing.Source = Source;
    var Recipe = /** @class */ (function () {
        function Recipe() {
            this.ingredient_list = [];
            this.method = [];
        }
        return Recipe;
    }());
    RecipeThing.Recipe = Recipe;
    var MethodStep = /** @class */ (function () {
        function MethodStep(text) {
            this.type = MethodSubListItemType.METHOD_STEP;
            this.text = text;
        }
        return MethodStep;
    }());
    RecipeThing.MethodStep = MethodStep;
    var MethodSubList = /** @class */ (function () {
        function MethodSubList(text) {
            this.type = MethodSubListItemType.METHOD_SUB_LIST;
            this.text = text;
        }
        return MethodSubList;
    }());
    RecipeThing.MethodSubList = MethodSubList;
    var ServingSuggestion = /** @class */ (function () {
        function ServingSuggestion(text) {
            this.text = text;
        }
        return ServingSuggestion;
    }());
    RecipeThing.ServingSuggestion = ServingSuggestion;
    var Variation = /** @class */ (function () {
        function Variation(text) {
            this.text = text;
        }
        return Variation;
    }());
    RecipeThing.Variation = Variation;
    var Note = /** @class */ (function () {
        function Note(text) {
            this.text = text;
        }
        return Note;
    }());
    RecipeThing.Note = Note;
    var IngredientNote = /** @class */ (function (_super) {
        __extends(IngredientNote, _super);
        function IngredientNote(text) {
            var _this = _super.call(this, text) || this;
            _this.type = IngredientListItemType.NOTE;
            return _this;
        }
        return IngredientNote;
    }(Note));
    RecipeThing.IngredientNote = IngredientNote;
    function parseTitle(line, recipe) {
        line = line.substring(TITLE_PREFIX.length).trim();
        recipe.title = line;
    }
    RecipeThing.parseTitle = parseTitle;
    function parseCategory(line, recipe) {
        // doing nothing with this for now
    }
    RecipeThing.parseCategory = parseCategory;
    function parseServing(line, recipe) {
        line = line.substring(SERVING_PREFIX.length).trim();
        if (recipe.quantity === undefined) {
            recipe.quantity = new Quantity();
        }
        recipe.quantity.number = line.trim();
    }
    RecipeThing.parseServing = parseServing;
    function parseIngredientSubList(line, recipe) {
        var subListName = line.substring(INGREDIENT_SUB_LIST_PREFIX.length).trim();
        var ingredientSubList = new IngredientSubList();
        ingredientSubList.name = subListName;
        recipe.ingredient_list.push(ingredientSubList);
    }
    RecipeThing.parseIngredientSubList = parseIngredientSubList;
    var ExtractionResult = /** @class */ (function () {
        function ExtractionResult() {
            this.extractedStrings = [];
        }
        return ExtractionResult;
    }());
    function extractAll(source, regex, trim) {
        var extractionResult = new ExtractionResult();
        var result = source;
        var match;
        while ((match = regex.exec(result)) !== null) {
            result = result.substr(0, match.index) + result.substring(match.index + match[0].length);
            if (trim) {
                extractionResult.extractedStrings.push(match[1].trim());
            }
            else {
                extractionResult.extractedStrings.push(match[1]);
            }
        }
        extractionResult.postExtractionString = result;
        return extractionResult;
    }
    function replaceAll(source, regex, prefix, suffix) {
        var result = source;
        var match;
        while ((match = regex.exec(result)) !== null) {
            result = result.substr(0, match.index) + prefix + match[1].trim() + suffix + result.substring(match.index + match[0].length);
        }
        return result;
    }
    function replaceQuantities(source) {
        return replaceAll(source, /\{\{Q:([^}]*)\}\}/, '<span class="quantity">', '</span>');
    }
    function parseIngredientText(ingredientAsString) {
        ingredientAsString = replaceQuantities(ingredientAsString);
        var ingredient = new Ingredient(ingredientAsString);
        var noteRegExp = /\{\{N:([^}]*)\}\}/;
        var noteExtractionResult = extractAll(ingredientAsString, noteRegExp, true);
        ingredientAsString = noteExtractionResult.postExtractionString;
        noteExtractionResult.extractedStrings.forEach(function (value) {
            ingredient.note = new Note(value);
        });
        var alternativeIngredientRegExp = /\{\{ALT:([^}]*)\}\}/;
        var alternativeIngredientExtractionResult = extractAll(ingredientAsString, alternativeIngredientRegExp, true);
        var alternativeIngredients = [];
        ingredientAsString = alternativeIngredientExtractionResult.postExtractionString;
        alternativeIngredientExtractionResult.extractedStrings.forEach(function (value) {
            alternativeIngredients.push(new AlternativeIngredient(value));
        });
        ingredient.alternative_ingredients = alternativeIngredients;
        ingredient.text = ingredientAsString.trim();
        return ingredient;
    }
    RecipeThing.parseIngredientText = parseIngredientText;
    function parseIngredient(line, recipe) {
        var ingredientAsString = line.substring(INGREDIENT_PREFIX.length).trim();
        var ingredient = parseIngredientText(ingredientAsString);
        putIngredientInRecipe(recipe, ingredient);
    }
    RecipeThing.parseIngredient = parseIngredient;
    function parseOptionalIngredient(line, recipe) {
        var ingredientAsString = line.substring(OPTIONAL_INGREDIENT_PREFIX.length).trim();
        var ingredient = parseIngredientText(ingredientAsString);
        ingredient.optional = true;
        putIngredientInRecipe(recipe, ingredient);
    }
    RecipeThing.parseOptionalIngredient = parseOptionalIngredient;
    function putIngredientInRecipe(recipe, ingredient) {
        if (recipe.ingredient_list.length === 0) {
            recipe.ingredient_list.push(ingredient);
        }
        else {
            var lastIngredientListItem = recipe.ingredient_list[recipe.ingredient_list.length - 1];
            if (lastIngredientListItem instanceof Ingredient) {
                recipe.ingredient_list.push(ingredient);
            }
            else if (lastIngredientListItem instanceof IngredientSubList) {
                lastIngredientListItem.ingredient_list.push(ingredient);
            }
            else {
                throw new PluginError(PLUGIN_NAME, "Not sure what to do with this ingredient");
            }
        }
    }
    RecipeThing.putIngredientInRecipe = putIngredientInRecipe;
    function parseMethodSubList(line, recipe) {
        var subListName = line.substring(METHOD_SUB_LIST_PREFIX.length).trim();
        var methodSubList = new MethodSubList(subListName);
        recipe.method.push(methodSubList);
    }
    RecipeThing.parseMethodSubList = parseMethodSubList;
    function returnString(line) {
        return "line:" + line;
    }
    RecipeThing.returnString = returnString;
    function parseMethodStep2(methodAsString) {
        methodAsString = replaceQuantities(methodAsString);
        return new MethodStep(methodAsString);
    }
    RecipeThing.parseMethodStep2 = parseMethodStep2;
    function parseMethodStep(line, recipe) {
        var methodAsString = line.substring(METHOD_STEP_PREFIX.length).trim();
        var methodStep = parseMethodStep2(methodAsString);
        if (recipe.method.length === 0) {
            recipe.method.push(methodStep);
        }
        else {
            var lastMethodStep = recipe.method[recipe.method.length - 1];
            if (lastMethodStep instanceof MethodStep) {
                recipe.method.push(methodStep);
            }
            else if (lastMethodStep instanceof MethodSubList) {
                if (lastMethodStep.method_steps === undefined) {
                    lastMethodStep.method_steps = [];
                }
                lastMethodStep.method_steps.push(methodStep);
            }
            else {
                throw new PluginError(PLUGIN_NAME, "Not sure what to do with this ingredient");
            }
        }
    }
    RecipeThing.parseMethodStep = parseMethodStep;
    function parseServingSuggestion(line, recipe) {
        var servingSuggestionText = line.substring(SERVING_SUGGESTION_PREFIX.length);
        servingSuggestionText = replaceQuantities(servingSuggestionText).trim();
        var servingSuggestion = new ServingSuggestion(servingSuggestionText);
        if (recipe.serving_suggestions === undefined) {
            recipe.serving_suggestions = [];
        }
        recipe.serving_suggestions.push(servingSuggestion);
    }
    RecipeThing.parseServingSuggestion = parseServingSuggestion;
    function parseVariation(line, recipe) {
        var variationText = line.substring(VARIATION_PREFIX.length).trim();
        variationText = replaceQuantities(variationText).trim();
        var variation = new Variation(variationText);
        if (recipe.variations === undefined) {
            recipe.variations = [];
        }
        recipe.variations.push(variation);
    }
    RecipeThing.parseVariation = parseVariation;
    function parseSource(line, recipe) {
        line = line.substring(SOURCE_PREFIX.length).trim();
        var hrefRegExp = /\{\{HREF:([^}]*)\}\}/;
        var extractionResult = extractAll(line, hrefRegExp, true);
        var source = new Source();
        source.text = extractionResult.postExtractionString.trim();
        if (extractionResult.extractedStrings.length > 0) {
            source.href = extractionResult.extractedStrings[0].trim();
        }
        recipe.source = source;
    }
    RecipeThing.parseSource = parseSource;
    function parseNote(line, recipe) {
        line = line.substring(NOTE_PREFIX.length).trim();
        throw new PluginError(PLUGIN_NAME, "Haven't yet implemented the ability to handle Note");
    }
    RecipeThing.parseNote = parseNote;
    function parseDimension(line, recipe) {
        line = line.substring(DIMENSION_PREFIX.length).trim();
        throw new PluginError(PLUGIN_NAME, "Haven't yet implemented the ability to handle Dimension");
    }
    RecipeThing.parseDimension = parseDimension;
    function parseIntoRecipe(lines) {
        var recipe = new Recipe();
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.length == 0) {
                // ignore blank lines
            }
            else if (line.toUpperCase().startsWith(TITLE_PREFIX)) {
                parseTitle(line, recipe);
            }
            else if (line.toUpperCase().startsWith(CATEGORY_PREFIX)) {
                parseCategory(line, recipe);
            }
            else if (line.toUpperCase().startsWith(SERVING_PREFIX)) {
                parseServing(line, recipe);
            }
            else if (line.toUpperCase().startsWith(INGREDIENT_SUB_LIST_PREFIX)) {
                parseIngredientSubList(line, recipe);
            }
            else if (line.toUpperCase().startsWith(INGREDIENT_PREFIX)) {
                parseIngredient(line, recipe);
            }
            else if (line.toUpperCase().startsWith(OPTIONAL_INGREDIENT_PREFIX)) {
                parseOptionalIngredient(line, recipe);
            }
            else if (line.toUpperCase().startsWith(METHOD_SUB_LIST_PREFIX)) {
                parseMethodSubList(line, recipe);
            }
            else if (line.toUpperCase().startsWith(METHOD_STEP_PREFIX)) {
                parseMethodStep(line, recipe);
            }
            else if (line.toUpperCase().startsWith(SERVING_SUGGESTION_PREFIX)) {
                parseServingSuggestion(line, recipe);
            }
            else if (line.toUpperCase().startsWith(VARIATION_PREFIX)) {
                parseVariation(line, recipe);
            }
            else if (line.toUpperCase().startsWith(NOTE_PREFIX)) {
                parseNote(line, recipe);
            }
            else if (line.toUpperCase().startsWith(DIMENSION_PREFIX)) {
                parseDimension(line, recipe);
            }
            else if (line.toUpperCase().startsWith(SOURCE_PREFIX)) {
                parseSource(line, recipe);
            }
        }
        return recipe;
    }
    RecipeThing.parseIntoRecipe = parseIntoRecipe;
})(RecipeThing = exports.RecipeThing || (exports.RecipeThing = {}));
//# sourceMappingURL=recipe.js.map