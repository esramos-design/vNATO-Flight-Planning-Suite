#define MyAppName "vNATO MSFS Mach Bridge"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "Virtual NATO"
#define MyAppExeName "vNATO.MachBridge.exe"

[Setup]
AppId={{8FDD1E8A-8B83-4C53-95F2-5E6D0C0E5C41}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={localappdata}\vNATO\MachBridge
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir=output
OutputBaseFilename=vNATO-Mach-Bridge-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\{#MyAppExeName}

[Files]
Source: "publish\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion

[Registry]
Root: HKCU; Subkey: "Software\Classes\vnato-mach"; ValueType: string; ValueName: ""; ValueData: "URL:vNATO MSFS Mach Bridge"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\vnato-mach"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""
Root: HKCU; Subkey: "Software\Classes\vnato-mach\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Start vNATO Mach Bridge"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "{cmd}"; Parameters: "/C taskkill /IM ""{#MyAppExeName}"" /F >NUL 2>&1"; Flags: runhidden; RunOnceId: "StopMachBridge"
