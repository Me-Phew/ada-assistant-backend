-- +migrate Up
CREATE VIEW chat_timeline AS
SELECT
    c.id AS conversation_id,
    um.id AS user_message_id,
    am.id AS assistant_message_id,
    CASE WHEN um.id IS NOT NULL THEN
        'USER'
    ELSE
        'ASSISTANT'
    END AS message_type,
    COALESCE(um.audio_path, am.text_response) AS message_text,
    COALESCE(um.created_at, am.created_at) AS timestamp
FROM
    conversations c
    LEFT JOIN user_messages um ON um.conversation_id = c.id
    LEFT JOIN assistant_messages am ON am.conversation_id = c.id
ORDER BY
    timestamp;

-- +migrate Down
DROP VIEW IF EXISTS chat_timeline;

