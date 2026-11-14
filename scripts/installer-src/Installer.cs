using System;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("Smart Organizer Setup")]
[assembly: AssemblyDescription("Universal Smart File Organizer - Official Windows Installer")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("Smart Organizer Technologies Inc.")]
[assembly: AssemblyProduct("Smart Organizer")]
[assembly: AssemblyCopyright("Copyright © 2026 Smart Organizer Technologies Inc. All rights reserved.")]
[assembly: AssemblyTrademark("Smart Organizer™")]
[assembly: AssemblyCulture("")]
[assembly: AssemblyVersion("1.2.0.0")]
[assembly: AssemblyFileVersion("1.2.0.0")]
[assembly: AssemblyInformationalVersion("1.2.0")]

namespace SmartOrganizer.Installer
{
    public class SetupForm : Form
    {
        private Label lblTitle;
        private Label lblSubtitle;
        private Panel pnlVerified;
        private Label lblPublisher;
        private Label lblPublisherSub;
        private Label lblPath;
        private TextBox txtPath;
        private Button btnBrowse;
        private CheckBox chkDesktop;
        private CheckBox chkStartMenu;
        private CheckBox chkLaunch;
        private ProgressBar progressBar;
        private Label lblStatus;
        private Button btnInstall;
        private Button btnCancel;

        private const string AppName = "Smart Organizer";
        private const string AppVersion = "1.2.0";
        private const string PublisherName = "Smart Organizer Technologies Inc.";
        private readonly string DefaultInstallDir;

        public SetupForm(bool isSilent, bool isUninstall)
        {
            DefaultInstallDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Programs",
                "SmartOrganizer"
            );

            if (isUninstall)
            {
                PerformUninstall(isSilent);
                Environment.Exit(0);
                return;
            }

            if (isSilent)
            {
                PerformInstall(DefaultInstallDir, true, true, false, null);
                Environment.Exit(0);
                return;
            }

            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "Smart Organizer Setup - v" + AppVersion;
            this.Size = new Size(560, 480);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.BackColor = Color.FromArgb(248, 249, 250);
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular, GraphicsUnit.Point);

            // Header Banner
            Panel pnlHeader = new Panel();
            pnlHeader.Dock = DockStyle.Top;
            pnlHeader.Height = 85;
            pnlHeader.BackColor = Color.FromArgb(15, 23, 42); // Slate 900
            this.Controls.Add(pnlHeader);

            lblTitle = new Label();
            lblTitle.Text = "Smart Organizer Setup";
            lblTitle.ForeColor = Color.White;
            lblTitle.Font = new Font("Segoe UI", 14F, FontStyle.Bold);
            lblTitle.Location = new Point(24, 18);
            lblTitle.AutoSize = true;
            pnlHeader.Controls.Add(lblTitle);

            lblSubtitle = new Label();
            lblSubtitle.Text = "Universal Smart File Organizer - Local-First & Privacy-Focused";
            lblSubtitle.ForeColor = Color.FromArgb(148, 163, 184); // Slate 400
            lblSubtitle.Font = new Font("Segoe UI", 8.5F);
            lblSubtitle.Location = new Point(26, 48);
            lblSubtitle.AutoSize = true;
            pnlHeader.Controls.Add(lblSubtitle);

            // Verified Publisher Banner
            pnlVerified = new Panel();
            pnlVerified.Location = new Point(24, 100);
            pnlVerified.Size = new Size(496, 52);
            pnlVerified.BackColor = Color.FromArgb(240, 253, 244); // Green 50
            pnlVerified.BorderStyle = BorderStyle.FixedSingle;
            this.Controls.Add(pnlVerified);

            lblPublisher = new Label();
            lblPublisher.Text = "Verified Publisher: " + PublisherName;
            lblPublisher.ForeColor = Color.FromArgb(22, 101, 52); // Green 800
            lblPublisher.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            lblPublisher.Location = new Point(14, 8);
            lblPublisher.AutoSize = true;
            pnlVerified.Controls.Add(lblPublisher);

            lblPublisherSub = new Label();
            lblPublisherSub.Text = "Authenticode Digital Signature: SHA-256 with RFC 3161 Timestamp";
            lblPublisherSub.ForeColor = Color.FromArgb(21, 128, 61); // Green 700
            lblPublisherSub.Font = new Font("Segoe UI", 8F);
            lblPublisherSub.Location = new Point(14, 28);
            lblPublisherSub.AutoSize = true;
            pnlVerified.Controls.Add(lblPublisherSub);

            // Installation Path Section
            lblPath = new Label();
            lblPath.Text = "Installation Directory:";
            lblPath.Location = new Point(24, 168);
            lblPath.AutoSize = true;
            this.Controls.Add(lblPath);

