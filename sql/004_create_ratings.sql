CREATE TABLE IF NOT EXISTS theme_ratings (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES community_themes(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_theme_ratings_theme_id ON theme_ratings(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_ratings_user_id ON theme_ratings(user_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS theme_stats AS
SELECT
  ct.id AS theme_id,
  COALESCE(AVG(tr.rating), 0) AS avg_rating,
  COUNT(DISTINCT tr.user_id) AS rating_count,
  COUNT(DISTINCT tf.user_id) AS favorite_count
FROM community_themes ct
LEFT JOIN theme_ratings tr ON tr.theme_id = ct.id
LEFT JOIN theme_favorites tf ON tf.theme_id = ct.id
GROUP BY ct.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_theme_stats_theme_id ON theme_stats(theme_id);
