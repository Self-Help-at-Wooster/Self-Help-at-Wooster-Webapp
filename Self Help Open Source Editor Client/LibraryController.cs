﻿using SelfHelpSourceCodeManager;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using static SelfHelpOpenSourceEditor.Program;

namespace SelfHelpOpenSourceEditor
{
    /// <summary>
    /// <para>
    /// This class is used to interface with the SelfHelpManager library.
    /// This class' implementation really should not be modified to ensure the program handles your code smoothly.
    /// </para>
    /// <para>
    /// The methods contained within this class are wrapped in Try-Catch statements to prevent any (unlikely) errors from
    /// propagating to the program.
    /// These 
    /// </para>
    /// </summary>
    public static class LibraryController
    {
        /// <summary>
        /// Stores the versions found of your script project.
        /// </summary>
        private static List<Google.Apis.Script.v1.Data.Version> versions;

        /// <summary>
        /// Determines whether or not the given version number corresponds to an actual version.
        /// </summary>
        /// <param name="VersionNumber">The exact version number you are attempting to use</param>
        /// <returns>Boolean result</returns>
        public static bool VersionFound(int VersionNumber)
        {
            return versions?.Find(v => v.VersionNumber == VersionNumber) != null;
        }

        private static List<System.IO.FileSystemWatcher> watchers;

        private static bool busyAutoUploading;

        public static void GetWatchers()
        {
            if (AutoSync && watchers == null)
            {
                watchers = SelfHelpManager.GetWatchers();

                watchers?.ForEach(fw =>
                {
                    fw.NotifyFilter = System.IO.NotifyFilters.LastWrite;
                    fw.Changed += fw_Changed;

                    fw.EnableRaisingEvents = true;
                });
            }
        }

        public static void SetHTMLScriptParse()
        {
            SelfHelpManager.ParseHTMLScriptTagToJS = ParseScriptTag;
        }


        private static readonly object lockObj = new object();
        private static TimeSpan autoUploadTimeout = TimeSpan.FromMilliseconds(500);

        private static void fw_Changed(object sender, System.IO.FileSystemEventArgs e)
        {
            if (System.Threading.Monitor.TryEnter(lockObj, autoUploadTimeout))
            {
                try
                {
                    if (!busyAutoUploading && AutoSync)
                    {
                        watchers.ForEach(fw => fw.EnableRaisingEvents = false);

                        if (!busyAutoUploading)
                        {
                            Debug.WriteLine("Auto Uploading...");

                            busyAutoUploading = true;
                            if (UploadFiles())
                                PrintCentered("Auto Upload Complete!");
                            else
                                PrintCentered("Auto Upload Failed. Try again.");
                            busyAutoUploading = false;
                            watchers.ForEach(fw => fw.EnableRaisingEvents = true);
                        }

                    }
                }
                finally
                {
                    // Ensure that the lock is released.
                    System.Threading.Monitor.Exit(lockObj);
                }
            }

        }

        /// <summary>
        /// Determines whether or not to display error or normal result
        /// </summary>
        /// <param name="str">String of task result</param>
        /// <param name="success">Bool indicating its success</param>
        private static void printTaskResult(string str, bool success)
        {
            if (success)
                PrintCentered(str);
            else
                PrintErrorCentered(str);
        }

        public static void InitializeLibrary()
        {
            try
            {
                var res = SelfHelpManager.Initialize(SourceCode).Result;
                printTaskResult(res.ToString(), res.IsSuccess);
                DisplayInfo();
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
            }
        }

        public static void DisplayInfo()
        {
            try
            {
                foreach (string str in SelfHelpManager.GetScriptInfo())
                    PrintCentered(str);
            }
            catch (Exception ex) { Debug.WriteLine(ex); }
        }

        public static void ProvideScriptID(string ID)
        {
            try
            {
                SelfHelpManager.ScriptID = ID;
                PrintCentered("Success!");
            }
            catch (SelfHelpManager.InfoException ex)
            {
                PrintAgain = false;
                PrintErrorCentered(ex.Message);
            }
        }

