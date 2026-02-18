CREATE TABLE IF NOT EXISTS theme_favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES community_themes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_theme_favorites_theme_id ON theme_favorites(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_favorites_user_id ON theme_favorites(user_id);
