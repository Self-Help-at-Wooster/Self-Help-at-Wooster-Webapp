
<p align="center"><img src="https://image.ibb.co/fQ2igG/new_Self_Help_Logo.png" height="125" width="125"></p>

<h1 align="center"> Self-Help at Wooster Open Source Editor Client/ Webapp </h1>

### *Discover how the Self-Help at Wooster Application was created!*

###  *Edit and Modify* to your liking using the integrated client solution in the Visual Studio IDE!

## About

* ### Self-Help Webapp Source Code Resides in [Self Help Open Source Editor Client\SourceCode](https://github.com/Self-Help-at-Wooster/Self-Help-at-Wooster-Webapp/tree/master/Self%20Help%20Open%20Source%20Editor%20Client/SourceCode).
* ### This Project was created using [.NET Core](https://docs.microsoft.com/en-us/dotnet/core/), so it can run on Windows, macOS, and Linux.
* ### This Project requires a [NuGet package](https://script.google.com/a/woosterschool.org/macros/s/AKfycbxouHo31c8mhQNo6xik2iZgn-fWQ5Ik4zVfE4722wY8nfWqciNl/exec) to run and interface with Apps Script Projects (Available to Wooster School Students Only).

* #### This Project was founded by [Ryan Toner](https://github.com/RyanTonerCode).

