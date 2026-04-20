export class MdrunError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "MdrunError";
  }
}

export class CommandNotFoundError extends MdrunError {
  constructor(command: string) {
    super(`Command not found: "${command}"`, "COMMAND_NOT_FOUND");
  }
}

export class FileNotFoundError extends MdrunError {
  constructor(path: string) {
    super(`File not found: "${path}"`, "FILE_NOT_FOUND");
  }
}

export class MissingRequiredArgError extends MdrunError {
  constructor(argName: string, command: string) {
    super(`Missing required argument "${argName}" for command "${command}"`, "MISSING_ARG");
  }
}

export class PlatformMismatchError extends MdrunError {
  constructor(command: string, platform: string) {
    super(
      `Command "${command}" is not available on platform "${platform}"`,
      "PLATFORM_MISMATCH",
    );
  }
}
