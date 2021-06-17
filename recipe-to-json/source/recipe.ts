export module RecipeStructure {
    const PluginError = require('plugin-error');
    const PLUGIN_NAME = 'recipe-to-json';

// constants used for parsing recipes
    const TITLE_PREFIX = "TITLE:";
    const INTRO_PREFIX = "INTRO:";
    const CATEGORY_PREFIX = "CAT:";
    const SERVING_PREFIX = "SERVE:";
    const SERVING_LABEL_PREFIX = "SERVE_LABEL:";
    const SERVING_DIMENSIONS_PREFIX = "SERVE_DIMENSIONS:";
    const INGREDIENT_SUB_LIST_PREFIX = "**";
    const INGREDIENT_PREFIX = "*";
    const OPTIONAL_INGREDIENT_PREFIX = "O*";
    const METHOD_SUB_LIST_PREFIX = "--";
    const METHOD_STEP_PREFIX = "-";
    const SERVING_SUGGESTION_PREFIX = "SS:";
    const VARIATION_PREFIX = "VAR:";
    const DIMENSION_PREFIX = "D:";
    const SOURCE_PREFIX = "SRC:";
    const NOTE_PREFIX = "N:";


    export enum IngredientListItemType {
        INGREDIENT = "INGREDIENT",
        INGREDIENT_SUB_LIST = "INGREDIENT_SUB_LIST",
        NOTE = "NOTE"
    }

        export enum MethodSubListItemType {
        METHOD_SUB_LIST = "METHOD_SUB_LIST",
        METHOD_STEP = "METHOD_STEP"
    }


    export class IngredientSubList {
        name: string = '';
        ingredient_list: object[] = [];
        type: IngredientListItemType = IngredientListItemType.INGREDIENT_SUB_LIST;

        constructor() {
        }
    }


    export class Ingredient {
        text: string;
        optional: boolean = false;
        alternative_ingredients: AlternativeIngredient[];
        note: Note;
        type: IngredientListItemType = IngredientListItemType.INGREDIENT;

        constructor(text: string) {
            this.text = text;
        }
    }


    export class AlternativeIngredient {
        text: string;

        constructor(text: string) {
            this.text = text;
        }
    }


    export class RecipeLink {
        text: string;
        href: string;

        constructor() {
        }
    }


    export class Quantity {
        number: string;
        dimensions: Dimension[];
        label: string;

        constructor() {
        }
    }


    export class Dimension {
        magnitude: string;
        number_of_dimensions: string;

        constructor() {
        }
    }


    export class Source {
        href: string;
        text: string;

        constructor() {
        }
    }


    export class Recipe {
        title: string;
        intro: string;
        quantity: Quantity;
        source: Source;
        ingredient_list: (Ingredient|IngredientSubList)[] = [];
        method: (MethodStep|MethodSubList)[] = [];
        notes: Note[] = [];
        serving_suggestions: ServingSuggestion[];
        variations: Variation[];

        constructor() {
        }
    }


    export class MethodStep {
        text: string;
        post_notes: Note[] = [];
        pre_notes: Note[] = [];
        type: MethodSubListItemType = MethodSubListItemType.METHOD_STEP;

        constructor(text: string) {
            this.text = text;
        }
    }


    export class MethodSubList {
        text: string;
        method_steps: MethodStep[];
        notes: Note[];
        type: MethodSubListItemType = MethodSubListItemType.METHOD_SUB_LIST;

        constructor(text: string) {
            this.text = text;
        }
    }


    export class ServingSuggestion {
        text: string;

        constructor(text: string) {
            this.text = text;
        }
    }


    export class Variation {
        text: string;

        constructor(text: string) {
            this.text = text;
        }
    }

    export class Note {
        text: string;

        constructor(text: string) {
            this.text = text;

        }
    }

    export class IngredientNote extends Note {
        type: IngredientListItemType = IngredientListItemType.NOTE;

        constructor(text: string) {
            super(text);
        }
    }

    export function parseTitle(line: string, recipe: Recipe) {
        line = line.substring(TITLE_PREFIX.length).trim();

        recipe.title = line;
    }

    export function parseIntro(line: string, recipe: Recipe) {
        line = line.substring(INTRO_PREFIX.length).trim();

        recipe.intro = line;
    }

    export function parseCategory(line: string, recipe: Recipe) {
        // doing nothing with this for now
    }

    export function parseServing(line: string, recipe: Recipe) {
        line = line.substring(SERVING_PREFIX.length).trim();

        if (recipe.quantity === undefined) {
            recipe.quantity = new Quantity();
        }

        recipe.quantity.number = line.trim();
    }

    export function parseServingLabel(line: string, recipe: Recipe) {
        line = line.substring(SERVING_LABEL_PREFIX.length).trim();

        if (recipe.quantity === undefined) {
            recipe.quantity = new Quantity();
        }

        recipe.quantity.label = line.trim();
    }

    /**
     * The line parameter format uses a colon (:) to separate each dimension, and within each dimension the magnitude and numberOfDimensions are separated by a comma
     * i.e.SERVE_DIMENSIONS:magnitudeX,numberOfDimensionsX:magnitudeY,numberOfDimensionsY
     *
     * Example line content for 25 by 20
     * SERVE_DIMENSIONS:25,1:20,1
     *
     * Example line content for 25 by 25
     * SERVE_DIMENSIONS:25,2
     *
     * @param line
     * @param recipe
     */
    export function parseServingDimensions(line: string, recipe: Recipe) {
        line = line.substring(SERVING_DIMENSIONS_PREFIX.length).trim();

        if (recipe.quantity === undefined) {
            recipe.quantity = new Quantity();
        }

        let dimensionsAsSingleString = line.trim();
        let dimensionStrings = dimensionsAsSingleString.split(":");
        let dimensionArray: Dimension[] = [];

        for (let dimensionString of dimensionStrings){
            let dimensionsStringParts = dimensionString.split(",");

            let dimension = new Dimension();
            dimension.magnitude = dimensionsStringParts[0];
            dimension.number_of_dimensions = dimensionsStringParts[1];

            dimensionArray[dimensionArray.length] = dimension;
        }

        recipe.quantity.dimensions = dimensionArray;
    }

    export function parseIngredientSubList(line: string, recipe: Recipe) {
        let subListName = line.substring(INGREDIENT_SUB_LIST_PREFIX.length).trim();

        let ingredientSubList = new IngredientSubList();
        ingredientSubList.name = subListName;

        recipe.ingredient_list.push(ingredientSubList);
    }

    class ExtractionResult{
        postExtractionString:string;
        extractedStrings:string[] = [];
    }

    function extractAll(source:string, regex:RegExp, trim:boolean):ExtractionResult{
        let extractionResult = new ExtractionResult();

        let result = source;
        let match;
        while((match = regex.exec(result)) !== null) {
            result = result.substr(0, match.index) + result.substring(match.index + match[0].length);

            if (trim){
                extractionResult.extractedStrings.push(match[1].trim());
            }
            else{
                extractionResult.extractedStrings.push(match[1]);
            }
        }
        extractionResult.postExtractionString = result;

        return extractionResult;
    }

    function replaceAll(source:string, regex:RegExp, prefix:string, suffix:string):string{
        let result = source;

        let match;
        while((match = regex.exec(result)) !== null) {
            result = result.substr(0, match.index) + prefix + match[1].trim() + suffix + result.substring(match.index + match[0].length);
        }

        return result;
    }


    function replaceQuantities(source:string):string{
        return replaceAll(source, /{{Q:([^}]*)}}/, '<span class="quantity">', '</span>');
    }

    export function parseIngredientText(ingredientAsString: string): Ingredient {
        ingredientAsString = replaceQuantities(ingredientAsString);
        let ingredient = new Ingredient(ingredientAsString);

        let noteRegExp = /{{N:([^}]*)}}/;
        let noteExtractionResult = extractAll(ingredientAsString, noteRegExp, true);
        ingredientAsString = noteExtractionResult.postExtractionString;
        noteExtractionResult.extractedStrings.forEach( (value:string) => {
            ingredient.note = new Note(value);
        });

        let alternativeIngredientRegExp = /{{ALT:([^}]*)}}/;
        let alternativeIngredientExtractionResult = extractAll(ingredientAsString, alternativeIngredientRegExp, true);
        let alternativeIngredients: AlternativeIngredient[] = [];
        ingredientAsString = alternativeIngredientExtractionResult.postExtractionString;
        alternativeIngredientExtractionResult.extractedStrings.forEach( (value:string) => {
            alternativeIngredients.push(new AlternativeIngredient(value));
        });

        ingredient.alternative_ingredients = alternativeIngredients;
        ingredient.text = ingredientAsString.trim();

        return ingredient;
    }

    export function parseIngredient(line: string, recipe: Recipe) {
        let ingredientAsString = line.substring(INGREDIENT_PREFIX.length).trim();
        let ingredient = parseIngredientText(ingredientAsString);

        putIngredientInRecipe(recipe, ingredient);
    }

    export function parseOptionalIngredient(line: string, recipe: Recipe) {
        let ingredientAsString = line.substring(OPTIONAL_INGREDIENT_PREFIX.length).trim();
        let ingredient = parseIngredientText(ingredientAsString);
        ingredient.optional = true;

        putIngredientInRecipe(recipe, ingredient);
    }

    export function putIngredientInRecipe(recipe: Recipe, ingredient: Ingredient) {
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


    export function parseMethodStep2(methodAsString: string): MethodStep {
        methodAsString = replaceQuantities(methodAsString);

        return new MethodStep(methodAsString);
    }

    export function parseMethodStep(line: string, recipe: Recipe) {
        let methodAsString = line.substring(METHOD_STEP_PREFIX.length).trim();
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

    export function parseServingSuggestion(line: string, recipe: Recipe) {
        let servingSuggestionText = line.substring(SERVING_SUGGESTION_PREFIX.length);
        servingSuggestionText = replaceQuantities(servingSuggestionText).trim();
        let servingSuggestion = new ServingSuggestion(servingSuggestionText);

        if (recipe.serving_suggestions === undefined) {
            recipe.serving_suggestions = [];
        }

        recipe.serving_suggestions.push(servingSuggestion);
    }

    export function parseVariation(line: string, recipe: Recipe) {
        let variationText = line.substring(VARIATION_PREFIX.length).trim();
        variationText = replaceQuantities(variationText).trim();
        let variation = new Variation(variationText);

        if (recipe.variations === undefined) {
            recipe.variations = [];
        }
        recipe.variations.push(variation);
    }

    export function parseSource(line: string, recipe: Recipe) {
        line = line.substring(SOURCE_PREFIX.length).trim();

        let hrefRegExp = /{{HREF:([^}]*)}}/;
        let extractionResult = extractAll(line, hrefRegExp, true);

        let source = new Source();
        source.text = extractionResult.postExtractionString.trim();

        if (extractionResult.extractedStrings.length > 0){
            source.href = extractionResult.extractedStrings[0].trim();
        }

        recipe.source = source;
    }

    export function parseNote(line: string, recipe: Recipe) {
        let noteContent = line.substring(NOTE_PREFIX.length).trim();
        noteContent = replaceQuantities(noteContent).trim();

        recipe.notes.push(new Note(noteContent));
    }

    export function parseDimension(line: string, recipe: Recipe) {
        line = line.substring(DIMENSION_PREFIX.length).trim();

        throw new PluginError(PLUGIN_NAME, "Haven't yet implemented the ability to handle Dimension");
    }

    export function parseIntoRecipe(lines: string[]): Recipe {
        let recipe = new Recipe();

        for (const line of lines) {
            if (line.length == 0) {
                // ignore blank lines
            } else if (line.toUpperCase().startsWith(TITLE_PREFIX)) {
                parseTitle(line, recipe);
            } else if (line.toUpperCase().startsWith(INTRO_PREFIX)) {
                parseIntro(line, recipe);
            } else if (line.toUpperCase().startsWith(CATEGORY_PREFIX)) {
                parseCategory(line, recipe);
            } else if (line.toUpperCase().startsWith(SERVING_PREFIX)) {
                parseServing(line, recipe);
            } else if (line.toUpperCase().startsWith(SERVING_LABEL_PREFIX)) {
                parseServingLabel(line, recipe);
            } else if (line.toUpperCase().startsWith(SERVING_DIMENSIONS_PREFIX)) {
                parseServingDimensions(line, recipe);
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
            } else if (line.toUpperCase().startsWith(SOURCE_PREFIX)) {
                parseSource(line, recipe);
            }
        }

        return recipe;
    }
}