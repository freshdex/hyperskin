CREATE TABLE IF NOT EXISTS community_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_themes_author_id ON community_themes(author_id);
CREATE INDEX IF NOT EXISTS idx_community_themes_downloads ON community_themes(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_community_themes_created_at ON community_themes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_themes_config ON community_themes USING GIN (config);
CREATE INDEX IF NOT EXISTS idx_community_themes_fts ON community_themes USING GIN (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);
