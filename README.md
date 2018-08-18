<h1 align="center"> Self Help at Wooster Open Source Editor Client/ Webapp </h1>

> Discover how the Self-Help System at Wooster Webapp was created!

> Edit and Modify it to your liking using the integrated client solution in Visual Studio IDE!

## Self-Help Webapp Source Code Resides in /SourceCode

## First
  >[Enable the Google App Script API](https://script.google.com/home/usersettings)

## Features
- [ Uses your Google Account ](#login)
- [ Create or Use Existing Scripts ](#script-access)
- [ Get Useful Script Information ](#script-information)
- [ Download your Source Code ](#download)
- [ Upload Your Changes ](#upload)
- [ Smart File Management ](#smart-file-management)
- [ Auto Sync ](#auto-sync)
- [ Create Source Code Files ](#create-source-code-files)
- [ Manage Deployments and Version ](#versions-and-deployments)

## About

### Login

Login with OAuth 2.0 through your browser. Stores your access token for future use.

### Logout

Clears all current resources from your application and destroys your access token.

### Script Access

#### - Paste any Script ID

  Viewing access allows you to download files, and Write access lets you upload.
  
  Your Script ID is automatically validated to check if it's correct.

#### - Create a New App Script Project

  Simply provide a name for your project.

For your convenience, your Script ID will be stored and loaded automatically for future startup!

### Script Information

#### Displays the following each time you load a script

#### - Script ID
  
#### - Project Tile ..., Created By ...
  
#### - Development URL
  
#### - Webapp URL
  
#### - Your Latest Project Version:

### Download

#### - Download the latest copy of your Source Code from your Script

  Download the project's entirel current respository.
#### - Download any versioned copy of your Source Code

  Useful for reverting, debugging, or retrieving your project history from a version.

### Upload

#### - Upload your current changes

  Clears your Google App Script's current code and replaces it with your local source code.
  
#### - Upload for a new version

  Same as above, and creates a new version.
  
#### - Upload and Deploy for Live (link)

### Smart File Management

#### - AutoSync (Optional)

  Detects when you make a change to your source code folders and automatically uploads your project.
  A change can be user initiated, impelled by the application, or done by the IDE (like find and replace)
  Has about a 500ms delay to prevent any issues.
  
#### - HTML File Script Tag Refactoring (Optional)
  
  For any HTML file, this feature detects a single <script> tag and moves the source code to a corresponding javascript file!
  It creates a placeholder that lets you know where your script was, and has an attribute with the new file's path.
  This lets you edit the file using Visual Studio's features for Javascript!
  When you sync your files back, no problem, it simply ignores the generated files and substitues their code back into the HTML

### Auto Sync

### Create Source Code Files

### Versions and Deployments

###
