# Plan: bring frogiverse to wacli-level UX and functionality

## Gap vs wacli
- No dedicated CLI UX (human readable output + --json).
- Auth and sync are coupled to server startup (no explicit auth/sync commands).
- No store lock or doctor-style diagnostics.
- MCP tools overlap (archive vs live search, multiple message fetch paths).
- Search index is text-only (no URLs, media metadata, sender names, topics).
- No media download/send flows.
- No contact aliases/tags/notes.
- Limited group/admin operations (participants, invite links, etc.).
- Fixed storage path (data/) instead of a user-store layout.

## Target outcomes
- Wacli-style CLI commands: auth, sync, doctor, messages, channels, topics, send, media, contacts, groups.
- Unified MCP surface with fewer tools and consistent filters.
- Offline-first search (FTS5) over message text + URL domains + filenames + sender + channel + topic.
- Best-effort backfill jobs and realtime capture with clear status/diagnostics.
- Media download/send support.
- Store lock to prevent session conflicts.

## Work plan
1) Architecture split
   - Extract core modules (telegram client, sync, store, search, media) from MCP server.
   - Add CLI entrypoint that uses the same core as MCP.
   - Introduce a store dir flag (--store, default ~/.frogiverse).

2) Simplify MCP tool surface
   - Replace separate archive/live tools with a single messages.search/list/get API using source=archive|live|both.
   - Merge tag-based search into messages.search (tag filter).
   - Keep backwards compatibility via aliases + deprecation warnings.

3) Storage + search upgrades
   - Expand message schema: sender name, topic title, media type, filename, mime, URLs.
   - Add message_links table (url, domain, message_id) and index by domain.
   - Extend FTS5 to index text + display_text + channel + sender + topic + filename + url domain.

4) Sync and backfill
   - Separate auth (interactive) from sync (non-interactive).
   - Add sync --once/--follow and idle-exit.
   - Add jobs/status/doctor tools and CLI.

5) Media
   - Persist media metadata; implement media download to a store directory.
   - Add send file with caption and filename override.

6) Contacts, groups, topics
   - Contacts: aliases, tags, notes; search and show.
   - Groups: list/info/rename/participants/invite link (where Telegram allows).
   - Topics: list/search + message filters by topic_id.

7) Docs and packaging
   - Update README with CLI + MCP examples.
   - Add doctor output and troubleshooting notes.
   - Optional: publish CLI with a simple install script.

## Telegram-specific notes
- Backfill is best-effort; anchor by oldest stored message and respect minDate.
- Some group actions require admin permissions; CLI/MCP should surface permission errors clearly.
- Forum topics are first-class in Telegram and must be part of search filters.

## Deprecation strategy
- Keep legacy tools for 1-2 releases with warnings.
- Provide a mapping table from old tools to new ones (see docs/mcp-tools.md).
- Migrate clients to new unified tools gradually.
