# vNATO MSFS Mach Bridge Helper

Windows helper for the Virtual NATO Flight Planning Suite Oceanic page.

## Purpose

The helper connects locally to Microsoft Flight Simulator through SimConnect and exposes read-only telemetry on:

- `http://127.0.0.1:8765/health`
- `http://127.0.0.1:8765/telemetry`

It binds only to localhost and does not expose aircraft-control commands.

## Telemetry

- Mach
- true airspeed
- indicated airspeed
- altitude
- UTC timestamp

## Build

```powershell
dotnet restore
dotnet publish -c Release -r win-x64 --self-contained true -o installer/publish
```

Compile `installer/vNATO-Mach-Bridge.iss` with Inno Setup for the per-user installer.

## Code signing

The GitHub Actions build supports optional Authenticode signing when repository signing secrets are configured. Unsigned Alpha builds are development/test builds only.

## Dependency

This project currently uses `SimConnect.NET` 0.2.2 under its MIT licence as the managed SimConnect wrapper. It is an independent third-party component.

## Security model

- localhost only
- per-user installation
- no administrator rights
- no Windows service
- no startup task
- one running instance
- read-only simulator telemetry
