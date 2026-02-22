#!/usr/bin/env bash
set -euo pipefail

usage() {
    echo "Usage: $0 <slug> <title> <date> <author> <excerpt> <readingTime> <coverImage> <tags...>"
    echo ""
    echo "Example:"
    echo "  $0 financial-planning \"Financial Planning 101\" \"2026-03-01\" \"Joy With Wealth\" \"A beginner guide to financial planning.\" 5 \"\" budgeting investing basics"
    exit 1
}

if [ $# -lt 8 ]; then
    usage
fi

SLUG="$1"
TITLE="$2"
DATE="$3"
AUTHOR="$4"
EXCERPT="$5"
READING_TIME="$6"
COVER_IMAGE="$7"
shift 7
TAGS=("$@")

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
POST_DIR="$SCRIPT_DIR/blog/posts/$SLUG"
POSTS_JSON="$SCRIPT_DIR/blog/posts.json"
TEMPLATE_SRC="$SCRIPT_DIR/blog/posts/template/index.html"

# 1. Create post directory
if [ -d "$POST_DIR" ]; then
    echo "Error: Directory $POST_DIR already exists."
    exit 1
fi
mkdir -p "$POST_DIR"
echo "Created $POST_DIR"

# 2. Copy universal template
cp "$TEMPLATE_SRC" "$POST_DIR/index.html"
echo "Copied template index.html"

# 3. Create empty markdown file
touch "$POST_DIR/markdown.md"
echo "Created empty markdown.md"

# 4. Add entry to posts.json
TAGS_JSON=$(printf '%s\n' "${TAGS[@]}" | python3 -c "import sys,json; print(json.dumps([l.strip() for l in sys.stdin]))")

python3 -c "
import json

with open('$POSTS_JSON', 'r') as f:
    posts = json.load(f)

new_post = {
    'slug': '$SLUG',
    'title': '''$TITLE''',
    'date': '$DATE',
    'author': '''$AUTHOR''',
    'excerpt': '''$EXCERPT''',
    'coverImage': '$COVER_IMAGE',
    'tags': $TAGS_JSON,
    'readingTime': $READING_TIME
}

posts.append(new_post)

with open('$POSTS_JSON', 'w') as f:
    json.dump(posts, f, indent=2, ensure_ascii=False)
    f.write('\n')
"
echo "Added entry to posts.json"

echo ""
echo "Done! New post created at: blog/posts/$SLUG/"
echo "Next steps:"
echo "  1. Write content in blog/posts/$SLUG/markdown.md"
if [ -n "$COVER_IMAGE" ]; then
    echo "  2. Add cover image: $COVER_IMAGE"
fi