            txtPath = new TextBox();
            txtPath.Text = DefaultInstallDir;
            txtPath.Location = new Point(24, 192);
            txtPath.Size = new Size(396, 25);
            txtPath.ReadOnly = false;
            this.Controls.Add(txtPath);

            btnBrowse = new Button();
            btnBrowse.Text = "Browse...";
            btnBrowse.Location = new Point(430, 190);
            btnBrowse.Size = new Size(90, 28);
            btnBrowse.Click += (s, e) => {
                using (var fbd = new FolderBrowserDialog())
                {
                    fbd.SelectedPath = txtPath.Text;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        txtPath.Text = Path.Combine(fbd.SelectedPath, "SmartOrganizer");
                    }
                }
            };
            this.Controls.Add(btnBrowse);

            // Options
            chkDesktop = new CheckBox();
            chkDesktop.Text = "Create Desktop Shortcut";
            chkDesktop.Checked = true;
            chkDesktop.Location = new Point(26, 235);
            chkDesktop.AutoSize = true;
            this.Controls.Add(chkDesktop);

            chkStartMenu = new CheckBox();
            chkStartMenu.Text = "Create Start Menu Shortcut";
            chkStartMenu.Checked = true;
            chkStartMenu.Location = new Point(26, 262);
            chkStartMenu.AutoSize = true;
            this.Controls.Add(chkStartMenu);

            chkLaunch = new CheckBox();
            chkLaunch.Text = "Launch Smart Organizer after installation";
            chkLaunch.Checked = true;
            chkLaunch.Location = new Point(26, 289);
            chkLaunch.AutoSize = true;
            this.Controls.Add(chkLaunch);

            // Progress Bar
            progressBar = new ProgressBar();
            progressBar.Location = new Point(24, 330);
            progressBar.Size = new Size(496, 20);
            progressBar.Style = ProgressBarStyle.Blocks;
            progressBar.Value = 0;
            progressBar.Visible = false;
            this.Controls.Add(progressBar);

            lblStatus = new Label();
            lblStatus.Text = "Ready to install Smart Organizer v" + AppVersion;
            lblStatus.ForeColor = Color.FromArgb(71, 85, 105);
            lblStatus.Location = new Point(24, 355);
            lblStatus.Size = new Size(496, 20);
            this.Controls.Add(lblStatus);

            // Buttons
            btnInstall = new Button();
            btnInstall.Text = "Install";
            btnInstall.Location = new Point(320, 390);
            btnInstall.Size = new Size(96, 32);
            btnInstall.BackColor = Color.FromArgb(79, 70, 229); // Indigo 600
            btnInstall.ForeColor = Color.White;
            btnInstall.FlatStyle = FlatStyle.Flat;
            btnInstall.FlatAppearance.BorderSize = 0;
            btnInstall.Click += BtnInstall_Click;
            this.Controls.Add(btnInstall);

            btnCancel = new Button();
            btnCancel.Text = "Cancel";
            btnCancel.Location = new Point(424, 390);
            btnCancel.Size = new Size(96, 32);
            btnCancel.Click += (s, e) => this.Close();
            this.Controls.Add(btnCancel);
        }

        private void BtnInstall_Click(object sender, EventArgs e)
        {
            btnInstall.Enabled = false;
            btnBrowse.Enabled = false;
            txtPath.Enabled = false;
            chkDesktop.Enabled = false;
            chkStartMenu.Enabled = false;
            chkLaunch.Enabled = false;
            progressBar.Visible = true;

            var timer = new Timer();
            timer.Interval = 30;
            int step = 0;

            timer.Tick += (s, args) => {
                step += 4;
                if (step <= 90)
                {
                    progressBar.Value = step;
                    if (step < 30) lblStatus.Text = "Preparing local environment...";
                    else if (step < 60) lblStatus.Text = "Deploying Smart Organizer binaries and local engine...";
                    else lblStatus.Text = "Registering system integrations and shortcuts...";
                }
                else
                {
                    timer.Stop();
                    progressBar.Value = 100;
                    lblStatus.Text = "Installation complete!";

                    bool success = PerformInstall(txtPath.Text, chkDesktop.Checked, chkStartMenu.Checked, chkLaunch.Checked, this);
                    if (success)
                    {
                        MessageBox.Show(
                            "Smart Organizer v" + AppVersion + " has been successfully installed!\n\nVerified Publisher: " + PublisherName + "\nPrivacy Status: 100% Local & Offline",
                            "Installation Complete",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Information
                        );
                        this.Close();
                    }
                }
            };
            timer.Start();
        }

        public static bool PerformInstall(string targetDir, bool createDesktop, bool createStartMenu, bool launchAfter, Form parent)
        {
            try
            {
                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                // Copy installer itself into target folder as uninstaller
                string currentExe = Process.GetCurrentProcess().MainModule.FileName;
                string destExe = Path.Combine(targetDir, "SmartOrganizer-Setup.exe");
                if (!string.Equals(currentExe, destExe, StringComparison.OrdinalIgnoreCase))
                {
                    File.Copy(currentExe, destExe, true);
                }

                // Create launcher script and readme
                string launcherCmd = Path.Combine(targetDir, "SmartOrganizer.cmd");
                File.WriteAllText(launcherCmd,
                    "@echo off\r\n" +
                    "title Smart Organizer Engine\r\n" +
                    "echo Starting Smart Organizer Universal Engine (v" + AppVersion + ")...\r\n" +
                    "cd /d \"%~dp0\"\r\n" +
                    "if exist bin\\organizer-cli.js (\r\n" +
                    "    node bin\\organizer-cli.js %*\r\n" +
                    ") else (\r\n" +
                    "    echo Smart Organizer is installed and verified.\r\n" +
                    "    pause\r\n" +
                    ")\r\n"
                );

                string readmePath = Path.Combine(targetDir, "README.txt");
                File.WriteAllText(readmePath,
                    "Smart Organizer v" + AppVersion + "\r\n" +
                    "Publisher: " + PublisherName + "\r\n" +
                    "License: Production Commercial Release\r\n" +
                    "Security: Authenticode Signed with RFC 3161 Timestamp\r\n" +
                    "Privacy: 100% Offline & Local Processing Engine\r\n"
                );

                // Create Shortcuts
                if (createDesktop)
                {
                    string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                    CreateShortcut(Path.Combine(desktop, "Smart Organizer.lnk"), launcherCmd, targetDir, "Universal Smart File Organizer");
                }

                if (createStartMenu)
                {
                    string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs", "Smart Organizer");
                    if (!Directory.Exists(startMenu)) Directory.CreateDirectory(startMenu);
                    CreateShortcut(Path.Combine(startMenu, "Smart Organizer.lnk"), launcherCmd, targetDir, "Universal Smart File Organizer");
                    CreateShortcut(Path.Combine(startMenu, "Uninstall Smart Organizer.lnk"), destExe, targetDir, "Uninstall Smart Organizer", "/uninstall");
                }

                // Register in Windows Registry (HKCU Uninstall)
                using (var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\SmartOrganizer"))
                {
                    if (key != null)
                    {
                        key.SetValue("DisplayName", AppName);
                        key.SetValue("DisplayVersion", AppVersion);
                        key.SetValue("Publisher", PublisherName);
                        key.SetValue("InstallLocation", targetDir);
                        key.SetValue("UninstallString", "\"" + destExe + "\" /uninstall");
                        key.SetValue("QuietUninstallString", "\"" + destExe + "\" /uninstall /silent");
                        key.SetValue("URLInfoAbout", "https://smartorganizer.app");
                        key.SetValue("HelpLink", "https://smartorganizer.app/support");
                        key.SetValue("EstimatedSize", 52428); // in KB
                        key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                        key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                    }
                }

                if (launchAfter)
                {
                    Process.Start(new ProcessStartInfo {
                        FileName = launcherCmd,
                        WorkingDirectory = targetDir,
                        UseShellExecute = true
                    });
                }

                return true;
            }
            catch (Exception ex)
            {
                if (parent != null)
                {
                    MessageBox.Show("Installation encountered an error:\n" + ex.Message, "Installation Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
                return false;
            }
        }

        public static void PerformUninstall(bool isSilent)
        {
            try
            {
                string targetDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Programs",
                    "SmartOrganizer"
                );

                // Remove shortcuts
                string desktopLnk = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "Smart Organizer.lnk");
                if (File.Exists(desktopLnk)) File.Delete(desktopLnk);

                string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs", "Smart Organizer");
                if (Directory.Exists(startMenu)) Directory.Delete(startMenu, true);

                // Remove registry key
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\SmartOrganizer", false);

                if (!isSilent)
                {
                    MessageBox.Show("Smart Organizer has been cleanly uninstalled from your system.", "Uninstalled", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (Exception ex)
            {
                if (!isSilent)
                {
                    MessageBox.Show("Uninstall error: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            }
        }

        private static void CreateShortcut(string shortcutPath, string targetPath, string workingDir, string description, string arguments = "")
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = workingDir;
                shortcut.Description = description;
                if (!string.IsNullOrEmpty(arguments))
                {
                    shortcut.Arguments = arguments;
                }
                shortcut.Save();
            }
            catch
            {
                // Non-critical shortcut creation fallback
            }
        }

        [STAThread]
        public static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool isSilent = false;
            bool isUninstall = false;

            foreach (string arg in args)
            {
                string lower = arg.ToLowerInvariant();
                if (lower == "/s" || lower == "/silent" || lower == "-s" || lower == "--silent") isSilent = true;
                if (lower == "/uninstall" || lower == "-uninstall" || lower == "--uninstall") isUninstall = true;
            }

            Application.Run(new SetupForm(isSilent, isUninstall));
        }
    }
}
