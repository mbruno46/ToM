***

## Installation

Installers of the application for MacOS and Linux can be 
found [here](https://github.com/mbruno46/ToM/releases/latest).

### MacOS

ToM can be installed globally using the `dmg` file or locally by unpacking the `zip`
distribution and moving the `ToM.app` folder to the preferred location, e.g. `$HOME/Applications`.

Any version of MacOS will prevent the usage of ToM, since its author is not an
official Apple Developer. To be able to use ToM, 
open `System preferences -> Security and privacy` and click on `open anyway`
as illustrated below.

<img src="assets/img/apple_settings.png" alt="Apple settings" style="width: 100%; max-width: 600px">
    
Alternatively, open a terminal and type

```bash
# if ToM was installed globally with dmg file
xattr -dr com.apple.quarantine /Applications/ToM.app
# if ToM was installed locally in HOME folder
xattr -dr com.apple.quarantine ~/Applications/ToM.app
```

If you run in *compilation errors* make sure to open ToM preferences and
properly set the latex command, for example by specifying the full path
of the `pdflatex` or `latexmk` executables in your system.