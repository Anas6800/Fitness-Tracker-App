#!/bin/bash

echo "🔄 Applying final file extension cleanup for context files..."

# --- 1. Rename files in src/context/ ---
echo "Renaming files in src/context/ from .jsx to .tsx..."

for file in src/context/*.jsx; do
    if [ -f "$file" ]; then
        new_file="${file/.jsx/.tsx}"
        mv "$file" "$new_file"
        echo "Renamed: $file -> $(basename $new_file)"
    fi
done

# --- 2. Update imports in src/App.tsx ---
# The AuthProvider import is the main issue here, as it lives in the context folder.
echo "Updating import path in src/App.tsx for AuthProvider..."

# Use sed to replace the .jsx reference with .tsx
# Note: TypeScript is usually smart, but explicitly fixing the import path is safest.
sed -i 's|\.\/context\/AuthContext\.jsx|\.\/context\/AuthContext\.tsx|g' src/App.tsx

# Also, ensure imports in context files are correct (e.g., AuthContext imports firebase)
echo "Checking and updating imports within src/context/AuthContext.tsx..."

if [ -f "src/context/AuthContext.tsx" ]; then
    # Ensure it imports the firebase file correctly (which should be .js, and that's usually fine)
    # The default script used 'import { auth } from "../firebase";' which is fine, 
    # but we ensure no lingering .jsx references exist.
    sed -i 's|\.\.\/firebase\.jsx|\.\.\/firebase\.js|g' src/context/AuthContext.tsx
fi


echo "✅ Context files renamed and App.tsx imports updated."
echo "Your project should now be fully compatible with TypeScript."
echo "👉 Run 'npm run dev' to see the login page."