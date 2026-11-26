const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validSlug(value: string) {
  return value.length <= 100 && slugPattern.test(value);
}
