import shutil
import re
from pathlib import Path


def parse_file(the_file):
    with open(the_file) as recipe_file:
        lines = recipe_file.readlines()
        contains_method = False
        contains_ingredients = False

        for line in lines:
            if re.match('^\\s*method\\s*$', line, re.IGNORECASE):
                contains_method = True
            if re.match('^\\s*ingredients\\s*$', line, re.IGNORECASE):
                contains_ingredients = True

        if not (contains_method and contains_ingredients):
            print(the_file)
            print("contains_ingredients " + str(contains_ingredients))
            print("contains_method " + str(contains_method))

        if contains_method and contains_ingredients:
            title = lines.pop(0)
            header = '<!DOCTYPE html><html lang="en">	<head>		<!-- Required meta tags always come first -->		<meta charset="utf-8">		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">		<meta http-equiv="x-ua-compatible" content="ie=edge">        <!-- Bootstrap CSS -->        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">        <link rel="stylesheet" href="../css/styles.css">		<title>' + title + '</title>	</head>	<body>'
            footer = '</div></body>    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script></html>'
            output = '<header class="recipe-header"><div class="container"><div class="row page-title">' + title + '</div></div></header>'
            output += '<div class="container recipe">'
            before_ingredients = True
            before_method = True
            for line in lines:
                if re.match('^\\s*ingredients\\s*$', line, re.IGNORECASE):
                    output += '<div class="ingredient-title">Ingredients</div>\n'
                    before_ingredients = False
                elif re.match('^\\s*method\\s*$', line, re.IGNORECASE):
                    output += '<div class="directions-title">Directions</div>\n'
                    before_method = False
                else:
                    if before_ingredients:
                        output += '<div class="info">' + line + '</div>\n'
                    elif before_method:
                        output += '<div class="ingredient">' + line + '</div>\n'
                    else:
                        output += '<div class="method-step">' + line + '</div>\n'

            output = header + output + footer
            output_file = str(the_file.parent) + "/" + the_file.name.replace(".txt", ".html")

            print(str(the_file))
            print(output_file)
            print(output)

            with open(output_file, 'w') as out:
                out.write(output)


def get_regex():
    measurements = ''
    with open('measurements.txt') as measurements_file:
        lines = measurements_file.readlines()
        for line in lines:
            measurements = measurements + line.replace("\n", "") + '|'

        measurements = measurements[:-1]

    regex = r'^([\d/]+|A|a) ?(' + measurements + ')? (.*)$'

    return regex


target_folder = "/Users/dave/Documents/GitHub/recipes"
files = list(Path(target_folder).rglob("*.txt"))

for i, file in enumerate(files):
    parse_file(file)

print('Using regex: ' + get_regex())
sample = '100g marmelade'
print(re.sub(get_regex(), '\1 \2 banana \3', sample))
