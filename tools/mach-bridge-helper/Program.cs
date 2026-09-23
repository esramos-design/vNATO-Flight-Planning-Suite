using System.Net;
using System.Text;
using System.Text.Json;
using SimConnect.NET;

namespace vNATO.MachBridge;

internal static class Program
{
    private const string Prefix = "http://127.0.0.1:8765/";
    private static readonly SemaphoreSlim SimGate = new(1, 1);
    private static SimConnectClient? _client;
    private static DateTimeOffset _lastConnectAttempt = DateTimeOffset.MinValue;

    [STAThread]
    private static async Task Main()
    {
        using var mutex = new Mutex(true, "Local\\vNATO.MachBridge.Singleton", out var createdNew);
        if (!createdNew) return;

        using var listener = new HttpListener();
        listener.Prefixes.Add(Prefix);
        try { listener.Start(); } catch { return; }

        while (listener.IsListening)
        {
            HttpListenerContext context;
            try { context = await listener.GetContextAsync(); }
            catch { break; }
            _ = Task.Run(() => HandleAsync(context));
        }
    }

    private static async Task HandleAsync(HttpListenerContext context)
    {
        ApplyCors(context.Response);

        if (context.Request.HttpMethod.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = 204;
            context.Response.Close();
            return;
        }

        var path = context.Request.Url?.AbsolutePath?.TrimEnd('/') ?? "";
        if (path is not "" and not "/telemetry" and not "/health")
        {
            await WriteJsonAsync(context.Response, 404, new { ok = false, error = "not found" });
            return;
        }

        if (path == "/health")
        {
            await WriteJsonAsync(context.Response, 200, new { ok = true, source = "VNATO_MACH_BRIDGE", version = "0.1.0" });
            return;
        }

        try
        {
            var client = await GetConnectedClientAsync();
            if (client is null)
            {
                await WriteJsonAsync(context.Response, 503, new
                {
                    ok = false,
                    source = "MSFS_SIMCONNECT",
                    error = "MSFS SimConnect is not available. Start MSFS and load into an aircraft.",
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() / 1000.0
                });
                return;
            }

            var mach = await SafeGetAsync(client, "AIRSPEED MACH", "mach");
            var tas = await SafeGetAsync(client, "AIRSPEED TRUE", "knots");
            var ias = await SafeGetAsync(client, "AIRSPEED INDICATED", "knots");
            var altitude = await SafeGetAsync(client, "PLANE ALTITUDE", "feet");

            await WriteJsonAsync(context.Response, 200, new
            {
                ok = true,
                source = "MSFS_SIMCONNECT",
                mach,
                tas_knots = tas,
                ias_knots = ias,
                altitude_ft = altitude,
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() / 1000.0
            });
        }
        catch (Exception ex)
        {
            ResetClient();
            await WriteJsonAsync(context.Response, 500, new
            {
                ok = false,
                source = "MSFS_SIMCONNECT",
                error = ex.Message,
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() / 1000.0
            });
        }
    }

    private static async Task<SimConnectClient?> GetConnectedClientAsync()
    {
        await SimGate.WaitAsync();
        try
        {
            if (_client is not null) return _client;
            if (DateTimeOffset.UtcNow - _lastConnectAttempt < TimeSpan.FromSeconds(2)) return null;

            _lastConnectAttempt = DateTimeOffset.UtcNow;
            var candidate = new SimConnectClient();
            try
            {
                await candidate.ConnectAsync();
                _client = candidate;
                return _client;
            }
            catch
            {
                candidate.Dispose();
                return null;
            }
        }
        finally { SimGate.Release(); }
    }

    private static async Task<double?> SafeGetAsync(SimConnectClient client, string name, string unit)
    {
        try
        {
            var value = await client.SimVars.GetAsync<double>(name, unit);
            return double.IsFinite(value) ? value : null;
        }
        catch { return null; }
    }

    private static void ResetClient()
    {
        try { _client?.Dispose(); } catch { }
        _client = null;
    }

    private static void ApplyCors(HttpListenerResponse response)
    {
        response.Headers["Access-Control-Allow-Origin"] = "*";
        response.Headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
        response.Headers["Access-Control-Allow-Headers"] = "Content-Type";
        response.Headers["Access-Control-Allow-Private-Network"] = "true";
        response.Headers["Cache-Control"] = "no-store";
    }

    private static async Task WriteJsonAsync(HttpListenerResponse response, int statusCode, object payload)
    {
        response.StatusCode = statusCode;
        response.ContentType = "application/json; charset=utf-8";
        var bytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload));
        response.ContentLength64 = bytes.Length;
        await response.OutputStream.WriteAsync(bytes);
        response.Close();
    }
}
