import shutil
import re
from pathlib import Path
import operator
import urllib


target_folder = "/Users/dave/Documents/GitHub/recipes"
files = list(Path(target_folder).rglob("*.html"))


recipe_dictionary = {}
for i, file in enumerate(files):
    currentSection = None
    if len(file.parts) == 7:
        recipe_name = file.parts[6]
        section_name = "Uncategorized"
        recipe_section = recipe_dictionary.get(section_name)
        if recipe_section is None:
            recipe_dictionary[section_name] = [recipe_name]
        else:
            recipe_section.append(recipe_name)
    elif len(file.parts) == 8:
        recipe_name = file.parts[7]
        section_name = str(file.parts[6])
        recipe_section = recipe_dictionary.get(file.parts[6])
        if recipe_section is None:
            recipe_dictionary[section_name] = [recipe_name]
        else:
            recipe_section.append(recipe_name)

output = ''
index = 0
for recipe_section in recipe_dictionary:

    print(recipe_section)
    if index % 3 == 0:
        output += '<div class="row">\n<div class="col-4">\n<div class="recipe-section-title">' + recipe_section + '</div>\n'
    else:
        output += '<div class="col-4">\n<div class="recipe-section-title">' + recipe_section + '</div>\n'

    for recipe_name in recipe_dictionary.get(recipe_section):
        print(recipe_name)
        if recipe_section == "Uncategorized":
            recipe_href = str(recipe_name)
        else:
            recipe_href = str(recipe_section) + '/' + str(recipe_name)

        recipe_href = urllib.parse.quote(recipe_href)
        output += '<a class="recipe-link" href="' + recipe_href + '">' + recipe_name.replace(".html", "") + '</a>\n'

    if index % 3 == 2:
        output += '</div>\n</div>\n'
    else:
        output += '</div>\n'

    index = index + 1

if index % 3 != 2:
    output += '</div>\n'

print(output)
