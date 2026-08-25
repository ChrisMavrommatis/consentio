#!/usr/bin/env bash
# Fails if any commit in the push wrote dist/ and was not the release workflow.
#
# The freshness check next to this one catches a *stale* dist/. This catches one that is
# hand-written and happens to be fresh, which freshness cannot see: the tree is correct,
# so only the commit that made it tells the two apart. dist/ is the shipped product and
# one process owns it - see .agents/rules/only-ci-builds-dist.md.
#
# Called by ci.yml with BEFORE, HEAD_SHA and BASE_SHA from the event, and by
# test/scripts/dist-guard.test.mts against a throwaway repository.
set -euo pipefail

RELEASE_BOT="${RELEASE_BOT:-41898282+github-actions[bot]@users.noreply.github.com}"

if [ -n "${BASE_SHA:-}" ]; then
	range="$BASE_SHA..$HEAD_SHA"
elif [ -n "${BEFORE:-}" ] \
	&& [ "$BEFORE" != "0000000000000000000000000000000000000000" ] \
	&& git cat-file -e "$BEFORE^{commit}" 2>/dev/null; then
	range="$BEFORE..$HEAD_SHA"
else
	# A new branch, or history the runner did not fetch. Judge the tip alone.
	range="$HEAD_SHA~1..$HEAD_SHA"
fi
echo "Commits under inspection: $range"

failed=0
for commit in $(git rev-list "$range"); do
	if [ -z "$(git diff-tree --no-commit-id --name-only -r "$commit" -- dist/)" ]; then
		continue
	fi
	committer=$(git show -s --format=%ce "$commit")
	subject=$(git show -s --format=%s "$commit")
	if [ "$committer" = "$RELEASE_BOT" ] \
		&& printf '%s' "$subject" | grep -qE '^release [0-9]+\.[0-9]+\.[0-9]+'; then
		echo "ok   ${commit:0:8}  $subject"
		continue
	fi
	echo "FAIL ${commit:0:8}  touches dist/ but was not written by the release workflow"
	echo "     committer: $committer"
	echo "     subject:   $subject"
	failed=1
done

if [ "$failed" = 1 ]; then
	echo
	echo "dist/ is the shipped product. Only release.yml writes it."
	exit 1
fi
