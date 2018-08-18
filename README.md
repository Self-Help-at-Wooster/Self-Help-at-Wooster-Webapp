
<p align="center"><img src="https://image.ibb.co/fQ2igG/new_Self_Help_Logo.png" height="125" width="125"></p>

<h1 align="center"> Self-Help at Wooster Open Source Editor Client/ Webapp </h1>

### Discover how the Self-Help System at Wooster Webapp was created!
###  Edit and Modify it to your liking using the integrated client solution in Visual Studio IDE!

## Self-Help Webapp Source Code Resides in [Self Help Editor Client\SourceCode](https://github.com/Self-Help-at-Wooster/Self-Help-at-Wooster-Webapp/tree/master/Self%20Help%20Open%20Source%20Editor%20Client/SourceCode)

## First
  >[Enable the Google App Script API](https://script.google.com/home/usersettings)
  >Make sure you review the basic of Apps Web Apps(https://developers.google.com/apps-script/guides/web)
  >In particular, note the difference between the /exec and /dev URLS!

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
  
#### - Download the Self-Help Source Code

  You can easily access the [Source Code](https://github.com/Self-Help-at-Wooster/Self-Help-at-Wooster-Webapp/tree/master/Self%20Help%20Open%20Source%20Editor%20Client/SourceCode) from GitHub, but this feature easily allows you to download it directly from your app. It always comes from the current version reflected on the Self-Help website.

### Upload

#### - Upload your current changes

  Clears your Google App Script's current code and replaces it with your local source code.
  
#### - Upload for a new version

  Same as above, and creates a new version.
  
#### - Upload and Deploy for Live (#Sync-and-Deploy-for-Live-Version)

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

### Create Source Code Files

Creates a new HTML, Javascript, or JSON file with given name.
- Automatically places the file in the correct subdirectory
- Provides a basic code template in your file like on the Google App Scripts Edtior.
- The JSON file (aka [manifest](https://developers.google.com/apps-script/concepts/manifests)) is downloaded directly from the Self-Help source, because they can be a little confusing to understand.

### Versions and Deployments

#### - Automatic Webapp deployment and retrieval
    
    The library handles accessing your current Webapp and Head Deployments.
    > The Head is used to get the development URL
    > The Webapp Deployment is how you can deploy the project, if desired.
      The library will always use the latest webapp deployment. 
      
    > If this behavior is undesired, delete all unnecessary deployments through
      Google App Script project-->Publish--Deploy from Manifest-->Delete (only if there's more than one webapp).
      
#### - List your Version History      
    
    Lists all saved versions of your project. This function gets ran automatically when certain other functions require you to provide a version number. If you want to delete unused versions, you may at Google App Script project-->File-->Manage Versions
    
#### - Create New Version

  Creates a new version attached to the current copy of your source code on Google App Script. You can provide whatever name you want, but these are best used as incremental "commits," and not big feature backups. You can always download your project from a [specific version](#Download-any-versioned-copy-of-your-Source-Code) if needed, so the best philosophy here is early-and-oft!

#### - Create New Version and Update Deployment

  Creates a new version and attached your web-app's current deployment. This function first creates a new version, as above, then proceeds to update the deployment that your users see. Use this once a feature is completed/ tested and you want it deployed. 
  
#### - Change Deployment's Version Number

  Changes your web-app's current version number. Use this in the event that a newer version has affected the live functionality of your application.

#### - Sync and Deploy for Live Version

  This is a chained-call that first [uploads](#Upload) your source code, then creates a new version and updates the deployment, as specified above.




