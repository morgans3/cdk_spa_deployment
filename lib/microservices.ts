// @ts-check

export const Applications = [
  {
    name: "prod",
    githubrepo: "https://github.com/morgans3/personal_site.git",
    domainName: "stewartmorganv2.com",
    siteSubDomain: "www",
    owner: "morgans3",
    repo: "personal_site",
    branch: "main",
  },
  {
    name: "dev",
    githubrepo: "https://github.com/morgans3/personal_site.git",
    domainName: "stewartmorganv2.com",
    siteSubDomain: "dev",
    owner: "morgans3",
    repo: "personal_site",
    branch: "dev",
  },
];

export function cleanseBucketName(original: string) {
  return original.split("_").join("-");
}
