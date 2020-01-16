import docx2txt
from pathlib import Path
import shutil
from os import mkdir, path


def get_text(filename):
    return docx2txt.process(filename)


target_folder = "/Users/dave/Documents/recipes"
files = list(Path("/Users/dave/Downloads/Food").rglob("*.docx"))

shutil.rmtree(target_folder, True)
mkdir(target_folder)

for i, file in enumerate(files):
    if file.parent.name == "Food":
        target_file = target_folder + "/" + file.stem + ".txt"
    else:
        target_file = target_folder + "/" + file.parent.name + "/" + file.stem + ".txt"

    target_file = target_file.replace("_", "and")
    text = get_text(file)
    # print(file)
    # print("source = " + str(file.absolute()))
    # print("target = " + full_folder_name + target_file_name)

    if not path.exists(path.dirname(target_file)):
        try:
            mkdir(path.dirname(target_file))
        except OSError as exc:  # Guard against race condition
            raise

    with open(target_file, 'a') as out:
        out.write(text)
