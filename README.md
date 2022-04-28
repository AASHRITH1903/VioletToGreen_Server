# VioletToGreen_Server


This server is developed as a part of our main project **VioletToGreen** which is a VS Code extension to assist the developer to maintain the quality of comments, for more information : [VioletToGreen Readme](https://github.com/captnTardigrade/VioletToGreen/blob/main/README.md). The purpose of the server is to communicate with the client (the VScode plugin) which involves getting the data, performing some computation, and returning the results.


### Tools and Structure of the Repo

The server hosts various tools written in java and python which can't be accommodated on the client-side and are used to serve the "**suggest-comments**" functionality of the plugin. The ```/Software_Metrics``` folder contains the tools that are used to calculate the metrics like **Cyclomatic complexity** and **Halstead difficulty** which is later used to calculate our own metrics. This repository contains two server files (both in the ```/``` folder), one is written in JS ```server.js``` and the other is written in python ```api.py```. The server.js is the main server used for the "suggest-comments" functionality and the api.py server uses an ML model to classify comments to identify the commented-out code which is to be excluded during comment suggestion.


The ```/scripts``` folder contains some useful scripts which are used to perform functions like sampling the code and calculating the **code-to-comment** ratio and the **RUM** metric. These scripts use all the available java tools and a **CST** to accomplish these tasks.

The Java tools in ```/Software_Metrics``` are packaged in the form of ```.jar``` files which can be run directly on the command line. In our project, the .jar files are loaded using the npm package ``` java``` to allow us to use the needed java classes in javascript. 

<Here about the Model and api.py>


### Instructions to run
  
 Both the servers run in two different ports, server.js runs on port: ```3000``` and api.py runs on port:```5000```.
 It is always better to use a python **virtualenv** to install all the dependencies and run the python API in the same env.
  
  
1. **cd** to the ```/``` folder
  
2. **Install all the dependencies:**
  
```
npm install
pip install -r ./requirements.txt
```
  
  
3. **Run suggest-comments Server:**
```
node server.js
```
  
4. **Run commented-out code detection Server:**
```
python api.py
```
  
### Future Work:
  
Currently, we are using Java projects that are found in Github written by someone else to calculate the metrics. The interface between java and JS is provided by the npm package called "**java**". Now it is quite cumbersome to change the java source code according to the need and recompile everything again to fit the latest needs. One possible future extension could be to replicate the tools in JS so that a smooth interface could be established between the tools and server which helps in maintainability as well.






