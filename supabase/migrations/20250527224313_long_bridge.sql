/*
  # Create user favorites table

  1. New Tables
    - `user_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `palette_id` (uuid, foreign key to color_palettes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_favorites` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  palette_id uuid REFERENCES color_palettes(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, palette_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own favorites"
  ON user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own favorites"
  ON user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);