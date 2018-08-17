using System;
using System.IO;

namespace SelfHelpOpenSourceEditor
{
    /// <summary>
    /// Console application that uses LibraryController to communicate with Google Apps Script API
    /// You can, and probably should modify this to your liking if it does not fit your needs.
    /// </summary>
    public static partial class Program
    {
        /// <summary>
        /// DO NOT MODIFY. This tells the library where to place code from your Google Apps Script!
        /// *note: This code escapes your bin/debug and uses your solution directory.
        /// </summary>
        public static string SourceCode { get { return Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.FullName; } }

        public static readonly ConsoleColor DisplayInstruction = ConsoleColor.Cyan;
        public static readonly ConsoleColor DisplayError = ConsoleColor.Red;
        public static readonly ConsoleColor UserInput = ConsoleColor.White;
        public static readonly ConsoleColor BackgroundColor;

        private static readonly Action operationCancelled = new Action(() => PrintErrorCentered("Operation Cancelled!"));

        public static void PrintCentered(string Text)
        {
            Console.WriteLine(string.Format("{0," + ((Console.WindowWidth / 2) + (Text.Length / 2)) + "}", Text));
            Console.ForegroundColor = DisplayInstruction;
        }

        public static void PrintErrorCentered(string Text)
        {
            Console.ForegroundColor = DisplayError;
            Console.WriteLine(string.Format("{0," + ((Console.WindowWidth / 2) + (Text.Length / 2)) + "}", Text));
            Console.ForegroundColor = DisplayInstruction;
        }

        /// <summary>
        /// Defines whether or not you want the program to keep printing instructions.
        /// This gets pretty cluttered quickly, so it's best to disable it frequently.
        /// </summary>
        public static bool PrintAgain = true;

        /// <summary>
        /// This feature is dangerous. Only use it if you really know what you're doing!
        /// </summary>
        public static readonly bool AutoSync = true;

        private static void printDefaultInfo()
        {
            PrintCentered("Welcome To The Self-Help Open Source Editor Client!");
            PrintCentered("You may use this application to manage your own Self-Help Client");
            PrintCentered("Please follow all instructions exactly to ensure you don't lose your code!");
            PrintCentered("By using this application, you agree to its code of conduct and license:");
            PrintCentered("https://docs.google.com/document/d/1TiT9CXUkvVxP8DQyyVfhkz1adzftrbIYvWgYzScaQ8U/edit?usp=sharing\n");
        }

