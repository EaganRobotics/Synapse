#define MyAppName "Reefscape RL"
#define MyAppVersion "1.3.2"
#define MyAppPublisher "Synapse contributors"
#define MyAppExeName "ReefscapeRL.exe"

[Setup]
AppId={{A7F06B52-39B5-4B4F-9B7C-3C489BA24396}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\Reefscape RL
DefaultGroupName=Reefscape RL
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=..\builds
OutputBaseFilename=ReefscapeRL-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
VersionInfoVersion=1.3.2.0
VersionInfoProductVersion=1.3.2.0

[Dirs]
Name: "{app}"; Permissions: users-modify

[Files]
Source: "..\builds\ReefscapeRL\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Reefscape RL"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"
Name: "{autodesktop}\Reefscape RL"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"
[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch Reefscape RL"; Flags: nowait postinstall skipifsilent; WorkingDir: "{app}"
