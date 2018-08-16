using System;
using System.IO;

namespace SelfHelpOpenSourceEditor
{
    public static class Program
    {
        public static string SourceCode { get { return Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.FullName; } }

        private static readonly Action operationCancelled = new Action(() => PrintCentered("Operation Cancelled!"));

        public enum METHODS
        {
            Init,
            Scriptid,
            CreateProject,
            Downloadselfhelp,
            Download,
            DownloadVersion,
            Upload,
            UploadAndVersion,
            CreateFile,
            CreateManifest,
            CreateVersion,
            CreateVersionUpdateDeployment,
            DeployTest,
            SyncDeployTest,
            SyncDeployLive,
            ListVersions,
            ChangeDeploymentVersionNum,
            ClearConsole,
            Logout,
            Exit
        }

        public static string GetDescription(METHODS M)
        {
            switch (M)
            {
                case METHODS.Init:
                    return "Login/ Initialize";
                case METHODS.Scriptid:
                    return "Provide Project Script ID";
                case METHODS.CreateProject:
                    return "Create A New Project";
                case METHODS.Downloadselfhelp:
                    return "Download Self-Help Source Code Files";
                case METHODS.Download:
                    return "Download Your Source Code";
                case METHODS.DownloadVersion:
                    return "Download Your Source Code for Version";
                case METHODS.Upload:
                    return "Upload Your Changes";
                case METHODS.UploadAndVersion:
                    return "Upload Changes w/ New Version";
                case METHODS.CreateFile:
                    return "Create Source Code File";
                case METHODS.CreateManifest:
                    return "Create Manifest File (appsscript.json)";
                case METHODS.CreateVersion:
                    return "Create New Version";
                case METHODS.CreateVersionUpdateDeployment:
                    return "Create New Version and Update Deployment";
                case METHODS.DeployTest:
                    return "Deploy for Testing";
                case METHODS.SyncDeployTest:
                    return "Sync and Deploy for Testing";
                case METHODS.SyncDeployLive:
                    return "Sync and Deploy for Live Version";
                case METHODS.ListVersions:
                    return "List Your Project's Version History";
                case METHODS.ChangeDeploymentVersionNum:
                    return "Change Deployment's Assoc. Version Number";
                case METHODS.ClearConsole:
                    return "Clear the Console";
                case METHODS.Logout:
                    return "Logout/ Remove Credentials";
                case METHODS.Exit:
                    return "Exit";
                default:
                    return "";
            }
        }

        public static void PrintCentered(string Text)
        {
            Console.WriteLine(string.Format("{0," + ((Console.WindowWidth / 2) + (Text.Length / 2)) + "}", Text));
            Console.ForegroundColor = ConsoleColor.Cyan;
        }

        public static void PrintErrorCentered(string Text)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine(string.Format("{0," + ((Console.WindowWidth / 2) + (Text.Length / 2)) + "}", Text));
            Console.ForegroundColor = ConsoleColor.Cyan;
        }

        public static bool PrintAgain = true;

