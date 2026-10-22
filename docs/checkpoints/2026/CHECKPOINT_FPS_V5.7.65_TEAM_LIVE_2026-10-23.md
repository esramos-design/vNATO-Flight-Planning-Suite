# vNATO Flight Planning Suite — V5.7.65 TEAM LIVE checkpoint

Date: 23 October 2026
Chat sequence: vNATO FPS 04 — V5.7.65 Post-LIVE & Future Development

## Verified release
- Official production URL: https://fpl.virtual-nato.org
- TEAM LIVE repository: esramos-design/vNATO-Flight-Planning-Suite
- Production commit: fb3c9def70ef6b37a0ffc29fccd49cb9aa242762
- Production entrypoint: index.html, js/app-shell.obf.js?v=5765
- Production JS remains encoded as the established Base64 production shell.
- Cloudflare Pages project: vnato-flight-planning-suite
- Cloudflare production deployment: success, commit fb3c9def70ef6b37a0ffc29fccd49cb9aa242762.
- Previously approved TEAM LIVE release: V5.7.64, commit 6e2bf3f2572f5994e43e86cb7e5ca9d6531224d2.

## Approved functionality delivered
- New centrally accessible SETTINGS guide.
- Browser-local settings via vnato_suite_settings_v1; legacy theme via vnato_theme.
- SimBrief ID / username preference and auto-reuse.
- Native .NET 8 MSFS Mach Bridge install/start/check controls; production installer uses mach-bridge-live.
- Day, Dusk, Night, Night Ops selection and reset.
- Settings navigation visibility and active-tab correction.

## Release provenance
- PRIVATE ALPHA: esramos-design/vNATO-Flight-Planning-Suite-Alpha
- Alpha source: js/settings.js, commit 8a090bdb15c4a7946fc8af506f2e3c13dccf1a76
- TEAM LIVE encoded shell update: 1b67eb7d482ab08d5d18582ee7a33ef96ee8b2fe
- TEAM LIVE loader cache update: fb3c9def70ef6b37a0ffc29fccd49cb9aa242762
- User approved promotion after reporting Settings worked well.
- Cloudflare showed successful deploy of the final LIVE commit.
- Source / deploy validation completed; independent post-release GUI automation, live Mach telemetry and full FPL regression were not performed and must not be represented as passed.

## Guardrails
- go-git until otherwise.
- PRIVATE ALPHA first, validate, then promote to TEAM LIVE after approval.
- Preserve encoded production shell; never directly replace it with readable Alpha source.
- Preserve exact legal/disclaimer wording without explicit authorization.
- Preserve SWIFT, SimBrief, VATSIM/myVATSIM, Y/Z, OAT/GAT, STAY/STAYINFO, RMK, saved profiles, Oceanic Report, native Mach Bridge, tools and themes.
- Official public URL is https://fpl.virtual-nato.org; pages.dev is fallback.

## Next steps
- Post-LIVE browser smoke tests on actual custom domain for Settings, SimBrief persistence and existing flight-plan modules.
- Native bridge connection/telemetry PC validation when available.
- Design future recurring settings centrally; no speculative feature additions to TEAM LIVE.
- Continue under vNATO FPS 04; recommended next handover title: vNATO FPS 05 — [next validated version / primary development task].