        public static void CreateGASProject(string Name)
        {
            try
            {
                var res = SelfHelpManager.CreateNewGASProject(Name).Result;
                printTaskResult(res.ToString(), res.IsSuccess);
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
            }
        }

        public static void DownloadFiles()
        {
            try
            {
                var res = SelfHelpManager.DownloadFiles().Result;
                printTaskResult(res.ToString(), res.IsSuccess);
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
            }
        }

        public static void DownloadFilesVersion(int VersionNumber)
        {
            try
            {
                var res = SelfHelpManager.DownloadFiles(VersionNumber).Result;
                printTaskResult(res.ToString(), res.IsSuccess);
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
            }
        }

        public static bool UploadFiles()
        {
            try
            {
                var res = SelfHelpManager.SyncChanges().Result;
                printTaskResult(res.ToString(), res.IsSuccess);
                return res.IsSuccess;
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
                return false;
            }
        }

        public static bool VersionBackupThenUploadFiles()
        {
            try
            {
                var res = SelfHelpManager.PreVersionAndSyncChanges().Result;
                printTaskResult(res.ToString(), res.IsSuccess);
                return res.IsSuccess;
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
                return false;
            }
        }

        public static void DownloadSelfHelpSourceCode()
        {
            try
            {
                var res = SelfHelpManager.DownloadSelfHelpSourceFiles().Result;
                printTaskResult(res.ToString(), res.IsSuccess);
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
            }
        }

        public static void CreateSourceCodeFile(string Name, SelfHelpManager.FILE_TYPES F, bool Sync)
        {
            try
            {
                var res = SelfHelpManager.AddNewSourceFile(Name, F, Sync).Result;
                printTaskResult(res.ToString(), res.IsSuccess);
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
            }
        }

        public static void CreateManifestFile()
        {
            try
            {
                var res = SelfHelpManager.CreateNewAppsScriptManifestJSONFile().Result;
                printTaskResult(res.ToString(), res.IsSuccess);
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
            }
        }

        public static bool CreateNewVersion(string Description)
        {
            try
            {
                var res = SelfHelpManager.CreateVersion(Description).Result;
                printTaskResult(res.ToString(), res.IsSuccess);
                return res.IsSuccess;
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
                return false;
            }
        }

        public static bool CreateNewVersionAndUpdateDeployment(string Description)
        {
            try
            {
                var res = SelfHelpManager.CreateNewVersionAndUpdateDeployment(Description).Result;
                printTaskResult(res.ToString(), res.IsSuccess);
                return res.IsSuccess;
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
                return false;
            }
        }

        public static void SyncAndDeployForLiveVersion(string Description)
        {
            if (UploadFiles() && CreateNewVersionAndUpdateDeployment(Description))
                PrintCentered("Operation Successful!");
        }

        /// <summary>
        /// Lists the versions of your project
        /// </summary>
        /// <returns>Boolean representing the success of this execution.</returns>
        public static bool ListProjectVersions()
        {
            try
            {
                var result = SelfHelpManager.ListVersions().Result;
                if (result.IsSuccess)
                {
                    versions = result.MyResult;
                    result.MyResult?.ForEach(v => PrintCentered(string.Format(" Version #{0}, Create Time {1}, Description {2}", v.VersionNumber, v.CreateTime, v.Description)));
                    return true;
                }
                else
                {
                    PrintErrorCentered(result.AdditionalInformation);
                    return false;
                }
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
                return false;
            }
        }

        public static void UpdateDeploymentVersionNumber(int VersionNumber)
        {
            try
            {
                var res = SelfHelpManager.UpdateDeploymentVersionNumber(VersionNumber).Result;
                printTaskResult(res.ToString(), res.IsSuccess);
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
            }
        }

        public static void ClearCredentials()
        {
            try
            {
                var res = SelfHelpManager.ClearCredentials().Result;
                printTaskResult(res.ToString(), res.IsSuccess);
            }
            catch (Exception ex)
            {
                PrintErrorCentered(ex.Message);
            }
        }
    }
}