        public static void Main()
        {
            Console.Title = "Self Help Open Source Editor Client";
            Console.SetWindowSize(Console.LargestWindowWidth * 2 / 3, Console.LargestWindowHeight * 2 / 3);
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.BackgroundColor = ConsoleColor.Black;

            PrintCentered("Welcome To The Self-Help Open Source Editor Client!");
            PrintCentered("You may use this application to manage your own Self-Help Client");
            PrintCentered("Please follow all instructions exactly to ensure you don't lose your code!");
            PrintCentered("By using this application, you agree to its code of conduct and license:");
            PrintCentered("https://docs.google.com/document/d/1TiT9CXUkvVxP8DQyyVfhkz1adzftrbIYvWgYzScaQ8U/edit?usp=sharing\n");

            LibraryController.InitializeLibrary();

            int? version = null;

            while (true)
            {
                switch (getMethod())
                {
                    case METHODS.Init:
                        LibraryController.InitializeLibrary();
                        break;
                    case METHODS.Scriptid:
                        PrintCentered("Find your Script ID at File->Project properties->Script ID");
                        PrintCentered("Please paste your Google Apps Script Script ID Below:");
                        getInput(LibraryController.ProvideScriptID);
                        break;
                    case METHODS.CreateProject:
                        PrintCentered("Enter a name for your new project below:");
                        getInput(LibraryController.CreateGASProject);
                        break;
                    case METHODS.Downloadselfhelp:
                        getConfirmInput(LibraryController.DownloadSelfHelpSourceCode,
                        "This will download the source code of the Self-Help program (not your project).", "This action will overwrite files of the same name in your solution.", "Are you sure?");
                        break;
                    case METHODS.Download:
                        getConfirmInput(LibraryController.DownloadFiles,
                        "This will download your project's source code, which will overwrite files of the same name in your solution.", "Are you sure?");
                        break;
                    case METHODS.DownloadVersion:
                        if (LibraryController.ListProjectVersions())
                        {
                            PrintCentered("Enter a version number:");
                            version = getIntInput();
                            if (version != null)
                            {
                                if (LibraryController.VersionFound(version.Value))
                                {
                                    getConfirmInput(() => LibraryController.DownloadFilesVersion(version.Value),
                                    "This will download your project's source code for this specific version.", "This action will overwrite files of the same name in your solution.", "Are you sure ?");
                                }
                                else
                                {
                                    PrintCentered("Could not find the specified version!");
                                }
                            }
                        }
                        break;
                    case METHODS.Upload:
                        getConfirmInput(() => LibraryController.UploadFiles(),
                        "This will upload current Source Code folder to your Apps Script project.", "This will overwrite your work within GAS. Are you sure?");
                        break;
                    case METHODS.UploadAndVersion:
                        if (getConfirmInput("This will upload current Source Code folder to your Apps Script project.", "This will overwrite your work within GAS. Are you sure?"))
                        {
                            goto case METHODS.CreateVersion;
                        }
                        break;
                    case METHODS.CreateFile:
                        PrintCentered("1 to create a server-side Javascript file (.js)");
                        PrintCentered("2 to create a html file (.html)");
                        version = getIntInput();
                        if (version != null)
                        {
                            SelfHelpManager.AppsScriptsSourceCodeManager.FILE_TYPES? f = null;
                            if (version == 1)
                                f = SelfHelpManager.AppsScriptsSourceCodeManager.FILE_TYPES.SERVER_JS;
                            else if (version == 2)
                                f = SelfHelpManager.AppsScriptsSourceCodeManager.FILE_TYPES.HTML;
                            else if (version == 3)
                                PrintCentered("Please use create manifest to generate an appsscript.json file");

                            if (f != null)
                            {
                                PrintCentered("Enter a non-empty new file name.");
                                string name = getInput();
                                if (name != null)
                                {
                                    bool sync = getConfirmInput("Do you also want to upload your changes + the new file?");
                                    LibraryController.CreateSourceCodeFile(name, f.Value, sync);
                                }
                            }
                        }
                        break;
                    case METHODS.CreateManifest:
                        LibraryController.CreateManifestFile();
                        break;
                    case METHODS.CreateVersion:
                        PrintCentered("Enter a non-empty description for this version:");
                        getInput((s) => LibraryController.CreateNewVersion(s));
                        break;
                    case METHODS.CreateVersionUpdateDeployment:
                        getInput();
                        break;
                    case METHODS.DeployTest:
                        LibraryController.DeployForTesting();
                        break;
                    case METHODS.SyncDeployTest:
                        LibraryController.SyncAndDeployForTesting();
                        break;
                    case METHODS.SyncDeployLive:
                        getInput(LibraryController.SyncAndDeployForLiveVersion);
                        break;
                    case METHODS.ListVersions:
                        LibraryController.ListProjectVersions();
                        break;
                    case METHODS.ChangeDeploymentVersionNum:
                        if (LibraryController.ListProjectVersions())
                        {
                            PrintCentered("Please enter a version for your web-app to use.");
                            version = getIntInput();
                            if (version != null)
                                LibraryController.DownloadFilesVersion(version.Value);
                        }
                        break;
                    case METHODS.ClearConsole:
                        Console.Clear();
                        LibraryController.DisplayInfo();
                        printQuestionBox();
                        break;
                    case METHODS.Logout:
                        Console.Clear();
                        LibraryController.ClearCredentials();
                        break;
                    case METHODS.Exit:
                        Environment.Exit(0);
                        break;
                }

                PrintAgain = false;
            }
        }

        private static readonly Array methods = Enum.GetValues(typeof(METHODS));

