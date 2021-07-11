declare function generate(
  outfile: string,
  options?: { comment?: boolean; autoGlobalExports?: boolean },
): {
  entryPointFunctions: string;
  globalAssignments: string | undefined;
};
