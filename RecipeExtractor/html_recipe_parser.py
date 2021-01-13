import os
import json
from bs4 import BeautifulSoup
import bs4


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


def is_of_class(element, class_):
    if class_ in element.get_attribute_list('class'):
        return True

    return False


def is_navigable_string_empty(element):
    return len(element.strip()) == 0


def get_complete_tag_contents(element):
    return element.encode_contents().decode("utf-8").strip()


def is_ingredient(element):
    return is_of_class(element, 'ingredient')


def is_optional(element):
    return is_of_class(element, 'optional')


def is_recipe_link(element):
    return is_of_class(element, 'recipe-ref')


def is_ingredient_sub_list(element):
    return is_of_class(element, 'ingredient-sub-list') or is_of_class(element, 'ingredient-sub-list-top')


def is_alternative_ingredient(element):
    return is_of_class(element, 'alternative-ingredient')


def get_ingredient_text(element):
    return get_complete_tag_contents(element)


def is_method_sub_list(element):
    return is_of_class(element, 'method-sub-list') or is_of_class(element, 'method-sub-list-top')


def is_method_step(element):
    return is_of_class(element, 'method-step')


def is_directions_list(element):
    return is_of_class(element, 'directions-list')


def is_method_sub_list(element):
    return is_of_class(element, 'method-sub-list') or is_of_class(element, 'method-sub-list-top')


def is_post_note(element):
    return is_of_class(element, 'note') and is_of_class(element, 'post')


def is_pre_note(element):
    return is_of_class(element, 'note') and is_of_class(element, 'pre')


def is_note(element):
    return is_of_class(element, 'note')


def create_note(element):
    new_note = Note(get_complete_tag_contents(element))

    return new_note


def create_ingredient_sub_list(element):
    new_ingredient_sub_list = IngredientSubList()
    new_ingredient_sub_list.name = element.get_text()
    new_ingredient_sub_list.type = 'INGREDIENT_SUB_LIST'

    return new_ingredient_sub_list


def create_alternative_ingredient(element):
    ingredient_text = element.encode_contents().decode("utf-8").strip()
    new_alternative_ingredient = AlternativeIngredient(ingredient_text)

    return new_alternative_ingredient


def create_alternative_ingredients(element):
    elements_to_extract = []
    new_alternative_ingredient_list = []

    for child_element in element.children:
        if type(child_element) is bs4.element.NavigableString:
            pass
        elif type(child_element) is bs4.element.Tag and is_alternative_ingredient(child_element):
            new_alternative_ingredient_list.append(create_alternative_ingredient(child_element))
            elements_to_extract.append(child_element)
        else:
            print_finding("While looking for alternative ingredients, found : " + str(child_element))

    # remove alternative ingredients from ingredient
    for element_to_extract in elements_to_extract:
        element_to_extract.extract()

    return new_alternative_ingredient_list


def create_ingredient(element):
    alternative_ingredients = create_alternative_ingredients(element)
    new_ingredient = Ingredient(get_ingredient_text(element))
    new_ingredient.optional = is_optional(element)
    new_ingredient.alternative_ingredients = alternative_ingredients
    new_ingredient.type = 'INGREDIENT'

    return new_ingredient


def create_recipe_link(element):
    new_recipe_link = RecipeLink()
    new_recipe_link.text = element.get_text()
    new_recipe_link.href = element['data-href']
    new_recipe_link.type = 'RECIPE_LINK'

    return new_recipe_link


def create_method_step(element, pre_notes):
    new_method_step = MethodStep()
    new_method_step.text = get_complete_tag_contents(element)
    new_method_step.pre_notes = pre_notes
    new_method_step.type = 'METHOD_STEP'

    return new_method_step


def create_method_sub_list(element):
    new_method_sub_list = MethodSubList(get_complete_tag_contents(element))
    new_method_sub_list.type = 'METHOD_SUB_LIST'

    return new_method_sub_list


def create_serving_suggestions(soup):
    serving_suggestions = []

    suggestion_tags = soup.select('.serving-suggestion')
    for suggestion_tag in suggestion_tags:
        serving_suggestion_text = get_complete_tag_contents(suggestion_tag)
        serving_suggestions.append(ServingSuggestion(serving_suggestion_text))

    if len(serving_suggestions) == 0:
        return None
    else:
        return serving_suggestions


def create_attempt_log_list(soup):
    attempt_log = []

    attempt_log_tags = soup.select('.attempt-log-entry')
    for attempt_log_tag in attempt_log_tags:
        attempt_log_text = get_complete_tag_contents(attempt_log_tag)
        attempt_log.append(Attempt(attempt_log_text))

    if len(attempt_log) == 0:
        return None
    else:
        return attempt_log


def create_variations_list(soup):
    variations = []

    variation_tags = soup.select('.variation')
    for variation_tag in variation_tags:
        variation_text = get_complete_tag_contents(variation_tag)
        variations.append(Variation(variation_text))

    if len(variations) == 0:
        return None
    else:
        return variations


def create_quantity(soup):
    quantity = Quantity()

    if len(soup.select('.servings')) > 0:
        servings_elements = soup.select('.servings')[0].children
        for servings_element in servings_elements:
            if type(servings_element) is bs4.element.NavigableString:
                if not is_navigable_string_empty(servings_element):
                    quantity.label = str(servings_element)
            elif type(servings_element) is bs4.element.Tag:
                value = servings_element['value']

                if quantity.number is None:
                    quantity.number = value
                else:
                    quantity.dimensions.append(value)

    return quantity


