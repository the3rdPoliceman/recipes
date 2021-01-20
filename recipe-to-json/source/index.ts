// through2 is a thin wrapper around node transform streams
const through = require('through2');
const PluginError = require('plugin-error');
const PLUGIN_NAME = 'recipe-to-json';

// constants used for parsing recipes
const TITLE_PREFIX = "TITLE:";
const CATEGORY_PREFIX = "CAT:";
const SERVING_PREFIX = "SERVE:";
const INGREDIENT_SUB_LIST_PREFIX = "**";
const INGREDIENT_PREFIX = "*";
const OPTIONAL_INGREDIENT_PREFIX = "O*";
const METHOD_SUB_LIST_PREFIX = "--";
const METHOD_STEP_PREFIX = "-";
const SERVING_SUGGESTION_PREFIX = "SS:";
const VARIATION_PREFIX = "V:";
const DIMENSION_PREFIX = "D:";
const NOTE_PREFIX = "N:";


enum IngredientListItemType {
    INGREDIENT = "INGREDIENT",
    INGREDIENT_SUB_LIST = "INGREDIENT_SUB_LIST",
    NOTE = "NOTE"
}


enum MethodSubListItemType {
    METHOD_SUB_LIST = "METHOD_SUB_LIST",
    METHOD_STEP = "METHOD_STEP"
}


class IngredientSubList {
    name: string = '';
    ingredient_list: object[] = [];
    type: IngredientListItemType = IngredientListItemType.INGREDIENT_SUB_LIST;

    constructor() {
    }
}


class Ingredient {
    text: string;
    optional: boolean = false;
    alternative_ingredients: AlternativeIngredient[];
    note: Note;
    type: IngredientListItemType = IngredientListItemType.INGREDIENT;

    constructor(text: string) {
        this.text = text;
    }
}


class AlternativeIngredient {
    text: string;

    constructor(text: string) {
        this.text = text;
    }
}


class RecipeLink {
    text: string;
    href: string;

    constructor() {
    }
}


class Quantity {
    number: string;
    dimensions: Dimension[];
    label: string;

    constructor() {
    }
}


class Dimension {
    magnitude: string;
    number_of_dimensions: string;

    constructor() {
    }
}


class Source {
    href: string;
    text: string;

    constructor() {
    }
}


export class Recipe {
    title: string;
    quantity: Quantity;
    source: Source;
    ingredient_list: object[] = [];
    method: object[] = [];
    notes: Note[];
    serving_suggestions: ServingSuggestion[];
    variations: Variation[];

    constructor() {
    }
}


class MethodStep {
    text: string;
    post_notes: Note[];
    pre_notes: Note[];
    type: MethodSubListItemType = MethodSubListItemType.METHOD_STEP;

    constructor(text: string) {
        this.text = text;
    }
}


class MethodSubList {
    text: string;
    method_steps: MethodStep[];
    notes: Note[];
    type: MethodSubListItemType = MethodSubListItemType.METHOD_SUB_LIST;

    constructor(text: string) {
        this.text = text;
    }
}


class ServingSuggestion {
    text: string;

    constructor(text: string) {
        this.text = text;
    }
}


class Variation {
    text: string;

    constructor(text: string) {
        this.text = text;
    }
}

class Note {
    text: string;

    constructor(text: string) {
        this.text = text;

    }
}

class IngredientNote extends Note {
    type: IngredientListItemType = IngredientListItemType.NOTE;

    constructor(text: string) {
        super(text);
    }
}


function parseTitle(line: string, recipe: Recipe) {
    line = line.substring(TITLE_PREFIX.length);

    recipe.title = line;
}

function parseCategory(line: string, recipe: Recipe) {
    // doing nothing with this for now
}

function parseServing(line: string, recipe: Recipe) {
    line = line.substring(SERVING_PREFIX.length);

    if (recipe.quantity === undefined) {
        recipe.quantity = new Quantity();
    }

    recipe.quantity.number = line.trim();
}

function parseIngredientSubList(line: string, recipe: Recipe) {
    let subListName = line.substring(INGREDIENT_SUB_LIST_PREFIX.length).trim();

    let ingredientSubList = new IngredientSubList();
    ingredientSubList.name = subListName;

    recipe.ingredient_list.push(ingredientSubList);
}

function parseIngredientText(ingredientAsString: string): Ingredient {
    // extract any notes
    let note: Note;

    // extract any alternative ingredients
    let alternativeIngredients: AlternativeIngredient[] = [];

    let ingredient = new Ingredient(ingredientAsString);
    ingredient.alternative_ingredients = alternativeIngredients;
    //ingredient.note = note;

    return ingredient;
}

function parseIngredient(line: string, recipe: Recipe) {
    let ingredientAsString = line.substring(INGREDIENT_PREFIX.length).trim();
    let ingredient = parseIngredientText(ingredientAsString);

    putIngredientInRecipe(recipe, ingredient);
}

function parseOptionalIngredient(line: string, recipe: Recipe) {
    let ingredientAsString = line.substring(OPTIONAL_INGREDIENT_PREFIX.length);
    let ingredient = parseIngredientText(ingredientAsString);
    ingredient.optional = true;

    putIngredientInRecipe(recipe, ingredient);
}