## First
  > 1. [Enable the Google App Script API](https://script.google.com/home/usersettings)
  > 1. Make sure you review the basic of [Web Apps](https://developers.google.com/apps-script/guides/web)
  > 1. In particular, learn about the *doGet(e)* function and note the differences between the */exec* and */dev* URLS!
  
## Clarifying Terms
  > Your Google App Script Project is your online project from https://script.google.com/..., not your local solution.
  
  > The Visual Studio Solution refers to the [Self Help Open Source Editor Client.sln](https://github.com/Self-Help-at-Wooster/Self-Help-at-Wooster-Webapp/blob/master/Self%20Help%20Open%20Source%20Editor%20Client.sln) file you downloaded.

## Features
- [ Uses your Google Account ](#login)
- [ Create or Use Existing Scripts ](#script-access)
- [ Get Useful Script Information ](#script-information)
- [ Download your Source Code ](#download)
- [ Upload Your Changes ](#upload)
- [ Smart File Management ](#smart-file-management)
- [ Create Source Code Files ](#create-source-code-files)
- [ Manage Deployments and Version ](#versions-and-deployments)

## Usage

### Login

Login with OAuth 2.0 through your browser. Stores your access token for future use. Initializes necessary classes from the [App Script API](https://developers.google.com/apps-script/api/) for providing relevant features.

### Logout

Clears all current resources from your application and destroys your access token.

### Script Access

#### - Paste any Script ID

  Viewing access allows you to download files, and Write access lets you upload.
  
  Get this ID ` File > Project properties > Script ID ` from your Google Apps Script project.
  
  Your Script ID is automatically validated to check if it's correct.

#### - Create a New App Script Project

  Simply provide a name for your project. 
  
  This action will generate a file with a doGet(e){ } method so it can deploy as a web app. 
  If you remove this method, your project cannot deploy as a web app because there is no entry point.

  For your convenience, your Script ID will be stored and loaded automatically for future startup!

### Script Information

#### Displays the following each time you load a script

Displayed | Details
------------ | -------------
Script ID | A string that identifies this script from the others.
Project Tile, Created By | The project title (from Google Drive) and who created the project.
Development URL | The URL that runs the current version of the code.
Webapp URL | The URL that runs the web app deployment. It is intrinsically attached to a version.
Latest Project Version, Current Deployment Version | The highest version your project has, and the current web app deployment version.

### Download

  Downloading an App Script Project will replace all SourceCode/ files of the same name. 
  
  If you want to keep your current SourceCode directory for any reason, you can back it up.
  
  The files are organized based upon their file types. The directory /SourceCode contains 3 subdirectories:
  
  Directory | File Type Stored
  ------------ | -------------
  SourceCode/HTML | .html
  SourceCode/JAVASCRIPT | .js
  SourceCode/JSON | .json
  
  The directories can mix their file types if desired. For example, enabling `<script>` refactoring places .html files next to their derivative .js files in the HTML folder.

#### - Download the latest copy of your Source Code from your Script

  Download the project's entire current respository.
  
#### - Download any versioned copy of your Source Code

  Useful for reverting, debugging, or retrieving your project history from a version.
  
#### - Download the Self-Help Source Code

  You can easily access the [Source Code](https://github.com/Self-Help-at-Wooster/Self-Help-at-Wooster-Webapp/tree/master/Self%20Help%20Open%20Source%20Editor%20Client/SourceCode) from GitHub, but this feature easily allows you to download it directly from your app. It always comes from the current version reflected on the Self-Help website.

### Upload

#### - Upload your current changes

  Clears your Google App Script's current code and replaces it with your local source code.
  
#### - Upload with  a new version

  Uploads your current changes, and creates a new version.
  
#### - Upload and Deploy for Live (#Sync-and-Deploy-for-Live-Version)

### Smart File Management

#### - AutoSync 
 (Optional)

  Detects when you make a change to your source code folders and automatically uploads your project.
  A change can be user initiated, impelled by the application, or done by the IDE (like find and replace)
  Has about a 500ms delay to prevent any issues.
  
#### - HTML File Script Tag Refactoring 
  (Optional)
  
  For any HTML file, this feature detects a single <script> tag and moves the source code to a corresponding javascript file!
  It creates a placeholder that lets you know where your script was, and has an attribute with the new file's path.
  This lets you edit the file using Visual Studio's features for Javascript!
  When you sync your files back, no problem, it simply ignores the generated files and substitues their code back into the HTML

### Create Source Code Files

Creates a new HTML, Javascript, or JSON file with given name.
- Automatically places the file in the correct subdirectory
- Provides a basic code template in your file like on the [Google App Script](script.google.com)s Edtior.
- The JSON file (aka [manifest](https://developers.google.com/apps-script/concepts/manifests)) is downloaded directly from the Self-Help source, because they can be a little confusing to understand.

### Versions and Deployments

#### - Automatic Webapp Deployment and Retrieval
    
    The library handles accessing your current Web app and Head Deployments.
    > The Head is used to get the development URL
    
    > The Webapp Deployment is how you can deploy the project, if desired.
      The library will always use the latest webapp deployment. 
      
    > If this behavior is undesired, delete all unnecessary deployments through
      project > Publish--Deploy from Manifest > Delete Icon
      *(only if there's more than one webapp)*.
      
#### - List your Version History      
    
Lists all saved versions of your project. This function gets ran automatically when certain other functions require you to provide a version number. If you want to delete unused versions, you may at `project > File > Manage Versions` from [Google App Script](script.google.com)
    
#### - Create New Version

Creates a new version attached to the current copy of your source code on [Google App Script](script.google.com). You can provide whatever name you want, but these are best used as incremental "commits," and not big feature backups. You can always download your project from a [specific version](#Download-any-versioned-copy-of-your-Source-Code) if needed, so the best philosophy here is early-and-oft!

#### - Create New Version and Update Deployment

Creates a new version and attached your web-app's current deployment. This function first creates a new version, as above, then proceeds to update the deployment that your users see. Use this once a feature is completed/ tested and you want it deployed. 

#### - Sync and Deploy for Live Version

  This is a chained-call that first [ uploads ](#upload) your source code, then creates a new version and updates the deployment, as specified above.

#### - Change Deployment's Version Number

  Changes your web-app's current version number. Use this in the event that a newer version has affected the live functionality of your application.


## Guides

### Installation

### Initial Setup - Obtain a Coffee

1. Downloading the [NuGet Package](https://script.google.com/a/woosterschool.org/macros/s/AKfycbxouHo31c8mhQNo6xik2iZgn-fWQ5Ik4zVfE4722wY8nfWqciNl/exec)
    * Download the package from the link above. The site is restricted to @woosternet.org and @woosterschool.org domain addresses only.
    * Place the package .nupkg file somewhere secure on your file system where you are unlikely to disturb it.
    * Download and Install [Microsoft Visual Studio (2017 Community Edition)](https://visualstudio.microsoft.com/downloads/)
    * Download and Install the [GitHub plugin for Visual Studio](https://visualstudio.github.com/)
    * Obtain a copy of this repository. You can click Open in Visual Studio, download it, or open it through the plugin in VS.
    * Open the code in Visual Studio by clicking on its solution (.sln) file.

### After a Coffee Break

2. Installing the NuGet Package
    * Open the NuGet Package Source ` Tools > NuGet Package Manager > Package Manager Settings > Package Sources`
    * Click the green button to add a new package source
    * Select the new source, labelled Package source
    * Change the Name to Self-Help Library, or something memorable
    * Update the Source to wherever you stored the SelfHelpAtWoosterManagerLibrary.#.#.#.nupkg (the #s indicate the version)
    * Click OK
    * Open the NuGet Package Manager ` Tools > NuGet Package Manager > Manage NuGet packages for Solution`
    * Look for the Package source combo-box. Select the new Package Source you just made.
    * Under Browse, you should see the package `SelfHelpAtWoosterManagerLibrary` > click on it
    * Press Install and go through the details or dialogs to accept.
    * You're Ready to Go!
    
### More Coffee

1.

### Usage


