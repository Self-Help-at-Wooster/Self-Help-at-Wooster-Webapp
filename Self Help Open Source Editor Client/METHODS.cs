namespace SelfHelpOpenSourceEditor
{
    public static partial class Program
    {
        /// <summary>
        /// Defines all options to print
        /// Each of these corresponds to something in the LibraryController
        /// </summary>
        public enum METHODS
        {
            INIT,
            SCRIPT_ID,
            CREATE_PROJECT,
            DOWNLOAD_SELF_HELP,
            DOWNLOAD,
            DOWNLOAD_VERSION,
            UPLOAD,
            UPLOAD_AND_VERSION,
            CREATE_FILE,
            CREATE_MANIFEST,
            CREATE_VERSION,
            CREATE_VERSION_UPDATE_DEPLOYMENT,
            SYNC_DEPLOY_LIVE,
            LIST_VERSIONS,
            CHANGE_DEPLOYMENT_VERSION_NUM,
            CLEAR_CONSOLE,
            LOGOUT,
            EXIT
        }

        /// <summary>
        /// Contains each method, used for iteration.
        /// </summary>
        private static readonly System.Array methods = System.Enum.GetValues(typeof(METHODS));

        /// <summary>
        /// Gives a brief description of this function for the user
        /// </summary>
        /// <param name="M">The method you want info about.</param>
        /// <returns>String</returns>
        public static string GetDescription(METHODS M)
        {
            switch (M)
            {
                case METHODS.INIT:
                    return "Login/ Initialize";
                case METHODS.SCRIPT_ID:
                    return "Provide Project Script ID";
                case METHODS.CREATE_PROJECT:
                    return "Create A New Project";
                case METHODS.DOWNLOAD_SELF_HELP:
                    return "Download Self-Help Source Code Files";
                case METHODS.DOWNLOAD:
                    return "Download Your Source Code";
                case METHODS.DOWNLOAD_VERSION:
                    return "Download Your Source Code for Version";
                case METHODS.UPLOAD:
                    return "Upload Your Changes";
                case METHODS.UPLOAD_AND_VERSION:
                    return "Upload Changes w/ New Version";
                case METHODS.CREATE_FILE:
                    return "Create Source Code File";
                case METHODS.CREATE_MANIFEST:
                    return "Create Manifest File (appsscript.json)";
                case METHODS.CREATE_VERSION:
                    return "Create New Version";
                case METHODS.CREATE_VERSION_UPDATE_DEPLOYMENT:
                    return "Create New Version and Update Deployment";
                case METHODS.SYNC_DEPLOY_LIVE:
                    return "Sync and Deploy for Live Version";
                case METHODS.LIST_VERSIONS:
                    return "List Your Project's Version History";
                case METHODS.CHANGE_DEPLOYMENT_VERSION_NUM:
                    return "Change Deployment's Assoc. Version Number";
                case METHODS.CLEAR_CONSOLE:
                    return "Clear the Console";
                case METHODS.LOGOUT:
                    return "Logout/ Remove Credentials";
                case METHODS.EXIT:
                    return "Exit";
                default:
                    return "";
            }
        }
    }
}