def create_recipe_source(soup):
    source = None
    source_links = soup.select('.source-link')
    if len(source_links) > 0:
        source = Source()
        source_link = source_links[0]
        source.text = source_link.get_text()
        anchor = source_link.find("a")
        if anchor is not None:
            source.href = anchor["href"]

    return source


def create_recipe_notes(soup):
    recipe_notes = []
    directions_tag = soup.select('.directions')[0]
    directions_items = directions_tag.children
    for directions_item in directions_items:
        if type(directions_item) is bs4.element.Tag and is_note(directions_item):
            recipe_notes.append(create_note(directions_item))

    return recipe_notes


def create_ingredients_list(soup):
    ingredient_list = []
    ingredient_list_items = soup.select('.ingredients')[0].children
    ingredient = None
    ingredient_sub_list = None
    for ingredient_list_item in ingredient_list_items:
        if type(ingredient_list_item) is bs4.element.NavigableString:
            if not is_navigable_string_empty(ingredient_list_item):
                print_finding("found lost string " + str(ingredient_list_item))
        elif type(ingredient_list_item) is bs4.element.Tag:
            if is_ingredient_sub_list(ingredient_list_item):
                ingredient_sub_list = create_ingredient_sub_list(ingredient_list_item)
                ingredient_list.append(ingredient_sub_list)
            elif is_ingredient(ingredient_list_item):
                ingredient = create_ingredient(ingredient_list_item)
                if ingredient_sub_list is not None:
                    ingredient_sub_list.ingredient_list.append(ingredient)
                else:
                    ingredient_list.append(ingredient)
            elif is_note(ingredient_list_item):
                note = create_note(ingredient_list_item)
                note.type = 'NOTE'
                if ingredient is None:
                    ingredient_list.append(note)
                else:
                    ingredient.note = note
            elif is_recipe_link(ingredient_list_item):
                recipe_link = create_recipe_link(ingredient_list_item)
                if ingredient_sub_list is not None:
                    ingredient_sub_list.ingredient_list.append(recipe_link)
                else:
                    ingredient_list.append(recipe_link)
        else:
            print_finding("found item of type " + type(ingredient_list_item))

    return ingredient_list


def create_method(soup):
    method = []

    method_sub_list = None
    method_step = None
    pre_notes = []
    directions_list_tag = soup.select('.directions-list')[0]
    directions_list_items = directions_list_tag.children
    for directions_list_item in directions_list_items:
        if type(directions_list_item) is bs4.element.NavigableString:
            if not is_navigable_string_empty(directions_list_item):
                print_finding("found lost string " + str(directions_list_item))
        elif type(directions_list_item) is bs4.element.Tag:
            if is_method_step(directions_list_item):
                method_step = create_method_step(directions_list_item, pre_notes)
                pre_notes = []
                if method_sub_list is not None:
                    method_sub_list.method_steps.append(method_step)
                else:
                    method.append(method_step)
            elif is_method_sub_list(directions_list_item):
                method_sub_list = create_method_sub_list(directions_list_item)
                method.append(method_sub_list)
            elif is_post_note(directions_list_item):
                note = create_note(directions_list_item)
                method_step.post_notes.append(note)
            elif is_pre_note(directions_list_item):
                pre_notes.append(create_note(directions_list_item))
            else:
                print_finding("found " + str(directions_list_item))
        else:
            print_finding("found item of type " + type(directions_list_item))

    return method


def create_recipe(path):
    with open(path, 'r') as recipe_file:
        recipe = Recipe()

        recipe_file_content = recipe_file.read()
        soup = BeautifulSoup(recipe_file_content, 'html.parser')

        recipe.title = soup.select('title')[0].get_text()
        recipe.quantity = create_quantity(soup)
        recipe.ingredient_list = create_ingredients_list(soup)
        recipe.source = create_recipe_source(soup)
        recipe.serving_suggestions = create_serving_suggestions(soup)
        recipe.variations = create_variations_list(soup)
        recipe.attempt_log = create_attempt_log_list(soup)
        recipe.notes = create_recipe_notes(soup)
        recipe.method = create_method(soup)

        return recipe


def get_recipe_as_json(recipe):
    # convert to JSON string
    return json.dumps(recipe, indent=4, default=lambda o: o.__dict__)


def get_recipe_file_paths(recipe_list_path):
    with open(recipe_list_path, "r") as recipe_list_file:
        file_paths = recipe_list_file.readlines()

    return file_paths


def main():
    root_path = '/Users/dave/Documents/GitHub/RecipeCollection'
    recipe_list_path = root_path + '/RecipeExtractor/recipe_list.txt'

    recipe_file_paths = get_recipe_file_paths(recipe_list_path)
    file_count = 0
    for recipe_file_path in recipe_file_paths:
        file_count = file_count + 1
        recipe = create_recipe(recipe_file_path.replace('\n', ''))
        recipe_as_json = get_recipe_as_json(recipe)

        json_file_path = root_path + "/json/Recipes/" + recipe_file_path[54:-6] + ".json"
        parent_directory = json_file_path[0:json_file_path.rfind("/")]
        if not os.path.exists(parent_directory):
            os.makedirs(parent_directory)

        with open(json_file_path, "w+") as json_file:
            json_file.write(recipe_as_json)
            json_file.close()

    print("Finished parsing " + str(file_count) + " files")


def print_finding(finding):
    print("FINDING: " + finding)


if __name__ == "__main__":
    main()