function putIngredientInRecipe(recipe: Recipe, ingredient: Ingredient) {
    if (recipe.ingredient_list.length === 0) {
        recipe.ingredient_list.push(ingredient);
    } else {
        let lastIngredientListItem = recipe.ingredient_list[recipe.ingredient_list.length - 1];

        if (lastIngredientListItem instanceof Ingredient) {
            recipe.ingredient_list.push(ingredient);
        } else if (lastIngredientListItem instanceof IngredientSubList) {
            lastIngredientListItem.ingredient_list.push(ingredient);
        } else {
            throw new PluginError(PLUGIN_NAME, "Not sure what to do with this ingredient");
        }
    }
}

export function parseMethodSubList(line: string, recipe: Recipe) {
    let subListName = line.substring(METHOD_SUB_LIST_PREFIX.length).trim();
    let methodSubList = new MethodSubList(subListName);

    recipe.method.push(methodSubList);
}

export function returnString(line: string): string {
    return `line:${line}`;
}


function parseMethodStep2(methodAsString: string): MethodStep {
    let methodStep = new MethodStep(methodAsString);

    return methodStep;
}

export function parseMethodStep(line: string, recipe: Recipe) {
    let methodAsString = line.substring(METHOD_STEP_PREFIX.length);
    let methodStep = parseMethodStep2(methodAsString);

    if (recipe.method.length === 0) {
        recipe.method.push(methodStep);
    } else {
        let lastMethodStep = recipe.method[recipe.method.length - 1];

        if (lastMethodStep instanceof MethodStep) {
            recipe.method.push(methodStep);
        } else if (lastMethodStep instanceof MethodSubList) {
            if (lastMethodStep.method_steps === undefined) {
                lastMethodStep.method_steps = [];
            }
            lastMethodStep.method_steps.push(methodStep);
        } else {
            throw new PluginError(PLUGIN_NAME, "Not sure what to do with this ingredient");
        }
    }
}

function parseServingSuggestion(line: string, recipe: Recipe) {
    let servingSuggestionText = line.substring(SERVING_SUGGESTION_PREFIX.length).trim();
    let servingSuggestion = new ServingSuggestion(servingSuggestionText);

    if (recipe.serving_suggestions === undefined) {
        recipe.serving_suggestions = [];
    }

    recipe.serving_suggestions.push(servingSuggestion);
}

function parseVariation(line: string, recipe: Recipe) {
    let variationText = line.substring(VARIATION_PREFIX.length).trim();
    let variation = new Variation(variationText);

    if (recipe.variations === undefined) {
        recipe.variations = [];
    }
    recipe.variations.push(variation);
}

function parseNote(line: string, recipe: Recipe) {
    line = line.substring(NOTE_PREFIX.length);

    throw new PluginError(PLUGIN_NAME, "Haven't yet implemented the ability to handle Note");
}

function parseDimension(line: string, recipe: Recipe) {
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

function parseIntoRecipe(lines: string[]): Recipe {
    let recipe = new Recipe();

    for (const line of lines) {
        if (line.length == 0) {
            // ignore blank lines
        } else if (line.toUpperCase().startsWith(TITLE_PREFIX)) {
            parseTitle(line, recipe);
        } else if (line.toUpperCase().startsWith(CATEGORY_PREFIX)) {
            parseCategory(line, recipe);
        } else if (line.toUpperCase().startsWith(SERVING_PREFIX)) {
            parseServing(line, recipe);
        } else if (line.toUpperCase().startsWith(INGREDIENT_SUB_LIST_PREFIX)) {
            parseIngredientSubList(line, recipe);
        } else if (line.toUpperCase().startsWith(INGREDIENT_PREFIX)) {
            parseIngredient(line, recipe);
        } else if (line.toUpperCase().startsWith(OPTIONAL_INGREDIENT_PREFIX)) {
            parseOptionalIngredient(line, recipe);
        } else if (line.toUpperCase().startsWith(METHOD_SUB_LIST_PREFIX)) {
            parseMethodSubList(line, recipe);
        } else if (line.toUpperCase().startsWith(METHOD_STEP_PREFIX)) {
            parseMethodStep(line, recipe);
        } else if (line.toUpperCase().startsWith(SERVING_SUGGESTION_PREFIX)) {
            parseServingSuggestion(line, recipe);
        } else if (line.toUpperCase().startsWith(VARIATION_PREFIX)) {
            parseVariation(line, recipe);
        } else if (line.toUpperCase().startsWith(NOTE_PREFIX)) {
            parseNote(line, recipe);
        } else if (line.toUpperCase().startsWith(DIMENSION_PREFIX)) {
            parseDimension(line, recipe);
        }
    }

    return recipe;
}

function splitIntoLines(fileContent: String): string[] {
    let lines = fileContent.split(/\r?\n/);

    return lines;
}

// Plugin level function(dealing with files)
function recipeJSONizer() {
    // Creating a stream through which each file will pass
    return through.obj(function (file: any, encoding: any, callback: any) {
        if (file === null) {
            // return empty file
            return callback(null, file);
        }
        console.log("Processing file object. Type is " + typeof (file));

        if (file.isBuffer()) {
            let fileAsString = String(file.contents);
            console.log(fileAsString);
            let lines = splitIntoLines(fileAsString);
            let recipe = parseIntoRecipe(lines);

            let recipeAsJonString = JSON.stringify(recipe, undefined, 2);
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