        private static METHODS getMethod()
        {
            if (PrintAgain)
                printQuestionBox();

            int answer = -1;
            while (true)
            {
                Console.ForegroundColor = ConsoleColor.White;
                if (int.TryParse(Console.ReadLine(), out answer))
                {
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    return (METHODS)answer;
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    PrintCentered("Invalid selection. Please use a number!");
                }
            }
        }

        private const int bufferSpace = 44;
        //hyphen, choice
        private const int otherSpace = 3 + 1;

        //total choice + middle + walls
        private const int totalSpace = ((bufferSpace + otherSpace) * 2) + 3 + 2 + 2;

        private static string hyphen(int i) => i < 10 ? "---" : "--";

        private static void printQuestionBox()
        {
            System.Text.StringBuilder buffer = new System.Text.StringBuilder("+");
            for (int spacing = 1; spacing < totalSpace; spacing++)
            {
                if (spacing == (totalSpace - 1) / 2 || spacing == totalSpace - 1)
                    buffer.Append("+");
                else
                    buffer.Append("=");
            }
            string box = buffer.ToString();
            PrintCentered(box);
            for (int i = 0; i < methods.Length; i++)
            {
                METHODS method = (METHODS)methods.GetValue(i);

                string des = GetDescription(method);
                buffer.Clear();
                for (int spacing = 0; spacing < bufferSpace - des.Length; spacing++)
                    buffer.Append("—");

                string column1 = string.Format("| {0}{1}{2}{3} |", i, hyphen(i), buffer.ToString(), GetDescription(method));
                i++;

                if (i < methods.Length)
                {
                    method = (METHODS)methods.GetValue(i);
                    des = GetDescription(method);
                    buffer.Clear();
                    for (int spacing = 0; spacing < bufferSpace - des.Length; spacing++)
                        buffer.Append("-");
                    PrintCentered(string.Format("{4} {2}{3}{1}{0} |", i, hyphen(i), GetDescription(method), buffer.ToString(), column1));
                    buffer.Clear();
                    //Prints in-between spacing
                    for (int spacing = 0; spacing < bufferSpace + otherSpace; spacing++)
                        buffer.Append(" ");
                    PrintCentered(string.Format("| {0} | {1} |", buffer.ToString(), buffer.ToString()));
                }
                else
                {
                    des = "";
                    buffer.Clear();
                    for (int spacing = 0; spacing < bufferSpace - des.Length; spacing++)
                        buffer.Append(" ");

                    PrintCentered(string.Format("{1}      {0}|", buffer.ToString(), column1));
                }
            }
            PrintCentered(box);
        }

        private static string getInput()
        {
            Console.ForegroundColor = ConsoleColor.White;
            string s = Console.ReadLine();
            Console.ForegroundColor = ConsoleColor.Cyan;
            if (!string.IsNullOrEmpty(s))
                return s;
            operationCancelled();
            return null;
        }

        private static int? getIntInput()
        {
            Console.ForegroundColor = ConsoleColor.White;
            string s = Console.ReadLine();
            Console.ForegroundColor = ConsoleColor.Cyan;
            if (!string.IsNullOrEmpty(s) && int.TryParse(s, out int o))
                return o;
            operationCancelled();
            return null;
        }

        private static void getInput(Action<string> onComplete)
        {
            Console.ForegroundColor = ConsoleColor.White;
            string s = Console.ReadLine();
            Console.ForegroundColor = ConsoleColor.Cyan;
            if (!string.IsNullOrEmpty(s))
                onComplete(s);
            else
                operationCancelled();
        }

        private static bool getConfirmInput(params string[] warning)
        {
            foreach (string str in warning)
                PrintCentered(str);
            PrintCentered("1 or y => Yes, Otherwise => No");
            Console.ForegroundColor = ConsoleColor.White;
            string s = Console.ReadLine();
            Console.ForegroundColor = ConsoleColor.Cyan;
            if (s.Equals("1") || s.Equals("y"))
                return true;
            operationCancelled();
            return false;
        }

        private static void getConfirmInput(Action onComplete, params string[] warning)
        {
            foreach (string str in warning)
                PrintCentered(str);
            PrintCentered("1 or y => Yes, Otherwise => No");
            Console.ForegroundColor = ConsoleColor.White;
            string s = Console.ReadLine();
            Console.ForegroundColor = ConsoleColor.Cyan;
            if (s.Equals("1") || s.Equals("y"))
                onComplete();
            else
                operationCancelled();
        }
    }
}
