import fs from "fs";
import prs from "../data/MergedPRs.json" assert { type: "json" };
const username = "ayushsharma74";
const repos = ["antiwork/gumroad", "antiwork/gumboard", "antiwork/flexile" , "Mail-0/Zero"];
const outputFile = "src/data/MergedPRs.json";

async function UpdatePullRequests() {
  let updatedData = [...prs];

  for (const repo of repos) {
    const response = await fetch(
      `https://api.github.com/search/issues?q=is:pr+is:merged+repo:${repo}+author:${username}&per_page=100`
    );
    const res = await response.json();

    if (!res.items) {
      console.error(`⚠️ No items for ${repo}`, res);
      continue;
    }

    const newPRs = res.items.map((pr) => ({
      title: pr.title,
      link: pr.html_url,
      mergedAt: pr.closed_at,
    }));

    // find repo entry in existing JSON
    const repoEntry = updatedData.find((r) => r.name === repo);

    if (repoEntry) {
      newPRs.forEach((newPR) => {
        const alreadyExists = repoEntry.prs.some((p) => p.link === newPR.link);
        if (!alreadyExists) {
          repoEntry.prs.push({
            title: newPR.title,
            link: newPR.link,
          });
        }
      });
    } else {
      // if repo doesn’t exist in JSON, add fresh
      updatedData.push({
        name: repo,
        link: `https://github.com/${repo}/pulls?q=is%3Apr+is%3Amerged+author%3A${username}`,
        prs: newPRs.map((pr) => ({
          title: pr.title,
          link: pr.link,
        })),
      });
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(updatedData, null, 2));
  console.log(`✅ Updated ${outputFile}`);
}

UpdatePullRequests().catch((err) => console.error(err));
