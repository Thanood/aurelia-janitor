# aurelia-janitor

janitor helps with matching versions of (JSPM) dependencies defined in `package.json` with actual versions installed in `config.js`.
This should lead to (for example) detecting possible "forks" before they actually happen.
In summary, janitor helps with housekeeping of JSPM dependencies used by your app or library. 

**stage**: pre-concept ;-)

At the moment, this is just an experiment on how to read a JSPM config and match it with the installed JSPM package versions.
If you happen to stumble upon this, please note that it does nothing of real use, yet.

This is how it looks atm:

![image](https://cloud.githubusercontent.com/assets/677826/15627028/dc4b9776-24d6-11e6-9b06-abbaa725cd4e.png)

