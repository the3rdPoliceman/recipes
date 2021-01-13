import shutil
import re
from pathlib import Path
import operator
import urllib
import os


def get_regex():
    measurements = ''
    with open('measurements.txt') as measurements_file:
        lines = measurements_file.readlines()
        for line in lines:
            measurements = measurements + line.replace("\n", "") + '|'

        measurements = measurements[:-1]

    regex = r'^(\s*<div class="ingredient">\s*)([\d/]+|A|a|zest of|juice of|bunch of|small bunch of|half) ?(' + measurements + ')? (.*)(\s*</div>\s*)$'

    return regex


target_folder = "/Users/dave/Documents/GitHub/RecipeCollection"
files = list(Path(target_folder).rglob("*.html"))
regex = get_regex()

print(target_folder)
print(regex)

for i, file in enumerate(files):
    print(file.name)
    with open(file) as recipeFile:
        lines = recipeFile.readlines()
        for line in lines:
            match = re.match('.*class="[^"]*ingredient[^"]*".*', line)
            if match is not None:
                print(line)
                print(re.sub(regex, '\1 \2 \3 \4 \5', line))

#
# recipe_dictionary = {}
# for i, file in enumerate(files):
#     currentSection = None
#     if len(file.parts) == 7:
#         recipe_name = file.parts[6]
#         section_name = "Uncategorized"
#         recipe_section = recipe_dictionary.get(section_name)
#         if recipe_section is None:
#             recipe_dictionary[section_name] = [recipe_name]
#         else:
#             recipe_section.append(recipe_name)
#     elif len(file.parts) == 8:
#         recipe_name = file.parts[7]
#         section_name = str(file.parts[6])
#         recipe_section = recipe_dictionary.get(file.parts[6])
#         if recipe_section is None:
#             recipe_dictionary[section_name] = [recipe_name]
#         else:
#             recipe_section.append(recipe_name)
#
# output = '<div class="row">'
# index = 0
# for recipe_section in recipe_dictionary:
#     output += '<div class="col-12 col-sm-4">\n<div class="recipe-section-title">' + recipe_section + '</div>\n'
#
#     for recipe_name in recipe_dictionary.get(recipe_section):
#         if recipe_section == "Uncategorized":
#             recipe_href = str(recipe_name)
#         else:
#             recipe_href = str(recipe_section) + '/' + str(recipe_name)
#
#         recipe_href = urllib.parse.quote(recipe_href)
#         output += '<a class="recipe-link" href="' + recipe_href + '">' + recipe_name.replace(".html", "") + '</a>\n'
#
#     output += '</div>\n'
# output += '</div>\n'
#
# print(output)