        public static void Main()
        {
            #region DefaultInformation
            Console.Title = "Self Help Open Source Editor Client";
            Console.SetWindowSize(Console.LargestWindowWidth * 2 / 3, Console.LargestWindowHeight * 2 / 3);
            Console.ForegroundColor = DisplayInstruction;
            Console.BackgroundColor = BackgroundColor;

            printDefaultInfo();
            #endregion

            LibraryController.InitializeLibrary();
            LibraryController.GetWatchers();

            int? version = null;

            while (true)
            {
                switch (getMethod())
                {
                    case METHODS.INIT:
                        LibraryController.InitializeLibrary();
                        break;
                    case METHODS.SCRIPT_ID:
                        PrintCentered("Find your Script ID at File->Project properties->Script ID");
                        PrintCentered("Please paste your Google Apps Script Script ID Below:");
                        getInput(LibraryController.ProvideScriptID);
                        break;
                    case METHODS.CREATE_PROJECT:
                        PrintCentered("Enter a name for your new project below:");
                        getInput(LibraryController.CreateGASProject);
                        break;
                    case METHODS.DOWNLOAD_SELF_HELP:
                        getConfirmInput(LibraryController.DownloadSelfHelpSourceCode,
                        "This will download the source code of the Self-Help program (not your project).", "This action will overwrite files of the same name in your solution.", "Are you sure?");
                        break;
                    case METHODS.DOWNLOAD:
                        getConfirmInput(LibraryController.DownloadFiles,
                        "This will download your project's source code, which will overwrite files of the same name in your solution.", "Are you sure?");
                        break;
                    case METHODS.DOWNLOAD_VERSION:
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
                    case METHODS.UPLOAD:
                        getConfirmInput(() => LibraryController.UploadFiles(),
                        "This will upload current Source Code folder to your Apps Script project.", "This will overwrite your work within GAS. Are you sure?");
                        break;
                    case METHODS.UPLOAD_AND_VERSION:
                        if (getConfirmInput("This will upload current Source Code folder to your Apps Script project.", "This will overwrite your work within GAS. Are you sure?"))
                        {
                            goto case METHODS.CREATE_VERSION;
                        }
                        break;
                    case METHODS.CREATE_FILE:
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
                    case METHODS.CREATE_MANIFEST:
                        LibraryController.CreateManifestFile();
                        break;
                    case METHODS.CREATE_VERSION:
                        PrintCentered("Enter a non-empty description for this version:");
                        getInput((s) => LibraryController.CreateNewVersion(s));
                        break;
                    case METHODS.CREATE_VERSION_UPDATE_DEPLOYMENT:
                        getInput();
                        break;
                    case METHODS.DEPLOY_TEST:
                        LibraryController.DeployForTesting();
                        break;
                    case METHODS.SYNC_DEPLOY_TEST:
                        LibraryController.SyncAndDeployForTesting();
                        break;
                    case METHODS.SYNC_DEPLOY_LIVE:
                        PrintCentered("Enter a non-empty description for this version:");
                        getInput(LibraryController.SyncAndDeployForLiveVersion);
                        break;
                    case METHODS.LIST_VERSIONS:
                        LibraryController.ListProjectVersions();
                        break;
                    case METHODS.CHANGE_DEPLOYMENT_VERSION_NUM:
                        if (LibraryController.ListProjectVersions())
                        {
                            PrintCentered("Please enter a version for your web-app to use.");
                            version = getIntInput();
                            if (version != null)
                                LibraryController.DownloadFilesVersion(version.Value);
                        }
                        break;
                    case METHODS.CLEAR_CONSOLE:
                        Console.Clear();
                        Console.ForegroundColor = DisplayInstruction;
                        LibraryController.DisplayInfo();
                        printQuestionBox();
                        break;
                    case METHODS.LOGOUT:
                        Console.Clear();
                        LibraryController.ClearCredentials();
                        printQuestionBox();
                        break;
                    case METHODS.EXIT:
                        Environment.Exit(0);
                        break;
                }

                PrintAgain = false;
                if (AutoSync)
                    LibraryController.GetWatchers();
            }
        }

        private static METHODS getMethod()
        {
            if (PrintAgain)
                printQuestionBox();

            int answer = -1;
            while (true)
            {
                Console.ForegroundColor = UserInput;
                string typed = Console.ReadLine();
                if (int.TryParse(typed, out answer))
                {
                    Console.ForegroundColor = DisplayInstruction;
                    return (METHODS)answer;
                }
                else
                {
                    if (string.IsNullOrEmpty(typed))
                        return METHODS.CLEAR_CONSOLE;
                    Console.ForegroundColor = DisplayInstruction;
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

        /// <summary>
        /// A rather ridiculous function to pretty print a selection box for the user.
        /// </summary>
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
            Console.ForegroundColor = UserInput;
            string s = Console.ReadLine();
            Console.ForegroundColor = DisplayInstruction;
            if (!string.IsNullOrEmpty(s))
                return s;
            operationCancelled();
            return null;
        }

        private static int? getIntInput()
        {
            Console.ForegroundColor = UserInput;
            string s = Console.ReadLine();
            Console.ForegroundColor = DisplayInstruction;
            if (!string.IsNullOrEmpty(s) && int.TryParse(s, out int o))
                return o;
            operationCancelled();
            return null;
        }

        private static void getInput(Action<string> onComplete)
        {
            Console.ForegroundColor = UserInput;
            string s = Console.ReadLine();
            Console.ForegroundColor = DisplayInstruction;
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
            Console.ForegroundColor = UserInput;
            string s = Console.ReadLine();
            Console.ForegroundColor = DisplayInstruction;
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
            Console.ForegroundColor = UserInput;
            string s = Console.ReadLine();
            Console.ForegroundColor = DisplayInstruction;
            if (s.Equals("1") || s.Equals("y"))
                onComplete();
            else
                operationCancelled();
        }
    }
}
