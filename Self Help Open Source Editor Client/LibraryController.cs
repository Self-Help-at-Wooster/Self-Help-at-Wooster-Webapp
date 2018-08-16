using SelfHelpManager;
using System;
using System.Collections.Generic;
using static Source_Code_Project.Program;

namespace Source_Code_Project
{
    public static class LibraryController
    {
        public static void InitializeLibrary()
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.Initialize(SourceCode).Result;
                PrintCentered(res.MyResult);
                DisplayInfo();
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void DisplayInfo()
        {
            foreach (string str in AppsScriptsSourceCodeManager.GetScriptInfo())
                PrintCentered(str);
        }

        public static void ProvideScriptID(string ID)
        {
            try
            {
                AppsScriptsSourceCodeManager.ScriptID = ID;
                PrintCentered("Success!");
            }
            catch (AppsScriptsSourceCodeManager.InfoException ex)
            {
                PrintAgain = false;
                PrintCentered(ex.Message);
            }
        }

        public static void CreateGASProject(string Name)
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.CreateNewGASProject(Name).Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void DownloadFiles()
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.DownloadFiles().Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void DownloadFilesVersion(int VersionNumber)
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.DownloadFiles(VersionNumber).Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void UploadFiles()
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.SyncChanges().Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void DownloadSelfHelpSourceCode()
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.DownloadSelfHelpSourceFiles().Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void CreateSourceCodeFile(string Name, AppsScriptsSourceCodeManager.FILE_TYPES F, bool Sync)
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.AddNewSourceFile(Name, F, Sync).Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void CreateManifestFile()
        {
            try
            {
                AppsScriptsSourceCodeManager.CreateNewAppsScriptManifestJSONFile().Wait();
                //PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void CreateNewVersion(string Description)
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.CreateVersion(Description).Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void CreateNewVersionAndUpdateDeployment(string Description)
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.CreateNewVersionAndUpdateDeployment(Description).Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void SyncAndDeployForTesting()
        {
            UploadFiles();
            DeployForTesting();
        }

        public static void SyncAndDeployForLiveVersion(string Description)
        {
            UploadFiles();
            CreateNewVersionAndUpdateDeployment(Description);
        }

        public static void DeployForTesting()
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.DeveloperUpdateDeployment().Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        private static List<Google.Apis.Script.v1.Data.Version> versions;

        public static bool VersionFound(int VersionNumber)
        {
            return versions?.Find(v => v.VersionNumber == VersionNumber) != null;
        }

        public static bool ListProjectVersions()
        {
            try
            {
                var result = AppsScriptsSourceCodeManager.ListVersions().Result;
                if (result.IsSuccess)
                {
                    versions = result.MyResult;
                    result.MyResult?.ForEach(v => PrintCentered(string.Format(" Version #{0}, Create Time {1}, Description {2}", v.VersionNumber, v.CreateTime, v.Description)));
                    return true;
                }
                else
                {
                    PrintCentered(result.AdditionalInformation);
                    return false;
                }
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
                return false;
            }
        }

        public static void UpdateDeploymentVersionNumber(int VersionNumber)
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.UpdateDeploymentVersionNumber(VersionNumber).Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }

        public static void ClearCredentials()
        {
            try
            {
                var res = AppsScriptsSourceCodeManager.ClearCredentials().Result;
                PrintCentered(res.MyResult);
            }
            catch (Exception ex)
            {
                PrintCentered(ex.Message);
            }
        }
    }
}
