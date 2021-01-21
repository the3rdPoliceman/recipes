
class IngredientSubList:

    def __init__(self):
        self.name = ''
        self.ingredient_list = []


class Ingredient:

    def __init__(self, text):
        self.text = text
        self.optional = False
        self.alternative_ingredients = []
        self.note = None


class AlternativeIngredient:

    def __init__(self, text):
        self.text = text


class RecipeLink:

    def __init__(self):
        self.text = ''
        self.href = ''


class Quantity:

    def __init__(self):
        self.number = None
        self.dimensions = []
        self.label = ''


class Source:

    def __init__(self):
        self.href = None
        self.text = ''


class Attempt:

    def __init__(self, text):
        self.text = text
        self.date = ''


class Recipe:

    def __init__(self):
        self.title = ''
        self.quantity = None
        self.source = None
        self.ingredient_list = []
        self.method = []
        self.notes = []
        self.serving_suggestions = []
        self.variations = []
        self.attempt_log = []


class MethodStep:

    def __init__(self):
        self.text = ''
        self.post_notes = []
        self.pre_notes = []


class MethodSubList:

    def __init__(self, text):
        self.text = text
        self.method_steps = []
        self.notes = []


class ServingSuggestion:
    def __init__(self, text):
        self.text = text


class Variation:
    def __init__(self, text):
        self.text = text


class Note:
    def __init__(self, text):
        self.text = text
        self.note_type = None
