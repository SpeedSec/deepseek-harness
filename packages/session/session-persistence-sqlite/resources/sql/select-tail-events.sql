SELECT seq, type, time, data, source_event_seqs, surface_op, ignorable, is_packed
FROM events
WHERE session_id = ?
ORDER BY seq DESC
LIMIT ?;
