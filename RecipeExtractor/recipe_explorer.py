import os
import json
from bs4 import BeautifulSoup
from bs4.element import *
import bs4


class Note:
    def __init__(self, text):
        self.text = text


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


def is_of_class(element, class_):
    if class_ in element.get_attribute_list('class'):
        return True

    return False


def is_navigable_string_empty(element):
    return len(element.strip()) == 0


def get_complete_tag_contents(element):
    return element.encode_contents().decode("utf-8").strip()


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


def create_method_step(element, pre_notes):
    new_method_step = MethodStep()
    new_method_step.text = get_complete_tag_contents(element)
    new_method_step.pre_notes = pre_notes

    return new_method_step


def create_note(element):
    new_note = Note(get_complete_tag_contents(element))

    return new_note


def create_method_sub_list(element):
    new_method_sub_list = MethodSubList(get_complete_tag_contents(element))

    return new_method_sub_list


root_path = '/Users/dave/Documents/GitHub/RecipeCollection'
recipe_list_path = root_path + '/RecipeExtractor/recipe_list.txt'

recipe_file_paths = []
with open(recipe_list_path, "r") as recipe_list_file:
    recipe_file_paths = recipe_list_file.readlines()


for recipe_file_path in recipe_file_paths:
    recipe_file_path = recipe_file_path.replace('\n', '')
#    print("parsing: " + str(recipe_file_path))

    with open(recipe_file_path, 'r') as recipe_file:
        recipe_file_content = recipe_file.read()
        soup = BeautifulSoup(recipe_file_content, 'html.parser')

        directions = Directions()
        method_sub_list = None
        method_step = None
        pre_notes = []
        directions_list_tag = soup.select('.directions-list')[0]

        directions_list_items = directions_list_tag.children
        for directions_list_item in directions_list_items:
            if type(directions_list_item) is bs4.element.NavigableString:
                if not is_navigable_string_empty(directions_list_item):
                    print("found lost string " + str(directions_list_item))
            elif type(directions_list_item) is bs4.element.Tag:
                if is_method_step(directions_list_item):
                    method_step = create_method_step(directions_list_item, pre_notes)
                    pre_notes = []
                    if method_sub_list is not None:
                        method_sub_list.method_steps.append(method_step)
                    else:
                        directions.direction_list_items.append(method_step)
                elif is_method_sub_list(directions_list_item):
                    method_sub_list = create_method_sub_list(directions_list_item)
                    directions.direction_list_items.append(method_sub_list)
                elif is_post_note(directions_list_item):
                    note = create_note(directions_list_item)
                    method_step.post_notes.append(note)
                elif is_pre_note(directions_list_item):
                    pre_notes.append(create_note(directions_list_item))
                else:
                    print("FINDING: " + str(directions_list_item))
            else:
                print("found item of type " + type(directions_list_item))

    print(json.dumps(directions, default=lambda o: o.__dict__))
