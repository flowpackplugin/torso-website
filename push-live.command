#!/bin/zsh
cd "$HOME/Desktop/Torso Hair/website" || exit 1
git push origin torso-website
echo ""
echo "== push 완료 — Vercel이 자동 배포합니다. 이 창은 닫아도 됩니다 =="
