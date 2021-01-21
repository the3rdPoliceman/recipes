export declare module RecipeThing {
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
        name: string;
        ingredient_list: object[];
        type: IngredientListItemType;
        constructor();
    }
    class Ingredient {
        text: string;
        optional: boolean;
        alternative_ingredients: AlternativeIngredient[];
        note: Note;
        type: IngredientListItemType;
        constructor(text: string);
    }
    class AlternativeIngredient {
        text: string;
        constructor(text: string);
    }
    class RecipeLink {
        text: string;
        href: string;
        constructor();
    }
    class Quantity {
        number: string;
        dimensions: Dimension[];
        label: string;
        constructor();
    }
    class Dimension {
        magnitude: string;
        number_of_dimensions: string;
        constructor();
    }
    class Source {
        href: string;
        text: string;
        constructor();
    }
    class Recipe {
        title: string;
        quantity: Quantity;
        source: Source;
        ingredient_list: object[];
        method: object[];
        notes: Note[];
        serving_suggestions: ServingSuggestion[];
        variations: Variation[];
        constructor();
    }
    class MethodStep {
        text: string;
        post_notes: Note[];
        pre_notes: Note[];
        type: MethodSubListItemType;
        constructor(text: string);
    }
    class MethodSubList {
        text: string;
        method_steps: MethodStep[];
        notes: Note[];
        type: MethodSubListItemType;
        constructor(text: string);
    }
    class ServingSuggestion {
        text: string;
        constructor(text: string);
    }
    class Variation {
        text: string;
        constructor(text: string);
    }
    class Note {
        text: string;
        constructor(text: string);
    }
    class IngredientNote extends Note {
        type: IngredientListItemType;
        constructor(text: string);
    }
    function parseTitle(line: string, recipe: Recipe): void;
    function parseCategory(line: string, recipe: Recipe): void;
    function parseServing(line: string, recipe: Recipe): void;
    function parseIngredientSubList(line: string, recipe: Recipe): void;
    function parseIngredientText(ingredientAsString: string): Ingredient;
    function parseIngredient(line: string, recipe: Recipe): void;
    function parseOptionalIngredient(line: string, recipe: Recipe): void;
    function putIngredientInRecipe(recipe: Recipe, ingredient: Ingredient): void;
    function parseMethodSubList(line: string, recipe: Recipe): void;
    function returnString(line: string): string;
    function parseMethodStep2(methodAsString: string): MethodStep;
    function parseMethodStep(line: string, recipe: Recipe): void;
    function parseServingSuggestion(line: string, recipe: Recipe): void;
    function parseVariation(line: string, recipe: Recipe): void;
    function parseNote(line: string, recipe: Recipe): void;
    function parseDimension(line: string, recipe: Recipe): void;
    function parseIntoRecipe(lines: string[]): Recipe;
}
//# sourceMappingURL=recipe.d.ts.map