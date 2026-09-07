export type PublicGitHubRepository = {
  id: number;
  name: string;
  fullName: string;
  description: string;
  repositoryUrl: string;
  liveUrl: string;
  language: string | null;
  isFork: boolean;
  isArchived: boolean;
  updatedAt: string;
};

type GitHubRepositoryResponse = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  fork: boolean;
  archived: boolean;
  has_pages: boolean;
  updated_at: string;
  owner: { login: string };
};

function publicHomepage(repository: GitHubRepositoryResponse) {
  const homepage = repository.homepage?.trim();
  if (homepage) {
    try {
      const parsed = new URL(homepage);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.toString();
    } catch {
      // Fall through to a GitHub Pages URL when one is available.
    }
  }
  if (!repository.has_pages) return "";
  const owner = repository.owner.login;
  return repository.name.toLowerCase() === `${owner.toLowerCase()}.github.io`
    ? `https://${owner}.github.io/`
    : `https://${owner}.github.io/${repository.name}/`;
}

export async function listPublicGitHubRepositories(handle: string): Promise<PublicGitHubRepository[]> {
  const endpoint = new URL(`https://api.github.com/users/${encodeURIComponent(handle)}/repos`);
  endpoint.searchParams.set("type", "owner");
  endpoint.searchParams.set("sort", "updated");
  endpoint.searchParams.set("direction", "desc");
  endpoint.searchParams.set("per_page", "100");
  const response = await fetch(endpoint, {
    cache: "no-store",
    signal: AbortSignal.timeout(6_000),
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sundays-gallery",
    },
  });
  if (!response.ok) throw new Error("GitHub could not load your public repositories right now.");
  const repositories = await response.json() as GitHubRepositoryResponse[];
  return repositories.map((repository) => ({
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    description: repository.description?.trim() ?? "",
    repositoryUrl: repository.html_url,
    liveUrl: publicHomepage(repository),
    language: repository.language,
    isFork: repository.fork,
    isArchived: repository.archived,
    updatedAt: repository.updated_at,
  }));
}
