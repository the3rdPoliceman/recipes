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
exports.parseMethodStep = exports.returnString = exports.parseMethodSubList = exports.Recipe = void 0;
// through2 is a thin wrapper around node transform streams
var through = require('through2');
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
var VARIATION_PREFIX = "V:";
var DIMENSION_PREFIX = "D:";
var NOTE_PREFIX = "N:";
var IngredientListItemType;
(function (IngredientListItemType) {
    IngredientListItemType["INGREDIENT"] = "INGREDIENT";
    IngredientListItemType["INGREDIENT_SUB_LIST"] = "INGREDIENT_SUB_LIST";
    IngredientListItemType["NOTE"] = "NOTE";
})(IngredientListItemType || (IngredientListItemType = {}));
var MethodSubListItemType;
(function (MethodSubListItemType) {
    MethodSubListItemType["METHOD_SUB_LIST"] = "METHOD_SUB_LIST";
    MethodSubListItemType["METHOD_STEP"] = "METHOD_STEP";
})(MethodSubListItemType || (MethodSubListItemType = {}));
var IngredientSubList = /** @class */ (function () {
    function IngredientSubList() {
        this.name = '';
        this.ingredient_list = [];
        this.type = IngredientListItemType.INGREDIENT_SUB_LIST;
    }
    return IngredientSubList;
}());
var Ingredient = /** @class */ (function () {
    function Ingredient(text) {
        this.optional = false;
        this.type = IngredientListItemType.INGREDIENT;
        this.text = text;
    }
    return Ingredient;
}());
var AlternativeIngredient = /** @class */ (function () {
    function AlternativeIngredient(text) {
        this.text = text;
    }
    return AlternativeIngredient;
}());
var RecipeLink = /** @class */ (function () {
    function RecipeLink() {
    }
    return RecipeLink;
}());
var Quantity = /** @class */ (function () {
    function Quantity() {
    }
    return Quantity;
}());
var Dimension = /** @class */ (function () {
    function Dimension() {
    }
    return Dimension;
}());
var Source = /** @class */ (function () {
    function Source() {
    }
    return Source;
}());
var Recipe = /** @class */ (function () {
    function Recipe() {
        this.ingredient_list = [];
        this.method = [];
    }
    return Recipe;
}());
exports.Recipe = Recipe;
var MethodStep = /** @class */ (function () {
    function MethodStep(text) {
        this.type = MethodSubListItemType.METHOD_STEP;
        this.text = text;
    }
    return MethodStep;
}());
var MethodSubList = /** @class */ (function () {
    function MethodSubList(text) {
        this.type = MethodSubListItemType.METHOD_SUB_LIST;
        this.text = text;
    }
    return MethodSubList;
}());
var ServingSuggestion = /** @class */ (function () {
    function ServingSuggestion(text) {
        this.text = text;
    }
    return ServingSuggestion;
}());
var Variation = /** @class */ (function () {
    function Variation(text) {
        this.text = text;
    }
    return Variation;
}());
var Note = /** @class */ (function () {
    function Note(text) {
        this.text = text;
    }
    return Note;
}());
var IngredientNote = /** @class */ (function (_super) {
    __extends(IngredientNote, _super);
    function IngredientNote(text) {
        var _this = _super.call(this, text) || this;
        _this.type = IngredientListItemType.NOTE;
        return _this;
    }
    return IngredientNote;
}(Note));
function parseTitle(line, recipe) {
    line = line.substring(TITLE_PREFIX.length);
    recipe.title = line;
}
function parseCategory(line, recipe) {
    // doing nothing with this for now
}
function parseServing(line, recipe) {
    line = line.substring(SERVING_PREFIX.length);
    if (recipe.quantity === undefined) {
        recipe.quantity = new Quantity();
    }
    recipe.quantity.number = line.trim();
}
function parseIngredientSubList(line, recipe) {
    var subListName = line.substring(INGREDIENT_SUB_LIST_PREFIX.length).trim();
    var ingredientSubList = new IngredientSubList();
    ingredientSubList.name = subListName;
    recipe.ingredient_list.push(ingredientSubList);
}
function parseIngredientText(ingredientAsString) {
    // extract any notes
    var note;
    // extract any alternative ingredients
    var alternativeIngredients = [];
    var ingredient = new Ingredient(ingredientAsString);
    ingredient.alternative_ingredients = alternativeIngredients;
    //ingredient.note = note;
    return ingredient;
}
function parseIngredient(line, recipe) {
    var ingredientAsString = line.substring(INGREDIENT_PREFIX.length).trim();
    var ingredient = parseIngredientText(ingredientAsString);
    putIngredientInRecipe(recipe, ingredient);
}
function parseOptionalIngredient(line, recipe) {
    var ingredientAsString = line.substring(OPTIONAL_INGREDIENT_PREFIX.length);
    var ingredient = parseIngredientText(ingredientAsString);
    ingredient.optional = true;
    putIngredientInRecipe(recipe, ingredient);
}
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
function parseMethodSubList(line, recipe) {
    var subListName = line.substring(METHOD_SUB_LIST_PREFIX.length).trim();
    var methodSubList = new MethodSubList(subListName);
    recipe.method.push(methodSubList);
}
exports.parseMethodSubList = parseMethodSubList;
function returnString(line) {
    return "line:" + line;
}
exports.returnString = returnString;
function parseMethodStep2(methodAsString) {
    var methodStep = new MethodStep(methodAsString);
    return methodStep;
}
function parseMethodStep(line, recipe) {
    var methodAsString = line.substring(METHOD_STEP_PREFIX.length);
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
exports.parseMethodStep = parseMethodStep;
function parseServingSuggestion(line, recipe) {
    var servingSuggestionText = line.substring(SERVING_SUGGESTION_PREFIX.length).trim();
    var servingSuggestion = new ServingSuggestion(servingSuggestionText);
    if (recipe.serving_suggestions === undefined) {
        recipe.serving_suggestions = [];
    }
    recipe.serving_suggestions.push(servingSuggestion);
}
function parseVariation(line, recipe) {
    var variationText = line.substring(VARIATION_PREFIX.length).trim();
    var variation = new Variation(variationText);
    if (recipe.variations === undefined) {
        recipe.variations = [];
    }
    recipe.variations.push(variation);
}
function parseNote(line, recipe) {
    line = line.substring(NOTE_PREFIX.length);
    throw new PluginError(PLUGIN_NAME, "Haven't yet implemented the ability to handle Note");
}
function parseDimension(line, recipe) {
    line = line.substring(DIMENSION_PREFIX.length);
    throw new PluginError(PLUGIN_NAME, "Haven't yet implemented the ability to handle Dimension");
}
/*
Sample recipe

TITLE:Spinach Shakshukaaaaa
CAT:Vegetarian
SERVE:2
*1 Onion
*Olive Oil
*2 cloves garlic
*1tsp mustard seeds
*2tsp cumin seeds
*0.25tsp chilli powder
*400g Spinach N:frozen is fine
*2tsp coriander powder
*4 eggs
O*50g feta cheese
-Fry onion in some olive oil until golden brown
-Add mustard seeds and fry until they start popping
-Add the cumin seeds and chilli powder and fry for another 30 seconds
-Add the spinach, fry until wilted and cooked through and taste for salt
                                                                    -Add the ground coriander and mix in well
-Make q{4} holes in the spinach, and crack an egg into each hole. If using feta, scatter it over the top at this point.
-Cover with a lid and cook until the eggs are done to your liking
ss:needs nothing else!
    v:instead of the spices and feta, add some ham and scatter cubes of fontinaon top when you add the eggs*/
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
    }
    return recipe;
}
function splitIntoLines(fileContent) {
    var lines = fileContent.split(/\r?\n/);
    return lines;
}
// Plugin level function(dealing with files)
function recipeJSONizer() {
    // Creating a stream through which each file will pass
    return through.obj(function (file, encoding, callback) {
        if (file === null) {
            // return empty file
            return callback(null, file);
        }
        console.log("Processing file object. Type is " + typeof (file));
        if (file.isBuffer()) {
            var fileAsString = String(file.contents);
            console.log(fileAsString);
            var lines = splitIntoLines(fileAsString);
            var recipe = parseIntoRecipe(lines);
            var recipeAsJonString = JSON.stringify(recipe, undefined, 2);
            console.log("Converted to JSON");
            console.log(recipeAsJonString);
            file.contents = new Buffer(recipeAsJonString);
            file.path = file.path.replace(".recipe", ".json");
        }
        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, "I'm afraid you haven't implemented a stream solution yet, Dave");
        }
        callback(null, file);
    });
}
// Exporting the plugin main function
module.exports = recipeJSONizer;
//# sourceMappingURL=index.js.map